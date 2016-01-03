var looper = {};
(function(){
    var lines = [],
        defaultDuration,
        startTime,
        currentLine;
 
    var installListeners = function(){
        var p = {};
        paper.install(p);
        var t = new p.Tool();
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
            currentLine.pushSegment(e.point, Date.now());
        };
        t.onMouseUp = function(e){ 
            currentLine.pushSegment(e.point, Date.now());
            lines.push(currentLine);
            currentLine = null;
        };
    };

    var draw = function(){
        lines.forEach(function(line){
            line.redraw(Date.now());
        });
        paper.view.draw();
    };

    var init = function(canvasId, theDefaultDuration, theStartTime){
        startTime = theStartTime || Date.now();
        defaultDuration = theDefaultDuration;
        var canvas = document.getElementById(canvasId);
        paper.setup(canvas);
//        someRandomLines(2);
        var render = function(){
            draw();
            requestAnimationFrame(render);
        };
        render();
        installListeners();
    };

    var someRandomLines = function(number){
        var durations = [50,10,30];
        var start = [0,20,10];
        var now = Date.now();
        for(var j = 0; j < number; j++){
            var x = Math.random() * 100, y = Math.random() * 100;
            lines[j] = makeLine(j % 2 != 0 ? 0 : defaultDuration);
            for(var i=0; i< durations[j]; i++){
                x += (Math.random()-.25)*10;
                y += (Math.random()-.25)*10;
                lines[j].pushSegment([x, y], now + (start[j]+i)*90);
            };    
        }
    };
    looper.lines = lines;
    looper.init = init;
})();


