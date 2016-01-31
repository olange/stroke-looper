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
    .execute(function(){ return looper.getData();})
    .then(function(ret){ 
        var data = ret.value;
        assert.equal(1, data.lineData.length);
        var line = data.lineData[0];
        assert.equal(3, line.segments.length);
        //console.log(line.segments);
        assert.deepEqual([20,50], line.segments[0].point);
        assert.deepEqual([30,70], line.segments[1].point);
        assert.deepEqual([30,70], line.segments[2].point);
    })
    .then(function(a){console.log('tests ok');},
            function(e){console.error("FAILED: ",e.message);error = e;})
    .end();
