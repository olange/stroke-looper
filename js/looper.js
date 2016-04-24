var looper = {};
(function(){
    var state, currentLine, lineColor, strokeWidth, lifetime, lastTime,
        lastCorrectedTime, speed;
    
    var reset = function(){
        state = {lines: [], defaultDuration: 0};
        currentLine = lineColor = strokeWidth = lifetime = null;
        lastTime = lastCorrectedTime = 0;
        speed = 1;
    };

    var exportData = function(){
        return {
            lineData: state.lines.map(function(l){
                return l.exportData();}),
            duration: state.defaultDuration};
    };

    var clearLines = function(){
        var oldState = state;
        state = {lines: [], defaultDuration: oldState.defaultDuration};
        oldState.lines.forEach(function(line){ line.clear(); });
    };
    
    var importData = function(data){
        console.log(data);
        clearLines();
        state.defaultDuration = data.duration;
        data.lineData.forEach(function(dt){
            var line = makeLine(dt.color, dt.strokeWidth, dt.lifetime,
                                now(), dt.duration);
            console.log(dt);
            line.importData(dt);
            state.lines.push(line);
        });
    };

    var importDataAction = function(data){
        var oldState = state;
        return {do: function(){ importData(data); },
                undo: function(){ clearLines();
                                  state = oldState;}};
    };

    var clearAction = function(){
        var oldState = state;
        return {do: function(){ clearLines(); },
                undo: function(){ state = oldState ;}};
    };

    var addLineAction = function(line){
        return {do:  function(){ state.lines.push(line); },
                undo: function(){ state.lines.pop();
                                  line.clear();}};
    };
    var newLine = function(now){
        if(state.defaultDuration){
            currentLine = makeLine(lineColor,
                                   strokeWidth,
                                   lifetime,
                                   now,
                                   state.defaultDuration);
        }else{
            currentLine = makeLine(lineColor, strokeWidth, lifetime, now);
        }
        actions.do(addLineAction(currentLine));
        return currentLine;
    };
    var drawPoint = function(x, y, now){
        currentLine.pushSegment([x,y], now);
    };
    var completeLine = function(now){
        currentLine.completeCreation(now);
        currentLine = null;
    };
    var installListeners = function(){
        var t = new Tool();
        t.minDistance = 3;
        t.onMouseDown = function(){ newLine(now()); };
        t.onMouseDrag = function(e){ drawPoint(e.point.x,e.point.y, now()); };
        t.onMouseUp = function(){ completeLine(now()); };
    };
    
    var now = function(){ return correctedNow(Date.now()); };

    var correctedNow = function(now){
        var interval = now - lastTime,
            correctedNow = lastCorrectedTime + interval * speed ;
        lastTime = now;
        lastCorrectedTime = correctedNow;
        return correctedNow;
    };

    var setup = function(canvasId, theDefaultDuration){
        reset();
        state.defaultDuration = theDefaultDuration;
        console.log("default duration " + state.defaultDuration);
        var canvas = document.getElementById(canvasId);
        paper.setup(canvas);
        paper.install(window);
        installListeners();
    };

    var start = function(){
        var render = function(){
            state.lines.forEach(function(line){
                line.redraw(now());
            });
            view.draw();
            requestAnimationFrame(render);
        };
        render();
    };

    var init = function(canvasId, theDefaultDuration){
        setup(canvasId, theDefaultDuration);
        start();
    };
    
    looper.setup = setup;
    looper.start = start;
    looper.exportData = exportData;
    looper.now = now;
    looper.correctedNow = correctedNow;
    looper.newLine = newLine;
    looper.drawPoint = drawPoint;
    looper.completeLine = completeLine;
    looper.importData = function(d){ actions.do(importDataAction(d)); };
    looper.clear = function(){ actions.do(clearAction()); };
    looper.setSpeed = function(s) { speed = s; };
    looper.setLineColor = function(c) { lineColor = c;};
    looper.setStrokeWidth = function(w) { strokeWidth = w;};
    looper.setLifetime = function(l) { lifetime = l;};
})();


