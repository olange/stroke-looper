var makeLine = function(duration, initialLoopStart){
    initialLoopStart = initialLoopStart || Date.now();
    var lastLoopStart = initialLoopStart,
        path = new Path(),
        data = {loopDuration: 0,
                segments: [], 
                times: []};
    path.strokeColor = 'black';
    path.strokeWidth = 2;
    return {
        getData: function(){return data;},
        pushSegment: function(point, time){
            var relativeTime = time - initialLoopStart;
            data.times.push(relativeTime);
            var segment = {point:point};
            path.add(segment);
            data.segments.push(segment);
            var index = path.segments.length - 2;
            if(index >= 0){
                path.segments[index].smooth();
                var hin = path.segments[index].handleIn;
                data.segments[index].handleIn = [hin.x, hin.y];
                var hout = path.segments[index].handleOut;
                data.segments[index].handleOut = [hout.x, hout.y];
            }
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
