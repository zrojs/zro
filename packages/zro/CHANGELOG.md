# Changelog


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

