'use strict';

const rule = require('../../../lib/rules/api-imports'),
    RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
    parserOptions: { ecmaVersion: 6, sourceType: 'module' },
});

const aliasOptions = [
    {
        alias: '@',
        testFiles: [
            '**/*.test.ts',
            '**/*.stories.tsx',
            '**/StoreDecorator.tsx',
        ],
    },
];

ruleTester.run('api-imports', rule, {
    valid: [
        {
            code: "import { addCommentFormActions, addCommentFormReducer } from '../../model/slices/addCommentFormSlice'",
            errors: [],
        },
        {
            code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article'",
            errors: [],
            options: aliasOptions,
        },
        {
            filename:
                'C:\\Users\\tim\\Desktop\\javascript\\production_project\\src\\entities\\file.test.ts',
            code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/testing'",
            errors: [],
            options: aliasOptions,
        },
        {
            filename:
                'C:\\Users\\tim\\Desktop\\javascript\\production_project\\src\\entities\\StoreDecorator.tsx',
            code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/testing'",
            errors: [],
            options: aliasOptions,
        },
    ],

    invalid: [
        {
            code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/model/file.ts'",
            errors: [
                {
                    message:
                        'Абсолютный импорт разрешен только из Public API (index.ts)',
                },
            ],
            options: aliasOptions,
        },
        {
            filename:
                'C:\\Users\\tim\\Desktop\\javascript\\production_project\\src\\entities\\StoreDecorator.tsx',
            code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/testing/file.tsx'",
            errors: [
                {
                    message:
                        'Абсолютный импорт разрешен только из Public API (index.ts)',
                },
            ],
            options: aliasOptions,
        },
        {
            filename:
                'C:\\Users\\tim\\Desktop\\javascript\\production_project\\src\\entities\\forbidden.ts',
            code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/testing'",
            errors: [
                {
                    message:
                        'Тестовые данные необходимо импортировать из publicApi/testing.ts',
                },
            ],
            options: aliasOptions,
        },
    ],
});
