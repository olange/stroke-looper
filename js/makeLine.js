var makeLine = function(color, strokeWidth, longevity, intervalDuration, start){
    var data = {start: start || Date.now(),
                lineDuration: 0,
                longevity: longevity || 500,
                color: color || 'black',
                strokeWidth: strokeWidth || 2,
                times: []},
        drawingPath = new Path({strokeColor: data.color,
                                strokeWidth: data.strokeWidth,
                                strokeCap: 'round'}),
        referencePath = new Path({visible: false});

    var simplifyAndSmooth = function(referencePath){
        var offsets = referencePath.segments.map(function(s){
            return referencePath.getOffsetOf(s.point);
        });
        referencePath.simplify();
        var points = offsets.map(function(o){
            return referencePath.getPointAt(o);
        }).filter(function(p){return p;});
        referencePath.removeSegments();
        referencePath.addSegments(points);
        referencePath.smooth({ type: 'catmull-rom'});
    };

    var initDuration = function(absoluteLast){
        var last = absoluteLast - data.start;
        if(intervalDuration){
            // lineDuration is the lowest non-zero multiple of intervalDuration
            // that is greater than last
            var intervalCount =  Math.max(1, Math.ceil(last / intervalDuration));
            data.lineDuration = intervalCount * intervalDuration;
        }else{
            data.lineDuration = last ;
        }
    };
 
    return {
        pushSegment: function(point, absoluteNow){
            var now = absoluteNow - data.start,
                segment = {point: point};
            data.times.push(now);
            referencePath.add(segment);
            var previousIndex = referencePath.segments.length - 2;
            referencePath.segments[Math.max(0, previousIndex)].smooth();
        },
        completeCreation: function(absoluteLast){
            initDuration(absoluteLast);
            if(referencePath.segments.length>1){
                referencePath.smooth({ type: 'catmull-rom'});
            }
            // unfortunately, this is too expensive. Try a worker?
            //https://developer.mozilla.org/en-US/docs/Web/API/Worker
            //simplifyAndSmooth(referencePath);
       },
        redraw: function(absoluteNow){
            var now = absoluteNow - data.start;
            // There is no lineDuration while the line is being drawn.
            if(data.lineDuration){now = now % data.lineDuration;}
            var segmentsToShow = referencePath.segments.filter(function(s, i){
                var birth = data.times[i];
                return birth <= now  && now < birth + data.longevity;
            });
            //console.log(absoluteNow, data.start, data.lineDuration, now);
            drawingPath.removeSegments();
            drawingPath.addSegments(segmentsToShow);
        },
        clear: function(){
            drawingPath.removeSegments();
        },
        exportData: function(){
            var exported = new Object(data);
            exported.segments = referencePath.segments.map(function(s){
                return [s.point.x, s.point.y]; 
            });
            return exported;
        },
        importData: function(newdata){
            drawingPath.removeSegments();
            referencePath.removeSegments();
            referencePath.addSegments(newdata.segments);
            referencePath.segments.forEach(function(s){ s.smooth(); });
            delete newdata.segments;
            data = newdata;
            data.start = data.start;
        }
    };
};
