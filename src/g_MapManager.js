var Player = require('./g_Player');
var KT = require('./kt_Kramtech');

function MapManager(oGame, sMapName){
    this.game = oGame;
    this.mapName = sMapName;
    
    this.player = null;
    this.map = null;
    
    this.loadMap(sMapName);
}

module.exports = MapManager;

MapManager.prototype.loadMap = function(sMapName){
    this.map = new Array(64);
    
    for (var i=0;i<64;i++){
        this.map[i] = new Uint8ClampedArray(64);
    }
    
    this.player = new Player(this, this.game.sprites.player, new KT.Vector2(0, 0));
};

MapManager.prototype.update = function(){
    var ctx = this.game.ctx;
    
    this.player.update();
    this.player.draw(ctx);
};