var looper = {};
(function(){
    var lines = [],
        defaultDuration,
        startTime,
        currentLine;

    var installListeners = function(){
        var t = new Tool();
        //t.minDistance = 10;
        t.onMouseDown = function(e){
            if(defaultDuration){
                var now = Date.now();
                var loopStart = now - ((now - startTime) % defaultDuration);
                currentLine = makeLine(defaultDuration, loopStart);
            }else{
                currentLine = makeLine();
            }
        };
        t.onMouseDrag = function(e){
            currentLine.pushSegment([e.point.x,e.point.y], Date.now());
        };
        t.onMouseUp = function(e){ 
            currentLine.pushSegment([e.point.x,e.point.y], Date.now());
            lines.push(currentLine);
            currentLine = null;
            console.log(e.point);
        };
    };

    var draw = function(){
        lines.forEach(function(line){
            line.redraw(Date.now());
        });
        view.draw();
    };

    var init = function(canvasId, theDefaultDuration, theStartTime){
        startTime = theStartTime || Date.now();
        defaultDuration = theDefaultDuration;
        console.log("default duration " + defaultDuration);
        var canvas = document.getElementById(canvasId);
        paper.setup(canvas);
        paper.install(window);
        var render = function(){
            draw();
            requestAnimationFrame(render);
        };
        render();
        installListeners();
    };
    
    var getData = function(){
        return {lineData: lines.map(function(l){return l.getData();}),
                duration: defaultDuration};
    };

    var setData = function(data){
        var now = Date.now();
        defaultDuration = data.duration;
        lines.forEach(function(line){line.clear();});
        lines.length = 0;
        data.lineData.forEach(function(dt){
            var line = makeLine(dt.duration, now);
            line.setData(dt);
            lines.push(line);
        });
    };

    looper.init = init;
    looper.getData = getData;
    looper.setData = setData;
    looper.lines = lines;
})();


