 
if(!window.console) window.console={};if(!window.console.log) window.console.log=function(){};
 
/**
 * 
 * 1. <%= expression %> 和 <% code block %>
 * 2. if you want to output "openTag" or "closeTag", use entity: <&#37; &#37;> 
 * 3. str.replace(/"/g, "&quot;");  // tag attribute
 *    str.replace(/>/g, "&gt;").replace(/</g, "&lt;"); // text node
 *  
 *  <script id="id" type="text/tmpl"></script>
 *         
 *         
 * @param str  HTML id or template string
 * @param obj  data object
 * @param openTag  optional, default <%
 * @param closeTag  optional, default %>
 * @param isCache optional, default true
 * 
 * @return parsed template string
 * 
 *
 *
 */
(function(w, undefined){
	var cache = {}; 	
	
	function tmpl(str, obj, openTag, closeTag, isCache){
		var fn, argVals = [], 
			isCache = isCache != undefined ? isCache : true;

		if(isCache && cache[str]){
			for (var i = 0, names = cache[str].argNames, len = names.length; i < len; i++){
				argVals.push(obj[names[i]]);
			}	
			fn = cache[str].parsefn;
		} else {
			
			var argNames = [], formatTmpl = (function(str){				
				if (!openTag) openTag = "<%"; 
				if (!closeTag) closeTag = "%>";
				
				/*
				 * special char: ' \r \n \
				 * 
				 * \x00: js		'
				 * \x01: js 	\n
				 * \x02: js		\
				 * 
				 * \x04: html	'
				 * \x05: html	\n
				 * \x06: html	\
				 *
				 */
				
				var el = document.getElementById(str);
				return (el ? el.innerHTML : str)

					.replace(/\r\n/g, "\n").replace(/\r/g, "\n") // normalize new line

					.replace(new RegExp(openTag + "(.|\n)*?" + closeTag, "g"), function(js) { // replace js special char
						return js.replace(/'/g, "\x00").replace(/\n/g, "\x01").replace(/\\/g, "\x02");
					})
					.replace(/'/g, "\x04").replace(/\n/g, "\x05").replace(/\\/g, "\x06") // replace HTML special char
					
					.replace(new RegExp(openTag + "=((.|\n)*?)" + closeTag, "g"), "';\n s += $1;\n s += '") // <%= expression %>
					.split(openTag).join("';\n").split(closeTag).join("\n s += '") // <% code block %>
					
					.replace(/[\x00\x01\x02\x04\x05\x06]/g, function(c) { // restore special char
						if (c == "\x00") return "'";
						if (c == "\x01") return "\n";
						if (c == "\x02") return "\\";

						if (c == "\x04") return "\\'";
						if (c == "\x05") return "\\n'\n   + '";
						if (c == "\x06") return "\\\\";
						throw "invalid: " + c; // should never run here
					})

			})(str);
			
			for (var n in obj) {argNames.push(n);argVals.push(obj[n]);}	
			fn = new Function(argNames, "var s = '';\n s += '" + formatTmpl + "';\n return s;");
			isCache && (cache[str] = {parsefn: fn, argNames: argNames});
		}

		try{
			return fn.apply(w,argVals);
		}catch(e){
			var fnName='tmpl' + Date.now(), 
				fnStr='var ' + fnName + '=' + fn.toString(), 
				head = document.getElementsByTagName("head")[0], 
				script = document.createElement("script"),
				ua = navigator.userAgent.toLowerCase(); 

			if(ua.indexOf('gecko') > -1 && ua.indexOf('khtml') == -1){ // firefox
				w['eval'].call(w, fnStr);
				w[fnName].apply(w,argVals);
				return;
			}				

			script.innerHTML = fnStr; 
			head.appendChild(script); 
			head.removeChild(script);
			w[fnName].apply(w,argVals);
		}
	} 
	
	typeof exports != "undefined" ? exports.tmpl = tmpl : w.tmpl = tmpl;	
})(window);

