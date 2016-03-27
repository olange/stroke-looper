var io = {
    convertToJsonp: function(data){
        return "load(" + JSON.stringify(data) + ");"; 
    }};
io.files = {
    installUploader: function(uploadLink, load){
        var loader = document.createElement('input');
        loader.type = 'file';
        loader.style.display= 'none';
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
        loader.addEventListener('change', handleJson, false);
        uploadLink.addEventListener("click", loader.click.bind(loader), false);
    },
    dataAsUri: function(data){
        var jsonpData = io.convertToJsonp(data);
        var dataUriPrefix = 'data:application/javascript;base64,';
        return dataUriPrefix  + btoa(jsonpData);
    },
    installDownloader: function(downloadLink, getData){
        downloadLink.setAttribute('download', 'looper.jsonp');
        var download = function(){
            downloadLink.href = this.dataAsUri(getData());
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

    installSaver: function(saveGistLink, getData){
        var saver = function(){
            this.save(getData);
        }.bind(this);
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

    installLoader: function(loadGistLink, load){
        var promptGist = function(){
            var id = prompt("gist to load").trim();
            if(id){
                id = id.startsWith("https") ? id.split('/')[4] : id;
                this.load(id, load);
            }
        }.bind(this);
        loadGistLink.addEventListener("click", promptGist, false);
    }
};
