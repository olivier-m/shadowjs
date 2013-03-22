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


const getModules = function() {
    let modules = {};
    modules["fs"] = fs;
    modules["har"] = require("./modules/har");
    modules["system"] = require("./modules/system").create();
    modules["webpage"] = webpage;
    modules["webserver"] = require("webserver");

    return modules;
};


exports.main = function(loadReason, staticArgs, options) {
    options = mix({
        getSearchPath: function() {
            // Get modules search path (in container only)
            return env.SHADOW_PATH && env.SHADOW_PATH.split(":") || null;
        },
        getScript: function() {
            // Get script path
            return env.SHADOW_MAIN;
        },
        getArgs: function() {
            return env.SHADOW_ARGS && env.SHADOW_ARGS.split(" ") || [];
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

    // Prepare modules
    let modules = getModules(options.getModuleOverrides);

    // Args
    modules.system.args = [options.getScript() || main];
    if (modules.system && typeof(options.getArgs) === "function") {
        modules.system.args.push.apply(modules.system.args, options.getArgs());
    }

    if (typeof(options.getModuleOverrides) === "function") {
        options.getModuleOverrides(modules);
    }


    // Make container
    let jail = container.create(root, {
        modules: modules,
        globals: {
            shadow: shadow.create(root),

            setTimeout: timers.setTimeout,
            clearTimeout: timers.clearTimeout,
            setInterval: timers.setInterval,
            clearInterval: timers.clearInterval,
        },
        search_path: search_path
    });

    // Custom console
    let print = function() {
        dump([].slice.call(arguments).join(" ") + "\n");
    };
    jail.loader.globals.console.log = print;
    jail.loader.globals.console.info = print;
    jail.loader.globals.console.warn = print;
    jail.loader.globals.console.error = print;

    try {
        jail.main(main);
    } catch(e) {
        container.processException(e);
    }
};
