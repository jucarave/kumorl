var KT = require('./Kramtech');

function Underworld(div){
    this.canvas = KT.Canvas.createCanvas(640, 480, div);
    this.ctx = KT.Canvas.get2DContext(this.canvas);
    
    
}

KT.Utils.addEvent(window, 'load', function(){
    var game = new Underworld(KT.Utils.get("divGame"));
});