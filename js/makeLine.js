var makeLine;
(function(){
    var findSegmentIndex = function(times, time){
        var i = 0;
        for(; i < times.length; i++){
            if(times[i] > time){
                return i  ;
            }
        }
        return i;
    };

    makeLine = function(duration){
        var lastLoopStart,
            loopDuration,
            segments = [], 
            times = [],
            path = new paper.Path(),
            line = {
                pushSegment: function(segment, time){
                    segments.push(segment);
                    times.push(time);
                    loopDuration = duration || time + 100;
                },
                redraw: function(now){
                    lastLoopStart = lastLoopStart || now;
                    var elapsed = now - lastLoopStart,
                        segmentIndex = findSegmentIndex(times, elapsed);
                    path.removeSegments();
                    path.addSegments(segments.slice(0, segmentIndex));
                    if(elapsed - loopDuration > 0){
                        lastLoopStart = now;
                    }
                }
            };
        path.strokeColor = 'black';
        return line;
    };
})();
