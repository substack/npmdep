var npmdep = require('npmdep');
var Hash = require('hashish');
var Traverse = require('traverse');
var Seq = require('seq');
var print = require('util').print;

var cmd = process.argv[2] || '';
if (cmd === 'update') {
    console.log('Fetching metadata for new packages...');
    npmdep.update(function (err, pkgs, updated) {
        if (err) console.error(err.stack ? err.stack : err)
        else console.log(
            'Update OK. %d packages updated. %d packages total.',
            Object.keys(updated).length,
            Object.keys(pkgs).length
        );
    });
}
else if (cmd.match(/^req/) && process.argv[3]) {
    var target = process.argv[3];
    npmdep.requires(target, function (err, pkgs) {
        if (err) console.error(err)
        else pkgs.forEach(function (pkg) {
            console.log(pkg)
        })
    });
}
else if (cmd.match(/^dep/) && process.argv[3]) {
    var target = process.argv[3];
    npmdep.deps(target, function (err, deps) {
        if (err) console.error(err.stack ? err.stack : err)
        else Object.keys(deps).forEach(function (dep) {
            console.log(dep)
        });
    })
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
else if (cmd === 'graph' && process.argv[3]) {
    var outfile = process.argv[3];
    var graphviz = require('graphviz');
    var g = graphviz.digraph('npm');
    g.use = process.argv[4] || 'fdp'; // also twopi looks pretty good
    
    npmdep.load(function (err, pkgs) {
        if (err) cb(err)
        else {
            Hash(pkgs).forEach(function (pkg, name) {
                var mag = 255 - Math.floor((Hash(pkgs).filter(function (p) {
                    return p.dependencies[name]
                }).length || 0) / 50 * 255);
                
                var fhex = mag.toString(16);
                if (fhex.length == 1) fhex = '0' + fhex;
                
                var node = g.addNode(name, {
                    style : 'filled',
                    fontcolor : mag > 150 ? 'black' : 'white',
                    fillcolor : '"' + '#' + fhex + fhex + fhex + '"',
                });
                
                var deps = pkg.dependencies || {};
                if (typeof deps !== 'object') {
                    var obj = {};
                    obj[deps] = '*';
                    deps = obj;
                }
                
                Object.keys(deps).forEach(function (dep) {
                    var edge = g.addEdge(name, dep, {
                        arrowhead : 'dot'
                    });
                });
            });
            
            g.output('png', outfile);
            console.log('Writing to ' + outfile + '...');
        }
    });
}
else {
    console.log('Commands:');
    ['update', 'requires [pkg]', 'tree [pkg]', 'graph [image.png]', 'deps [pkg]']
        .forEach(function (cmd) {
            console.log('    ' + cmd)
        })
    ;
    console.log();
}
