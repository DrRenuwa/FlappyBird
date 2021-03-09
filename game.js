const cvs = document.getElementById("myCanvas");
const ctx = cvs.getContext("2d");

let frames = 0;     //GAME COUNTER
const DEGREE = Math.PI/180;    //USED FOR BIRD ROTATION ANIMATION

const sprite = new Image();
sprite.src = "img/sprite.png";

const startButton = {
    x: 120,
    y: 263,
    w: 83,
    h: 29
}

//READS THE USER'S CLICK FOR DIFFERENT ACTIONS DEPENDIUNG ON THE GAME STATE
document.addEventListener("click", function(evt) {
    switch (gameState.current) {
        case gameState.getReady:
            gameState.current = gameState.game;
            break;
        case gameState.game:
            bird.flap();
            break;
        case gameState.over:
            let rect = cvs.getBoundingClientRect();  //TRACKS THE POSITION OF CANVAS WHEN SCROLLING
            let x = evt.clientX - rect.left;
            let y = evt.clientY - rect.top;
                //GAME RESETS ONLY IF USER CLICKS INSIDE START BUTTON
            if(x >= startButton.x && x <= startButton.x + startButton.w &&
                y >= startButton.y && y <= startButton.y + startButton.h) {
                    bird.speedReset();
                    pipes.reset();
                    gameState.current = gameState.getReady
                }
            break;
    }
});

const background = {
    sX: 0,
    sY: 0,
    w : 275,
    h : 226,
    x : 0,
    y : cvs.height - 226,

    draw: function() {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, 
            this.x, this.y, this.w, this.h);

        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, 
            this.x + this.w, this.y, this.w, this.h);
    }
}

const foreground = {
    sX: 276,
    sY: 0,
    w : 224,
    h : 112,
    x : 0,
    y : cvs.height - 112,

    dx: 2,  //SPEED THAT FOREGROUND IS SHIFTING TO THE LEFT

    draw: function() {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, 
            this.x, this.y, this.w, this.h);
        
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, 
            this.x + this.w, this.y, this.w, this.h);
        },

    update: function() {
        if(gameState.current == gameState.game) {      //FOREGROUND ONLY MOVES DURING GAME STATE
            this.x = (this.x -this.dx) % (this.w/2);    //MODULO RESETS THE X POSITION BACK TO 0
        }
    }
}

const bird = {
    animation: [{sX: 276, sY: 112}, {sX: 276, sY: 139}, 
        {sX: 276, sY: 164}, {sX: 276, sY: 139}],    //ARRAY OF THE FOUR BIRD FLAPPING ANIMATION FRAMES

    x: 50,
    y: 150,
    w: 34,
    h: 26,

    radius: 12, //RADIUS THAT THE BIRD CAN COLLIDE WTIH PIPES

    frame: 0,

    speed: 0,
    gravity: 0.25,  //SPEED THAT BIRD IS ACCELERATING DOWNWARDS
    jump: 4.5,      //DISTANCE THAT THE BIRD MOVES UPWARDS WHEN USER CLICKS
    rotation: 0,

    draw: function() {
        let bird = this.animation[this.frame];

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, 
            -this.w/2, -this.h/2, this.w, this.h);
        ctx.restore();
    },

    flap: function() {
        this.speed = -this.jump;
    },

    update: function() {
        //THE BIRD FLAPS SLOWLY AT READY SCREEN, AND FASTER WHEN GAME STARTS
        this.period = gameState.current == gameState.getReady ? 8 : 4;  
        //BIRD ANIMATION FRAME INCREMENTED BY 1 EVERY PERIOD
        this.frame += frames % this.period == 0 ? 1 : 0;
        //RESET ANIMATION EVERY TIME THE FRAME COUNT REACHES 4 WHICH IS THE LENGTH OF THE ANIMATION ARRAY
        this.frame = this.frame % this.animation.length;

        if(gameState.current == gameState.getReady){
            this.y = 150;   // DEFAULT BIRD POSITION
            this.rotation = 0 * DEGREE;
        }
        else {
            this.speed += this.gravity; //BIRD SPEED INCREASES DUE TO GRAVITY
            this.y += this.speed;       //BIRD Y POSITION GOES DOWN DUE TO SPEED

            // GAME OVER IF BIRD TOUCHES THE GROUND
            if(this.y + this.h/2 >= cvs.height - foreground.h){
                this.y = cvs.height - foreground.h - this.h/2;
                if(gameState.current == gameState.game){
                    gameState.current = gameState.over;
                }  
            }
            
            // NORMAL BIRD ROTATION ANIMATION
            if(this.speed >= this.jump) {
                this.rotation = 70 * DEGREE;
                this.frame = 1;
            }
            else {
                this.rotation = -25 * DEGREE;
            }
            
            /*   SMOOTH BIRD ANIMATION
            if(this.y != cvs.height - foreground.h - this.h/2) {
                this.rotation = (this.speed*  10) * DEGREE;
            }
            else{
                this.rotation = 70 * DEGREE;
                this.frame = 1;
            }
            */ 
        }
    },

    speedReset: function() {
        this.speed = 0;
    }
}

const pipes = {
    top: {
        sX: 553,
        sY: 0,
    },

    bottom: {
        sX: 502,
        sY: 0,
    },

    gap: 85,    //DISTANCE BETWEEN TOP AND BOTTOM PIPE
    w  : 53,
    h  : 400,
    dx : 2,     //SPEED THAT PIPES ARE SHIFTING TO THE LEFT

    position: [],   //STORES THE POSITION OF THE PIPES
    maxYPos : -150,

    draw: function() {
        for(let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;
                
            ctx.drawImage(sprite, this.top.sX, this.top.sY, 
                this.w, this.h, p.x, topYPos, this.w, this.h);  

            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, 
                this.w, this.h, p.x, bottomYPos, this.w, this.h);
        }
    },

    update: function() {
        if(gameState.current != gameState.game) return;    //NO NEW PIPES WHEN NOT GAME STATE

        if(frames%50 == 0) {        //NEW PIPES EVERY 50 FRAMES
            this.position.push({    //ADD PIPES TO POSITION ARRAY
                x: cvs.width,
                y: this.maxYPos * (Math.random() + 1)   //GENERATES PIPE AT RANDOM Y POSITIONS BETWEEN -150 AND -300
            });
        }
        for(let i = 0; i < this.position.length; i++) {     
            let p = this.position[i];

            p.x -= this.dx;
            let bottomPipeYPos = p.y + this.h + this.gap;

            if(bird.x + bird.radius) {

            }
            
            if(p.x + this.w <= 0) {     //REMOVE PIPES OUT OF THE CANVAS
                this.position.shift();
            }
        }
    },

    reset: function() {
        this.position = [];
    }
}

const readyMessage = {
    sX: 0,
    sY: 228,
    w : 173,
    h : 152,
    x : cvs.width/2 - 173/2,
    y : 80,

    draw: function() {
        if(gameState.current == gameState.getReady){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, 
                this.x, this.y, this.w, this.h);
            } 
        }
}

const loseMessage = {
    sX: 175,
    sY: 228,
    w : 225,
    h : 202,
    x : cvs.width/2 - 225/2,
    y : 90,

    draw: function() {
        if(gameState.current == gameState.over){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, 
                this.x, this.y, this.w, this.h);
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, 
            this.x, this.y, this.w, this.h);
        }
    }
}

const gameState = {
    current: 0,
    getReady: 0,
    game: 1,
    over: 2
}

function draw() {
    ctx.fillStyle = "skyblue";
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    background.draw();
    pipes.draw();
    foreground.draw();
    bird.draw();
    readyMessage.draw();
    loseMessage.draw();
}

function update() {
    bird.update();
    foreground.update();
    pipes.update();
}

function startGame() {
    update();
    draw();
    frames += 0.5;

    requestAnimationFrame(startGame);
}

startGame();