var allTestsWithAlert = function(){
    log = function(m, s){ console.log(m, s); alert(m+ '\n' + (s||''));};
    allTests();
};
var testNames = ['normalCurve', 'reversedCurve', 'curveAtCreation',
                 'curveAtCreationMultiPeriod', 
                 'correctedNow', 'reverseCurveAtCreation',
                 'reverseCurveAtCreationMultiPeriodDetailed',
                 'reverseCurveAtCreationMultiPeriod'];
var allTests = function(){testNames.forEach(runTest);};
var runTest = function(testName){
    log('. ' + testName);
    try{
        window[testName]();
    }catch(e){
        log(e.message, e.stack);
    }
};

var log = console.log.bind(console);
var ass = chai.assert;

var setupLooper = function(lifetime, multiPeriod){
    window.duration = 2000;
    looper.setup('myCanvas', duration, multiPeriod);
    looper.setLifetime(lifetime || 100);
};

var segmentsAt = function(line, time){
    var periodSegments = pSegmentsAt(line,time);
    return [].concat.apply([], periodSegments); //flatten
};

var pSegmentsAt = function(line, time){
    return line.periodSegmentsToShow(time).map(function(segments){
        return segments.map(function(s){ return [s.point.x, s.point.y]; });
    });
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
    // log(l.calculateTime(corNow).now); 
    ass.deepEqual([[100, 50]], segmentsAt(l, corNow));
    corNow = looper.correctedNow(new Date(now+=50));
    ass.deepEqual([], segmentsAt(l, corNow));
};

var correctedNow = function(){
    setupLooper();
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

var curveAtCreationDetailed = function(){
    setupLooper(100);
    var start = 1460480954631;
    var now = start;
    
    var l = looper.newLine(new Date(now));
    ass.equal(0, l.calculateTime(now).now);
    
    looper.drawPoint(100,50, new Date(now+=50));
    ass.equal(50, l.calculateTime(now).now); //t.now
    ass.deepEqual([50], l.exportData().times); //birth
    ass.deepEqual([[100, 50]], segmentsAt(l, now));
    //    50      100     150
    //    .birth         .birth + lifetime
    //    .--------------> point 1
    //    . now
    ass.deepEqual([], segmentsAt(l, now - 3));
    //    50      100     150
    //  | .--------------> point 1
    //  .now

    looper.drawPoint(110,60, new Date(now+=50));
    ass.equal(100, l.calculateTime(now).now); //t.now
    ass.deepEqual([50, 100], l.exportData().times); //birth
    ass.deepEqual([[100, 50], [110, 60]], segmentsAt(l, now));
    //    50      100     150
    //    .-------|------> point 1
    //            .--------------> point 2
    //            .now   

    looper.drawPoint(120,80, new Date(now+=50));
    ass.equal(150, l.calculateTime(now).now); //t.now
    ass.deepEqual([50, 100, 150], l.exportData().times); //birth
    ass.deepEqual([[110, 60], [120, 80]], segmentsAt(l, now));
    //    50      100     150
    //    .-------------->| point 1
    //            .-------|------> point 2
    //                    .--------------> point 3
    //                    .now   

    looper.completeLine(new Date(now+=50));
    ass.equal(200, l.calculateTime(now).now); //t.now
    ass.deepEqual([50, 100, 150], l.exportData().times); //birth
    ass.deepEqual([[120, 80]], segmentsAt(l, now));
    //    50      100     150     200
    //    .--------------> p1     |
    //            .-------------->|point 2
    //                    .-------|------> point 3
    //    ......................... last = 150
    //                            .now   

    ass.deepEqual([[100, 50]], segmentsAt(l, start + 50));
    ass.deepEqual([[100, 50]], segmentsAt(l, start + 50 - duration));
    ass.deepEqual([[100, 50], [110, 60]], segmentsAt(l, start + 100));
    ass.deepEqual(
        [[100, 50], [110, 60]], segmentsAt(l, start + 100 + duration));
    ass.deepEqual([[110, 60], [120, 80] ], segmentsAt(l, start + 150));
    ass.deepEqual([[120, 80]], segmentsAt(l, start + 200));
    ass.deepEqual([], segmentsAt(l, start + 250));
    
};

var curveAtCreation = function(){
    setupLooper(100);
    var start = 1460480954631;
    var now = start;
    
    var l = looper.newLine(new Date(now));
    ass.equal(0, l.calculateTime(now).now);
    
    looper.drawPoint(100,50, new Date(now+=50));
    ass.deepEqual([[100, 50]], segmentsAt(l, now));

    looper.drawPoint(110,60, new Date(now+=50));
    ass.deepEqual([[100, 50], [110, 60]], segmentsAt(l, now));

    looper.drawPoint(120,80, new Date(now+=50));
    ass.deepEqual([[110, 60], [120, 80]], segmentsAt(l, now));

    looper.completeLine(new Date(now+=50));
    ass.deepEqual([[120, 80]], segmentsAt(l, now));

    ass.deepEqual([[100, 50]], segmentsAt(l, start + 50));
    ass.deepEqual([[100, 50]], segmentsAt(l, start + 50 - duration));
    ass.deepEqual([[100, 50], [110, 60]], segmentsAt(l, start + 100));
    ass.deepEqual(
        [[100, 50], [110, 60]], segmentsAt(l, start + 100 + duration));
    ass.deepEqual([[110, 60], [120, 80] ], segmentsAt(l, start + 150));
    ass.deepEqual([[120, 80]], segmentsAt(l, start + 200));
    ass.deepEqual([], segmentsAt(l, start + 250));
    
};

var curveAtCreationMultiPeriod = function(){
    var incr = 800;
    var multiPeriod = true;
    setupLooper(2*incr, multiPeriod);
    var start = 1460480954631;
    var now = start;

    var corNow = looper.correctedNow(new Date(now));
    ass.equal(now, corNow); 
    var l = looper.newLine(now, multiPeriod); //0
    ass.equal(0, l.calculateTime(now).now);
    
    looper.drawPoint(100,50, now+=incr); //800
    ass.deepEqual([[100, 50]], pSegmentsAt(l, now)[0]); //800
    ass.equal(1, pSegmentsAt(l, now).length);

    looper.drawPoint(110,60, now+=incr); //1600
    ass.deepEqual([[100, 50], [110, 60]], pSegmentsAt(l, now)[0]); //1600
    ass.ok(now-start < duration);
    ass.equal(1, pSegmentsAt(l, now).length);

    looper.drawPoint(120,80, now+=incr); //2400
    ass.ok(now-start > duration);
    ass.equal(2, pSegmentsAt(l, now).length);
    ass.deepEqual([], pSegmentsAt(l, now)[0]); //400
    ass.deepEqual([[110, 60], [120, 80]], pSegmentsAt(l, now)[1]); //2400

    looper.completeLine(now+=incr); //3200
    ass.deepEqual([[100, 50]], pSegmentsAt(l, now)[0]); //800
    ass.deepEqual([[120, 80]], pSegmentsAt(l, now)[1]); //3200

    ass.deepEqual([1,2,3].map(function(i){ return i * incr;}),
                  l.exportData().times); //birth

    now = start + incr; //800: 800 2800
    ass.deepEqual([[100, 50]], pSegmentsAt(l, now)[0]); //800
    ass.deepEqual([[110, 60],[120, 80]], pSegmentsAt(l, now)[1]); //2800

    now = start + incr - 2*duration; //-1200: 800 2800
    ass.deepEqual([[100, 50]], pSegmentsAt(l, now)[0]); //800
    ass.deepEqual([[110, 60],[120, 80]], pSegmentsAt(l, now)[1]); //2800
    
    now = start + incr + 2*duration; //2800: 800 2800
    ass.deepEqual([[100, 50]], pSegmentsAt(l, now)[0]); //800
    ass.deepEqual([[110, 60],[120, 80]], pSegmentsAt(l, now)[1]); //2800
    
    now = start + 2*incr + 2*duration; //3600: 1600 3200
    ass.deepEqual([[100, 50], [110, 60]], pSegmentsAt(l, now)[0]); //1600
    ass.deepEqual([[120, 80]], pSegmentsAt(l, now)[1]); //3200
    
};

var reverseCurveAtCreation = function(){
    var lifetime = 100;
    setupLooper(lifetime, false);
    var start = 5000;
    var now = start;
    looper.setSpeed(-1);
    
    var corNow = looper.correctedNow(new Date(now));
    ass.equal(-5000, corNow); 
    var l = looper.newLine(corNow, false);
    ass.equal(0, l.calculateTime(corNow).now); //t.now
    ass.equal(-5000, l.exportData().start);
    
    corNow = looper.correctedNow(new Date(now+=50));
    ass.equal(-5050, corNow); 
    ass.equal(-50, l.calculateTime(corNow).now); //t.now
    looper.drawPoint(100, 50, corNow);
    ass.deepEqual([-150], l.exportData().times); //birth
    ass.deepEqual([[100, 50]], segmentsAt(l, corNow - 1));
    // -250    -200    -150    -100    -50
    //                 .birth         .birth + lifetime
    //                 .--------------> point 1
    //                                . now - 1
    
    corNow = looper.correctedNow(new Date(now+=50));
    ass.equal(-5100, corNow); 
    ass.equal(-100, l.calculateTime(corNow).now); //t.now
    looper.drawPoint(110, 60, corNow);
    ass.deepEqual([-150, -200], l.exportData().times); //birth
    ass.deepEqual([[100, 50], [110, 60]], segmentsAt(l, corNow - 1));
    // -250    -200    -150    -100    -50
    //         .birth         .birth + lifetime
    //                 .------|-------> point 1
    //         .--------------> point 2
    //                        . now - 1

    corNow = looper.correctedNow(new Date(now+=50));
    ass.equal(-5150, corNow); 
    ass.equal(-150, l.calculateTime(corNow).now); //t.now
    looper.drawPoint(120, 80, corNow);
    ass.deepEqual([-150, -200, -250], l.exportData().times); //birth
    ass.deepEqual([[110, 60], [120, 80]], segmentsAt(l, corNow - 1));
    // -250    -200    -150    -100    -50
    //                |.--------------> point 1
    //         .------|-------> point 2
    // .--------------> point 3
    //                . now - 1

    corNow = looper.correctedNow(new Date(now+=50));
    ass.equal(-5200, corNow); 
    ass.equal(-200, l.calculateTime(corNow).now);
    ass.deepEqual([[120, 80]], segmentsAt(l, corNow - 1));
    looper.completeLine(corNow);
    ass.equal(1800, l.calculateTime(corNow).now);
    ass.deepEqual([-150, -200, -250], l.exportData().times); //birth
    ass.deepEqual([[120, 80]], segmentsAt(l, corNow - 1));
    // -250    -200    -150    -100    -50     0
    // 1750    1800    1850    1900    1950    2000
    //        |        .--------------> point 1
    //        |.--------------> point 2
    // .------|-------> point 3
    //        ......................... last = 150
    //        . now - 1


    ass.deepEqual([[100, 50]], segmentsAt(l, start - 51));
    ass.deepEqual([[100, 50]], segmentsAt(l, start + 1949));
};

var reverseCurveAtCreationMultiPeriodDetailed = function(){
    var lifetime = 100;
    setupLooper(lifetime, true);
    var start = 5000;
    var now = start;
    looper.setSpeed(-1);
     
    var times = [-150, -200, -250]; 

    var corNow = looper.correctedNow(new Date(now));
    ass.equal(-5000, corNow); 
    var l = looper.newLine(corNow, true);
    ass.equal(0, l.calculateTime(corNow).now); //t.now
    ass.equal(-5000, l.exportData().start);
    
    corNow = looper.correctedNow(new Date(now+=50));
    ass.equal(-5050, corNow); 
    ass.equal(1950, l.calculateTime(corNow).now); //t.now
    looper.drawPoint(100, 50, corNow);
    ass.deepEqual(times.slice(0,1), l.exportData().times); //birth
    ass.deepEqual([[100, 50]], segmentsAt(l, corNow - 1));
    // -250    -200    -150    -100    -50     0
    // 1750    1800    1850    1900    1950
    //                 .birth         .birth + lifetime
    //                 .--------------> point 1
    //                                . now - 1
    
    corNow = looper.correctedNow(new Date(now+=50));
    ass.equal(-5100, corNow); 
    ass.equal(1900, l.calculateTime(corNow).now); //t.now
    looper.drawPoint(110, 60, corNow);
    ass.deepEqual(times.slice(0,2), l.exportData().times); //birth
    ass.deepEqual([[100, 50], [110, 60]], segmentsAt(l, corNow - 1));
    // -250    -200    -150    -100    -50     0
    // 1750    1800    1850    1900    1950
    //         .birth         .birth + lifetime
    //                 .------|-------> point 1
    //         .--------------> point 2
    //                        . now - 1

    corNow = looper.correctedNow(new Date(now+=50));
    ass.equal(-5150, corNow); 
    ass.equal(1850, l.calculateTime(corNow).now); //t.now
    looper.drawPoint(120, 80, corNow);
    ass.deepEqual(times.slice(0,3), l.exportData().times); //birth
    ass.deepEqual([[110, 60], [120, 80]], segmentsAt(l, corNow - 1));
    // -250    -200    -150    -100    -50     0
    // 1750    1800    1850    1900    1950
    //                |.--------------> point 1
    //         .------|-------> point 2
    // .--------------> point 3
    //                . now - 1

    corNow = looper.correctedNow(new Date(now+=50));
    ass.equal(-5200, corNow); 
    ass.equal(1800, l.calculateTime(corNow).now);
    ass.deepEqual([[120, 80]], segmentsAt(l, corNow - 1));
    looper.completeLine(corNow);
    ass.deepEqual(times, l.exportData().times); //birth
    //ass.deepEqual([1850, 1800, 1750], l.exportData().times); //birth
    ass.deepEqual([[120, 80]], segmentsAt(l, corNow - 1));
    // -250    -200    -150    -100    -50     0
    // 1750    1800    1850    1900    1950    2000
    //        |        .--------------> point 1
    //        |.--------------> point 2
    // .------|-------> point 3
    //        ......................... last = 150
    //        . now - 1
    
    ass.deepEqual([[120, 80]], segmentsAt(l, start + 1800 - 1));
    
};

var reverseCurveAtCreationMultiPeriod = function(){
    var lifetime = 100;
    var multiPeriod = true;
    setupLooper(lifetime, multiPeriod);
    var start = 5000;
    var now = start;
    looper.setSpeed(-1);

    var corNow = looper.correctedNow(new Date(now));
    var l = looper.newLine(corNow, multiPeriod);
    
    corNow = looper.correctedNow(new Date(now+=50));
    looper.drawPoint(100, 50, corNow);
    ass.deepEqual([[100, 50]], segmentsAt(l, corNow - 1));
    
    corNow = looper.correctedNow(new Date(now+=50));
    looper.drawPoint(110, 60, corNow);
    ass.deepEqual([[100, 50], [110, 60]], segmentsAt(l, corNow - 1));

    corNow = looper.correctedNow(new Date(now+=50));
    looper.drawPoint(120, 80, corNow);
    ass.deepEqual([[110, 60], [120, 80]], segmentsAt(l, corNow - 1));

    corNow = looper.correctedNow(new Date(now+=50));
    ass.deepEqual([[120, 80]], segmentsAt(l, corNow - 1));
    looper.completeLine(corNow);
    ass.deepEqual([[120, 80]], segmentsAt(l, corNow - 1));
};
