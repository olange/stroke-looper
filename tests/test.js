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
    .then(function(a){console.log('test 1 ok');},
          function(e){console.error("FAILED: ",e.message);error = e;})
    .end();



webdriverio.remote(options).init().url(urlTest)
    .execute(function(){
        looper.setup('myCanvas', 2000);
        looper.setLifetime(100);
        window.start = 1460480954631;
        var ms = start;
        window.line = looper.newLine(looper.correctNow(new Date(ms)));
        looper.drawPoint(100,50,looper.correctNow(new Date(ms+=50)));
        looper.drawPoint(110,60,looper.correctNow(new Date(ms+=50)));
        looper.drawPoint(120,80,looper.correctNow(new Date(ms+=50)));
        looper.completeLine(looper.correctNow(new Date(ms+=50)));
        return line.exportData().times;        
    }).then(function(ret){ 
        assert.deepEqual([50, 100, 150], ret.value);
    }).execute(function(){
        window.segmentToXy = function(s){return [s.point.x, s.point.y];};
        return line.segmentsToShow(start + 101).map(segmentToXy);
    }).then(function(ret){ 
        assert.deepEqual([[100, 50], [110, 60]], ret.value);
    }).then(function(a){console.log('test 2 ok');},
            function(e){console.error("FAILED: ",e.message);error = e;})
    .end() ;










