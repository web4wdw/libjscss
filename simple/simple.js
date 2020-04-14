"use strict";


var getUrlPara = function (name, defVal, url) {
    var val = (new RegExp('(^|\\?|&|#)' + name+ '=([^&#]*)').exec(url || location.href)||[,,undefined===defVal ? '' : defVal])[2];
    return null == val ? val : decodeURIComponent(val).replace(/['"<>]/g, "");
};
