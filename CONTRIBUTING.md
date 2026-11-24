# Contributing to Radix Native

Thanks for taking the time to contribute. This guide covers how to set the project up, what a good change looks like, and how releases work.

By participating you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to contribute

- **Report a bug** — open a [bug report](https://github.com/Atotaro98/radix-native/issues/new?template=bug_report.yml) with a minimal reproduction.
- **Propose a feature** — open a [feature request](https://github.com/Atotaro98/radix-native/issues/new?template=feature_request.yml). For anything larger than a small fix, please open an issue before writing code so we can agree on the approach.
- **Improve the docs** — the README, `docs/content/` and `packages/radix-native/llm/` are all fair game.
- **Report a vulnerability** — do not open a public issue; follow the [security policy](SECURITY.md).

## The one rule: match Radix Themes

Radix Native mirrors the [`@radix-ui/themes`](https://www.radix-ui.com/themes) API. Same component names, same props, same variants, same design tokens.

- A new prop, variant or component should exist in Radix Themes first. Link the relevant Radix docs page in your PR.
- Where React Native cannot do what the web does, keep the API and document the difference rather than inventing a new one.
- No new runtime dependencies. The peer dependencies are `react`, `react-native` and `react-native-reanimated`, and that list should stay that short.

## Setup

You need Node 22 and Yarn 4 (via Corepack). The repo is a Turborepo monorepo.

```bash
corepack enable
yarn install
```

| Path                    | What it is                          |
| ----------------------- | ----------------------------------- |
| `packages/radix-native` | The library published to npm        |
| `apps/example`          | Expo playground used to try changes |
| `docs/content`          | MDX documentation pages             |

## Development workflow

```bash
yarn build             # Build the library
yarn lint              # ESLint
yarn typecheck         # TypeScript
yarn test              # Jest + Testing Library
yarn generate:colors   # Regenerate color tokens from @radix-ui/colors
```

To try a change on a device or simulator:

```bash
cd apps/example
yarn ios               # or yarn android
```

A pre-commit hook (Husky + lint-staged) runs ESLint and Prettier on staged files.

## Making a change

1. Fork the repo and create a branch from `main` (`fix/…`, `feat/…`, `docs/…`).
2. Make the change, with tests. Bug fixes should come with a test that fails without the fix.
3. Check it in the example app in both light and dark appearance, on iOS and Android when the change touches layout, gestures or overlays.
4. Run `yarn lint && yarn typecheck && yarn test && yarn build` — this is what CI runs.
5. Add a changeset (see below) if the change affects the published package.
6. Open a pull request against `main` and fill in the template.

### Code guidelines

- TypeScript strict. Avoid `any` and unchecked `as` assertions.
- Style with design tokens from the theme, never hardcoded colors, spacing or radii.
- Keep components accessible: correct `accessibilityRole` and state, 44pt minimum touch targets, a visible focus ring.
- Support right-to-left layouts — use logical start/end rather than left/right.
- Update the docs (`docs/content/`, `packages/radix-native/llm/`, README) when the public API changes.

### Commit messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(tabs): keep the active trigger in view in a scrolling tab list
fix(overlays): closing overlays let touches through
docs: radio page
```

Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.

### Changesets

Versioning and the changelog are driven by [Changesets](https://github.com/changesets/changesets). If your change affects what users of `radix-native` get from npm, run:

```bash
yarn changeset
```

Pick the bump (`patch` for fixes, `minor` for new features, `major` for breaking changes) and write a short, user-facing summary. Commit the generated file in `.changeset/` with your PR. Changes that only touch docs, tests, CI or the example app do not need one.

## Releases

Releases are fully automated — never publish by hand. When changesets land on `main`, the release workflow opens a **Version Packages** PR; merging it publishes to npm from GitHub Actions with a provenance attestation.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
