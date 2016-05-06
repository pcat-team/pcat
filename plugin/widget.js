  var path = require("path");
  var fs = require('fs');

  var fse = require("fs-extra");

  var projectDir = fis.project.getProjectPath()

  var wPageDir = path.resolve(projectDir, "page", "_wlist", "wpage");

  // 先清空wapge
  fse.removeSync(wPageDir);

  //get list
  var wDir = path.resolve(projectDir, './widget')
  var dirs = fs.readdirSync(wDir)
  if (!dirs) return content;

  var listW = {};

  dirs.forEach(function(name) {

      var widgetPath = path.resolve(wDir, name);


      if (fis.util.isDir(widgetPath)) {
          if (!listW[name]) listW[name] = {};

          fs.readdirSync(widgetPath).forEach(function(version) {

              var versionPath = path.resolve(widgetPath, version);

              if (fis.util.isDir(versionPath)) {

                  // 每个版本的package.json
                  var versionPackPath = path.resolve(versionPath, "package.json");

                  if (!fis.util.exists(versionPackPath)) {
                      fis.log.error('组件[%s]版本[%s]缺少package.json文件，请添加后再编译！', name, version);
                  }

                  var config = require(versionPackPath);


                  var obj = {
                      author: config.author,
                      des: config.des,
                      url: "./wpage/" + name + "/" + version + "/index.html?cms=true"
                  }

                  listW[name][version] = obj;


                  // 同时创建组件页面，用于展示组件
                  var wPagePath = path.resolve(wPageDir, name, version, "index.html");

                  var wpcontent = fis.util.read("./page/_wlist/tmp/wp-temp.html").replace("__LIST_PAGE_WIDGET_HOLDER__", "<widget name='" + name + "' version='" + version + "' _wlist='true'></widget>")

                  fse.outputFileSync(wPagePath, wpcontent)


              }
          })

      }
  })

fis.set("__WIDGETALLLISTS__",listW);