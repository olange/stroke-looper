var looper = {};
(function(){

    var lines = [];
    var first = true;
    var draw = function(){
        lines.forEach(function(line){
            line.redraw(Date.now());
        });
        paper.view.draw();
        if(first){
            console.log(paper);
            first = false;
        }
    };

    var installListeners = function(){
        var p = {};
        paper.install(p);
        var t = new p.Tool();
        t.onMouseDown = function(e){ 
            // for some reason this is not enough to create a paperjs ToolEvent
            console.log("down",e);
        };
        t.onMouseDrag = function(e){ 
            // for some reason this is not enough to create a paperjs ToolEvent
            console.log("drag",e);
        };
    };
    var init = function(canvasId){
        var canvas = document.getElementById(canvasId);
        paper.setup(canvas);
        var durations = [50,10,30];
        var start = [0,20,10];
        for(var j = 0; j < 3; j++){
            var x = Math.random() * 100, y = Math.random() * 100;
            lines[j] = makeLine(j % 2 != 0 ? 0 : 3000);
            for(var i=0; i< durations[j]; i++){
                x += (Math.random()-.25)*10;
                y += (Math.random()-.25)*10;
                lines[j].pushSegment([x, y], (start[j]+i)*90);
            };    
        }

        // paper.tool.onMouseDown = function(event){
        //     console.log(event);
        // };

        var render = function(){
            draw();
            requestAnimationFrame(render);
        };
        lastLoopStart = Date.now();
        render();
        installListeners ();


    };

    looper.init = init;
})();

