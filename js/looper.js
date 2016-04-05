var looper = {};
(function(){
    var state = {lines: [], defaultDuration: 0},
        currentLine,
        lineColor,
        strokeWidth,
        lifetime,
        lastTime = 0,
        lastCorrectedTime = 0,
        speed = 1;

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
        var now = Date.now();
        state.defaultDuration = data.duration;
        data.lineData.forEach(function(dt){
            var line = makeLine(dt.color, dt.strokeWidth, dt.lifetime,
                                dt.duration, now);
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

    var installListeners = function(){
        var t = new Tool();
        t.minDistance = 3;
        t.onMouseDown = function(e){
            if(state.defaultDuration){
                currentLine = makeLine(lineColor,
                                       strokeWidth,
                                       lifetime,
                                       state.defaultDuration,
                                       lastCorrectedTime);
            }else{
                currentLine = makeLine(lineColor, strokeWidth, lifetime);
            }
            actions.do(addLineAction(currentLine));
        };
        t.onMouseDrag = function(e){
            currentLine.pushSegment([e.point.x,e.point.y], lastCorrectedTime);
        };
        t.onMouseUp = function(e){ 
            currentLine.completeCreation(lastCorrectedTime);
            currentLine = null;
        };
    };

    var draw = function(){
        var now = Date.now(),
            interval = now - lastTime,
            correctedNow = lastCorrectedTime + interval * speed ;
        lastTime = now;
        lastCorrectedTime = correctedNow;
        state.lines.forEach(function(line){
            line.redraw(correctedNow);
        });
        view.draw();
    };

    var init = function(canvasId, theDefaultDuration){
        state.defaultDuration = theDefaultDuration;
        console.log("default duration " + state.defaultDuration);
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
    
    looper.init = init;
    looper.exportData = exportData;
    looper.importData = function(d){ actions.do(importDataAction(d)); };
    looper.clear = function(){ actions.do(clearAction()); };
    looper.setSpeed = function(s) { speed = s; };
    looper.setLineColor = function(c) { lineColor = c;};
    looper.setStrokeWidth = function(w) { strokeWidth = w;};
    looper.setLifetime = function(l) { lifetime = l;};
})();


