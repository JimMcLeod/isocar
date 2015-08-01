var game = new Phaser.Game(800, 400, Phaser.AUTO, 'ISO', null, true, false);

var BasicGame = function (game) { };

BasicGame.Boot = function (game) { };

var isoGroup, player,
	directionTable, playerDirection,
	keyDelay, keyDelayRefresh;

BasicGame.Boot.prototype =
{
    preload: function () {
        game.load.image('cube', 'img/cube.png');
		game.load.spritesheet('police', 'img/police.png', 32, 27);

        game.time.advancedTiming = true;

        // Add and enable the plug-in.
        game.plugins.add(new Phaser.Plugin.Isometric(game));

        // In order to have the camera move, we need to increase the size of our world bounds.
        game.world.setBounds(0, 0, 2048, 1024);

        // Start the IsoArcade physics system.
        game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);

        // This is used to set a game canvas-based offset for the 0, 0, 0 isometric coordinate - by default
        // this point would be at screen coordinates 0, 0 (top left) which is usually undesirable.
        // When using camera following, it's best to keep the Y anchor set to 0, which will let the camera
        // cover the full size of your world bounds.
        game.iso.anchor.setTo(0.5, 0);
    },
    create: function () {
        // Create a group for our tiles, so we can use Group.sort
        isoGroup = game.add.group();

        // Set the global gravity for IsoArcade.
        game.physics.isoArcade.gravity.setTo(0, 0, -500);

		playerDirection = 0;
		keyDelay = 10; keyDelayRefresh = keyDelay;

		directionTable = [
			{ x:0.5 , y:-0.5 },
			{ x:1, y:0 },
			{ x:0.5, y:0.5 },
			{ x:0, y:1 },
			{ x:-0.5, y:0.5 },
			{ x:-1, y:0 },
			{ x:-0.5, y:-0.5 },
			{ x:0, y:-1 },
		];

        // Let's make a load of cubes on a grid, but do it back-to-front so they get added out of order.
        var cube;
        for (var xx = 1024; xx > 0; xx -= 140) {
            for (var yy = 1024; yy > 0; yy -= 140) {
                // Create a cube using the new game.add.isoSprite factory method at the specified position.
                // The last parameter is the group you want to add it to (just like game.add.sprite)
                cube = game.add.isoSprite(xx, yy, 0, 'cube', 0, isoGroup);
                cube.anchor.set(0.5);

                // Enable the physics body on this cube.
                game.physics.isoArcade.enable(cube);

                // Collide with the world bounds so it doesn't go falling forever or fly off the screen!
                cube.body.collideWorldBounds = true;

                // Add a full bounce on the x and y axes, and a bit on the z axis.
                cube.body.bounce.set(1, 1, 0.2);

                // Add some X and Y drag to make cubes slow down after being pushed.
                cube.body.drag.set(100, 100, 0);
            }
        }

        // Create another cube as our 'player', and set it up just like the cubes above.
        player = game.add.isoSprite(128, 128, 0, 'police', 0, isoGroup);
        player.tint = 0x86bfda;
        player.anchor.set(0.5);
        game.physics.isoArcade.enable(player);
        player.body.collideWorldBounds = true;

        // Set up our controls.
        this.cursors = game.input.keyboard.createCursorKeys();

        this.game.input.keyboard.addKeyCapture([
            Phaser.Keyboard.LEFT,
            Phaser.Keyboard.RIGHT,
            Phaser.Keyboard.UP,
            Phaser.Keyboard.DOWN,
            Phaser.Keyboard.SPACEBAR
        ]);

        var space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        space.onDown.add(function () {
            player.body.velocity.z = 300;
        }, this);

        // Make the camera follow the player.
        game.camera.follow(player);
    },
    update: function () {
        // Move the player at this speed.
        var speed = 100;
		var frame;

        if (this.cursors.left.isDown) {
        	keyDelay--;
        	if (keyDelay === 0) {
            	playerDirection--;
            	keyDelay = keyDelayRefresh;
        	}
        }
        else if (this.cursors.right.isDown) {
            keyDelay--;
			if (keyDelay === 0) {
				playerDirection++;
				keyDelay = keyDelayRefresh;
			}
        } else {
        	keyDelay = keyDelayRefresh;
        }

		playerDirection = playerDirection & 7;
		if (this.cursors.up.isDown) {
			speed = 100;
		} else {
			speed = 0;
		}
		player.body.velocity.x = directionTable[playerDirection].x * speed;
		player.body.velocity.y = directionTable[playerDirection].y * speed;

        // Our collision and sorting code again.
        game.physics.isoArcade.collide(isoGroup);
        game.iso.topologicalSort(isoGroup);

        player.frame = playerDirection;
    },
    render: function () {
        game.debug.text("Move with cursors, jump with space!", 2, 36, "#ffffff");
        game.debug.text(game.time.fps || '--', 2, 14, "#a7aebe");
        game.debug.text("X table:" + directionTable[playerDirection].x, 2, 50, "#a7aebe");
        game.debug.text("Y table:" + directionTable[playerDirection].y, 2, 70, "#a7aebe");
    }
};

game.state.add('Boot', BasicGame.Boot);
game.state.start('Boot');