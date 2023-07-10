'use strict';
const path = require('path');
const micromatch = require('micromatch');

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
                    testFiles: {
                        type: 'array',
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
        const testFiles = context.options[0]?.testFiles || [];

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

                //далее делаю дополнительное условие на абсолютные импорты в моковых данных импорты для которых идут из файлов testing. то есть делаю для них исключение и не выкидываю ошибку при обработке таких импортов
                const isTestingPublicApi =
                    segments[2] == 'testing' && segments.length < 4;

                if (isImportNotFromPublicApi && !isTestingPublicApi) {
                    context.report(
                        node,
                        'Абсолютный импорт разрешен только из Public API (index.ts)'
                    );
                }

                //далее проверка на импорт этих моковых данных в тестовые файлы что бы я не смог эти тествые данные по ошибке затянуть в продакшн. То есть если выше установлено что импорт идет из тестового файла он должен находится в файле с с тествыми расширениями. Эти расширения принимаю из вне как и алиас только это будет массив строк
                if (isTestingPublicApi) {
                    const currentFileName = context.getFilename();
                    //поскольку разные операционки возвращают разные пути нужно привести в классическому стандарту и по регулярке заменяю все совпадения
                    const normalPath = currentFileName.replace(/\\/g, '/');
                    //что бы понять содержит ли текущий файл валидное расширение принятое из вне использую дополнительную либу которая работате с регулярками у нее вызываю функцию и передаю полный адрес текущего файла currentFileName и элемент из массива валидных расширений файлов. если хоть на одно расширение функция вернет тру значит импорт находится в нужном тестовом файле если нет метод some вернет фолс и это будет флагом для прокидываения ошибки о том что текущий файл не валиден для таких импортов.
                    const isCurrentFileTesting = testFiles.some((pattern) =>
                        micromatch.isMatch(normalPath, pattern)
                    );
                    if (!isCurrentFileTesting) {
                        context.report(
                            node,
                            'Тестовые данные необходимо импортировать только в файлы с тестовыми расширениями.'
                        );
                    }
                }
            },
        };
    },
};

function isPathRelative(path) {
    return path === '.' || path.startsWith('./') || path.startsWith('../');
}
