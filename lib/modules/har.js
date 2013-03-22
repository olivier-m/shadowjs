/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';

let {mix} = require('sdk/core/heritage');
let HarLib = require('net-log/har');


const harCollector = function(page, options) {
    let collector;
    let result = {
        data: null
    };

    options = mix(options || {}, {
        autoStart: true
    });

    page.on('loadInit', function() {
        collector = HarLib.startCollector(page.browser, options);

        page.once('loadFinished', function() {
            result.data = mix({}, collector.data);
            collector.stop();
            collector = null;
        });

        page.once('closing', function() {
            result.data = null;
        });
    });

    return result;
};

exports.harCollector = harCollector;
