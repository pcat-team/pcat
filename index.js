'use strict'
var fis = module.exports = require('fis-mini');
var shell = require('child_process').exec

fis.require.prefixes.unshift('pcat');
fis.cli.name = 'pcat';
fis.cli.info = require('./package.json');
fis.cli.version = function(){
    var version=[
    '  /\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\___/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\_________/\\\\\\\\\\\\\\\\___/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\',
    '  \\/\\\\\\/////////\\\\\\__\\/\\\\\\///////////_________/\\\\\\_\\/\\\\\\__\\///////\\\\\\/////',
    '   \\/\\\\\\_______\\/\\\\\\__\\/\\\\\\___________________/\\\\\\__\\/\\\\\\________\\/\\\\\\',
    '    \\/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\__\\/\\\\\\__________________/\\\\\\\\\\\\\\\\\\\\\\________\\/\\\\\\',
    '     \\/\\\\\\///////////___\\/\\\\\\_________________/\\\\//////\\\\\\\\________\\/\\\\\\',
    '      \\/\\\\\\______________\\/\\\\\\________________/\\\\\\_____\\/\\\\\\________\\/\\\\\\',
    '       \\/\\\\\\______________\\/\\\\\\_______________/\\\\\\______\\/\\\\\\________\\/\\\\\\',
    '        \\/\\\\\\______________\\/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\__/\\\\\\_______\\/\\\\\\________\\/\\\\\\',
    '         \\///_______________\\///////////////__////________\\///_________\\///',
    '\n                                          '+('v'+ fis.cli.info.version).yellow.bold
    ].join("\n");
    fis.log.info('\n version: \n' + version.cyan.bold + '\n\n');
}
var path = require('path')
var args = process.argv
var isMaster = !~args.indexOf('--child-flag')
var _argIndex = args.length - 1
if(!isMaster)_argIndex--;
var releaseConfig = {}
args[_argIndex].split('+').forEach(function(value){
  if(/(.*?)\:(.*)/.test(value)){
    releaseConfig[RegExp.$1] = RegExp.$2
  }
})
var userName = releaseConfig.author || ''
// console.log(releaseConfig,userName,args)
// var userName = /user\:(.*)(?:\|+?|^\|$)/.test(args[args.length - 1]) ? RegExp.$1 : ''
// console.log(userName)
    // fis.pcSub = function(){
    //   isMaster && console.log('-------------------------- ',fis.get('output'),' --------------------------')

//   isMaster && shell('start ' + 'chrome' + ' "'+ 'http://127.0.0.1:8090/' + fis.get('namespace') + '/index.html?t=' +(+new Date) +'"')
// }
fis.set('project.ignore',['output/**','fis-conf.js']); // set 为覆盖不是叠加

fis.pcat = function(option) {
    var fis                = this
    var commonConfig = {api:'dev6.pconline.com.cn:8002'}
    const _now = new Date

    const projectType = option.type || 'cms'
    const domain = {
      dev: option.domain.dev,
      qa: {
        'static': 'http://ue.pc.com.cn',
        'img': 'http://ueimg.pc.com.cn',
        'page':'http://pcat.pc.com.cn/qa/page',
        'tpl':'http://pcat.pc.com.cn/qa/tpl'
      },
      ol: {
        'static': 'http://ue.3conline.com',
        'img': 'http://ueimg.3conline.com',
        'page':'http://pcat.pc.com.cn/ol/page',
        'tpl':'http://pcat.pc.com.cn/ol/tpl'
      },
      online: {
        'static': 'http://ue.3conline.com',
        'img': 'http://ueimg.3conline.com',
        'page':'http://pcat.pc.com.cn/online/page',
        'tpl':'http://pcat.pc.com.cn/online/tpl'
      }
    }
    const orgInfo          = `  path : \${pc-project}$0  tag : ${releaseConfig.tag||''}  update by ${releaseConfig.author||''} at ${_now.toLocaleString()}  `
    const staticOrg        = function(content, file, conf){return `/*! ${file.release}*/\n${content}`}
    const packageJson      = option.packageJson
    const site             = packageJson.site || path.resolve(fis.project.getProjectPath(), "../").split(path.sep).pop()
    
    const tempPath         = fis.project.getTempPath()
    const commonConfigPath = option.commonConfigPath || path.resolve(tempPath,'_config.js')
    // try{
    //   commonConfig         = require(commonConfigPath)
    // }catch(e){
    //   commonConfig         = {}
    //   fis.log.info(e,'\n  please set common config!')
    // }
    // var pcat            = fis.get('pcat');
    const media            = fis.project.currentMedia() || 'dev'
    
    // 设置输出路径 
    
    // const outputDir     =  media === 'dev' ? path.resolve(tempPath, "www") : '/data/web/pcat/'
    
    const outputDir        = path.resolve(tempPath, "www")
    
    const MAP_DIR          = path.resolve(outputDir, './' +media, "./map", './'+site)
    const PACKAGE_DIR      = path.resolve(outputDir, './' +media, "./package", './'+site)
    const STATIC_DIR       = path.resolve(outputDir, './' +media, "./static", './'+site)
    const TEMP_DIR         = path.resolve(outputDir, './' +media, "./template", './'+site)
    const PAGE_DIR         = path.resolve(outputDir, './' +media, "./page", './'+site)
    
    const DOMAIN           = domain[media]
    
    const DOMAIN_STATIC    = media === 'dev' ? DOMAIN + '/dev/static/' + site : DOMAIN.static + '/' + site
    const DOMAIN_JS_CSS    = media === 'dev' ? DOMAIN_STATIC : DOMAIN.static + '/' + site
    const DOMAIN_IMG       = media === 'dev' ? DOMAIN_STATIC : DOMAIN.img + '/' + site
    const DOMAIN_TEMP      = media === 'dev' ? DOMAIN + '/dev/tpl/' + site : DOMAIN.tpl + '/' + site
    const DOMAIN_PAGE      = media === 'dev' ? DOMAIN + '/dev/page/' + site : DOMAIN.page + '/' + site
    
    
    const USE_HASH         = option.useHash ? !0 : (media === 'dev' ? !1 : !0)
    // const USE_HASH = !1
    

    // fis.log.info(outputDir,TEMP_DIR)
    fis.set("PCAT", {
        useCombo: option.combo,
        project: packageJson.name,
        version: packageJson.version,
        media: media,
        site: site,
        tagName: "widget" //约束为与组件目录同名
    });
    fis.set('namespace', packageJson.name);
    fis.set('pc-project', packageJson.name);
    fis.set('pc-version', packageJson.version);

    media!== 'dev' && console.log(`preview(${DOMAIN_PAGE}/${packageJson.name}/${packageJson.version}/)`)

    fis
      .match('(*)', {
        release: false,
        domain:DOMAIN_JS_CSS
      })
      .hook('commonjs')
      .media(media)
      .match(/^\/page\/(.*\/)*([^\/]+\.js$)/i, {
          useHash: USE_HASH,
          release: "${pc-project}/${pc-version}/j/$2",
          deploy: fis.plugin('local-deliver', {
              to: STATIC_DIR
          }),
          extras: {
            comboTo:'6',
            comboOrder:2
          }
      })
      .match(/^\/page\/(.*\/)*([^\/]+\.(?:css|less|scss)$)/i, {
          useHash: USE_HASH,
          release: "${pc-project}/${pc-version}/c/$2",
          deploy: fis.plugin('local-deliver', {
              to: STATIC_DIR
          }),
          extras: {
            comboTo:'6',
            comboOrder:2
          }
      })
      .match(/^\/page\/(.*\/)*([^\/]+\.html$)/i, {
        useHash: USE_HASH,
        useSameNameRequire: true,
        isPage: true,
        extras: {
            isPage: true
        },
        useMap: true,
        release: "${pc-project}/${pc-version}/$2",
        deploy: fis.plugin('local-deliver', {
            to: PAGE_DIR
        }),
        domain:DOMAIN_PAGE,
        orgInfo:orgInfo
      })
      .match(/^\/page\/(.*\/)*([^\/]+\.(?:png|jpg|gif)$)/i, {
          useHash: USE_HASH,
          useMap:!0,
          release: "${pc-project}/${pc-version}/i/$2",
          deploy: fis.plugin('local-deliver', {
              to: STATIC_DIR
          }),
          domain:DOMAIN_IMG
      })
      .match(/^\/widget\/(.*\/)*([^\/]+)\.js$/i, {
        useHash: USE_HASH,
        release: "${pc-project}/${pc-version}/j/$2.js",
        deploy: fis.plugin('local-deliver', {
            to: STATIC_DIR
        }),
        id:'widget/$2',
        moduleId:packageJson.name + ":widget/$2",
        requireId:packageJson.name + ":widget/$2",
        isMod:!0,
        extras: {
          comboTo:'6',
          comboOrder:1
        }
      })
      .match(/^\/widget\/(.*\/)*([^\/]+\.(?:css|less|scss)$)/i, {
        useHash: USE_HASH,
        release: "${pc-project}/${pc-version}/c/$2",
        deploy: fis.plugin('local-deliver', {
            to: STATIC_DIR
        }),
        extras: {
          comboTo:'6',
          comboOrder:1
        }
      })
      .match(/^\/widget\/(.*\/)*([^\/]+\.(?:png|jpg|gif)$)/i, {
          useHash: USE_HASH,
          release: "${pc-project}/${pc-version}/i/$2",
          deploy: fis.plugin('local-deliver', {
              to: STATIC_DIR
          }),
          domain:DOMAIN_IMG
      })
      .match(/^\/widget\/(.*\/)*([^\/]+\.(?:html|cms|tpl)$)/i, {
        useHash: USE_HASH,
        isHtmlLike: true,
        isWidget: true,
        useSameNameRequire: true,
        useMap: true,
        release: "${pc-project}/${pc-version}/$2",
        deploy: fis.plugin('local-deliver', {
            to: TEMP_DIR
        }),
        domain: ''
      })
      .match(/^\/node_modules\/(.*?)\/(.*?\.)js$/i,{
        useHash: USE_HASH,
        release: "${pc-project}/${pc-version}/j/$1_$2js",
        deploy: fis.plugin('local-deliver', {
            to: STATIC_DIR
        }),
        isMod:!0,
        extras: {
          comboTo:'5'
        }
      })
      .match(/^\/node_modules\/(.*?)\/(?:\1|index)(\.js)$/i,{
        useHash: USE_HASH,
        release: "${pc-project}/${pc-version}/j/$1.js",
        id: "$1",
        moduleId:packageJson.name + ":$1",
        requireId:packageJson.name + ":$1",
        deploy: fis.plugin('local-deliver', {
            to: STATIC_DIR
        }),
        alies:"$1",
        isMod:!0,
        extras: {
          comboTo:'5'
        }
      })
      .match(/^\/node_modules\/(.*?)\/(.*?)\.css/i,{
        useHash: USE_HASH,
        release: "${pc-project}/${pc-version}/c/$1_$2.css",
        deploy: fis.plugin('local-deliver', {
            to: STATIC_DIR
        }),
        isMod:!0,
        extras: {
          comboTo:'5'
        }
      })
      .match(/^\/node_modules\/(.*?)\/\1\.css/i,{
        useHash: USE_HASH,
        release: "${pc-project}/${pc-version}/c/$1.css",
        id: "$1",
        moduleId:packageJson.name + ":$1",
        requireId:packageJson.name + ":$1",
        deploy: fis.plugin('local-deliver', {
            to: STATIC_DIR
        }),
        alies:"$1",
        isMod:!0,
        extras: {
          comboTo:'5'
        }
      })
      .match('/node_modules/pc-require/*.js',{
        isMod:!1,
        extras: {
          comboTo:'-111'
        }
      })
      .match('/node_modules/pc-jquery/*.js',{
        extras: {
          comboTo:'-112'
        }
      })
      .match("*.html", {
        parser: fis.plugin("widget-load", {
            project: fis.get("PCAT.project"),
            tagName: fis.get("PCAT.tagName"),
            mapOutputPath: MAP_DIR,
            templateOutputPath: TEMP_DIR,
            packageOutputPath:PACKAGE_DIR
        })
      })
      .match('**.css', {
        useSprite: true
      })
      .match('**.{sass,scss}', {
        useSprite: true,
        parser: fis.plugin('sass2'),
        rExt: '.css'
      })
      .match('**.less', {
        useSprite: true,
        parser: fis.plugin('less'),
        rExt: '.css'
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
            if(!file.orgInfo)return;
            let content = file.getContent()
            file.setContent(`<!--${file.orgInfo}-->\n${content}`)
            //for server preview
            let hash = file.getHash()
            let root = `/${media}/page/${site}/${file.release.replace('\.html',`_${hash}.html`)}`
            file.extras ? (file.extras.hash = hash,file.extras.path = root) : file.extras = {hash:hash,path:root}
          })
        },
        packager: fis.plugin("widget-render", {
          tagName: fis.get("PCAT.tagName"),
          mapOutputPath: MAP_DIR,
          packageOutputPath:PACKAGE_DIR
        }),
        postpackager: fis.plugin("autocombo",{
          domain: DOMAIN_STATIC,
          combo: fis.get("PCAT.useCombo")
        }),
        spriter: fis.plugin('csssprites')
      })
      .match("/map.json", {
        useHash: false,
        release: "${pc-project}/${pc-version}/$0",
        deploy: fis.plugin('local-deliver', {
            to: MAP_DIR
        })
      })
      .match("/package.json", {
        useHash: false,
        release: "${pc-project}/$0",
        deploy: fis.plugin('local-deliver', {
            to: PACKAGE_DIR
        })
      })
      .match("*.html",{
        // optimizer: 
      })
      .match("*.{js,css,scss,less}",{
        optimizer: staticOrg
      })
      if(media === 'qa' || media === 'ol' || media === 'online'){
        fis
          .match('*.{scss,sass,less,css}', {
            optimizer: [
              fis.plugin('clean-css'),
              staticOrg
            ]
          })
          .match('*.js',{
            optimizer: [
              fis.plugin('uglify-js'),
              staticOrg
            ]
          })
          .match('*.png',{
            optimizer: fis.plugin('png-compressor')
          })
      }
      if(projectType === 'cms' && (media === 'ol'|| media === 'online')){
        fis
          .match(/^\/page\/(.*\/)*([^\/]+\.html$)/i, {
            deploy: [fis.plugin('local-deliver', {
                      to: PAGE_DIR
                    }),fis.plugin('cms', {
                      project: packageJson.name,
                      userName:userName,
                      api:commonConfig.api
                    })]
          })
      }
}
