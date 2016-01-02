var looper = {};
(function(){

    var lines = [],
        currentLine;
    var draw = function(){
        lines.forEach(function(line){
            line.redraw(Date.now());
        });
        paper.view.draw();
    };

    var installListeners = function(duration){
        var p = {};
        paper.install(p);
        var t = new p.Tool();
        t.onMouseDown = function(e){
	    // Give the stroke a color
            currentLine = makeLine(duration, Date.now());
            var segment = [e.event.clientX, e.event.clientY];
            currentLine.pushSegment(segment, Date.now());
            console.log(e.event);
        };
        t.onMouseDrag = function(e){
            var segment = [e.event.clientX, e.event.clientY];
            currentLine.pushSegment(segment, Date.now());
            paper.view.draw();
        };
        t.onMouseUp = function(e){ 
            lines.push(currentLine);
            currentLine = null;
        };
    };

    var init = function(canvasId){
        var canvas = document.getElementById(canvasId);
        paper.setup(canvas);
        var durations = [50,10,30];
        var start = [0,20,10];
        var now = Date.now();
        for(var j = 0; j < 3; j++){
            var x = Math.random() * 100, y = Math.random() * 100;
            lines[j] = makeLine(j % 2 != 0 ? 0 : 3000);
            for(var i=0; i< durations[j]; i++){
                x += (Math.random()-.25)*10;
                y += (Math.random()-.25)*10;
                lines[j].pushSegment([x, y], now + (start[j]+i)*90);
            };    
        }

        var render = function(){
            draw();
            requestAnimationFrame(render);
        };
        render();
        installListeners (3000);

    };
    looper.lines = lines;
    looper.init = init;
})();

