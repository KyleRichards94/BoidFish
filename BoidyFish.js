class Wave {
  constructor(x, y){
    this.position = createVector(x,y);
    this.size = random(1,10);
    this.divisor = 2;
    this.stroke = 0.3;
    this.R = 10;
    this.B = 200;
    this.G = 15;
  }
  hit = function(){
    this.Draw();
    this.Update();
  }
  Draw = function(){
    push();
    noFill();
    stroke(this.R,this.G,this.B);
    strokeWeight(this.stroke);
    ellipse(this.position.x, this.position.y, this.size, this.size);
    pop();
  }
  Update = function(){
    this.R += 35; 
    this.B += 45; 
    this.G += 40;
    this.size += 0.2*this.size;
  }
}

class Fish {
  ///////////////////////////////////////////////////////
 //               /////FISH CONSTRUCTOR///// 
///////////////////////////////////////////////////////
//fish constructor, will be constructed with x and y as args. 
constructor( x, y, c){
  this.acceleration = createVector(0,0);
  this.x = x;
  this.y = y;
  this.position = createVector(x, y);                               //upon construction they will need a position on screen.
  this.direction = random(sin(2));                             // they will begin in a random direction. at arandom angle.
  this.velocity = createVector(cos(this.direction), sin(this.direction));  // the velocity vector can be assigned along that angle.

  this.Desdistance = 10.0;                                     //schooling and running behavior
  this.closeness = 15.0;

  this.MaxSpeed = 4.4;
  this.MaxForce = 3.0;

  this.colour = c;
}

  ///////////////////////////////////////////////////////
 //               /////SWIM///// 
///////////////////////////////////////////////////////

swim = function(){
  this.edges();
  this.update();
  this.Display();
}
  ///////////////////////////////////////////////////////
 //               /////UPDATE///// 
///////////////////////////////////////////////////////

update = function(){
  this.velocity.add(this.acceleration);
  this.velocity.limit(this.MaxSpeed);  //velocity is limited byMaxSpeed
  this.position.add(this.velocity);    //position moves along the velocity vector
  this.acceleration.mult(0);     //each frame acceleration is ammended to 0.
  let vel_magnitude = abs(this.velocity.x) + abs(this.velocity.y); // the magnitude of a vector is calculated as (absolute values X + Y)      
  let twitch_speed = this.MaxSpeed / 2; //how often will the fish twitch. 
  this.Twitch(vel_magnitude, twitch_speed);   
  this.velocity.mult(0.8);          //how thick is the water.
}

  /////////////////////////////////////////////////////
 //               /////TWITCH///// 
///////////////////////////////////////////////////////

Twitch = function(vel_magnitude, twitch_speed){
   if(vel_magnitude < twitch_speed){
    this.direction += random(radians(-20), radians(20));    //change angle by a mximum of 15degreese.
    this.paddle(this.direction);
  }
}

  ///////////////////////////////////////////////////////
 //               /////DISPLAY / DRAW ///// 
///////////////////////////////////////////////////////
Display = function() {
  //draws the shape in the direction of velocity 
  let Dir = this.velocity.heading()+radians(180);
  //begin drawing shape. 
  fill(this.colour*0.7,this.colour*0.5,this.colour); //colour
  noStroke();//line colour
  push(); //remembers a current coorderate system in a stack. 
  translate(this.position.x, this.position.y);//centers the drawing about the fish postion.
  rotate(Dir); // rotated to the same direction as the velocity vector.
  beginShape();
  vertex(12,-3);
  vertex(6,3);
  vertex(0,0);
  vertex(6,-3);
  vertex(12,3);
  endShape();
  pop();
}

  ///////////////////////////////////////////////////////
 //               /////PADDLE///// 
///////////////////////////////////////////////////////

paddle(degrees){    
  p5.Vector.mult(this.velocity,2);
  this.velocity.x += cos(degrees);
  this.velocity.y += sin(degrees);
}
  ///////////////////////////////////////////////////////
 //              /////MOVE FISH///// 
///////////////////////////////////////////////////////
moveFish = function(force){
  this.acceleration.add(force);
}
//function edges keeps all fish on the screen by translocating their
// x position to the other side of the screen.
//or y position to the other height of the screen.
 edges = function() {
  if(this.position.x < -3){this.position.x = width+3; }
  if(this.position.x > width + 3){ this.position.x = -3}
  if(this.position.y < -10){this.position.y += 6;this.direction = this.direction ^-1;this.velocity.rotate(PI);this.velocity.mult(3); }
  if(this.position.y > height+10){this.position.y -= 6; this.velocity.rotate(PI);this.velocity.mult(3);}
}

  //////////////////////////////////////////////////////
 //               /////Seperation///// 
///////////////////////////////////////////////////////
// Rule of vector seperation. If two points are too CLOSE. Subtract their position vectors. 
// the vector suptraction will result in a vector that moves perpendicular to the colision. 
// make both points velicities ADD the this steering direction and away they go.
//////////////////////////////////////////////////////
seperate = function(fish){
 
  let steerDirection = createVector(0,0);     //steer will be the normlized difference between two close fish. 
  let distance = p5.Vector.dist(this.position, fish.position);
  if((distance > 0) && (distance < this.Desdistance)){   //the difference between the two fish is found. 
      let diff = p5.Vector.sub(this.position, fish.position); // Subtract their velocities.
      steerDirection.add(diff);
  }
  return steerDirection;
}
  //////////////////////////////////////////////////////
 //               /////SCHOOLING///// 
///////////////////////////////////////////////////////
// schooling. will take a fish a as argument and if they are close but not too close. 
// their movement velocities will be added. making a vector that normalizes their path. 
// the fish can then have their velocities normalized with the new path. 
////////////////////////////////////////////////////////
schooling = function(fish = []){
  let path = createVector(0,0);   
  let distance = p5.Vector.dist(this.position, fish.position);   //distance between two fish is first found
  if( (distance < this.closeness)&& (distance > this.Desdistance) ){  //if the fish are within a buffer between desired and closeness. 
    let close = p5.Vector.add(this.velocity, fish.velocity); // add their velocities
    path.add(close);
  }
  path.mult(0.05);   // artibrary clamp
  return path;
}  
}


let num_fish = 150;
let fishes = [];
let waves = [];
let num_waves = 2;
let wave_size = 200;
let count = 0;
let mouse = false;


function setup() {
  var canvas = createCanvas(400, 400);
  for(let i = 0; i <num_fish; i++){
    fishes.push(new Fish(width/2, height/2, i*3));
  }
  for(let i = 0; i < num_waves; i++){
    waves.push(new Wave(0,0));
  }
}
let frameTrack = 0;

function draw() {
  background(0,140,250);
  
  splash();
  Swim(fishes);
}

splash = function(){
  for(let i = 0; i < waves.length; i++){
    waves[i].hit();
    if(waves[i].size >= wave_size){
      waves[i].size = 0;
   }
  }
  //waves array
  if(count > num_waves-1){
        count = 0;
      }
  if(mouse == true){
    waves[count] =  new Wave(mouseX, mouseY);
  }
  count++;
    
}

Swim = function(fish = []){
  for(let i = 0; i< fish.length; i++){
    fish[i].swim();
    let seperation = createVector();
    let closeness = createVector();
    let finalDirection = createVector();

    for(let j = 0; j< fish.length; j++){
      seperation = fish[i].seperate(fish[j]);
      closeness = fish[i].schooling(fish[j]);
      flee(fish[j]);
      finalDirection = closeness.add(seperation);

      finalDirection.normalize();
      fish[i].moveFish(finalDirection);
    }
  }
}

mousePressed = function(){
  mouse = true;
}
mouseReleased = function(){
  mouse = false;
}
flee = function(fish){
  
  if(mouse == true){
    push();

      translate(width/2, height/2);
        if(dist(fish.position.x, fish.position.y, mouseX, mouseY) < 50){ 
            let mouseZ = createVector((mouseX-width/2) , (mouseY-height/2));
            fish.velocity.sub(mouseZ).normalize();
          }
    pop();
    }
}


  
