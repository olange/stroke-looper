var ui = {};
(function() {
    var createModal = function(){
        var modal = document.createElement('div');
        modal.style.width = '100%';
        modal.style.height = '100%';
        // modal.style.backgroundColor = 'rgba(50,50,50,0.3)';
        modal.style.zIndex = '1';
        modal.style.display = 'none';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        document.body.insertBefore(modal, document.body.firstChild);
        return modal;
    };

    var removeChildren = function(div){
        while (div.hasChildNodes()) {
            div.removeChild(div.lastChild);
        }
    };

    var createColorPicker = function (modal, colors){
        var container = document.createElement('div');
        // container.style.left = x + 'px';
        // container.style.top = y + 'px';
        var colorPicker = {modal: modal, 
                           container: container,
                           promise: {resolve: console.log.bind(console)}};
        colors.forEach(function(colorCss){
            var color = document.createElement('div');
            color.style.backgroundColor = colorCss;
            color.style.width = '30px';
            color.style.height = '30px';
            color.style.display = 'inline-block';
            color.addEventListener('click', function(){
                if(colorPicker.promise){
                    colorPicker.promise.resolve(colorCss);
                }
                modal.style.display = 'none';
            });
            container.appendChild(color);
        });
        return colorPicker;
    };

    var pickColor = function(colorPicker){
        removeChildren(colorPicker.modal);
        colorPicker.modal.appendChild(colorPicker.container);
        colorPicker.modal.display = '';
        return new Promise(function(resolve, reject){
            colorPicker.promise.resolve = resolve;
        });
    };
    
    ui.install= function(){
        var modal = createModal();
        var colorPicker = createColorPicker(modal, ['red','green','blue']);

        var colorPickerButton = document.createElement('div');
        colorPickerButton.innerHTML = 'col';
        
        var lineConfig = document.getElementById('line-config');
        lineConfig.appendChild(colorPickerButton);
        
        colorPickerButton.addEventListener('click', function(){
            modal.style.display = '';
            pickColor(colorPicker).then(function(colorCss){
                console.log('the color: ', colorCss);
            });
        });
    };
})();
