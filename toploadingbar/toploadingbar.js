
;(function(window, undefined) {

var	docFrag = function(html, context) {
	var doc = (context ? (context.ownerDocument || context) : document);
	var docF = doc.createDocumentFragment(),
		divE = doc.createElement("div"),
		c;
	divE.innerHTML = html;
	while(c = divE.firstChild) {docF.appendChild(c);}
	return docF;
};

function TopLoadingBar(id) {
	this.id = id ? id : "w-simple-top-loading-bar"
	this.times = 0;
	this.intervalId = null;
	this.lastLoadTm = 0;
	
	var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	this.boxNo = width/100;
	if (this.boxNo < 3) this.boxNo = 3;
	this.boxes = new Array();
	
	var docfrag = docFrag('<div style="display: none; background: #29d;position: fixed;z-index: 2000;top: 0px;left: 0px;width: 100%;height: 3px;-webkit-transition: width 1s;-moz-transition: width 1s;-o-transition: width 1s;transition: width 1s;" id="' + this.id + '"></div>');
	
	document.body.appendChild(docfrag);
	this.elem = document.getElementById(this.id);
	
	
	for (var i = 0; i < this.boxNo; ++i) {
		var left = width/this.boxNo * i;
		//console.log("tiploadingbar: " + i + ", " + left);
		var box = docFrag('<div style="background: #eee; display: inline-block; position: absolute; top: 0px; left: ' + left + 'px; width: 2px; height: 3px;"></div>');
		this.boxes.push(box.childNodes[0]);
		this.elem.appendChild(box);
	}
		
}

TopLoadingBar.prototype.load = function() {
	this.lastLoadTm = +new Date();
	if (this.times++ > 0) return;
	var thiz = this;
	if (window.jQuery) {
		$(this.elem).finish().fadeIn(100);
	} else {
		this.elem.style["display"] = "block";
	}
	
	var offset = 0;
	
	this.intervalId = window.setInterval(function() {
		if (+new Date() - thiz.lastLoadTm > 1000*60*2) { // more then given time, clear it
			thiz.times = 0;
			thiz.unload();
			return;
		}
		var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		for (var i = 0, b; b = thiz.boxes[i]; ++i) {
			var left = width/thiz.boxNo * i;
			
			offset += 10;
			if (offset > width/thiz.boxNo) offset = 0;

			b.style["left"] =  left + offset + "px";
			//console.log("index=" + i + ", left=" + left);
		}
	}, 100);
};

TopLoadingBar.prototype.unload = function() {
	if (this.times > 0) { this.times--; }
	if (this.times > 0) return;
	clearInterval(this.intervalId);
	if (window.jQuery) {
		$(this.elem).finish().fadeOut(200);
	} else {
		this.elem.style["display"] = "none";
	}
};
TopLoadingBar.prototype.stop = function() {
	if (this.times > 0) { this.times = 0; }
	if (this.times > 0) return;
	clearInterval(this.intervalId);
	if (window.jQuery) {
		$(this.elem).finish().fadeOut(200);
	} else {
		this.elem.style["display"] = "none";
	}
};

window.TopLoadingBar = TopLoadingBar;

})(window);

