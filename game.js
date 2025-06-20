const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game settings
const paddleWidth = 15;
const paddleHeight = 100;
const ballRadius = 12;
const playerX = 20;
const aiX = canvas.width - playerX - paddleWidth;

// Paddle objects
const player = {
    x: playerX,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: '#4CAF50'
};

const ai = {
    x: aiX,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: '#E91E63',
    speed: 4
};

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballRadius,
    speed: 6,
    velocityX: 6 * (Math.random() > 0.5 ? 1 : -1),
    velocityY: 6 * (Math.random() > 0.5 ? 1 : -1),
    color: '#FFC107'
};

function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

function drawNet() {
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([8, 16]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Net
    drawNet();
    // Paddles and Ball
    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = ball.speed * (Math.random() > 0.5 ? 1 : -1);
    ball.velocityY = ball.speed * (Math.random() > 0.5 ? 1 : -1);
}

function update() {
    // Move Ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Wall collision (top/bottom)
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.velocityY *= -1;
    }
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.velocityY *= -1;
    }

    // Paddle collision (player)
    if (ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height) {
        ball.x = player.x + player.width + ball.radius; // prevent sticking
        ball.velocityX *= -1;
        // Add a little randomness to ball's direction
        let collidePoint = ball.y - (player.y + player.height / 2);
        collidePoint = collidePoint / (player.height / 2);
        let angleRad = collidePoint * (Math.PI / 4); // Max 45deg
        let direction = 1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
    }

    // Paddle collision (AI)
    if (ball.x + ball.radius > ai.x &&
        ball.y > ai.y &&
        ball.y < ai.y + ai.height) {
        ball.x = ai.x - ball.radius; // prevent sticking
        ball.velocityX *= -1;
        let collidePoint = ball.y - (ai.y + ai.height / 2);
        collidePoint = collidePoint / (ai.height / 2);
        let angleRad = collidePoint * (Math.PI / 4);
        let direction = -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);
    }

    // Point scored (left or right wall)
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        resetBall();
    }

    // AI paddle movement (simple tracking)
    let aiCenter = ai.y + ai.height / 2;
    if (ball.y < aiCenter - 20) {
        ai.y -= ai.speed;
    } else if (ball.y > aiCenter + 20) {
        ai.y += ai.speed;
    }
    // Prevent AI paddle from going out of bounds
    ai.y = Math.max(Math.min(ai.y, canvas.height - ai.height), 0);
}

// Control player's paddle with mouse
canvas.addEventListener('mousemove', function (event) {
    const rect = canvas.getBoundingClientRect();
    const mouseY = event.clientY - rect.top;
    player.y = mouseY - player.height / 2;
    // Prevent paddle from going out of bounds
    player.y = Math.max(Math.min(player.y, canvas.height - player.height), 0);
});

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();