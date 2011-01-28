var npm = require('npm');
var Seq = require('seq');
var Hash = require('traverse/hash');

var fs = require('fs');
var path = require('path');
var cacheFile = __dirname + '/.cache';

// Skip over these broken packages.
var blacklist = [ 'balancer' ];

var cached = {};
if (path.existsSync(cacheFile)) {
    cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
}

npm.load({ outfd : null }, function () {
    npm.commands.list(['latest'], function (err, packages) {
        var names = Object.keys(packages)
            .filter(function (name) {
                return blacklist.indexOf(name.split('@')[0]) < 0
            })
        ;
        
        var newNames = [];
        names.forEach(function (name) {
            var nv = name.split('@');
            var n = nv[0], v = nv[1];
            if (!cached[n] || cached[n].latest !== v) {
                newNames.push(name);
            }
        });
        
        Seq.ap(newNames)
            .parMap(4, function (name) {
                console.log(name);
                
                setTimeout((function () {
                    npm.commands.view([ name, 'dependencies' ], this);
                }).bind(this), 500);
            })
            .seq(function () {
                Hash(newNames, this.stack).forEach(function (pkg, name) {
                    var nv = name.split('@');
                    var n = nv[0], v = nv[1];
                    cached[n] = {
                        latest : v,
                        dependencies : pkg[name] && pkg[name].dependencies || {}
                    };
                });
                
                if (newNames.length) {
                    fs.writeFile(cacheFile, JSON.stringify(cached));
                }
                
                console.dir(cached);
            })
        ;
    })
});
