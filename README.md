# walk-folder-tree.js

[![Greenkeeper badge](https://badges.greenkeeper.io/overlookmotel/walk-folder-tree.svg)](https://greenkeeper.io/)

# Recursively walk file system tree and callback on every file

## Current status

[![NPM version](https://img.shields.io/npm/v/walk-folder-tree.svg)](https://www.npmjs.com/package/walk-folder-tree)
[![Build Status](https://img.shields.io/travis/overlookmotel/walk-folder-tree/master.svg)](http://travis-ci.org/overlookmotel/walk-folder-tree)
[![Dependency Status](https://img.shields.io/david/overlookmotel/walk-folder-tree.svg)](https://david-dm.org/overlookmotel/walk-folder-tree)
[![Dev dependency Status](https://img.shields.io/david/dev/overlookmotel/walk-folder-tree.svg)](https://david-dm.org/overlookmotel/walk-folder-tree)
[![Coverage Status](https://img.shields.io/coveralls/overlookmotel/walk-folder-tree/master.svg)](https://coveralls.io/r/overlookmotel/walk-folder-tree)

API is stable.

## Usage

### Installation

    npm install walk-folder-tree

### Loading

```js
var walk = require('walk-folder-tree');
```

### walk(path [, options] [, fn])

Recursively walks through the directory tree from `path` downwards, calling `fn` on every file and directory.

`fn` is called with the single argument `params`. `params` is of the form:

```js
{
    path: /* path relative to root path */,
    fullPath: /* full path of file */,
    name: /* filename of file */,
    directory: /* true if is a directory */,
    stat: /* stat object for the file (as returned from `fs.stat()`) */
}
```

`walk()` returns a promise.

```js
walk('/path/to/folder', function(params, cb) {
    console.log('Found file: ', params.path);
    cb();
}).then(function() {
    // do something else
});
```

#### walk(options)

`path` and `fn` can also be provided as attributes of `options`

```js
walk({
    path: '/path/to/folder',
    fn: function(params, cb) {
        console.log('Found file: ', params.path);
        cb();
    }
});
```

### `fn`

`fn` can alternatively be a promise-returning function. Just leave off the callback argument.

```js
walk('/path/to/folder', function(params) {
    return Promise.resolve().then(function() {
        console.log('Found file: ', params.path);
    });
})
```

`fn` can also be a generator. If so, it is wrapped using [co](https://www.npmjs.com/package/co) so you can `yield` promises.

```js
walk('/path/to/folder', function*(params) {
    yield Promise.resolve();
    console.log('Found file: ', params.path);
})
```

### Options

#### recurse

When `true`, recurses through subfolders and sub-subfolders, examining an entire tree. Set to `false` to ignore subfolders.
Defaults to `true`.

```js
walk('/path/to/folder', { recurse: false }, fn);
```

#### filterFiles

A regular expression for what files to include.
Defaults to `/^[^.]/` (i.e. ignore files starting with `.`)

```js
// include all files
walk('/path/to/folder', { filterFiles: /^.*$/ }, fn);
```

#### filterFolders

A regular expression for what folders to iterate into.
Defaults to `/^[^.]/` (i.e. process all folders except those beginning with `.`)

```js
// Process all folders except those starting with `.` or `_`
walk('/path/to/folder', { filterFolders: /^[^\._]/ }, fn);
```

#### return

If set to `true`, returns an array of all files and folders found.
Defaults to `false`.

```js
walk('/path/to/folder', { return: true }).then(function(files) {
    // files is array of params object for each file
});
```

#### sort

Function to sort files in each folder before processing.

```js
walk('/path/to/folder', {
    sort: function(a, b) {
        if (a > b) return -1;
        if (a < b) return 1;
        return 0;
    }
}, fn);
```

## Tests

Use `npm test` to run the tests. Use `npm run cover` to check coverage.

## Changelog

See changelog.md

## Issues

If you discover a bug, please raise an issue on Github. https://github.com/overlookmotel/walk-folder-tree/issues

## Contribution

Pull requests are very welcome. Please:

* ensure all tests pass before submitting PR
* add an entry to changelog
* add tests for new features
* document new functionality/API additions in README
