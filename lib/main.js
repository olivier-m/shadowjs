/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";
const {mix} = require("sdk/core/heritage");
const {env} = require("sdk/system");
const timers = require("sdk/timers");

const fs = require("./modules/fs");
const shadow = require("./modules/shadow");
const webpage = require("webpage");
const container = require("container");


const getModules = function(override) {
    let modules = {};
    modules["fs"] = fs;
    modules["webpage"] = webpage;
    modules["webserver"] = require("webserver");

    // Extra modules
    if (typeof(override) === "function") {
        override(modules);
    }

    return modules;
};


exports.main = function(options) {
    options = mix({
        getSearchPath: function() {
            // Get modules search path (in container only)
            return env.SHADOW_PATH && env.SHADOW_PATH.split(":") || null;
        },
        getScript: function() {
            // Get script path
            return env.SHADOW_MAIN;
        },
        getModuleOverrides: function(modules) {
            // Override modules here
        }
    }, options || {});

    let search_path = options.getSearchPath() || [];

    let root = undefined;
    let main = 'void';

    if (options.getScript()) {
        main = options.getScript();

        if (main[0] === "/") {
            root = fs.dirname(main);
            main = fs.basename(main);
        }
    }

    // Make container
    let jail = container.create(root, {
        modules: getModules(options.getModuleOverrides),
        globals: {
            shadow: shadow.create(root),
            setTimeout: timers.setTimeout,
            clearTimeout: timers.clearTimeout,
            setInterval: timers.setInterval,
            clearInterval: timers.clearInterval
        },
        search_path: search_path
    });

    try {
        jail.main(main);
    } catch(e) {
        container.processException(e);
    }
};
