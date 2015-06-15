'use strict';

var toggle = document.querySelector('#notification-toggle');
var button = document.querySelector('#push-controls');

module.exports = {
    toggle: toggle,
    button: button,
    check: function() {
        toggle.checked = true;
        button.disabled = false;
    },
    uncheck: function() {
        toggle.checked = false;
        button.disabled = true;
    },
    disable: function() {
        toggle.checked = false;
        toggle.disabled = true;
        button.disabled = true;
    },
    enable: function() {
        toggle.disabled = false;
    }
};