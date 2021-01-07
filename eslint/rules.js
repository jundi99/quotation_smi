module.exports = {
  rules: {
    'accessor-pairs': 'error',
    'array-bracket-newline': 'off',
    'array-callback-return': 'error',
    'array-element-newline': 'off',
    'arrow-body-style': 'off',
    'block-scoped-var': 'error',
    'callback-return': 'error',
    camelcase: [
      'warn',
      {
        properties: 'never',
        ignoreDestructuring: true,
        ignoreImports: true,
        ignoreGlobals: false,
      },
    ],
    'capitalized-comments': 'off',
    'class-methods-use-this': 'warn',
    'comma-dangle': ['error', 'always-multiline'],
    complexity: ['error', 50],
    'consistent-return': 'error',
    'consistent-this': 'error',
    curly: 'error',
    'default-case': 'error',
    'dot-notation': 'error',
    eqeqeq: 'error',
    'func-name-matching': 'error',
    'func-names': 'error',
    'func-style': 'error',
    'function-paren-newline': 'off',
    'global-require': 'off',
    'guard-for-in': 'error',
    'handle-callback-err': 'error',
    'id-blacklist': 'error',
    'id-length': 'off',
    'id-match': 'error',
    'keyword-spacing': ['error', { after: true, before: true }],
    'linebreak-style': 'off',
    'lines-around-directive': 'error',
    'max-depth': 'error',
    'max-lines-per-function': [
      'warn',
      { max: 80, skipComments: true, skipBlankLines: true },
    ],
    'max-nested-callbacks': 'error',
    'max-params': 'off',
    'max-statements': 'off',
    'max-statements-per-line': ['error', { max: 1 }],
    'multiline-ternary': 'off',
    'new-cap': ['error', { capIsNew: false }],
    'newline-after-var': 'error',
    'newline-before-return': 'error',
    'no-alert': 'error',
    'no-array-constructor': 'error',
    'no-await-in-loop': 'warn',
    'no-bitwise': 'error',
    'no-buffer-constructor': 'error',
    'no-caller': 'error',
    'no-catch-shadow': 'error',
    'no-console': 'warn',
    'no-confusing-arrow': 'error',
    'no-continue': 'error',
    'no-div-regex': 'error',
    'no-duplicate-imports': 'error',
    'no-else-return': 'error',
    'no-empty-function': 'off',
    'no-eq-null': 'error',
    'no-eval': 'error',
    'no-extend-native': 'error',
    'no-extra-bind': 'error',
    'no-extra-label': 'error',
    'no-implicit-coercion': 'error',
    'no-implicit-globals': 'error',
    'no-implied-eval': 'error',
    'no-inline-comments': 'off',
    'no-invalid-this': 'error',
    'no-iterator': 'error',
    'no-label-var': 'error',
    'no-labels': 'error',
    'no-lone-blocks': 'error',
    'no-lonely-if': 'error',
    'no-loop-func': 'error',
    'no-magic-numbers': 'off',
    'no-mixed-requires': 'off',
    'no-multi-assign': 'error',
    'no-multi-str': 'error',
    'no-native-reassign': 'error',
    'no-negated-condition': 'off',
    'no-negated-in-lhs': 'error',
    'no-nested-ternary': 'error',
    'no-new': 'error',
    'no-new-func': 'error',
    'no-new-object': 'error',
    'no-new-require': 'error',
    'no-new-wrappers': 'error',
    'no-octal-escape': 'error',
    'no-param-reassign': 'off',
    'no-path-concat': 'error',
    'no-plusplus': 'off',
    'no-process-env': 'off',
    // 'no-process-exit': 'error',
    'no-proto': 'error',
    'no-prototype-builtins': 'error',
    'no-restricted-globals': 'error',
    'no-restricted-imports': 'error',
    'no-restricted-modules': 'error',
    'no-restricted-properties': 'error',
    'no-restricted-syntax': 'error',
    'no-return-assign': 'error',
    'no-return-await': 'error',
    'no-script-url': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-shadow': 'off',
    'no-shadow-restricted-names': 'error',
    'no-sync': 'off',
    'no-tabs': 'error',
    'no-template-curly-in-string': 'error',
    'no-ternary': 'off',
    'no-throw-literal': 'error',
    'no-trailing-spaces': 'error',
    'no-undef-init': 'error',
    'no-undefined': 'error',
    'no-underscore-dangle': [
      'error',
      {
        allow: ['_id', '__'],
      },
    ],
    'no-unmodified-loop-condition': 'error',
    'no-unneeded-ternary': 'error',
    'no-unused-expressions': 'off',
    'no-unused-vars': 'warn',
    'no-use-before-define': 'error',
    'no-useless-call': 'error',
    'no-useless-catch': 'error',
    'no-useless-computed-key': 'error',
    'no-useless-concat': 'error',
    'no-useless-constructor': 'error',
    'no-useless-rename': 'error',
    'no-useless-return': 'error',
    'no-var': 'error',
    'no-void': 'error',
    'no-warning-comments': 'error',
    'no-with': 'error',
    'object-shorthand': 'off',
    'one-var': 'off',
    'operator-assignment': 'error',
    'padded-blocks': 'off',
    'padding-line-between-statements': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-const': 'warn',
    // 'prefer-destructuring': 'error',
    'prefer-numeric-literals': 'error',
    'prefer-promise-reject-errors': 'error',
    'prefer-reflect': 'error',
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
    'quote-props': 'off',
    quotes: [
      'error',
      'single',
      { avoidEscape: true, allowTemplateLiterals: true },
    ],
    radix: 'error',
    'require-await': 'error',
    // 'require-jsdoc': [
    //   'error',
    //   {
    //     require: {
    //       FunctionDeclaration: true,
    //       MethodDefinition: false,
    //       ClassDeclaration: false,
    //       ArrowFunctionExpression: true,
    //       FunctionExpression: true,
    //     },
    //   },
    // ],
    semi: ['error', 'never'],
    'sort-imports': 'error',
    'sort-keys': 'off',
    'sort-vars': 'off',
    'space-before-function-paren': 'off',
    'spaced-comment': 'error',
    'switch-colon-spacing': 'off',
    'symbol-description': 'error',
    'valid-jsdoc': 'error',
    'vars-on-top': 'error',
    yoda: 'error',
  },
}
