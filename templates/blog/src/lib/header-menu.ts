/**
 * Wires up the mobile header menu toggle.
 *
 * Keeps three things in sync when the user clicks the hamburger button:
 *   1. The menu drawer's visibility (`hidden` class)
 *   2. ARIA state (`aria-expanded` on the button, `aria-hidden` on the drawer)
 *   3. The hamburger/close icon pair (only the matching one is visible)
 */

export interface HeaderMenuElements {
  button: HTMLElement;
  menu: HTMLElement;
  iconOpen?: HTMLElement | null;
  iconClose?: HTMLElement | null;
}

/**
 * Flips the menu between open and closed and syncs ARIA + icon state.
 * Extracted from the click handler so it can be unit-tested without a
 * full browser environment.
 */
export function toggleMenu(els: HeaderMenuElements): void {
  els.menu.classList.toggle("hidden");
  const isOpen = !els.menu.classList.contains("hidden");
  els.button.setAttribute("aria-expanded", String(isOpen));
  els.menu.setAttribute("aria-hidden", String(!isOpen));
  els.iconOpen?.classList.toggle("hidden", isOpen);
  els.iconClose?.classList.toggle("hidden", !isOpen);
}

/**
 * Binds the click handler on the hamburger button. Safe to call when the
 * expected elements are missing — it simply becomes a no-op.
 */
export function initHeaderMenu(doc: Document = document): void {
  const button = doc.getElementById("menu-toggle");
  const menu = doc.getElementById("mobile-menu");
  if (!button || !menu) return;
  const iconOpen = doc.getElementById("icon-open");
  const iconClose = doc.getElementById("icon-close");
  button.addEventListener("click", () => {
    toggleMenu({ button, menu, iconOpen, iconClose });
  });
}
