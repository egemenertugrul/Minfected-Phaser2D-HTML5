var debugMode = false;
    var tempText; // for crittext

    var isDeadScreen=false;
    var deadScreenDuration=0;
    var map; //global variable for our map
    var tileset; //gv for our tileset
    var layer; //gv for ground layer
    var collisionLayer; //gv for collision layer

    var itemListNoChange = [{name: "handgun"},{name: "flashlight"}];

    var deadScreen;

    var gameText=""; //gv for health, fatigue etc.

    var players = [];
    var zombies = [];
    var maskLayers = [];
    var circ;

    var wallsBitmap;
    var darkBG;

    var shakeWorld = 0;

    var gunSound;

    var lootSound;

    var lootcount = 0;
    var zombiecount= 0;

    var playerSpawnPoint = {x: 1055, y: 52};

var playState = {

    create: function(){

        isDeadScreen = false;
        deadScreenDuration=0;

        lastofus_dead = game.add.audio('lastofus_dead');
        lootSound = game.add.audio('equip');
        lootSound.allowMultiple = true;

        ost2 = game.add.audio('ost2');
        ost2.loop = true;
        ost2.play();

        fx = game.add.audio('gunfx');
        fx.allowMultiple = true;
        fx.addMarker('magnumshot', 0.3, 2.0);
        game.physics.startSystem(Phaser.Physics.P2JS); //adding P2 into our game

        map = game.add.tilemap('tilemap'); //attaching tilemap (with json) to gv map
        map.addTilesetImage('groundtiles', 'tiles'); //attaching tileset (with png) to gv map

        wallsBitmap = game.make.bitmapData(map.widthInPixels,map.heightInPixels);
        wallsBitmap.draw("walls");
        wallsBitmap.update();

        game.add.sprite(0,0,wallsBitmap);
        darkBG = game.add.sprite(0,0, 'darkBG');

        layer = map.createLayer('ground');
        collisionLayer = map.createLayer('collision');

        map.setCollision(4, true, 'collision');
        map.setCollision(3, true, 'collision');//setting collision on 4'th tile of the tileset where layer is 'collision' on the gv map
        game.physics.p2.convertTilemap(map, collisionLayer); //converting tilemap where collides=true (4th tile) of the layer var collisionLayer on the gv map

        loots = game.add.group();

        deadZombie = game.add.group();

        if(zombiecount!=0){
          while(zombies.length){
            zombies[0].die();
          }
        }

        if(lootcount!=0){
          lootcount=0;
        }

        if(zombiecount!=0){
          zombiecount=0;
        }

        console.log(loots.length);


        while(lootcount<25){
            generateLoot();
        }
        //map.createFromObjects('loots', 5, 'loot', 0, true, false, loots);

        layer.resizeWorld(); //resizing world with respect to layer(ground layer)

        maskLayers = [deadZombie, loots, layer, collisionLayer];
        clearState();

        maskGraphics = this.game.add.graphics(0, 0);
            maskLayers.forEach(function(entry) {
              entry.mask = maskGraphics;
            });

        gameText = game.add.text(0,0, "",{font:"normal 18px arial",fill: "#ffffff"})
        gameText.fixedToCamera = true;

        player = new GameObjects.Player();
        player.init(playerSpawnPoint);
        players.push(player);

        if(debugMode){
            createObject();
        } else {
            while(zombiecount < 50){
                createObject();
            }
        }
        tempText = game.add.text(0,0, "",{font:"normal 10px arial",fill: "#b60000"});
        tempText.alpha =0;

    },

    update: function(){

      if(player.health<=0 && !isDeadScreen){
          player.die();
      }
      if(isDeadScreen&&(game.time.now- deadScreenDuration > 2000)){
          game.state.start('menu', false, true);
          ost2.stop();
      }

      if(lootcount == 0 && player.sprite.position.y < 60){
          game.state.start('menu', false, true);
          ost2.stop();
      }
      if(!isDeadScreen){
          player.update();
        } else {
            deadScreen.position = game.camera.position;
        }

      zombieAI();
      //console.log(player.sprite.body.data);
      if(!debugMode)
          maskFunction();
      if(tempText.alpha >0){
          tempText.alpha -= 0.01;
      }

    },

    render: function() {

        game.debug.geom(player);

    },

}

function showLootText(pos, ammo, health){
            tempText.position.x = pos.x;
            tempText.position.y = pos.y;

            if(ammo && health){
                tempText.setText("+6 Ammo, +10 Health");
            } else if(ammo){
                tempText.setText("+6 Ammo!");
            } else if(health){
                tempText.setText("+10 Health");
            }

            tempText.fontSize = "18px";
            tempText.alpha = 1;
}

function clearState(){
  maskLayers[0].forEach(function(item){
    console.log(item);
    item.kill();
  })

}

function maskFunction(){

    if(player.selectedItem[1]){
        var lightAngle = Math.PI/4;
        var rayLength = 200;
        var numberOfRays = rayLength / 4 *(lightAngle);
        var mouseAngle = player.sprite.rotation - Math.PI;
         maskGraphics.clear();
		maskGraphics.lineStyle(2, 0xffffff, 1);
    maskGraphics.beginFill();
    			maskGraphics.moveTo(player.getPosition().x - (Math.cos(mouseAngle)*30),player.getPosition().y - (Math.sin(mouseAngle)*30));
		for(var i = 0; i<numberOfRays; i++){
			var rayAngle = mouseAngle-(lightAngle/2)+(lightAngle/numberOfRays)*i
			var lastX = player.getPosition().x;
			var lastY = player.getPosition().y;
			for(var j= 1; j<=rayLength;j+=1){
          		var landingX = Math.round(player.getPosition().x-(2*j)*Math.cos(rayAngle));
          		var landingY = Math.round(player.getPosition().y-(2*j)*Math.sin(rayAngle));
          		if(wallsBitmap.getPixel32(landingX,landingY)==0){
					        lastX = landingX;
					        lastY = landingY;
				      }else{

        					maskGraphics.lineTo(lastX,lastY);
        					break;
        			}
			}

			   maskGraphics.lineTo(lastX,lastY);

        maskGraphics.endFill();
        var randomFlicker = Math.random()*0.1;
        maskLayers.forEach(function(entry) {
            entry.alpha = 0.7+randomFlicker;
        });

		}
    } else if(player.showMuzzle){
        var lightAngle = Math.PI;
        var rayLength = 400;
        var numberOfRays = rayLength / 10;
          var mouseAngle = player.sprite.rotation - Math.PI;
            var calculatedAngle = (player.sprite.angle*Math.PI / 180.0);
        var calculatedAngle2 = (1.1218992);
         maskGraphics.clear();
		maskGraphics.lineStyle(2, 0xffffff, 1);
    maskGraphics.beginFill();
    maskGraphics.moveTo(player.getPosition().x-(Math.sin(calculatedAngle - calculatedAngle2)*30), player.getPosition().y+(Math.cos(calculatedAngle - calculatedAngle2)*30));
		for(var i = 0; i<numberOfRays; i++){
			var rayAngle = mouseAngle-(lightAngle/2)+(lightAngle/numberOfRays)*i
			var lastX = player.getPosition().x;
			var lastY = player.getPosition().y;
			for(var j= 1; j<=rayLength;j+=1){
          		var landingX = Math.round(player.getPosition().x-(Math.sin(calculatedAngle - calculatedAngle2)*30)-(2*j)*Math.cos(rayAngle));
          		var landingY = Math.round(player.getPosition().y+(Math.cos(calculatedAngle - calculatedAngle2)*30)-(2*j)*Math.sin(rayAngle));
          		if(wallsBitmap.getPixel32(landingX,landingY)==0){
					        lastX = landingX;
					        lastY = landingY;
				      }else{

        					maskGraphics.lineTo(lastX,lastY);
        					break;
        			}
			}

			   maskGraphics.lineTo(lastX,lastY);

        maskGraphics.endFill();

        maskLayers.forEach(function(entry) {
            entry.alpha = 1;
        });

		}
    } else {
        maskGraphics.clear();
    maskGraphics.lineStyle(2, 0xffffff, 1);
    maskGraphics.moveTo(player.getPosition().x,player.getPosition().y);

    }

}

function createDeadZombie(pos){
  newDeadZombie = deadZombie.create(pos.x, pos.y, 'Blood_Splatter');
  newDeadZombie.scale.setTo(0.2);
  newDeadZombie.anchor.setTo(0.5);
  randomang = game.rnd.realInRange(-180, 180);
  // newDeadZombie.mask = maskGraphics;
  newDeadZombie.angle = randomang;
}

function generateLoot(){
    random = {x: null, y: null};

    random.x = game.rnd.integerInRange(0, map.widthInPixels);
    random.y = game.rnd.integerInRange(400, map.heightInPixels);

	var bodies = game.physics.p2.hitTest(random, game.world.bodies, 200, false);

    if(!bodies.length){
        lootcount++;
        var newloot = loots.create(random.x, random.y, 'loot');
        newloot.anchor.setTo(0.5,0.5);
    }
}

function createObject(){
	random = {x: null, y: null};
    if(debugMode){
        	random.x = 500;
            random.y = 200;
    }else{
        	random.x = game.rnd.integerInRange(0, map.widthInPixels);
            random.y = game.rnd.integerInRange(400, map.heightInPixels);

    }

    var bodies = game.physics.p2.hitTest(random, game.world.bodies, 50, false);

	if(!bodies.length){
        zombiecount++;
        zombie = new GameObjects.Zombie();
        zombie.init(random);
        zombies.push(zombie);
    }
}

function zombieAI(){
    for(var i=0; i<zombies.length; i++){
        zombies[i].update();
            if((game.math.distance(player.getPosition().x, player.getPosition().y, zombies[i].getPosition().x, zombies[i].getPosition().y) < 1000)&&!zombies[i].isAttacking){
                zombies[i].startLine();
                zombies[i].raycast();
            }
    }
}
