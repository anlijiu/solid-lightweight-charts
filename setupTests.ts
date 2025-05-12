import "@testing-library/jest-dom/vitest";

import ResizeObserver from "resize-observer-polyfill";
import { vi } from "vitest";

window.ResizeObserver = ResizeObserver;

window.matchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});
