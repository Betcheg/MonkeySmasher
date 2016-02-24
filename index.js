$(document).ready(function() {
  if( $("#world").width() > 1000 ) gamestart();
  else {
     $("body").html("Sorry, your screen resolution is too small to play :(");
     $("body").css({backgroundImage: "url('')"});
     // redirect them to "mini" server
   }
});

// Game constants
var POSITION_START = 80; // The player start 80px from the left
var SPEED= 2;
var GRAVITY=4;
var MAX_JUMP= 100;
var POSITION_BLOCKS = 500;
var SPACE_BETWEEN_BLOCKS = 5;
var worldSize = $("#game").width();

// Game var
var nextstep = 0; // the direction for the next game refresh
var velocity = 0; // Whether the monkey go up or down
var position = POSITION_START; // position set to the begining position
var positiony = $("#player").position().top; // Position on the Y axis
var isRunningRight = false;
var isRunningLeft = false;
var keyTaken = false;
var won = false;
var username = $("#username").text().trim();
var usernameSize = $("#username").width();
var jumping=false;
var isStillJumping = false;
var isRoaring = false;
var isGettingRoared = false;
var beginning = Date.now(); //timestamp of the beginning of the game 
var gameOver = false;

//Debug mode ? set to true to show the debug console
var debug = false;

// Grab the graphicals elements
var div = [];
div[0] = $("#firstb"); // First block
div[1] = $("#secondb"); // Second block
div[2] = $("#thirdb"); // Third block

var blocks = []; // Block array
for(var i=0; i<3; i++){ // Let's store our 3 blocks
block = {
  id: i, // not useful in our case
  state: "inactive", // Inactive by default
  pos: 0 // The block Y coordonate
}
blocks.push(block);
}

// Place the graphical elements
//$("body").css({backgroundImage: "url('')" });
div[0].css({ marginLeft: POSITION_BLOCKS });
div[1].css({ marginLeft: div[0].offset().left + div[0].width() + $("#player").width() + SPACE_BETWEEN_BLOCKS });
div[2].css({ marginLeft: div[1].offset().left + div[1].width() + $("#player").width() + SPACE_BETWEEN_BLOCKS });

$(document).keydown(function(e){
  // When a key is pressed

  // *** MONKEY CONTROLS ***
  if(e.keyCode == 39) // When the right key is pressed
  {
    isRunningRight = true;
    $("#player").css({backgroundImage: "url('img/monkey_right.png')"});
    nextstep = SPEED;
    if(debug) $("#debug").append("-> ");
  }

  if(e.keyCode == 37) // When the left key is pressed
  {
    isRunningLeft = true;
    $("#player").css({backgroundImage: "url('img/monkey_left.png')"});
    nextstep = -SPEED; // Go in the opposite direction
    if(debug)   $("#debug").append("<- ");
  }

  if(e.keyCode == 38) // When the upper key is pressed
  {
    if(!jumping){ // Make the monkey jump only if he isn't jumping already
    jumping = true;
    isStillJumping = true;
    velocity = -GRAVITY; // Go up first
    if(debug)   $("#debug").append(" ^ ");
  }
}


// *** BLOCKS CONTROL ***
if(e.keyCode == 65) { // A Key
  if(blocks[0].state == "inactive") blocks[0].state = "falling"; // the block is now falling
  if(debug)  $("#debug").append("<br>A key pressed ");
}
if(e.keyCode == 90) { // Z Key
  if(blocks[1].state == "inactive") blocks[1].state = "falling";
  if(debug)   $("#debug").append("<br>Z key pressed ");
}
if(e.keyCode == 69){ // E Key
  if(blocks[2].state == "inactive") blocks[2].state = "falling";
  if(debug) $("#debug").append("<br>E key pressed");
}
});

$(document).keyup(function(e){ // When a key is released

  // Two var so there is no lag when user input the opposite direction at the same time
  if(e.keyCode == 39) { // Right key
    isRunningRight = false;
    if(!isRunningRight && !isRunningLeft) nextstep = 0;
    else if(isRunningLeft) {
      nextstep = -SPEED; // Go left
      $("#player").css({backgroundImage: "url('img/monkey_left.png')"});
    }
  }

  if(e.keyCode == 37){ // Left key
    isRunningLeft = false;
    if(!isRunningRight && !isRunningLeft) nextstep = 0;
    else if(isRunningRight) { nextstep = SPEED; // Go right
      $("#player").css({backgroundImage: "url('img/monkey_right.png')"});
    }
  }

  if(e.keyCode == 38){ // up key
    isStillJumping = false;
  }
});


// On click event, may not be useful since A, Z, E can be pressed
$("#firstb").click(function() {
  if(blocks[0].state == "inactive") blocks[0].state = "falling";
});
$("#secondb").click(function() {
  if(blocks[1].state == "inactive") blocks[1].state = "falling";
});
$("#thirdb").click(function() {
  if(blocks[2].state == "inactive") blocks[2].state = "falling";
});

function roar() {

}

function gamestart() {

  // Update each element of the game at a 120FPS framerate
  loopPlayer = setInterval(updateJoueur, 1000.0/120.0); // game interface refreshed at 120 fps
  loopBlock = setInterval(updateBlock, 1000.0/120); // game interface refreshed at 120 fps
  loopState = setInterval(checkState, 1000.0/120); // game interface refreshed at 120 fps 
  loopTime = setInterval(isTimeOver, 1000.0); // Check if the time is over
}

function checkState(){
  playerx = $("#player").position().left;
  playery = $("#player").position().top;
  playerwidth = $("#player").width();

  // Check if the player has been crushed by a block
  for(var i=0; i<3; i++){
    var bottombox = div[i].position().top + div[i].height(); // The y value of the block's lower part
    if(playerx+playerwidth > div[i].offset().left && playerx < div[i].offset().left + div[i].width()
    && playery < bottombox) { // If the player is under the block, he is crushed => game over
      position = POSITION_START;
      $("#player").css({ left: POSITION_START });
      keyTaken = false; // The key stay at the same place
    }
  }

  // Check if the player touches the deadly spikes
  if(playerx + playerwidth > $("#deadlyspikes").offset().left){
    position = POSITION_START;
    keyTaken = false;
 }

  // Check if the player has taken the key
  if(playerx+playerwidth > $("#key").offset().left && playerx < $("#key").offset().left + $("#key").width()) {
    keyTaken = true;
  }
}

function updateJoueur(){

  // if the player is inside the map
  if($("#player").position().left - 2 >= 0 && $("#player").position().left + $("#player").width() +2 <  worldSize){
    position += nextstep;
  }

  // if the player is in the far right
  else if($("#player").position().left + $("#player").width() +2 >= worldSize){
    position = worldSize - $("#player").width()  -3; // He can't go any further and stay at the same place
  }

  // else if the player is in the far left
  else {
    position = 2; // He can't go any further and stay at the same place
  }

  if(jumping){
    positiony += velocity; // The position Y depends of the velocity, positive velocity means going up, negative means going down

    if($("#player").position().top + $("#player").height() > $("#game").height() ){
      // If the player is on the floor, he isn't jumping anymore
      velocity = 0;
      if(!isStillJumping) jumping = false;
      positiony = $("#game").height() - $("#player").height();
    }

    else if($("#player").position().top < $("#game").height() - MAX_JUMP +10
    && $("#player").position().top > $("#game").height() - MAX_JUMP) {
      // If the player is in the peak of the jump, his speed decrease just like in real life
      if(velocity >0 ) velocity =  GRAVITY/5;
      else velocity =  -GRAVITY/5;
    }

    else if($("#player").position().top < $("#game").height() - MAX_JUMP) {
      // He then falls full speed
      velocity = GRAVITY;
    }
    else {
      // Going up or down
      if(velocity >0 ) velocity =  GRAVITY;
      else velocity =  -GRAVITY;
    }


    $("#player").css({ top: positiony });
  }

  // Refresh the player position
  $("#player").css({ left: position });

  // Show the key if the player have it
  if(keyTaken) {
    // To his right if he's running right, to his left if he's running left
    if(isRunningRight) $("#key").css({ left: $("#player").position().left + $("#player").width()  });
    else if(isRunningLeft) $("#key").css({ left: $("#player").position().left - $("#key").width()});

    $("#key").css({ top:  positiony - 10});

    // If he's gotten the key inside the house
    if($("#key").position().left <= $("#home").position().left + 60)
    if(!won) {
      alert("WELL PLAYED, YOU'VE WON \n"
      +" // Do something here");
      won = true;
      isRunningLeft = false;
      isRunningRight = false;
      nextstep = 0;
    }
  }

  // Does not show the username if at the end of the world
  if($("#username").offset().left + usernameSize > $("#game").width()){
    $("#username").text("");
  }
  else   {
    $("#username").text(username);
  }

  if($("#key").offset().left + $("#key").width() > $("#game").width()){
    $("#key").css({ left: $("#player").position().left - $("#key").width()});
  }
}


function isTimeOver() {
   
    if(!gameOver && Date.now() - beginning > 30 * 1000)
    {
        alert("Game over"); // Game is over
        gameOver = true;
    }
    else {
        if(!gameOver) $("#time").text(Math.floor( 30-(Date.now() - beginning)/1000.0) + " sec"); // Write the remaining time
    }
    

}

function updateBlock() {

  for (var i = 0; i<3; i++) {
    if(blocks[i].state == "falling"){
      y = div[i].position().top;

      if(y<10) { // The block falls slowly first ...
        blocks[i].pos +=0.2;
        div[i].css({ top: blocks[i].pos });
      }
      else if(blocks[i].pos < $("#game").height() - div[i].height()  ) { // And then goes full speed
        blocks[i].pos +=6;
        div[i].css({ top: blocks[i].pos });
      }
      else { // When the block reaches the floor, he cannot go any further
        blocks[i].state = "onfloor";
      }
    }

    else if(blocks[i].state == "onfloor"){
      // 1 second delay before going up again
      if(i==0) setTimeout(upBlock1, 1000.0)
      if(i==1) setTimeout(upBlock2, 1000.0)
      if(i==2) setTimeout(upBlock3, 1000.0)
      blocks[i].state = "waiting";
    }

    else if(blocks[i].state == "goingup"){
      if(blocks[i].pos <= 0){
        blocks[i].pos = 0;
        blocks[i].state ="inactive";
      }
      else blocks[i].pos -=1; // Raise while not in the celling
      div[i].css({ top: blocks[i].pos });
    }
  }
}

function upBlock1() {
  blocks[0].state = "goingup";
}
function upBlock2() {
  blocks[1].state = "goingup";
}
function upBlock3() {
  blocks[2].state = "goingup";
}
