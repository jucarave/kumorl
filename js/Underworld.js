(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var KT = {};

KT.Canvas = require('./kt_Canvas');
KT.Utils = require('./kt_Utils');

module.exports = KT;
},{"./kt_Canvas":3,"./kt_Utils":4}],2:[function(require,module,exports){
var KT = require('./Kramtech');

function Underworld(div){
    this.canvas = KT.Canvas.createCanvas(640, 480, div);
    this.ctx = KT.Canvas.get2DContext(this.canvas);
    
    
}

KT.Utils.addEvent(window, 'load', function(){
    var game = new Underworld(KT.Utils.get("divGame"));
});
},{"./Kramtech":1}],3:[function(require,module,exports){
module.exports = {
    createCanvas: function(width, height, container){
        var canvas = document.createElement("canvas");
        
        canvas.width = width;
        canvas.height = height;
        
        if (container) container.appendChild(canvas);
        
        return canvas;
    },
    
    get2DContext: function(canvas){
        if (!canvas || !canvas.getContext) return null;
        
        return canvas.getContext("2d");
    }
};
},{}],4:[function(require,module,exports){
module.exports = {
    addEvent: function(obj, type, callback){
        if (obj.addEventListener){
            obj.addEventListener(type, callback, false);
        }else if (obj.attachEvent){
            obj.attachEvent("on" + type, callback);
        }
    },
    
    get: function(id){
        return document.getElementById(id);
    }
};
},{}]},{},[2]);
