var looper = {};
(function(){
    var state = {lines: [], defaultDuration: 0},
        currentLine;

    var exportData = function(){
        return {
            lineData: state.lines.map(function(l){
                return l.exportData();}),
            duration: state.defaultDuration};
    };

    var clear = function(){
        var oldState = state;
        state = {lines: [], defaultDuration: oldState.defaultDuration};
        oldState.lines.forEach(function(line){ line.clear(); });
    };
    
    var importData = function(data){
        clear();
        var now = Date.now();
        state.defaultDuration = data.duration;
        data.lineData.forEach(function(dt){
            var line = makeLine(dt.duration, now);
            line.importData(dt);
            state.lines.push(line);
        });
    };

    var importDataAction = function(data){
        var oldState = state;
        return {do: function(){ importData(data); },
                undo: function(){
                    clear();
                    state = oldState;
                }};
    };

    var clearAction = function(){
        var oldState = state;
        return {do: function(){ clear(); },
                undo: function(){ state = oldState ;}};
    };

    var installClear = function(clearLinkId){
        var clear = function(){ actions.do(clearAction()); };
        var clearLink = document.getElementById(clearLinkId);
        clearLink.addEventListener("click", clear, false);
    };
    
    var addLineAction = function(line){
        //TODO make this work with default duration...
        return {do:  function(){ state.lines.push(line); },
                undo: function(){ state.lines.pop();
                                  line.clear();}};
    };

    var installListeners = function(){
        var t = new Tool();
        t.minDistance = 3;
        t.onMouseDown = function(e){
            if(state.defaultDuration){
                var now = Date.now();
                var loopStart = now % state.defaultDuration;
                var lineStart = now - lineStart;
                currentLine = makeLine(state.defaultDuration, lineStart);
            }else{
                currentLine = makeLine();
            }
        };
        t.onMouseDrag = function(e){
            currentLine.pushSegment([e.point.x,e.point.y], Date.now());
        };
        t.onMouseUp = function(e){ 
            currentLine.pushSegment([e.point.x,e.point.y], Date.now());
            actions.do(addLineAction(currentLine));
            currentLine = null;
        };
    };

    var draw = function(){
        state.lines.forEach(function(line){
            line.redraw(Date.now());
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
    looper.installClear = installClear;
})();


