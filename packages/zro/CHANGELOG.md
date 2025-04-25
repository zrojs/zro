# Changelog


## v0.0.48

[compare changes](https://github.com/zrojs/zro/compare/v0.0.47...v0.0.48)

### 🩹 Fixes

- **auth:** Auth type generation using tsup to support providers ([72e521f](https://github.com/zrojs/zro/commit/72e521f))
- **auth:** Clear session on invalid token during authentication ([b9a0633](https://github.com/zrojs/zro/commit/b9a0633))
- **auth:** Update AuthConfig types to enforce string literal paths ([b97d63f](https://github.com/zrojs/zro/commit/b97d63f))
- **dev-server:** Add error handling to H3 instance in bootstrapDevServer ([89bb209](https://github.com/zrojs/zro/commit/89bb209))
- **deps:** Update h3 dependency to latest nightly version ([68794ac](https://github.com/zrojs/zro/commit/68794ac))

### 🏡 Chore

- **release:** V0.0.3 ([62275c8](https://github.com/zrojs/zro/commit/62275c8))
- **release:** V0.0.4 ([ffc52f5](https://github.com/zrojs/zro/commit/ffc52f5))
- **release:** V0.0.5 ([2fcc48e](https://github.com/zrojs/zro/commit/2fcc48e))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.47

[compare changes](https://github.com/zrojs/zro/compare/v0.0.46...v0.0.47)

### 🚀 Enhancements

- **zro:** Migrate to `h3@2x` ([8c125ed](https://github.com/zrojs/zro/commit/8c125ed))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.46

[compare changes](https://github.com/zrojs/zro/compare/v0.0.45...v0.0.46)

### 🩹 Fixes

- **pnpm:** Update db dependency specifier to use workspace versioning ([238e6d8](https://github.com/zrojs/zro/commit/238e6d8))
- **dependencies:** Update @zro/auth dependency specifier to use workspace versioning ([9613541](https://github.com/zrojs/zro/commit/9613541))
- **dependencies:** Update h3 dependency from latest to version 2x ([cc05da2](https://github.com/zrojs/zro/commit/cc05da2))
- **router:** Update getSession to use async/await and export SessionConfig directly ([06313de](https://github.com/zrojs/zro/commit/06313de))

### 🏡 Chore

- **release:** V0.0.2 ([e4f601c](https://github.com/zrojs/zro/commit/e4f601c))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.45

[compare changes](https://github.com/zrojs/zro/compare/v0.0.44...v0.0.45)

### 🩹 Fixes

- **package:** Reset version to 0.0.0 and ensure public access for publishing ([7ac8a8c](https://github.com/zrojs/zro/commit/7ac8a8c))
- **zro:** Use redirection with x-script data to load next route and prevent redundant api call ([57c9531](https://github.com/zrojs/zro/commit/57c9531))
- **auth:** Change `AuthProvider` generic type from `unknown` to `any` and update `AuthConfig` to use `User` type ([c55dff7](https://github.com/zrojs/zro/commit/c55dff7))

### 💅 Refactors

- **zro/auth:** Update module structure and dependencies ready to publish. ([4792dce](https://github.com/zrojs/zro/commit/4792dce))

### 🏡 Chore

- **release:** V0.0.1 ([02a640e](https://github.com/zrojs/zro/commit/02a640e))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.44

[compare changes](https://github.com/zrojs/zro/compare/v0.0.43...v0.0.44)

### 🚀 Enhancements

- **react:** Wrap route component inside suspense even no loader provided ([392a7cc](https://github.com/zrojs/zro/commit/392a7cc))

### 🏡 Chore

- **release:** V0.0.9 ([7dbfc59](https://github.com/zrojs/zro/commit/7dbfc59))
- **playground:** Remove unused app.tsx file ([eaeb82e](https://github.com/zrojs/zro/commit/eaeb82e))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.43

[compare changes](https://github.com/zrojs/zro/compare/v0.0.42...v0.0.43)

## v0.0.42

[compare changes](https://github.com/zrojs/zro/compare/v0.0.41...v0.0.42)

### 🩹 Fixes

- **zro:** Early return error on facing error ([75196d4](https://github.com/zrojs/zro/commit/75196d4))

### 🏡 Chore

- **release:** V0.0.8 ([0ce6564](https://github.com/zrojs/zro/commit/0ce6564))
- **create-zro:** Remove unused local database file ([a388767](https://github.com/zrojs/zro/commit/a388767))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.41

[compare changes](https://github.com/zrojs/zro/compare/v0.0.40...v0.0.41)

### 🚀 Enhancements

- **zro:** Prepare script to generate app key and future configurations ([ac4cfc9](https://github.com/zrojs/zro/commit/ac4cfc9))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.40

[compare changes](https://github.com/zrojs/zro/compare/v0.0.39...v0.0.40)

### 🚀 Enhancements

- **create-zro:** With-drizzle-tailwind base template with simple todo app demo ([29232bb](https://github.com/zrojs/zro/commit/29232bb))

### 🩹 Fixes

- **create-zro:** Correct application name format in package.json with tailwind template ([6f3567d](https://github.com/zrojs/zro/commit/6f3567d))
- **ClientRouter:** Preserve loader promise when navigating replace, async ([7fab083](https://github.com/zrojs/zro/commit/7fab083))

### 🏡 Chore

- **release:** V0.0.6 ([51bd2a7](https://github.com/zrojs/zro/commit/51bd2a7))
- **release:** V0.0.7 ([489ef05](https://github.com/zrojs/zro/commit/489ef05))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.39

[compare changes](https://github.com/zrojs/zro/compare/v0.0.38...v0.0.39)

### 🩹 Fixes

- **react:** Set action error/data based on action route ([c359029](https://github.com/zrojs/zro/commit/c359029))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.38

[compare changes](https://github.com/zrojs/zro/compare/v0.0.37...v0.0.38)

### 💅 Refactors

- **Router:** Remove rootRoute management from Router class ([7727270](https://github.com/zrojs/zro/commit/7727270))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.37

[compare changes](https://github.com/zrojs/zro/compare/v0.0.36...v0.0.37)

### 💅 Refactors

- **Route:** Simplify constructor options handling, removing defu ([e58df7d](https://github.com/zrojs/zro/commit/e58df7d))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.36

[compare changes](https://github.com/zrojs/zro/compare/v0.0.35...v0.0.36)

### 🚀 Enhancements

- **zro:** Response actions with redirect or html when appropriate ([fabef7f](https://github.com/zrojs/zro/commit/fabef7f))
- **react:** `useAction` integration with server with no-js env ([60c60f7](https://github.com/zrojs/zro/commit/60c60f7))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.35

[compare changes](https://github.com/zrojs/zro/compare/v0.0.34...v0.0.35)

## v0.0.34

[compare changes](https://github.com/zrojs/zro/compare/v0.0.33...v0.0.34)

### 🚀 Enhancements

- Make actions no-js environment compatible ([7863a2d](https://github.com/zrojs/zro/commit/7863a2d))

### 🩹 Fixes

- **react:** Improve error handling in useAction by explicitly allowing "root" key ([d763259](https://github.com/zrojs/zro/commit/d763259))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.33

[compare changes](https://github.com/zrojs/zro/compare/v0.0.32...v0.0.33)

### 🚀 Enhancements

- **react:** Add data, error typesafety to useActions ([2bd51d9](https://github.com/zrojs/zro/commit/2bd51d9))

### 🏡 Chore

- **playground:** Improve imports ordering ([fb1ffeb](https://github.com/zrojs/zro/commit/fb1ffeb))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.32

[compare changes](https://github.com/zrojs/zro/compare/v0.0.31...v0.0.32)

### 💅 Refactors

- **zro:** Export `zro/unhead` from `zro/react` as it is actually react integrations ([52bef48](https://github.com/zrojs/zro/commit/52bef48))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.31

[compare changes](https://github.com/zrojs/zro/compare/v0.0.30...v0.0.31)

### 🚀 Enhancements

- Register actions from layout routes ([d677adf](https://github.com/zrojs/zro/commit/d677adf))
- **connectors:** Add libsql connectors for HTTP, Node, and Web ([819ec17](https://github.com/zrojs/zro/commit/819ec17))
- **zro:** Move es-toolkit and unhead to dev dependencies to be bundled as inline ([347e310](https://github.com/zrojs/zro/commit/347e310))

### 🏡 Chore

- **release:** V0.0.3 ([3d20326](https://github.com/zrojs/zro/commit/3d20326))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.30

[compare changes](https://github.com/zrojs/zro/compare/v0.0.29...v0.0.30)

### 🩹 Fixes

- **zro/tools:** Export toMerged function from es-toolkit/compat ([677fdbd](https://github.com/zrojs/zro/commit/677fdbd))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.29

[compare changes](https://github.com/zrojs/zro/compare/v0.0.28...v0.0.29)

### 🚀 Enhancements

- **router:** Bundle inline es-toolkit ([0dbdeb5](https://github.com/zrojs/zro/commit/0dbdeb5))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.28

[compare changes](https://github.com/zrojs/zro/compare/v0.0.27...v0.0.28)

### 🩹 Fixes

- **react:** Add method to action form props ([23299e1](https://github.com/zrojs/zro/commit/23299e1))
- **react:** Update ClientRouter to use full URL instead of pathname ([98dcbe2](https://github.com/zrojs/zro/commit/98dcbe2))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.27

[compare changes](https://github.com/zrojs/zro/compare/v0.0.26...v0.0.27)

### 🚀 Enhancements

- **react:** Revalidate router after action ([c2b10de](https://github.com/zrojs/zro/commit/c2b10de))

### 🏡 Chore

- **release:** V0.0.2 ([3f97d72](https://github.com/zrojs/zro/commit/3f97d72))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.26

[compare changes](https://github.com/zrojs/zro/compare/v0.0.25...v0.0.26)

### 🚀 Enhancements

- **create-zro:** Rename _gitignore to .gitignore and add default ignore template ([b485c4e](https://github.com/zrojs/zro/commit/b485c4e))

### 🩹 Fixes

- **plugins/db:** Enhance error message for missing DB config ([8ff590d](https://github.com/zrojs/zro/commit/8ff590d))
- **plugins/db:** Update drizzle-orm peer dependency version constraint ([7febebc](https://github.com/zrojs/zro/commit/7febebc))
- Router types loaders typesafety ([3c4f9e7](https://github.com/zrojs/zro/commit/3c4f9e7))
- **react:** Reading from cache on ssr only ([0e87320](https://github.com/zrojs/zro/commit/0e87320))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.25

[compare changes](https://github.com/zrojs/zro/compare/v0.0.24...v0.0.25)

### 🚀 Enhancements

- **create-zro:** Update with-tailwind template ([4d30fff](https://github.com/zrojs/zro/commit/4d30fff))
- **zro:** Actions supports different content types `json`, `multipart/form-data`, `x-www-form-urlencoded` ([9b1e5d9](https://github.com/zrojs/zro/commit/9b1e5d9))

### 🩹 Fixes

- **create-zro:** Update prepublishOnly script to exclude tagging ([b674799](https://github.com/zrojs/zro/commit/b674799))

### 💅 Refactors

- **ziro/react:** Cache disabled until having a revalidation strategy ([246130a](https://github.com/zrojs/zro/commit/246130a))

### 🏡 Chore

- **release:** V0.0.5 ([3d4708a](https://github.com/zrojs/zro/commit/3d4708a))
- **create-zro:** Update prepublishOnly script to include changelogen ([6d09891](https://github.com/zrojs/zro/commit/6d09891))
- **release:** V0.0.5 ([582fd35](https://github.com/zrojs/zro/commit/582fd35))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.24

[compare changes](https://github.com/zrojs/zro/compare/v0.0.23...v0.0.24)

### 🚀 Enhancements

- Optional action input and improve `useAction` interface ([1a5e070](https://github.com/zrojs/zro/commit/1a5e070))

### 🩹 Fixes

- Better error preview using `youch` ([35abad0](https://github.com/zrojs/zro/commit/35abad0))
- `db` plugin build flow using unbuild ([7302c57](https://github.com/zrojs/zro/commit/7302c57))

### 🏡 Chore

- **release:** V0.0.4 ([c63a61d](https://github.com/zrojs/zro/commit/c63a61d))
- **release:** V0.0.1 ([8510de1](https://github.com/zrojs/zro/commit/8510de1))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.23

[compare changes](https://github.com/zrojs/zro/compare/v0.0.22...v0.0.23)

### 🩹 Fixes

- Exclude @unhead/react from optimizeDeps in Vite configuration ([aab75ad](https://github.com/zrojs/zro/commit/aab75ad))
- Update zro dependency versioning to use workspace:^* across all packages ([e9491b2](https://github.com/zrojs/zro/commit/e9491b2))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.22

[compare changes](https://github.com/zrojs/zro/compare/v0.0.21...v0.0.22)

### 🩹 Fixes

- Enable tree shaking in Rollup configuration ([b2cf97c](https://github.com/zrojs/zro/commit/b2cf97c))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.21

[compare changes](https://github.com/zrojs/zro/compare/v0.0.20...v0.0.21)

### 🚀 Enhancements

- Enable automatic JSX runtime and add side effects support ([eff596d](https://github.com/zrojs/zro/commit/eff596d))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.20

[compare changes](https://github.com/zrojs/zro/compare/v0.0.19...v0.0.20)

### 🩹 Fixes

- Exclude "zro/react/client-entry" from optimizeDeps in Vite config ([c54fb12](https://github.com/zrojs/zro/commit/c54fb12))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.19

[compare changes](https://github.com/zrojs/zro/compare/v0.0.18...v0.0.19)

### 🚀 Enhancements

- Install not found plugins silently ([8acc3a7](https://github.com/zrojs/zro/commit/8acc3a7))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.18

[compare changes](https://github.com/zrojs/zro/compare/v0.0.17...v0.0.18)

### 🚀 Enhancements

- Add build configuration and update package settings for logger plugin ([422592f](https://github.com/zrojs/zro/commit/422592f))
- Add publishConfig to package.json for public access ([81ea41d](https://github.com/zrojs/zro/commit/81ea41d))

### 🩹 Fixes

- Correct version number and update changelogen command in package.json ([bd5cc7d](https://github.com/zrojs/zro/commit/bd5cc7d))
- Importing libraries in 2 different modes, require/import to support monorepo/standalone projects both ([262e616](https://github.com/zrojs/zro/commit/262e616))

### 💅 Refactors

- Clean up imports and improve layout structure in _layout.tsx fix: remove unused title in useHead for HomePage component ([70e8670](https://github.com/zrojs/zro/commit/70e8670))

### 🏡 Chore

- **release:** V0.0.2 ([ca24b79](https://github.com/zrojs/zro/commit/ca24b79))
- **release:** V0.0.2 ([6e47eca](https://github.com/zrojs/zro/commit/6e47eca))
- **release:** V0.0.2 ([898ea26](https://github.com/zrojs/zro/commit/898ea26))
- **release:** V0.0.3 ([aafd1ea](https://github.com/zrojs/zro/commit/aafd1ea))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.17

[compare changes](https://github.com/zrojs/zro/compare/v0.0.16...v0.0.17)

### 🚀 Enhancements

- Move client entry to bundle itself and make this file optional to have ([605bbb9](https://github.com/zrojs/zro/commit/605bbb9))
- Add virtual:zro/router.client to externals in build config ([e336812](https://github.com/zrojs/zro/commit/e336812))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.16

[compare changes](https://github.com/zrojs/zro/compare/v0.0.15...v0.0.16)

### 🚀 Enhancements

- Enhance error handling in RenderRouteComponent to utilize error boundaries if provided ([7381c82](https://github.com/zrojs/zro/commit/7381c82))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.15

[compare changes](https://github.com/zrojs/zro/compare/v0.0.14...v0.0.15)

### 🚀 Enhancements

- Enable minification in build config, refactor Router component for improved readability, and update error handling in abort function ([257571a](https://github.com/zrojs/zro/commit/257571a))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.14

[compare changes](https://github.com/zrojs/zro/compare/v0.0.13...v0.0.14)

### 🚀 Enhancements

- Add Rollup build configuration for server and update package exports ([2b93fca](https://github.com/zrojs/zro/commit/2b93fca))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.13

[compare changes](https://github.com/zrojs/zro/compare/v0.0.12...v0.0.13)

### 💅 Refactors

- Simplify React imports and update usage across components ([7f753fc](https://github.com/zrojs/zro/commit/7f753fc))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.12

[compare changes](https://github.com/zrojs/zro/compare/v0.0.11...v0.0.12)

### 🚀 Enhancements

- Migrate from tsc to unbuild to have more control over build files ([03b51eb](https://github.com/zrojs/zro/commit/03b51eb))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.11

[compare changes](https://github.com/zrojs/zro/compare/v0.0.10...v0.0.11)

### 🩹 Fixes

- Mark package as private in package.json ([1c3e51c](https://github.com/zrojs/zro/commit/1c3e51c))

### 💅 Refactors

- Update router imports for improved structure and clarity ([9bfdd07](https://github.com/zrojs/zro/commit/9bfdd07))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.10

[compare changes](https://github.com/zrojs/zro/compare/v0.0.9...v0.0.10)

### 🩹 Fixes

- Update imports from es-toolkit to specific paths for compatibility ([d848a7f](https://github.com/zrojs/zro/commit/d848a7f))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.9

[compare changes](https://github.com/zrojs/zro/compare/v0.0.8...v0.0.9)

### 🩹 Fixes

- Reorder exclude array for clarity in Vite configuration ([bfe4d12](https://github.com/zrojs/zro/commit/bfe4d12))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.8

[compare changes](https://github.com/zrojs/zro/compare/v0.0.7...v0.0.8)

### 🩹 Fixes

- Update @unhead/react and unhead dependencies to version 2.0.5 ([1312190](https://github.com/zrojs/zro/commit/1312190))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.7

[compare changes](https://github.com/zrojs/zro/compare/v0.0.6...v0.0.7)

### 💅 Refactors

- Simplify PluginConfigContext and remove unused wrapWithConfig method; update imports and usage across router files ([c1a397e](https://github.com/zrojs/zro/commit/c1a397e))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.6

[compare changes](https://github.com/zrojs/zro/compare/v0.0.5...v0.0.6)

### 🩹 Fixes

- Make plugin context server-only and async ([bcc713b](https://github.com/zrojs/zro/commit/bcc713b))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.5

[compare changes](https://github.com/zrojs/zro/compare/v0.0.4...v0.0.5)

### 🚀 Enhancements

- Update package.json and pnpm workspace configuration; improve Router class logic ([bf3ae81](https://github.com/zrojs/zro/commit/bf3ae81))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

## v0.0.4

[compare changes](https://github.com/zrojs/zro/compare/v0.0.3...v0.0.4)

## v0.0.3

[compare changes](https://github.com/zrojs/zro/compare/v0.0.2...v0.0.3)

## v0.0.2


### 🚀 Enhancements

- Basic route definitions with middlewares ([a83cd51](https://github.com/zrojs/zro/commit/a83cd51))
- Scan fs to generate route tree ([7542f21](https://github.com/zrojs/zro/commit/7542f21))
- Basic router file generation ([f0eb055](https://github.com/zrojs/zro/commit/f0eb055))
- Basic React integrations ([9ae6c27](https://github.com/zrojs/zro/commit/9ae6c27))
- Basic loading and error boundary support ([464b3bd](https://github.com/zrojs/zro/commit/464b3bd))
- Basic redirect handling ([789a09a](https://github.com/zrojs/zro/commit/789a09a))
- Basic typed routes ([a325db7](https://github.com/zrojs/zro/commit/a325db7))
- Enhance dashboard layout with user greeting and loader data ([6e8c838](https://github.com/zrojs/zro/commit/6e8c838))
- Basic meta function support ([abe2718](https://github.com/zrojs/zro/commit/abe2718))
- Basic data access through data context layers ([af1036d](https://github.com/zrojs/zro/commit/af1036d))
- Module transpilation during ssr/csr ([915db14](https://github.com/zrojs/zro/commit/915db14))
- Handle server redirections during data loading ([ba04ef6](https://github.com/zrojs/zro/commit/ba04ef6))
- Server side abort integration ([b4be2fb](https://github.com/zrojs/zro/commit/b4be2fb))
- Basic plugin loading ([334855a](https://github.com/zrojs/zro/commit/334855a))
- Logger plugin integrated ([6dd1b44](https://github.com/zrojs/zro/commit/6dd1b44))
- Colorize request  logger logs ([d9c082c](https://github.com/zrojs/zro/commit/d9c082c))
- Context access during runtime ([9927535](https://github.com/zrojs/zro/commit/9927535))
- @zro/db integration ([320fb31](https://github.com/zrojs/zro/commit/320fb31))
- Real sqlite db integration for playground ([cc3ae69](https://github.com/zrojs/zro/commit/cc3ae69))
- Clean up db integration ([0833021](https://github.com/zrojs/zro/commit/0833021))
- Integrating playground with turso db to test the latency and ui ([10d0595](https://github.com/zrojs/zro/commit/10d0595))
- Basic session/cookie support ([1ef3327](https://github.com/zrojs/zro/commit/1ef3327))
- Provider based authentication library ([ce6f80b](https://github.com/zrojs/zro/commit/ce6f80b))
- Nested context plugin for custom registered routes ([22e200f](https://github.com/zrojs/zro/commit/22e200f))
- Remove server only code from client ([745dec2](https://github.com/zrojs/zro/commit/745dec2))
- Action error handling ([db4cbdb](https://github.com/zrojs/zro/commit/db4cbdb))
- Auth middlewares and useAction basic usage ([01cd650](https://github.com/zrojs/zro/commit/01cd650))
- Basic github authentication example ([5a481e7](https://github.com/zrojs/zro/commit/5a481e7))
- Add auth from github example ([c80f59d](https://github.com/zrojs/zro/commit/c80f59d))
- Not found page handler, pass error to the closest layout ([7953f5a](https://github.com/zrojs/zro/commit/7953f5a))
- Create-zro command basic implementation ([9086245](https://github.com/zrojs/zro/commit/9086245))

### 🩹 Fixes

- Redirection cache issue ([f44c1bf](https://github.com/zrojs/zro/commit/f44c1bf))
- Optional vite plugin arguments ([47c5ce7](https://github.com/zrojs/zro/commit/47c5ce7))
- Type passing from route middlewares to loaders ([7a1bd81](https://github.com/zrojs/zro/commit/7a1bd81))
- Update file imports to use node:fs and node:path modules ([7b10715](https://github.com/zrojs/zro/commit/7b10715))
- Basic html transformatin using unhead ([e1b4543](https://github.com/zrojs/zro/commit/e1b4543))
- Persist head on the client side ([357464b](https://github.com/zrojs/zro/commit/357464b))
- SuppressHydrationWarning for html, body, head ([fcc7af2](https://github.com/zrojs/zro/commit/fcc7af2))
- Basic data stream from server during page navigation ([1384b8e](https://github.com/zrojs/zro/commit/1384b8e))
- Routes loading component correct order ([a4933bd](https://github.com/zrojs/zro/commit/a4933bd))
- Add global css using unhead before useLoaderData ([19a263a](https://github.com/zrojs/zro/commit/19a263a))
- Head context during dev server ([90db9f2](https://github.com/zrojs/zro/commit/90db9f2))
- Module revalidate on change ([96a38f5](https://github.com/zrojs/zro/commit/96a38f5))
- Restructure zro plugin interface ([4f7c95a](https://github.com/zrojs/zro/commit/4f7c95a))
- Server context, use as singleton ([296912b](https://github.com/zrojs/zro/commit/296912b))
- Set cached loader with correct key ([61e992d](https://github.com/zrojs/zro/commit/61e992d))
- Update version to 0.0.3 and add file URL utilities ([d2324a7](https://github.com/zrojs/zro/commit/d2324a7))
- Include templates in published package ([56a21a4](https://github.com/zrojs/zro/commit/56a21a4))

### 💅 Refactors

- Clean up ([bef8495](https://github.com/zrojs/zro/commit/bef8495))
- Remove meta function support from Route and related files, will be replaced with unhead flow ([7457b2c](https://github.com/zrojs/zro/commit/7457b2c))
- From meta function to unhead react flow ([44eaf99](https://github.com/zrojs/zro/commit/44eaf99))
- Cleanup server request handler ([618ba49](https://github.com/zrojs/zro/commit/618ba49))

### ❤️ Contributors

- Narixius <nariman.movaffaghi@gmail.com>

