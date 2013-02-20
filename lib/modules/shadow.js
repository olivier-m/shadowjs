/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";
const {Cc, Ci, Cu} = require("chrome");

const system = require("sdk/system");

const mgr = Cc["@mozilla.org/memory-reporter-manager;1"].getService(Ci.nsIMemoryReporterManager);
const wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);

exports.create = function(root) {
    return {
        libraryPath: root,

        exit: system.exit,

        statusReport: function() {
            let result = {
                'window_count': 0,
                'tab_count': 0,
                'tabs': [],
                'memory': {}
            }

            // Windows and Tabs report
            let browserEnumerator = wm.getEnumerator("navigator:browser");
            let win = null;
            while (browserEnumerator.hasMoreElements()) {
                result.window_count += 1;
                win = browserEnumerator.getNext();
                result.tab_count += win.gBrowser.browsers.length;

                // List all tabs URI
                for (let i=0; i<win.gBrowser.browsers.length; i++) {
                    result.tabs.push(win.gBrowser.getBrowserAtIndex(i).currentURI.spec);
                }
            }

            // Memory report
            result.memory = this.memoryReport();

            return result;
        },

        memoryReport: function() {
            let e = mgr.enumerateReporters(),
                result = {};

            while (e.hasMoreElements()) {
                let mr = e.getNext().QueryInterface(Ci.nsIMemoryReporter);
                let amount = mr.amount;
                if (mr.units == mr.UNITS_BYTES) {
                    amount = Math.round(100 * amount / 1024 / 1024) / 100;
                }
                result[mr.path] = amount;
            }

            return result;
        },

        cleanMemory: function(callback) {
            Cu.forceGC();

            mgr.minimizeMemoryUsage(function() {
                if (typeof(callback) === "function") {
                    callback(this.memoryReport()["resident"]);
                }
            }.bind(this));
        },

        doCC: function(aWindow) {
            aWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                .getInterface(Ci.nsIDOMWindowUtils)
                .cycleCollect();
        }
    }
};
