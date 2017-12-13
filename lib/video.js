
var auth = require('./auth')
var ora = require('ora')
var qiniu = require('qiniu')
var path = require('path')
var regex = require('filename-regex')
var async = require("async")
var fs = require('fs')
var storage = require('./storage')
var axios = require('axios')
var colors = require('colors')

var URL = process.env.URL || 'http://xiedaimala-cli.hunger-train.com'


function upload(){

    auth.login().then(function(){
      console.log('uploading...')
      uploadStart()
    })

}

function showHistory(days, isAll, user){
    var days = days || 1
    var text = `Get the last ${days} day's upload history`
    console.log(text)
    auth.login().then(function(){
      axios.get(`${URL}/video/show`, {
          params: {
              email: storage.getItemSync('email'),
              password: storage.getItemSync('password'),
              days: days||1,
              isAll: isAll||false,
              user: user||''
          }
      }).then(function(response){
        if(response.data.data.length === 0) {
          console.log('You have not uploaded the video yet')
          return
        }
        var data = []
        response.data.data.forEach(function(obj){
          data.push([obj.email, obj.video_url, new Date(+obj.upload_at).toLocaleString()])
        })

        console.log(colors.grey(' Video List:'))
        data.forEach(function(line, index){
            console.log(` |__ ${index}: ${line[2]}  ${line[0]} `)
          line[1].split(',').forEach(function(video){
            console.log(`     |-- ${video.trim()}`)
          })
          console.log(``)
        })
        //console.log(output)
        
      }).catch(function(){
        console.log('Get history fail')
      })   
    }).catch(function(){
      console.log('login fail, try again')
    })

}




function uploadStart(){
    var saveDir = storage.getItemSync('config_upload_folder')
    saveDir = saveDir? saveDir:process.cwd()
    var dir = fs.readdirSync(saveDir).filter(function(name){
        return /(jpg)|(png)|(gif)|(jpeg)|(mp4)|(flv)|(mov)|(m3u8)|(ts)$/i.test(name) 
            && !/^\./.test(name) 
            &&fs.lstatSync(path.join(saveDir,name)).isFile() 
            &&!storage.getItemSync('uploadFile_' + name, true)
    }).map(function(name){
        return path.resolve(saveDir, name)
    })

    console.log('Videos to upload:', dir)
    try{
        var prefix = storage.getItemSync('email').match(/(.+)@/)[1]+'_'
    }catch(e){
        var prefix = 'nobody_'
    }
    
    async.eachSeries(dir, function(path, callback){

      var fileName = path.match(regex())[0]
      var key = prefix? prefix + fileName : fileName

      getUploadToken(key).then(function(uploadToken){
        uploadFile(path, key, uploadToken, callback)
      }).catch(function(err){
        console.log(err)
        callback('Get upload token fail....')
      })
        
    }, function(err){
        if(err){
            console.log(err)
        }else{
            console.log('finish')
        }
    })


}

function getUploadToken(fileName){
  return new Promise(function(resolve, reject){
    axios.get(`${URL}/video/getToken`, {
        params: {
            email: storage.getItemSync('email'),
            password: storage.getItemSync('password'),
            filename: fileName
        }
    }).then(function(response){
      if(response.data.status === 'ok'){
        resolve(response.data.uploadToken)
      }else{
        console.log('Get upload token fail', fileName)
        reject('Get upload token fail...')
      }
    }).catch(function(){
      console.log('add to server history fail')
      reject('Get upload token fail..')
    })      
  })
}

function uploadFile(localFile, key, uploadToken, callback){
    var fileName = localFile.match(regex())[0]
    var config = new qiniu.conf.Config();
    config.zone = qiniu.zone.Zone_z0;
    config.useCdnDomain = true;
    var resumeUploader = new qiniu.resume_up.ResumeUploader(config);
    var putExtra = new qiniu.resume_up.PutExtra();
    // 如果指定了断点记录文件，那么下次会从指定的该文件尝试读取上次上传的进度，以实现断点续传
    putExtra.resumeRecordFile = path.resolve(__dirname,'../storage/progress.log');
    putExtra.progressCallback = function(uploadBytes, totalBytes) {
      console.log("progress:" + ((uploadBytes /totalBytes)*100).toFixed(2) + '%' );
    }

    // 文件分片上传
    resumeUploader.putFile(uploadToken, key, localFile, putExtra, function(respErr,
      respBody, respInfo) {
      if (respErr) {
        callback(respErr)
        //throw respErr
      }

      if (respInfo.statusCode == 200) {
        var url = 'https://video.jirengu.com/' + respBody.key
        console.log(`Upload success: ${url}`)
        storage.setItemSync('uploadFile_' + fileName, {url: url, uploaded_at: Date.now()})
        
        axios.get(`${URL}/video/add`, {
            params: {
                email: storage.getItemSync('email'),
                password: storage.getItemSync('password'),
                video_url: url,
                upload_at: new Date().getTime()
            }
        }).then(function(response){
          console.log('add to server history success')
          if(response.data.status === 'ok'){
            callback(null, respBody)
          }else{
            console.log('add to server history fail')
            callback(null, respBody)
          }
        }).catch(function(){
          console.log('add to server history fail')
          callback(null, respBody)
        })  

      } else {
        console.log(respBody);
        callback('error', respBody)
      }
    });        
}


module.exports = {
    upload: upload,
    showHistory: showHistory
}