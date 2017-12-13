#! /usr/bin/env node

var _ = require('lodash')
var program = require('commander')
var colors = require('colors')
var auth = require('../lib/auth')
var video = require('../lib/video')
var config = require('../lib/config')
var pkg = require('../package.json')
var version = require('latest-version');

version(pkg.name).then(function(version) {
  if(version !== pkg.version){
    console.log(`Latest version is ${colors.green(version)}, but your version is too old (${colors.grey(pkg.version)}) `)
    console.log(`Run ${colors.green(`npm install -g ${pkg.name}`)} to update your cli, before use it`)
  }else{
    bootstrap()
  }
}).catch(function(){
  bootstrap()
})


function bootstrap(){
  program.version(pkg.version)

  program
      .command('upload')
      .description('Upload all the videos in the current folder')
      .action(function(){
          video.upload()
      });

  program
      .command('login')
      .description('Login xiedaimala.com account')
      .action(function(){
        auth.inputLogin().then(function(){
        }).catch(function(){
          console.log('login fail')
        })
      })


  program
      .command('history')
      .description('Show uploaded history')
      .option("-d, --days [count]", "Upload history in recent days, the default is one day")
      .option("-a, --all ", "Show all users' upload history")
      .option("-u, --user [email]", "Show user's upload history")
      .action(function(options){
        video.showHistory(options.days, options.all, options.user)
      }).on('--help', function(){
        console.log('  Examples:')
        console.log()
        console.log(colors.green('    $') + ' xdml history')
        console.log(colors.green('    $') + ' xdml history -d 2')
        console.log(colors.green('    $') + ' xdml history -d 10 -a')
        console.log(colors.green('    $') + ' xdml history -u hunger')
        console.log()
      })

  program
      .command('set')
      .description('set upload folder')
      .option("-d, --dir [folderpath]", "Set the folder path as the upload directory")
      .action(function(options){
        if(!options.dir){
          console.log(colors.red('Parameter error:') + ' you should use `-d folderpath` to set upload directory')
        }else {
          config.setUpload(options.dir)
        }
      }).on('--help', function(){
        console.log('  Examples:')
        console.log()
        console.log(colors.green('    $') + ' xdml set -d /Users/hunger/videos/')
        console.log()
      })

  program
      .command('clear')
      .description('clear local uploaded files\'  local cache')
      .action(function(){
        config.clearCache()
      }).on('--help', function(){
        console.log('  Examples:')
        console.log()
        console.log(colors.green('    $') + ' xdml clear')
        console.log()
      })



  // Parse and fallback to help if no args
  if(_.isEmpty(program.parse(process.argv).args) && process.argv.length === 2) {
      program.help();
  } 
}

