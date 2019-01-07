// --------------------
// walk-folder-tree module
// --------------------

// modules
var pathModule = require('path'),
    Promise = require('bluebird'),
    promisify = require('promisify-any'),
    fs = Promise.promisifyAll(require('fs'));

// exports
module.exports = function(path, options, fn) {
    // conform arguments
    // allow ({path: [path]}, fn)
    if (typeof path != 'string') {
        fn = options;
        options = path;
        path = undefined;
    }

    // allow (path, fn, options) for backward-compatibility
    if (typeof options == 'function') {
        var tmp = fn;
        fn = options;

        if (tmp) {
            console.log('WARNING: walk-folder-tree module: walk(path, fn, options) argument order is deprecated. Support may be removed in later versions. Use (path, options, fn) instead');
            options = tmp;
        }
    }

    // allow ({path: [path], fn: [fn]})
    if (!options) options = {};
    if (!path) {
        path = options.path;
        if (!path) throw new Error('`path` must be provided');
    }
    if (!fn) fn = options.fn;

    // conform options
    options = Object.assign({
		recurse: true,
		filterFiles: /^[^.]/,
		return: false
        //sort: undefined
	}, options);

    if (!options.filterFolders) {
        options.filterFolders = options.filterFiles;
    }

    // convert fn to promise-returning function
    if (fn) {
        fn = promisify(fn, 1);
    }

    // process directory's contents
    var files;
    if (options.return) {
        files = []
    };

    return processFiles('')
    .then(function() {
        return files;
    });

    function processFiles(folderPath) {
        var folders = [];

        // iterate through directory contents
        return fs.readdirAsync(pathModule.join(path, folderPath))
        .then(function(files) {
            return files.sort(options.sort);
        })
        .each(function(filename) {
            var filePath = pathModule.join(folderPath, filename),
                fullPath = pathModule.join(path, filePath);

            return fs.statAsync(fullPath)
            .then(function(stat) {
                // process file/folder
                var isDir = stat.isDirectory(),
                    filter = isDir ? options.filterFolders : options.filterFiles;
                
                if (!filename.match(filter)) { 
                    return;
                };

                if (isDir && options.recurse) folders.push(filePath);

                var params = {
                    path: filePath,
                    fullPath: fullPath,
                    name: filename,
                    directory: isDir,
                    stat: stat
                };

                if (options.return) {
                    files.push(params);
                }

                if (fn) {
                    return fn(params);
                }
            });
        })
        .then(function() {
            // process folders
            return Promise.each(folders, processFiles);
        });
    }
};
