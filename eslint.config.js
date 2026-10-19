import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';

export default tseslint.config(
  // supabase/functions runs on Deno with its own globals and imports; the Supabase CLI checks it.
  { ignores: ['dist', 'dev-dist', 'node_modules', 'playwright-report', 'test-results', 'supabase/functions'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    files: ['public/sw-notifications.js'],
    languageOptions: { globals: { self: 'readonly', URL: 'readonly' } },
  },
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
      // Labels wrap a title and a hint in nested spans; look deep enough to find their text.
      'jsx-a11y/label-has-associated-control': ['error', { depth: 3 }],
    },
  },
);
