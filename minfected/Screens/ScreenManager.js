var game = new Phaser.Game(960, 640, Phaser.AUTO, 'minfected');

game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('play', playState);

game.state.start('boot');



