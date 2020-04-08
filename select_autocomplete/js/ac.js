/*!
 * <select> auto complete 
 * 
 * javascript:(function(doc,t,r){doc=doc||document;window.g_wdw_ac_doc=doc;window.g_wdw_ac_t=t;window.g_wdw_ac_r=r;var elem=doc.createElement("script");elem.type="text/javascript";elem.src="http://127.0.0.1:8000/js/ac.js";doc.getElementsByTagName('head')[0].appendChild(elem);})()
 *
 * @author wdw
 */

/*
 	
	
	javascript:(function(d, t, r){
		doc = d || document;
		window.g_wdw_ac_d = d;
		window.g_wdw_ac_t = t;
		window.g_wdw_ac_r = r;
		var elem = doc.createElement("script");
		elem.type = "text/javascript";
		elem.src = "http://127.0.0.1:8000/js/ac.js";
		doc.getElementsByTagName('head')[0].appendChild(elem);
	})()
	
	
	javascript:(function(doc,t,r){doc=doc||document;window.g_wdw_ac_doc=doc;window.g_wdw_ac_t=t;window.g_wdw_ac_r=r;var elem=doc.createElement("script");elem.type="text/javascript";elem.src="http://127.0.0.1:8000/js/ac.js";doc.getElementsByTagName('head')[0].appendChild(elem);})()
	
	
	//精简写法
	javascript:(function(d, t, r){
		d = d || document;
		g_wdw_ac_doc = d;
		g_wdw_ac_t = t;
		g_wdw_ac_r = r;
		var e = d.createElement("script");
		e.type = "text/javascript";
		e.src = "http://127.0.0.1:8000/js/ac.js";
		d.body.appendChild(e);
	})()
	
	
	javascript:(function(d,t,r){d=d||document;g_wdw_ac_doc=d;g_wdw_ac_t=t;g_wdw_ac_r=r;var e=d.createElement("script");e.type="text/javascript";e.src="http://127.0.0.1:8000/js/ac.js";d.body.appendChild(e);})()
	
	
	//window.frames[1].document
	
	
	
*/





(function() {

	if(!window.console) window.console={};if(!window.console.log) window.console.log=function(){};
	

	
	
	
	
	
	function selCB(value) { 
		var opts = cur_sel.options,
			opt, i = 0;
		for (;opt = opts[i]; i++) {
			if (opt.text == value) {
				opt.selected = true;
			}
		}
	}
	
	//ac rst
	function ac(data) {
		if (data == null || data.length == 0) {
			ulE.innerHTML = "<span style='color: blue;'>&#160;not found !!!</span>"; return;
		}
		ulE.innerHTML = "";
		acLIArr = [];
		acHiIndex = 0;
		var i, li, a;
		for (i = 0; a = data[i]; i++) {
			li = createLI(a);
			acLIArr.push(li);
			if (0 == i) highlightLI(li, true);
			ulE.appendChild(li);
		}
	}
	
	
		
	
	/**
	 * <select> element click
	 */
	function selClick() {
		if (this === cur_sel) return;
		else cur_sel = this;
		
		ulE.innerHTML = "";
		inputE.value = "";
		
		optTxtArr = [];
		var opts = this.options,
			opt, i = 0;
		for (;opt = opts[i]; i++) {
			optTxtArr.push(opt.text);
		}
	}

	
	/**
	 * up key pressed function
	 */
	function keyUp() {
		if (acHiIndex <= 0) return;		
		highlightLI(acLIArr[acHiIndex], false);
		highlightLI(acLIArr[--acHiIndex], true);
	}
	
	/**
	 * down key pressed function
	 */
	function keyDown() {
		if (acHiIndex >= acLIArr.length-1) return;		
		highlightLI(acLIArr[acHiIndex], false);
		highlightLI(acLIArr[++acHiIndex], true);
	}
	
	/**
	 * key down handler function
	 */
	function keydownHandler(event) {
		if (null == cur_sel) {
			//alert("please select first!!"); 
			ulE.innerHTML = "<span style='color: blue;'>&#160;select 1st!!!</span>";
			inputE.value = ""; 
			return;
		}
		
		var which = event.keyCode || event.charCode;
		if (38 == which) { //up
			keyUp();
		}
		else if (40 == which) { //down
			keyDown();
		}
	}
	
	
	function inputChange() {
	
		var val = inputE.value.toLowerCase(),
			i, a;
		
		//if (null == optTxtArr) {alert("please select first!!"); inputE.value = ""; return;}
		
		acTxtArr = [];
		for (i = 0; a = optTxtArr[i]; i++) {
			if (a.toLowerCase().indexOf(val) >= 0) acTxtArr.push(a);
		}
		ac(acTxtArr);
	
	}
	
	
	
	
	var timeoutID = 0;
	/**
	 * input key up
	 */
	function inputKeyUpHandler(event) {
		if (null == cur_sel) {return;}
		var which = event.keyCode || event.charCode;
		console.log(which);
		
		
		
		if ( (which >= 37 && which <= 40) ) return; // LEFT RIHGT
		
		if (which == 13) { //enter key
			selCB(acTxtArr[acHiIndex]);
			ulE.innerHTML = "";
			cur_sel.focus();
			return;
		}
		
		if (which == 27) { //ESC
			ulE.innerHTML = "";
			inputE.value = "";
			return;
		}
		
		ulE.innerHTML = "<span style='color: blue;'>&#160;searching ...</span>";
		
		window.clearTimeout(timeoutID);
		timeoutID = window.setTimeout(function() {
			inputChange();
		},500);
		
		
	}
	
	
	
		
	function createLI(text) {
		var liE = doc.createElement("li");
		liE.setAttribute("class", "wdw-ac-li");
		//liE.setAttribute("style", "list-style-type: none; padding: 2px 5px; border-left: 2px ridge #DBF1D4; border-right: 2px ridge #DBF1D4; border-bottom: 1px solid #A5DA94;");
		liE.style.listStyleType = "none";
		liE.style.padding = "2px 5px";
		liE.style.borderLeft = "1px ridge #DBF1D4";
		liE.style.borderRight = "1px ridge #DBF1D4";
		liE.style.borderBottom = "1px solid #A5DA94";
		
		liE.innerHTML = text;
		return liE;
	}
	
	function highlightLI(elem, b) {
		//b ? elem.style.color="#C77405" : elem.style.color="#000000"; 
		b ? elem.style.color="#F00" : elem.style.color="#000"; 
	}
	
	
	
	//=========================== stmt =======================
	
	var doc = window.g_wdw_ac_doc || document, 
		cur_sel = null,
		divE = doc.createElement("div");

	divE.setAttribute("id", "wdw-auto-complete");
	//divE.setAttribute("style", "position:absolute; right:10px; top:10px; z-index: 999; text-align: left; width: 120px;"); //not work in ie
	divE.style.position = "fixed";
	divE.style.right = (window.g_wdw_ac_r || 10) + "px";
	divE.style.top = (window.g_wdw_ac_t || 10) + "px";
	divE.style.zIndex = "999";
	divE.style.textAlign = "left";
	//divE.style.width = "120px";
	divE.style.backgroundColor = "#F2F4FF";
	           
	
	
	
	divE.innerHTML = '<input id="wdw-ac-input" type="text" style="border-width: 2px; padding: 1px; margin: 1px; width: 112px;"/>'
			+ '<ul id="wdw-ac-ul" style="margin: 0px; padding: 0px; border: 0px solid #DDDDDD; cursor: pointer;"></ul>';
	doc.body.appendChild(divE);
	var inputE = doc.getElementById("wdw-ac-input");
	var ulE = doc.getElementById("wdw-ac-ul");
	
		
	
	
	var acTxtArr = null, // ac text array, which match input
		acLIArr = null,  // ac li node array
		acHiIndex = 0, // ac highlight index
		optTxtArr = null; // options text array
	
	if (document.addEventListener) { divE.addEventListener("keydown", keydownHandler, false);}
    else { divE.attachEvent("onkeydown", keydownHandler); }
	
	if (document.addEventListener) { divE.addEventListener("keyup", inputKeyUpHandler, false);}
	else { divE.attachEvent("onkeyup",function(evtO){inputKeyUpHandler.call(divE, evtO)}); }


	var elems = doc.getElementsByTagName("select"),
		elem, i = 0;
	for (;elem = elems[i]; i++) {
		if (document.addEventListener) { elem.addEventListener("click", selClick,  false);}
		else { 
			var handler = (function() {
				var e = elem;
				return function(evtO) {selClick.call(e, evtO)}
			})();
			elem.attachEvent("onclick", handler); 
		}
	}



	//acTxtArr = [1,2,3,4,5];
	//ac(acTxtArr);
	
})();



