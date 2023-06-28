/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
    root: true,
    'extends': [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        '@vue/eslint-config-typescript',
    ],
    "rules": {
        "@typescript-eslint/no-unused-vars": ["warn", {"vars": "all", "args": "none", "ignoreRestSiblings": false}],
    },
    parserOptions: {
        ecmaVersion: 'latest'
    },
}
