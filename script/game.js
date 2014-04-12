var canvasElement = document.getElementById('game');
var canvas = canvasElement.getContext('2d');

canvas.imageSmoothingEnabled = false;
canvas.mozImageSmoothingEnabled = false;
canvas.webkitImageSmoothingEnabled = false;

var lastTime = new Date();

var clearCanvas = function() {
	// canvas.clearRect(0, 0, canvasElement.width, canvasElement.height);
	canvasElement.width = canvasElement.width;
}

var showFPS = function(time) {
	var FPS = Math.round(1000 / time);
	canvas.fillStyle = "#444";
	canvas.font = "bold 18px sans-serif";
	canvas.fillText(FPS, canvasElement.width - 40, canvasElement.height - 20);
}

// main drawing loop
var redraw = function(timestamp) {
	// before starting to draw, always clean the canvas first
	clearCanvas();

	canvas.fillStyle = "#fff";
	canvas.fillRect(0, 0, canvasElement.width, canvasElement.height);
	canvas.closePath();


	// compute elapsed time
	var currentTime = timestamp;
	if (!currentTime)
		currentTime = new Date();

	var elapsedTime = currentTime - lastTime;


	updateScore(elapsedTime);
	updateProgrammer(elapsedTime);
	drawCoffeeMachine(elapsedTime);
	drawState();

	// paint highscore
	
	// paint

	// draw FPS
	showFPS(elapsedTime);

	lastTime = currentTime;
}

var startDrawCycle = function() {
	var animFrame = window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		null;

	var recursiveAnim = function(timestamp) {
		redraw(timestamp);
		animFrame(recursiveAnim);
	}

	animFrame(recursiveAnim);
}



// load images 
function loadImages(sources, callback) {
  var images = {};
  var loadedImages = 0;
  var numImages = 0;
  // get num of sources
  for(var src in sources) {
    numImages++;
  }
  for(var src in sources) {
    images[src] = new Image();
    images[src].onload = function() {
      if(++loadedImages >= numImages) {
        callback(images);
      }
    };
    images[src].src = sources[src];
  }
}

var images = {}
var sources = {
  coffeemachine: '/assets/coffeemachine.png',
};




// ------------ actual game state variables ----------

 
function CoffeeMachine(max_coffee, start_level){
	this.fillLevel = start_level;
	this.maxLevel = max_coffee;

	// per second decline
	this.declineRate = max_coffee/20;

	this.decreaseLevel = function(amount){
		this.fillLevel = this.fillLevel - amount;
		if(this.fillLevel < 0 ){
			// game over
			this.fillLevel = 0;
		}
	};

	this.increaseLevel = function(amount){
		this.fillLevel = this.fillLevel + amount; 
		if(this.fillLevel >= this.maxLevel){
			this.fillLevel = this.maxLevel;
		}
	}
}

function Programmer(){
	this.productivity = 0;
	this.amountOfTimeInMode = 0;
	// lines per second increase if productivity is HIGH, decrease if its LOW
	this.linesPerSecond = 1;
}


function updateProgrammer(elapsedTime){
	if(coffeeMachine.fillLevel/coffeeMachine.maxLevel > 0.8 ){
		// this is kinda like a multiplicator
		if(programmer.productivity === productivity.HIGH){
			programmer.amountOfTimeInMode = programmer.amountOfTimeInMode + elapsedTime;
		} else {
			programmer.amountOfTimeInMode = 0;
		}
		programmer.productivity = productivity.HIGH;
		programmer.linesPerSecond = programmer.linesPerSecond + 1*programmer.amountOfTimeInMode/1000*elapsedTime/1000;
		// high productivity
		console.log('high prod');
	} else if(coffeeMachine.fillLevel/coffeeMachine.maxLevel < 0.2 ){

		if(programmer.productivity === productivity.LOW){
			programmer.amountOfTimeInMode = programmer.amountOfTimeInMode + elapsedTime;
		} else {
			programmer.amountOfTimeInMode = 0;
		}
		programmer.productivity = productivity.LOW;
		if(programmer.linesPerSecond>0.2){
			programmer.linesPerSecond = programmer.linesPerSecond - 1*programmer.amountOfTimeInMode/1000*elapsedTime/1000;
		} else {
			programmer.linesPerSecond = 0.2;
		}


		// low productivity
		console.log('low prod');
	} else {
		programmer.productivity = productivity.MEDIUM;
		// medium productivity
		if(programmer.linesPerSecond>1){ 
			 programmer.linesPerSecond = programmer.linesPerSecond - (((programmer.linesPerSecond-1)/10)*elapsedTime)/1000;
		} else {
			programmer.linesPerSecond = 1;
		}
	}
}

var productivity = {
	LOW: -1,
	MEDIUM: 0,
	HIGH: 1
}

function drawState(){
	canvas.fillStyle = "#444";
	canvas.font = "bold 18px sans-serif";
	canvas.fillText('Programmed: ' + Math.round(gamestate.score) + 'LOC and writing with ' + Math.round(100*programmer.linesPerSecond)/100 + 'LOC/s', 10, 20);
}

function updateScore(elapsedTime){
	if(gamestate.started)
		gamestate.score = programmer.linesPerSecond * (elapsedTime/1000) + gamestate.score;
}

function drawCoffeeMachine(elapsedTime) {
	// autodecline
	if(gamestate.started){
		coffeeMachine.decreaseLevel(elapsedTime*coffeeMachine.declineRate/1000);
	}

// canvas.fillRect(canvasElement.width/2-86+250, canvasElement.height/2+110;

	canvas.fillStyle = '#bfecdf';

	// canvas.fillStyle = '#1f1f2d';
	canvas.fillRect(canvasElement.width/2+100, 0, 400, canvasElement.height);

	canvas.fillStyle = '#6d1121';
	// canvas.fillRect(canvasElement.width/2-100, canvasElement.height/2+100, 100, -200*(coffeeMachine.fillLevel/coffeeMachine.maxLevel));
	canvas.fillRect(canvasElement.width/2-86+260, canvasElement.height/2+110, 95, -80*(coffeeMachine.fillLevel/coffeeMachine.maxLevel));
	canvas.closePath();

	canvas.drawImage(images.coffeemachine, canvasElement.width/2-100+260, canvasElement.height/2-100,132, 254);

	canvas.fillStyle = '#d4c3b7';
	canvas.fillRect(canvasElement.width/2+100, 404, 400, canvasElement.height);


}

var coffeeMachine = new CoffeeMachine(1000,500);
var programmer = new Programmer();

var gamestate = {
	score: 0,
	started: false
}

function init(){

	loadImages(sources, function(imgs){
		images = imgs;

		// buttons mockup
		$('.positive').click(function(){
			coffeeMachine.increaseLevel(50);
			gamestate.started = true;
		});
		$('.negative').click(function(){
			coffeeMachine.decreaseLevel(50);
			gamestate.started = true;
		});


		startDrawCycle();
	});
}

// start game...
init();