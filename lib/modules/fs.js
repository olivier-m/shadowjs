/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const {Cc, Ci} = require("chrome");
const file = require("sdk/io/file");
const system = require("sdk/system");

const dirsvc = Cc["@mozilla.org/file/directory_service;1"]
             .getService(Ci.nsIProperties);

function MozFile(path) {
    var f = Cc['@mozilla.org/file/local;1']
                .createInstance(Ci.nsILocalFile);
    f.initWithPath(path);
    return f;
}

exports.separator = system.platform === "WINNT" && "\\" || "/";

exports.workingDirectory = dirsvc.get("CurWorkD", Ci.nsIFile).path;

/* Query functions
-------------------------------------------------------- */
exports.list = file.list;

exports.absolute = function(path) {
    throw new Error("Not implemented");
};

exports.exists = file.exists;

exports.isDirectory = function(path) {
    return MozFile(path).isDirectory();
};

exports.isFile = function(path) {
    return MozFile(path).isFile();
};

exports.isAbsolute = function(path) {
    throw new Error("Not implemented");
};

exports.isExecutable = function(path) {
    return MozFile(path).isExecutable();
};

exports.isReadable = function(path) {
    return MozFile(path).isReadable();
};

exports.isWritable = function(path) {
    return MozFile(path).isWritable();
};

exports.isLink = function(path) {
    return MozFile(path).isSymlink();
};

exports.readLink = function(path) {
    throw new Error("Not implemented");
}

/* Directory functions
-------------------------------------------------------- */
exports.changeWorkingDirectory = function (path) {
    //Changes the current workingDirectory to the specified path.
    throw new Error("Not implemented");
};

exports.makeDirectory = file.mkpath;
exports.makeTree = file.mkpath;
exports.removeDirectory = file.rmdir;

exports.removeTree = function (path) {
    //Removes the specified path, regardless of whether it is a file or a directory.
    throw new Error("Not implemented");
};
exports.copyTree = function (source, destination) {
    //Copies all files from the source path to the destination path.
    throw new Error("Not implemented");
};

/* File Functions
-------------------------------------------------------- */
exports.open = file.open; // TODO: does not implement readLine and writeLine
exports.read = file.read;

exports.write = function(path, content, mode) {
    let fp = open(path, mode);
    fp.write(content);
    fp.close();
};

exports.remove = file.remove;

exports.copy = function(source, destination) {
    if (!file.exist(source) || !file.isFile(source)) {
        throw new Error("path is not a file: " + source);
    }
    let s = MozFile(source);
    let t = MozFile(destination);
    s.copyTo(t.parent, t.leafName);
};

exports.move = function(source, destination) {
    if (!file.exist(source) || !file.isFile(source)) {
        throw new Error("path is not a file: " + source);
    }
    let s = MozFile(source);
    let t = MozFile(destination);
    s.moveTo(t.parent, t.leafName);
};

exports.touch = function(path) {
    let f = MozFile(path);
    let d = new Date(date);

    if (f.exists()) {
        f.lastModifiedTime = d.getTime();
    } else {
        f.create(f.NORMAL_FILE_TYPE, parseInt('644', 8));
        f.lastModifiedTime = d.getTime();
    }
};

/* Extra functions
-------------------------------------------------------- */
exports.basename = file.basename;
exports.dirname = file.dirname;
exports.join = file.join;
