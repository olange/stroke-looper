var importExport = {
    convertToJsonp: function(data){
        return "load(" + JSON.stringify(data) + ");"; 
    },
    installFileUploader: function(uploadLinkId, handleUploadedData){
        // <a id="uploadFileLink">upload file</a>
        // <input type="file" id="uploadFileLinkLoader" style="display:none"/>
        var loaderId = uploadLinkId+'Loader';
        var upload = function(){
            document.getElementById(loaderId).click();
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
        var loader = document.getElementById(loaderId);
        loader.addEventListener('change', handleJson, false);
    },

    installFileDownloader: function(downloadLinkId, getData){
        // <a id="downloadFileLink" download="looper.jsonp">download</a> 
        var downloadLink = document.getElementById(downloadLinkId);
        var download = function(){
            var jsonpData = this.convertToJsonp(getData());
            var dataUriPrefix = 'data:application/javascript;base64,';
            downloadLink.href = dataUriPrefix  + btoa(jsonpData);
        }.bind(this);
        downloadLink.addEventListener('click', download, false);
    }
};
