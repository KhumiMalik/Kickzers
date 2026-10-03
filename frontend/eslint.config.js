import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import boundaries from 'eslint-plugin-boundaries'
import importX from 'eslint-plugin-import-x'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

/**
 * Architecture rules (docs/plan.md §2.2), enforced by eslint-plugin-boundaries:
 *  - pages compose features (through their index.js), components, hooks and lib
 *  - a feature imports other features ONLY through their index.js
 *  - components/ui never imports features (no data fetching in UI primitives)
 */
const elements = [
  { type: 'app', pattern: 'src/app' },
  { type: 'pages', pattern: 'src/pages' },
  { type: 'feature', pattern: 'src/features/*', capture: ['featureName'] },
  { type: 'layout', pattern: 'src/components/layout' },
  { type: 'ui', pattern: 'src/components/ui' },
  { type: 'hooks', pattern: 'src/hooks' },
  { type: 'lib', pattern: 'src/lib' },
  { type: 'config', pattern: 'src/config' },
  { type: 'mocks', pattern: 'src/mocks' },
  { type: 'test', pattern: 'src/test' },
]

const to = (...types) => ({ to: { element: { types: { anyOf: types } } } })
const featurePublicApi = { to: { element: { type: 'feature', fileInternalPath: 'index.js' } } }

const boundaryPolicies = [
  {
    from: { element: { type: 'app' } },
    allow: [to('pages', 'layout', 'ui', 'hooks', 'lib', 'config'), featurePublicApi],
  },
  {
    from: { element: { type: 'pages' } },
    allow: [to('pages', 'layout', 'ui', 'hooks', 'lib', 'config'), featurePublicApi],
  },
  { from: { element: { type: 'layout' } }, allow: [to('layout', 'ui', 'hooks', 'lib', 'config'), featurePublicApi] },
  { from: { element: { type: 'feature' } }, allow: [to('ui', 'hooks', 'lib', 'config'), featurePublicApi] },
  // Files inside the same feature may import each other freely.
  {
    from: { element: { type: 'feature', captured: { featureName: '*' } } },
    allow: {
      to: { element: { type: 'feature', captured: { featureName: '{{ from.element.captured.featureName }}' } } },
    },
  },
  { from: { element: { type: 'ui' } }, allow: to('ui', 'hooks', 'lib') },
  { from: { element: { type: 'hooks' } }, allow: to('hooks', 'lib') },
  // lib → mocks only for the dynamic import of the mock server (removed in Phase 11).
  { from: { element: { type: 'lib' } }, allow: to('lib', 'config', 'mocks') },
  { from: { element: { type: 'config' } }, allow: to('config') },
  { from: { element: { type: 'mocks' } }, allow: to('mocks', 'lib') },
]

export default [
  { ignores: ['dist', 'coverage', 'playwright-report', 'test-results'] },

  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,
  importX.flatConfigs.recommended,

  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser },
    },
    settings: {
      react: { version: 'detect' },
      'import-x/resolver': { node: { extensions: ['.js', '.jsx'] } },
    },
    rules: {
      'react/prop-types': 'off', // JavaScript project: props are documented with JSDoc instead
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'import-x/no-cycle': 'error',
      // False positives for packages that ship both a default and named exports (nouislider, lightbox).
      'import-x/no-named-as-default': 'off',
      'import-x/no-named-as-default-member': 'off',
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'never',
        },
      ],
    },
  },

  {
    files: ['src/**/*.{js,jsx}'],
    ignores: ['src/**/*.test.{js,jsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': elements,
      'boundaries/include': ['src/**/*.{js,jsx}'],
      // boundaries resolves imports with the classic 'import/resolver' setting; without it
      // extensionless .jsx imports are "unknown" and would silently pass.
      'import/resolver': { node: { extensions: ['.js', '.jsx'] } },
    },
    rules: {
      'boundaries/dependencies': ['error', { default: 'disallow', policies: boundaryPolicies }],
      'boundaries/no-unknown-dependencies': 'error',
    },
  },

  // Tests, e2e specs and config files run in Node / test runners.
  {
    files: ['**/*.test.{js,jsx}', 'src/test/**', 'e2e/**', '*.config.js'],
    languageOptions: { globals: { ...globals.node } },
  },

  // Must stay last: turns off formatting rules that would fight Prettier.
  prettier,
]
