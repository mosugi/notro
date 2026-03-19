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
 * Returns true if the text contains Notion pre-signed S3 URLs.
 *
 * Detection strategy:
 * - X-Amz-Algorithm: must appear as a URL query parameter
 *   (i.e. preceded by "?" or "&" within an https:// URL context) to avoid
 *   false positives when the literal string appears in body text or code blocks.
 * - prod-files-secure.s3: matched as a hostname within an https:// URL, which
 *   is an unambiguous indicator of a Notion S3 URL regardless of query params.
 */
export function markdownHasPresignedUrls(text: string): boolean {
	// Match X-Amz-Algorithm only when it appears as a URL query parameter
	if (/https?:\/\/[^\s)"']*[?&]X-Amz-Algorithm=/.test(text)) {
		return true;
	}
	// Match Notion's secure S3 hostname as a URL
	if (/https?:\/\/prod-files-secure\.s3/.test(text)) {
		return true;
	}
	return false;
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
