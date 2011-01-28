var npmdep = require('npmdep');
var Hash = require('traverse/hash');
var Traverse = require('traverse');
var print = require('util').print;

var cmd = process.argv[2];
if (cmd === 'update') {
    console.log('Fetching packages...');
    npmdep.update(function (err, pkgs) {
        if (err) console.error(err.stack ? err.stack : err)
        else console.log(
            'Update OK. %d packages updated.',
            Object.keys(pkgs).length
        );
    });
}
else if (cmd === 'requires' && process.argv[3]) {
    var target = process.argv[3];
    npmdep.requires(target, function (err, pkgs) {
        if (err) console.error(err)
        else pkgs.forEach(function (pkg) {
            console.log(pkg)
        })
    });
}
else if (cmd === 'tree' && process.argv[3]) {
    var start = process.argv[3];
    npmdep.tree(start, function (err, tree) {
        if (err) console.error(err)
        else {
            Traverse(tree).forEach(function (node) {
                for (var i = 0; i < this.level; i++) print('--')
                if (this.isRoot) {
                    console.log(start)
                }
                else {
                    console.log(' ' + this.key)
                }
            })
        }
    });
}
else {
    console.log('Commands: update, requires [pkg], tree [pkg]');
}
