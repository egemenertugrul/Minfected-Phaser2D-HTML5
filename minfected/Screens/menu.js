var logo;
var startLabel;
var menubg;
var names;
var bulletshow;

var player = null;

var menuState = {
    create: function(){
        
        if(zombies.length){
            this.killZombies();
        }
        
        console.log(zombies);
        menubg = game.add.sprite(0,0, 'menubg');

        if(player!=null){
          bulletshow = game.add.text(620, 80, "Bullet Count: " + player.bulletcount +  "\nHealth: "+ player.health + "\nCollected Loot: "+ (25-lootcount) + "\nLAST SCORE: " + (player.bulletcount*2 + player.health*20 + (25-lootcount)*100), {font: '25px Arial', fill: '#ffffff'});
        }

        lones = game.add.audio('ost');
        lones.volume = 5;
        logo = game.add.sprite(80, 80, 'logo');
        logo.alpha = 0;
        names = game.add.text(80, 380, 'Programmed by:\nEgemen Ertugrul\nMasum Celil Olgun\n\nMusic by:\nBogac Cetiner', {font: '25px Arial', fill: '#ffffff'});
        names.alpha = 0;
        startLabel = game.add.text(80, 280, 'press the "SPACEBAR" to start', {font: '25px Arial', fill: '#ffffff'});
        startLabel.alpha = 0;
        lones.play();


        var wkey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        wkey.onDown.addOnce(this.start,this);

    },
    update:function(){
        if(logo.alpha < 0.9){
            logo.alpha += 0.001;
        }
        if(logo.alpha > 0.7 && names.alpha < 0.9) {
            names.alpha += 0.001;
        }
        if(names.alpha >0.7 && startLabel.alpha < 0.9){
            startLabel.alpha += 0.001;
        }
    },

    start: function(){
        lones.stop();
        game.state.start('play');
    },
    
    killZombies: function(){
      zombies.forEach(function(item){
          item.sfx.loop = false;  
          item.sfx.forceRestart = false;  
          item.sfx.stop();
            item.die();
      })         
          
    },

}
