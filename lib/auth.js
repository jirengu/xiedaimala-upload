var Prompt = require('prompt-base');
var PromptPwd = require('prompt-password');
var ora = require('ora');
var axios = require('axios')
var storage = require('./storage')

var URL = process.env.URL || 'http://xiedaimala-cli.hunger-train.com'


var promptEmail = new Prompt({
  prefix: '✨ ',
  name: 'email',
  message: 'email:'
});

var promptPassword = new PromptPwd({
  type: 'password',
  prefix: '✨ ',
  name: 'password',
  message: 'password:',
  mask: function(input) {
    return new Array(String(input).length).join('*');
  }
});



function inputLogin(email, password){
  return new Promise(function(resolve, reject){
    console.log('input xiedaimala.com \'s email and password')
    promptEmail.ask(function(email) {
      promptPassword.ask(function(password){
        var spinner = ora('logging in...').start();
        axios.post(`${URL}/auth/login`, {
          email: email,
          password: password
        }).then(function(response){
          spinner.succeed('login success')
          if(response.data.status === 'ok' && response.data.uploadToken){
            global.uploadToken = response.data.uploadToken
            resolve('ok')
            storage.setItemSync('email', email, {ttl: 1000 * 60* 60*24*7});
            storage.setItemSync('password', password, {ttl: 1000 * 60* 60*24*7});             
          }else {
            reject()
          }
          
        }).catch(function(){
          spinner.fail('login local fail, try again')
          reject()
        })
      })
    })    
  })
}

function localLogin(email, password){
  return new Promise(function(resolve, reject){
    var spinner = ora('logging in...').start();
    axios.post(`${URL}/auth/login`, {
      email: storage.getItemSync('email'),
      password: storage.getItemSync('password')
    }).then(function(response){
      spinner.succeed('login success')
      if(response.data.status === 'ok' && response.data.uploadToken){
        global.uploadToken = response.data.uploadToken
        resolve('ok')           
      }else {
        reject()
      }
    }).catch(function(){
      spinner.fail('input login fail, try again')
      reject()
    })
  })
}

function login(email, password){
  return new Promise(function(resolve, reject){
    if(storage.getItemSync('email') && storage.getItemSync('password')){
      localLogin(email, password).then(resolve).catch(reject)
    }else{
      inputLogin(email, password).then(resolve).catch(reject)
    }
  })

}




module.exports = {
  login: login,
  inputLogin, inputLogin
}
