#! /usr/bin/env node

var _ = require('lodash');
var program = require('commander');
var colors = require('colors');





var auth = require('../lib/auth')
var video = require('../lib/video')

var pkg = require('../package.json');

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
    .action(function(options){
      video.showHistory(options.days, options.all)
    }).on('--help', function(){
      console.log('  Examples:')
      console.log()
      console.log(colors.green('    $') + ' xdml history')
      console.log(colors.green('    $') + ' xdml history -d 2')
      console.log(colors.green('    $') + ' xdml history -d 10 -a')
      console.log()
    })



// Parse and fallback to help if no args
if(_.isEmpty(program.parse(process.argv).args) && process.argv.length === 2) {
    program.help();
}