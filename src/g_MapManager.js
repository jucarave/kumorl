var KT = require('./kt_Kramtech');
var Player = require('./g_Player');
var Enemy = require('./g_Enemy');
var EnemyFactory = require('./d_EnemyFactory');
var Item = require('./g_Item');
var ItemFactory = require('./d_ItemFactory');
var FloatText = require('./g_FloatText');
var Animation = require('./g_Animation');
var TileFactory = require('./d_TileFactory');
var Event = require('./g_Event');
var AnimationFactory = require('./d_Animation');
var Enum = require('./d_Enum');
var MapTurn = Enum.MAP;
var EventType = Enum.EVENT;

function MapManager(oGame, sMapName){
    this.view = KT.Vector2.allocate(0, 0);
    this.view.width = 27;
    this.view.height = 15;
    
    this.prevView = KT.Vector2.allocate(-1, 0);
    
    this.initMap(oGame, sMapName);
}

module.exports = MapManager;

MapManager.memLoc = [];
MapManager.preAllocate = function(iAmount){
    MapManager.memLoc = [];
    
    for (var i=0;i<iAmount;i++){
        MapManager.memLoc.push(new MapManager(null, ''));
    }
};

MapManager.allocate = function(oGame, sMapName){
    if (MapManager.memLoc.length == 0) throw "Out of MapManager instances.";
    
    var map = MapManager.memLoc.pop();
    map.initMap(oGame, sMapName);
    
    return map;
};

MapManager.free = function(oMapManager){
    MapManager.memLoc.push(oMapManager);
};

MapManager.prototype.initMap = function(oGame, sMapName){
    this.game = oGame;
    this.mapName = sMapName;
    
    this.player = null;
    this.map = null;
    this.visible = null;
    this.cleared = false;
    
    this.tileset = null;
    this.tiledef = null;
    
    this.instances = [];
    this.instancesFront = [];
    this.eventStack = [];
    this.lights = [];
    
    this.view.set(0, 0);
    this.prevView.set(-1, 0);

    this.prevTurn = -1;
    this.turn = MapTurn.PLAYER_TURN;
    this.turnCount = 0;
    
    this.ready = false;
    if (sMapName) this.loadMap(sMapName);
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
        
        thus.tileset = thus.game.sprites[map.tileset];
        thus.tiledef = TileFactory.tiles[map.tileset];
        
        for (var i=0,len=map.items.length;i<len;i++){
            var item = map.items[i];
            thus.instances.push(Item.allocate(thus, item.x, item.y, ItemFactory.getItem(item.item, item.amount, item.status), item.params));
        }
        
        thus.player = Player.allocate(thus, thus.game.sprites.player, 3, 3, thus.game.party[0]);
        
        var e = Enemy.allocate(thus, thus.game.sprites.bat, 9, 4, EnemyFactory.getEnemy('bat'));
        thus.instances.push(e);
        
        e = Enemy.allocate(thus, thus.game.sprites.bat, 9, 2, EnemyFactory.getEnemy('bat'));
        thus.instances.push(e);
        
        thus.ready = true;
        
        thus.castLight(thus.player.position, 5);
    });
};

MapManager.prototype.isVisible = function(x, y){
    var t = this.visible[y << 0][x << 0];
    return (t >= 2);
};

MapManager.prototype.getTile = function(x, y){
    var t = this.map[y << 0][x << 0];
    if (t == 0) return null;
    
    return this.tiledef[t];
};

MapManager.prototype.instanceCollision = function(oEntity){
    for (var i=0,len=this.instances.length;i<len;i++){
        var ins = this.instances[i];
        
        if (ins.solid && ins != oEntity && ins.collision.collidesWithBox(oEntity.collision))
            return true;
    }
    
    if (this.player != oEntity && this.player.collision.collidesWithBox(oEntity.collision)){
        oEntity.collision.update(oEntity.position.x, oEntity.position.y);
        return true;
    }
    
    return false;
};

MapManager.prototype.isSolid = function(oEntity, xTo, yTo){
    var tile = this.getTile(xTo, yTo);
    if (tile && tile.solid) return true;
    
    oEntity.collision.update(xTo, yTo);
    if (this.instanceCollision(oEntity)){
        oEntity.collision.update(oEntity.position.x, oEntity.position.y);
        return true;
    }
    
    return false;
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

MapManager.prototype.endTurn = function(){
    switch (this.turn){
        case MapTurn.PLAYER_TURN:
            this.turn = MapTurn.WORLD_TURN;
            break;
        
        case MapTurn.WORLD_TURN:
            if (++this.turnCount >= this.instances.length + this.instancesFront.length){
                this.turn = MapTurn.PLAYER_TURN;
                this.turnCount = 0;
            }
            break;
        
        case MapTurn.EVENT_TURN:
            var event = this.eventStack.splice(0, 1);
            this.destroyInstance(event[0]);
            if (this.eventStack.length == 0){
                this.turn = this.prevTurn;
            }
            break;
    }
};

MapManager.prototype.destroyInstance = function(instance){
    if (instance._item){ Item.free(instance); }else
    if (instance._floattext){ FloatText.free(instance); }else
    if (instance._animation){ Animation.free(instance); }else
    if (instance._enemy){ Enemy.free(instance); }else
    if (instance._event){ Event.free(instance); }
    else{ console.log(instance); throw "Da phuq"; } 
};

MapManager.prototype.createFloatText = function(sText, x, y, oColor){
    var fText = FloatText.allocate(this, x, y, sText, this.game.sprites.f_font, 30, true, oColor);
    this.instancesFront.push(fText);
};

MapManager.prototype.createAttack = function(oTarget, iDmg, sAttack){
    var spr = this.game.sprites.animations;
    var imgInd = AnimationFactory[sAttack];
    var animation = Animation.allocate(this.mapManager, spr, oTarget.position.x, oTarget.position.y, imgInd);
    
    var events = [];
    events.push(Event.allocate(this, EventType.PLAY_ANIMATION, animation));
    events.push(Event.allocate(this, EventType.CAST_DAMAGE, oTarget, [iDmg]));
    
    this.setEvents(events);
};

MapManager.prototype.setEvents = function(events){
    for (var i=0,len=events.length;i<len;i++){
        this.eventStack.push(events[i]);
    }
    
    this.prevTurn = this.turn;
    this.turn = MapTurn.EVENT_TURN;
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
                
            var tile = thus.getTile(cx, cy);
            if (tile && tile.solid){
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
            
            var tile = thus.getTile(cx, cy);
            if (tile && tile.solid){
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
            var tile = this.getTile(xx, yy);
            if (tile && tile.solid && this.visible[yy][xx] > 0){
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
    
    if (this.view.equalsVector2(this.prevView) && !this.cleared){
        ctx = this.game.ctx;
        ctx.drawImage(this.game.mapSurface.canvas, 0, 0);
        
        return;
    }
    
    ctx = this.game.mapSurface;
    KT.Canvas.clearCanvas(ctx, 'black');
    var drawSprite = KT.Canvas.drawSprite;
    
    var xx = m.floor(this.view.x);
    var yy = m.floor(this.view.y);
    
    var ww = xx + this.view.width + 1;
    var hh = yy + this.view.height + 1;
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
            
            var tile = this.tiledef[t];
            var sprite = this.tileset;
            drawSprite(ctx, sprite, cx, cy, tile.x, tile.y);
            
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

MapManager.prototype.updateInstances = function(oInstancesList){
    var ins;
    var ctx = this.game.ctx;
    
    for (var i=0,len=oInstancesList.length;i<len;i++){
        ins = oInstancesList[i];
        if (ins.destroyed){
            this.destroyInstance(oInstancesList.splice(i, 1)[0]);
            len = oInstancesList.length;
            i--;
            continue;
        }
        
        oInstancesList[i].update();
        oInstancesList[i].draw(ctx, this.view);
    }
};

MapManager.prototype.updateEvents = function(){
    if (this.eventStack.length > 0){
        this.eventStack[0].update(this.game.ctx, this.view);
        
        if (this.eventStack[0].destroyed){
            this.endTurn();
        }
    }
};

MapManager.prototype.update = function(){
    if (!this.ready) return;
    var ctx = this.game.ctx;
    
    this.prevView.copy(this.view);
    this.player.update();
    this.drawMap();
    this.updateInstances(this.instances);
    this.player.draw(ctx, this.view);
    this.updateInstances(this.instancesFront);
    this.updateEvents();
};