var makeLine = function(duration, start){
    var path = new Path(),
        data = {start: start || Date.now(),
                loopDuration: 0,
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
        exportData: function(){return data;},
        pushSegment: function(point, time){
            var relativeTime = time - data.start;
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
        redraw: function(absoluteNow){
            var now = (absoluteNow - data.start) % data.loopDuration,
                longevity = 500,
                segmentsToShow = data.segments.filter(function(s, i){
                    var birth = data.times[i];
                    return birth < now  && now < birth + longevity;
                });
            path.removeSegments();
            path.addSegments(segmentsToShow);
        },
        clear: function(){
            path.removeSegments();
        },
        importData: function(newdata){
            data = newdata;
            data.start = data.start || 0; //for importing old format
            path.removeSegments();
        }
    };
};
