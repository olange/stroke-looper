var makeLine = function(duration, start){
    var drawingPath = new Path({strokeColor: 'black', strokeWidth: 2}),
        referencePath = new Path({visible: false}),
        data = {start: start || Date.now(),
                loopDuration: 0,
                longevity: 500,
                segments: [], 
                times: []};
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
        pushSegment: function(point, absoluteNow){
            var now = absoluteNow - data.start,
                segment = {point: point};
            data.times.push(now);
            referencePath.add(segment);
            data.segments.push(segment);
            smoothPreviousSegment(referencePath, data);
        },
        initDuration: function(){
            var last = data.times[data.times.length-1];
            if(duration){
                data.loopDuration = Math.ceil(last / duration) * duration;
            }else{
                data.loopDuration = last ;
            }
        },
        redraw: function(absoluteNow){
            var now = absoluteNow - data.start;
            if(data.loopDuration){ now = now % data.loopDuration; }
            var segmentsToShow = data.segments.filter(function(s, i){
                    var birth = data.times[i];
                    return birth < now  && now < birth + data.longevity;
                });
            drawingPath.removeSegments();
            drawingPath.addSegments(segmentsToShow);
        },
        clear: function(){
            drawingPath.removeSegments();
        },
        importData: function(newdata){
            data = newdata;
            data.start = data.start || 0; //for importing old format
            drawingPath.removeSegments();
            referencePath.removeSegments();
            referencePath.addSegments(data.segments);
        }
    };
};
