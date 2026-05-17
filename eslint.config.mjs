import eslintPluginAstro from 'eslint-plugin-astro';

export default [
  ...eslintPluginAstro.configs.recommended,
  {
    rules: {
      // Pas de console.log en commit
      'no-console': 'error',
      // TypeScript strict — pas de any
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    ignores: ['dist/', '.astro/', 'node_modules/'],
  },
];
