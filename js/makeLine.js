var makeLine = function(color, strokeWidth, lifetime, start, intervalDuration){
    var data = {start: start,
                lineDuration: 0,
                lifetime: lifetime || 500,
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

    var initDuration = function(dateNow){
        var elapsed = dateNow - data.start;
        if(elapsed < 0){
            // If we're going back in time,
            // the first point was not drawn at its birth time
            // but at its death time.
            elapsed = Math.abs(elapsed) + data.lifetime;
        }
        if(intervalDuration){
            // lineDuration is the lowest non-zero multiple of intervalDuration
            // that is greater than elapsed
            var intervCount =  Math.max(1, Math.ceil(elapsed/intervalDuration));
            data.lineDuration = intervCount * intervalDuration;
        }else{
            data.lineDuration = elapsed ;
        }
        shiftTimesIntoPositive(data.times, data.lineDuration);
    };
    
    var shiftTimesIntoPositive = function(times, lineDuration){
        if(times.length < 1){ return; }
        var minTime = data.times[0];
        data.times.forEach(function(time){
            minTime = Math.min(time, minTime);
        });
        var offset = 0;
        while(minTime + offset < 0){ offset += data.lineDuration; }
        if(!offset){ return; }
        data.times.forEach(function(time, i){
            data.times[i] += offset;
        });
    };

    var calculateTimes =  function(dateNow){
        var totalElapsedTime = dateNow - data.start;
        // There is no data.lineDuration while the line is being drawn.
        var lineDuration = data.lineDuration || totalElapsedTime + 1;
        // Time since the start of last interval.
        var elapsed = totalElapsedTime % lineDuration;
        /* elapsed time can be negative when speed < 0
         .start                      .start + lineDuration
         .-----------------> elapsed = now
         
         .start - lineDuration       .start
                   elapsed <---------. 
         ------------------> now = elapsed + lineDuration
         */
        var now = elapsed < 0 ? lineDuration + elapsed : elapsed;
        return {now: now, duration: lineDuration };
    };

    return {
        calculateTimes: calculateTimes ,
        segmentsToShow:  function(dateNow){
            var t  = calculateTimes(dateNow);
            return referencePath.segments.filter(function(s, i){
                var birth = data.times[i];
                //TODO deal with negative birth
                // birth = birth < 0 ? birth + t.duration : birth;
                return birth <= t.now  && t.now < birth + data.lifetime;
            });
        },
        redraw: function(dateNow){
            var segments = this.segmentsToShow(dateNow);
            drawingPath.removeSegments();
            drawingPath.addSegments(segments);
        },
        pushSegment: function(point, dateNow){
            var elapsed = dateNow - data.start,
                // If we're going backwards in time, 
                // the segment is considered to be pushed
                // at the end of its lifetime.
                birth = elapsed < 0 ? elapsed - lifetime : elapsed,
                segment = {point: point};
            //console.log('push', now);
            data.times.push(birth);
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
            //don't delete the segments, they might be needed for redo
            // but why was this even deleted in the first place?
            //delete newdata.segments;
            data = newdata;
            data.start = data.start;
        }
    };
};
