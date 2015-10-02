(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var KT = {};

KT.Canvas = require('./kt_Canvas');
KT.Input = require('./kt_Input');
KT.Utils = require('./kt_Utils');

module.exports = KT;
},{"./kt_Canvas":3,"./kt_Input":4,"./kt_Utils":5}],2:[function(require,module,exports){
var KT = require('./Kramtech');

function Underworld(elDiv){
    this.canvas = KT.Canvas.createCanvas(640, 480, elDiv);
    this.ctx = KT.Canvas.get2DContext(this.canvas);
    
    KT.Input.listenTo(this.canvas);
}

KT.Utils.addEvent(window, 'load', function(){
    var game = new Underworld(KT.Utils.get("divGame"));
});
},{"./Kramtech":1}],3:[function(require,module,exports){
module.exports = {
    createCanvas: function(iWidth, iHeight, elContainer){
        var canvas = document.createElement("canvas");
        
        canvas.width = iWidth;
        canvas.height = iHeight;
        
        if (elContainer) elContainer.appendChild(canvas);
        
        return canvas;
    },
    
    get2DContext: function(elCanvas){
        if (!elCanvas || !elCanvas.getContext) return null;
        
        var ctx = elCanvas.getContext("2d");
        
        ctx.width = elCanvas.width;
        ctx.height = elCanvas.height;
        
        return ctx;
    }
};
},{}],4:[function(require,module,exports){
var Utils = require('./kt_Utils');

module.exports = {
    _keys: [],
    _vKeys: {
        SHIFT: 16,
		TAB: 9,
		CTRL: 17,
		ALT: 18,
		SPACE: 32,
		ENTER: 13,
		BACKSPACE: 8,
		ESC: 27,
		INSERT: 45,
		DEL: 46,
		END: 35,
		START: 36,
		PAGEUP: 33,
		PAGEDOWN: 34
    },
    
    listenTo: function(elCanvas){
        var thus = this;
        
        Utils.addEvent(document, 'keydown', function(eEvent){ thus.onKeyDown(eEvent); } );
        Utils.addEvent(document, 'keyup', function(eEvent){ thus.onKeyUp(eEvent); } );
        
        for (var i=0;i<=9;i++){
			this._vKeys['N' + i] = 48 + i;
			this._vKeys['NK' + i] = 96 + i;
		}
		
		for (var i=65;i<=90;i++){
			this._vKeys[String.fromCharCode(i)] = i;
		}
		
		for (var i=1;i<=12;i++){
			this._vKeys['F' + i] = 111 + i;
		}
    },
    
    onKeyDown: function(eEvent){
        if (this._keys[eEvent.keyCode] == 2) return;
        
        this._keys[eEvent.keyCode] = 1;
    },
    
    onKeyUp: function(eEvent){
        this._keys[eEvent.keyCode] = 0;
    }
};
},{"./kt_Utils":5}],5:[function(require,module,exports){
module.exports = {
    addEvent: function(elObj, sType, fCallback){
        if (elObj.addEventListener){
            elObj.addEventListener(sType, fCallback, false);
        }else if (elObj.attachEvent){
            elObj.attachEvent("on" + sType, fCallback);
        }
    },
    
    get: function(sId){
        return document.getElementById(sId);
    }
};
},{}]},{},[2]);
