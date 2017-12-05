
function startGame() {
	Darkworld.start();
}

function addListeners() {
	/*window.addEventListener('keydown', function(event) {
		switch (event.keyCode) {
			case 37: // Left
				Interaction.resetVertical()
				Interaction.left = true;
				break;

			case 38: // Up
				Interaction.resetHorisontal()
				Interaction.up = true;
				break;

			case 39: // Right
				Interaction.resetVertical()
				Interaction.right = true;
			break;

			case 40: // Down

				Interaction.resetHorisontal()
				Interaction.down = true;
				break;
		}
	}, false);
	window.addEventListener('keyup', function(event) {
		switch (event.keyCode) {
			case 37: // Left
				Interaction.left = false;
				break;

			case 38: // Up
				Interaction.up = false;
				break;

			case 39: // Right
				Interaction.right = false;
				break;

			case 40: // Down
				Interaction.down = false;
				break;
		}
	}, false); */

}
var PlayerConfig = { 
	color: "blue",
	width: "128",
	height: "128",
	pos_x: 11,
	pos_y: 5,
}

var Interaction = {
	left: false,
	right: false,
	up: false,
	down: false,
	resetHorisontal: function() {
		this.left = false;
		this.right = false;
	},
	resetVertical: function() {
		this.up = false;
		this.down = false;
	}
}

var Map = {
	width: 600,
	height: 60,
	map: null,
	generateMap: function() {
		Map.map = new Array(this.width);
		for (y = 0; y < this.width; y++) {
			Map.map[y] = new Array(this.height);
			for (x = 0; x < this.height; x++) {
				this.map[y][x] = null;
			}
		}
	},

	placeUnit(unit) {
		Map.map[unit.y][unit.x] = unit;
	}
}

var Darkworld = {
	mainChar: null,
	scale: 0,
	frameno: 0,
	gameSettings : {
		centerX: 11,
		centerY: 5,
		viewWidth: 1840, 
		viewHeight: 880,
		scaler: 0,
		gridSize: 80, //Initial gridsize to resize to. 
		fps: 90,   // Fps of the game
		squareSize: 0, // Size of the square in pixels.
		squaresX: 0,
		squaresY: 0,
	},
	gameState: {
		isMoving: false,
		offsetX: 0, //Extra anim steps X
		offsetY: 0, //Extra anim steps Y
		nearEdgeX: false,
		nearEdgeY: false,
		mouse: {x: 0, y: 0},

	},
	canvas : document.createElement("canvas"),
	start : function() {
		wScale = (window.innerWidth - 10) / this.gameSettings.viewWidth;
		hScale = (window.innerHeight - 10) / this.gameSettings.viewHeight;
		this.scale = Math.min(wScale, hScale)	
		this.canvas.width = this.gameSettings.viewWidth * this.scale;
		this.canvas.height = this.gameSettings.viewHeight * this.scale;
		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		//this.scale = 1
		this.gameSettings.squareSize = this.gameSettings.gridSize * this.scale;
		this.gameSettings.squaresX = this.canvas.width / this.gameSettings.squareSize;
		this.gameSettings.squaresY = this.canvas.height / this.gameSettings.squareSize;

		console.log(this.canvas.width, this.gameSettings.squaresX)
		this.gameSettings.centerX = Math.floor(this.gameSettings.squaresX / 2)
		this.gameSettings.centerY = Math.floor(this.gameSettings.squaresY / 2)

		this.canvas.onmousemove = this.mouseMove
		this.frameNo = 0;
		Map.generateMap()
		this.mainChar = new unit(PlayerConfig.width, PlayerConfig.height, PlayerConfig.color,
		this.gameSettings.centerX, this.gameSettings.centerY, "player");
		testUnit1 = new unit(80, 80, "red", 20, 20, "enemy");
		testUnit2 = new unit(this.gameSettings.gridSize, this.gameSettings.gridSize,"green", 3, 2, "enemy");
		testUnit3 = new unit(this.gameSettings.gridSize, this.gameSettings.gridSize,"green", 5, 17, "enemy");
		testUnit4 = new unit(this.gameSettings.gridSize, this.gameSettings.gridSize,"green", 15, 13, "enemy");
		Map.placeUnit(testUnit1);
		Map.placeUnit(testUnit2);
		Map.placeUnit(testUnit3);
		Map.placeUnit(testUnit4);
		this.drawWorld();
		addListeners();
		this.interval = setInterval(gameLoop, 1000/this.gameSettings.fps);
	},
	drawGrid: function() {
		gridSize = this.gameSettings.squareSize;
		ctx = this.context;
		widthCount = this.gameSettings.squaresX; 
		heightCount = this.gameSettings.squaresX;

		for (i = 0; i < widthCount; i++) {
			ctx.beginPath();
			ctx.moveTo(gridSize * i, 0);
			ctx.lineTo(gridSize* i, this.canvas.height);
			ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
			ctx.stroke();
		}
		for (i = 0; i < heightCount; i++) {
			ctx.beginPath();
			ctx.moveTo(0, gridSize * i);
			ctx.lineTo(this.canvas.width, gridSize * i);
			ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
			ctx.stroke();
		}
	},
	drawWorld: function(x, y) {
		this.drawGrid();
		mainPosY = Darkworld.mainChar.screenPosY;
		mainPosX = Darkworld.mainChar.screenPosX;
		this.mainChar.update(mainPosX, mainPosY);	
		for (Y = 0; Y < Map.height; Y++) {		
			for (X = 0; X < Map.width; X++) {	
				unit = Map.map[Y][X]
				if (unit != null) {
					ypos = Y - y + mainPosY;
					xpos = X - x + mainPosX;
					unit.update(xpos, ypos);
				}
			}
		}
	},
	size: function(s) {
		return s * this.scale;
	},

	pos : function(pos) {
		return this.gameSettings.squareSize * pos;
	},
	cordsToPos: function(x, y) {
		return ({
			x : Math.floor(x / this.gameSettings.squareSize),
			y : Math.floor(y / this.gameSettings.squareSize)
		});
	},
	update : function() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.drawWorld(this.mainChar.x, this.mainChar.y);
	},
	mouseMove: function(evt) {
		var rect = Darkworld.canvas.getBoundingClientRect();
		x =  evt.clientX - rect.left,
		y = evt.clientY - rect.top
		Darkworld.gameState.mouse = Darkworld.cordsToPos(x, y);
	},
	updateScreenPos: function(x, y) {
		centerX = this.gameSettings.centerX;
		centerY = this.gameSettings.centerY;
		Darkworld.mainChar.screenPosY = centerY;
		Darkworld.mainChar.screenPosX = centerX;

		if (y - centerY < 0) {
			Darkworld.mainChar.screenPosY = centerY - (centerY - y); 
		}
		else if (y + centerY > Map.height) {
			Darkworld.mainChar.screenPosY = centerY + (centerY - (Map.height - y)); 
		}
		if (x - centerX < 0) {
			Darkworld.mainChar.screenPosX = centerX - (centerX - x); 
		}
		else if (x + centerX > Map.width) {
			Darkworld.mainChar.screenPosX = centerX + (centerX - (Map.width - x));
		}
	}
}

function playerMove() {
	var mouse = Darkworld.gameState.mouse; 
	var player = Darkworld.mainChar;
	var playerX = Darkworld.mainChar.screenPosX;
	var playerY = Darkworld.mainChar.screenPosY;
	xDiff = mouse.x - playerX
	yDiff = mouse.y - playerY
	if (0 == yDiff && xDiff ==  0)
		return

	
	if (Math.abs(yDiff) > Math.abs(xDiff)) {
		if (yDiff > 0) {
			player.moveDown()
		}
		else {
			player.moveUp()
		}
	}
	else if (Math.abs(xDiff) > Math.abs(yDiff)) {
		if (xDiff > 0) {
			player.moveRight()
		}
		else {
			player.moveLeft()
		}
	}
	else if (Math.abs(xDiff) == Math.abs(yDiff)) {
		if (yDiff > 0) {
			player.moveDown()
		}
		else if (yDiff < 0) {
			player.moveUp()
		}

	}
	/*if (Interaction.left)
		Darkworld.mainChar.moveLeft()
	if (Interaction.right)
		Darkworld.mainChar.moveRight()
	if (Interaction.down)
		Darkworld.mainChar.moveDown()
	if (Interaction.up)
		Darkworld.mainChar.moveUp()
	*/
}

function gameLoop() {
	Darkworld.updateScreenPos(Darkworld.mainChar.x, Darkworld.mainChar.y)
	if (!Darkworld.mainChar.isMoving) {
		playerMove();
	}
	Darkworld.update()
	Darkworld.frameno++;
}

function unit( width, height, color, x, y, type) {
	this.type = type;
	this.hp = 100;
	this.color = color;
	this.mana = 30;
	this.exp = 0;
	this.width = width;
	this.height = height;
	this.moveSpeed = 3; // Move speed 1000 sec / 10
	this.x = x;
	this.y = y;
	this.ctx = Darkworld.context;

	//Animation Stuff
	this.isMoving = false;
	this.framesMoved = 0;
	this.moveFrames = 0;
	this.xStep = 0;
	this.yStep = 0;
	this.xSpeed = 0;
	this.ySpeed = 0;
	this.screenPosX = x;
	this.screenPosY = y;
	this.playerSprite = new Image();
	this.playerSprite.src = "Resources/Sprites/mainChar/v1/sprite_sheet.png";
	this.frameCount = 4;
	this.frameIndex = 0;
	this.frameUp = 0;
	this.frameLine = 0;
	this.first = true;
	this.ticksPerFrame = 4;
	this.tickCount = 0;
	this.move = null;

	this.posX = function() {
		return Darkworld.pos(this.x);
	}
	this.posY = function() {
		return Darkworld.pos(this.y);
	}

	this.update = function(x, y) {
		if (this.type == "player") {
			this.moveAnimation(x, y);	
		}
		else {
			this.ctx.fillStyle = this.color;
			this.ctx.fillRect(
					Darkworld.pos(x) + Darkworld.gameState.offsetX * -1,
					Darkworld.pos(y) + Darkworld.gameState.offsetY * -1,
					Darkworld.size(this.width),
					Darkworld.size(this.height));	
		}
	}
	
	this.preventWalkJerkX = function() {
		var centerX = Darkworld.gameSettings.centerX;
		var X = 0;
			if (this.x == centerX && this.move == "left") {
				X += Darkworld.gameState.offsetX;
				Darkworld.gameState.offsetX  = 0;
			}
			else if (this.x == Map.width - centerX && this.move == "right") {
				X += Darkworld.gameState.offsetX;
				Darkworld.gameState.offsetX  = 0;
			}
			else if (this.x < centerX) {
				X += Darkworld.gameState.offsetX;
				Darkworld.gameState.offsetX  = 0;
			}
			else if (this.x > Map.width - centerX) {
				X += Darkworld.gameState.offsetX;	
				Darkworld.gameState.offsetX  = 0;
			}
		return X;
	}

	this.preventWalkJerkY = function() {
		var centerY = Darkworld.gameSettings.centerY;
		var Y = 0;
			if (this.y == centerY && this.move == "up") {
				Y += Darkworld.gameState.offsetY;
				Darkworld.gameState.offsetY  = 0;
			}
			else if (this.y == Map.height - centerY && this.move == "down") {
				Y += Darkworld.gameState.offsetY;
				Darkworld.gameState.offsetY  = 0;
			}
			else if (this.y < centerY) {
				Y += Darkworld.gameState.offsetY;
				Darkworld.gameState.offsetY  = 0;
			}
			else if (this.y > Map.height - centerY) {
				Y += Darkworld.gameState.offsetY;	
				Darkworld.gameState.offsetY = 0;
			}
		return Y;
	}

	this.moveAnimation = function (x, y) {
		Darkworld.gameState.offsetX  = this.xStep * this.framesMoved;
		Darkworld.gameState.offsetY  = this.yStep * this.framesMoved;
		var X = Darkworld.pos(x) + this.preventWalkJerkX(); 
		var Y = Darkworld.pos(y) + this.preventWalkJerkY();
		this.tickCount++;
		this.playerRender(X, Y);	
		if (this.isMoving) {
			if (this.tickCount > this.ticksPerFrame) {
				this.tickCount = 0;
				if (this.frameIndex < this.frameCount - 1) {
					this.frameIndex++
				}
				else {
					this.frameIndex = 0;
				}
			}	
			this.moveFrames--;	
			this.framesMoved++;
			if (this.moveFrames == 0 ) {
				this.x = this.x + this.xSpeed;
				this.y = this.y + this.ySpeed;
				this.frameIndex = 0;
				this.resetMove()
			}
		}
	}		
	this.playerRender = function(X, Y) {
		this.ctx.fillStyle = "yellow";
		this.ctx.fillRect(
			X,
			Y,
			Darkworld.gameSettings.squareSize,
			Darkworld.gameSettings.squareSize)

		this.ctx.drawImage(
			this.playerSprite,
			this.frameIndex * 256,
			this.frameLine * 256,
			256,
			256,
			X - Darkworld.size(256 / 10),
			Y - Darkworld.size(256 / 8),
			Darkworld.size(this.width),
			Darkworld.size(this.height));
		}

	this.resetMove = function() {
		this.frameIndex = 0;
		this.framesMoved = 0;
		this.moveFrames = 0
		this.isMoving = false;
		this.xSpeed = 0;
		this.ySpeed = 0;
	}

	this.initMove = function(xSpeed, ySpeed) {
		this.framesMoved = 0;
		this.isMoving = true;
		this.xSpeed = xSpeed;
		this.ySpeed = ySpeed;
		this.moveFrames = Math.round((1000 / this.moveSpeed) / (1000 / Darkworld.gameSettings.fps))
		this.frameUp = Math.round(this.moveFrames / this.frameCount);
		this.ticksPerFrame = this.frameUp;
		this.xStep = ((Darkworld.gameSettings.squareSize) / this.moveFrames) * xSpeed;
		this.yStep = ((Darkworld.gameSettings.squareSize) / this.moveFrames) * ySpeed;
	}

	this.moveLeft = function() {
		if (this.x > 0 && !this.isMoving) {
			this.initMove(-1, 0)
			this.frameLine = 2;
			this.move = "left"
		}
	}
	this.moveRight = function() {
		if (this.x < Map.width && !this.isMoving) {
			this.initMove(1, 0)
			this.frameLine = 1;
			this.move = "right"
		}
	}
	this.moveUp = function() {
		if (this.y > 0 && !this.isMoving)
			this.initMove(0, -1)	
			this.frameLine = 3;
			this.move = "up"
	}
	this.moveDown = function() {
		if (this.y < Map.height && !this.isMoving) {
			this.initMove(0, 1)
			this.frameLine = 0;
			this.move = "down"
		}
	}
}

function everyinterval(n) {
	if ((Darkworld.frameNo / n) % 1 == 0) {return true;}
	return false;
}


