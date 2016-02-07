var looper = {};
(function(){
    var lines = [],
        defaultDuration,
        startTime,
        currentLine;

    var getData = function(){
        return {lineData: lines.map(function(l){return l.getData();}),
                duration: defaultDuration};
    };

    var clear = function(){
        var oldLines = lines;
        lines = [];
        oldLines.forEach(function(line){ line.clear(); });
    };
    
    var setData = function(data){
        clear();
        var now = Date.now();
        defaultDuration = data.duration;
        data.lineData.forEach(function(dt){
            var line = makeLine(dt.duration, now);
            line.setData(dt);
            lines.push(line);
        });
    };

    var setDataAction = function(data){
        var oldLines = lines,
            oldDefaultDuration = oldDefaultDuration;
        return {do: function(){ setData(data); },
                undo: function(){
                    clear();
                    lines = oldLines;
                    defaultDuration = oldDefaultDuration;
                }};
    };

    var clearAction = function(){
        var oldLines = lines;
        return {do: function(){ clear(); },
                undo: function(){ lines = oldLines ;}};
    };

    var installClear = function(clearLinkId){
        var clear = function(){ actions.do(clearAction()); };
        var clearLink = document.getElementById(clearLinkId);
        clearLink.addEventListener("click", clear, false);
    };
    
    var addLineAction = function(line){
        return {do:  function(){ lines.push(line); },
                undo: function(){ lines.pop();
                                  line.clear();}};
    };

    var installListeners = function(){
        var t = new Tool();
        t.minDistance = 3;
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
            actions.do(addLineAction(currentLine));
            currentLine = null;
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
    
    looper.init = init;
    looper.getData = getData;
    looper.setData = function(d){ actions.do(setDataAction(d)); };
    looper.lines = lines;
    looper.installClear = installClear;
})();


