var npm = require('npm');
var Seq = require('seq');
var Hash = require('traverse/hash');

var fs = require('fs');
var path = require('path');
var cacheFile = __dirname + '/.cache';

var packages = null;

exports.load = function (cb) {
    if (packages) {
        cb(null, packages)
    }
    else {
        fs.readFile(cacheFile, 'utf8', function (err, file) {
            if (err) cb(err)
            else cb(null, JSON.parse(file));
        })
    }
};

exports.requires = function (target, cb) {
    exports.load(function (err, pkgs) {
        if (err) cb(err)
        else cb(null, Hash(pkgs).filter(function (pkg, name) {
            return pkg.dependencies[target]
        }).keys)
    })
};

exports.tree = function (start, cb) {
    exports.load(function (err, pkgs) {
        if (err) cb(err)
        else cb(null, (function walk (node) {
            var tree = {};
            var deps = Object.keys(pkgs[node].dependencies || {});
            deps.forEach(function (name) {
                tree[name] = walk(name)
            })
            return tree;
        })(start));
    })
};

exports.update = function (cb) {
    function after (err, pkgs) {
        if (err) cb(err)
        else {
            packages = pkgs;
            cb(null, pkgs);
        }
    }
    
    path.exists(cacheFile, function (ex) {
        if (ex) {
            exports.load(function (err, pkgs) {
                if (err) cb(err)
                else updateCache(pkgs, after);
            });
        }
        else updateCache({}, after)
    });
};

function updateCache (cached, cb) {
    // Skip over these broken packages.
    var blacklist = [ 'balancer' ];
    
    npm.load({ outfd : null }, function () {
        npm.commands.list(['latest'], function (err, pkgs) {
            var names = Object.keys(pkgs)
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
                    }).bind(this), 250);
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
                    
                    cb(null, cached);
                })
                .catch(cb)
            ;
        })
    });
}
