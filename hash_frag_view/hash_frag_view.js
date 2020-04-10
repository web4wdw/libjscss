/*!
 * HashFragView
 * @author wangdingwei
 */

/*
	<section id='ur-id' style='display: none'>
	
	</section>
	
	var view = new HashFragView();
	view.addView('ur-id', function() {
		var elem = this;
		//view.showViewElem(elem); //$(this).show(); //view.showViewElem();
	}, {autoDisplay: false});
	view.addView ....
	view.init();
 
 */
 
 
 
if(!window.console) window.console={};if(!window.console.log) window.console.log=function(){};

/**
 * hash fragment view
 * http://www.wdw.com/page#!hi?a=b
 */
function HashFragView() {
	this.curHash = null;
	this.curId = null;
	this.curIdObj = null;
	this.idList = new Array();
	this.idObjList = new Array(); 
	this.intervalId = null;
	this.isInited = false;
}


/** get hash para */
HashFragView.getUrlFragPara = function (name, defVal) { return (RegExp('(\\?|&)' + name+ '=([^&#]*)').exec(location.href)||[,,undefined==defVal ? '' : defVal])[2]; };

/**
 * get current id
 */
HashFragView.getViewId = function (hash) {
	hash = hash || window.location.hash;
	//startsWith "#!"
	if (hash.slice(0, 2) != "#!") {
		return "";
	}
	var index = hash.indexOf("?");
	if (index < 0) index = hash.length;
	
	return hash.slice(2, index);
}; // $$$ getViewId()




/**
 * add view by id
 * @param id - the view element id
 */
HashFragView.prototype.addView = function(id, func, options) {
	options = options || {};
	this.idList.push(id);
	this.idObjList.push({
		/** view id */
		id: id, 
		/** view element. getElementById later */
		elem: null, 
		/**  view scrollY */
		scrollY: -5151,  
		/**  view func call times */
		times: 0,
		/** date object used to store user data */
		dataObj: {}, 
		/** 
		 * should this view  be displayed automatically. 
		 * if false, the view should be displayed yourself: 
		 * this.style.display = "block"; 
		 */
		autoDisplay: false === options.autoDisplay ? false : true,  
		/**
		 * func to be execute once the view displayed
		 */
		func: func 
	}); 
}; // $$$ addView()


/**
 * init HashFragView
 */
HashFragView.prototype.init = function() {
	
	if (this.isInited) return;
	this.isInited = true;
	
	var view = this;
	
	if ("onhashchange" in window) {
		console.log("very good, your browser support onhashchange event");
		view.hashchange(); 
		window.addEventListener("hashchange", function() {
			view.hashchange(false);
		}, false)
	}
	else {
		this.intervalId || (this.intervalId = window.setInterval(function(){
			if (this.curHash === window.location.hash) return;
			view.hashchange(false);
		}, 200)); 
	}
	
}; // $$$ init()


HashFragView.prototype.hashchange = function(needChangeUrlHash) {
	needChangeUrlHash = needChangeUrlHash || false;
	var id = HashFragView.getViewId();
	if (this.idList.indexOf(id) >= 0 ) {  //id is OK
		this._0showView(window.location.hash, needChangeUrlHash);
	}
};


HashFragView.prototype.getIdObj = function(id) {
	var index = this.idList.indexOf(id);
	if (index < 0) {
		console.log("HashFragView.prototype.getIdObj() id not found: " + id);
		return null;
	}
	idObj = this.idObjList[index];
	idObj.elem = document.getElementById(id);
	if (!idObj.elem) {
		console.log("HashFragView.prototype.getIdObj() could not get Element: " + id);
	}
	return idObj;
};



/**
 * show view
 * @param newHash - the new hash will be showed
 * @param needChangeHash - if the window.location.hash should be changed. 
 */
HashFragView.prototype._0showView = function(newHash, needChangeUrlHash)  {
	if (newHash === this.curHash) return;
	
	var idObj, newId = HashFragView.getViewId(newHash);
	
	
	if (needChangeUrlHash) { location.hash = newHash; }
	
	
	
	// hide previous view, only if exist and not equal the new id
	if (this.curId && newId !== this.curId) {
		idObj = this.getIdObj(this.curId);
		idObj.scrollY = window.scrollY || document.body.scrollTop || window.pageYOffset;	
		idObj.elem.style.display = "none";
	}
	
	this.curIdObj = idObj = this.getIdObj(newId);
	if (newId !== this.curId && true == idObj.autoDisplay) { idObj.elem.style.display = "block"; }
	
	idObj.func && idObj.func.call(idObj.elem, idObj.dataObj, ++idObj.times);
	
	if (newId !== this.curId) {
		-5151 === idObj.scrollY && window.scrollTo(0, 0);
		(idObj.scrollY || 0 === idObj.scrollY) && window.scrollTo(0, idObj.scrollY);
	}
	
	this.curHash = newHash;
	this.curId = newId;
}; // $$$ _0showView()







/**
 * show view
 * @param newHash - location hash value, such as #id?w=a
 */
HashFragView.prototype.showView = function(newHash)  {
	if (newHash.slice(0, 2) != "#!") {
		newHash = "#!" + newHash;
	}
	this._0showView(newHash, true);
};

/** show current view */
HashFragView.prototype.showViewElem = function(elem)  {
	if (elem) { elem.style.display = "block"; }
	else { this.curIdObj && this.curIdObj.elem && (this.curIdObj.elem.style.display = "block"); }
};
/** hide current view */
HashFragView.prototype.hideViewElem = function(elem)  {
	if (elem) { elem.style.display = "none"; }
	else { this.curIdObj && this.curIdObj.elem && (this.curIdObj.elem.style.display = "none"); }
};








