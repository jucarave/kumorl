var KT = require('./kt_Kramtech.js');
var ItemFactory = require('./d_ItemFactory');

module.exports = {
    drag: null,
    
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
            
            Canvas.drawSprite(oGame.ctx, oGame.sprites.items, 240 + (i * 38), 435, item.imageIndex.x, item.imageIndex.y);
            
            if (item.stack && item.amount > 1){
                Canvas.drawSpriteText(oGame.ctx, item.amount + "", oGame.sprites.f_font, 243 + (i * 38), 438);
            }
        }
        
        if (this.drag){
            item = this.drag.item;
            var pos = KT.Input.mouse.position;
            
            Canvas.drawSprite(oGame.ctx, oGame.sprites.items, pos.x - this.drag.anchor.x + 3, pos.y - this.drag.anchor.y + 3, item.imageIndex.x, item.imageIndex.y);
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
        var pos = KT.Input.mouse.position;
        
        var slot = ((pos.x - 237) / 38) << 0;
        var item = oPlayer.items[slot];
        
        if (!item){ return; }
        
        var name = item.name.toLowerCase();
        if (item.status !== undefined){
            name = ItemFactory.getStatusName(item.status) + ' ' + name;
        }
        
        var msg = "A";
        if (name.startsOnVowel()){ msg += 'n'; }
        
        oGame.console.addMessage(msg + ' ' + name);
        KT.Input.mouse.status = 2;
        
        if (item.stack && item.amount > 1){
            var oldItem = item;
            item = {};
            
            for (var i in oldItem){
                item[i] = oldItem[i];
            }
            
            item.amount = 1;
            oldItem.amount -= 1;
        }else{
            oPlayer.items[slot] = null;
        }
        
        this.drag = {
            item: item,
            anchor: new KT.Vector2(pos.x - (slot * 38 + 237), pos.y - 432),
            slot: slot
        };
    },
    
    releaseDrag: function(oGame, oPlayer){
        var pos = KT.Input.mouse.position;
        var slot = ((pos.x - 237) / 38) << 0;
        
        var item = oPlayer.addItemToSlot(this.drag.item, slot);
        if (item){
            item = oPlayer.addItemToSlot(this.drag.item, this.drag.slot);
            if (item) throw "Da fuq";
        }
        
        this.drag = null;
    },
    
    checkAction: function(oGame){
        var Input = KT.Input;
        var player = oGame.party[0];
        var pos = Input.mouse.position;
        
        var onInventory = (pos.x >= 237 && pos.y >= 432 && pos.x < 617 && pos.y < 470);
        
        if (!this.drag && Input.isMouseDown() && onInventory){
            this.pickFromInventory(oGame, player);
        }
        
        if (this.drag != null && Input.isMouseUp()){
            if (onInventory){
                this.releaseDrag(oGame, player);
            }else{
                player.items[this.drag.slot] = this.drag.item;
            }
            
            this.drag = null;
        }
    }
};