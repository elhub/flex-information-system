import "@testing-library/jest-dom/vitest";

// `window.env` is normally injected at runtime (see index.html / the
// container entrypoint) with environment-specific config. Several modules
// read from it at import time (e.g. src/httpConfig.tsx), so we need a stub
// here to avoid crashing simply by importing those modules in tests.
window.env ??= {} as typeof window.env;
