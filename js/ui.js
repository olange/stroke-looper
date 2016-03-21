var ui = {};
(function() {
    var createModal = function(){
        var div = document.createElement('div');
        div.style.cssText = "z-index:1; display:none; position:fixed";
        div.style.cssText += "top:0; left:0; width:100%; height:100%;";
        document.body.insertBefore(div, document.body.firstChild);
        var hide = function(e){
            if(!e || e.target === div){div.style.display='none';} };
        div.addEventListener('click', hide);
        return {replaceContent: function(c){
                    while (div.hasChildNodes()) {
                        div.removeChild(div.lastChild);
                    }
                    div.appendChild(c);
                },
                show: function(){ div.style.display=''; },
                hide: hide
               };
    };

    var createLongevityPicker = function (modal, handleLongevity, 
                                            initialLongevity, size)
    {
        var button = document.createElement('div');
        button.innerHTML = [
            '<div style="width:'+size+'px; height:'+size+'px;',
            ' background-color: white; font: 14px arial,sans-serif;',
            ' text-align: center;',
            ' line-height:'+(size)+'px">',
            '  <span style="">',
            initialLongevity+'</span>s',
            '</div>'
        ].join('');
        window.b = button;
        var number = button.lastChild.children[0];
        var longevity =  initialLongevity ;
        var picker = {button: button, 
                      get: function(){return longevity ;},
                      set: function(l){ 
                          longevity= Math.round(l*10)/10 ;
                          number.innerHTML = longevity;
                          if(handleLongevity){
                              handleLongevity(longevity);
                          }
                      }};
        var pick = createSlider(0.1, 10, false, picker, modal, false);
        button.addEventListener('click', pick);
        return picker;
    };

    var createStrokeWidthPicker = function (modal, handleStrokeWidth, 
                                            initialStrokeWidth, size)
    {
        var button = document.createElement('div');
        button.innerHTML = [
            '<div style="width:'+size+'px; height:'+size+'px;',
            ' border-radius:50%; background-color: black; color:white;',
            ' text-align:center; vertical-align:middle;',
            ' line-height:'+(size-3)+'px">',
            '  <span style="font: 14px arial,sans-serif;">',
            initialStrokeWidth+'</span>',
            '</div>'
        ].join('');
        var number = button.lastChild.lastChild;
        var width = initialStrokeWidth;
        var picker = {button: button, 
                      get: function(){return width;},
                      set: function(w){ 
                          width=w;
                          number.innerHTML = w;
                          if(handleStrokeWidth){
                              handleStrokeWidth(w);
                          }
                      }};
        var pick = createSlider( 0, 6.5, true, picker, modal, false);
        button.addEventListener('click', pick);
        return picker;
    };

    var insertLineConfigCss = function(size){
        var style = document.createElement('style');
        style.innerHTML = [
            '#line-config {',
            '  vertical-align: top;',
            '  background-color: #E0E0E0;}',
            '#line-config > div {',
            '  cursor: pointer;',
            '  width: '+size+'px;',
            '  height: '+size+'px;',
            '  margin: 5px;}'
        ].join('');
        document.getElementsByTagName('head')[0].appendChild(style);
    };

    var insertSliderCss = function(size){
        var style = document.createElement('style');
        style.innerHTML = [
            '.slider {',
            '  height:'+(size + 10 )+'px; background-color:#E0E0E0; ',
            '  display: flex; align-items: stretch; position:absolute; }',
            '.slider > input[type=range] { height: 100%;}',
            '.slider > input[type=text] {',
            ' text-align:right; width: 22px; padding: 5px; margin: 5px;}',
            '.slider > a {',
            '  vertical-align: middle; line-height: '+(size + 10)+'px;' ,
            '  padding: 0 5px;}',
        ].join('');
        document.getElementsByTagName('head')[0].appendChild(style);
    };

    var createSlider = function(min, max, loga, picker, modal, confirm){
        var container = document.createElement('div');
        container.className = 'slider'; 
        container.innerHTML = [
            '<input type="range" max="'+max+'" min="'+min+'" step="0.1">',
            '<input type="text" value="'+picker.get()+'">'
        ].join("");
        if(confirm){
            container.innerHTML += '<a>&#10008;</a><a>&#10004;</a>';
            var cancel = container.children[2];
            var ok = container.children[3];
        }
        var slider = container.firstChild;
        var field = container.children[1];
        var sliderToField = function(v){ return v;};
        var fieldToSlider = sliderToField;
        if(loga){
            sliderToField = function(logv){
                return Math.floor(Math.pow(Math.E, logv));
            };
            fieldToSlider = Math.log.bind(Math);
        }
        slider.value = fieldToSlider(picker.get());
        field.addEventListener('input', function(event){
            if(isNaN(event.target.value)){
                field.value = sliderToField(slider.value);
            }else{
                var value = parseFloat(event.target.value);
                slider.value = fieldToSlider(value);
            }
            if(!confirm){
                picker.set(field.value);
            }
        });
        slider.addEventListener('input', function(event){
            var value = parseFloat(event.target.value);
            field.value = sliderToField(value);
            if(!confirm){
                picker.set(field.value);
            }
        });
        if(confirm){
            ok.addEventListener('click', function(){
                picker.set(field.value);
                modal.hide();
            });
            cancel.addEventListener('click', function(){
                field.value = picker.get();
                slider.value = fieldToSlider(field.value);
                modal.hide();
            });
        }

        var pickValue = function(e){
            var rect = picker.button.getBoundingClientRect();
            modal.replaceContent(container);
            container.style.left = rect.right + 3 + 'px';
            container.style.top = rect.top - 5+ 'px';
            field.value = picker.get();
            slider.value = fieldToSlider(field.value);
            modal.show();
        };
        return pickValue;
    };

    var createColorPicker = function (modal, handleColor, colors, size){

        //button
        var button = document.createElement('div');
        var picker = {button: button, color: colors[0]};
        var colorPatch = document.createElement('div');
        button.appendChild(colorPatch);
        colorPatch.style.cssText = "width:"+size+"px; height:"+size+"px;"
            +" background-color:"+picker.color;
        
        //dialog
        var container = document.createElement('div');
        var contCss = 'background-color:#E0E0E0; width:'+(16*(size+4))+'px;';
        contCss += 'padding:3px; position:absolute';
        container.style.cssText = contCss;
        var cssStyle = "float:left; margin:2px;";
        cssStyle += "width:"+size+"px; height:"+size+"px";
        colors.forEach(function(colorCss){
            var color = document.createElement('div');
            color.style.cssText = cssStyle;
            color.style.backgroundColor = colorCss;
            color.addEventListener('click', function(){
                if(handleColor){
                    handleColor(colorCss);
                    colorPatch.style.backgroundColor = colorCss;
                    picker.color = colorCss;
                }
                modal.hide();
            });
            container.appendChild(color);
        });

        var pickColor = function(){
            modal.replaceContent(container);
            var rect = button.getBoundingClientRect();
            container.style.left = rect.right + 3 + 'px';
            container.style.top = rect.top - 5 + 'px';
            modal.show();
        };
        
        button.addEventListener('click', pickColor);
        return picker;
    };

    var makeColorRange = function(){
        var parts = ['00','77', 'aa', 'ff'];
        var colors = [];
        parts.forEach(function(p1){
            parts.forEach(function(p2){
                parts.forEach(function(p3){
                    colors.push( '#' + p1 + p2 + p3);
                });
            });
        });
        return colors;
    };

    ui.install = function(opts){
        var modal = createModal();
        var size = 35;
        insertLineConfigCss(size);
        insertSliderCss(size);
        ui.colorPicker = createColorPicker(
            modal, opts.handleColor, makeColorRange(), size);
        var lineConfig = document.getElementById('line-config');
        lineConfig.appendChild(ui.colorPicker.button);

        ui.strokeWidthPicker = createStrokeWidthPicker(
            modal, opts.handleStrokeWidth, 2, size);
        lineConfig.appendChild(ui.strokeWidthPicker.button);

        ui.longevityPicker = createLongevityPicker(
            modal, opts.handleLongevity, 0.5, size);
        lineConfig.appendChild(ui.longevityPicker.button);
    };
})();
