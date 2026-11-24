// console.log(" Hello , Node js!");

// const {createServer} = require('node:http');

// const hostname = '127.0.0.1';
// const port = 3000;

// const server  = createServer((req, res) => {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plan');
//     res.end('hello world');
// });

// server.listen(port, hostname , () => {
//     console.log('server running at http://${hostname}:${port}');
// });

// const log = document.querySelector(".event-log");

// document.querySelector("#xhr").addEventListener("click", ()=>{
//     log.textContent = "";

//     const xhr = new XMLHttpRequest();

//     xhr.addEventListener("loadend", () =>{
//         log.textContent = `${log.textContent}Finished with status: ${xhr.status}`;
//     });

//     xhr.open("GET", 

//         "https://raw.githubusercontent.com/mdn/content/main/files/en-us/_wikihistory.json",

//     );
//     xhr.send();
//     log.textContent = `${log.textContent}Started XHR request\n`;

// });
// document.querySelector("#reload").addEventListener("click",() =>{
//     document.querySelector("#reload").addEventListener("click", ()=>{
//         log.textContent = "";
//         document.location.reload();
//     });
// } )

// function successCallback(result) {
//     console.log('audio file ready at URL: ${result}');    
// }
// function failureCallback(error) {
//     console.error('error generating audio file: ${error}');    
// }
// createAudioFileAsync(audioSettings, successCallback, failureCallback);

// function say(name) {
//     console.log('HELLO'+ name);
// }
// setTimeout();
// clearTimeout();

// setInterval();
// clearInterval();
// var mess= '';
// console.log(global.mess);
// console.log(module)

// var url = 'http://myvlogger.io/log';

// function log(message){
//     console.log(message);
// }

// module.exports.log = log;
// module.exports.endPoint = url;

// const  log = require('./logger');

// // console.log(logger);

// log('message');

// (function (exports, require, module, _filename, _dirname){
   
// var url = 'http://myvlogger.io/log';

// function log(message){
//     console.log(message);
// }

// module.exports = log;

// module.exports.log = log;

// module.exports.log = log;
// exports.log = log;

// exports = log;
// })

// const path = require('path');

// var pathObj = path.parse(__filename);

// console.log(pathObj);

// const os = require('os');
// var totalMemory = os.totalmem();
// var freeMemory = os.freemem();

// console.log('Total Memory: '+ totalMemory);
// console.log(freeMemory);

// console.log('Total Memory: ${totalMemory}');
// console.log('Free Memory: ${freeMemory}');

// const fs = require('fs');

// const files = fs.readdirSync('./');
// console.log(files);


// fs.readdir('$', function(err, files){
//     if(err) console.log('Error', err);
//     else console.log('result', files);
// })


const EventEmitter  = require('events');
const emitter = new EventEmitter();

emitter.on('message',function(){
    console.log('listner called');
});
emitter.emit('messageLogged');




 