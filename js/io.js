var io = {
    convertToJsonp: function(data){
        return "load(" + JSON.stringify(data) + ");"; 
    }};
io.files = {
    installUploader: function(uploadLinkId, load){
        // <a id="uploadFileLink">upload file</a>
        // <input type="file" id="uploadFileLinkLoader" style="display:none"/>
        var loaderId = uploadLinkId+'Loader';
        var upload = function(){
            document.getElementById(loaderId).click();
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

    installDownloader: function(downloadLinkId, getData){
        // <a id="downloadFileLink" download="looper.jsonp">download</a> 
        var downloadLink = document.getElementById(downloadLinkId);
        var download = function(){
            var jsonpData = io.convertToJsonp(getData());
            var dataUriPrefix = 'data:application/javascript;base64,';
            downloadLink.href = dataUriPrefix  + btoa(jsonpData);
        }.bind(this);
        downloadLink.addEventListener('click', download, false);
    }
};
io.gists = {
    save: function(getData){
        var fileContent = io.convertToJsonp(getData());
        var content = 
            {description: "stroke looper animation",
             public: true,
             files: {"looper.jsonp": {content: fileContent}}};
        return ajax.HTTPrequest('https://api.github.com/gists', 'POST',
                                {"Content-Type": "application/json"},
                                JSON.stringify(content))
            .then(JSON.parse)
            .then(function(data){
                console.log(data);
                urlUtils.addUrlParams({gist: data.id});
            },console.error.bind(console));
    },

    installSaver: function(saveGistLinkId, getData){
        var saver = function(){
            this.save(getData);
        }.bind(this);
        var saveGistLink = document.getElementById(saveGistLinkId);
        saveGistLink.addEventListener("click", saver, false);
    },

    load: function(id, load){
        return ajax.HTTPrequest('https://api.github.com/gists/'+id, 'GET')
            .then(JSON.parse)
            .then(function(data){
                console.log("load gist " + data.html_url);
                for(var fileName in data.files){
                    eval(data.files[fileName].content);
                    urlUtils.addUrlParams({gist: id});
                    break; //there's only ever one file
                }
            },console.error.bind(console));
    },

    installLoader: function(loadGistLinkId, load){
        var promptGist = function(){
            var id = prompt("gist to load").trim();
            id = id.startsWith("https") ? id.split('/')[4] : id;
            this.load(id, load);
        }.bind(this);
        var loadLink = document.getElementById(loadGistLinkId);
        loadLink.addEventListener("click", promptGist, false);
    }
};
