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
 *     dev : '' //开发时服务器的域名 http://my.pconline.com.cn || ''
 *   },
 *   packageJson: {} //子系统的 package json 对象
 * }
 */
fis.pcat = function(option) {
        var fis = this
        var commonConfig = { api: 'dev6.pconline.com.cn:8002' }



        const _now = new Date

        const projectDir = fis.project.getProjectPath()
        const orgInfo = `path:\${pc-project}$0  tag:${releaseConfig.tag||''}  update by ${releaseConfig.author||''} at ${_now.toLocaleString()}`
        const staticOrg = function(content, file, conf) {
            return `/*! ${file.release}*/\n${content}`
        }
        const packageJson = option.packageJson
        const site = packageJson.site || path.resolve(projectDir, "../").split(path.sep).pop()

        const domain = {
            dev: option.domain.dev,
            qa: {
                'static': 'http://ue.pc.com.cn',
                'img': 'http://ueimg.pc.com.cn',
                'page': 'http://zzpcat.' + site + '.com.cn/qa/page',
                'tpl': 'http://zzpcat.' + site + '.com.cn/qa/tpl'
            },
            ol: {
                'static': 'http://ue.3conline.com',
                'img': 'http://ueimg.3conline.com',
                'page': 'http://zzpcat.' + site + '.com.cn/ol/page',
                'tpl': 'http://zzpcat.' + site + '.com.cn/ol/tpl'
            },
            online: {
                'static': 'http://ue.3conline.com',
                'img': 'http://ueimg.3conline.com',
                'page': 'http://zzpcat.' + site + '.com.cn/online/page',
                'tpl': 'http://zzpcat.' + site + '.com.cn/online/tpl'
            }
        }

        const tempPath = fis.project.getTempPath()
    
        const useWigetList = fis.project.currentMedia() === 'list'
        const media = useWigetList ? 'dev' : (fis.project.currentMedia() || 'dev')

        // 设置输出路径 
        // const outputDir     =  media === 'dev' ? path.resolve(tempPath, "www") : '/data/web/pcat/'

        const outputDir = path.resolve(tempPath, "www")

        const MAP_DIR = path.resolve(outputDir, './' + media, "./map", './' + site)
        const PACKAGE_DIR = path.resolve(outputDir, './' + media, "./package", './' + site)
        const STATIC_DIR = path.resolve(outputDir, './' + media, "./static", './' + site)
        const TEMP_DIR = path.resolve(outputDir, './' + media, "./template", './' + site)
        const PAGE_DIR = path.resolve(outputDir, './' + media, "./page", './' + site)

        const DOMAIN = domain[media]

        const DOMAIN_STATIC = media === 'dev' ? DOMAIN + '/dev/static/' + site : DOMAIN.static + '/' + site
        const DOMAIN_JS_CSS = media === 'dev' ? DOMAIN_STATIC : DOMAIN.static + '/' + site
        const DOMAIN_IMG = media === 'dev' ? DOMAIN_STATIC : DOMAIN.img + '/' + site
        const DOMAIN_TEMP = media === 'dev' ? DOMAIN + '/dev/tpl/' + site : DOMAIN.tpl + '/' + site
        const DOMAIN_PAGE = media === 'dev' ? DOMAIN + '/dev/page/' + site : DOMAIN.page + '/' + site


        const USE_HASH = option.useHash ? !0 : (media === 'dev' ? !1 : !0)
            // const USE_HASH = !1

    // 组件预览相关
        const WLIST_PAGE_DIR = path.resolve(projectDir, './page/_wlist')
        const WLIST_HTML_PATH = 'page/_wlist/_wlist.html'
        const wListTemp = `
    <!--<%@page pageEncoding="GBK" %><%@include file="/templateInclude.jsp" %>
    <%--cms_config--
    {preview : {userName:'moyingchao',previewType:'channel',channelName:'软件专题', charsetName:'utf-8',fromCache:'n'}
    }
    --/cms_config--%>--><!-- @require common:pc-require --><!-- @require common:pc-config -->
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <title>组件预览</title>
    <link rel="stylesheet" href="http://zzsvn.pconline.com.cn/svn/zt/pc/gz/cenjinchao/wlist/_wlist.css">
    <!--COMBO_CSS-->
    </head>
    <body>
    <div id="JLeft"></div>
    <div id="JRight"></div>
    <textarea type="text/html" id="JWtemp" style="display:none">
    {{ALL_WIDGET}}
    </textarea>
    <script> 
    var wJson = new Function('var _a = '+ document.querySelector('#JWtemp').innerHTML.replace(/\\\${/g,'\\\\\${').replace(/\\&lt\\;/g,'<').replace(/\\&gt\\;/g,'>')+';return _a;')()

    </script>
    <script src="http://zzsvn.pconline.com.cn/svn/zt/pc/gz/cenjinchao/npm-r/react/index.js"></script>
    <script src="http://zzsvn.pconline.com.cn/svn/zt/pc/gz/cenjinchao/npm-r/react-dom/index.js"></script>
    <script src="http://zzsvn.pconline.com.cn/svn/zt/pc/gz/cenjinchao/wlist/_wlist.js"></script>
    <!--COMBO_JS-->
    </body>
    </html>`
  const _loadAllWidgets  = function(content,file,settings){
    //get list
    let wDir = path.resolve(projectDir,'./widget')
    let dirs = fs.readdirSync(wDir)
    if(!dirs)return content;

    dirs = dirs.map(function(name,i){
      if(!fis.util.isDir(path.resolve(wDir,'./'+name)))return '';
      return `"${name}":{
        content: \`<widget name="${name}"></widget>\`
      }`
    }).filter(function(value){
      if(value)return value
    })
    return content.replace(/{{ALL_WIDGET}}/g,`{${dirs.join(',')}}`)
  }
  useWigetList && !fis.util.exists(WLIST_PAGE_DIR) && (()=>{
    fs.mkdirSync(WLIST_PAGE_DIR)
    fis.util.write(path.resolve(WLIST_PAGE_DIR,'./_wlist.html'),wListTemp)
  })()
  // fis.util.exists(WLIST_PAGE_DIR) && fis.util.write(path.resolve(WLIST_PAGE_DIR,'./_wlist.html'),wListTemp)
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

     .match(/^\/page\/(.*?\/.*?\.(js)$)/i,{
     release: "${pc-project}/p/$1",
        useHash: USE_HASH,
        deploy: fis.plugin('local-deliver', {
            to: STATIC_DIR
        }),
        parser:function(content,file){
          return `;(function (window,document,undefined){\n${content}\n})(window,document);`
        },
        extras: {
          comboTo:'6',
          comboOrder:3
        }
    })
  .match(/^\/page\/(.*?\/.*?\.(css|less|scss|sass)$)/i,{
     release: "${pc-project}/p/$1",
        useHash: USE_HASH,
        deploy: fis.plugin('local-deliver', {
            to: STATIC_DIR
        }),
        extras: {
          comboTo:'6',
          comboOrder:3
        }
    })
   .match(/^\/page\/(.*?\/.*?\.(html)$)/i,{
     release: "${pc-project}/$1",
      useHash: USE_HASH,
      useSameNameRequire: true,
      isPage: true,
      extras: {
          isPage: true
      },
      useMap: true,
      deploy: fis.plugin('local-deliver', {
          to: PAGE_DIR
      }),
      domain:DOMAIN_PAGE,
      orgInfo:orgInfo
    })
   
    .match(/^\/page\/(.*?\/.*?\.(jpg|png|gif)$)/i,{
     release: "${pc-project}/p/$1",
        useHash: USE_HASH,
        useMap:!0,
        deploy: fis.plugin('local-deliver', {
            to: STATIC_DIR
        }),
        domain:DOMAIN_IMG
    })
   
    .match(/^\/widget\/(.*?\/.*?\.(js)$)/i,{
     release: "${pc-project}/w/$1",
      useHash: USE_HASH,
      deploy: fis.plugin('local-deliver', {
          to: STATIC_DIR
      }),
      // id:'widget/$2',
      parser:function(content,file){
        return `;(function (window,document,undefined){\n${content}\n})(window,document);`
      },
      isMod:!1,
      extras: {
        comboTo:'6',
        comboOrder:2
      }
    })
      .match(/^\/widget\/(.*?\/.*?\.(css|less|scss|sass)$)/i,{
      release: "${pc-project}/w/$1",
      useHash: USE_HASH,
      deploy: fis.plugin('local-deliver', {
          to: STATIC_DIR
      }),
      extras: {
        comboTo:'6',
        comboOrder:1
      }
    })
     .match(/^\/widget\/(.*?\/.*?\.(jpg|png|gif)$)/i,{
      release: "${pc-project}/w/$1",
        useHash: USE_HASH,
        deploy: fis.plugin('local-deliver', {
            to: STATIC_DIR
        }),
        domain:DOMAIN_IMG
    })
    .match(/^\/widget\/(.*?\/.*?\.(html|tpl)$)/i,{
      release: "${pc-project}/$1",
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
    .match(/^\/modules\/(.*?\/.*?\.(js|css|jpg|png|gif)$)/i,{
      useHash: USE_HASH,
      release: "${pc-project}/m/$1",
      deploy: fis.plugin('local-deliver', {
          to: STATIC_DIR
      }),
      id:"$1",
      isMod:!0,
      extras: {
        comboTo:'5'
      }
    })
   
    .match('/modules/pc-config/*.js',{
      isMod:!1,
      extras: {
        comboTo:'5'
      }
    })
    .match('/modules/pc-require/*.js',{
      isMod:!1,
      id:"pc-require",
      extras: {
        comboTo:'-111'
      }
    })
    .match('/modules/jquery/*.js',{
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
          let root = `/${media}/page/${site}${media ==='dev' ? file.release : file.release.replace('\.html',`_${hash}.html`)}`
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
      release: "${pc-project}/$0",
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
    .match("*.{js,css,scss,less}",{
      optimizer: staticOrg
    })
    if(useWigetList){
      fis
        .match(WLIST_HTML_PATH,{
        parser:[_loadAllWidgets,fis.plugin("widget-load", {
            project: fis.get("PCAT.project"),
            tagName: fis.get("PCAT.tagName"),
            mapOutputPath: MAP_DIR,
            templateOutputPath: TEMP_DIR,
            packageOutputPath:PACKAGE_DIR
        })]
      })
    }else{
      fis.match(WLIST_HTML_PATH,{
        parser:[],
        release: !1
      })
    }
    
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
    if(!!userName && (media === 'ol'|| media === 'online')){
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
