var importExport = {
    /*
curl -H "Content-Type: application/json" -d '{"description": "the description  for this gist","public": true,"files": {"file1.txt": {"content": "String file
contents"}}}' https://api.github.com/gists

curl https://api.github.com/gists/11db17b9704428e93fae
 */
    HTTPrequest : function(url, verb, headers, content){
        return new Promise(function(resolve, reject) {
            var req = new XMLHttpRequest();
            req.open(verb, url);
            if (headers){
                for(var key in headers){
                    req.setRequestHeader(key, headers[key]);
                }
            }
            req.onload = function() {
                if (req.status == 200) {
                    resolve(req.response);
                } else {
                    reject(Error(req.statusText));
                }
            };
            req.onerror = function() {
                reject(Error("Network Error"));
            };
            if(content){
                req.send(encodeURIComponent(content));
            }else{
                req.send();
            }
        });
    },
    loadFromGist: function(id, load){
        return this.HTTPrequest('https://api.github.com/gists/'+id, 'GET')
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
    installGistLoader: function(loadGistLink, load){
        var promptGist = function(){
            var id = prompt("gist to load").trim();
            id = id.startsWith("https") ? id.split('/')[4] : id;
            this.loadFromGist(id, load);
        }.bind(this);
        var loadLink = document.getElementById(loadGistLink);
        loadLink.addEventListener("click", promptGist, false);
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
        var download = function(){
            var jsonpData = "load(" + JSON.stringify(getData()) + ");";
            var dataUriPrefix = 'data:application/javascript;base64,';
            this.href = dataUriPrefix  + btoa(jsonpData);
        };
        var downloadLink = document.getElementById(downloadLinkId);
        downloadLink.addEventListener('click', download, false);
    }
};
