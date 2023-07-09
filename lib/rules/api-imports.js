'use strict';
const path = require('path');

module.exports = {
    meta: {
        type: null,
        docs: {
            description: 'fsd api imports',
            recommended: false,
            url: null,
        },

        fixable: null,
        //настойки для алиаса, буду принимать из вне строку
        schema: [
            {
                type: 'object',
                properties: {
                    alias: {
                        type: 'string',
                    },
                },
            },
        ],
    },

    create(context) {
        const checkingLayers = {
            entities: 'entities',
            features: 'features',
            pages: 'pages',
            widgets: 'widgets',
        };
        const alias = context.options[0]?.alias || '';
        return {
            ImportDeclaration(node) {
                const value = node.source.value;
                const importTo = alias ? value.replace(`${alias}/`, '') : value;
                //если путь относительный то заканчиваю проверку
                if (isPathRelative(importTo)) {
                    return false;
                }
                //ежели путь абсолютный разбиваю его на массив и смотрю на его длинну если она больше двух уровней (слоя и слайса значит в импорте я залезаю в самые кишки модуля а это не хорошо) и создаю флаг который который сообщает что путь не из паблик апи
                const segments = importTo.split('/');
                //получаю первый слой в абсолютном ипорте и поскольку я проверяю только импорты в модулях 4 слоев делаю проверку если это не подподающий под проверку слой то возвращаю фолс и заканачию проверку
                const layer = segments[0];
                if (!checkingLayers[layer]) {
                    return false;
                }

                const isImportNotFromPublicApi = segments.length > 2;

                if (isImportNotFromPublicApi)
                    context.report(
                        node,
                        'Абсолютный импорт разрешен только из Public API (index.ts)'
                    );
            },
        };
    },
};

function isPathRelative(path) {
    return path === '.' || path.startsWith('./') || path.startsWith('../');
}
