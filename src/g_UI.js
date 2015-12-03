var KT = require('./kt_Kramtech.js');
var ItemFactory = require('./d_ItemFactory');

module.exports = {
    drag: {
        item: null,
        anchor: null,
        slot: 0,
        fullDrag: false
    },
    lastClick: 0,
    lastMousePosition: null,
    lastSlot: -1,
    
    _updatePlayerStats: true,
    
    init: function(){
        this.drag.anchor = KT.Vector2.allocate(0, 0);
        this.lastMousePosition = KT.Vector2.allocate(-1, 0);
    },
    
    updatePlayerStatsUI: function(oGame, oPlayer){
        var Canvas = KT.Canvas;
        var ctx = oGame.playerStatsSurface;
        
        Canvas.drawSpriteText(ctx, "Name: " + oPlayer.name, oGame.sprites.f_font, 0, 0);
        
        Canvas.drawSpriteText(ctx, "Level: " + oPlayer.level, oGame.sprites.f_font, 0, 20);
        Canvas.drawSpriteText(ctx, "Exp: " + oPlayer.exp, oGame.sprites.f_font, 0, 30);
        Canvas.drawSpriteText(ctx, "Next: " + oPlayer.next, oGame.sprites.f_font, 0, 40);
        
        Canvas.drawSpriteText(ctx, "Health: " + oPlayer.hp + ' / ' + oPlayer.mHp, oGame.sprites.f_font, 0, 60);
        Canvas.drawSpriteText(ctx, "Mana: " + oPlayer.mp + ' / ' + oPlayer.mMp, oGame.sprites.f_font, 0, 70);
        Canvas.drawSpriteText(ctx, "Food: " + oPlayer.hp + ' / ' + oPlayer.mHp, oGame.sprites.f_font, 0, 80);
        
        Canvas.drawSpriteText(ctx, "Strength: " + oPlayer.atk, oGame.sprites.f_font, 0, 100);
        Canvas.drawSpriteText(ctx, "Defense: " + oPlayer.dfs, oGame.sprites.f_font, 0, 110);
        Canvas.drawSpriteText(ctx, "Speed: " + oPlayer.spd, oGame.sprites.f_font, 0, 120);
        Canvas.drawSpriteText(ctx, "Luck: " + oPlayer.luk, oGame.sprites.f_font, 0, 130);
        Canvas.drawSpriteText(ctx, "Wisdom: " + oPlayer.wis, oGame.sprites.f_font, 0, 140);
        
        this._updatePlayerStats = false;
    },
    
    drawoPlayerStats: function(oGame, oPlayer){
        var Canvas = KT.Canvas;
        
        Canvas.drawSprite(oGame.ctx, oGame.sprites.ui_playerMini, 8, 425, 0, 0);
        
        Canvas.drawSpriteText(oGame.ctx, oPlayer.name, oGame.sprites.f_font, 20, 437);
        
        var hp = oPlayer.hp / oPlayer.mHp;
        oGame.ctx.fillStyle = 'rgb(60,0,0)';
        oGame.ctx.fillRect(20, 451, 100, 5);
        oGame.ctx.fillStyle = 'rgb(122,0,0)';
        oGame.ctx.fillRect(20, 451, 100 * hp, 5);
        
        if (oPlayer.mMp > 0){
            var mp = oPlayer.mp / oPlayer.mMp;
            oGame.ctx.fillStyle = 'rgb(45,80,100)';
            oGame.ctx.fillRect(20, 460, 80, 3);
            oGame.ctx.fillStyle = 'rgb(90,155,200)';
            oGame.ctx.fillRect(20, 460, 80 * mp, 3);
        }
        
        if (this._updatePlayerStats) this.updatePlayerStatsUI(oGame, oPlayer);
        
        Canvas.drawSprite(oGame.ctx, oGame.sprites.ui_playerStats, 8, 190, 0, 0);
        oGame.ctx.drawImage(oGame.playerStatsSurface.canvas, 170, 230);
    },
    
    drawInventory: function(oGame, oPlayer){
        var Canvas = KT.Canvas;
        Canvas.drawSprite(oGame.ctx, oGame.sprites.ui_inventory, 237, 432, 0, 0);
        
        var item;
        for (var i=0,len=oPlayer.items.length;i<len;i++){
            item = oPlayer.items[i];
            if (!item) continue;
            
            Canvas.drawSprite(oGame.ctx, oGame.sprites.items, 240 + (i * 38), 435, item.ref.imageIndex.x, item.ref.imageIndex.y);
            
            if (item.ref.stack && item.amount > 1){
                Canvas.drawSpriteText(oGame.ctx, item.amount + "", oGame.sprites.f_font, 243 + (i * 38), 438);
            }
        }
        
        if (this.drag.item){
            item = this.drag.item;
            var pos = KT.Input.mouse.position;
            
            Canvas.drawSprite(oGame.ctx, oGame.sprites.items, pos.x - this.drag.anchor.x + 3, pos.y - this.drag.anchor.y + 3, item.ref.imageIndex.x, item.ref.imageIndex.y);
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
        if (this.drag.item) return;
        var pos = KT.Input.mouse.position;
        
        var slot = ((pos.x - 237) / 38) << 0;
        var item = oPlayer.items[slot];
        
        if (!item){ return; }
        
        var name = item.ref.name.toLowerCase();
        if (item.status !== -1){
            name = ItemFactory.getStatusName(item.status) + ' ' + name;
        }
        
        if (this.lastClick > 0){
            oPlayer.useItem(slot);
            KT.Input.mouse.status = 2;
            this.lastClick = 0;
            this.lastSlot = -1;
            this.lastMousePosition.set(-1, 0);
            return;
        }
        
        var msg = "A";
        if (name.startsOnVowel()){ msg += 'n'; }
        
        if (this.lastMousePosition.x == -1 && KT.Input.mouse.status == 1){
            oGame.console.addMessage(msg + ' ' + name);
            KT.Input.mouse.status = 2;
        }
        
        if (this.lastMousePosition.x != -1 && !this.lastMousePosition.equalsVector2(pos)){
            var fullDrag = true;
            if (item.ref.stack && item.amount > 1 && !KT.Input.isKeyDown(KT.Input.vKeys.SHIFT)){
                var oldItem = item;
                item = ItemFactory.allocate(oldItem.ref, 1, oldItem.status);
                
                oldItem.amount -= 1;
                fullDrag = false;
            }else{
                oPlayer.items[slot] = null;
            }
            
            this.drag.item = item;
            this.drag.anchor.set(pos.x - (slot * 38 + 237), pos.y - 432);
            this.drag.slot = slot;
            this.drag.fullDrag = fullDrag;
            
            this.lastMousePosition.set(-1, 0);
            this.lastSlot = -1;
            this.lastClick = 0;
        }else{
            this.lastMousePosition.set(pos.x, pos.y);
            if (this.lastSlot == -1) this.lastSlot = slot;
        }
    },
    
    releaseDrag: function(oGame, oPlayer){
        var pos = KT.Input.mouse.position;
        var slot = ((pos.x - 237) / 38) << 0;
        
        if (this.drag.fullDrag && oPlayer.items[slot] && oPlayer.items[slot].ref.code != this.drag.item.ref.code){
            oPlayer.items[this.drag.slot] = oPlayer.items[slot];
            oPlayer.items[slot] = this.drag.item;
            this.drag.item = null;
            return;
        }
        var preSlot = oPlayer.items[slot];
        var item = oPlayer.addItemToSlot(this.drag.item, slot);
        if (item){
            item = oPlayer.addItemToSlot(this.drag.item, this.drag.slot);
            if (item) throw "Da fuq";
        }else if (preSlot){
            ItemFactory.free(this.drag.item);
        }
        
        this.drag.item = null;
    },
    
    destroyItem: function(oGame, oPlayer){
        var name = this.drag.item.ref.name;
        if (!this.drag.fullDrag){
            oGame.console.addMessage(name + ' destroyed', 'yellow');
            this.drag.item.amount -= 1;
            this.drag.item = null;
            return;
        }
        
        if (this.drag.item.amount > 1){
            name += ' (x' + this.drag.item.amount +')';
        }
        
        oGame.console.addMessage(name + ' destroyed', 'yellow');
        
        ItemFactory.free(this.drag.item);
        oPlayer.items[this.drag.slot] = null;
        this.drag.item = null;
    },
    
    checkAction: function(oGame){
        if (this.lastClick > 0) this.lastClick -= 1;
        
        var Input = KT.Input;
        var player = oGame.party[0];
        var pos = Input.mouse.position;
        
        var onInventory = (pos.x >= 237 && pos.y >= 432 && pos.x < 617 && pos.y < 470);
        
        if (Input.mouse.status && onInventory){
            this.pickFromInventory(oGame, player);
        }
        
        if (Input.isMouseUp()){
            if (this.lastMousePosition.x != -1){
                this.lastMousePosition.set(-1, 0);
                this.lastSlot = -1;
                this.lastClick = 10;
            }
            
            if (this.drag.item != null){
                if (onInventory){
                    this.releaseDrag(oGame, player);
                }else{
                    //player.addItemToSlot(this.drag.item, this.drag.slot);
                    this.destroyItem(oGame, player);
                }
                
                this.drag.item = null;
            }
        }
    }
};