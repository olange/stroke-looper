var gists = {
    saveToGist: function(getData){
        var fileContent = importExport.convertToJsonp(getData());
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

    installGistSaver: function(saveGistLinkId, getData){
        var save = function(){
            this.saveToGist(getData);
        }.bind(this);
        var saveGistLink = document.getElementById(saveGistLinkId);
        saveGistLink.addEventListener("click", save, false);
    },

    loadFromGist: function(id, load){
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

    installGistLoader: function(loadGistLinkId, load){
        var promptGist = function(){
            var id = prompt("gist to load").trim();
            id = id.startsWith("https") ? id.split('/')[4] : id;
            this.loadFromGist(id, load);
        }.bind(this);
        var loadLink = document.getElementById(loadGistLinkId);
        loadLink.addEventListener("click", promptGist, false);
    }
};
