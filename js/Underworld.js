(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var KT = require('./kt_Kramtech');

function Actor(oMapManager, oSprite, oPosition){
    this.mapManager = oMapManager;
    this.sprite = oSprite;
    
    this.position = oPosition;
    this.position.z = 0;
    this.scale = new KT.Vector2(1, 1);
    
    this.target = new KT.Vector2(-1, 0);
    this.moving = false;
    
    this.imageIndex = 0;
    this.imageSpeed = 1 / 8;
    
    this.drawParams = {
        scale: this.scale
    };
}

module.exports = Actor;

Actor.prototype.moveTo = function(xTo, yTo){
    if (this.moving) return;
    if (this.mapManager.isSolid(this.position.x + xTo, this.position.y + yTo)) return;
    
    if (xTo != 0) this.scale.x = xTo;
    
    this.target.set(this.position.x + xTo, this.position.y + yTo);
    this.moving = true;
};

Actor.prototype.draw = function(oCtx, view){
    KT.Canvas.drawSprite(oCtx, this.sprite, (this.position.x - view.x) * 32, ((this.position.y - view.y) * 32) - this.position.z, this.imageIndex, 0, this.drawParams);
};

Actor.prototype.finishMovement = function(){
    this.moving = false;
    this.position.copy(this.target);
    this.position.z = 0;
    this.target.set(-1, 0);
};

Actor.prototype.updateMovement = function(){
    if (!this.moving) return;
    
    if ((this.target.x != this.position.x && Math.abs(this.target.x - this.position.x) <= 0.5) || 
        (this.target.y != this.position.y && Math.abs(this.target.y - this.position.y) <= 0.5))
        this.position.z -= 0.5;
    else
        this.position.z += 0.5;
    
    if (this.target.x > this.position.x){
        this.position.x += 0.2;
        if (this.target.x <= this.position.x){ this.finishMovement(); }
    }else if (this.target.x < this.position.x){
        this.position.x -= 0.2;
        if (this.target.x >= this.position.x){ this.finishMovement(); }
    }else if (this.target.y > this.position.y){
        this.position.y += 0.2;
        if (this.target.y <= this.position.y){ this.finishMovement(); }
    }else if (this.target.y < this.position.y){
        this.position.y -= 0.2;
        if (this.target.y >= this.position.y){ this.finishMovement(); }
    }
};

Actor.prototype.update = function(){
    if (!this.moving){
        this.imageIndex += this.imageSpeed;
        if (this.imageIndex >= this.sprite.hNum){
            this.imageIndex = 0;
        }
    }
    
    this.updateMovement();
};
},{"./kt_Kramtech":7}],2:[function(require,module,exports){
var Player = require('./g_Player');
var KT = require('./kt_Kramtech');

function MapManager(oGame, sMapName){
    this.game = oGame;
    this.mapName = sMapName;
    
    this.player = null;
    this.map = null;
    
    this.tilesLoc = [];
    this.view = new KT.Vector2(0, 0);
    this.view.width = 27;
    this.view.height = 15;
    
    this.ready = false;
    this.loadMap(sMapName);
}

module.exports = MapManager;

MapManager.prototype.parseTilesLocation = function(oTileset){
    var floor = Math.floor;
    
    for (var i=0,len=oTileset.length;i<len;i++){
        var tile = oTileset[i];
        
        var ind = 0;
        for (var j=tile.index[0];j<=tile.index[1];j++){
            this.tilesLoc[j] = {
                sprIndex: i,
                x: (ind % tile.hNum),
                y: floor(ind / tile.hNum)
            };
            
            ind += 1;
        }
    }
};

MapManager.prototype.loadMap = function(sMapName){
    var thus = this;
    
    KT.Utils.getJson('services/loadMap.php?mapName=' + this.mapName, function(error, map){
        if (error) throw "Fatal error during the execution of the app.";
        
        thus.map = new Array(64);
    
        for (var i=0;i<64;i++){
            thus.map[i] = new Uint8ClampedArray(map.mapData[i]);
        }
        
        thus.game.loadTileset(map.tileset);
        thus.parseTilesLocation(map.tileset);
        thus.player = new Player(thus, thus.game.sprites.player, new KT.Vector2(2, 2));
        
        thus.ready = true;
    });
};

MapManager.prototype.isSolid = function(x, y){
    var t = this.map[y][x];
    if (t == 0) return true;
    
    var loc = this.tilesLoc[t];
    return this.game.tileset[loc.sprIndex].solid;
};

MapManager.prototype.drawMap = function(){
    var ctx = this.game.ctx;
    var drawSprite = KT.Canvas.drawSprite;
    
    var m = Math;
    
    this.view.x = m.max(0, m.min(64, (this.player.position.x - (this.view.width / 2)) ));
    this.view.y = m.max(0, m.min(64, (this.player.position.y - (this.view.height / 2)) ));
    
    var xx = m.floor(this.view.x);
    var yy = m.floor(this.view.y);
    
    var ww = xx + this.view.width;
    var hh = yy + this.view.height;
    ww = m.max(0, m.min(64, ww));
    hh = m.max(0, m.min(64, hh));
    
    for (var y=yy;y<hh;y++){
        for (var x=xx;x<ww;x++){
            var t = this.map[y][x];
            if (t == 0) continue;
            
            var loc = this.tilesLoc[t];
            var sprite = this.game.tileset[loc.sprIndex].sprite;
            drawSprite(ctx, sprite, (x - this.view.x) * 32, (y - this.view.y) * 32, loc.x, loc.y);
        }
    }
};

MapManager.prototype.update = function(){
    var ctx = this.game.ctx;
    
    this.player.update();
    
    this.drawMap();
    this.player.draw(ctx, this.view);
};
},{"./g_Player":3,"./kt_Kramtech":7}],3:[function(require,module,exports){
var Actor = require('./g_Actor');
var KT = require('./kt_Kramtech');

function Player(oMapManager, oSprite, oPosition){
    Actor.call(this, oMapManager, oSprite, oPosition);
}

Player.prototype = Object.create(Actor.prototype);

module.exports = Player;

Player.prototype.checkInput = function(){
    var Input = KT.Input;
    
    var xTo = 0, yTo = 0;
    if (Input.isKeyDown(Input.vKeys.W)){ yTo = -1; }else
    if (Input.isKeyDown(Input.vKeys.S)){ yTo =  1; }else
    if (Input.isKeyDown(Input.vKeys.A)){ xTo = -1; }else
    if (Input.isKeyDown(Input.vKeys.D)){ xTo =  1; }
    
    if (xTo != 0 || yTo != 0){
        this.moveTo(xTo, yTo);
    }
};

Player.prototype.update = function(){
    Actor.prototype.update.call(this);
    
    this.checkInput();
};
},{"./g_Actor":1,"./kt_Kramtech":7}],4:[function(require,module,exports){
var KT = require('./kt_Kramtech');
var MapManager = require('./g_MapManager');

function Underworld(elDiv){
    this.canvas = KT.Canvas.createCanvas(854, 480, elDiv);
    this.ctx = KT.Canvas.get2DContext(this.canvas);
    
    KT.Input.listenTo(this.canvas);
    
    this.maps = [];
    this.map = null;
    this.sprites = {};
    this.tileset = [];
    
    this.fps = 1000 / 30;
    this.lastFrame = 0;
    
    this.loadImages();
}

Underworld.prototype.loadTileset = function(tileset){
    var jlen = tileset.length;
    for (var i=0;i<this.tileset.length;i++){
        var found = false;
        for (var j=0,tile;j<jlen;j++){
            tile = tileset[j];
            if (this.tileset[i].name == tile.name){
                tileset.splice(j, 1);
                found = true;
                j = jlen;
            }
        }
        
        if (!found){
            this.tileset.splice(i, 1);
        }
    }
    
    jlen = tileset.length;
    for (j=0;j<jlen;j++){
        tile = tileset[j];
        this.tileset.push({
            name: tile.name,
            sprite: KT.Sprite.loadSprite('img/' + tile.path, 32, 32),
            index: tile.index,
            solid: tile.solid
        });
    }
};

Underworld.prototype.loadImages = function(){
    this.sprites.player = KT.Sprite.loadSprite('img/sprPlayer.png', 32, 32, {origin: new KT.Vector2(16, 16)});
};

Underworld.prototype.checkReadyData = function(){
    for (var i in this.sprites){
        if (!this.sprites[i].ready){ return false; }
    }
    
    return true;
};

Underworld.prototype.newGame = function(){
    this.maps = [];
    this.map = new MapManager(this, 'testMap');
    
    this.loopGame();
};

Underworld.prototype.loopGame = function(){
    var nowDate = (new Date()).getTime();
    var delta = nowDate - this.lastFrame;
    
    if (delta > this.fps){
        this.lastFrame = nowDate - (delta % this.fps);
        
        this.update();
    }
    
    var thus = this;
    requestAnimFrame(function(){ thus.loopGame(); });
};

Underworld.prototype.update = function(){
    if (!this.map || !this.map.ready) return;
    
    KT.Canvas.clearCanvas(this.ctx, "#000000");
    this.map.update();
};

KT.Utils.addEvent(window, 'load', function(){
    var game = new Underworld(KT.Utils.get("divGame"));
    
    var wait = function(){
        if (game.checkReadyData()){
            game.newGame();
        }else{
           setTimeout(wait, 1000 / 30);
        }
    }
    
    wait();
});

var requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 30);
          };
})();
},{"./g_MapManager":2,"./kt_Kramtech":7}],5:[function(require,module,exports){
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
    },
    
    clearCanvas: function(oCtx, sColor){
        if (sColor){
            var oldC = oCtx.fillStyle;
            
            oCtx.fillStyle = sColor;
            oCtx.fillRect(0, 0, oCtx.width, oCtx.height);
            oCtx.fillStyle = oldC;
        }else{
            oCtx.clearRect(0, 0, oCtx.width, oCtx.height);
        }
    },
    
    drawSprite: function(oCtx, oSprite, x, y, iHSubImg, iVSubImg, params){
        if (!oSprite.ready) return;
        if (!params) params = window.empt;
        
        iHSubImg = iHSubImg << 0;
        iVSubImg = iVSubImg << 0;
        
        var iw = oSprite.sprWidth;
        var ih = oSprite.sprHeight;
        
        var ox = oSprite.origin.x;
        var oy = oSprite.origin.y;
        
        oCtx.save();
        
        oCtx.translate(x + ox, y + oy);
        if (params.scale) oCtx.scale(params.scale.x, params.scale.y);
        
        oCtx.drawImage(oSprite, 
                iHSubImg * iw, iVSubImg * ih, iw, ih,
                -ox, -oy, iw, ih);
                
        oCtx.restore();
    }
};
},{}],6:[function(require,module,exports){
var Utils = require('./kt_Utils');

module.exports = {
    keys: new Uint8ClampedArray(255),
    vKeys: {
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
		PAGEDOWN: 34,
		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40
    },
    
    listenTo: function(elCanvas){
        var thus = this;
        
        Utils.addEvent(document, 'keydown', function(eEvent){ thus.onKeyDown(eEvent); } );
        Utils.addEvent(document, 'keyup', function(eEvent){ thus.onKeyUp(eEvent); } );
        
        for (var i=0;i<=9;i++){
			this.vKeys['N' + i] = 48 + i;
			this.vKeys['NK' + i] = 96 + i;
		}
		
		for (var i=65;i<=90;i++){
			this.vKeys[String.fromCharCode(i)] = i;
		}
		
		for (var i=1;i<=12;i++){
			this.vKeys['F' + i] = 111 + i;
		}
    },
    
    onKeyDown: function(eEvent){
        if (this.keys[eEvent.keyCode] == 2) return;
        
        this.keys[eEvent.keyCode] = 1;
    },
    
    onKeyUp: function(eEvent){
    	var keyCode = eEvent.keyCode;
        this.keys[keyCode] = 3;
        
        var thus = this;
        setTimeout(function(){ thus.keys[keyCode] = 0; }, 40);
    },
    
    isKeyDown: function(iKeyCode){
    	return (this.keys[iKeyCode] == 1);
    },
    
    isKeyPressed: function(iKeyCode){
    	if (this.keys[iKeyCode] == 1){
    		this.keys[iKeyCode] = 2;
    		return true;
    	}
    	
    	return false;
    },
    
    isKeyUp: function(iKeyCode){
    	if (this.keys[iKeyCode] == 3){
    		this.keys[iKeyCode] = 0;
    		return true;
    	}
    	
    	return false;
    }
};
},{"./kt_Utils":9}],7:[function(require,module,exports){
var KT = {};

window.empt = {};

KT.Canvas = require('./kt_Canvas');
KT.Input = require('./kt_Input');
KT.Sprite = require('./kt_Sprite');
KT.Utils = require('./kt_Utils');
KT.Vector2 = require('./kt_Vector2');

module.exports = KT;
},{"./kt_Canvas":5,"./kt_Input":6,"./kt_Sprite":8,"./kt_Utils":9,"./kt_Vector2":10}],8:[function(require,module,exports){
var Utils = require('./kt_Utils')
var Vector2 = require('./kt_Vector2')

module.exports = {
    loadSprite: function(sFilename, iSprWidth, iSprHeight, oParams){
        if (!oParams) oParams = window.empt;
        var img = new Image();
        
        img.src = sFilename;
        img.sprWidth = iSprWidth;
        img.sprHeight = iSprHeight;
        img.ready = false;
        
        img.origin = (oParams.origin)? oParams.origin : new Vector2(0, 0);
        
        Utils.addEvent(img, "load", function(){
           img.hNum = img.width / img.sprWidth; 
           img.vNum = img.height / img.sprHeight;
           img.ready = true;
        });
        
        return img;
    }
};
},{"./kt_Utils":9,"./kt_Vector2":10}],9:[function(require,module,exports){
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
    },
    
    getHttp: function(){
        if (window.XMLHttpRequest){
			return new XMLHttpRequest();
		}else if (window.ActiveXObject){
			return new window.ActiveXObject("Microsoft.XMLHTTP");
		}
		
		return null;
    },
    
    getJson: function(fileURL, callback){
		var http = this.getHttp();
		http.open('GET', fileURL, true);
		http.onreadystatechange = function() {
	  		if (http.readyState == 4) {
	  		    if (http.status == 200){
    				if (callback){
    				    var json = JSON.parse(http.responseText);
    					callback(null, json);
    				}
	  		    }else{
	  		        try{
	  		            var error = JSON.parse(http.responseText);
	  		            console.error(error.message);
	  		            if (callback) callback(error);
	  		        }catch (e){
	  		            console.error(e);
	  		            if (callback) callback(e);
	  		        }
	  		    }
			}
		};
		http.send();
    }
};
},{}],10:[function(require,module,exports){
function Vector2(x, y){
	this.__ktv2 = true;
	
	this.x = x;
	this.y = y;
};

module.exports = Vector2;

Vector2.prototype.length = function(){
	var length = Math.sqrt(this.x * this.x + this.y * this.y);
	
	return length;
};

Vector2.prototype.normalize = function(){
	var length = this.length();
	
	this.x /= length;
	this.y /= length;
	
	return this;
};

Vector2.prototype.dot = function(vector2){
	if (!vector2.__ktv2) throw "Can only perform a dot product with a vector2";
	
	return this.x * vector2.x + this.y * vector2.y;
};

Vector2.prototype.invert = function(){
	return this.multiply(-1);
};

Vector2.prototype.multiply = function(number){
	this.x *= number;
	this.y *= number;
	
	return this;
};

Vector2.prototype.sum = function(x, y){
	this.x += x;
	this.y += y;
	
	return this;
};

Vector2.prototype.add = function(vector2){
	if (!vector2.__ktv2) throw "Can only add a vector2 to this vector";
	
	this.x += vector2.x;
	this.y += vector2.y;
	
	return this;
};

Vector2.prototype.copy = function(vector2){
	if (!vector2.__ktv2) throw "Can only copy a vector2 to this vector";
	
	this.x = vector2.x;
	this.y = vector2.y;
	
	return this;
};

Vector2.prototype.set = function(x, y){
	this.x = x;
	this.y = y;
	
	return this;
};

Vector2.prototype.clone = function(){
	return new Vector2(this.x, this.y);
};

Vector2.prototype.equals = function(vector2){
	if (!vector2.__ktv2) throw "Can only copy a vector2 to this vector";
	
	return (this.x == vector2.x && this.y == vector2.y);
};

Vector2.vectorsDifference = function(vector2_a, vector2_b){
	if (!vector2_a.__ktv2) throw "Can only create this vector using 2 vectors2";
	if (!vector2_b.__ktv2) throw "Can only create this vector using 2 vectors2";
	
	return new Vector2(vector2_a.x - vector2_b.x, vector2_a.y - vector2_b.y);
};

Vector2.fromAngle = function(radian){
	var x = Math.cos(radian);
	var y = -Math.sin(radian);
	
	return new Vector2(x, y);
};
},{}]},{},[4]);
