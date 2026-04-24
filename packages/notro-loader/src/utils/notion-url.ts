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
 * Returns true if the given Notion pre-signed S3 URL has expired (or is
 * unrecognisable and should be treated as expired).
 *
 * S3 pre-signed URLs encode their validity window in two query parameters:
 *   X-Amz-Date    – ISO-8601 compact form of the signing time, e.g. "20240101T120000Z"
 *   X-Amz-Expires – validity period in seconds from the signing time
 *
 * A URL is considered expired when Date.now() >= issuedAt + expires * 1000.
 * If either parameter is missing or unparseable the URL is conservatively
 * treated as expired so the caller re-fetches it.
 *
 * The optional `bufferMs` (default 60 000 ms / 1 minute) subtracts a safety
 * margin from the expiry time to avoid using a URL that expires mid-request.
 */
export function isPresignedUrlExpired(url: string, bufferMs = 60_000): boolean {
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		return true; // Not a valid URL – treat as expired
	}

	const date = parsed.searchParams.get('X-Amz-Date');
	const expiresStr = parsed.searchParams.get('X-Amz-Expires');

	if (!date || !expiresStr) {
		// Not a pre-signed URL with the expected parameters – if it looks like
		// a Notion S3 URL, conservatively treat as expired; otherwise it is
		// probably a plain external URL that never expires.
		return parsed.hostname.includes('s3') && parsed.hostname.includes('amazonaws.com');
	}

	// X-Amz-Date is in compact ISO-8601: YYYYMMDDTHHmmssZ
	const isoDate = date.replace(
		/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
		'$1-$2-$3T$4:$5:$6Z',
	);
	const issuedAt = Date.parse(isoDate);
	const expiresSeconds = parseInt(expiresStr, 10);

	if (isNaN(issuedAt) || isNaN(expiresSeconds)) {
		return true; // Unparseable – treat as expired
	}

	const expiresAt = issuedAt + expiresSeconds * 1000 - bufferMs;
	return Date.now() >= expiresAt;
}

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
