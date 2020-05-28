/*!
 * SIMPLE js framework
 * @author wangdingwei
 */




;(function( window, undefined ) {


	/**
	 * SIMPLE.aStaticFunc = function() {}; // static method, MUST be called in the form of $.aStaticFunc
	 * $('str') is instance of ElemWrapper. 
	 * $('str').anInstMethod; first, lookup the instance; second, lookup the constructor's prototype (ElemWrapper.prototype); and so on ....
	 */
	
	// Use the correct document accordingly with window argument (sandbox)
	var document = window.document;
	
	/** debug console */
	if(!window.console) window.console={};if(!window.console.log) window.console.log=function(){};

	
	
	var SIMPLE = {};
	
	
	/**************************** var declare **************************
	 * 
	 * 
	 *******************************************************************/
	SIMPLE.attrPropsFix = { //normalize/fix the name
			"for": "htmlFor",
			"class": "className",
			readonly: "readOnly",
			maxlength: "maxLength",
			cellspacing: "cellSpacing",
			rowspan: "rowSpan",
			colspan: "colSpan",
			tabindex: "tabIndex",
			usemap: "useMap",
			frameborder: "frameBorder"
		};
	
	
	
	/**
	 * insert a new stylesheet rule
	 * @param rule - css urle, such as: #id { display: none; }
	 */
	SIMPLE.addStyleSheetRule = (function() {
		var el = document.createElement("style"), sheet;
		el["type"] = "text/css";
		document.getElementsByTagName('head')[0].appendChild(el);
		sheet = el.sheet || el.styleSheet; 
		return function(rule) {
			sheet.insertRule(rule, sheet.cssRules.length); 
		};
	}());
	
	SIMPLE.elem = function(tag, attrs) {
		var el = document.createElement(tag || 'div'), a;
		for(a in attrs) el.setAttribute(a) = attrs[a];
		return el;
	};
	
	
	/**
	 * merge object property to obj
	 * merge(obj, o1, o2);
	 */
	SIMPLE.merge = function(obj) {
		for (var i=1; i < arguments.length; i++) {
			var other = arguments[i];
			for (var n in other) obj[n] = other[n];
		}
		return obj;
	}
	
	
	// ----------------------------------------------------------
	// A short snippet for detecting versions of IE in JavaScript
	// without resorting to user-agent sniffing
	// ----------------------------------------------------------
	// If you're not in IE (or IE version is less than 5) then:
	//		 ie === undefined
	// If you're in IE (>=5) then you can determine which version:
	//		 ie === 7; // IE7
	// Thus, to detect IE:
	//		 if (ie) {}
	// And to detect the version:
	//		 ie === 6 // IE6
	//		 ie > 7 // IE8, IE9 ...
	//		 ie < 9 // Anything less than IE9
	// ----------------------------------------------------------
	SIMPLE.ie = (function(){
		// for-loop saves characters over while
		for( var v = 3,
				 // b just as good as a div with 2 fewer characters
				 el = document.createElement('b'),
				 // el.all instead of el.getElementsByTagName('i')
				 // empty array as loop breaker (and exception-avoider) for non-IE and IE10+
				 all = el.all || [];
			 // i tag not well-formed since we know that IE5-IE9 won't mind
			 el.innerHTML = '<!--[if gt IE ' + (++v) + ']><i><![endif]-->',
			 all[0];
		   );
		// instead of undefined, returns the documentMode for IE10+ compatibility
		// non-IE will still get undefined as before
		return v > 4 ? v : document.documentMode;
	}() );
	
	
	/**
	 * log remote
	 * @see baidu.sio().log()  tangram
	 */
	SIMPLE.log = function(url) {
			var img = new Image(),
				key = '__simple_log__' + Math.floor(Math.random() * 2147483648).toString(36);

			// 这里一定要挂在window下, 在IE中，如果没挂在window下，这个img变量又正好被GC的话，img的请求会abort导致服务器收不到日志
			window[key] = img;

			img.onload = img.onerror = img.onabort = function() {
			  // 如果这个img很不幸正好加载了一个存在的资源，又是个gif动画, 则在gif动画播放过程中，img会多次触发onload, 因此一定要清空
			  img.onload = img.onerror = img.onabort = null;
			  window[key] = null;
			  // new Image创建的是DOM，DOM的事件中形成闭包环引用DOM是典型的内存泄露, 因此这里一定要置为null
			  img = null;
			};

			// 一定要在注册了事件之后再设置src, 不然如果图片是读缓存的话，会错过事件处理
			// 最后，对于url最好是添加客户端时间来防止缓存, 同时服务器也配合一下传递Cache-Control: no-cache;
			img.src = url;
	};


	
	
	

	/********************************** core util *************************************
	 include:
	 1. string util
	 2. url util
	 **********************************************************************************/
	String.prototype.ltrim = function() { return this.replace(/^\s+/,""); }
	String.prototype.rtrim = function() { return this.replace(/\s+$/,""); }
	String.prototype.trim = String.prototype.trim || function() { return this.replace(/^\s+|\s+$/g,""); }
	/** get url query parameter */
	SIMPLE.getUrlParaRaw = function (name, defVal, url) {
		var val = (new RegExp('(^|\\?|&|#)' + name+ '=([^&#]*)').exec(url || location.href)||[,,undefined===defVal ? '' : defVal])[2]; 
		//return val;
		return null == val ? val : decodeURIComponent(val);
	};
	SIMPLE.getUrlPara = function (name, defVal, url) {
		var val = (new RegExp('(^|\\?|&|#)' + name+ '=([^&#]*)').exec(url || location.href)||[,,undefined===defVal ? '' : defVal])[2];
		return null == val ? val : decodeURIComponent(val).replace(/['"<>]/g, "");
	};
	
	SIMPLE.escapeHtml = function(str) {
		var entityMap = {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#39;',
				'/': '&#x2F;',
				'`': '&#x60;',
				'=': '&#x3D;'
		};

			
		return String(str).replace(/[&<>"'`=\/]/g, function (s) {
			return entityMap[s];
		});
	}
	
	
	
	/**
	 * Returns a function, that, as long as it continues to be invoked, will not
	 * be triggered. The function will be called after it stops being called for
	 * N milliseconds. If `immediate` is passed, trigger the function on the
	 * leading edge, instead of the trailing. The function also has a property 'clear' 
	 * that is a function which will clear the timer to prevent previously scheduled executions. 
	 *
	 * @source underscore.js
	 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
	 * @param {Function} function to wrap
	 * @param {Number} timeout in ms (`100`)
	 * @param {Boolean} whether to execute at the beginning (`false`)
	 * @api public
	 */
	function debounce(func, wait, immediate) {
		var timeout, args, context, timestamp, result;
		if (null == wait) wait = 100;

		function later() {
			var last = Date.now() - timestamp;

			if (last < wait && last >= 0) {
				timeout = setTimeout(later, wait - last);
			} else {
				timeout = null;
				if (!immediate) {
					result = func.apply(context, args);
					context = args = null;
				}
			}
		};

		var debounced = function() {
			context = this;
			args = arguments;
			timestamp = Date.now();
			var callNow = immediate && !timeout;
			if (!timeout) timeout = setTimeout(later, wait);
			if (callNow) {
				result = func.apply(context, args);
				context = args = null;
			}

			return result;
		};

		debounced.clear = function() {
			if (timeout) {
				clearTimeout(timeout);
				timeout = null;
			}
		};

		debounced.flush = function() {
			if (timeout) {
				result = func.apply(context, args);
				context = args = null;

				clearTimeout(timeout);
				timeout = null;
			}
		};

		return debounced;
	};

	SIMPLE.debounce = debounce;


	
	
	/**
	 * inject function code to script tag
	 * 
	 * code(function() {
	 * 		alert = function(msg) { console.log(msg); return true; };
	 * });
	 */
	SIMPLE.code = function(func) {
		var script = document.createElement('script');
		script.textContent = "(" + func + ")();";
		(document.head || document.documentElement).appendChild(script);
		//script.parentNode.removeChild(script);
	};


	
	/**
	 * @see in.js http://injs.org
	 */

	var loadjs = function(url, charset, loadCB, errorCB, isAsync) {
		var p = document.head || document.getElementsByTagName('head')[0] || document.body || document.documentElement;
		var n = document.createElement('script');
		n.type = 'text/javascript';
		n.src = url;
		if (isAsync === true || isAsync) { n.async = 'true'; }
		if(charset) { n.charset = charset; }

		n.onload = n.onreadystatechange = function(evt) {
			console.log("onload: " + url);
			if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
				if(loadCB) { loadCB(evt); }
				n.onload = n.onreadystatechange = null;
			}
		};

		n.onerror = function(evt) {
			console.log("onerror: " + url + ", " + evt);
			if (errorCB) { errorCB(); }
			n.onerror = null;
		};
		p.appendChild(n);
	};

	var loadcss = function(url, loadCB, errorCB) {
		var p = document.head || document.getElementsByTagName('head')[0] || document.body || document.documentElement;
		var n = document.createElement('link');
	    n.type = 'text/css';
	    n.rel = 'stylesheet';
	    n.href = url;

		n.onload = n.onreadystatechange = function() {
			console.log("onload: " + url);
			if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
				if(loadCB) { loadCB(); }
				n.onload = n.onreadystatechange = null;
			}
		};

		n.onerror = function() { // syntax error will not trigger onerror
			console.log("onerror: " + url);
			if (errorCB) { errorCB(); }
			n.onerror = null;
		};
		p.appendChild(n);
	};

	

	SIMPLE.getUID = (function() {
		var uid = +new Date();
		return function() {
			return ++uid;
		};
	})();


	/** parse json */
	SIMPLE.parseJSON = function( data ) {
		if ( typeof data !== "string" || !data ) { return null; }
		data.trim();

		// Make sure the incoming data is actual JSON // Logic borrowed from http://json.org/json2.js
		if ( /^[\],:{}\s]*$/.test(data.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@")
			.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]")
			.replace(/(?:^|:|,)(?:\s*\[)+/g, "")) ) {
			// Try to use the native JSON parser first
			return window.JSON && window.JSON.parse ? window.JSON.parse( data ) : (new Function("return " + data))();
		} else { return null; }// invalid json
	};

	
	/**
	 * execute when the DOM is fully loaded.
	 * ready(function() {console.log("ready"});
	 */
	SIMPLE.ready = (function() { // ready(function() {console.log("ready"});
		var isDocReady = false,
			docReadyCBList = [];
		// document ready callback handler
		function DOMContentLoadedCB() {
			isDocReady = true;
			for(var i = 0, cb; cb = docReadyCBList[i]; i++) {cb();}
			docReadyCBList = [];
			if (document.addEventListener) {
				document.removeEventListener("DOMContentLoaded", DOMContentLoadedCB, false);
				window.removeEventListener("load", DOMContentLoadedCB, false);
			} else {
				document.detachEvent("onreadystatechange", DOMContentLoadedCB);
				window.detachEvent("load", DOMContentLoadedCB);
			}
		}
		function ready(readyCB) {
			// readyState: loading interactive complete
			if (isDocReady || document.readyState === "complete") { // already ready, exec cb
				return setTimeout(readyCB, 1); // Handle it asynchronously to allow scripts the opportunity to delay ready
			}
			docReadyCBList.push(readyCB);
			if (readyCB.length <= 1) {//only register listener for the first time
				if (document.addEventListener) {
					document.addEventListener( "DOMContentLoaded", DOMContentLoadedCB, false);
					window.addEventListener("load", DOMContentLoadedCB, false);
				} else {
					document.attachEvent("onreadystatechange", DOMContentLoadedCB);
					window.attachEvent("onload", DOMContentLoadedCB);
				}
			}
		}
		return ready;
	})();

	
	
	SIMPLE.isElem = function(elem) {return elem && elem.nodeType && elem.nodeType === 1;}; // is an element node
	SIMPLE.each = function(object, callback) {
		if (!object) return;
		var name, i = 0, length = object.length;
		if (length !== undefined) { //array or array like
			for ( var value = object[0]; i < length && callback.call(value, i, value ) !== false; value = object[++i] ) {}
		} 
		else {//obj
			for ( name in object ) { if ( callback.call( object[ name ], name, object[ name ] ) === false ) { break; } }
		}
	} // SIMPLE.each = function(object, callback) {
	
	
	
	

	/********************************** type **************************************/
	// [[Class]] -> type pairs
	class2type = {};
	// Populate the class2type map
	SIMPLE.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(i, name) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	});
	SIMPLE.type = function( obj ) {
		return obj == null ? String( obj ) : class2type[ Object.prototype.toString.call(obj) ] || "object";
	};
	SIMPLE.isFunction = function( obj ) { return jQuery.type(obj) === "function"; };
	SIMPLE.isArray = function (obj) { return Object.prototype.toString.call(obj) === '[object Array]'; } 
	SIMPLE.isEmptyObject = function( obj ) {
		for ( var name in obj ) { return false; }
		return true;
	};
	

	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 
	
	
	/********************************** node util *************************************
	 nodeType
	 	Node.ELEMENT_NODE == 1
		Node.ATTRIBUTE_NODE == 2
		Node.TEXT_NODE == 3
		Node.CDATA_SECTION_NODE == 4
		Node.ENTITY_REFERENCE_NODE == 5
		Node.ENTITY_NODE == 6
		Node.PROCESSING_INSTRUCTION_NODE == 7
		Node.COMMENT_NODE == 8
		Node.DOCUMENT_NODE == 9
		Node.DOCUMENT_TYPE_NODE == 10
		Node.DOCUMENT_FRAGMENT_NODE == 11
		Node.NOTATION_NODE == 12
	 **********************************************************************************/
	
	SIMPLE.id = function(idN) { return document.getElementById(idN); }
	SIMPLE.tag = function(tagN) {return document.getElementsByTagName(tagN);}
	SIMPLE.q = function(sel) {return document.querySelector(sel);} // some browser does not have this function
	SIMPLE.qa = function(sel) {return document.querySelectorAll(sel);}
	/**
	 * createDocumentFragment
	 * @param html - html string, which will be the chile of DocumentFragment
	 */
	SIMPLE.docFrag = function(html, context) {
		var doc = (context ? (context.ownerDocument || context) : document);
		var docF = doc.createDocumentFragment(),
			divE = doc.createElement("div"),
			c;
		divE.innerHTML = html;
		while(c = divE.firstChild) {docF.appendChild(c);} 
		divE = null;
		return docF;
	};
	SIMPLE.append = function(parent, child) { parent.appendChild(child); };
	SIMPLE.prepend = function(parent, child) { parent.insertBefore(child, parent.firstChild); };
	SIMPLE.before = function(elem, before) {elem.parentNode.insertBefore(before, elem);};
	SIMPLE.after = function(elem, after) {elem.nextSibling ? elem.parentNode.insertBefore(after, elem.nextSibling) : elem.appendChild(after);};
	SIMPLE.detach = function(elem) { elem && elem.parentNode && elem.parentNode.removeChild(elem); };
	SIMPLE.empty = function(elem) { while ( elem.firstChild ) { elem.removeChild( elem.firstChild );} 	};
	SIMPLE.html = function(elem, val) {return val != null ? elem.innerHTML = val : elem.innerHTML;}
	SIMPLE.text = function(elem, text) {
		while ( elem.firstChild ) { elem.removeChild( elem.firstChild );}
		elem.appendChild(elem.ownerDocument.createTextNode(text));
	};
	SIMPLE.attr = function(elem, name, val) {
		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || elem.nodeType === 2 ) { return undefined; }
		
		name = SIMPLE.attrPropsFix[name] || name;
		if(undefined === val) {return elem.getAttribute(name);}
		else if (null === val) {elem.removeAttribute(name);}
		else {elem.setAttribute(name, val);}
	};
	SIMPLE.rmAttr = function(elem, name) {elem.removeAttribute(name);};
	SIMPLE.val = function(elem, val) {
		if (!SIMPLE.isElem(elem)) return;
		// We need to handle select boxes special //refer jquery
		if (elem.nodeName == "select") {}
		if (elem.nodeName == "option") {}
		
		

		var name = elem.name;

		// 处理：可用并包含表单name的表单项(去掉 限制)
		//if (!elem.disabled && name) {
			var type = elem.type,
				value = elem.value; 
		
			switch (type) {
			case 'radio':
			case 'checkbox':
				//if (!elem.checked) {break;}
				if (null == val) {return elem.value;} //get
				else if (val === true || val === false) {elem.checked = val;} //boolean
				else {elem.checked = ( value == val || (SIMPLE.isArray(val) && val.indexOf(value)>=0) );}//value
				break;
			case 'textarea':
			case 'text':
			case 'password':
			case 'hidden':
				return val == null ? elem.value : elem.value = val;
			case 'select-one':
				if (val == null) {return elem.value;}
				//else process by 'select-multiple'
			case 'select-multiple': // multiple select
				var opts = elem.options,
					oLen = opts.length,
					selVals = new Array();
				for (oi = 0; oi < oLen; oi++) {
					var oItem = opts[oi], oVal = oItem.value;
					if (val == null) { if (oItem.selected) { selVals.push(oVal); } } //get
					else { oItem.selected = ( oVal == val || (SIMPLE.isArray(val) && val.indexOf(oVal)>=0) ); } //set
					
				} // $$$ for
			} // $$$ switch
		//} // $$$ if
		
		
	};
	SIMPLE.css = function(elem, name, val) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) { return; }
		name.replace(/-([a-z])/ig, function( all, letter ) { return letter.toUpperCase(); });// camelCase
		if(name === "float" || name === "cssFloat"){
			if("" === "ie"){ name = "styleFloat"; } //ie
			else{ name = "cssFloat"; }
		}
		
		if (typeof name == 'string' && val === undefined) {
			//var style = window.getComputedStyle(elem, null);
			// var style = document.defaultView.getComputedStyle(elem, null);
			//the two is equivalent:
			return window.getComputedStyle ? window.getComputedStyle(elem, null).getPropertyValue(name) : elem.currentStyle[name];
		}
		else {
			elem.style[name] = val;
		}
	};
	SIMPLE.rmCls = function(elem, cls) {
		if (!SIMPLE.isElem(elem)) {return;}
		var clsLst = (cls || "").split(/\s+/),
			len = clsLst.length;
		var className = (" " + elem.className + " ").replace(/[\n\t\r]/g, " ");
		for ( var i = 0; i < len; i++ ) {
			className = className.replace(new RegExp(" " + clsLst[i] + " ", "gi"), " ");
		}
		elem.className = className.trim();
	};
	SIMPLE.addCls = function(elem, cls) {
		if (!SIMPLE.isElem(elem)) {return;}
		var clsLst = (cls || "").split(/\s+/),
		len = clsLst.length;
		var className = (" " + elem.className + " ").replace(/[\n\t\r]/g, " ");
		for ( var i = 0; i < len; i++ ) {
			if ( className.indexOf( " " + clsLst[i] + " " ) < 0 ) {className += " " + clsLst[i];}
		}
		elem.className = className.trim();
	};
	SIMPLE.hasCls = function(elem, cls) {
		if (!SIMPLE.isElem(elem)) {return false;}
		var className = (" " + elem.className + " ").replace(/[\n\t\r]/g, " ");
		return className.indexOf( " " + cls + " " ) >= 0;
	};
	SIMPLE.toggleCls = function(elem, cls1, cls2) {
		if (!SIMPLE.isElem(elem)) {return;}
		if (SIMPLE.hasCls(elem, cls1)) {
			SIMPLE.rmCls(elem, cls1);
			SIMPLE.addCls(elem, cls2);
		}
		else {
			SIMPLE.addCls(elem, cls1);
			SIMPLE.rmCls(elem, cls2);
		}
	};
	SIMPLE.show = function(elem) {SIMPLE.css(elem, "display", "block");};
	SIMPLE.hide = function(elem) {SIMPLE.css(elem, "display", "none");}
	SIMPLE.index = function (elem) {
		if (!elem || elem.nodeType !=1) return undefined;
		var i = 0, c = elem.parentNode.firstChild;
		do { if (c === elem) return i; else if (c.nodeType === 1) i++;} while((c = c.nextSibling) != null);
	};
	SIMPLE.parent = function(elem) {if (SIMPLE.isElem(elem)) {return elem.parentNode} else {return null;}};
	SIMPLE.prev = function(elem) {
		if (!SIMPLE.isElem(elem)) { return null; }
		while (elem = elem.previousSibling) {if (SIMPLE.isElem(elem)) {return elem;}}; 
	};
	SIMPLE.next = function(elem) {
		if (!SIMPLE.isElem(elem)) { return null; }
		while (elem = elem.nextSibling) {if (SIMPLE.isElem(elem)) {return elem;}}; 
	};
	SIMPLE.children = function(elem) {
		if (!SIMPLE.isElem(elem)) { return null; }
		var elemA = new Array();
		for (var c, i=0; c = elem.childNodes[i]; i++) {
			if (SIMPLE.isElem(c)) {elemA.push(c);}
		}
		return elemA;
	};
	SIMPLE.find = function(elem, tag) {
		tag = tag.toUpperCase();
		if (!SIMPLE.isElem(elem)) { return null; }
		for (var c, i=0; c = elem.childNodes[i]; i++) {
			var name = c.tagName;
			if (SIMPLE.isElem(c) && name == tag) {
				return c;
			}
			else {
				var tmp = SIMPLE.find(c, tag);
				if (SIMPLE.isElem(tmp)) return tmp;
			}
		}

		return null;
	};
	/** 
	 * 1-indexed
	 * @param elem - Element
	 * @param index - child index
	 * @returns child elem of given index. null, if has no child. 
	 */
	SIMPLE.child = function(elem, index) {
		if (!SIMPLE.isElem(elem)) {return null;}
		if (typeof index !== "number" || index <= 0) index = 1;
		var elemI = 0,
			prevElem = null;
		for (var c, i=0; c = elem.childNodes[i]; i++) {
			if (SIMPLE.isElem(c)) {	elemI++; prevElem = c; }
			if (elemI == index) return c;
		}
		return prevElem; // return last elem, maybe null
		
	};
	
	
	
	
	
	
	
	
	

	
	
	
	
	
	
	
	
	
	
	
	
	/******************************** event util *************************************/

	/** bind */
	SIMPLE.bind = function(elem, eventType, handler, useCapture) {
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 ) { return; }
		if (document.addEventListener) { elem.addEventListener(eventType, handler, useCapture || false);}
		else { elem.attachEvent("on" + eventType, handler); }
	};
	/** unbind */
	SIMPLE.unbind = function(elem, eventType, handler, useCapture) {
		if (document.addEventListener) { elem.removeEventListener(eventType, handler, useCapture || false); }
		else { elem.detachEvent("on" + eventType, handler); }
	};
	SIMPLE.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
			"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
			"change select submit keydown keypress keyup error").split(" "), function(index, name) {
		SIMPLE[name] = function(elem, handler, useCapture) {SIMPLE.bind(elem, name, handler, useCapture);};
	});

		
	
	
	
	
	
	
	
	
	/********************************** ajax *************************************
	 createXHR ---> open ---> setRequestHeader ---> onreadystatechange ---> send
					   
						readyState
	 0	UNINITIALIZED	open()has not been called yet.
	 1	LOADING	send()has not been called yet.
	 2	LOADED	send() has been called, and headers and status are available.
	 3	INTERACTIVE	Downloading; responseText holds partial data.
	 4	COMPLETED	The operation is complete.
	 *****************************************************************************/
	//adapter
	if(typeof window.XMLHttpRequest === "undefined"){
		window.XMLHttpRequest = function(){
			return new window.ActiveXObject(navigator.userAgent.indexOf("MSIE 5") >=0 ? "Microsoft.XMLHTTP" : "Msxml2.XMLHTTP");
		};
	}
	
	/**
	 * set up an ajax
	 * 
	 * @param options - options property
	 *	 url - url
	 *	 method - method
	 *	 async - whether or not to perform the operation asynchronously
	 *	 timeout -  timeout (in milliseconds) for the xhr. ontimeout will not be called, if not given(never timeout).
	 *	 data - data to be sent to the server 
	 *	 dataType - the xhr response data type. xml text json
	 *	 onsuccess - callback
	 *	 onerror - callback
	 *	 oncomplete - callback
	 *	 ontimeout - callback, if timeout if given
	 */
	SIMPLE.ajax = function(url, options) {
		url = url || "";
		if ( typeof url === "object" ) { options = url; url = undefined; }
		options = options || {};
		var xhr,
			o = {
				url: url || options.url,
				method: (options.method || "GET").toUpperCase(),
				data: options.data || null, //Data to be sent to the serve
				async: options.async || true,
				timeout: options.timeout || null,
				dataType: options.dataType || "text", //response data type
				onsuccess: options.onsuccess || function(){}, // three argument: respData, status, xhr
				onerror: options.onerror, // || function(){}, // three argument: respData, status, xhr
				oncomplete: options.oncomplete || function(){}, // three argument: respData, status, xhr
				ontimeout: options.ontimeout, // || function(){},
				contentType: options.contentType || "application/x-www-form-urlencoded"
			},
			isTimeout = false,
			isComplete = false; 
		
		// convert plain obj to query str
		if (o.data && typeof o.data === "object") {//data is obj
			var a = [];
			for (name in o.data) { a.push(encodeURIComponent(name) + "=" +  encodeURIComponent(o.data[name])); }
			o.data = a.join("&");
		}
		else if (o.data && typeof o.data === "string") {o.data=encodeURIComponent(o.data);}
		
		// process get method
		if (o.method === "GET" && o.data) { 
			o.url += (o.url.indexOf("?") >=0 ? "&" : "?") + o.data;
			o.data = null;//data have been append to url; send(null)
		}
		
		
		// create xhr
		xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
		// ---> first ---> open
		xhr.open( o.method, o.url, o.async );
		
		// ---> second ---> set request header
		xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
		if (o.method === "POST") xhr.setRequestHeader("Content-Type",o.contentType);
		
		// ---> third ---> register ready datate change handler
		xhr.onreadystatechange = function() {
			if (4 === xhr.readyState) {xhrReady(xhr); xhr = null;}
		};
		
		// ---> fourth ---> send the request
		xhr.send(o.data);
		
		
		
		if ( o.async && o.timeout && parseInt(o.timeout) > 0 && (xhr.readyState > 0 && xhr.readyState < 4)) {
			setTimeout( function(){
				if (isComplete) { return; }; // has complete
				isTimeout = true; 
				xhr.abort(); 
				if (o.ontimeout) {o.ontimeout();}
				else if(window.SIMPLE && SIMPLE.ajaxTimeout) {SIMPLE.ajaxTimeout();}
				xhr = null;
			}, o.timeout );
		}
		
		
		/**
		 * XMLHttpRequest completed 4 === xhr.readyState
		 */
		function xhrReady(xhr) {
			if (isTimeout) return; 
			isComplete = true;
			
			var resp = xhr.responseText;
			
			if ( (xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 ) {
				if (o.dataType === "xml") { resp = xhr.responseXML;}
				else if(o.dataType === "json") { resp = JSON.parse(xhr.responseText); }
				else { resp = xhr.responseText; }
				o.onsuccess(resp, xhr.status, xhr);
			}
			else {
				if (o.onerror) {o.onerror(resp, xhr.status, xhr);}
				else if (window.SIMPLE && SIMPLE.ajaxError) {SIMPLE.ajaxError(resp, xhr.status, xhr);}
				
			}
			
			o.oncomplete(resp, xhr.status, xhr);
		} // $$$ function xhrReady(xhr) 
		
		return xhr;
	}; // $$$ SIMPLE.ajax = function(url, options) 
	
	
	
	/*** ajax help function ***/
	/**
	 * @param url - url
	 * @param data - query data
	 * @param succCB - call back function, if success
	 * @param errCB - call back function, if error
	 * @param timeoutCB - call back function, if timeout
	 */
	SIMPLE.getJSON = function(url, data, succCB, errCB, timeoutCB) {
		SIMPLE.ajax(url, {
			data: data,
			dataType: "json",
			onsuccess: succCB,
			onerror: errCB,
			ontimeout: timeoutCB
		});
	};
	//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$ ajax end $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	

	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	/********************************** template engine *************************************
	tmpl(string/id, [obj]);
		1. 第一个参数(必选)
		id: 通过getElementById(str).innerHTML获取字符串. tmpl会被调用两次
		字符串: ajax拉取等
		2. 第二个参数(可选)
		obj对象
		如未给出，会返回获取html代码的方法
		如果给出，返回html代码
		demo
		tmpl(id, obj);
		tmpl(tmpl-string, obj)
		tmplFn = tmpl(id); tmplFn(obj);  //先获取script fun, 然后在传入obj，执行。如果需要多次执行,可自己缓存tmplFn.
		<# print("hi") #>
		<#= expression #> 和 <# codeblock #>
		
		
		<script type='text/tmpl' id='tmpl-id'>
		</script>
	 ****************************************************************************************/
	var _TMPL_cache = {}; 
	/** 
	 * @deprecated: use tmpl.js
	 */
	SIMPLE.tmpl = function tmpl(str, data) {
		try {
			// Figure out if we're getting a template, or if we need to
			// load the template - and be sure to cache the result.
			//str参数中不包含<时，认为str参数为id时，获取该id包含template string,缓存。
			var fn =  (-1 == str.indexOf("<")) ?
					_TMPL_cache[str] =  _TMPL_cache[str] || tmpl(document.getElementById(str).innerHTML) :
			
			// Generate a reusable function that will serve as a template
			// generator (and which will be cached).
			new Function("obj",
			
			// ^^^ begin of function body
			"var p=[],print=function(){p.push.apply(p,arguments);};" 

				// Introduce the data as local variables using with(){}
				+ "with(obj){p.push('" +
		
				// Convert the template into pure JavaScript
				// --->			  replace
				// 1句将\r\t\n变成空格 
				// 2,3,4句主要是将标签外的'进行转义，改成\'。不过此时不能改变标签内的'
				// 5句处理<%= %>标签
				str.replace(/[\r\t\n]/g, " ")			// 1. \r\t\n ---> space
				   .replace(/'(?=[^#]*#>)/g,"\t")		// 2. <% %><%= %>标签中的' ---> \t
				   .split("'").join("\\'")				// 3. 其他地方的' ---> \'
				   .split("\t").join("'")				// 4. \t ---> ' 还原标签<% %><%= %>中的'
				   .replace(/<#=(.+?)#>/g, "',$1,'")	// 5. 处理<%= expr %> ---> ', expr ,'
				   .split("<#").join("');")				// 6. <% ---> ');
				   .split("#>").join("p.push('")		// 7. %> ---> p.push('
				   + "');}"	// end of with
				   + "return p.join('');"); // $$$ end of function body
				
			// Provide some basic currying to the user
			return data ? fn(data) : fn;
		} // $$$ try
		catch(err) {
			console.log("tmpl() err: " + err);
		}
	}; // $$$ SIMPLE.tmpl = function tmpl(str, data) {
	
	
	
	
	
	
	/********* expose SIMPLE to the global object  **********/
	var __$S__ = window.$S // cache old $S
	window.SIMPLE = window.$S = SIMPLE;
	SIMPLE.noConflict = function () {
		if (window.$S === SIMPLE) {
			window.$S = __$S__;
		}
		return SIMPLE;
	};
	
})(window); // $$$ (function( window, undefined ) {

