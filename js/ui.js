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

    var createStrokeWidthPicker = function (modal, handleStrokeWidth, 
                                            initialStrokeWidth )
    {
        var size = 25;

        //button
        var button = document.createElement('div');
        button.innerHTML = [
            '<div style="width:'+size+'px; height:'+size+'px;',
            ' border-radius:50%; background-color: black; color:white;',
            ' text-align:center; vertical-align:middle;',
            ' line-height:'+(size-3)+'px">',
            '  <span style="color:white; font: 10px arial,sans-serif;">',
            initialStrokeWidth+'</span>',
            '</div>'
        ].join('');
        var number = button.lastChild.lastChild;
        var picker = {button: button, width: initialStrokeWidth};
        
        //dialog
        var style = document.createElement('style');
        style.innerHTML = [
            '.width-picker {',
            '  height:' + (size + 5) + 'px; background-color:#E0E0E0; ',
            '  padding:3px; position:absolute }',
            '.width-picker > input, .width-picker > a {',
            '  vertical-align:middle; margin:0 2px 0 2px;',
            '  padding: 0 4px 0 4px;}',
        ].join('');
        document.getElementsByTagName('head')[0].appendChild(style);
        var container = document.createElement('div');
        container.className = 'width-picker'; 
        container.innerHTML = [
            '<input style="height:100%" max="600" min="1" type="range">',
            '<input style="width:30px" type="text" value="'+picker.width+'">',
            '<a>&#10008;</a><a>&#10004;</a>'
        ].join("");
        var slider = container.firstChild;
        var field = container.children[1];
        var cancel = container.children[2];
        var ok = container.children[3];
        slider.value = picker.width;
        var updateWidth = function(event){
            var inputValue = parseFloat(event.target.value);
            var value = isNaN(inputValue) ? slider.value : inputValue ;
            field.value = value;
            slider.value = value;
        };
        slider.addEventListener('input', updateWidth);
        field.addEventListener('input', updateWidth);
        ok.addEventListener('click', function(){
            picker.width = slider.value;
            number.innerHTML = slider.value;
            if(handleStrokeWidth){
                handleStrokeWidth(slider.value);
            }
            modal.hide();
        });
        cancel.addEventListener('click', function(){
            field.value = picker.width;
            slider.value = picker.width;
            modal.hide();
        });

        var pickStrokeWidth = function(){
            modal.replaceContent(container);
            var rect = button.getBoundingClientRect();
            container.style.left = rect.right + 3 + 'px';
            container.style.top = rect.top - 5 + 'px';
            field.value = picker.width;
            slider.value = picker.width;
            modal.show();
        };
        
        button.addEventListener('click', pickStrokeWidth);
        return picker;
    };

    var createColorPicker = function (modal, handleColor, colors){
        var size = 25;

        //button
        var button = document.createElement('div');
        var picker = {button: button, color: colors[0]};
        var colorPatch = document.createElement('div');
        button.appendChild(colorPatch);
        colorPatch.style.cssText = "width:"+size+"px; height:"+size+"px;"
            +" background-color:"+picker.color;
        
        //dialog
        var container = document.createElement('div');
        container.style.cssText = 'background-color:#E0E0E0; width:116px';
        container.style.cssText += 'padding:3px; position:absolute';
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
        ui.colorPicker = createColorPicker(
            modal, opts.handleColor,
            makeColorRange());
        var lineConfig = document.getElementById('line-config');
        lineConfig.appendChild(ui.colorPicker.button);

        ui.strokeWidthPicker = createStrokeWidthPicker(
            modal, opts.handleStrokeWidth, 2);
        lineConfig.appendChild(ui.strokeWidthPicker.button);
    };
})();
