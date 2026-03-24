import React from "react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { isActive } from "../lib/nav";

interface NavItem {
  href: string;
  label: string;
}

interface Props {
  navItems: NavItem[];
  githubUrl: string;
  pathname: string;
}

/** GitHub icon SVG (inline, same as GitHubIcon.astro) */
function GitHubIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

/** Mobile navigation menu rendered as a React island with Headless UI Popover.
 *  Provides focus trapping, Escape-to-close, and click-outside-to-close. */
export default function MobileMenu({ navItems, githubUrl, pathname }: Props) {
  return (
    <Popover className="flex sm:hidden">
      {({ open }) => (
        <>
          {/* Hamburger / Close button */}
          <PopoverButton
            className="flex items-center justify-center w-8 h-8 nt-text-60 bg-transparent border-0 cursor-pointer p-0 rounded-[4px] transition-[color,background] hover:nt-text hover:nt-bg-05 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/5"
            aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          >
            {/* Hamburger icon (shown when closed) */}
            {!open && (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
            {/* Close icon (shown when open) */}
            {open && (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
          </PopoverButton>

          {/* Mobile menu panel — fixed, full-width, below the 3.5rem header bar */}
          <PopoverPanel
            transition
            className="fixed inset-x-0 top-14 z-30 border-t nt-border-07 bg-white/97 py-3 pb-4 dark:bg-slate-800 dark:border-white/8 transition duration-150 ease-in-out data-[closed]:opacity-0 data-[closed]:-translate-y-1"
          >
            <nav aria-label="モバイルナビゲーション">
              {navItems.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className={[
                    "flex items-center gap-2 text-[0.9375rem] no-underline px-4 py-2.5 transition-[color,background]",
                    isActive(pathname, href)
                      ? "nt-text font-medium dark:text-slate-200"
                      : "nt-text-65 hover:nt-text hover:nt-bg-04 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-white/4",
                  ].join(" ")}
                  aria-current={isActive(pathname, href) ? "page" : undefined}
                >
                  {label}
                </a>
              ))}
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[0.9375rem] nt-text-65 no-underline px-4 py-2.5 transition-colors hover:nt-text mt-1 border-t nt-border-07 dark:text-slate-400 dark:hover:text-slate-200 dark:border-white/8"
              >
                <GitHubIcon />
                GitHub
              </a>
            </nav>
          </PopoverPanel>
        </>
      )}
    </Popover>
  );
}
