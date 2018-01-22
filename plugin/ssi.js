  var path = require("path");
  var fs = require('fs');

  var fse = require("fs-extra");

  var request = require('request');


  module.exports = function(ret, conf, settings, opt) {
      // ret.src 所有的源码，结构是 {'<subpath>': <File 对象>}
      // ret.ids 所有源码列表，结构是 {'<id>': <File 对象>}
      // ret.map 如果是 spriter、postpackager 这时候已经能得到打包结果了，
      //         可以修改静态资源列表或者其他
    
      // if(fis.project.currentMedia())


      fis.util.map(ret.src, function(subpath, file) {
          if (file.isPage) {
              var content = file.getContent();
              // 通过<!--#include virtual="" -->引入
              var virtualReg = /<!--#include\s+virtual\s*=\s*(["'])([^"']+)\1\s*-->/gim;

              content.replace(virtualReg, function(ret, split, src) {

                  downLoad(src);
              });

              // 通过<%@ include file="" %>引入
              var fileReg = /<%@\s*include\s*file\s*=\s*(["'])([^"']+)\1\s*%>/gim;

              content.replace(fileReg, function(ret, split, src) {

                  downLoad(src);
              });
          }
      })
  }


  //匹配标签的属性和值 k=v
  var prostr = /(\S+)\s*\=\s*(("[^"]*")|('[^']*'))/gi;

  // 获取属性对象
  function getPropsObj(props) {
      var obj = {};

      if (props) {
          var propsArr = props.trim().match(prostr);


          obj = require("querystring").parse(propsArr.join("&").replace(/["']/g, ""));

      }

      return obj;
  }




  function downLoad(src) {
      var opt =  fis.get("PCATOPTION");

      // 指定域名
      if (opt.ssiDomain && opt.ssiDomain[src]) {
          ssiDomain = opt.ssiDomain[src];

          // 全站
      } else if (src.split("/")[1] == "global_ssi") {

          if (opt.site == "geeknev") {
              ssiDomain = "http://www." + opt.site + ".com";
          } else {
              ssiDomain = "http://www." + opt.site + ".com.cn";
          }
      } else {
          fis.log.error("请在fis-config.js配置文件中指定 SSI [" + src + "]的域名！")
      }


      var file = path.resolve(fis.project.getProjectPath(), "_ssi", "." + src)


      var url = ssiDomain + src;
      request(url, function(error, response, body) {

          if (!error && response.statusCode == 200) {
              // console.log(body) // Show the HTML for the Google homepage.

              // 目前通过这种判断个别404页面
              if (response.request.headers.referer) {
                  console.log("SSI地址[" + url + "]404啦！")

                  return;
              }

              fse.outputFile(file, body, function(err) {})
          } else {
              console.log("SSI 对应的地址[" + url + "]404啦！")
          }


      })
  }