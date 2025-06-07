window.onload = () => {
    const menu = document.getElementById('menu');
    const playButton = document.getElementById('playButton');
    const gameContainer = document.getElementById('gameContainer');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Configurações da tela
    canvas.width = 800;
    canvas.height = 450;

    // Objeto bola
    const ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 10,
        speedX: 6,
        speedY: 6,
        maxSpeed: 12,
    };

    // Raquetes player e IA (posição e dimensões)
    const paddleWidth = 16;
    const paddleHeight = 90;

    const player = {
        x: 50,
        y: canvas.height / 2,
        speed: 0,
        maxSpeed: 9,
        height: paddleHeight,
        width: paddleWidth,
    };

    const ai = {
        x: canvas.width - 50,
        y: canvas.height / 2,
        speed: 5,
        height: paddleHeight,
        width: paddleWidth,
    };

    // Pontuação
    let playerScore = 0;
    let aiScore = 0;

    // Controle teclado
    function keyDownHandler(e) {
        if (e.key === 'ArrowUp' || e.key === 'w') player.speed = -player.maxSpeed;
        if (e.key === 'ArrowDown' || e.key === 's') player.speed = player.maxSpeed;
    }

    function keyUpHandler(e) {
        if (e.key === 'ArrowUp' || e.key === 'w') player.speed = 0;
        if (e.key === 'ArrowDown' || e.key === 's') player.speed = 0;
    }

    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);

    // Desenha a mesa (quadra)
    function drawTable() {
        const w = canvas.width;
        const h = canvas.height;

        // Fundo gradiente verde escuro
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, "#226644");
        gradient.addColorStop(1, "#134422");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Bordas da mesa
        ctx.lineWidth = 15;
        ctx.strokeStyle = "#fff";
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 15;
        ctx.strokeRect(10, 10, w - 20, h - 20);
        ctx.shadowBlur = 0;

        // Linhas internas da mesa
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#fff";

        // Linha central tracejada vertical
        ctx.setLineDash([10, 15]);
        ctx.beginPath();
        ctx.moveTo(w / 2, 10);
        ctx.lineTo(w / 2, h - 10);
        ctx.stroke();
        ctx.setLineDash([]);

        // Linhas laterais internas
        ctx.beginPath();
        ctx.moveTo(30, 10);
        ctx.lineTo(30, h - 10);
        ctx.moveTo(w - 30, 10);
        ctx.lineTo(w - 30, h - 10);
        ctx.stroke();

        // Linhas horizontais perto das bordas (áreas de jogo)
        ctx.beginPath();
        ctx.moveTo(10, 60);
        ctx.lineTo(w - 10, 60);
        ctx.moveTo(10, h - 60);
        ctx.lineTo(w - 10, h - 60);
        ctx.stroke();

        // Rede estilizada
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        const netWidth = 6;
        for (let y = 10; y < h - 10; y += 20) {
            ctx.fillRect(w / 2 - netWidth / 2, y, netWidth, 10);
        }
    }

    // Desenha a bola
    function drawBall() {
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        // Sombra para profundidade
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    // Desenha raquete realista (player ou ai)
    function drawRealisticPaddle(x, y, isPlayer) {
        ctx.save();
        ctx.translate(x, y);

        // Cabo da raquete (madeira)
        const handleWidth = 16;
        const handleHeight = 50;
        const handleRadius = 8;

        const handleGradient = ctx.createLinearGradient(0, 0, 0, handleHeight);
        handleGradient.addColorStop(0, "#a0522d");
        handleGradient.addColorStop(1, "#5a2a0c");
        ctx.fillStyle = handleGradient;

        ctx.beginPath();
        ctx.moveTo(handleWidth / 2, 0);
        ctx.lineTo(-handleWidth / 2, 0);
        ctx.lineTo(-handleWidth / 2, handleHeight - handleRadius);
        ctx.quadraticCurveTo(0, handleHeight, handleWidth / 2, handleHeight - handleRadius);
        ctx.closePath();
        ctx.fill();

        // Corpo da raquete (borracha)
        const paddleWidth = 70;
        const paddleHeight = 90;

        ctx.translate(0, -paddleHeight);

        const rubberGradient = ctx.createRadialGradient(0, 0, paddleWidth / 4, 0, 0, paddleWidth / 2);
        if (isPlayer) {
            rubberGradient.addColorStop(0, "#d32f2f");  // vermelho borracha
            rubberGradient.addColorStop(1, "#8b0000");
        } else {
            rubberGradient.addColorStop(0, "#1976d2");  // azul borracha
            rubberGradient.addColorStop(1, "#0b3d91");
        }
        ctx.fillStyle = rubberGradient;

        ctx.beginPath();
        ctx.ellipse(0, 0, paddleWidth / 2, paddleHeight / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Textura da borracha (linhas horizontais finas)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        for (let i = -paddleHeight / 2; i < paddleHeight / 2; i += 4) {
            ctx.beginPath();
            ctx.moveTo(-paddleWidth / 2, i);
            ctx.lineTo(paddleWidth / 2, i);
            ctx.stroke();
        }

        // Pequeno brilho para realçar o relevo
        const shineGradient = ctx.createRadialGradient(-15, -10, 10, -10, -10, 30);
        shineGradient.addColorStop(0, "rgba(255,255,255,0.3)");
        shineGradient.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = shineGradient;
        ctx.beginPath();
        ctx.ellipse(-15, -10, 25, 40, -0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // Atualiza a posição da bola
    function moveBall() {
        ball.x += ball.speedX;
        ball.y += ball.speedY;

        // Colisão com topo e fundo
        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
            ball.speedY = -ball.speedY;
            playSound('wall');
        }

        // Saiu pela direita (ponto do player)
        if (ball.x + ball.radius > canvas.width) {
            playerScore++;
            resetBall();
            playSound('score');
        }

        // Saiu pela esquerda (ponto do ai)
        if (ball.x - ball.radius < 0) {
            aiScore++;
            resetBall();
            playSound('score');
        }

        // Colisão com raquete player
        if (
            ball.x - ball.radius < player.x + player.width / 2 &&
            ball.y > player.y - player.height / 2 &&
            ball.y < player.y + player.height / 2
        ) {
            ball.speedX = -ball.speedX * 1.05;
            // Ajusta velocidade Y dependendo do local do impacto
            let deltaY = ball.y - player.y;
            ball.speedY = deltaY * 0.35;
            if (Math.abs(ball.speedX) > ball.maxSpeed) ball.speedX = ball.speedX > 0 ? ball.maxSpeed : -ball.maxSpeed;
            playSound('hit');
        }

        // Colisão com raquete ai
        if (
            ball.x + ball.radius > ai.x - ai.width / 2 &&
            ball.y > ai.y - ai.height / 2 &&
            ball.y < ai.y + ai.height / 2
        ) {
            ball.speedX = -ball.speedX * 1.05;
            let deltaY = ball.y - ai.y;
            ball.speedY = deltaY * 0.35;
            if (Math.abs(ball.speedX) > ball.maxSpeed) ball.speedX = ball.speedX > 0 ? ball.maxSpeed : -ball.maxSpeed;
            playSound('hit');
        }
    }

    // Reseta a bola no centro com direção aleatória
    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.speedX = (Math.random() > 0.5 ? 1 : -1) * 6;
        ball.speedY = 6 * (Math.random() * 2 - 1);
    }

    // Atualiza a posição da raquete do jogador
    function movePlayer() {
        player.y += player.speed;
        // Limita dentro da mesa
        if (player.y - player.height / 2 < 10) player.y = 10 + player.height / 2;
        if (player.y + player.height / 2 > canvas.height - 10) player.y = canvas.height - 10 - player.height / 2;
    }

    // IA simples que segue a bola suavemente
    function moveAI() {
        let targetY = ball.y;
        if (ai.y < targetY - 15) {
            ai.y += ai.speed;
        } else if (ai.y > targetY + 15) {
            ai.y -= ai.speed;
        }

        // Limita dentro da mesa
        if (ai.y - ai.height / 2 < 10) ai.y = 10 + ai.height / 2;
        if (ai.y + ai.height / 2 > canvas.height - 10) ai.y = canvas.height - 10 - ai.height / 2;
    }

    // Desenha os placares
    function drawScore() {
        ctx.fillStyle = "#fff";
        ctx.font = "26px Segoe UI, Tahoma, Geneva, Verdana, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`Jogador: ${playerScore}`, 30, 40);
        ctx.textAlign = "right";
        ctx.fillText(`Computador: ${aiScore}`, canvas.width - 30, 40);
    }

    // Som simples usando Web Audio API
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();

    function playSound(type) {
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        if (type === 'hit') {
            oscillator.frequency.value = 700;
            gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
            oscillator.type = 'square';
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.1);
        } else if (type === 'score') {
            oscillator.frequency.value = 400;
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            oscillator.type = 'sawtooth';
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.3);
        } else if (type === 'wall') {
            oscillator.frequency.value = 300;
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            oscillator.type = 'triangle';
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.05);
        }
    }

    // Loop principal do jogo
    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawTable();
        drawRealisticPaddle(player.x, player.y, true);
        drawRealisticPaddle(ai.x, ai.y, false);
        drawBall();
        drawScore();

        moveBall();
        movePlayer();
        moveAI();

        requestAnimationFrame(gameLoop);
    }

    // Inicialização: botão jogar
    playButton.addEventListener('click', () => {
        menu.style.display = 'none';
        gameContainer.style.display = 'block';
        resetBall();
        gameLoop();
    });
};
