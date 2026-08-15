import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  { ignores: ['dist', 'playwright-report', 'test-results'] },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { parser: tsParser, parserOptions: { project: './tsconfig.json' } },
    plugins: { '@typescript-eslint': tseslint },
    rules: { '@typescript-eslint/no-explicit-any': 'error', 'no-console': 'warn' },
  },
];
