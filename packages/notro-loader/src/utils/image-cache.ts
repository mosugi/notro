/**
 * Download and cache Notion presigned S3 image URLs.
 *
 * Notion's `file` type URLs are S3 presigned URLs that expire after ~1 hour.
 * This module downloads them at loader time and saves them to a persistent
 * cache directory, replacing expiring URLs with stable local file paths.
 *
 * The cache key is the SHA-256 of the URL's pathname (without expiring query
 * params), so the same Notion image always maps to the same cache file across
 * builds. Files are never deleted from the cache automatically — stale entries
 * are harmless and avoid unnecessary re-downloads.
 *
 * Usage:
 *   const localUrl = await cacheNotionImage(presignedUrl, cacheDir);
 *   // localUrl is a `file://` URL pointing to the cached image
 */

import { createHash } from 'node:crypto';
import { mkdir, writeFile, access } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Returns true if the URL looks like a Notion presigned S3 URL. */
export function isNotionPresignedUrl(url: string): boolean {
	try {
		const u = new URL(url);
		return (
			u.searchParams.has('X-Amz-Algorithm') ||
			u.hostname === 'prod-files-secure.s3.amazonaws.com' ||
			u.hostname.endsWith('.s3.amazonaws.com') && u.searchParams.has('X-Amz-Signature')
		);
	} catch {
		return false;
	}
}

/**
 * Stable cache key: SHA-256 of `<hostname><pathname>` (no query params).
 * The same Notion image always maps to the same key regardless of URL expiry.
 */
function cacheKey(url: string): string {
	try {
		const u = new URL(url);
		return createHash('sha256').update(u.hostname + u.pathname).digest('hex');
	} catch {
		return createHash('sha256').update(url).digest('hex');
	}
}

/** Extract a file extension from a URL pathname, falling back to `.jpg`. */
function extensionFromUrl(url: string): string {
	try {
		const pathname = new URL(url).pathname;
		const ext = extname(pathname).toLowerCase();
		// Only allow common image extensions
		if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg'].includes(ext)) {
			return ext;
		}
	} catch {
		// ignore
	}
	return '.jpg';
}

const IMAGE_CACHE_SUBDIR = 'notro-images';

/**
 * Downloads a Notion presigned URL and saves it to `publicDir/_notro-cache/`.
 * Returns the public URL path (e.g. `/_notro-cache/<hash>.jpg`), or the
 * original URL on error.
 *
 * Saving to `publicDir` means Astro copies the files to `dist/` as-is, and
 * `<img src="/_notro-cache/...">` works without any image optimization pipeline.
 * For `astro:assets` Image optimization, pass the returned public path as `src`.
 *
 * @param presignedUrl - The expiring Notion S3 URL to download.
 * @param publicDir - Astro's `config.publicDir` (a URL object or path string).
 * @param logger - Optional logger for warnings.
 * @returns Public URL path string (e.g. `/_notro-cache/<hash>.jpg`), or the original URL on failure.
 */
export async function cacheNotionImage(
	presignedUrl: string,
	publicDir: URL | string,
	logger?: { warn: (msg: string) => void },
): Promise<string> {
	const publicDirPath = typeof publicDir === 'string' ? publicDir : fileURLToPath(publicDir);
	const imageDir = join(publicDirPath, IMAGE_CACHE_SUBDIR);

	const key = cacheKey(presignedUrl);
	const ext = extensionFromUrl(presignedUrl);
	const fileName = `${key}${ext}`;
	const filePath = join(imageDir, fileName);
	const publicPath = `/${IMAGE_CACHE_SUBDIR}/${fileName}`;

	// Return cached file if it already exists
	try {
		await access(filePath);
		return publicPath;
	} catch {
		// Not cached yet — download below
	}

	try {
		await mkdir(imageDir, { recursive: true });
		const response = await fetch(presignedUrl);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status} ${response.statusText}`);
		}
		const buffer = await response.arrayBuffer();
		await writeFile(filePath, Buffer.from(buffer));
		return publicPath;
	} catch (error) {
		logger?.warn(
			`[notro] Failed to cache Notion image (${presignedUrl.slice(0, 80)}...): ${String(error)}. ` +
			`Using original URL — it may expire.`,
		);
		return presignedUrl;
	}
}

/**
 * Rewrites all Notion presigned image URLs in a markdown string by
 * downloading them to the cache and replacing the URLs with `file://` paths.
 *
 * Matches `![alt](url)` and `<img src="url">` patterns.
 */
export async function rewriteMarkdownPresignedUrls(
	markdown: string,
	cacheDir: URL | string,
	logger?: { warn: (msg: string) => void },
): Promise<string> {
	// Collect all unique presigned URLs in the markdown
	const urlPattern = /!\[[^\]]*\]\((https?:\/\/[^)]+)\)|<img[^>]+src="(https?:\/\/[^"]+)"/g;
	const urlsToReplace = new Map<string, string>(); // original → cached

	for (const match of markdown.matchAll(urlPattern)) {
		const url = match[1] ?? match[2];
		if (url && isNotionPresignedUrl(url) && !urlsToReplace.has(url)) {
			urlsToReplace.set(url, url); // placeholder until resolved
		}
	}

	if (urlsToReplace.size === 0) return markdown;

	// Download all presigned URLs in parallel
	await Promise.all(
		[...urlsToReplace.keys()].map(async (url) => {
			const cached = await cacheNotionImage(url, cacheDir, logger);
			urlsToReplace.set(url, cached);
		}),
	);

	// Replace all occurrences in the markdown string
	let result = markdown;
	for (const [original, cached] of urlsToReplace) {
		if (original !== cached) {
			result = result.replaceAll(original, cached);
		}
	}
	return result;
}
