var KT = require('./Kramtech');

function Underworld(elDiv){
    this.canvas = KT.Canvas.createCanvas(640, 480, elDiv);
    this.ctx = KT.Canvas.get2DContext(this.canvas);
    
    KT.Input.listenTo(this.canvas);
}

KT.Utils.addEvent(window, 'load', function(){
    var game = new Underworld(KT.Utils.get("divGame"));
});