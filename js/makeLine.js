var makeLine = function(duration){
    var lastLoopStart,
        loopDuration,
        segments = [], 
        times = [],
        path = new paper.Path();
    path.strokeColor = 'black';
    return {
        pushSegment: function(segment, time){
            segments.push(segment);
            times.push(time);
            if(duration){
                loopDuration = Math.ceil(time / duration) * duration;
            }else{
                loopDuration = time + 100;
            }
        },
        redraw: function(now){
            lastLoopStart = lastLoopStart || now;
            var elapsed = now - lastLoopStart,
                segmentsToShow = segments.filter(function(s, i){
                    return times[i] < elapsed;
                });
            path.removeSegments();
            path.addSegments(segmentsToShow);
            if(elapsed - loopDuration > 0){
                lastLoopStart = now;
            }
        }
    };
};
