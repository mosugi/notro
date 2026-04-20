import { describe, it, expect } from "vitest";
import { toggleMenu } from "./header-menu";

// Lightweight stand-in for HTMLElement that supports just the subset of the
// DOM API `toggleMenu` touches. Avoids pulling in jsdom/happy-dom just for
// this single test file.
function fakeElement(initialClasses: string[] = []) {
  const classes = new Set(initialClasses);
  const attrs = new Map<string, string>();
  return {
    classList: {
      contains: (c: string) => classes.has(c),
      add: (c: string) => classes.add(c),
      remove: (c: string) => classes.delete(c),
      toggle: (c: string, force?: boolean) => {
        const shouldBeOn = force ?? !classes.has(c);
        if (shouldBeOn) classes.add(c);
        else classes.delete(c);
        return shouldBeOn;
      },
    },
    setAttribute: (name: string, value: string) => {
      attrs.set(name, value);
    },
    getAttribute: (name: string) => attrs.get(name) ?? null,
    hasClass: (c: string) => classes.has(c),
  };
}

type FakeEl = ReturnType<typeof fakeElement>;
type MenuEls = {
  button: FakeEl;
  menu: FakeEl;
  iconOpen: FakeEl;
  iconClose: FakeEl;
};

function makeClosedMenu(): MenuEls {
  return {
    button: fakeElement(),
    menu: fakeElement(["hidden"]),
    iconOpen: fakeElement(),
    iconClose: fakeElement(["hidden"]),
  };
}

describe("toggleMenu", () => {
  it("opens a closed menu and flips ARIA + icons", () => {
    const els = makeClosedMenu();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toggleMenu(els as any);
    expect(els.menu.hasClass("hidden")).toBe(false);
    expect(els.button.getAttribute("aria-expanded")).toBe("true");
    expect(els.menu.getAttribute("aria-hidden")).toBe("false");
    expect(els.iconOpen.hasClass("hidden")).toBe(true);
    expect(els.iconClose.hasClass("hidden")).toBe(false);
  });

  it("closes an open menu back to the initial state", () => {
    const els = makeClosedMenu();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toggleMenu(els as any); // open
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toggleMenu(els as any); // close
    expect(els.menu.hasClass("hidden")).toBe(true);
    expect(els.button.getAttribute("aria-expanded")).toBe("false");
    expect(els.menu.getAttribute("aria-hidden")).toBe("true");
    expect(els.iconOpen.hasClass("hidden")).toBe(false);
    expect(els.iconClose.hasClass("hidden")).toBe(true);
  });

  it("works when icon elements are absent", () => {
    const els = {
      button: fakeElement(),
      menu: fakeElement(["hidden"]),
    };
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toggleMenu(els as any);
    }).not.toThrow();
    expect(els.menu.hasClass("hidden")).toBe(false);
    expect(els.button.getAttribute("aria-expanded")).toBe("true");
  });
});
