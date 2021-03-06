'use strict';

const Manager = require('../modules/GlobalManager');

module.exports = {
    apply: (compiler) => {
        const entryExtNames = Manager.getYkitConf('entryExtNames');

        compiler.plugin('compilation', function(compilation) {
            compilation.mainTemplate.plugin('asset-path', function(assetPath, data) {
                // handle ExtractTextPlugin options
                if(typeof assetPath === 'object' && assetPath.filename) {
                    assetPath = assetPath.filename;
                }

                let extName = '.js';
                if (data.chunk && data.chunk.origins && data.chunk.origins[0]) {
                    let module = data.chunk.origins[0].module,
                        rawRequest = module.rawRequest
                                    ? module.rawRequest
                                    : module.dependencies[module.dependencies.length - 1].userRequest;

                    extName = sysPath.extname(rawRequest) || '.js';

                    if (entryExtNames.css.indexOf(sysPath.extname(
                            sysPath.basename(rawRequest, '.js')
                    )) > -1) {
                        extName = '.cache';
                    }

                    // 应用后缀转换规则
                    Object.keys(entryExtNames).map((targetExtName) => {
                        if(entryExtNames[targetExtName].indexOf(extName) > -1){
                            extName = '.' + targetExtName;
                        }
                    });

                    // 替换[name]为文件名，如index.js：[name][ext] => index[ext]
                    module.forEachChunk(chunk => {
                        if (chunk.name && module.blocks.length === 0) {
                            assetPath = assetPath.replace(/\[name\]/g, chunk.name.replace(/\.\w+$/g, ''));
                        }
                    });
                }

                return assetPath.replace(/\[ext\]/g, extName);
            });
        });
    }
};
