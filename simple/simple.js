

var getUrlPara = function (name, defVal, url) {
    var val = (new RegExp('(^|\\?|&|#)' + name+ '=([^&#]*)').exec(url || location.href)||[,,undefined===defVal ? '' : defVal])[2];
    return null == val ? val : decodeURIComponent(val).replace(/['"<>]/g, "");
};

var random = function(min, max) {
	if (max == null) {
		max = min;
		min = 0;
	}
	return min + Math.floor(Math.random() * (max - min + 1));
};

/*

    (async function() {
        await sleep(1.5);
    })();

 */
function sleep(sec) {
    return new Promise(resolve => setTimeout(resolve, 1000 * sec));
}


var cookie = {
	get : function(name) {
		name = document.cookie.match(RegExp("(^| )" + name + "=([^;]*)(;|$)"));
		return !name ? "" : decodeURIComponent(name[2]);
	},
	/**
	 * set cookie
	 * @param name - cookie name
	 * @param value - cookie value
	 * @param expires - expires, hour.
	 * @param domain - cookie domain. current domain, if not given.
	 * @param path - cookie path. /, if not given.
	 */
	set : function(name, value, expires, domain, path, secure) {
		var date, cookieText ;
		if (expires) {
			date = new Date();
			date.setTime(date.getTime() + 36E5*expires); // hour
		}
		var cookieText  = 
			name + "=" + encodeURIComponent(value)
			+ (domain ? "; domain=" + domain : "")
			+ "; path=" + (path ? path : "/") 
			+ (expires ? "; expires=" + date.toGMTString() : "")
			+ (secure ? "; secure" : "")
			;
		document.cookie = cookieText ;
				
	},
	/**
	 * delete the cookie
	 * @param name - cookie name
	 * @param domain - cookie domain. current domain, if not given.
	 * @param path - cookie path. root path(/), if not given.
	 */
	del : function(name, domain, path) {
		document.cookie = name + "=" 
				+ (domain ? "; domain=" + domain : "")
				+ "; path=" + (path ? path : "/") 
				+ "; expires=Thu, 01 Jan 1970 00:00:00 GMT";
	},
	/**
	 * delete all cookie in current domain and root path(/).
	 */
	delAll : function() {
		var n,
			arr = document.cookie.match(RegExp("([^ ;][^;]*)(?=(=[^;]*)(;|$))",
				"gi"));
		for (n in arr)
			document.cookie = arr[n]
					+ "=; path=/; expires=Mon, 26 Jul 1997 05:00:00 GMT";
	}
}; // $$$ cookie

/**
 * 
 * @param {HTMLElement} elem 
 * @param {string} type - name of event type, such as: click, change
 * @param {*} bubbles 
 * @param {*} cancelable 
 */
var triggerEvent = function (elem, type, bubbles, cancelable) {
	if (typeof jQuery === 'function' && elem instanceof jQuery) {
		elem.each(function(i, e) {
			triggerEvent(e, type, bubbles, cancelable);
		});
		return;
	}
	if (null == elem) {
		console.log("error: elem is null");
		return;
	}
	if (bubbles === undefined) bubbles = true;
	if (cancelable === undefined) cancelable = true;
	var e = new Event(type, {
		bubbles: bubbles,
		cancelable: cancelable
	});
	elem.dispatchEvent(e);
}


function dateToStr(date) {
	if (!date) date = new Date();
	var d = date.getDate();
	var m = date.getMonth() + 1; //Month from 0 to 11
	var y = date.getFullYear();
	var hour = date.getHours();
	var min = date.getMinutes();
	var sec = date.getSeconds();
	var str = '';
	str += '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
	str += " ";
	str += (hour <= 9 ? '0' + hour : hour) + ':' + (min <= 9 ? '0' + min : min) + ':' + (sec <= 9 ? '0' + sec : sec);
	return str;
}
var d2s = dateToStr;