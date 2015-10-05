var Player = require('./g_Player');
var KT = require('./kt_Kramtech');

function MapManager(oGame, sMapName){
    this.game = oGame;
    this.mapName = sMapName;
    
    this.player = null;
    this.map = null;
    
    this.ready = false;
    this.loadMap(sMapName);
}

module.exports = MapManager;

MapManager.prototype.loadMap = function(sMapName){
    var thus = this;
    
    KT.Utils.getJson('services/loadMap.php?mapName=' + this.mapName, function(error, map){
        if (error) throw "Fatal error during the execution of the app.";
        
        thus.map = new Array(64);
    
        for (var i=0;i<64;i++){
            thus.map[i] = new Uint8ClampedArray(map.mapData[i]);
        }
        
        thus.game.loadTileset(map.tileset);
        thus.player = new Player(thus, thus.game.sprites.player, new KT.Vector2(2, 2));
        
        thus.ready = true;
    });
};

MapManager.prototype.drawMap = function(){
    var ctx = this.game.ctx;
    var drawSprite = KT.Canvas.drawSprite;
    
    var walls = this.game.tileset[0].sprite;
    var floors = this.game.tileset[1].sprite;
    
    for (var y=0;y<64;y++){
        for (var x=0;x<64;x++){
            var t = this.map[y][x];
            if (t == 0) continue;
            
            if (t == 1){ drawSprite(ctx, walls, x * 32, y * 32, 0, 0); }else
            if (t == 33){ drawSprite(ctx, floors, x * 32, y * 32, 0, 0); }
        }
    }
};

MapManager.prototype.update = function(){
    var ctx = this.game.ctx;
    
    this.player.update();
    
    this.drawMap();
    this.player.draw(ctx);
};