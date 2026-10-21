# toille-tools

Zero-latency, client-side developer utility suite built with [SolidJS](https://www.solidjs.com/) and [Vite](https://vitejs.dev/).

Deployed at [tools.toille.uk](https://tools.toille.uk).

## Utilities

- **JSON Formatter & Validator**: High-performance parser, formatter, minifier, and validator with line/column error diagnostics.
- **Regex Tester**: Live regular expression builder with instant match highlighting, flags editor, and catastrophic backtracking guards.
- **Colour Studio**: Bidirectional colour space converter between HEX, RGB, HSL, and CSS keyword swatches with clipboard actions.
- **Edge Latency Probe**: Zero-dependency browser-native probe measuring round-trip network performance and latency distributions.
- **Base64 & URL Encoder**: Bidirectional encoder/decoder for standard Base64, URL-safe Base64, and RFC-3986 URI components.

## Architecture

- **100% Client-Side**: Zero telemetry, zero analytics, zero external network requests for processing.
- **Framework**: SolidJS 2.0 with reactive primitives.
- **Quality Gates**: Vitest, TypeScript strict mode, Oxlint + ESLint, Prettier, and [Fallow](https://fallow.tools) codebase health analysis.

## Development

```bash
npm install
npm test
npm run check
npm run lint
npm run build
```
