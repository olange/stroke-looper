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
        var ass = chai.assert;
        var duration = 2000;
        var lifetime = 100;
        looper.setup('myCanvas', duration);
        looper.setLifetime(lifetime);
        var start = 1460480954631;
        var ms = start;
        var l = looper.newLine(looper.correctedNow(new Date(ms)));
        looper.drawPoint(100,50,looper.correctedNow(new Date(ms+=50)));
        looper.drawPoint(110,60,looper.correctedNow(new Date(ms+=50)));
        looper.drawPoint(120,80,looper.correctedNow(new Date(ms+=50)));
        looper.completeLine(looper.correctedNow(new Date(ms+=50)));
        var data = l.exportData();        
        ass.deepEqual([50, 100, 150], data.times);

        var segmentsAt = function(line, time){
            return line.segmentsToShow(time).map(function(s){
                return [s.point.x, s.point.y]; });
        };
        ass.deepEqual([], segmentsAt(l, start + 49));
        ass.deepEqual([[100, 50]], segmentsAt(l, start + 50));
        ass.deepEqual([[100, 50]], segmentsAt(l, start + 50 - duration));
        ass.deepEqual([[100, 50], [110, 60]], segmentsAt(l, start + 100));
        ass.deepEqual(
            [[100, 50], [110, 60]], segmentsAt(l, start + 100 + duration));
        ass.deepEqual([[110, 60], [120, 80] ], segmentsAt(l, start + 150));
        ass.deepEqual([[120, 80]], segmentsAt(l, start + 200));
        ass.deepEqual([], segmentsAt(l, start + 250));
        
    }).then(function(r){console.log(r.value || '', 'test 2 ok');},
            function(e){console.error("FAILED: ",e.message);error = e;})
    .end() ;










