
var redirectLogToVar = function(){
    window.logMessage = "";
    window.log = function(){
        var message = Array.prototype.slice.call(arguments).join('\n');
        logMessage += (logMessage ? "\n" : "") + message; 
    };
};

var segmentsAt = function(line, time){
    return line.segmentsToShow(time).map(function(s){
        return [s.point.x, s.point.y]; });
};

var log = console.log.bind(console);
var ass = chai.assert;

var setupLooper = function(){
    window.duration = 2000;
    var lifetime = 100;
    looper.setup('myCanvas', duration);
    looper.setLifetime(lifetime);
};

var allTests = function(){
    try{
        normalCurve();
    }catch(e){
        log(e.message, e.stack);
    }
};

var normalCurve = function(){
    setupLooper();
    log('normalCurve');
    var start = 1460480954631;
    var ms = start;
    var l = looper.newLine(looper.correctedNow(new Date(ms)));
    looper.drawPoint(100,50,looper.correctedNow(new Date(ms+=50)));
    looper.drawPoint(110,60,looper.correctedNow(new Date(ms+=50)));
    looper.drawPoint(120,80,looper.correctedNow(new Date(ms+=50)));
    looper.completeLine(looper.correctedNow(new Date(ms+=50)));
    var data = l.exportData();        
    ass.deepEqual([51, 100, 150], data.times);
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
};
