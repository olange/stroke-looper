var allTests = function(){
    ['normalCurve', 'reversedCurve', 'curveAtCreation' ,'correctedNow',
     'reverseCurveAtCreation'
    ].forEach(function(t){
        log(t);
        try{
            window[t]();
        }catch(e){
            log(e.message, e.stack);
        }
    });
};
var log = console.log.bind(console);
var ass = chai.assert;

var setupLooper = function(){
    window.duration = 2000;
    var lifetime = 100;
    looper.setup('myCanvas', duration);
    looper.setLifetime(lifetime);
};

var segmentsAt = function(line, time){
    return line.segmentsToShow(time).map(function(s){
        return [s.point.x, s.point.y]; });
};


var normalCurve = function(){
    setupLooper();
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
};

var reversedCurve = function(){
    setupLooper();
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
    /*
    ass.deepEqual(
        [[100, 50], [110, 60]], segmentsAt(l, start + 100 + duration));
    ass.deepEqual([[110, 60], [120, 80] ], segmentsAt(l, start + 150));
    ass.deepEqual([[120, 80]], segmentsAt(l, start + 200));
    ass.deepEqual([], segmentsAt(l, start + 250));
     */
};

var curveAtCreation = function(){
    setupLooper();
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
    
};

var correctedNow = function(){
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
};

var reverseCurveAtCreation = function(){
    var start = 5000;
    var now = start;
    looper.setSpeed(-1);
    
    var corNow = looper.correctedNow(new Date(now));
    var l = looper.newLine(corNow);
    var t = l.calculateTimes(corNow);
    log([now, corNow, t.now, t.duration].join(', '));
    
    corNow = looper.correctedNow(new Date(now+=50));
    t = l.calculateTimes(corNow);
    log([now, corNow, t.now, t.duration].join(', '));
    looper.drawPoint(100, 50, corNow);
    //ass.deepEqual([[100, 50]], segmentsAt(l, start - 50));
    
};
