"use strict";

const system = require("sdk/system");

const create = function() {
    return {
        pid: null, // TODO
        platform: null, // TODO
        os: null, // TODO
        env: system.env,
        args: []
    };
};
exports.create = create;
