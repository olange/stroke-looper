var ui = {};
(function() {
    var createModal = function(){
        var div = document.createElement('div');
        div.style.cssText = "z-index:1; display:none; position:fixed";
        div.style.cssText += "top:0; left:0; width:100%; height:100%;";
        document.body.insertBefore(div, document.body.firstChild);
        return {replaceContent: function(c){
                    while (div.hasChildNodes()) {
                        div.removeChild(div.lastChild);
                    }
                    div.appendChild(c);
                },
                show: function(){ div.style.display=''; },
                hide: function(){ div.style.display='none'; }
               };
    };

    var createColorPicker = function (modal, handleColor, colors){
        var button = document.createElement('div');
        var picker = {button: button, color: colors[0]};
        button.style.backgroundColor = picker.color;
        
        var container = document.createElement('div');
        container.style.cssText = 'background-color:#E0E0E0;';
        container.style.cssText += 'padding:2px; position: relative';
        var promise = false;
        var cssStyle = "display:inline-block; margin:2px;";
        cssStyle += "width:20px; height:20px";
        colors.forEach(function(colorCss){
            var color = document.createElement('div');
            color.style.cssText = cssStyle;
            color.style.backgroundColor = colorCss;
            color.addEventListener('click', function(){
                if(handleColor){
                    handleColor(colorCss);
                    button.style.backgroundColor = colorCss;
                    picker.color = colorCss;
                }
                modal.hide();
            });
            container.appendChild(color);
        });

        
        var pickColor = function(){
            modal.replaceContent(container);
            var rect = button.getBoundingClientRect();
            console.log(rect);
            container.style.left = rect.right + 'px';
            container.style.top = rect.top + 'px';
            modal.show();
        };
        
        button.addEventListener('click', pickColor);

        
        return picker;
    };

    ui.install = function(opts){
        var modal = createModal();
        ui.colorPicker = createColorPicker(
            modal, opts.handleColor,
            ['black','white','red','green','blue','orange']);
        var lineConfig = document.getElementById('line-config');
        lineConfig.appendChild(ui.colorPicker.button);
    };
})();
