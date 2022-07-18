module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: ["eslint:recommended","plugin:vue/essential"],
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-control-regex': 0,
        'no-empty-pattern': 'off',
        'no-unused-vars': 'warn',
        'valid-typeof': 'off',
        indent: 'off',
        'no-tabs': 'off',
        'vue/html-indent': 'off',
        'space-before-function-paren': 'off',
        'vue/max-attributes-per-line': 'off',
        'vue/no-v-html': 'off',
        'vue/html-self-closing': [
            'error',
            {
                html: {
                    void: 'always',
                    normal: 'always',
                    component: 'always'
                }
            }
        ]
    },
    parserOptions: {
        parser: 'babel-eslint'
    }
}
