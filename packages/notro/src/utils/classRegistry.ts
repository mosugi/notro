/**
 * Module-level registry for classMap entries.
 *
 * NotionMarkdownRenderer calls setClassMap() before rendering.
 * Each notion component calls getClass() to retrieve its assigned class string.
 *
 * This approach works reliably for SSG (static builds).
 * For SSR, it is safe as long as a single classMap is used site-wide,
 * since Astro renders components synchronously within a request.
 */

let _classMap: Record<string, string> = {};

export function setClassMap(map: Record<string, string>): void {
	_classMap = { ...map };
}

export function getClass(key: string): string {
	return _classMap[key] ?? '';
}
