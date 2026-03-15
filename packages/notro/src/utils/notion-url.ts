/**
 * Utilities for handling Notion pre-signed S3 URLs.
 *
 * Notion images use time-limited pre-signed S3 URLs with expiring query
 * parameters (X-Amz-*). These utilities centralise detection and
 * normalisation of such URLs so the knowledge is not duplicated between
 * the loader and the app's image service.
 */

const AMZN_PRESIGNED_PARAM = 'X-Amz-Algorithm';

/**
 * Returns true if the URL string contains Notion pre-signed S3 query parameters
 * or matches the Notion secure S3 hostname pattern.
 * Accepts plain strings (e.g. from a markdown body) — not just full URLs.
 */
export function markdownHasPresignedUrls(text: string): boolean {
	return /X-Amz-Algorithm|prod-files-secure\.s3/.test(text);
}

/**
 * Strips expiring query parameters from a Notion pre-signed S3 URL,
 * yielding a stable cache key for Astro's image service.
 * Non-Notion URLs and invalid URLs are returned unchanged.
 */
export function normalizeNotionPresignedUrl(src: string): string {
	try {
		const url = new URL(src);
		if (url.searchParams.has(AMZN_PRESIGNED_PARAM)) {
			return `${url.protocol}//${url.hostname}${url.pathname}`;
		}
	} catch {
		// Not a valid URL, return as-is
	}
	return src;
}
