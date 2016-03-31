var ui = {};
(function() {
    var createModal = function(){
        var modaldiv = document.createElement('div');
        modaldiv.style.cssText = "z-index:1; display:none; position:fixed";
        modaldiv.style.cssText += "top:0; left:0; width:100%; height:100%;";
        document.body.insertBefore(modaldiv, document.body.firstChild);
        var hide = function(e){
            if(!e || e.target === modaldiv){modaldiv.style.display='none';} };
        modaldiv.addEventListener('click', hide);
        return {replaceContent: function(c){
                    while (modaldiv.hasChildNodes()) {
                        modaldiv.removeChild(modaldiv.lastChild);
                    }
                    modaldiv.appendChild(c);
                },
                show: function(){ modaldiv.style.display=''; },
                hide: hide
               };
    };

    var createLifetimePicker = function (modal, handleLifetime, 
                                            initialLifetime, size)
    {
        var button = document.createElement('div');
        button.innerHTML = [
            '<div style="width:'+size+'px; height:'+size+'px;',
            ' background-color: white; font: 14px arial,sans-serif;',
            ' text-align: center; line-height:'+(size)+'px"',
            ' class="line-control-button">',
            '  <span style="">',
            initialLifetime+'</span>s',
            '</div>'
        ].join('');
        window.b = button;
        var number = button.lastChild.children[0];
        var lifetime =  initialLifetime ;
        var picker = {button: button, 
                      get: function(){return lifetime ;},
                      set: function(l){ 
                          lifetime= Math.round(l*10)/10 ;
                          number.innerHTML = lifetime;
                          if(handleLifetime){
                              handleLifetime(lifetime);
                          }
                      }};
        var pick = createSlider(0.1, 10, false, picker, modal, false);
        handleLifetime(initialLifetime);
        button.addEventListener('click', pick);
        return picker.button;
    };

    var createStrokeWidthPicker = function (modal, handleStrokeWidth, 
                                            initialStrokeWidth, size)
    {
        var button = document.createElement('div');
        button.innerHTML = [
            '<div style="width:'+size+'px; height:'+size+'px;',
            ' border-radius:50%; background-color: black; color:white;',
            ' text-align:center; vertical-align:middle;',
            ' line-height:'+(size-3)+'px"',
            ' class="line-control-button">',
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
        handleStrokeWidth(initialStrokeWidth);
        button.addEventListener('click', pick);
        return picker.button;
    };

    var insertLineControlButtonCss = function(size){
        var style = document.createElement('style');
        style.innerHTML = [
            '.line-control-button {',
            '  cursor: pointer;',
            '  width: '+size+'px;',
            '  height: '+size+'px;',
            '  margin: 5px;}'
        ].join('');
        document.getElementsByTagName('head')[0].appendChild(style);
    };

    var insertLooperControlButtonCss = function(){
        var style = document.createElement('style');
        style.innerHTML = [
            '.looper-control-button{',
            'font-size: 18px;',
            'padding: 9px 12px;',
            // 'margin: -5px 0px;',
            'background-color: #E0E0E0; ',
            'color: black;',
            'text-decoration:none;',
            'cursor: pointer}',
            '.looper-control-button:hover {background-color: #C0C0C0; }',
            '.looper-control-button:active {background-color: #A0A0A0; }'
        ].join('');
        document.getElementsByTagName('head')[0].appendChild(style);
    };

    var createLooperButton = function(parent, text){
        var button = document.createElement('a');
        button.className = 'looper-control-button';
        button.innerHTML = text;
        parent.appendChild(button);
        return button;
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
            container.style.left = rect.right + 'px';
            container.style.top = rect.top - 5+ 'px';
            field.value = picker.get();
            slider.value = fieldToSlider(field.value);
            modal.show();
        };
        return pickValue;
    };

    var createColorPicker = function (modal, handleColor, initialColor, 
                                      colors, size){

        //button
        var button = document.createElement('div');
        var picker = {button: button, color: initialColor};
        var colorPatch = document.createElement('div');
        button.appendChild(colorPatch);
        colorPatch.style.cssText = "width:"+size+"px; height:"+size+"px;"
            +" background-color:"+picker.color;
        colorPatch.className = 'line-control-button';

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
            container.style.left = rect.right + 'px';
            container.style.top = rect.top - 5 + 'px';
            modal.show();
        };
        
        handleColor(initialColor);
        button.addEventListener('click', pickColor);
        return picker.button;
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

    var createFileMenu = function(modal, parent, importData, exportData){
        var fileButton = createLooperButton(parent, "file");
        var container = document.createElement('div');
        var contCss = 'position: absolute; display: flex; flex-flow: column';
        container.style.cssText = contCss;

        var doImport = function(data){importData(data); modal.hide();};
        var doExport = function(){modal.hide();return exportData(); };

        var uploadFile = createLooperButton(container, "upload file");
        io.files.installUploader(uploadFile, doImport);

        var downloadFile = createLooperButton(container, "download file");
        io.files.installDownloader(downloadFile, doExport);

        var saveGist = createLooperButton(container, "save gist");
        io.gists.installSaver(saveGist, doExport);
        var loadGist = createLooperButton(container, "load gist");
        io.gists.installLoader(loadGist, doImport);
        fileButton.addEventListener('click', function(){
            modal.replaceContent(container);
            var butRect = fileButton.getBoundingClientRect();
            container.style.left = butRect.left + 'px';
            container.style.bottom = (pageHeight() - butRect.top)  +  'px';
            modal.show();
        });
    };
    
    var pageHeight = function(){
        var body = document.body,
            html = document.documentElement;
        return Math.max( body.scrollHeight, body.offsetHeight, 
                         html.clientHeight, html.scrollHeight, 
                         html.offsetHeight );
    };


    ui.install = function(opts){
        var modal = createModal();
        var size = 35;
        insertLineControlButtonCss(size);
        insertLooperControlButtonCss();
        insertSliderCss(size);

        var linOpts = opts.lineControl;
        var lineParent = document.getElementById(linOpts.id);
        var colors = makeColorRange();
        var lineControls = [
            createColorPicker(modal, linOpts.handleColor, colors[0], colors,
                              size),
            createStrokeWidthPicker(modal, linOpts.handleStrokeWidth, 5, size),
            createLifetimePicker(modal, linOpts.handleLifetime, 0.5, size)
        ].forEach(function(c){
            lineParent.appendChild(c);
        });

        var looOpts = opts.looperControl;
        var looperParent = document.getElementById(looOpts.id);
       
        ['clear', 'undo', 'redo', 'pause'].forEach(function(actionName){
            var button = createLooperButton(looperParent, actionName);
            button.addEventListener("click", looOpts[actionName], false);
        });
        createFileMenu(modal, looperParent, 
                       looOpts.importData, looOpts.exportData);
    };
})();










