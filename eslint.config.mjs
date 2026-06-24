import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// Monorepo-wide flat ESLint config. Framework-specific configs (Next, Expo) are
// layered on inside their own apps when those apps are built.
export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/.expo/**',
      '**/.turbo/**',
      '**/*.config.{js,mjs,cjs}',
      '**/next-env.d.ts',
      'apps/inference/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node },
    },
  },
)
