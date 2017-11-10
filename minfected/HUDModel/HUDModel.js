var HUDModel = window.HUDModel || {};

HUDModel.PrimaryHUD = (function(){
    return{
        BG: null,
        PrWpn: null,
        ScWpn: null,
        selectedItem: null,
        init: function(){
            this.selectedItem = player.selectedItem;
            this.BG = game.add.sprite(30,500, 'HUDbg');
            this.BG.fixedToCamera = true;
            this.BG.bringToTop();
            this.PrWpn = game.add.sprite(this.BG.position.x+(this.BG.width/2)-2, this.BG.position.y+(this.BG.width/2)-2, itemListNoChange[player.firstWpID].name);
            this.PrWpn.scale.setTo(0.9, 0.9);
            this.PrWpn.anchor.setTo(0.5, 0.5);
            this.PrWpn.fixedToCamera = true;

            this.ScWpn = game.add.sprite(this.BG.position.x+(this.BG.width/2)+55, this.BG.position.y+(this.BG.width/2)+55, itemListNoChange[player.secondWpID].name);
            this.ScWpn.scale.setTo(0.3, 0.3);
            this.ScWpn.anchor.setTo(0.5, 0.5);
            this.ScWpn.fixedToCamera = true;

        },
        bringHUDToTop: function(){
          this.BG.bringToTop();   //doesnt work
        },
        update: function(){
            //this.bringHUDToTop();
        },
        updateHUD: function(number){
            this.PrWpn.loadTexture(itemListNoChange[number].name, 0, false);
            this.ScWpn.loadTexture(itemListNoChange[(number+1)%itemListNoChange.length].name, 0, false);
        },
    }
})

HUDModel.SecondaryHUD = (function(){
    return{
        inventorySprite: null,
        inventoryList: [],
        selectSquare: null,
        tileSize: null,

        isDragging: false,
        isShowing: false,

        toggle: function(){
            if(!this.isDragging){
                  if(!this.isShowing){
                      this.show();
                      game.paused = true;
                  }else{
                      this.hide();
                      game.paused = false;
                  }
            }
        },

        show: function(){
            this.isShowing = true;
            if(this.inventorySprite != null){
                this.inventorySprite.revive();
                this.inventorySprite.position.x = game.camera.position.x + 60;
                this.inventorySprite.position.y = game.camera.position.y - 300;

            } else {
                this.inventorySprite = game.add.sprite(game.camera.position.x + 60 ,game.camera.position.y-300,'inventorySprite');
            }
//            this.inventorySprite.inputEnabled = true;
//            this.inventorySprite.input.enableDrag();
//            this.inventorySprite.onDragStart.add(updateIsDragging, this);
//            this.inventorySprite.onDragStop.add(updateInvDrag, this);

            //this.inventorySprite.scale.setTo(0.8);
            this.tileSize = 50;
            for(var i=0, j=0, count=0; count<player.inventory.length; i++, count++){

                if(i == 6){ j++; i=0; }
                this.inventoryList[count] = game.add.sprite(this.inventorySprite.position.x+42+(i*this.tileSize), this.inventorySprite.position.y+230+(j*this.tileSize), player.inventory[count].name);
                console.log(this.inventorySprite.position.x+42+(i*this.tileSize) + " " + this.inventorySprite.position.y+230+(j*this.tileSize));
                this.inventoryList[count].fixedToCamera = true;
                this.inventoryList[count].width = this.tileSize;
                this.inventoryList[count].height = this.tileSize;
                this.inventoryList[count].alive = true;
                this.inventoryList[count].exists= true;
                this.inventoryList[count].visible = true;
            }
        },

        hide: function(){
            this.inventorySprite.kill();
            for(var count=0; count<this.inventoryList.length; count++){
                this.inventoryList[count].destroy();
                this.inventoryList[count] = null;
            }
            this.isShowing = false;
        },
        updateInvDrag: function(){
            this.isDragging = false;
            for(var i=0, j=0, count=0; count<player.inventory.length; i++, count++){
                if((i+1)*this.tileSize >=this.tileSize*4){ j++; i=0; }
                this.inventoryList[count].position.x = this.inventorySprite.position.x+25+(i*this.tileSize);
                this.inventoryList[count].position.y = this.inventorySprite.position.y+253+(j*this.tileSize);
            }
        },
        updateIsDragging: function(){
            this.isDragging=true;
        }
    }
})
