/**
 * ESLint configuration
 */
export default {
    env: {
      node: true,
      es2022: true,
      jest: true
    },
    extends: [
      'eslint:recommended'
    ],
    parserOptions: {
      ecmaVersion: 13,
      sourceType: 'module'
    },
    rules: {
      // Best practices
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
      'eqeqeq': ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      
      // Style
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { 'allowTemplateLiterals': true }],
      'indent': ['error', 2, { 'SwitchCase': 1 }],
      'comma-dangle': ['error', 'never'],
      'arrow-parens': ['error', 'as-needed'],
      
      // Error handling
      'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      'no-throw-literal': 'error',
      
      // Async
      'require-await': 'error',
      
      // Comments
      'spaced-comment': ['error', 'always']
    }
  };