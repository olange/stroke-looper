var urlUtils = {
    getUrlParams : function(){
        // http://stackoverflow.com/questions/8648892/
        var search = location.search.substring(1);
        if(!search){
            return {};
        }
        return JSON.parse(
            '{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}',
            function(k, v) { return k === "" ? v : decodeURIComponent(v); });
    },
    addUrlParams : function(newParameters){
        var parameters = this.getUrlParams();
        for(var nkey in newParameters){
            parameters[nkey] = encodeURIComponent(newParameters[nkey]);
        }
        var newSearch = "";
        for(var okey in parameters){
            newSearch += newSearch ? "&" : "?";
            newSearch += okey  + "=" + parameters[okey];
        }
        var newUrl = location.pathname + newSearch;
        history.pushState(null, null, newUrl);
    }
};
