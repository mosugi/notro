/**
 * Passthrough components for standard HTML elements with optional class injection.
 * Edit the class strings to customize the base typography.
 */
import { jsx } from 'astro/jsx-runtime';
// @ts-expect-error - exported at runtime but missing from Astro 6 type declarations
import { __astro_tag_component__ } from 'astro/runtime/server/index.js';

export function makeHtmlElement(tag: string, cls?: string) {
  function HtmlElement({ class: className, ...rest }: Record<string, unknown>) {
    const combined = [cls, className].filter(Boolean).join(' ') || undefined;
    return jsx(tag, combined !== undefined ? { ...rest, class: combined } : rest);
  }
  __astro_tag_component__(HtmlElement, 'astro:jsx');
  return HtmlElement;
}
