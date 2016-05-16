var makeLine = function(color, strokeWidth, lifetime, start, intervalDuration,  multiPeriod){
    var data = {start: start,
                lineDuration: 0,
                lifetime: lifetime || 500,
                color: color || 'black',
                // multiPeriod requires a defined intervalDuration
                multiPeriod: intervalDuration && multiPeriod ,
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

    var initDuration = function(endDate){
        // The end time of the line, after the last point is drawn.
        // This is important when there is no interval duration,
        // as it keeps the line from restarting immediately.
        var elapsed = endDate - data.start;
        /* .start    .endDate
           ---------->  elapsed */
        if(elapsed < 0){ 
            /* We're going back in time. Dates are deaths, not births.
                 .endDate  .start
                 <----------  elapsed 
            -----> lifetime  
            --------------->  elapsed (corrected) */
            elapsed = Math.abs(elapsed) + data.lifetime;
        }
        
        if(!intervalDuration){
            data.lineDuration = elapsed ;
        }else{
            /*
             .start    .endDate
             ---------->    elapsed
             ......>......> intervalDurations
             .............> lineDuration:
                 lowest multiple of intervalDuration greater than elapsed
             */
            var intvCount =  Math.max(1, Math.ceil(elapsed/intervalDuration));
            data.lineDuration = intvCount * intervalDuration;
        }
    };
    
    var calculateNow =  function(dateNow){
        /*
         Calculates the time since the beginning of the current interval.

         .start                          .dateNow
         --------------------------------> totalElapsedTime

         .....>.....>.....>.....>.....> intervalDurations (if multiPeriod) 
                                       --> elapsed (since last looper interval)

         ...........>...........> lineDurations  (if not multiPeriod) 
                                 --------> elapsed (since last line interval)

         .dateNow                        .start
         <-------------------------------- totalElapsedTime
      .....>.....>.....>.....>.....>.....> intervalDurations (if multiPeriod) 
      ---> elapsed (since last looper interval)
      ...........>...........> lineDurations 
      --------> elapsed (since last line interval)


         */
        var totalElapsedTime = dateNow - data.start;
        var duration = data.multiPeriod? intervalDuration : data.lineDuration;
        // There is no data.lineDuration while the line is being drawn.
        duration = duration || totalElapsedTime + 1;
        // Time since the start of last interval.

        var elapsed = totalElapsedTime % duration;
        /* elapsed time can be negative when speed < 0
         .start                      .start + duration
         .-----------------> elapsed = now
         
         .start - duration           .start
                   elapsed <---------. 
         ------------------> now = elapsed + duration
         */
        elapsed = elapsed < 0 ? duration + elapsed : elapsed;

        // Shift to negative period if line was recorded in reverse
        //(So we don't to shiftTimesIntoPositive in completeCreation.)
        var first = Math.min(data.times[0], data.times[data.times.length-1]);
        if(!data.multiPeriod && data.lineDuration && first){ 
            // We don't need this for multiperiod,
            // because periodSegmentsToShow already shifts into the negative
            // TODO do this in periodSegmentsToShow timeOffset
            elapsed += duration * Math.floor(first / duration);
        }
        return elapsed;
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
            var periodsWithData = 1; 
            var emptyPeriods = 0;
            var ts = data.times;
            if(data.multiPeriod && ts.length > 0){
                var last = Math.max(ts[ts.length-1], ts[0]);
                var first = Math.min(ts[ts.length-1], ts[0]);
                var totalPeriods = Math.ceil(last / intervalDuration);
                emptyPeriods = Math.floor(first / intervalDuration);
                periodsWithData = totalPeriods - emptyPeriods;
            }
            var periodSegments = [];
            var now  = calculateNow(dateNow);
            for(var i = 0; i < periodsWithData; i++){
                var timeOffset = (emptyPeriods + i) * intervalDuration || 0;
                var segs = this.segmentsToShow(now + timeOffset);
                periodSegments.push(segs); 
            }
            return periodSegments;
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
            var elapsed = dateNow - data.start;
            var birth = elapsed;
            if(elapsed < 0){
                /* Going backwards, segments appear at death time.
                .birth      .dateNow
                ------------>  lifetime */
                birth -= lifetime;
            }
            var segment = {point: point};
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
            drawingPaths.forEach(function(drawingPath){
                drawingPath.removeSegments();
            });
        },
        exportData: function(){
            var exported = new Object(data);
            exported.segments = referencePath.segments.map(function(s){
                return [s.point.x, s.point.y]; 
            });
            return exported;
        },
        importData: function(newdata){
            this.clear();
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
