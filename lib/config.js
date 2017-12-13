var storage = require('./storage')
var fs = require('fs')
var colors = require('colors')
var path = require('path')

function setUpload(dir){
  fs.stat(path.resolve(dir), function(err, stats){
    if(err||!stats.isDirectory()){
      console.log(colors.red('Set path Error:') + ' file path is invalid')
    }else{
      storage.setItemSync('config_upload_folder', path.resolve(dir))
      console.log('save upload path success')
    }
  })
}

function clearCache(){
  storage.forEach(function(key, value){
    if(/^uploadFile_/.test(key)){
      storage.removeItemSync(key)
    }
    console.log('remove cache finish')
  })
}

module.exports = {
  setUpload: setUpload,
  clearCache: clearCache
}
