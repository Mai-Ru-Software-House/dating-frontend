<!--
README.md (quality_assessment)
Report for the SEN-201 static analysis assignment: the ESLint runs on the Mai Ru frontend.
Created by Tee (Kittiphon Kijpinyochai), 20 October 2026
-->

# Static analysis of the Mai Ru frontend (ESLint)

Files for Canvas: `eslint_run1_output.txt` (before the fixes) and `eslint_run2_output.txt` (after).

**Run 2 is empty on purpose.** ESLint prints nothing when it finds no problems, so
`eslint_run2_output.txt` has 0 bytes. That is the real output, not a broken file. The exit code was 0.

## 1. Tool

ESLint 9.39.5 with typescript-eslint (type-aware rules) and these plugins:

| Package                                           | Version                                                             |
| ------------------------------------------------- | ------------------------------------------------------------------- |
| `typescript-eslint`                               | 8.71.1                                                              |
| `eslint-plugin-react`                             | 7.37.5                                                              |
| `eslint-plugin-react-hooks`                       | 7.1.1                                                               |
| `eslint-plugin-react-native`                      | 5.0.0 (wrapped with `fixupPluginRules` from `@eslint/compat` 2.1.1) |
| `eslint-plugin-jsdoc`                             | 65.3.15                                                             |
| `eslint-plugin-import-x`                          | 4.17.1                                                              |
| `@eslint-community/eslint-plugin-eslint-comments` | 4.8.1                                                               |
| `eslint-config-prettier`                          | 10.1.8 (already installed)                                          |
| `@eslint/js` 9.39.5, `globals` 16.5.0             | already in `node_modules`; now listed as dev dependencies           |

The app is TypeScript, ESLint is the standard analyzer for TypeScript, and our coding standards already
name it. The assignment's suggested lists only cover Python and Java, and it allows another tool.
`typescript-eslint` 8.71.1 is the version `eslint-config-expo` already uses, so no existing package
was upgraded.

## 2. Config

`eslint.quality.config.mjs` (repo root) is separate from the everyday `eslint.config.js`, which stays as
it was. It was committed in `c951ad1` and **not changed afterwards**: `git diff c951ad1 HEAD --
eslint.quality.config.mjs` is empty, so both runs used the same file.

It has these blocks: ESLint's recommended rules for all files; `strictTypeChecked` and
`stylisticTypeChecked` for `.ts` and `.tsx` (type information from the project service); React rules
for `.tsx`; plain-JS rules and Node globals for Babel, Jest and script files; Jest globals and fewer
rules for tests; no magic numbers or color literals checks in `src/theme`, `src/constants` and
`src/api/mocks`; and Prettier last. Ignored: `node_modules/`, `.expo/`, `dist/`, `build/`, `coverage/`,
`android/`, `ios/`, `web-build/`, `.claude/` and `quality_assessment/`.

Three choices were made before run 1, while the config could still change:

- `jsdoc` only enables `require-jsdoc`, `require-param` and `require-returns`. The whole recommended
  preset added about 190 style findings (`no-types`, `escape-inline-tags`, `check-param-names`) that
  no coding-standard rule asks for. `require-param` is told that props are documented as
  `@param props.name`, which is the team's style.
- `react-hooks` runs on `.ts` as well as `.tsx`, because our hooks live in `use*.ts` files.
- `eslint-config-prettier` switches `curly` off, so `curly` is turned on again in the last block.

Rules and the coding standard each one comes from:

| Rule                                                                                     | Setting                                                                       | Coding standard             |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------- |
| `eqeqeq`                                                                                 | error, always                                                                 | TS rule 8                   |
| `no-var`, `prefer-const`                                                                 | error                                                                         | TS rule 7                   |
| `curly`                                                                                  | error, all                                                                    | Format rule 2               |
| `no-console`                                                                             | warn (warn and error allowed)                                                 | no stray debug output       |
| `max-lines-per-function`                                                                 | warn, 50 (`.ts`), 150 (`.tsx`)                                                | Format rule 4               |
| `complexity`                                                                             | warn, 10                                                                      | Format rule 4               |
| `@typescript-eslint/no-explicit-any`                                                     | error                                                                         | TS rule 6                   |
| `no-floating-promises`, `no-misused-promises`                                            | error                                                                         | TS rule 9                   |
| `@typescript-eslint/no-magic-numbers`                                                    | warn                                                                          | Consideration 3             |
| `@typescript-eslint/naming-convention`                                                   | error (variables, functions, types, interfaces without `I`, boolean prefixes) | Naming rules 2 to 4         |
| `jsdoc/require-jsdoc`, `require-param`, `require-returns`                                | warn                                                                          | Comment rule 2              |
| `react/prefer-stateless-function`, `no-unstable-nested-components`, `no-array-index-key` | error                                                                         | TS rule 10                  |
| `react/no-multi-comp`                                                                    | warn                                                                          | Format rule 5               |
| `react-native/no-inline-styles`, `no-unused-styles`, `no-color-literals`                 | warn                                                                          | TS rule 10, Consideration 3 |
| `import-x/order`                                                                         | error                                                                         | Format rule 6               |
| `no-warning-comments`                                                                    | warn (`fixme`, `xxx`, `hack`)                                                 | Comment rule 6              |
| `eslint-comments/require-description`, `no-unlimited-disable`                            | error                                                                         | every disable says why      |
| `reportUnusedDisableDirectives`                                                          | error                                                                         | stale disables show up      |

Plus everything in `strictTypeChecked` and `stylisticTypeChecked`, for example `no-unsafe-*`,
`restrict-template-expressions`, `no-unnecessary-condition`, `no-non-null-assertion`.

## 3. How to reproduce

```bash
git checkout 48d1093   # run 1: the config commit c951ad1 plus the run 1 output file
npm ci
npx eslint --config eslint.quality.config.mjs --format stylish --no-color . \
  > quality_assessment/eslint_run1_output.txt 2>&1
npx eslint --config eslint.quality.config.mjs --format json . > /tmp/eslint_run1.json

git checkout 847c8da   # run 2: the last fix commit
npx eslint --config eslint.quality.config.mjs --format stylish --no-color . \
  > quality_assessment/eslint_run2_output.txt 2>&1
npx eslint --config eslint.quality.config.mjs --format json . > /tmp/eslint_run2.json
```

`npm run lint:quality` runs the same command on the current code. Run 1 was made on the config commit
`c951ad1` (the only change in `48d1093` is the output file itself). Run 2 was made on `847c8da`.

## 4. Results

|       | Errors | Warnings | Total | Files linted |
| ----- | ------ | -------- | ----- | ------------ |
| Run 1 | 319    | 152      | 471   | 182          |
| Run 2 | 0      | 0        | 0     | 192          |

The 10 extra files in run 2 are new files from the splits (components, helpers and test helpers).

| Rule                                                    | Run 1 | Run 2 |
| ------------------------------------------------------- | ----- | ----- |
| `@typescript-eslint/no-confusing-void-expression`       | 150   | 0     |
| `@typescript-eslint/no-magic-numbers`                   | 41    | 0     |
| `@typescript-eslint/restrict-template-expressions`      | 33    | 0     |
| `jsdoc/require-jsdoc`                                   | 32    | 0     |
| `jsdoc/require-returns`                                 | 31    | 0     |
| `curly`                                                 | 20    | 0     |
| `@typescript-eslint/require-await`                      | 16    | 0     |
| `complexity`                                            | 15    | 0     |
| `@typescript-eslint/naming-convention`                  | 14    | 0     |
| `@typescript-eslint/no-unnecessary-condition`           | 14    | 0     |
| `@typescript-eslint/no-unsafe-assignment`               | 14    | 0     |
| `@typescript-eslint/no-unsafe-member-access`            | 11    | 0     |
| `react/no-multi-comp`                                   | 9     | 0     |
| `@typescript-eslint/no-unsafe-return`                   | 9     | 0     |
| `max-lines-per-function`                                | 7     | 0     |
| `no-console`                                            | 7     | 0     |
| `jsdoc/require-param`                                   | 7     | 0     |
| `@typescript-eslint/no-non-null-assertion`              | 6     | 0     |
| `@typescript-eslint/no-invalid-void-type`               | 4     | 0     |
| `@typescript-eslint/no-misused-promises`                | 4     | 0     |
| `@typescript-eslint/no-unsafe-argument`                 | 3     | 0     |
| `@typescript-eslint/prefer-nullish-coalescing`          | 3     | 0     |
| `react-native/no-inline-styles`                         | 3     | 0     |
| `@typescript-eslint/no-unsafe-call`                     | 3     | 0     |
| `@typescript-eslint/consistent-type-definitions`        | 3     | 0     |
| `@typescript-eslint/non-nullable-type-assertion-style`  | 3     | 0     |
| `react/no-array-index-key`                              | 2     | 0     |
| `@typescript-eslint/no-unnecessary-type-assertion`      | 2     | 0     |
| `@typescript-eslint/no-unused-vars`                     | 1     | 0     |
| `react/no-unstable-nested-components`                   | 1     | 0     |
| `@typescript-eslint/no-namespace`                       | 1     | 0     |
| `@eslint-community/eslint-comments/require-description` | 1     | 0     |
| `@typescript-eslint/no-require-imports`                 | 1     | 0     |

## 5. What was fixed

Before every commit: `npx tsc --noEmit`, `npx eslint .`, `npx prettier --check .` and the 194 unit tests
(`npm run test:ci`) all passed. No new tests were written.

| Commit    | Message                                           | Findings removed                                                                           |
| --------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `7e8793a` | `fix: import Buffer in seed script`               | 0 (it fixed 11 errors in the everyday `npx eslint .`, which was already failing on `main`) |
| `a52549c` | `style: apply ESLint autofixes`                   | 177 (471 to 294)                                                                           |
| `7ae18e5` | `fix: resolve type-safety lint findings`          | 122 (294 to 172)                                                                           |
| `96027e1` | `fix: resolve React hook lint findings`           | 4 (172 to 168)                                                                             |
| `2c492c8` | `refactor: move style literals into theme tokens` | 51 (168 to 117)                                                                            |
| `aa3c72e` | `refactor: split long functions and components`   | 39 (117 to 78)                                                                             |
| `847c8da` | `docs: add missing JSDoc on exported functions`   | 78 (78 to 0)                                                                               |

Notes on the fixes:

- The autofix also wanted to insert empty JSDoc stubs and to turn the React Navigation param lists
  from `type` into `interface`, which breaks `tsc`. Both were left out; the docs were written by hand.
- `react-hooks/rules-of-hooks` and `exhaustive-deps` found nothing in run 1, so no dependency array
  changed.
- Fixes that could have changed behavior were done another way: `||` was kept where an empty string
  must fall back (`TextField`), `Array` index lookups were typed as possibly `undefined` instead of
  deleting the guards, and no object property names that are sent to the API were renamed.
- After the last fix commit, the app was run in mock mode on the `mairu-iphone-15` emulator. Ten screens
  (Home, Matches, Search, Chats, Conversation, Profile, Edit profile, Notes people, Notes of one
  person, Note) were captured on `main` (`b41bae9`) and on `847c8da` and compared pixel by pixel:
  identical, apart from the Expo Go "Tools" tooltip, which shows for a few seconds. Landing, Login (empty,
  with errors, with typed text) and Create profile step 1 matched in the same way, and the mock login
  reached Home.

## 6. What is left and why

Nothing is left in the quality run: 0 errors and 0 warnings. Two side effects to know about:

- The everyday `npx eslint .` (a different config) now prints 6 warnings, "Unused eslint-disable
  directive", for the inline disables below. They name rules that only the quality config enables.
  There are 0 errors, so the commit gate still passes. The quality config is frozen, so this was not
  changed.
- `UT-FAV-02` in `src/hooks/useFavorites.test.tsx` fails now and then. It does the same on `main`
  without any of these changes (1 failure in 4 runs of that file), so it is an existing timing problem in
  the test, not something the lint fixes caused. It was not touched.

## 7. Inline disables

| File                                                    | Rule                                             | Reason                                                                                                                                 |
| ------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `src/navigation/types.ts` (3 lines, one per param list) | `@typescript-eslint/consistent-type-definitions` | React Navigation param lists must be type aliases; an interface has no index signature (the autofix broke `tsc`).                      |
| `src/navigation/types.ts`                               | `@typescript-eslint/no-namespace`                | React Navigation's documented way to type `useNavigation()` globally.                                                                  |
| `src/navigation/types.ts`                               | `@typescript-eslint/no-empty-object-type`        | Adds no members; it only links `RootParamList` to `RootStackParamList`. (This disable was already there; it only got its description.) |
| `src/screens/account/LandingScreen.tsx`                 | `@typescript-eslint/no-require-imports`          | Metro bundles images through `require()`.                                                                                              |
| `src/api/mocks/matching.ts`                             | `@typescript-eslint/no-unused-vars`              | Rest-sibling destructuring drops `lookingFor` from the card.                                                                           |
