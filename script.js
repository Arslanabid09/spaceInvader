let board = document.getElementById('canvas');
let ctx = board.getContext('2d');
let width = 500;
let height = 500;
let playerImg = new Image();
playerImg.src = './img/ship.png';

// Aliens
let alienImg = new Image();
alienImg.src = './img/alien-cyan.png';
let aliens = [];
let aliensCol = 5;
let alienRow = 3;
let gameOver = false;
let score = 0; // Initialize score

let player = {
    x: 200,
    y: 450,
    width: 90,
    height: 40,
    img: playerImg,
    draw: function(){
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
};

let bullet = {
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    color: 'white',
    used: false,
    draw: function(){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    move: function(){
        if (this.used) {
            this.y -= 23; // Move the bullet upward

            // If the bullet leaves the canvas, reset its position
            if (this.y + this.height < 0) {
                this.used = false;
            }
        }
    },
    fire: function(){
        if (!this.used) {
            this.x = player.x + player.width / 2 - this.width / 2; 
            // Position bullet at the center of the player
            this.y = player.y; 
            this.used = true;
        }
    }
};

window.onload = () => {
    startGame(); // Start the game when the window loads
};

function startGame() {
    board.width = width;
    board.height = height;
    player.draw();
    createAliens(); // Create aliens when the game starts
    requestAnimationFrame(update);

    document.addEventListener('keydown', MovePlayer);
    document.addEventListener('keyup', Fire);
}

function restartGame() {
    gameOver = false;
    aliens = []; // Clear aliens array
    bullet.used = false; // Reset bullet
    aliensCol = 5; // Reset to initial columns
    alienRow = 3; // Reset to initial rows
    score = 0; // Reset score
    startGame(); // Restart the game
}

function createAliens() {
    let alienWidth = 40;
    let alienHeight = 40;
    let spacing = 10; // Space between aliens
    let startX = 39;
    let startY = 20;

    for (let row = 0; row < alienRow; row++) {
        for (let col = 0; col < aliensCol; col++) {
            let alien = {
                x: startX + (col * (alienWidth + spacing)),
                y: startY + (row * (alienHeight + spacing)),
                width: alienWidth,
                height: alienHeight,
                img: alienImg
            };
            aliens.push(alien);
        }
    }
}

function update(){
    if (gameOver) {
        displayGameOver();
        return; // Stop updating the game if it's over
    }

    requestAnimationFrame(update);
    ctx.clearRect(0, 0, width, height);
    player.draw();

    moveAliens(); // Move all aliens together

    // Draw all aliens and check for bullet collision
    for (let i = 0; i < aliens.length; i++) {
        ctx.drawImage(aliens[i].img, aliens[i].x, aliens[i].y, aliens[i].width, aliens[i].height);
    }

    if (bullet.used) {
        bullet.move();
        bullet.draw();
        checkCollision(); // Check for collision between bullet and aliens
    }

    // Check if all aliens are removed
    if (aliens.length === 0) {
        aliensCol++; // Increase the number of columns
        createAliens(); // Recreate the aliens with an additional column
    }

    checkGameOver(); // Check if the game is over

    // Display the score
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);
}

let alienVelocity = 3;
function moveAliens() {
    // Determine if any alien has hit the edge
    let hitEdge = false;
    for (let i = 0; i < aliens.length; i++) {
        if (aliens[i].x + aliens[i].width >= width || aliens[i].x <= 0) {
            hitEdge = true;
            break;
        }
    }

    // If any alien hit the edge, reverse direction and move them down
    if (hitEdge) {
        alienVelocity = -alienVelocity;
        for (let i = 0; i < aliens.length; i++) {
            aliens[i].y += 20; // Move all aliens down
        }
    }

    // Move all aliens horizontally
    for (let i = 0; i < aliens.length; i++) {
        aliens[i].x += alienVelocity;
    }
}

function checkCollision() {
    for (let i = 0; i < aliens.length; i++) {
        let alien = aliens[i];

        // Check for collision between the bullet and the alien
        if (bullet.x < alien.x + alien.width &&
            bullet.x + bullet.width > alien.x &&
            bullet.y < alien.y + alien.height &&
            bullet.y + bullet.height > alien.y) {
            
            // Collision detected
            aliens.splice(i, 1); // Remove the alien from the array
            bullet.used = false; // Reset the bullet
            score += 10; // Increase score by 10
            break; // Exit the loop as the bullet can only hit one alien
        }
    }
}

function checkGameOver() {
    for (let i = 0; i < aliens.length; i++) {
        if (aliens[i].y + aliens[i].height >= player.y) {
            gameOver = true;
            break;
        }
    }
}

function displayGameOver() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'red';
    ctx.font = '50px Arial';
    ctx.fillText('Game Over', width / 4, height / 2);
    ctx.font = '30px Arial';
    ctx.fillText('Press R to Restart', width / 4, height / 1.5);

    // Add event listener to restart the game
    document.addEventListener('keydown', function(e) {
        if (e.key === 'r' || e.key === 'R') {
            restartGame();
        }
    }, { once: true }); // Ensure the listener is added only once
}

function MovePlayer(e){
    if (gameOver) return; // Prevent player movement after game over
    switch(e.key){
        case 'ArrowLeft':
            player.x -= 25;
            if (player.x < 0) player.x = 0; // Prevent moving out of the left boundary
            break;
        case 'ArrowRight':
            player.x += 25;
            if (player.x + player.width > width) player.x = width - player.width; // Prevent moving out of the right boundary
            break;
    }
}

function Fire(e){
    if (gameOver) return; // Prevent firing after game over
    if (e.keyCode === 32) { // Spacebar
        bullet.fire();
    }
}

// For mobile screens
function MoveLeft(){
    if (gameOver) return;
    player.x -= 10;
    if (player.x < 0) player.x = 0; // Prevent moving out of the left boundary
}

function MoveRight(){
    if (gameOver) return;
    player.x += 10;
    if (player.x + player.width > width) player.x = width - player.width; // Prevent moving out of the right boundary
}

function FireBullet() {
    if (gameOver) return;
    bullet.fire();
}
