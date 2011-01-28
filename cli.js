var npmdep = require('npmdep');
var Hash = require('traverse/hash');

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
else {
    console.log('Commands: update, requires [pkg]');
}
