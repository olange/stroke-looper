var looper = {};
(function(){

    var lines = [],
        lastLoopStart;
    
    var draw = function(){
        var now = Date.now(),
            duration = now - lastLoopStart;
        var maxDuration = 0;
        lines.forEach(function(line){
            line.redraw(now);
        });
        paper.view.draw();
    };
    
    var init = function(canvasId){
        var canvas = document.getElementById(canvasId);
        paper.setup(canvas);
        var durations = [50,10,30];
        var start = [0,20,10];
        for(var j = 0; j < 3; j++){
            var x = Math.random() * 100, y = Math.random() * 100;
            lines[j] = makeLine(j % 2 != 0 ? 0 : 7000);
            for(var i=0; i< durations[j]; i++){
                x += (Math.random()-.25)*10;
                y += (Math.random()-.25)*10;
                lines[j].pushSegment([x, y], (start[j]+i)*90);
            };    
        }

        var render = function(){
            draw();
            requestAnimationFrame(render);
        };
        lastLoopStart = Date.now();
        render();
    };

    looper.init = init;
})();
