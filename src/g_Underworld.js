var KT = require('./kt_Kramtech');
var MapManager = require('./g_MapManager');
var Console = require('./g_Console');
var PlayerStats = require('./d_PlayerStats');
var ItemFactory = require('./d_ItemFactory');
var EnemyFactory = require('./d_EnemyFactory');
var Player = require('./g_Player');
var Enemy = require('./g_Enemy');
var Item = require('./g_Item');
var UI = require('./g_UI');
var FloatText = require('./g_FloatText');
var Animation = require('./g_Animation');
var Event = require('./g_Event');

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
    this.party = [];
    
    this.fps = 1000 / 30;
    this.lastFrame = 0;
    
    this.loadImages();
}

Underworld.prototype.loadImages = function(){
    var centerOr = KT.Vector2.allocate(16, 16);
    var Sprite = KT.Sprite;
    
    var colors = [
        ['red',180,50,50],
        ['yellow',255,255,0],
        ['aqua',55,180,220],
    ];
    
    this.sprites.f_font = Sprite.loadFontSprite('img/fonts/sprFont.png', 10, 11, ' !,./0123456789:;?()ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', colors);
    
    this.sprites.dungeon = Sprite.loadSprite('img/tileset/sprDungeon.png', 32, 32);
    
    this.sprites.ui_map = Sprite.loadSprite('img/ui/sprMapUI.png');
    this.sprites.ui_inventory = Sprite.loadSprite('img/ui/sprInventory.png');
    
    this.sprites.player = Sprite.loadSprite('img/characters/sprPlayer.png', 32, 32, {origin: centerOr});
    this.sprites.bat = Sprite.loadSprite('img/characters/sprBat.png', 32, 32, {origin: centerOr});

    this.sprites.items = Sprite.loadSprite('img/items/sprItems.png', 32, 32);
    
    this.sprites.animations = Sprite.loadSprite('img/animations/sprAnimations.png', 32, 32);
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
    this.map = MapManager.allocate(this, 'testMap');
    
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
    preloadMemory();
    
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

function preloadMemory(){
    KT.Vector2.preAllocate(100);
    ItemFactory.preAllocate(20);
    EnemyFactory.preAllocate(10);
    MapManager.preAllocate(10);
    Player.preAllocate(1);
    Enemy.preAllocate(10);
    Item.preAllocate(20);
    FloatText.preAllocate(3);
    Animation.preAllocate(1);
    Event.preAllocate(5);
    
    UI.init();
}

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
