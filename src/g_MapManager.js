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
        
        thus.player = new Player(thus, thus.game.sprites.player, new KT.Vector2(0, 0));
        
        thus.ready = true;
    });
};

MapManager.prototype.update = function(){
    var ctx = this.game.ctx;
    
    this.player.update();
    this.player.draw(ctx);
};