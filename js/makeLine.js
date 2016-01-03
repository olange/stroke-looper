var makeLine = function(duration, initialLoopStart){
    initialLoopStart = initialLoopStart || Date.now();
    var lastLoopStart = initialLoopStart,
        loopDuration,
        segments = [], 
        times = [],
        path = new paper.Path();
    path.strokeColor = 'black';
    path.strokeWidth = 2;
    return {
        segments: segments,
        times: times,
        pushSegment: function(segment, time){
            var relativeTime = time - initialLoopStart;
            times.push(relativeTime);
            path.addSegment(segment);
            segments.push(segment);
            if(duration){
                loopDuration = Math.ceil(relativeTime / duration) * duration;
            }else{
                loopDuration = relativeTime;
            }
        },
        redraw: function(now){
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
