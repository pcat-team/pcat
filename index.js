'use strict'
const fs = require('fs')
var fis = module.exports = require('fis-mini');
var shell = require('child_process').exec

fis.require.prefixes.unshift('pcat');
fis.cli.name = 'pcat';
fis.cli.info = require('./package.json');
fis.cli.version = function() {
    var version = [
        '  /\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\___/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_________/\\\\\\\\\\\\\\\\___/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\',
        '  \\/\\\\\\/////////\\\\\\__\\/\\\\\\///////////_________/\\\\\\_\\/\\\\\\__\\///////\\\\\\/////',
        '   \\/\\\\\\_______\\/\\\\\\__\\/\\\\\\___________________/\\\\\\__\\/\\\\\\________\\/\\\\\\',
        '    \\/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\__\\/\\\\\\__________________/\\\\\\\\\\\\\\\\\\\\\\________\\/\\\\\\',
        '     \\/\\\\\\///////////___\\/\\\\\\_________________/\\\\//////\\\\\\\\________\\/\\\\\\',
        '      \\/\\\\\\______________\\/\\\\\\________________/\\\\\\_____\\/\\\\\\________\\/\\\\\\',
        '       \\/\\\\\\______________\\/\\\\\\_______________/\\\\\\______\\/\\\\\\________\\/\\\\\\',
        '        \\/\\\\\\______________\\/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\__/\\\\\\_______\\/\\\\\\________\\/\\\\\\',
        '         \\///_______________\\///////////////__////________\\///_________\\///',
        '\n                                          ' + ('v' + fis.cli.info.version).yellow.bold
    ].join("\n");
    fis.log.info('\n version: \n' + version.cyan.bold + '\n\n');
}


// 添加命令描述
fis.set("modules.commands", ["release", "server", "create", "cnpm"])

var path = require('path')
var args = process.argv
var _argIndex = args.length - 1
var releaseConfig = {}
args[_argIndex].split('+').forEach(function(value) {
    if (/(.*?)\:(.*)/.test(value)) {
        releaseConfig[RegExp.$1] = RegExp.$2
    }
})
var userName = releaseConfig.author || ''

// 忽略文件、文件夹
fis.set('project.ignore', ['output/**', 'fis-conf.js', 'node_modules/**']); // set 为覆盖不是叠加

fis.set('project.fileType.text', 'jsx');

// es6/es7
fis.config.set('project.fileType.text', 'esx');

// typescript
fis.config.set('project.fileType.text', 'ts');
fis.config.set('project.fileType.text', 'tsx');

// 自动定位requrie的id
fis.config.set("component.dir", "modules");


/**
 * @dec [
 *  配置函数
 *  自定义配置封装成一个函数
 *  这样可以在fis-conf.js文件里面进行进行配置覆盖
 *  同时可以传参
 * ]
 * @param  {Object} option 项目差异配置
 * {
 *   domain: {
 *     dev : '' //开发时服务器的域名 //my.pconline.com.cn || ''
 *   },
 *   packageJson: {} //子系统的 package json 对象
 * }
 */
fis.pcat = function(option) {


    var fis = this
    var commonConfig = option.api;

    const _now = new Date

    const projectDir = fis.project.getProjectPath()
    const staticOrg = function(content, file, conf) {
        return `/*! ${file.release}*/\n${content}`
    }


    const packageJson = option.packageJson
    const site = packageJson.site || path.resolve(projectDir, "../").split(path.sep).pop()
    option.site = site;
    const client = packageJson.client;
    const dir = packageJson.dir;

    const orgInfo = `path:${packageJson.site}/${packageJson.client}/${packageJson.dir ? packageJson.dir+"/":""}${packageJson.name}/$1  tag:${releaseConfig.tag||''}  update by ${releaseConfig.author||''} at ${_now.toLocaleString()}`

    const subDomain = (site == "geeknev") ? `${site}.com` : `${site}.com.cn`;


    const domain = {
        dev: option.domain.dev,
        dqa: option.domain.dev,
        ssi: option.domain.dev,
        qa: {
            'static': '//ue.pc.com.cn',
            'img': '//ueimg.pc.com.cn',
            'page': '//zzpcat.' + subDomain + '/qa/page',
            'tpl': '//zzpcat.' + subDomain + '/qa/tpl'
        },
        ol: {
            'static': '//ue.3conline.com',
            'img': '//ueimg.3conline.com',
            'page': '//zzpcat.' + subDomain + '/ol/page',
            'tpl': '//zzpcat.' + subDomain + '/ol/tpl'
        },
        online: {
            'static': '//ue.3conline.com',
            'img': '//ueimg.3conline.com',
            'page': '//zzpcat.' + subDomain + '/online/page',
            'tpl': '//zzpcat.' + subDomain + '/online/tpl'
        }
    }

    console.log(`当前版本：${('v' + fis.cli.info.version).yellow.bold}`);

    const tempPath = fis.project.getTempPath()

    const useWigetList = fis.project.currentMedia() === 'list'
    const media = useWigetList ? 'dev' : (fis.project.currentMedia() || 'dev')

    // 设置输出路径 
    // const outputDir     =  media === 'dev' ? path.resolve(tempPath, "www") : '/data/web/pcat/'

    const outputDir = path.resolve(tempPath, "www")


    const MAP_DIR = path.resolve(outputDir, './' + media, "./map", './' + site, client)
    const PACKAGE_DIR = path.resolve(outputDir, './' + media, "./package", './' + site, client)
    const STATIC_DIR = path.resolve(outputDir, './' + media, "./static", './' + site, client)
    const TEMP_DIR = path.resolve(outputDir, './' + media, "./template", './' + site, client)
    const PAGE_DIR = path.resolve(outputDir, './' + media, "./page", './' + site, client)

    const DOMAIN = domain[media]

    const DOMAIN_STATIC = (media === 'dev' || media === 'dqa') ? `${DOMAIN}/${media}/static/${site}/${client}` : `${DOMAIN.static}/${site}/${client}`

    const DOMAIN_JS_CSS = (media === 'dev' || media === 'dqa') ? DOMAIN_STATIC : `${DOMAIN.static}/${site}/${client}`

    const DOMAIN_IMG = (media === 'dev' || media === 'dqa') ? DOMAIN_STATIC : `${DOMAIN.img}/${site}/${client}`

    const DOMAIN_TEMP = (media === 'dev' || media === 'dqa') ? `${DOMAIN}/${media}/tpl/${site}/${client}` : `${DOMAIN.tpl}/${site}/${client}`
    const DOMAIN_PAGE = (media === 'dev' || media === 'dqa') ? `${DOMAIN}/${media}/page/${site}/${client}` : `${DOMAIN.page}/${site}/${client}`


    const USE_HASH = option.useHash ? true : (media === 'dev' ? false : true)

    // 组件预览相关
    const WLIST_HTML_PATH = 'page/_wlist/**'

    fis.set("PCAT", {
        x: option,
        useCombo: option.combo,
        project: packageJson.name,
        version: packageJson.version,
        media: media,
        site: site,
        tagName: "widget" //约束为与组件目录同名
    });
    fis.set("PCATOPTION", option)
    fis.set('namespace', packageJson.name);
    fis.set('pc-project', packageJson.name);
    fis.set('pc-dir', packageJson.dir);
    fis.set('pc-version', packageJson.version);

    media !== 'dev' && console.log(`preview(${DOMAIN_PAGE}/${packageJson.dir ? packageJson.dir+"/":""}${packageJson.name}/${releaseConfig.tag})`);

    // 添加闭包,避免全局变量污染
    function wrapClosure(content, file) {
        return `;(function (window,document,undefined){\n${content}\n})(window,document);`
    }

    fis
        .match('(*)', {
            // release: false,
            domain: DOMAIN_JS_CSS
        })
        .hook('commonjs')
        .media(useWigetList ? fis.project.currentMedia() : media)
        .match('/test/**', {
            release: '$0',
            deploy: fis.plugin('local-deliver', {
                to: ""
            })
        })

        .match('/test/server.conf', {
            release: '/config/server.conf',
            deploy: fis.plugin('local-deliver', {
                to: ""
            })
        })

        .match('/_ssi/**', {
            release: '$0',
            useHash: false,
            deploy: fis.plugin('local-deliver', {
                to: ""
            })
        })



        .match(/^\/page\/(.*?\/.*?\.(js|jsx|es|ts|tsx)$)/i, {
            release: "${pc-dir}/${pc-project}/p/$1",
            useHash: USE_HASH,
            deploy: fis.plugin('local-deliver', {
                to: STATIC_DIR
            }),
            parser: wrapClosure,
            extras: {
                comboTo: '6',
                comboOrder: 1
            }
        })
        .match(/^\/page\/(.*?\/.*?\.(swf|mp3|wav|ogg|eot|svg|ttf|woff|woff2)$)/i, {
            release: "${pc-dir}/${pc-project}/p/$1",
            useHash: USE_HASH,
            deploy: fis.plugin('local-deliver', {
                to: STATIC_DIR
            })
        })
        .match(/^\/page\/(.*?\/.*?\.(css|less|scss|sass)$)/i, {
            release: "${pc-dir}/${pc-project}/p/$1",
            useHash: USE_HASH,
            deploy: fis.plugin('local-deliver', {
                to: STATIC_DIR
            }),
            extras: {
                comboTo: '6',
                comboOrder: 1
            }
        })
        .match(/^\/page\/(.*?\/.*?\.(html)$)/i, {
            release: `${packageJson.dir}/${packageJson.name}/${releaseConfig.tag?releaseConfig.tag+"/":""}$1`,
            useHash: USE_HASH,
            useSameNameRequire: true,
            isPage: true,
            extras: {
                isPage: true
            },
            useMap: true,
            deploy: [fis.plugin('local-deliver', {
                to: PAGE_DIR,
                tag: releaseConfig.tag
            })],
            domain: DOMAIN_PAGE,
            orgInfo: orgInfo
        })

        .match(/^\/page\/(.*?\/.*?\.(jpg|png|gif)$)/i, {
            release: "${pc-dir}/${pc-project}/p/$1",
            useHash: USE_HASH,
            useMap: !0,
            deploy: fis.plugin('local-deliver', {
                to: STATIC_DIR
            }),
            domain: DOMAIN_IMG
        })

        .match(/^\/widget\/(.*?\/.*?\.(js|jsx|es|ts|tsx)$)/i, {
            release: "${pc-dir}/${pc-project}/w/$1",
            useHash: USE_HASH,
            deploy: fis.plugin('local-deliver', {
                to: STATIC_DIR
            }),
            // id:'widget/$2',
            parser: wrapClosure,
            isMod: !1,
            extras: {
                comboTo: '6',
                comboOrder: 2
            }
        })
        .match(/^\/widget\/(.*?\/.*?\.(swf|mp3|wav|ogg|eot|svg|ttf|woff|woff2)$)/i, {
            release: "${pc-dir}/${pc-project}/w/$1",
            useHash: USE_HASH,
            deploy: fis.plugin('local-deliver', {
                to: STATIC_DIR
            })
        })
        .match(/^\/widget\/(.*?\/.*?\.(css|less|scss|sass)$)/i, {
            release: "${pc-dir}/${pc-project}/w/$1",
            useHash: USE_HASH,
            deploy: fis.plugin('local-deliver', {
                to: STATIC_DIR
            }),
            extras: {
                comboTo: '6',
                comboOrder: 1
            }
        })
        .match(/^\/widget\/(.*?\/.*?\.(jpg|png|gif)$)/i, {
            release: "${pc-dir}/${pc-project}/w/$1",
            useHash: USE_HASH,
            deploy: fis.plugin('local-deliver', {
                to: STATIC_DIR
            }),
            domain: DOMAIN_IMG
        })
        .match(/^\/widget\/(.*?\/.*?\.(html|tpl)$)/i, {
            release: "${pc-dir}/${pc-project}/$1",
            useHash: USE_HASH,
            isHtmlLike: true,
            isWidget: true,
            useSameNameRequire: true,
            useMap: true,
            deploy: fis.plugin('local-deliver', {
                to: TEMP_DIR
            }),
            domain: ''
        })



        .match(/^\/modules\/((.*?)\/.*?\.(swf|mp3|wav|ogg|eot|svg|ttf|woff|woff2)$)/i, {
            useHash: USE_HASH,
            release: "${pc-dir}/${pc-project}/m/$1",
            deploy: fis.plugin('local-deliver', {
                to: STATIC_DIR
            })
        })
        .match(/^\/modules\/((.*?)\/.*?\.(js|jsx|es|ts|tsx)$)/i, {
            useHash: USE_HASH,
            release: "${pc-dir}/${pc-project}/m/$1",

            deploy: fis.plugin('local-deliver', {
                to: STATIC_DIR
            }),
            id: "$2",
            isMod: !0,
            useSameNameRequire: true,
            extras: {
                comboTo: '5',
                comboOrder: 1
            }
        })



        .match(/^\/modules\/((.*?)\/.*?\.(css|less|scss)$)/i, {
            useHash: USE_HASH,
            release: "${pc-dir}/${pc-project}/m/$1",
            deploy: fis.plugin('local-deliver', {
                to: STATIC_DIR
            }),
            id: "$2.css",
            isMod: !0,
            extras: {
                comboTo: '5',
                comboOrder: 1
            }
        })

        .match(/^\/modules\/((.*?)\/.*?\.(png|jpg|gif|jpeg)$)/i, {
            release: "${pc-dir}/${pc-project}/m/$1",
            useHash: USE_HASH,
            deploy: fis.plugin('local-deliver', {
                to: STATIC_DIR
            }),
            domain: DOMAIN_IMG
        })

        .match('/modules/pc-config/*.js', {
            isMod: !1,
            extras: {
                comboTo: '5'
            }
        })
        .match('/modules/pc-require/*.js', {
            isMod: !1,
            extras: {
                comboTo: '-111'
            }
        })
        .match('/modules/{jquery,jquery-1\.x,jquery-2\.x,zepto}/*.js', {
            extras: {
                comboTo: '-112'
            }
        })
        .match('/modules/{reset,wap.reset,reset.wap}/*.css', {
            extras: {
                comboOrder: 0
            }
        })


        .match("*.html", {
            parser: [fis.plugin("widget-load", {
                project: fis.get("PCAT.project"),
                tagName: fis.get("PCAT.tagName"),
                mapOutputPath: MAP_DIR,
                templateOutputPath: TEMP_DIR,
                packageOutputPath: PACKAGE_DIR
            }), fis.plugin('html-uri')]

        })
        .match('**.css', {
            useSprite: true
        })
        // .match('**.{sass,scss}', {
        //     useSprite: true,
        //     parser: fis.plugin('node-sass'),
        //     rExt: '.css'
        // })
        .match('**.less', {
            useSprite: true,
            parser: fis.plugin('less-2.x'),
            rExt: '.css'
        })
        .match('*.es', {
            isJsLike: true,
            // es默认返回的是Buffer格式
            parser: function(content, file) {

                // 先判断是否为buffer格式
                if(content && typeof content === "object" && Buffer.isBuffer(content)){
                    content = fis.util.readBuffer(content);
                }

                return content;
            },
            rExt: '.js'
        })
        .match('*.{ts,tsx}', {
            parser: fis.plugin("typescript", option.typescriptConfig || {}, 'prepend'),
            rExt: '.js'
        })
        .match("::package", {
            prepackager: function(ret, conf, settings, opt) {
                // ret.src 所有的源码，结构是 {'<subpath>': <File 对象>}
                // ret.ids 所有源码列表，结构是 {'<id>': <File 对象>}
                // ret.map 如果是 spriter、postpackager 这时候已经能得到打包结果了，
                //         可以修改静态资源列表或者其他
                'use strict'
                let ids = ret.ids
                Object.keys(ids).forEach((id) => {
                    let file = ids[id]

                    // file.setContent(file.getContent().replace("__WIDGETLOADEDLISTS__", JSON.stringify(fis.get("widgetloadedList"))));


                    if (!file.orgInfo) return;
                    let content = file.getContent()
                    file.setContent(content.replace(/\<head\>/g, `<!--${file.orgInfo}-->\n<head>`))
                    //for server preview
                    let hash = file.getHash()
                    let root = `/${media}/page/${site}${media ==='dev' ? file.release : file.release.replace('\.html',`_${hash}.html`)}`
                    file.extras ? (file.extras.hash = hash, file.extras.path = root) : file.extras = { hash: hash, path: root }
                })


            },
            packager: [fis.plugin("widget-render", {
                tagName: fis.get("PCAT.tagName"),
                mapOutputPath: MAP_DIR,
                packageOutputPath: PACKAGE_DIR
            }), fis.plugin("ssi-render")],
            postpackager: [fis.plugin("autocombo", {
                domain: DOMAIN_STATIC,
                combo: fis.get("PCAT.useCombo")
            }), require("./plugin/ssi.js")],
            spriter: fis.plugin('csssprites')
        })
        .match("/map.json", {
            useHash: false,
            release: "${pc-dir}/${pc-project}/$0",
            deploy: fis.plugin('local-deliver', {
                to: MAP_DIR
            })
        })
        .match("/package.json", {
            useHash: false,
            release: "${pc-dir}/${pc-project}/$0",
            deploy: fis.plugin('local-deliver', {
                to: PACKAGE_DIR
            })
        })
        .match("*.{js,css,scss,less}", {
            optimizer: staticOrg
        })


    if (useWigetList) {
        // let wlist = require("./plugin/widget.js")

        fis.match("::package", {
            prepackager: function(ret, conf, settings, opt) {
                // ret.src 所有的源码，结构是 {'<subpath>': <File 对象>}
                // ret.ids 所有源码列表，结构是 {'<id>': <File 对象>}
                // ret.map 如果是 spriter、postpackager 这时候已经能得到打包结果了，
                //         可以修改静态资源列表或者其他
                'use strict'
                let ids = ret.ids
                Object.keys(ids).forEach((id) => {
                    let file = ids[id]

                    let content = file.getContent();

                    // 全部组件列表
                    let alllist = JSON.stringify(fis.get("__WIDGETALLLISTS__"));
                    content = content.replace("__WIDGETALLLISTS__", alllist)

                    // 已加载组件列表
                    let loadlist = JSON.stringify(fis.get("__WIDGETLOADEDLISTS__"));
                    content = content.replace("__WIDGETLOADEDLISTS__", loadlist)

                    file.setContent(content)

                })


            }
        })

    } else {
        fis.match(WLIST_HTML_PATH, {
            parser: [],
            release: !1
        })
    }

    if (media === 'qa' || media === 'dqa' || media === 'ol' || media === 'online') {



        if (option.autoprefixerConfig) {
            fis.match('*.{scss,sass,less,css}', {
                preprocessor: fis.plugin('autoprefixer', option.autoprefixerConfig || {
                    "browsers": ["Android >= 2.1", "iOS >= 4", "ie >= 8", "firefox >= 15"],
                    "cascade": true
                })
            })
        }

        fis
            .match('*.{scss,sass,less,css}', {

                optimizer: [
                    fis.plugin('clean-css', option.cleanCssConfig || null),
                    staticOrg
                ]
            })
            .match('*.{es,jsx}', {
                parser: fis.plugin("babel-6.x", option.babelConfig || {}, 'append'),
                rExt: '.js'
            })

            .match('*.{js,es,ts,tsx,jsx}', {
                // parser: fis.plugin("babel-6.x", option.babelConfig || {}, 'prepend'),
                optimizer: [
                    fis.plugin('uglify-js', option.uglifyJsConfig || null),
                    staticOrg
                ]
            })
            .match('*.png', {
                optimizer: fis.plugin('png-compressor')
            })
    }
    if (!!userName && (media === 'ol' || media === 'online')) {
        fis
            .match(/^\/page\/(.*\/)*([^\/]+\.html$)/i, {
                deploy: [fis.plugin('local-deliver', {
                    to: PAGE_DIR,
                    tag: releaseConfig.tag
                }), fis.plugin('cms', {
                    project: packageJson.name,
                    userName: userName,
                    api: commonConfig.cmsUpLoad || "cms." + subDomain
                }, "append")]
            })
    }
}