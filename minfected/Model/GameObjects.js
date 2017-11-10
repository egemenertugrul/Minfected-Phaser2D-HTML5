var GameObjects = window.GameObjects || {};

GameObjects.Player = (function(){
    return{

        arrows: game.input.keyboard.createCursorKeys(), //setting buttons for arrows(cursors) and keyboard buttons
        keyboard: { up: game.input.keyboard.addKey(Phaser.Keyboard.W), down: game.input.keyboard.addKey(Phaser.Keyboard.S), left: game.input.keyboard.addKey(Phaser.Keyboard.A), right: game.input.keyboard.addKey(Phaser.Keyboard.D), shift: game.input.keyboard.addKey(Phaser.Keyboard.SHIFT),inventory: game.input.keyboard.addKey(Phaser.Keyboard.I)},
        numberSelect: {one:  game.input.keyboard.addKey(Phaser.Keyboard.ONE), two:  game.input.keyboard.addKey(Phaser.Keyboard.TWO)},

        rotSpeed: 100, //player's rotation speed

        bulletcount: 0,

        defaultHealth: 100,
        health: null,
        defaultFatigue: 100, // max fatigue of the player
        fatigue: null, // setting the current fatigue to initial value

        speedMultiplier: 1.6, //to multiply with player's current speed while running

        playerWalkSpeed: 100, //player's walk speed
        playerRunSpeed: null, //player's run speed
        playerCurrentSpeed: null, //setting player's default speed to walk speed
        crossSpeed: null,

        playerFrameSpeedSlow: 10, //player's frame speed for animations
        playerFrameSpeedFast: null, //player's frame speed while running

        HUDSize: 9, //size of selectable items
        defaultState: 0, //initially chosen item
        selectedItem: null,

        playerHUD: null,
        playerInv: null,

        inventory: [],

        firstWpID: 0,
        secondWpID: 1,

        isFired: false,
        muzzleDelay: "",
        muzzleTime: 100, //ms
        showMuzzle: false,
        line: null,
        lineInterval: 15, // half of zombie height (px)

        sprite: "",
        isRunning: false,

        init: function (pos){
            this.sprite = game.add.sprite(pos.x, pos.y, 'playerAtlas');
            this.sprite.scale.setTo(0.23,0.23);
            this.sprite.animations.add('handgunWalk', Phaser.Animation.generateFrameNames('handgun/move/survivor-move_handgun_', 0, 19, '.png'), this.playerFrameSpeedSlow, true, false);
            this.sprite.animations.add('flashlightIdle', Phaser.Animation.generateFrameNames('flashlight/idle/survivor-idle_flashlight_', 0, 19, '.png'), this.playerFrameSpeedSlow, true, false);
            this.sprite.animations.play(itemListNoChange[this.firstWpID].name+"Walk");
            this.sprite.anchor.x = (0.23);
            this.sprite.anchor.y = (0.5);
            game.physics.p2.enable(this.sprite);
            game.camera.follow(this.sprite);
            this.playerHUD = new HUDModel.PrimaryHUD();
            this.playerHUD.init();

            this.playerInv = new HUDModel.SecondaryHUD
            this.line = new Phaser.Line();

            //playerInv.init();

            this.bulletcount = 12;

            this.inventory.push(itemListNoChange[this.firstWpID]);
            this.inventory.push(itemListNoChange[this.secondWpID]);

            this.fatigue = this.defaultFatigue;
            this.health = this.defaultHealth;
            this.playerRunSpeed =  this.playerWalkSpeed * this.speedMultiplier;
            this.playerCurrentSpeed = this.playerWalkSpeed;
            this.playerFrameSpeedFast = this.playerFrameSpeedSlow * this.speedMultiplier;
            this.selectedItem = [this.HUDSize];

            this.keyboard.inventory.onDown.add(this.playerInv.toggle, this.playerInv);

        },
        update: function(){


            this.checkLoot();

            this.setVelocityToZero();
            if (this.showMuzzle && (game.time.now - this.muzzleDelay > this.muzzleTime)){
                this.showMuzzle = false;
            }

            if(this.numberSelect.one.isDown && this.defaultState!=0){
                console.log("One is pressed");
                for(var i=0;i<this.HUDSize;i++){
                    this.selectedItem[i]=false;
                }
                i=1;
                this.selectedItem[i-1] = true;
                this.defaultState = i-1;
                this.changeState();
              }else if(this.numberSelect.two.isDown && this.defaultState!=1){
                console.log("Two is pressed");
                for(var i=0;i<this.HUDSize;i++){
                    this.selectedItem[i]=false;
                }
                i=2;
                this.selectedItem[i-1] = true;
                this.defaultState = i-1;
                this.changeState();
              }
            this.crossSpeed = Math.sqrt((this.playerCurrentSpeed * this.playerCurrentSpeed)/2);
            moves = {up: false, down: false, left: false, right: false};

            if (this.arrows.up.isDown || this.keyboard.up.isDown)
            {
                moves.up = true;
            } else if(this.arrows.down.isDown || this.keyboard.down.isDown){
                moves.down = true;
            }
            if (this.arrows.left.isDown || this.keyboard.left.isDown)
            {
                moves.left = true;
            }
            else if (this.arrows.right.isDown || this.keyboard.right.isDown)
            {
                moves.right = true;
            }

            this.movePlayer(moves);
            this.lookAtMouse();
            this.updateText();

            game.input.onDown.add(this.fireGun, this);
            /*if(game.input.activePointer.leftButton.isDown && !this.isFired){
                this.fireGun();
            }*/
        },
        checkLoot:function(){
         var boundsA = this.sprite.getBounds();
         loots.forEach(function(item){
             var boundsB = item.getBounds();
             if(Phaser.Rectangle.intersects(boundsA, boundsB)){
                 var ammo=false, health=false;
                rand = Math.random();
                if(rand >= 0.5){
                  player.bulletcount += 6;
                    ammo = true;
                }

                rand = Math.random();
                if(rand >= 0.5 && (player.health+10)<100){
                  player.health+= 10;
                    health = true;
                }

                if(ammo||health){
                    showLootText(item.position, ammo, health);
                }

                lootSound.play();
                console.log(player.bulletcount);
                lootcount--;
                item.destroy();
                return;
            }
         })

        },
        die: function(){
          this.health = 0;
          lastofus_dead.play();
            deadScreen = game.add.sprite(game.camera.position.x, game.camera.position.y, 'youaredead');
            deadScreen.anchor.setTo(0.5, 0.5);
            deadScreenDuration = game.time.now;
            isDeadScreen = true;
              //game.state.start('boot');
        },

        fireGun: function(){
            if(this.selectedItem[0] && !this.isFired && this.bulletcount){
                this.isFired = true;
                fx.play('magnumshot');

                game.plugins.screenShake.start(15);

                for(var i=0; i<zombiecount;i++){
                    if(zombies[i].line.length < 220){
                        zombies[i].isAttracted = true;
                        zombies[i].lastSeen.x = this.getPosition().x;
                        zombies[i].lastSeen.y = this.getPosition().y;
                    }
                }

                var calculatedAngle = (this.sprite.angle*Math.PI / 180.0);
    //            var point = {x: this.getPosition().x+27, y: this.getPosition().y+13};
                var calculatedAngle2 = (1.1218992);
                this.line.start.set(this.getPosition().x-(Math.sin(calculatedAngle - calculatedAngle2)*30), this.getPosition().y+(Math.cos(calculatedAngle - calculatedAngle2)*30));
                this.line.end.set(this.getPosition().x+(Math.cos(calculatedAngle)*500), this.getPosition().y+(Math.sin(calculatedAngle)*500));
                var found = false;
                var bodies, walls;
                for(var i=0; i*this.lineInterval <= this.line.length; i++){
                  var coords = { x: this.getPosition().x+(Math.cos(calculatedAngle)*i*this.lineInterval), y: this.getPosition().y+(Math.sin(calculatedAngle)*i*this.lineInterval)};
                  bodies = game.physics.p2.hitTest(coords, game.world.bodies, 50, true);

                  if(bodies.length){

                    if(bodies[0].parent.sprite.key == "zombieAtlas"){
                      //console.log(bodies[0].parent);
                      for(var j=0; j<zombies.length; j++){
                        //console.log(zombies[j].sprite.body.sprite.body.id);
                        //console.log(bodies[0])
                        if(zombies[j].sprite.body.sprite.body.id == bodies[0].id){
                          found = true;
                          this.line.end.set(this.getPosition().x+(Math.cos(calculatedAngle)*i*this.lineInterval), this.getPosition().y+(Math.sin(calculatedAngle)*i*this.lineInterval))
                          game.debug.geom(this.line, '#FFFFFF');
                          zombies[j].takeDamage(j, this.line.length);
                          break;
                        }
                      }

                      break;
                    }
                  }else{
                      walls = game.physics.p2.hitTest(coords, game.world.bodies, 50, false);
                      if(walls.length){
                          this.line.end.set(this.getPosition().x+(Math.cos(calculatedAngle)*i*this.lineInterval), this.getPosition().y+(Math.sin(calculatedAngle)*i*this.lineInterval))
                          game.debug.geom(this.line, '#FFFFFF');
                      }
                  }
                  //console.log("loop finished")
                }
                if(!found) game.debug.geom(this.line, '#FFFFFF');
                this.showMuzzle = true;
                this.muzzleDelay = game.time.now;
                this.bulletcount -= 1;
                this.isFired = false;
            }
        },

        updateText: function(){
            gameText.setText("Health: " + Math.floor(this.health) + " Fatigue: " + Math.floor(this.fatigue)+ " Bullets: " + Math.floor(this.bulletcount) +"\nPress I for Inventory"+"\nPress 1 or 2 to switch weapons\nCurrent Zombie Count: "+ zombiecount + "\nLoots Left: " + lootcount);
        },
        changeState: function(){
                this.sprite.animations.stop();
              if(this.selectedItem[0]){
                this.sprite.animations.play(itemListNoChange[this.firstWpID].name+"Walk");
                  this.playerHUD.updateHUD(0);
              } else if (this.selectedItem[1]){
                this.sprite.animations.play(itemListNoChange[this.secondWpID].name+"Idle");
                  this.playerHUD.updateHUD(1);
              }

        },
        setVelocityToZero: function(){
            this.sprite.body.setZeroVelocity();
        },
        getPosition: function(){
            return this.sprite.position;
        },
        movePlayer: function(moves){

            if(this.keyboard.shift.isDown){
                if(!this.increasePlayerSpeed()){
                    this.decreasePlayerSpeed();
                };
            }else{
                this.decreasePlayerSpeed();
            }

            if(moves.up && (moves.right || moves.left)){
                if(moves.right){
                  this.sprite.body.moveRight(this.crossSpeed);
                } else {
                  this.sprite.body.moveLeft(this.crossSpeed);
                }
                  this.sprite.body.moveUp(this.crossSpeed);
                } else if (moves.up){
                  this.sprite.body.moveUp(this.playerCurrentSpeed);
            }
            if(moves.down && (moves.right || moves.left)){
                if(moves.right){
                  this.sprite.body.moveRight(this.crossSpeed);
                } else {
                  this.sprite.body.moveLeft(this.crossSpeed);
                }
                  this.sprite.body.moveDown(this.crossSpeed);
                } else if (moves.down){
                  this.sprite.body.moveDown(this.playerCurrentSpeed);
            }
            if((moves.left || moves.right) && !(moves.up || moves.down)){
                if(moves.left){
                  this.sprite.body.moveLeft(this.playerCurrentSpeed);
                }else{
                  this.sprite.body.moveRight(this.playerCurrentSpeed);
                }
            }
        },
        increasePlayerSpeed: function(){
            if(!this.isRunning)
                return false;
            if(this.fatigue > 1){

                this.playerCurrentSpeed= this.playerRunSpeed;
                this.sprite.animations.currentAnim.speed = this.playerFrameSpeedFast;
                this.fatigue -= 0.5;
                return true;
            } else {
                this.isRunning = false;
                return false;
            }
        },
        decreasePlayerSpeed: function(){
            this.playerCurrentSpeed = this.playerWalkSpeed;
            this.sprite.animations.currentAnim.speed = this.playerFrameSpeedSlow;

            this.fatigue < this.defaultFatigue * 0.3 ? this.isRunning=false : this.isRunning=true

            if(this.fatigue<this.defaultFatigue){
                this.fatigue += 0.1;
            }else if(this.fatigue>this.defaultFatigue){
                this.fatigue = this.defaultFatigue;
            }
        },
        lookAtMouse:function(){
            deltaMouseRad = this.sprite.rotation - game.physics.arcade.angleToPointer(this.sprite);

            mod = Math.PI * 2
            deltaMouseRad = deltaMouseRad % mod;
            if (deltaMouseRad != deltaMouseRad % (mod/2) ) {
                deltaMouseRad = (deltaMouseRad < 0) ? deltaMouseRad + mod : deltaMouseRad - mod;
            }
            this.sprite.body.rotateLeft(this.rotSpeed * deltaMouseRad);
        },

    }
})

GameObjects.Zombie = (function(){
    return{
        sprite: "",
        critText: "",
        contact: false,
        isAttacking: false,
        isFollowing: "",
        isAttracted: false,
        lastSeen: {x: null,y: null},
        tilesCollide: false,
        line: null, //debug line between player and zombie
        line2: null, //debug line between zombie and last seen loc.
        tileHits: [], //array to keep the list of tiles intersecting line(1)
        zombieWalkSpeed: 80,
        zombieRunSpeed: 120,

        defaultHealth: 100,
        health: null,

        sfx:"",

        wave: "",
        signal: "",
        init: function (pos) {
            this.sfx = game.add.audio('zombikfinal');
            this.sfx.allowMultiple = true;
            this.sfx.loop=true;

            this.sprite = game.add.sprite(pos.x, pos.y, 'zombieAtlas');
            this.sprite.scale.setTo(0.20,0.20);
            game.physics.enable(this.sprite, Phaser.Physics.P2JS);

             this.health = this.defaultHealth;

            this.critText = game.add.text(this.getPosition().x,this.getPosition().y, "",{font:"normal 18px arial",fill: "#b60000"});

            this.sprite.animations.add('idle',
            Phaser.Animation.generateFrameNames('skeleton-idle_', 0, 16, '.png'), 10, true, false);
            this.sprite.animations.add('move',
            Phaser.Animation.generateFrameNames('skeleton-move_', 0, 16, '.png'), 10, true, false);
            this.sprite.animations.add('strike',
            Phaser.Animation.generateFrameNames('skeleton-attack_', 0, 8, '.png'), 20, true, false);
            this.sprite.animations.play('idle');
            this.sprite.anchor.setTo(.5, .5);
            this.sprite.mask = maskGraphics;
            maskLayers.push(this.sprite);
            this.sprite.body.angle =  game.rnd.integerInRange(-180, 180);
            this.sprite.body.onBeginContact.add(this.contactOn, this);
            this.sprite.body.onEndContact.add(this.contactOff, this);

            this.signal = new Phaser.Signal();
            this.signal.addOnce(this.giveDamage, this);


            this.line = new Phaser.Line(); //created two lines for debugging and pathfinding
            this.line2 = new Phaser.Line();

            this.wave = game.add.sprite(this.sprite.position.x, this.sprite.position.y, 'zombieWave');
            this.wave.scale.setTo(0.5);
            this.wave.anchor.setTo(0.5);
            this.wave.z = 0;
            this.wave.alpha = 0;
        },
        update: function(){

            if(this.critText.alpha > 0){
                this.critText.alpha -= 0.01;
            }

            this.sprite.body.setZeroVelocity();
            this.sprite.body.angularVelocity = 0;
            this.wave.position = this.sprite.position;
          if(game.math.distance(this.sprite.position.x, this.sprite.position.y, player.getPosition().x, player.getPosition().y) < 150){
              if(!this.sfx.isPlaying){
                  this.sfx.play();
              }
              this.sfx.volume = 1- (game.math.distance(this.sprite.position.x, this.sprite.position.y, player.getPosition().x, player.getPosition().y) / 150);
              this.wave.alpha = 1- (game.math.distance(this.sprite.position.x, this.sprite.position.y, player.getPosition().x, player.getPosition().y) / 150);
          }else{
              if(this.sfx.isPlaying){
                this.sfx.stop();
              }
              this.wave.alpha = 0;
          }


            if(this.sprite.animations.currentAnim.name == "strike" && this.sprite.animations.currentFrame.index == "8"){
                if(!this.contact){
                  this.sprite.animations.stop();
                  this.sprite.animations.play("idle");
                  this.isAttacking = false;
              }
            }

          if(this.isAttacking){
            if(this.sprite.animations.currentFrame.index == 5 && game.math.distance(this.sprite.position.x, this.sprite.position.y, player.getPosition().x, player.getPosition().y) < 90){

               this.signal.dispatch();
            }
          }
          if(this.sprite.animations.currentAnim.name == "strike" && this.sprite.animations.currentFrame.index == 8){
            this.renewAttack();
          }
            if(this.isAttracted){
                this.goToLastSeen();
            }

        },
        renewAttack: function(){
          console.log("renewed");
          this.signal.addOnce(this.giveDamage, this);
        },
        contactOn: function(target){
          this.contact = true;
          if(target!=null){
            if(!target.static)
            {
              if(target.sprite.key == "playerAtlas"){
                this.sprite.body.angle = this.line.angle * 180 / Math.PI;
                this.isAttacking = true;
                this.strike();
              }
            }
          }

        },
        contactOff: function(){
          this.contact = false;
        },
        getPosition: function(){
            return this.sprite.position;
        },
        takeDamage:function(j, distance){
            var crit
            var result = game.rnd.integerInRange(0, 10);
            if(parseInt(result / 7)==0){
                crit = 1;
            } else{
                crit = result % 7+1;
                console.log("critical shot: *" + crit);
            }


            var damageMult = 1/(distance/50);
            var damage  = (20 + (damageMult * 50))*crit;
            console.log(damage);
            this.health -= damage;



            if(this.health <= 0){

               if(crit!=1){
                    tempText.position.x = this.getPosition().x;
                    tempText.position.y = this.getPosition().y;
                    tempText.setText("x"+crit+"!");
                    tempText.fontSize = 10*crit+"px";
                    tempText.alpha = 1;
               }

                this.die(j);
            } else{
                if(crit!=1){
                    this.critText.position.x = this.getPosition().x;
                    this.critText.position.y = this.getPosition().y;
                    this.critText.setText("x"+crit+"!");
                    this.critText.fontSize = 10*crit+"px";
                    this.critText.alpha = 1;
                }
                this.lastSeen.x = player.getPosition().x;
                this.lastSeen.y = player.getPosition().y;
                this.line2.start.set(this.getPosition().x, this.getPosition().y);
                this.line2.end.set(player.getPosition().x, player.getPosition().y);
                this.isAttracted = true;
            }
        },
        goToLastSeen: function() {

            if(this.sprite.animations.currentAnim.name != "move"){
                if(this.sprite.animations.currentAnim.name == "strike" && this.sprite.animations.currentFrame == 8){
                  this.sprite.animations.stop();
                  this.sprite.animations.play("move");
                }
                if(this.sprite.animations.currentAnim.name == "idle"){
                  this.sprite.animations.stop();
                  this.sprite.animations.play("move");
                }
            }

            var rotation = game.math.angleBetween(this.sprite.position.x, this.sprite.position.y, this.lastSeen.x, this.lastSeen.y);
            this.sprite.body.velocity.x = Math.cos(rotation) * this.zombieWalkSpeed;
            this.sprite.body.velocity.y = Math.sin(rotation) * this.zombieWalkSpeed;
            this.sprite.body.rotation = rotation;
            if(this.line2.length < 2){
                if(this.sprite.animations.currentAnim.name != "idle"){
                    this.sprite.animations.stop();
                    this.sprite.animations.play("idle");
                }
                if(this.isAttracted){
                    this.isAttracted = false;
                }
                 this.lastSeen.x = null;
                 this.lastSeen.y = null;

            }
        },
        strike: function(){
          this.sprite.animations.stop();
          this.sprite.animations.play("strike");

        },
        giveDamage: function(){
          if(player.health > 0){
              damage = game.rnd.integerInRange(5, 10);
              game.plugins.screenShake.start(damage);
            player.health = player.health - (damage);
            console.log("gave damage");
          }
        },
        die: function(id){
            createDeadZombie(this.getPosition());

            maskLayers.pop(this.sprite);
            zombiecount--;
            this.sfx.destroy();
            this.sprite.kill();
            this.wave.kill();
            this.critText.alpha = 0;
            this.critText.kill();
            zombies.splice(id, 1);
            delete this;
        },
        setVelocityToZero: function(){
            this.sprite.body.setZeroVelocity();
        },
        getVelocity: function(){
            return this.sprite.body.velocity;
        },
        startLine: function(){

            if(debugMode){
                if (this.tileHits.length > 0)
                    {
                        for (var i = 0; i < this.tileHits.length; i++)
                        {
                            this.tileHits[i].debug = false;
                        }

                        collisionLayer.dirty = true;
                }
            }

            this.line.start.set(this.getPosition().x, this.getPosition().y);
        },

        raycast: function(){
//            var calculatedAngle=(player.angle*Math.PI / 180.0);
            if(debugMode){
                game.debug.geom(this.line, '#00D8A2');
                game.debug.geom(this.line2, '#FF0000');
            }
            this.line.end.set(player.getPosition().x, player.getPosition().y);
            this.line2.start.set(this.getPosition().x, this.getPosition().y);
            if(this.line2.end.x==0 && this.line2.end.y==0){

                this.line2.end.set(this.getPosition().x, this.getPosition().y);
            }
            var angleBetweenDeg = (this.sprite.angle) - this.line.angle *(180/Math.PI);
            angleBetweenDeg += (angleBetweenDeg>180) ? -360 : (angleBetweenDeg<-180) ? 360 : 0
                angleBetweenDeg = Math.abs(angleBetweenDeg);

            if(this.line.length < 220){
                if(((angleBetweenDeg < 45)&& (this.lastSeen.x==null&&this.lastSeen.y==null)) && this.line.length < 175 || ((angleBetweenDeg < 90)&& (this.lastSeen.x!=null&&this.lastSeen.y!=null)) || (((angleBetweenDeg >= 45) && (angleBetweenDeg < 150) ) && (this.lastSeen.x==null&&this.lastSeen.y==null) && this.line.length < 140 )) {
                        this.tileHits = collisionLayer.getRayCastTiles(this.line, 4, false, false);
                            for (var i = 0; i < this.tileHits.length; i++) {
                                if (this.tileHits[i].collides){
                                    this.tilesCollide = true;
                                    break;
                                }
                            }
                                if(i==this.tileHits.length){
                                    this.tilesCollide = false;
                                }
                                if (!this.tilesCollide) {
                                    this.line2.end.set(player.getPosition().x, player.getPosition().y);
                                    this.lastSeen.x = player.getPosition().x;
                                    this.lastSeen.y = player.getPosition().y;
                                    this.goToLastSeen();
                                    this.isAttracted = false;
                                } else {
                                    if(this.lastSeen.x != null && this.lastSeen.y != null){
                                        this.goToLastSeen();
                                    }
                                }

                    if(debugMode){
                        for (var i = 0; i < this.tileHits.length; i++)
                        {
                            if (this.tileHits[i].collides) {
                                this.tileHits[i].debug = true;
                          }
                        }

                    //console.log("minIndex" + minIndex);

                        collisionLayer.dirty = true;
                    }


                } else {
                     if(this.lastSeen.x != null && this.lastSeen.y != null){
                         this.goToLastSeen();
                     }
                }
            } else {
                if(this.lastSeen.x != null && this.lastSeen.y != null){
                     this.goToLastSeen();
                 }
              }


        }
    }
})
