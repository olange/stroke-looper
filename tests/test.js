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
var urlBrowserTest = 'file:///' + dir + 'browserTests.html';
var client = webdriverio.remote(options).init();
var runBrowserTest0 = function(client, url, testName, testFunction){
    if(url){
       client = client.url(url);
    }
    return client
        .execute(testFunction)
        .then(function(r){console.log(r.value || '', testName, 'OK');},
              function(e){console.error(testName, "FAILED:", e.message);});
};

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

var setupLooper = function(){
    window.ass = chai.assert;
    window.duration = 2000;
    var lifetime = 100;
    looper.setup('myCanvas', duration);
    looper.setLifetime(lifetime);
    window.segmentsAt = function(line, time){
        return line.segmentsToShow(time).map(function(s){
            return [s.point.x, s.point.y]; });
    };
    window.logmessage = "";
    window.log = function(message){
        window.logmessage += message + "\n"; 
    };
    //for testing in browser
    //window.log = console.log.bind(console)
};

var runBrowserTest = function(client, testFunction){
    return client = client.url(urlBrowserTest)
        .execute(function(){ redirectLogToVar(); })
        .execute(testFunction)
        .execute(function(){ return logMessage; })
        .then(function(r){if(r.value){ console.log(r.value);}},
              function(e){console.error("FAILED:", e.message);});
};
//client = runBrowserTest(client, function(){normalCurve();});
client = runBrowserTest(client, function(){allTests();});

client = runBrowserTest0(client, urlTest, 'set up looper', setupLooper);
client = runBrowserTest0(client, null, 'normal curve', function(){
    var start = 1460480954631;
    var ms = start;
    var l = looper.newLine(looper.correctedNow(new Date(ms)));
    looper.drawPoint(100,50,looper.correctedNow(new Date(ms+=50)));
    looper.drawPoint(110,60,looper.correctedNow(new Date(ms+=50)));
    looper.drawPoint(120,80,looper.correctedNow(new Date(ms+=50)));
    looper.completeLine(looper.correctedNow(new Date(ms+=50)));
    var data = l.exportData();        
    ass.deepEqual([50, 100, 150], data.times);
    ass.equal(2000, data.lineDuration);

    ass.deepEqual([], segmentsAt(l, start + 49));
    ass.deepEqual([[100, 50]], segmentsAt(l, start + 50));
    ass.deepEqual([[100, 50]], segmentsAt(l, start + 50 - duration));
    ass.deepEqual([[100, 50], [110, 60]], segmentsAt(l, start + 100));
    ass.deepEqual(
        [[100, 50], [110, 60]], segmentsAt(l, start + 100 + duration));
    ass.deepEqual([[110, 60], [120, 80] ], segmentsAt(l, start + 150));
    ass.deepEqual([[120, 80]], segmentsAt(l, start + 200));
    ass.deepEqual([], segmentsAt(l, start + 250));
    
});

client = runBrowserTest0(client, null, 'reversed curve', function(){
    var start = 1460480954631;
    var now = start;

    var l = looper.newLine(looper.correctedNow(new Date(now)));
    looper.drawPoint(100,50,looper.correctedNow(new Date(now+=50)));
    looper.drawPoint(110,60,looper.correctedNow(new Date(now+=50)));
    looper.drawPoint(120,80,looper.correctedNow(new Date(now+=50)));
    looper.completeLine(looper.correctedNow(new Date(now+=50)));
    var data = l.exportData();        
    ass.deepEqual([50, 100, 150], data.times);
    
    var corNow = looper.correctedNow(new Date(now+=duration-200));
    corNow = looper.correctedNow(new Date(now+=49));
    ass.deepEqual([], segmentsAt(l, corNow));
    corNow = looper.correctedNow(new Date(now+=50));
    ass.deepEqual([[100, 50]], segmentsAt(l, corNow));
    corNow = looper.correctedNow(new Date(now+=50));
    ass.deepEqual([[100, 50], [110, 60]], segmentsAt(l, corNow));
    corNow = looper.correctedNow(new Date(now+=50));
    ass.deepEqual([[110, 60], [120, 80] ], segmentsAt(l, corNow));

    looper.setSpeed(-1);
    corNow = looper.correctedNow(new Date(now+=50));
    ass.deepEqual([[100, 50], [110, 60]], segmentsAt(l, corNow));
    corNow = looper.correctedNow(new Date(now+=50));
    // log(l.calculateTimes(corNow).now); 
    ass.deepEqual([[100, 50]], segmentsAt(l, corNow));
    corNow = looper.correctedNow(new Date(now+=50));
    ass.deepEqual([], segmentsAt(l, corNow));
    return logmessage;
    /*
    ass.deepEqual(
        [[100, 50], [110, 60]], segmentsAt(l, start + 100 + duration));
    ass.deepEqual([[110, 60], [120, 80] ], segmentsAt(l, start + 150));
    ass.deepEqual([[120, 80]], segmentsAt(l, start + 200));
    ass.deepEqual([], segmentsAt(l, start + 250));
    */
});

client = runBrowserTest0(client, urlTest, 'set up looper', setupLooper);
client = runBrowserTest0(client, null, 'curve at creation', function(){
    var start = 1460480954631;
    var now = start;
    looper.setSpeed(1);
    var l = looper.newLine(looper.correctedNow(new Date(now)));
    looper.drawPoint(100,50,looper.correctedNow(new Date(now+=50)));
    ass.deepEqual([], segmentsAt(l, start + 49));
    ass.deepEqual([[100, 50]], segmentsAt(l, start + 50));
    ass.deepEqual([[100, 50]], segmentsAt(l, now));
    looper.drawPoint(110,60,looper.correctedNow(new Date(now+=50)));
    ass.deepEqual([[100, 50], [110, 60]], segmentsAt(l, now));
    looper.drawPoint(120,80,looper.correctedNow(new Date(now+=50)));
    ass.deepEqual([[110, 60], [120, 80]], segmentsAt(l, now));
    looper.completeLine(looper.correctedNow(new Date(now+=50)));
    ass.deepEqual([[120, 80]], segmentsAt(l, now));
    var data = l.exportData();        
    ass.deepEqual([50, 100, 150], data.times);

    ass.deepEqual([[100, 50]], segmentsAt(l, start + 50));
    ass.deepEqual([[100, 50]], segmentsAt(l, start + 50 - duration));
    ass.deepEqual([[100, 50], [110, 60]], segmentsAt(l, start + 100));
    ass.deepEqual(
        [[100, 50], [110, 60]], segmentsAt(l, start + 100 + duration));
    ass.deepEqual([[110, 60], [120, 80] ], segmentsAt(l, start + 150));
    ass.deepEqual([[120, 80]], segmentsAt(l, start + 200));
    ass.deepEqual([], segmentsAt(l, start + 250));
    
});

client = runBrowserTest0(client, urlTest, 'corrected now', function(){
    var ass = chai.assert;
    looper.setup('myCanvas', 2000);
    var now = 0;

    ass.equal(0, looper.correctedNow(new Date(0)));
    ass.equal(100, looper.correctedNow(new Date(100)));

    looper.setSpeed(2);
    ass.equal(300, looper.correctedNow(new Date(200)));
    
    looper.setSpeed(-1);
    ass.equal(280, looper.correctedNow(new Date(220)));
    
    looper.setSpeed(-0.5);
    ass.equal(270, looper.correctedNow(new Date(240)));
});

client = runBrowserTest0(client, urlTest, 'set up looper', setupLooper);
client = runBrowserTest0(client, null, 'curve at creation, reverse', function(){
    var start = 5000;
    var now = start;
    looper.setSpeed(-1);
    
    var corNow = looper.correctedNow(new Date(now));
    var l = looper.newLine(corNow);
    var t = l.calculateTimes(corNow);
    log([now, corNow, t.now, t.duration].join(', '));
    
    corNow = looper.correctedNow(new Date(now+=50));
    t = l.calculateTimes(corNow);
    logmessage += [now, corNow, t.now, t.duration].join(', ') + "\n";
    looper.drawPoint(100, 50, corNow);
    return logmessage;
    ass.deepEqual([[100, 50]], segmentsAt(l, start - 50));
    
});

client.end() ;
