var makeLine = function(color, strokeWidth, lifetime, start, intervalDuration){
    var data = {start: start,
                lineDuration: 0,
                lifetime: lifetime || 500,
                color: color || 'black',
                multiPeriod: false,
                strokeWidth: strokeWidth || 2,
                times: []},
//        drawingPath = makePath(data),
        drawingPaths = [],
        referencePath = new Path({visible: false});

    var makePath = function(data){
        return new Path({strokeColor: data.color,
                         strokeWidth: data.strokeWidth,
                         strokeCap: 'round'});
    };

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

    var shiftTimesIntoPositive = function(times, lineDuration){
        if(times.length < 1){ return; }
        var minTime = Math.min(data.times[0], data.times[data.times.length-1]);
        var offset = 0;
        while(minTime + offset < 0){ offset += lineDuration; }
        if(!offset){ return; }
        data.times.forEach(function(time, i){
            data.times[i] += offset;
        });
    };

    var initDuration = function(endDate){
        // The end time of the line, after the last point is drawn.
        // This is important when there is no interval duration,
        // as it keeps the line from restarting immediately.
        var elapsed = endDate - data.start;
        if(elapsed < 0){
            // If we're going back in time,
            // the first point was not drawn at its birth time
            // but at its death time.
            elapsed = Math.abs(elapsed) + data.lifetime;
        }
        
        if(!intervalDuration){
            data.lineDuration = elapsed ;
        }else{
            /*
             .start    .dateNow
             ---------->    elapsed
             ......>......> intervalDurations
             .............> lineDuration:
                 lowest multiple of intervalDuration greater than elapsed
             */
            var intvCount =  Math.max(1, Math.ceil(elapsed/intervalDuration));
            data.lineDuration = intvCount * intervalDuration;
        }
        shiftTimesIntoPositive(data.times, data.lineDuration);
    };
    
    var calculateNow =  function(dateNow){
        /*
         .start                          .dateNow
         --------------------------------> totalElapsedTime
         multiPeriod:
         ...........>...........> lineDurations (if multiPeriod)        
                                 --------> elapsed (since last line interval)
         not multiPeriod:
         .....>.....>.....>.....>.....> intervalDurations
                                       --> elapsed (since last looper interval)
         */
        var totalElapsedTime = dateNow - data.start;
        var duration = data.multiPeriod ? data.lineDuration : intervalDuration;
        // There is no data.lineDuration while the line is being drawn.
        duration = duration || totalElapsedTime + 1;
        // Time since the start of last line interval.
        var elapsed = totalElapsedTime % duration;
        /* elapsed time can be negative when speed < 0
         .start                      .start + duration
         .-----------------> elapsed = now
         
         .start - duration       .start
                   elapsed <---------. 
         ------------------> now = elapsed + duration
         */
        return elapsed < 0 ? duration + elapsed : elapsed;
    };

    return {
        calculateNow: calculateNow ,
        segmentsToShow:  function(now){
            return referencePath.segments.filter(function(s, i){
                var birth = data.times[i];
                return birth <= now && now < birth + data.lifetime;
            });
        },
        periodSegmentsToShow:  function(dateNow){
            var numberOfPeriods = 1; 
            if(intervalDuration && !data.multiPeriod){
                var ts = data.times;
                var last = Math.max(ts[ts.length-1], ts[0]);
                numberOfPeriods = Math.ceil(last / intervalDuration);
            }
            var periodSegments = [];
            for(var i = 0; i < numberOfPeriods; i++){
                var now  = calculateNow(dateNow);
                var timeOffset = i * intervalDuration;
                var segs = this.segmentsToShow(now + timeOffset);
                periodSegments.push(segs); 
            }
            return periodSegments;
        },
        redraw0: function(dateNow){
            var now =  this.calculateNow(dateNow);
            var segments = this.segmentsToShow(now);
            drawingPath.removeSegments();
            drawingPath.addSegments(segments);
        },
        redraw: function(dateNow){
            this.periodSegmentsToShow(dateNow).forEach(function(segs, i){
                if(drawingPaths.length < i + 1){
                    drawingPaths.push(makePath(data));
                }
                var path = drawingPaths[i];
                path.removeSegments();
                path.addSegments(segs);
            });
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
