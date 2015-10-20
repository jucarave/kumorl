var Player = require('./g_Player');
var Enemy = require('./g_Enemy');
var EnemyFactory = require('./d_EnemyFactory');
var KT = require('./kt_Kramtech');

function MapManager(oGame, sMapName){
    this.game = oGame;
    this.mapName = sMapName;
    
    this.player = null;
    this.map = null;
    this.visible = null;
    
    this.instances = [];
    this.attack = null;
    
    this.playerAction = false;
    
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
        
        thus.instances = [];
        thus.map = new Array(64);
        thus.visible = new Array(64);
    
        for (var i=0;i<64;i++){
            thus.map[i] = new Uint8ClampedArray(map.mapData[i]);
            thus.visible[i] = new Uint8ClampedArray(64);
        }
        
        thus.game.loadTileset(map.tileset);
        thus.parseTilesLocation(map.tileset);
        
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
    for (var i=0,len=this.instances.length;i<len;i++){
        var ep = this.instances[i];
        
        if (ep.position.equals(x, y)){
            return ep;
        }
    }
    
    return null;
};

MapManager.prototype.createAttack = function(oAnimation, target){
    this.instances.push(oAnimation);
    this.attack = oAnimation;
    this.attack.target = target;
};

MapManager.prototype.clearVisibleMap = function(){
    for (var y=0;y<64;y++){
        for (var x=0;x<64;x++){
            if (this.visible[y][x] >= 2){
                this.visible[y][x] = 1;
            }
        }
    }
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
            thus.visible[cy][cx] = 2 + dim;
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
            
            var v = this.visible[y][x];
            if (v == 0) continue;
            
            var cx = (x - this.view.x) * 32; 
            var cy = (y - this.view.y) * 32;
            
            var loc = this.tilesLoc[t];
            var sprite = this.game.tileset[loc.sprIndex].sprite;
            drawSprite(ctx, sprite, cx, cy, loc.x, loc.y);
            
            if (v == 1){
                ctx.fillStyle = "rgba(0,0,0,0.5)";
                ctx.fillRect(cx,cy,32,32);
            }else if (v > 2){
                var a = (v - 1) / 10;
                ctx.fillStyle = "rgba(0,0,0," + a + ")";
                ctx.fillRect(cx,cy,32,32);
            }
        }
    }
};

MapManager.prototype.update = function(){
    var ctx = this.game.ctx;
    
    this.player.update();
    
    this.drawMap();
    this.player.draw(ctx, this.view);
    
    for (var i=0,len=this.instances.length;i<len;i++){
        var ins = this.instances[i];
        if (ins.destroyed){
            this.instances.splice(i, 1);
            len = this.instances.length;
            i--;
            continue;
        }
        
        this.instances[i].update();
        this.instances[i].draw(ctx, this.view);
    }
    
    if (this.attack && this.attack.destroyed && this.attack.target.blink == -1){
        this.attack = null;
    }else if (!this.attack && this.playerAction){
        this.playerAction = false;
    }
};