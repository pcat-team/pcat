  var path = require("path");
  var fs = require('fs');

  var fse = require("fs-extra");

  var request = require('request');


  exports.load = function(opt) {
      // console.log(opt)

      fis.match('*.html', {

          parser: function(content, file) {

              var fileReg = /<!--#include\svirtual="([^"]+)"\s*-->/gim;


              content = content.replace(fileReg, function(ret, src) {

                  // 指定域名
                  if(opt.ssiDomain && opt.ssiDomain[src]){
                      ssiDomain = opt.ssiDomain[src];

                      // 全站
                  }else if(src.split("/")[1] == "global_ssi"){
                     ssiDomain = "http://www." + opt.site + ".com.cn"
                  }else{
                        fis.log.error("请在fis-config.js配置文件中指定 SSI [" + src + "]的域名！")
                  }


                  var file = path.resolve(fis.project.getProjectPath(), "ssi", "." + src)




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


              });


              // console.log(content)
              return content;
          }
      })

  }
