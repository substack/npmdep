npmdep
======

Build dependency graphs for npm packages.

Usage
=====

* `npmdep update`

Fetch the list of packages (do this first)

* `npmdep requires [pkg]`

Show which packages require the package `pkg`.

    $ npmdep requires optimist
    deja
    forever
    htracr
    http-proxy
    m1node
    macrotest
    nmd
    pulverizr
    ready.js
    restartr
    watch-tree
    yeti


* `npmdep tree [pkg]`

Print out a tree of dependencies for the package `pkg`.

    $ npmdep tree seq
    seq
    -- chainsaw
    ---- traverse
    -- traverse

* `npmdep graph [image.png] {graphviz filter = fdp}`

Generate a graph of npm with graphviz.

    npmdep graph npm-fdp.png fdp

[![npm fdp](http://substack.net/images/npmdep/npm-fdp-prev.png)](http://substack.net/images/npmdep/npm-fdp.png)

    npmdep graph npm-twopi.png twopi

[![npm twopi](http://substack.net/images/npmdep/npm-twopi-prev.png)](http://substack.net/images/npmdep/npm-twopi.png)
