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
            index: tile.index
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