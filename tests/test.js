var webdriverio = require('webdriverio');
var assert = require('assert');
// var selenium = require('selenium-standalone');
// selenium.start(function(err, child) {
//     console.log(err);
//   // child.stderr.on('data', function(data){
//   //   console.log(data.toString());
//   // });
// });

var options = {
    desiredCapabilities: {
        browserName: 'firefox'
    }
};
 
var dir = __dirname.substr(0,__dirname.indexOf('tests'));
dir = dir.replace(/\\/g, '/');
var urlIndex = 'file:///' + dir + 'index.html';
var urlBrowserTest = 'file:///' + dir + 'browserTests.html';
var client = webdriverio.remote(options).init();

client = client.url(urlIndex)
    .title(function(err,res) {
        assert.equal(res.value,'stroke looper');
    })
    .then().moveToObject('#myCanvas',10,20)
    .buttonDown()
    .moveToObject('#myCanvas',20,50)
    .moveToObject('#myCanvas',30,70)
    .buttonUp()
    .execute(function(){ return looper.exportData();})
    .then(function(ret){ 
        var data = ret.value;
        assert.equal(1, data.lineData.length);
        var line = data.lineData[0];
        assert.equal(2, line.segments.length);
        //console.log(line.segments);
        assert.deepEqual([20,50], line.segments[0]);
        assert.deepEqual([30,70], line.segments[1]);
    })
    .then(function(a){console.log('test 1 ok');},
          function(e){console.error("FAILED: ",e.message);});


var redirectLogToVar = function(){
    window.logMessage = "";
    window.log = function(){
        var message = Array.prototype.slice.call(arguments).join('\n');
        logMessage += (logMessage ? "\n" : "") + message; 
    };
};
var returnLog = function(){ return logMessage; };
var runBrowserTest = function(client, testFunction){
    return client = client.url(urlBrowserTest)
        .execute(redirectLogToVar)
        .execute(testFunction)
        .execute(returnLog)
        .then(function(r){if(r.value){ console.log(r.value);}},
              function(e){console.error("FAILED:", e.message);});
};
//client = runBrowserTest(client, function(){normalCurve();});
client = runBrowserTest(client, function(){allTests();});


client.end() ;
