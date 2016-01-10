var makeLine = function(duration, initialLoopStart){
    initialLoopStart = initialLoopStart || Date.now();
    var lastLoopStart = initialLoopStart,
        path = new paper.Path(),
        data = {loopDuration: 0,
                segments: [], 
                times: []};
    path.strokeColor = 'black';
    path.strokeWidth = 2;
    return {
        getData: function(){return data;},
        pushSegment: function(segment, time){
            var relativeTime = time - initialLoopStart;
            data.times.push(relativeTime);
            path.addSegment(segment);
            data.segments.push(segment);
            if(duration){
                var loopdur = Math.ceil(relativeTime / duration) * duration;
                data.loopDuration = loopdur;
            }else{
                data.loopDuration = relativeTime;
            }
        },
        redraw: function(now){
            var elapsed = now - lastLoopStart,
                segmentsToShow = data.segments.filter(function(s, i){
                    return data.times[i] < elapsed;
                });
            path.removeSegments();
            path.addSegments(segmentsToShow);
            if(elapsed - data.loopDuration > 0){
                lastLoopStart = now;
            }
        },
        clear: function(){
            data.segments.length=0;
            path.removeSegments();
        },
        setData: function(newdata){
            data = newdata;
            path.removeSegments();
            path.addSegments(data.segments);
        }
    };
};
