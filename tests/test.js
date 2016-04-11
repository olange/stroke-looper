var webdriverio = require('webdriverio');
var assert = require('assert');
var options = {
    desiredCapabilities: {
        browserName: 'firefox'
    }
};
 
var dir = __dirname.substr(0,__dirname.indexOf('tests'));
dir = dir.replace(/\\/g, '/');
var urlIndex = 'file:///' + dir + 'index.html';
var urlTest = 'file:///' + dir + 'test.html';

var error;
webdriverio.remote(options).init().url(urlIndex)
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
    .then(function(a){console.log('tests ok');},
            function(e){console.error("FAILED: ",e.message);error = e;})
    .end();

webdriverio.remote(options).init().url(urlTest)
    //.waitUntil(function(){ return typeof(looper)!== 'undefined' ;})
    .execute(function(){
        looper.setup('myCanvas', 2000);
        var line = looper.newLine(looper.correctNow(Date.now()));
        
        setTimeout(function(){
            looper.drawPoint(100,50,looper.correctNow(Date.now()));
        }, 500);
        setTimeout(function(){
            looper.drawPoint(150,100,looper.correctNow(Date.now()));
        }, 600);
        setTimeout(function(){
            looper.drawPoint(250,100,looper.correctNow(Date.now()));
        }, 700);
        setTimeout(function(){
            looper.completeLine(looper.correctNow(Date.now()));
        }, 800);
        setTimeout(function(){
            console.log(line.exportData());
        }, 900);
    })
    .pause(10000)
    .then(function(a){console.log('tests ok');},
          function(e){console.error("FAILED: ",e.message);error = e;})
    .end();
