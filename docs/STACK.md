# Stack commands

lint: pnpm exec tsc --noEmit
type-check: pnpm exec tsc --noEmit
test-unit: pnpm exec vitest run

## Toolchain
- TypeScript (strict), ESM. Test: vitest. PM: pnpm via corepack.
