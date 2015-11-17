(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
    enemies: {
        bat: { name: 'Giant bat', code: 'bat', hp: 20, atk: '2D3', dfs: '1D4' }
    },
    
    getEnemy: function(code){
        var enemy = this.enemies[code];
        if (!enemy) throw "Invalid enemy code: " + code;
        
        var ret = {};
        
        for (var i in enemy){
            ret[i] = enemy[i];
        }
        
        return ret;
    }
};
},{}],2:[function(require,module,exports){
var Vector2 = require('./kt_Vector2.js');
var Effect = require('./g_Effect');
var ActorEffect = require('./e_ActorEffects');

module.exports = {
    items: {
        sword: {name: 'Sword', code: 'sword', imageIndex: new Vector2(1, 0), type: 'weapon' },
        
        potion: {name: 'Red potion', code: 'potion', imageIndex: new Vector2(2, 0), type: 'item', stack: true, onUse: new Effect(Effect.Actor, 'heal', 30) },
        
        torch: {name: 'Torch', code: 'torch', imageIndex: new Vector2(3, 0), imageNum: 3, type: 'misc', solid: true }
    },
    
    getItem: function(itemCode, amount, status){
        var item = this.items[itemCode];
        if (!item) throw "Invalid item code: " + itemCode;
        
        var ret = {
            ref: item
        };
        
        if (item.type != 'misc') ret.amount = Math.min(amount, 5);
        if (item.type == 'weapon') ret.status = status;
        
        return ret;
    },
    
    getStatusName: function(fStatus){
        if (fStatus >= 0.8){
            return 'excelent';
        }else if (fStatus >= 0.6){
            return 'serviceable';
        }else if (fStatus >= 0.4){
            return 'worn';
        }else if (fStatus >= 0.2){
            return 'badly worn';
        }else{
            return 'ruined';
        }
    },
    
    activateEffect: function(oGame, oItem, oTarget){
        var effect = this.items[oItem.ref.code].onUse;
        
        switch (effect.type){
            case Effect.Actor: ActorEffect.execute(oGame, effect, oTarget); break;
        }
    }
};
},{"./e_ActorEffects":4,"./g_Effect":8,"./kt_Vector2.js":21}],3:[function(require,module,exports){
var ItemFactory = require('./d_ItemFactory');

function PlayerStats(oGame){
    this.game = oGame;
    
    this.name = 'Kram';
    this.level = 1;
    this.exp = 0;
    this.hp = 8;
    this.mHp = 10;
    this.mp = 3;
    this.mMp = 5;
    
    this.atk = '2D3';
    this.dfs = '2D3';
    this.spd = '2D3';
    this.luk = '2D3';
    this.int = '2D3';
    
    this.items = new Array(10);
}

module.exports = PlayerStats;

PlayerStats.prototype.addItem = function(oItem){
    for (var i=0;i<10;i++){
        if (this.items[i]){
            var name = oItem.ref.name;
            oItem = this.addItemToSlot(oItem, i);
            if (!oItem){
                this.game.console.addMessage(name + " picked!");
                return true;
            }else{
                continue;
            }
        }
        
        this.items[i] = oItem;
        this.game.console.addMessage(oItem.ref.name + " picked!");
        
        return true;
    }
    
    return false;
};

PlayerStats.prototype.addItemToSlot = function(oItem, iSlot){
    if (!this.items[iSlot]){
        this.items[iSlot] = oItem;
        return null;
    }
    
    if (oItem.ref.stack && this.items[iSlot].ref.code == oItem.ref.code && this.items[iSlot].amount < 5){
        if (this.items[iSlot].amount + oItem.amount <= 5){
            this.items[iSlot].amount += oItem.amount;
            
            return null;
        }else{
            oItem.amount -= (5 - this.items[iSlot].amount);
            this.items[iSlot].amount = 5;
            
            return oItem;
        }
    }
    
    return oItem;
};

PlayerStats.prototype.useItem = function(iSlot){
    var item = this.items[iSlot];
    
    if (item.ref.onUse){
        ItemFactory.activateEffect(this.game, item, this);
    }
    
    if (item.ref.stack && item.amount){
        this.game.console.addMessage(item.ref.name + ' used');
        if (--item.amount == 0){ this.items[iSlot] = null; }
        
        return true;
    }
    
    return false;
};
},{"./d_ItemFactory":2}],4:[function(require,module,exports){
module.exports = {
    healCharacter: function(oGame, oTarget, iAmount){
        oTarget.hp = Math.min(oTarget.mHp, oTarget.hp + iAmount);
        oGame.console.addMessage('Recovered ' + iAmount + ' hp');
    },
    
    execute: function(oGame, sEffect, oTarget){
        if (sEffect.name == 'heal'){
            this.healCharacter(oGame, oTarget, sEffect.value);
        }
    }
};
},{}],5:[function(require,module,exports){
var KT = require('./kt_Kramtech');

function Actor(oMapManager, oSprite, oPosition){
    this.mapManager = oMapManager;
    this.game = oMapManager.game;
    this.sprite = oSprite;
    
    this.position = oPosition;
    this.position.z = 0;
    this.scale = new KT.Vector2(1, 1);
    
    this.target = new KT.Vector2(-1, 0);
    this.moving = false;
    
    this.imageIndex = 0;
    this.imageSpeed = 1 / 8;
    
    this.destroyed = false;
    this.solid = true;
    
    this.blink = -1;
    
    this.drawParams = {
        scale: this.scale
    };
}

module.exports = Actor;

Actor.prototype.moveTo = function(xTo, yTo){
    if (this.moving) return false;
    if (this.mapManager.isSolid(this.position.x + xTo, this.position.y + yTo)) return true;
    if (this.mapManager.isSolidCollision(this.position.x + xTo, this.position.y + yTo)) return true;
    if (this.mapManager.isPlayerCollision(this.position.x + xTo, this.position.y + yTo)) return true;
    
    if (xTo != 0) this.scale.x = xTo;
    
    this.target.set(this.position.x + xTo, this.position.y + yTo);
    this.moving = true;
    
    return true;
};

Actor.prototype.draw = function(oCtx, oView){
    if (this.destroyed) return;
    if (!this.mapManager.isVisible(this.position.x, this.position.y)) return;
    if (this.blink >= 10) return;
    if (this.blink >= 4 && this.blink < 7) return;
    
    var vx = this.position.x - oView.x;
    var vy = this.position.y - oView.y;
    
    if (vx + 1 < 0 || vy + 1 < 0) return;
    if (vx > oView.width || vy > oView.height) return;
    
    KT.Canvas.drawSprite(oCtx, this.sprite, vx * 32, (vy * 32) - this.position.z, this.imageIndex, 0, this.drawParams);
};

Actor.prototype.finishMovement = function(){
    this.moving = false;
    this.position.copy(this.target);
    this.position.z = 0;
    this.target.set(-1, 0);
    
    if (this.afterMovement) this.afterMovement();
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

Actor.prototype.destroy = function(){
    this.destroyed = true;
};

Actor.prototype.update = function(){
    if (!this.moving){
        this.imageIndex += this.imageSpeed;
        if (this.imageIndex >= this.sprite.hNum){
            this.imageIndex = 0;
        }
    }
    
    if (this.blink >= 0) this.blink -= 1;
    
    this.updateMovement();
};
},{"./kt_Kramtech":18}],6:[function(require,module,exports){
var KT = require('./kt_Kramtech');

function Animation(oMapManager, oSprite, oPosition, fOnAnimationEnd){
    this.mapManager = oMapManager;
    this.sprite = oSprite;
    this.position = oPosition;
    
    this.onAnimationEnd = fOnAnimationEnd;
    
    this.imageIndex = 0;
    this.imageSpeed = 1 / 2;
    
    this.destroyed = false;
}

module.exports = Animation;

Animation.prototype.draw = function(oCtx, view){
    if (this.destroyed) return;
    
    var vx = this.position.x - view.x;
    var vy = this.position.y - view.y;
    
    if (vx + 1 < 0 || vy + 1 < 0) return;
    if (vx > view.width || vy > view.height) return;
    
    KT.Canvas.drawSprite(oCtx, this.sprite, vx * 32, (vy * 32), this.imageIndex, 0);
};

Animation.prototype.update = function(){
    if (!this.moving){
        this.imageIndex += this.imageSpeed;
        if (this.imageIndex >= this.sprite.hNum){
            if (this.onAnimationEnd)
                this.onAnimationEnd();
            this.destroyed = true;
        }
    }
};
},{"./kt_Kramtech":18}],7:[function(require,module,exports){
var KT = require('./kt_Kramtech');

function Console(oGame, oFont, iWidth, iHeight, iMaxMessages){
    this.game = oGame;
    this.messages = [];
    this.font = oFont;
    this.maxMessages = iMaxMessages;
    
    this.canvas = document.createElement("canvas");
    this.canvas.width = iWidth;
    this.canvas.height = iHeight;
    
    this.ctx = this.canvas.getContext("2d");
    this.ctx.width = iWidth;
    this.ctx.height = iHeight;
}

module.exports = Console;

Console.prototype.addMessage = function(sText){
    this.messages.push(sText);
    
    if (this.messages.length > this.maxMessages){
        this.messages.splice(0, 1);
    }
    
    this.preRender();
};

Console.prototype.addToLast = function(sText){
    this.messages[this.messages.length - 1] += sText;
    this.preRender();
};

Console.prototype.preRender = function(){
    var Canvas = KT.Canvas;
    Canvas.clearCanvas(this.ctx);
    
    for (var i=0,len=this.messages.length;i<len;i++){
        var m = this.messages[i];
        
        Canvas.drawSpriteText(this.ctx, m, this.font, 0, i * this.font.height);
    }
};

Console.prototype.render = function(oCtx, x, y){
    oCtx.drawImage(this.canvas, x, y);
};
},{"./kt_Kramtech":18}],8:[function(require,module,exports){
function Effect(iType, sName, sValue){
    this.type = iType;
    this.name = sName;
    this.value = sValue;
}

module.exports = Effect;

Effect.Actor = 1;
},{}],9:[function(require,module,exports){
var Actor = require('./g_Actor');
var KT = require('./kt_Kramtech');

function Enemy(oMapManager, oSprite, oPosition, enemyStats){
    Actor.call(this, oMapManager, oSprite, oPosition);
    
    this._enemy = true;
    this.enemyStats = enemyStats;
}

Enemy.prototype = Object.create(Actor.prototype);

module.exports = Enemy;

Enemy.prototype.receiveDamage = function(iDmg){
    var dfs = this.game.rollDice(this.enemyStats.dfs);
    var dmg = iDmg - dfs;
    
    if (dmg <= 0){
        this.mapManager.createFloatText('Blocked', this.position.clone());
        this.game.console.addToLast(", Blocked");
        return;
    }
    
    this.game.console.addToLast(', ' + dmg + ' damage points received');
    this.mapManager.createFloatText(dmg + '', this.position.clone());
    this.enemyStats.hp -= dmg;
    this.blink = 12;
    
    if (this.enemyStats.hp <= 0){
        this.enemyStats.hp = 0;
    }
};

Enemy.prototype.randomMovement = function(){
    if (this.destroyed) return;
    
    var m = Math;
    var xTo = 0, yTo = 0;
    
    xTo = m.floor(m.random() * 3) - 1;
    if (xTo == 0){ yTo = m.floor(m.random() * 3) - 1; }
    
    if (xTo != 0 || yTo != 0){
        this.moveTo(xTo, yTo);
    }
};

Enemy.prototype.update = function(){
    if (this.destroyed) return;
    if (!this.mapManager.playerAction || this.mapManager.attack){
        Actor.prototype.update.call(this);
        return;
    }
    
    if (this.enemyStats.hp <= 0){
        this.game.console.addMessage(this.enemyStats.name + " died");
        this.destroy();
        return;
    }
    
    this.randomMovement();
    
    Actor.prototype.update.call(this);
};
},{"./g_Actor":5,"./kt_Kramtech":18}],10:[function(require,module,exports){
var KT = require('./kt_Kramtech');

function FloatText(oMapManager, oPosition, sText, oFont, iLifetime, bFloatUp){
    this.mapManager = oMapManager;
    this.position = oPosition;
    this.text = sText;
    this.lifetime = iLifetime;
    this.floatUp = bFloatUp;
    this.font = oFont;
    
    this.fixPosition();
    
    this.destroyed = false;
}

module.exports = FloatText;

FloatText.prototype.fixPosition = function(){
    this.position.x += 0.5;
    
    var width = KT.Sprite.getTextSpriteWidth(this.font, this.text);
    this.position.x -= (width / 2) / 32;
};

FloatText.prototype.draw = function(oCtx, oView){
    var vx = this.position.x - oView.x;
    var vy = this.position.y - oView.y;
    
    if (vx + 1 < 0 || vy + 1 < 0) return;
    if (vx > oView.width || vy > oView.height) return;
    
    KT.Canvas.drawSpriteText(oCtx, this.text, this.font, vx * 32, vy * 32);
};

FloatText.prototype.update = function(){
    if (--this.lifetime <= 0){ 
        this.destroyed = true;
        return; 
    }
    
    if (this.floatUp){
        this.position.y -= 0.05;
    }
};


},{"./kt_Kramtech":18}],11:[function(require,module,exports){
var KT = require('./kt_Kramtech');

function Item(oMapManager, oPosition, oItem, aParams){
    this.mapManager = oMapManager;
    this.sprite = oMapManager.game.sprites.items;
    this.position = oPosition;
    this.item = oItem;
    
    this.destroyed = false;
    this._item = true;
    this.solid = this.item.ref.solid;
    
    this.imageIndex = 0;
    this.imageSpeed = 1 / 4;
    
    this.parseParams(aParams);
}

module.exports = Item;

Item.prototype.parseParams = function(aParams){
    if (!aParams) return;
    
    for (var i=0,len=aParams.length;i<len;i++){
        var par = aParams[i];
        
        if (par.type == 'light'){
            var lightPos = this.position.clone();
            if (par.dir == 'D') lightPos.sum(0, 1);
            else if (par.dir == 'R') lightPos.sum(1, 0);
            else if (par.dir == 'U') lightPos.sum(0, -1);
            else if (par.dir == 'L') lightPos.sum(-1, 0);
            
            this.mapManager.castLight(lightPos, 7);
            this.mapManager.lights.push(lightPos);
        }
    }
};

Item.prototype.draw = function(oCtx, oView){
    if (this.destroyed) return;
    if (!this.mapManager.isVisible(this.position.x, this.position.y)) return;
    
    var vx = this.position.x - oView.x;
    var vy = this.position.y - oView.y;
    
    if (vx + 1 < 0 || vy + 1 < 0) return;
    if (vx > oView.width || vy > oView.height) return;
    
    KT.Canvas.drawSprite(oCtx, this.sprite, vx * 32, (vy * 32), this.item.ref.imageIndex.x + this.imageIndex, this.item.ref.imageIndex.y);
};

Item.prototype.update = function(){
    if (this.item.ref.imageNum){
        this.imageIndex += this.imageSpeed;
        if (this.imageIndex >= this.item.ref.imageNum){
            this.imageIndex = 0;
        }
    }
};
},{"./kt_Kramtech":18}],12:[function(require,module,exports){
var KT = require('./kt_Kramtech');
var Player = require('./g_Player');
var Enemy = require('./g_Enemy');
var EnemyFactory = require('./d_EnemyFactory');
var Item = require('./g_Item');
var ItemFactory = require('./d_ItemFactory');
var FloatText = require('./g_FloatText');

function MapManager(oGame, sMapName){
    this.game = oGame;
    this.mapName = sMapName;
    
    this.player = null;
    this.map = null;
    this.visible = null;
    this.cleared = false;
    
    this.instances = [];
    this.instancesFront = [];
    this.lights = [];
    this.attack = null;
    
    this.playerAction = false;
    
    this.tilesLoc = [];
    this.view = new KT.Vector2(0, 0);
    this.view.width = 27;
    this.view.height = 15;
    
    this.prevView = new KT.Vector2(-1, 0);
    
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

MapManager.prototype.isTilesetReady = function(){
    if (this.ready == 2) return true;
    
    for (var i=0,len=this.game.tileset.length;i<len;i++){
        var t = this.game.tileset[i];
        if (!t.sprite.ready) return false;
    }
    
    this.ready = 2;
    return true;
};

MapManager.prototype.loadMap = function(sMapName){
    var thus = this;
    
    KT.Utils.getJson('services/loadMap.php?mapName=' + this.mapName, function(error, map){
        if (error) throw "Fatal error during the execution of the app.";
        
        thus.instances = [];
        thus.map = new Array(64);
        thus.visible = new Array(64);
    
        for (var i=0;i<64;i++){
            thus.map[i] = new Uint8ClampedArray(map.mapData[i]);
            thus.visible[i] = new Uint8ClampedArray(64);
        }
        
        thus.game.loadTileset(map.tileset);
        thus.parseTilesLocation(map.tileset);
        
        for (var i=0,len=map.items.length;i<len;i++){
            var item = map.items[i];
            thus.instances.push(new Item(thus, new KT.Vector2(item.x, item.y), ItemFactory.getItem(item.item, item.amount, item.status), item.params));
        }
        
        thus.player = new Player(thus, thus.game.sprites.player, new KT.Vector2(3, 3), thus.game.party[0]);
        
        var e = new Enemy(thus, thus.game.sprites.bat, new KT.Vector2(9, 4), EnemyFactory.getEnemy('bat'));
        thus.instances.push(e);
        
        thus.ready = true;
        
        thus.castLight(thus.player.position, 5);
    });
};

MapManager.prototype.isVisible = function(x, y){
    var t = this.visible[y << 0][x << 0];
    if (t < 2)
        return false;
    
    return true;
};

MapManager.prototype.isSolid = function(x, y){
    var t = this.map[y << 0][x << 0];
    if (t == 0) return true;
    
    var loc = this.tilesLoc[t];
    return this.game.tileset[loc.sprIndex].solid;
};

MapManager.prototype.isSolidCollision = function(x, y){
    for (var i=0,len=this.instances.length;i<len;i++){
        if (!this.instances[i].solid) continue;
        var e = this.instances[i].position;
        
        if (e.x >= x + 1) continue;
        if (e.x + 1 <= x) continue;
        if (e.y >= y + 1) continue;
        if (e.y + 1 <= y) continue;
        
        return true;
    }
    
    return false;
};

MapManager.prototype.isPlayerCollision = function(x, y){
    var p = this.player.position;
    
    if (p.x >= x + 1) return false;
    if (p.x + 1 <= x) return false;
    if (p.y >= y + 1) return false;
    if (p.y + 1 <= y) return false;
    
    return true;
};

MapManager.prototype.getInstanceAt = function(x, y){
    for (var i=this.instances.length-1;i>=0;i--){
        var ep = this.instances[i];
        
        if (!ep.destroyed && ep.position.equals(x, y)){
            return ep;
        }
    }
    
    return null;
};

MapManager.prototype.createFloatText = function(sText, oPosition){
    var fText = new FloatText(this, oPosition, sText, this.game.sprites.f_font, 30, true);
    this.instancesFront.push(fText);
};

MapManager.prototype.createAttack = function(oAnimation, target){
    this.instances.push(oAnimation);
    this.attack = oAnimation;
    this.attack.target = target;
};

MapManager.prototype.inView = function(oPosition){
    var vx = oPosition.x - this.view.x;
    var vy = oPosition.y - this.view.y;
    
    if (vx + 1 < 0 || vy + 1 < 0) return false;
    if (vx > this.view.width || vy > this.view.height) return false;
    
    return true;
};

MapManager.prototype.clearVisibleMap = function(){
    for (var y=0;y<64;y++){
        for (var x=0;x<64;x++){
            if (this.visible[y][x] >= 2){
                this.visible[y][x] = 1;
            }
        }
    }
    
    var m = Math;
    var thus = this;
    var raycast = function(rx, ry, ang, lx, ly){
        var dx = m.abs(rx - lx);
        var dy = m.abs(ry - ly);
        
        if (dx >= thus.view.width / 2 + 2 || dy >= thus.view.height / 2 + 2)
            return false;
        
        var cos = m.cos(ang);
        var sin = m.sin(ang);
        
        var search = true;
        while (search){
            var cx = rx << 0;
            var cy = ry << 0;
                
            if (thus.isSolid(cx, cy)){
                return false;
            }else if (lx == cx && ly == cy){
                return true;
            }
                
            rx += cos;
            ry -= sin;
        }  
    };
    
    var rx = this.player.position.x + 0.5;
    var ry = this.player.position.y + 0.5;
    for (var i=0,len=this.lights.length;i<len;i++){
        var light = this.lights[i];
        if (!this.inView(light)) continue;
        
        var ang = KT.Utils.get2DAngle(rx, ry, light.x + 0.5, light.y + 0.5);
        
        if (raycast(rx, ry, ang, light.x, light.y)){
            this.castLight(light, 7);
        }
    }
    
    this.cleared = true;
};

MapManager.prototype.castLight = function(oPosition, iDistance){
    var dis = iDistance * 2;
    
    var x1 = oPosition.x - dis + 0.5;
    var y1 = oPosition.y - dis + 0.5;
    var x2 = oPosition.x + dis + 0.5;
    var y2 = oPosition.y + dis + 0.5;
    
    var Utils = KT.Utils;
    var m = Math;
    
    var thus = this;
    var raycast = function(rx, ry, ang){
        var cos = m.cos(ang);
        var sin = m.sin(ang);
        
        for (var j=0;j<iDistance;j++){
            var cx = rx << 0;
            var cy = ry << 0;
                
            var dim = m.max(j - 1, 0);
            
            if (thus.visible[cy][cx] >= 2){
                thus.visible[cy][cx] = m.min(thus.visible[cy][cx], 2 + dim);
            }else{
                thus.visible[cy][cx] = 2 + dim;
            }
            
            if (thus.isSolid(cx, cy)){
                j = iDistance;
                continue;
            }
                
            rx += cos;
            ry -= sin;
        }  
    };
    
    var hy = y1;
    var ang, rx, ry;
    
    for (var k=0;k<2;k++){
        for (var i=x1;i<=x2;i++){
            ang = Utils.get2DAngle(oPosition.x + 0.5, oPosition.y + 0.5, i, hy);
            rx = oPosition.x + 0.5;
            ry = oPosition.y + 0.5;

            raycast(rx, ry, ang);
        }
        
        hy = y2;
    }
    
    var hx = x1;
    for (var k=0;k<2;k++){
        for (var i=y1;i<=y2;i++){
            ang = Utils.get2DAngle(oPosition.x + 0.5, oPosition.y + 0.5, hx, i);
            rx = oPosition.x + 0.5;
            ry = oPosition.y + 0.5;
            
            raycast(rx, ry, ang);
        }
        
        hx = x2;
    }
};

MapManager.prototype.drawAutoMap = function(x, y){
    var ctx;
    
    if (this.view.equalsVector2(this.prevView) ){
        ctx = this.game.ctx;
        ctx.drawImage(this.game.autoMapSurface.canvas, x, y);
        
        return;
    }
    
    ctx = this.game.autoMapSurface;
    KT.Canvas.drawSprite(ctx, this.game.sprites.ui_map, 0, 0, 0, 0);
    
    ctx.fillStyle = "rgb(51,47,32)";
    for (var yy=0;yy<64;yy++){
        for (var xx=0;xx<64;xx++){
            if (this.isSolid(xx, yy) && this.visible[yy][xx] > 0){
                ctx.fillRect(xx*2,yy*2,2,2);
            }
        }
    }
    
    ctx.fillStyle = "red";
    ctx.fillRect(this.player.position.x * 2, this.player.position.y * 2, 2, 2);
    
    ctx = this.game.ctx;
    ctx.drawImage(this.game.autoMapSurface.canvas, x, y);
};

MapManager.prototype.drawMap = function(){
    var ctx;
    var m = Math;
    
    this.view.x =  (this.player.position.x - (this.view.width / 2));
    this.view.y = (this.player.position.y - (this.view.height / 2));
    
    if (this.view.equalsVector2(this.prevView) && !this.playerAction && !this.cleared){
        ctx = this.game.ctx;
        ctx.drawImage(this.game.mapSurface.canvas, 0, 0);
        
        return;
    }
    
    ctx = this.game.mapSurface;
    KT.Canvas.clearCanvas(ctx, 'black');
    var drawSprite = KT.Canvas.drawSprite;
    
    var xx = m.floor(this.view.x);
    var yy = m.floor(this.view.y);
    
    var ww = xx + this.view.width;
    var hh = yy + this.view.height;
    ww = m.max(0, m.min(64, ww));
    hh = m.max(0, m.min(64, hh));
    
    for (var y=m.max(yy, 0);y<hh;y++){
        if (!this.map[y]) continue;
        for (var x=m.max(xx, 0);x<ww;x++){
            var t = this.map[y][x];
            if (t == 0 || t == undefined) continue;
            
            var v = this.visible[y][x];
            if (v == 0) continue;
            
            var cx = (x - this.view.x) * 32; 
            var cy = (y - this.view.y) * 32;
            
            var loc = this.tilesLoc[t];
            var sprite = this.game.tileset[loc.sprIndex].sprite;
            drawSprite(ctx, sprite, cx, cy, loc.x, loc.y);
            
            if (v == 1){
                ctx.fillStyle = "rgba(4,4,15,0.7)";
                ctx.fillRect(cx << 0,cy << 0,32,32);
            }else if (v > 2){
                var a = (v - 1) / 15;
                ctx.fillStyle = "rgba(0,0,0," + a + ")";
                ctx.fillRect(cx << 0,cy << 0,32,32);
            }
        }
    }
    
    ctx = this.game.ctx;
    ctx.drawImage(this.game.mapSurface.canvas, 0, 0);
    
    this.cleared = false;
};

MapManager.prototype.update = function(){
    if (!this.isTilesetReady()) return;
    
    var ctx = this.game.ctx;
    
    this.prevView.copy(this.view);
    
    this.player.update();
    
    this.drawMap();
    
    var ins;
    for (var i=0,len=this.instances.length;i<len;i++){
        ins = this.instances[i];
        if (ins.destroyed){
            this.instances.splice(i, 1);
            len = this.instances.length;
            i--;
            continue;
        }
        
        this.instances[i].update();
        this.instances[i].draw(ctx, this.view);
    }
    
    this.player.draw(ctx, this.view);
    
    for (i=0,len=this.instancesFront.length;i<len;i++){
        ins = this.instancesFront[i];
        if (ins.destroyed){
            this.instancesFront.splice(i, 1);
            len = this.instancesFront.length;
            i--;
            continue;
        }
        
        this.instancesFront[i].update();
        this.instancesFront[i].draw(ctx, this.view);
    }
    
    if (this.attack && this.attack.destroyed && this.attack.target.blink == -1){
        this.attack = null;
    }else if (!this.attack && this.playerAction){
        this.playerAction = false;
    }
    
    
};
},{"./d_EnemyFactory":1,"./d_ItemFactory":2,"./g_Enemy":9,"./g_FloatText":10,"./g_Item":11,"./g_Player":13,"./kt_Kramtech":18}],13:[function(require,module,exports){
var Actor = require('./g_Actor');
var Animation = require('./g_Animation');
var KT = require('./kt_Kramtech');
var ItemFactory = require('./d_ItemFactory');

function Player(oMapManager, oSprite, oPosition, oPartyMember){
    Actor.call(this, oMapManager, oSprite, oPosition);
    
    this._player = true;
    this.partyMember = oPartyMember;
}

Player.prototype = Object.create(Actor.prototype);

module.exports = Player;

Player.prototype.doAct = function(){
    this.mapManager.playerAction = true;
    
    var position = this.position;
    if (this.target.x != -1) position = this.target;
    
    this.mapManager.clearVisibleMap();
    this.mapManager.castLight(position, 5);
};

Player.prototype.afterMovement = function(){
    var position = this.position;
    if (this.target.x != -1) position = this.target;
    
    this.mapManager.clearVisibleMap();
    this.mapManager.castLight(position, 5);
};

Player.prototype.checkMovement = function(){
    var Input = KT.Input;
    
    var xTo = 0, yTo = 0;
    if (Input.isKeyDown(Input.vKeys.W)){ yTo = -1; }else
    if (Input.isKeyDown(Input.vKeys.S)){ yTo =  1; }else
    if (Input.isKeyDown(Input.vKeys.A)){ xTo = -1; }else
    if (Input.isKeyDown(Input.vKeys.D)){ xTo =  1; }
    
    if (xTo != 0 || yTo != 0){
        if (this.moveTo(xTo, yTo))
            this.doAct();
    }
};

Player.prototype.attackTo = function(oEnemy){
    var m = Math;
    var dx = m.abs(oEnemy.position.x - this.position.x);
    var dy = m.abs(oEnemy.position.y - this.position.y);
    
    if (dx > 1 || dy > 1){
        this.game.console.addMessage("Out of range");
        return;
    }
    
    this.game.console.addMessage("Attacking " + oEnemy.enemyStats.name);
    
    var thus = this;
    this.mapManager.createAttack(new Animation(this.mapManager, this.game.sprites.at_slice, oEnemy.position.clone(), function(){
        var dmg = thus.game.rollDice(thus.partyMember.atk);
        oEnemy.receiveDamage(dmg);
    }), oEnemy );
};

Player.prototype.pickItem = function(oItem){
    if (oItem.item.ref._static) return;
    
    var m = Math;
    var dx = m.abs(oItem.position.x - this.position.x);
    var dy = m.abs(oItem.position.y - this.position.y);
    
    if (dx > 0 || dy > 0){
        var name = oItem.item.ref.name.toLowerCase();
        if (oItem.item.status !== undefined){
            name = ItemFactory.getStatusName(oItem.item.status) + ' ' + name;
        }
        
        var msg = "You see a";
        if (name.startsOnVowel()){ msg += 'n'; }
        
        this.game.console.addMessage(msg + ' ' + name);
        return;
    }
    
    if (this.partyMember.addItem(oItem.item)){
        oItem.item = null;
        oItem.destroyed = true;
    }
};

Player.prototype.checkAction = function(){
    var Input = KT.Input;
    
    if (Input.isMouseDown()){
        var mp = Input.mouse.position;
        
        var m = Math;
        var mx = m.floor(mp.x / 32 + this.mapManager.view.x);
        var my = m.floor(mp.y / 32 + this.mapManager.view.y);
        
        var instance = this.mapManager.getInstanceAt(mx, my);
        if (instance){
            if (instance._enemy) this.attackTo(instance);
            if (instance._item) this.pickItem(instance);
        }
        
        Input.mouse.status = 2;
        this.doAct();
    }
};

Player.prototype.checkInput = function(){
    var Input = KT.Input;
    
    if (Input.isKeyDown(Input.vKeys.SPACE)){ return this.doAct(); }
    
    this.checkMovement();
    this.checkAction();
};

Player.prototype.update = function(){
    if (!this.mapManager.playerAction && !this.mapManager.attack){
        this.checkInput();
    }
    
    Actor.prototype.update.call(this);
};
},{"./d_ItemFactory":2,"./g_Actor":5,"./g_Animation":6,"./kt_Kramtech":18}],14:[function(require,module,exports){
var KT = require('./kt_Kramtech.js');
var ItemFactory = require('./d_ItemFactory');

module.exports = {
    drag: null,
    lastClick: 0,
    lastMousePosition: null,
    lastSlot: -1,
    
    drawoPlayerStats: function(oGame, oPlayer){
        var Canvas = KT.Canvas;
        
        Canvas.drawSpriteText(oGame.ctx, oPlayer.name, oGame.sprites.f_font, 16, 440);
        
        var hp = oPlayer.hp / oPlayer.mHp;
        oGame.ctx.fillStyle = 'rgb(60,0,0)';
        oGame.ctx.fillRect(16, 454, 100, 5);
        oGame.ctx.fillStyle = 'rgb(122,0,0)';
        oGame.ctx.fillRect(16, 454, 100 * hp, 5);
        
        if (oPlayer.mMp > 0){
            var mp = oPlayer.mp / oPlayer.mMp;
            oGame.ctx.fillStyle = 'rgb(45,80,100)';
            oGame.ctx.fillRect(16, 462, 80, 3);
            oGame.ctx.fillStyle = 'rgb(90,155,200)';
            oGame.ctx.fillRect(16, 462, 80 * mp, 3);
        }
    },
    
    drawInventory: function(oGame, oPlayer){
        var Canvas = KT.Canvas;
        Canvas.drawSprite(oGame.ctx, oGame.sprites.ui_inventory, 237, 432, 0, 0);
        
        var item;
        for (var i=0,len=oPlayer.items.length;i<len;i++){
            item = oPlayer.items[i];
            if (!item) continue;
            
            Canvas.drawSprite(oGame.ctx, oGame.sprites.items, 240 + (i * 38), 435, item.ref.imageIndex.x, item.ref.imageIndex.y);
            
            if (item.ref.stack && item.amount > 1){
                Canvas.drawSpriteText(oGame.ctx, item.amount + "", oGame.sprites.f_font, 243 + (i * 38), 438);
            }
        }
        
        if (this.drag){
            item = this.drag.item;
            var pos = KT.Input.mouse.position;
            
            Canvas.drawSprite(oGame.ctx, oGame.sprites.items, pos.x - this.drag.anchor.x + 3, pos.y - this.drag.anchor.y + 3, item.ref.imageIndex.x, item.ref.imageIndex.y);
        }
    },
    
    drawUI: function(oGame){
        oGame.console.render(oGame.ctx, 16, 16);
    
        oGame.map.drawAutoMap(712, 338);
        var player = oGame.party[0];
        
        this.drawoPlayerStats(oGame, player);
        this.drawInventory(oGame, player);
    },
    
    pickFromInventory: function(oGame, oPlayer){
        if (this.drag) return;
        var pos = KT.Input.mouse.position;
        
        var slot = ((pos.x - 237) / 38) << 0;
        var item = oPlayer.items[slot];
        
        if (!item){ return; }
        
        var name = item.ref.name.toLowerCase();
        if (item.status !== undefined){
            name = ItemFactory.getStatusName(item.status) + ' ' + name;
        }
        
        if (this.lastClick > 0){
            oPlayer.useItem(slot);
            KT.Input.mouse.status = 2;
            this.lastClick = 0;
            this.lastSlot = -1;
            this.lastMousePosition = null;
            return;
        }
        
        var msg = "A";
        if (name.startsOnVowel()){ msg += 'n'; }
        
        if (this.lastMousePosition == null && KT.Input.mouse.status == 1){
            oGame.console.addMessage(msg + ' ' + name);
            KT.Input.mouse.status = 2;
        }
        
        if (this.lastMousePosition != null && !this.lastMousePosition.equalsVector2(pos)){
            var fullDrag = true;
            if (item.ref.stack && item.amount > 1 && !KT.Input.isKeyDown(KT.Input.vKeys.SHIFT)){
                var oldItem = item;
                item = {};
                
                for (var i in oldItem){
                    item[i] = oldItem[i];
                }
                
                item.amount = 1;
                oldItem.amount -= 1;
                fullDrag = false;
            }else{
                oPlayer.items[slot] = null;
            }
            
            this.drag = {
                item: item,
                anchor: new KT.Vector2(pos.x - (slot * 38 + 237), pos.y - 432),
                slot: slot,
                fullDrag: fullDrag
            };
            
            this.lastMousePosition = null;
            this.lastSlot = -1;
            this.lastClick = 0;
        }else{
            this.lastMousePosition = pos.clone();
            if (this.lastSlot == -1) this.lastSlot = slot;
        }
    },
    
    releaseDrag: function(oGame, oPlayer){
        var pos = KT.Input.mouse.position;
        var slot = ((pos.x - 237) / 38) << 0;
        
        if (this.drag.fullDrag && oPlayer.items[slot] && oPlayer.items[slot].ref.code != this.drag.item.ref.code){
            oPlayer.items[this.drag.slot] = oPlayer.items[slot];
            oPlayer.items[slot] = this.drag.item;
            this.drag = null;
            return;
        }
        
        var item = oPlayer.addItemToSlot(this.drag.item, slot);
        if (item){
            item = oPlayer.addItemToSlot(this.drag.item, this.drag.slot);
            if (item) throw "Da fuq";
        }
        
        this.drag = null;
    },
    
    checkAction: function(oGame){
        if (this.lastClick > 0) this.lastClick -= 1;
        
        var Input = KT.Input;
        var player = oGame.party[0];
        var pos = Input.mouse.position;
        
        var onInventory = (pos.x >= 237 && pos.y >= 432 && pos.x < 617 && pos.y < 470);
        
        if (Input.mouse.status && onInventory){
            this.pickFromInventory(oGame, player);
        }
        
        if (Input.isMouseUp()){
            if (this.lastMousePosition != null){
                this.lastMousePosition = null;
                this.lastSlot = -1;
                this.lastClick = 10;
            }
            
            if (this.drag != null){
                if (onInventory){
                    this.releaseDrag(oGame, player);
                }else{
                    player.addItemToSlot(this.drag.item, this.drag.slot);
                }
                
                this.drag = null;
            }
        }
    }
};
},{"./d_ItemFactory":2,"./kt_Kramtech.js":18}],15:[function(require,module,exports){
var KT = require('./kt_Kramtech');
var MapManager = require('./g_MapManager');
var Console = require('./g_Console');
var PlayerStats = require('./d_PlayerStats');
var UI = require('./g_UI');

function Underworld(elDiv){
    var width = 854;
    var height = 480;
    
    this.canvas = KT.Canvas.createCanvas(width, height, elDiv);
    this.ctx = KT.Canvas.get2DContext(this.canvas);
    
    this.mapSurface = this.createSurface(width, height);
    this.autoMapSurface = this.createSurface(134, 134);
    
    KT.Input.listenTo(this.canvas);
    
    this.maps = [];
    this.map = null;
    this.sprites = {};
    this.tileset = [];
    this.party = [];
    
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
    var centerOr = new KT.Vector2(16, 16);
    
    this.sprites.f_font = KT.Sprite.loadFontSprite('img/fonts/sprFont.png', 10, 11, ' !,./0123456789:;?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');
    
    this.sprites.ui_map = KT.Sprite.loadSprite('img/ui/sprMapUI.png');
    this.sprites.ui_inventory = KT.Sprite.loadSprite('img/ui/sprInventory.png');
    
    this.sprites.player = KT.Sprite.loadSprite('img/characters/sprPlayer.png', 32, 32, {origin: centerOr});
    this.sprites.bat = KT.Sprite.loadSprite('img/characters/sprBat.png', 32, 32, {origin: centerOr});
    
    this.sprites.items = KT.Sprite.loadSprite('img/items/sprItems.png', 32, 32);
    
    this.sprites.at_slice = KT.Sprite.loadSprite('img/attacks/sprASlice.png', 32, 32);
};

Underworld.prototype.createSurface = function(iWidth, iHeight){
    var canvas = KT.Canvas.createCanvas(iWidth, iHeight, null);
    var ctx = KT.Canvas.get2DContext(canvas);
    
    return ctx;
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
    
    this.party.push(new PlayerStats(this));
    this.party[0].name = 'Kram';
    
    this.console = new Console(this, this.sprites.f_font, this.canvas.width, 100, 5);
    this.console.addMessage("Wellcome to the new Underworld project");
    this.console.addMessage("Use the WASD keys to move and space to skip the turn");
    this.console.addMessage("Click on the enemies to attack!");
    
    this.loopGame();
};

Underworld.prototype.rollDice = function(sDice){
    var D = sDice.indexOf('D');
    var a = parseInt(sDice.substring(0, D), 10);
    var b = parseInt(sDice.substring(D + 1), 10);
    
    var result = 0;
    
    var m = Math;
    for (var i=0;i<a;i++){
        result += m.ceil(m.random() * b);
    }
    
    return result;
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
    
    UI.checkAction(this);
    this.map.update();
    
    UI.drawUI(this);
};

KT.Utils.addEvent(window, 'load', function(){
    var game = new Underworld(KT.Utils.get("divGame"));
    
    var wait = function(){
        if (game.checkReadyData()){
            game.newGame();
        }else{
           setTimeout(wait, 1000 / 30);
        }
    };
    
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

String.vowels = ['a', 'e', 'i', 'o', 'u'];
String.prototype.startsOnVowel = function(){
    var fl = this[0];
    
    return (String.vowels.indexOf(fl) != -1);
};

},{"./d_PlayerStats":3,"./g_Console":7,"./g_MapManager":12,"./g_UI":14,"./kt_Kramtech":18}],16:[function(require,module,exports){
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
        
        x = x << 0;
        y = y << 0;
        
        iHSubImg = iHSubImg << 0;
        iVSubImg = iVSubImg << 0;
        
        var iw = oSprite.sprWidth;
        var ih = oSprite.sprHeight;
        
        var ox = oSprite.origin.x;
        var oy = oSprite.origin.y;
        
        oCtx.save();
        
        oCtx.translate(x + ox, y + oy);
        if (params.scale){ 
            oCtx.scale(params.scale.x, params.scale.y);
        }else{
            oCtx.scale(1, 1);
        }
        
        var ofy = 0;
        if (oSprite.offsetY) ofy = oSprite.offsetY;
        
        oCtx.drawImage(oSprite, 
                iHSubImg * iw, iVSubImg * ih + ofy, iw, ih - ofy,
                -ox, -oy, iw, ih - ofy);
                
        oCtx.restore();
    },
    
    drawSpriteText: function(oCtx, sText, oFont, x, y){
        if (!oFont.ready) return;
        
        var xx = x;
        
        for (var i=0,len=sText.length;i<len;i++){
            var chara = sText[i];
            var ind = oFont.charactersList.indexOf(chara);
            
            if (ind == -1) ind = 0;
            
            this.drawSprite(oCtx, oFont, xx, y, ind, 0);
            xx += oFont.charasWidth[ind] + 1;
        }
    }
};
},{}],17:[function(require,module,exports){
var Utils = require('./kt_Utils');
var Vector2 = require('./kt_Vector2');

module.exports = {
    keys: new Uint8ClampedArray(255),
    mouse: {
        position: new Vector2(-1, -1),
        status: 0
    },
    
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
        
        Utils.addEvent(document, 'keydown', function(oEvent){ thus.onKeyDown(oEvent); } );
        Utils.addEvent(document, 'keyup', function(oEvent){ thus.onKeyUp(oEvent); } );
        
        Utils.addEvent(document, 'mousedown', function(oEvent){ thus.onMouseDown(oEvent, elCanvas); } );
        Utils.addEvent(document, 'mouseup', function(oEvent){ thus.onMouseUp(oEvent, elCanvas); } );
        Utils.addEvent(document, 'mousemove', function(oEvent){ thus.onMouseMove(oEvent, elCanvas); } );
        
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
    
    onMouseDown: function(oEvent, elCanvas){
        if (this.mouse.status == 2) return;
        
        this.mouse.status = 1;
        this.onMouseMove(oEvent, elCanvas);
    },
    
    onMouseUp: function(oEvent, elCanvas){
        this.mouse.status = 3;
        this.onMouseMove(oEvent, elCanvas);
        
        var thus = this;
        setTimeout(function(){ thus.mouse.status = 0; }, 40);
    },
    
    onMouseMove: function(oEvent, elCanvas){
        var xx = oEvent.clientX - elCanvas.offsetLeft;
        var yy = oEvent.clientY - elCanvas.offsetTop;
        
        var m = Math;
        xx = m.min(elCanvas.width, m.max(xx, 0));
        yy = m.min(elCanvas.height, m.max(yy, 0));
        
        this.mouse.position.set(xx, yy);
    },
    
    onKeyDown: function(oEvent){
        if (this.keys[oEvent.keyCode] == 2) return;
        
        this.keys[oEvent.keyCode] = 1;
    },
    
    onKeyUp: function(oEvent){
    	var keyCode = oEvent.keyCode;
        this.keys[keyCode] = 3;
        
        var thus = this;
        setTimeout(function(){ thus.keys[keyCode] = 0; }, 40);
    },
    
    isMouseDown: function(){
        return (this.mouse.status == 1);
    },
    
    isMousePressed: function(){
        if (this.mouse.status == 1){
            this.mouse.status = 2;
            return true;
        }
        
        return false;
    },
    
    isMouseUp: function(){
        if (this.mouse.status == 3){
            this.mouse.status = 0;
            return true;
        }
        
        return false;
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
},{"./kt_Utils":20,"./kt_Vector2":21}],18:[function(require,module,exports){
var KT = {};

window.empt = {};

KT.Canvas = require('./kt_Canvas');
KT.Input = require('./kt_Input');
KT.Sprite = require('./kt_Sprite');
KT.Utils = require('./kt_Utils');
KT.Vector2 = require('./kt_Vector2');

module.exports = KT;
},{"./kt_Canvas":16,"./kt_Input":17,"./kt_Sprite":19,"./kt_Utils":20,"./kt_Vector2":21}],19:[function(require,module,exports){
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
            if (!img.sprWidth) img.sprWidth = img.width;
            if (!img.sprHeight) img.sprHeight = img.height;
            
           img.hNum = img.width / img.sprWidth; 
           img.vNum = img.height / img.sprHeight;
           img.ready = true;
           
           if (oParams.callback){
               oParams.callback(img);
           }
        });
        
        return img;
    },
    
    parseFont: function(oImg){
        var canvas = document.createElement("canvas");
        canvas.width = oImg.width;
        canvas.height = oImg.height;
        
        var ctx = canvas.getContext("2d");
        
        ctx.drawImage(oImg, 0, 0);
        
        var imgData = ctx.getImageData(0, 0, oImg.width, oImg.height);
        var data = imgData.data;
        
        oImg.charasWidth = [];
        
        var width = 0;
        for (var i=0,len=oImg.width*4;i<len;i+=4){
            var r = data[i];
            var g = data[i + 1];
            var b = data[i + 2];
            
            if (r == 255 && g == 0 && b == 255){
                width += 1;
            }else if (width > 0){
                oImg.charasWidth.push(width);
                width = 0;
            }
        }
    },
    
    loadFontSprite: function(sFilename, iSprWidth, iSprHeight, sCharactersList){
        var thus = this;
        var sprite = this.loadSprite(sFilename, iSprWidth, iSprHeight, {callback: function(oImg){ thus.parseFont(oImg); }});
        sprite.charactersList = sCharactersList;
        sprite.offsetY = 1;
        
        return sprite;
    },
    
    getTextSpriteWidth: function(oFont, sText){
        var width = 0;
        for (var i=0,len=sText.length;i<len;i++){
            var chara = sText[i];
            var ind = oFont.charactersList.indexOf(chara);
            
            if (ind == -1) ind = 0;
            
            width += oFont.charasWidth[ind] + 1;
        }
        
        return width - 1;
    }
};
},{"./kt_Utils":20,"./kt_Vector2":21}],20:[function(require,module,exports){
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
    },
    
    get2DAngle: function(x1, y1, x2, y2){
		var xx = (x2 - x1);
		var yy = (y1 - y2);
		
		var PI2 = Math.PI * 2;
		var ang = (Math.atan2(yy, xx) + PI2) % PI2;
		
		return ang;
	}
};
},{}],21:[function(require,module,exports){
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

Vector2.prototype.equals = function(x, y){
	return (this.x == x && this.y == y);
};

Vector2.prototype.equalsVector2 = function(vector2){
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
},{}]},{},[15]);
