const cvs = document.getElementById("myCanvas");
const ctx = cvs.getContext("2d");

let frames = 0;

const sprite = new Image();
sprite.src = "img/sprite.png";

document.addEventListener("click", function(evt) {
    switch (gameState.current){
        case gameState.getReady:
            gameState.current = gameState.game;
            break;
        case gameState.game:
            bird.flap();
            break;
        case gameState.over:
            gameState.current = gameState.getReady
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

    dx: 2,

    draw: function() {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, 
            this.x, this.y, this.w, this.h);
        
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, 
            this.x + this.w, this.y, this.w, this.h);
        },

    update: function() {
        if(gameState.current == gameState.game) {
            this.x = (this.x -this.dx) % (this.w/2);
        }
    }
}

const bird = {
    animation: [{sX: 276, sY: 112}, {sX: 276, sY: 139},
        {sX: 276, sY: 164}, {sX: 276, sY: 139}],

        x: 50,
        y: 150,
        w: 34,
        h: 26,

        frame: 0,

        speed: 0,
        gravity: 0.25,
        jump: 4.5,



        draw: function() {
            let bird = this.animation[this.frame];
            ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, 
                this.x - this.w/2, this.y - this.h/2, this.w, this.h);
        },

        flap: function() {
            this.speed = -this.jump;
        },

        update: function() {
            this.period = 5;
            this.frame += frames % this.period == 0 ? 1 : 0;
            this.frame = this.frame % this.animation.length;

            if(gameState.current == gameState.getReady){
                this.y = 150;
            }
            else if (gameState.current == gameState.game) {
                this.speed += this.gravity;
                this.y += this.speed;
            }

            if(this.y + this.h/2 >= cvs.height - foreground.h){
                this.y = cvs.height - foreground.h - this.h/2;
                if(gameState.current == gameState.game){
                    gameState.current = gameState.over;
                    speed = 0;
                }  
            }
        }
}

const pipes = {
    bottom: {
        sX: 502,
        sY: 0,
    },

    top: {
        sX: 553,
        sY: 0,
    },

    gap: 85,
    w  : 53,
    h  : 400,
    dx : 2,

    position: [],
    maxYPos : -150,

    draw: function() {
        for(let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;

            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, 
                this.w, this.h, p.x, bottomYPos, this.w, this.h);
                
            ctx.drawImage(sprite, this.top.sX, this.top.sY, 
                this.w, this.h, p.x, topYPos, this.w, this.h);  
        }
    },

    update: function() {
        if(gameState.current !== gameState.game) return;

        if(frames%50 == 0) {
            this.position.push({
                x: cvs.width,
                y: this.maxYPos * (Math.random() + 1)
            });
        }
        for(let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            p.x -= this.dx;
            
            if(p.x + this.w <= 0) {
                this.position.shift();
            }
        }
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
    foreground.draw();
    bird.draw();
    readyMessage.draw();
    loseMessage.draw();
    pipes.draw();
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