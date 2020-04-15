"use strict";


var getUrlPara = function (name, defVal, url) {
    var val = (new RegExp('(^|\\?|&|#)' + name+ '=([^&#]*)').exec(url || location.href)||[,,undefined===defVal ? '' : defVal])[2];
    return null == val ? val : decodeURIComponent(val).replace(/['"<>]/g, "");
};

/**
 * 
 * @param {HTMLElement} elem 
 * @param {string} type - name of event type, such as: click, change
 * @param {*} bubbles 
 * @param {*} cancelable 
 */
var triggerEvent = function (elem, type, bubbles, cancelable) {
	if (bubbles === undefined) bubbles = true;
	if (cancelable === undefined) cancelable = true;
	var e = new Event(type, {
		bubbles: bubbles,
		cancelable: cancelable
	});
	elem.dispatchEvent(e);
}