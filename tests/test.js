var webdriverio = require('webdriverio');
var assert = require('assert');
var options = {
    desiredCapabilities: {
        browserName: 'firefox'
    }
};
 
var dir = __dirname.substr(0,__dirname.indexOf('tests'));
dir = dir.replace(/\\/g, '/');
var url = 'file:///' + dir + 'index.html';
 
var error;
webdriverio
    .remote(options)
    .init()
    .url(url)
    .title(function(err,res) {
        assert.equal(res.value,'stroke looper');
    })
    .then().moveToObject('#myCanvas',10,20)
    .buttonDown()
    .moveToObject('#myCanvas',20,50)
    .moveToObject('#myCanvas',30,70)
    .buttonUp()
    .then(function(a){console.log('tests ok');},
            function(e){console.error("FAILED: ",e.message);error = e;})
    .end();
