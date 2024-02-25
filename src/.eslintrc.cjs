/**
 * @type {import('eslint').Linter.Config}
 */
// eslint-disable-next-line import/no-commonjs
module.exports = {
  root: true,
  extends: ['@modern-js-app'],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['../tsconfig.json'],
  },
  rules: {
    'import/order': [
      'warn',
      {
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
          },
          {
            pattern: '{react,react-dom,@modern-js/**,@tauri-apps/**}',
            group: 'builtin',
          },
          {
            pattern: '@shared/**',
            group: 'external',
            position: 'after',
          },
          {
            pattern: '{@,.,..}/**/*.{css,scss,less}',
            group: 'type',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['type'],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        'newlines-between': 'always',
        groups: ['builtin', 'external', 'unknown', ['internal', 'sibling', 'parent', 'index'], 'object', 'type'],
      },
    ],
    '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports', disallowTypeAnnotations: false }],
  },
};
