var importExport = {
    installUploader: function(uploadLinkId, jsonLoaderId, handleUploadedData){
        // <a id="uploadLink">upload</a>
        // <input type="file" id="jsonLoader" style="display:none"/>

        var upload = function(){
            document.getElementById('jsonLoader').click();
        };

        var load = function(data){
            handleUploadedData(data);
        };

        var handleJson = function(uploadEvent){
            var reader = new FileReader();
            reader.onload = function(readerEvent){
                var b64content = readerEvent.target.result;
                var b64 = "base64,";
                var b64index = b64content.indexOf(b64) + b64.length;
                b64content.substr(b64index);
                var content = atob(b64content.substr(b64index));
                eval(content);
            };
            reader.readAsDataURL(uploadEvent.target.files[0]);     
        };

        var uploadLink = document.getElementById(uploadLinkId);
        uploadLink.addEventListener("click", upload, false);
        var jsonLoader = document.getElementById(jsonLoaderId);
        jsonLoader.addEventListener('change', handleJson, false);
    },
    installDownloader: function(downloadLinkId, getData){
        // <a id="downloadLink" download="looper.jsonp">download</a> 

        var download = function(){
            var jsonpData = "load(" + JSON.stringify(getData()) + ");";
            var dataUriPrefix = 'data:application/javascript;base64,';
            this.href = dataUriPrefix  + btoa(jsonpData);
        };
        
        var downloadLink = document.getElementById(downloadLinkId);
        downloadLink.addEventListener('click', download, false);
    }
};
