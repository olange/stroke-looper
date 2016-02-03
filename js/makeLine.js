var makeLine = function(duration, initialLoopStart){
    initialLoopStart = initialLoopStart || Date.now();
    var lastLoopStart = initialLoopStart,
        path = new Path(),
        data = {loopDuration: 0,
                segments: [], 
                times: []};
    path.strokeColor = 'black';
    path.strokeWidth = 2;
    var smoothPreviousSegment = function(path, data){
        var index = path.segments.length - 2;
        if(index >= 0){
            var smSeg = path.segments[index];
            smSeg.smooth();
            var smDat = data.segments[index];
            smDat.handleIn = [smSeg.handleIn.x, smSeg.handleIn.y];
            smDat.handleOut = [smSeg.handleOut.x, smSeg.handleOut.y];
        }
    };
    return {
        getData: function(){return data;},
        pushSegment: function(point, time){
            var relativeTime = time - initialLoopStart;
            data.times.push(relativeTime);
            var segment = {point:point};
            path.add(segment);
            data.segments.push(segment);
            smoothPreviousSegment(path, data);
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
                    var time = data.times[i];
                    return elapsed - 500 < time && time < elapsed ;
                });
            path.removeSegments();
            path.addSegments(segmentsToShow);
            if(elapsed - data.loopDuration > 0){
                lastLoopStart = now;
            }
        },
        undraw: function(){
            path.removeSegments();
        },
        clear: function(){
            data.segments.length = 0;
            path.removeSegments();
        },
        setData: function(newdata){
            data = newdata;
            path.removeSegments();
            path.addSegments(data.segments);
        }
    };
};
