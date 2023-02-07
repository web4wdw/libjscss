"use strict"

/**
 * 
 * https://qt.gtimg.cn/q=r_hk00700,sh000001
 * https://hq.sinajs.cn/list=rt_hk00700,sh000001
 * 
 * 
 * 跨域(Access-Control-Allow-Origin): 新浪不支持, QQ支持
 * 竞价阶段报价更新: 新浪不支持, QQ支持
 * 港股实时报价: 新浪rt_, QQ r_
 * chrome extension不能用jsonp, 不允许执行远程脚本
 * 
 * 
 * quote info:
 *   sym
 *   name
 *   prevClose
 *   now
 *   min
 *   max
 *   date
 *   time
 * 
 */


function stdSecuritySymbols(syms, src) {
    var isQQ = src != "sina";
    var arr = [];
    syms.forEach(v => {
        if (v.startsWith("#") || v.startsWith("//")) {
            return;
        }
        else if (v.startsWith("hk")) {
            v = isQQ ? "r_" + v : "rt_" + v;
        } 
        else {
        }
        arr.push(v);
    });
    return arr;
}

/**
 * 
 * @param {int or string} price 
 * @returns string
 */
function beautyPrice(price) {
    price = parseFloat(price);
    var fractionCnt = 1;
    if (price >= 1000) fractionCnt = 0;
    else if (price >= 100) fractionCnt = 1;
    else if (price >= 10) fractionCnt = 2;
    else fractionCnt = 3;

    price = Number(price).toFixed(fractionCnt);
    return price;
}



/**
 * 
 */
function parseSinaQuote(sym, str) {
    var info = {sym: sym.replace(/^rt_/, "")};
    if (str == "") {
        return info;
    }
    var arr = str.split(",");

    var debugStr = [];
    arr.forEach((val, idx) => {
        debugStr.push(idx + " " + val);
    });
    window.IsDebug && console.log("------ " + sym + " ------\n" + debugStr.join("; "));
    if (sym.startsWith("hf_")) { // 期货
        info.name = arr[13];
        info.prevClose = parseFloat(arr[7]); // 昨收
        info.now = parseFloat(arr[0]);
        info.date = arr[12];
        info.time = arr[6];
    }
    else if(sym.startsWith("hk") || sym.startsWith("rt_hk")) {
        info.name = arr[0];
        info.prevClose = parseFloat(arr[3]); // 昨收
        info.date = arr[17];
        info.time = arr[18];

        // 6不包含竞价, 9买1， 10卖1
        info.now = parseFloat(arr[6]);
    }
    else {
        info.name = arr[0];
        info.prevClose = parseFloat(arr[2]); // 昨收
        info.now = parseFloat(arr[3]);
        info.date = arr[30];
        info.time = arr[31];
    }

    var nowPercent = (info.now - info.prevClose)*100.0/info.prevClose;
    nowPercent = Number(nowPercent).toFixed(2);

    info.percent = nowPercent;
    info.percentStr = nowPercent >= 0 ? "+" + nowPercent + "%" : nowPercent + "%"; 

    window.IsDebug && console.log(info);
    return info;
}


function parseQQQuote(sym, str) {
    var info = {sym: sym.replace(/^r_/, "")};
    if (str == "") {
        return info;
    }
    var arr = str.split("~");

    var debugStr = [];
    arr.forEach((val, idx) => {
        debugStr.push(idx + " " + val);
    });
    window.IsDebug && console.log("------ " + sym + " ------\n" + debugStr.join("; "));
    if(sym.startsWith("hk") || sym.startsWith("r_hk")) {
        info.name = arr[1];
        info.prevClose = parseFloat(arr[4]); // 昨收
        info.now = parseFloat(arr[3]);
        info.min = parseFloat(arr[34]);
        info.max = parseFloat(arr[33]);
        info.date = arr[30].split(" ")[0];
        info.time = arr[30].split(" ")[1];
    }
    else {
        info.name = arr[1];
        info.prevClose = parseFloat(arr[4]); // 昨收
        info.now = parseFloat(arr[3]);
        info.min = parseFloat(arr[34]);
        info.max = parseFloat(arr[33]);
        info.date = arr[30].substring(0, 8);
        info.time = arr[30].substring(8).match(/\d{2}/g).join(":");
    }

    var nowPercent = (info.now - info.prevClose)*100.0/info.prevClose;
    nowPercent = Number(nowPercent).toFixed(2);

    info.percent = nowPercent;
    info.percentStr = nowPercent >= 0 ? "+" + nowPercent + "%" : nowPercent + "%"; 

    window.IsDebug && console.log(info);
    return info;
}

function getQuoteInfos(syms, src) {
    syms = stdSecuritySymbols(syms, src);
    var isQQ = src != "sina";
    var urlPrefix = isQQ ? "https://qt.gtimg.cn/q=" : "https://hq.sinajs.cn/list=";
    
    return new Promise((resolve, reject) => {
        $.ajax({
            url: urlPrefix + syms.join(","),
            success: function(data) {
                let infos = [];
                if (data.startsWith("v_pv_none_match=")) {
                    resolve(infos);
                    return;
                }
                //console.log(data);
                data.split(/[\r\n;]+/).forEach((v) => {
                    v = v.trim();
                    if (v.length == 0) return;
                    var sym = v.replace(/(var hq_str_|v_)/g, "").replace(/=[^=]*/,'').replace(/["\r\n]/g, "");
                    var quoteStr = v.replace(/[^=]*=/,'').replace(/["\r\n]/g, "");
                    var info = isQQ ? parseQQQuote(sym, quoteStr) : parseSinaQuote(sym, quoteStr);
                    infos.push(info);
                });
                resolve(infos);
            }
        }).fail(function() {
            console.warn("get quote info failed", arguments);
            reject();
        });
    });
}



/*
 * jsonp 
 */
function getQuoteInfosJSONP(syms, src) {
    syms = stdSecuritySymbols(syms, src);
    var isQQ = src != "sina";
    var urlPrefix = isQQ ? "https://qt.gtimg.cn/q=" : "https://hq.sinajs.cn/list=";

    return new Promise((resolve, reject) => {
        $.ajax({
            url: urlPrefix + syms.join(","),
            dataType: "script",
            cache: "true",
            success: function(data) {
                let infos = [];

                syms.forEach(sym => {
                    var key = isQQ ? "v_" : "hq_str_";
                    key += sym;
                    var quoteStr = window[key];
                    var info = isQQ ? parseQQQuote(sym, quoteStr) : parseSinaQuote(sym, quoteStr);
                    infos.push(info);
                });
                resolve(infos);
            }
        }).fail(function() {
            console.warn("get quote info failed", arguments);
            reject();
        });
    });
}

