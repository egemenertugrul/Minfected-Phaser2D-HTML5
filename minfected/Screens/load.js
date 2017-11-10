var loadState = {
    preload: function(){
        var loadingLabel = game.add.text(80, 150, 'loading...', {font: '30px Couier', fill: '#ffffff'});

        game.load.image('logo', 'assets/logo.png');

        game.load.image('menubg', 'assets/menubg.png');

        //game.add.plugin(Phaser.Plugin.Debug);

        game.load.audio('gunfx', [ 'assets/sounds/magnum.ogg' ]);
        game.load.audio('ost', 'assets/sounds/lones.mp3');
        game.load.audio('ost2', 'assets/sounds/rockon.ogg');
        game.load.audio('equip', 'assets/sounds/equip.mp3');

        game.load.audio('lastofus_dead', 'assets/sounds/lastofus_dead.mp3');
        game.load.audio('zombikfinal', 'assets/sounds/zombikfinal.ogg');

        game.load.tilemap('tilemap', 'assets/tilemaps/maps/tilemap2.json', null, Phaser.Tilemap.TILED_JSON); //loading actual map .json file
        game.load.image('tiles', 'assets/tilemaps/tiles/groundtiles.png'); //tileset of the map
        game.load.image('loot', 'assets/tilemaps/tiles/loot.png'); //tileset of the map

        game.load.image('walls', 'assets/tilemaps/tiles/tilemap.png');
        game.load.image('darkBG', 'assets/tilemaps/tiles/darkBG.png');

        game.load.atlasJSONHash('playerAtlas', 'assets/sprites/player.png', 'assets/sprites/player.json'); //player's file for the animations
        game.load.atlas('zombieAtlas','assets/sprites/zombies/zombiesheet.png','assets/sprites/zombies/zombiesheet.json',Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY); //zombies' file for the animations
        game.load.image('zombieWave', 'assets/sprites/zombies/waves.png');
        game.load.image('Blood_Splatter', 'assets/sprites/zombies/Blood_Splatter.png');
        game.load.image('HUDbg', 'assets/HUD/hudBG.png');
        game.load.image('inventorySprite', 'assets/HUD/inventorySprite.png');
        game.load.image('youaredead', 'assets/youaredead.png');

        for(var i=0; i<itemListNoChange.length; i++){
                game.load.image(itemListNoChange[i].name, 'assets/HUD/guns/'+i+'.png');
         }

    },

    create: function(){

        game.state.start('menu');
    }

}
