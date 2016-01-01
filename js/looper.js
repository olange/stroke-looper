var looper = {};
(function(){

    var lines = [],
        lastLoopStart;
    
    var findSegmentIndex = function(segmentsData, time){
        var i = 0;
        for(; i < segmentsData.length; i++){
            if(segmentsData[i] > time){
                return i  ;
            }
        }
        return i;
    };

    var makeLine = function(){
        var segments = [], 
            segmentsData = [],
            path = new paper.Path(),
            line = {path: path,
                    segments: segments,
                    segmentsData: segmentsData};
        path.strokeColor = 'black';
        line.pushSegment = function(segment,data){
            segments.push(segment);
            segmentsData.push(data);
        };
        line.redraw = function(duration){
            var segmentIndex = findSegmentIndex(segmentsData, duration);
            path.removeSegments();
            path.addSegments(segments.slice(0, segmentIndex));
        };
        line.duration = function(){
            return segmentsData[segmentsData.length-1];
        };
        return line;
    };


    var draw = function(){
        var duration = Date.now() - lastLoopStart;
        lines.forEach(function(line){
            line.redraw(duration);
            if(duration - line.duration() > 500){
                lastLoopStart = Date.now();
            }
        });
        paper.view.draw();
    };
    
    var init = function(canvasId){
        var canvas = document.getElementById(canvasId);
        paper.setup(canvas);
        for(var j = 0; j < 3; j++){
            var x = Math.random() * 100, y = Math.random() * 100;
            lines[j] = makeLine();
            for(var i=0; i< 20; i++){
                x += (Math.random()-.25)*10;
                y += (Math.random()-.25)*10;
                lines[j].pushSegment([x, y], i*20);
            };    
        }

        paper.view.draw();
        var render = function(){
            draw();
            requestAnimationFrame(render);
        };
        lastLoopStart = Date.now();
        render();
    };

    looper.init = init;
})();
