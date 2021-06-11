'use strict';

module.exports = {
  extends: 'eslint-config-egg',
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'valid-jsdoc': 0,
    'no-script-url': 0,
    'no-multi-spaces': 0,
    'default-case': 0,
    'no-case-declarations': 0,
    'one-var-declaration-per-line': 0,
    'no-restricted-syntax': 0,
    'jsdoc/require-param': 0,
    'jsdoc/check-param-names': 0,
    'jsdoc/require-param-description': 0,
    'arrow-parens': 0,
    'prefer-promise-reject-errors': 0,
    'no-control-regex': 0,
    'no-use-before-define': 0,
    'array-callback-return': 0,
    'no-bitwise': 0,
    'no-self-compare': 0,
    'one-var': 0,
  },
  env: {
    jest: true
  },
  globals:{
    window: false
  }
};
