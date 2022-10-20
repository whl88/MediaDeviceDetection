module.exports = {
    'extends': 'eslint:recommended',
    'env': {
        'node': true,
        'browser': false,
    },
    'rules': {
        // enable additional rules
        'indent': ['error', 4,],
        'quotes': ['error', 'single',],
        'semi': ['error', 'none',],
        'semi': ['error', 'none',],
        // disable rules from base configurations
        'no-console': 'off',
    },
};