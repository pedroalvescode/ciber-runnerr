/**
 * Ciber-Runner: Core Engine
 * Versão Final: Auras + Mensagens Educativas Completas + Grid no Como Jogar
 */

// --- Sistema Audio Web API Sintetizado ---
class SoundController {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
    }

    playTone(freq, type, duration, vol = 0.1) {
        if (!this.enabled || !this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {}
    }

    playCollect() {
        this.playTone(587.33, 'sine', 0.1, 0.15);
        setTimeout(() => this.playTone(880, 'sine', 0.2, 0.15), 80);
    }

    playHit() {
        this.playTone(150, 'sawtooth', 0.2, 0.3);
        setTimeout(() => this.playTone(90, 'sawtooth', 0.2, 0.3), 100);
    }

    playShield() {
        this.playTone(400, 'triangle', 0.15, 0.2);
        setTimeout(() => this.playTone(800, 'triangle', 0.25, 0.2), 100);
    }

    playGameOver() {
        this.playTone(300, 'sawtooth', 0.3, 0.3);
        setTimeout(() => this.playTone(200, 'sawtooth', 0.3, 0.3), 200);
        setTimeout(() => this.playTone(100, 'sawtooth', 0.5, 0.3), 400);
    }
}

const sounds = new SoundController();

// --- Gerenciador Global de Assets ---
const images = {};
const imageSources = {
    mascot: '/static/images/mascot.png',
    virus: '/static/images/virus.png',
    phishing: '/static/images/phishing.png',
    lock_open: '/static/images/lock-open.png',
    lock_closed: '/static/images/lock-closed.png',
    shield_2fa: '/static/images/shield-2fa.png',
    antivirus: '/static/images/antivirus.png'
};

function loadGameAssets(callback) {
    let loadedCount = 0;
    const keys = Object.keys(imageSources);
    const total = keys.length;

    keys.forEach(key => {
        const img = new Image();
        img.src = imageSources[key];
        img.onload = () => {
            img.isLoaded = true;
            images[key] = img;
            loadedCount++;
            if (loadedCount === total && callback) callback();
        };
        img.onerror = () => {
            img.isLoaded = false;
            images[key] = img;
            loadedCount++;
            if (loadedCount === total && callback) callback();
        };
    });
}

// --- Gerador Visual ---
class AssetGenerator {
    static drawMascot(ctx, x, y, size, frame = 0, isShielded = false, isHit = false) {
        ctx.save();
        ctx.translate(x, y);

        const floatOffset = Math.sin(frame * 0.15) * 4;
        ctx.translate(0, floatOffset);

        if (isShielded) {
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.75, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 243, 255, 0.25)';
            ctx.fill();
            ctx.strokeStyle = '#00f3ff';
            ctx.lineWidth = 3;
            ctx.setLineDash([6, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        const img = images.mascot;
        if (img && img.isLoaded) {
            ctx.drawImage(img, -size / 2, -size / 2, size, size);
        } else {
            const bodyColor = isHit ? '#ff3366' : '#0d6efd';
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.45, 0, Math.PI * 2);
            ctx.fillStyle = bodyColor;
            ctx.fill();
            ctx.strokeStyle = '#00f3ff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.restore();
    }

    static drawObstacle(ctx, x, y, size, type) {
        ctx.save();
        ctx.translate(x, y);

        // AURA VERMELHA PULSANTE (Ameaças)
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.55, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 0, 85, 0.2)';
        ctx.fill();
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;

        const img = images[type];
        if (img && img.isLoaded) {
            ctx.drawImage(img, -size / 2, -size / 2, size, size);
        } else {
            ctx.fillStyle = type === 'virus' ? '#ff0055' : type === 'phishing' ? '#ff9900' : '#ff3333';
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    static drawPowerUp(ctx, x, y, size, type, frame = 0) {
        ctx.save();
        ctx.translate(x, y);

        // AURA VERDE/CIANO PULSANTE (Power-ups)
        const pulse = Math.sin(frame * 0.1) * 5;
        const auraRadius = (size * 0.55) + pulse;

        ctx.beginPath();
        ctx.arc(0, 0, auraRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 255, 204, 0.25)';
        ctx.fill();
        ctx.strokeStyle = '#00ffcc';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00ffcc';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;

        const img = images[type];
        if (img && img.isLoaded) {
            ctx.drawImage(img, -size / 2, -size / 2, size, size);
        } else {
            ctx.fillStyle = '#00ffcc';
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

// --- Classe Principal do Jogo ---
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.laneX = [220, 400, 580];
        this.currentLane = 1;
        this.playerX = this.laneX[1];
        this.playerY = 480;
        this.playerSize = 55;

        this.isRunning = false;
        this.isPausedForEdu = false;
        this.score = 0;
        this.distance = 0;
        this.combo = 1;
        this.lives = 3;
        this.speed = 5;
        this.frame = 0;
        this.highScore = 0;

        this.shieldActive = false;
        this.shieldTimer = 0;
        this.maxShieldTime = 300;

        this.obstacles = [];
        this.powerups = [];
        this.particles = [];
        this.bgLines = [];

        this.shownTips = new Set();

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initBackground();
        this.fetchHighScore();
        this.gameLoop();
    }

    initBackground() {
        this.bgLines = [];
        for (let i = 0; i < 25; i++) {
            this.bgLines.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                length: Math.random() * 80 + 20,
                speed: Math.random() * 3 + 2
            });
        }
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            if (!this.isRunning || this.isPausedForEdu) return;

            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.moveLane(-1);
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.moveLane(1);
            }
        });

        document.getElementById('btn-touch-left').addEventListener('click', () => this.moveLane(-1));
        document.getElementById('btn-touch-right').addEventListener('click', () => this.moveLane(1));

        document.getElementById('btn-play').addEventListener('click', () => {
            sounds.init();
            this.startGame();
        });

        document.getElementById('btn-restart').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('btn-main-menu').addEventListener('click', () => {
            this.showScreen('main-menu');
        });

        document.getElementById('btn-how').addEventListener('click', () => {
            document.getElementById('modal-how').classList.remove('hidden');
        });

        document.getElementById('btn-close-how').addEventListener('click', () => {
            document.getElementById('modal-how').classList.add('hidden');
        });

        document.getElementById('btn-about').addEventListener('click', () => {
            document.getElementById('modal-about').classList.remove('hidden');
        });

        document.getElementById('btn-close-about').addEventListener('click', () => {
            document.getElementById('modal-about').classList.add('hidden');
        });

        document.getElementById('btn-close-edu').addEventListener('click', () => {
            document.getElementById('educational-popup').classList.add('hidden');
            this.isPausedForEdu = false;
        });

        const btnSound = document.getElementById('btn-sound');
        btnSound.addEventListener('click', () => {
            sounds.enabled = !sounds.enabled;
            btnSound.textContent = sounds.enabled ? '🔊 Som: ON' : '🔇 Som: OFF';
        });
    }

    async fetchHighScore() {
        try {
            const res = await fetch('/api/highscore');
            const data = await res.json();
            this.highScore = data.highscore || 0;
            const localHigh = localStorage.getItem('ciber_runner_highscore') || 0;
            if (localHigh > this.highScore) this.highScore = parseInt(localHigh);
        } catch (e) {
            this.highScore = parseInt(localStorage.getItem('ciber_runner_highscore') || 0);
        }
    }

    async saveHighScore() {
        localStorage.setItem('ciber_runner_highscore', this.highScore);
        try {
            await fetch('/api/highscore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ score: this.highScore })
            });
        } catch (e) {}
    }

    moveLane(dir) {
        this.currentLane = Math.max(0, Math.min(2, this.currentLane + dir));
    }

    startGame() {
        this.score = 0;
        this.distance = 0;
        this.combo = 1;
        this.lives = 3;
        this.speed = 6;
        this.currentLane = 1;
        this.playerX = this.laneX[1];
        this.obstacles = [];
        this.powerups = [];
        this.particles = [];
        this.shieldActive = false;
        this.shieldTimer = 0;
        this.shownTips.clear();

        this.isRunning = true;
        this.isPausedForEdu = false;

        this.showScreen('hud');
        this.updateHUD();
    }

    showScreen(screenId) {
        const screens = ['main-menu', 'hud', 'game-over-screen', 'modal-how', 'modal-about', 'educational-popup'];
        screens.forEach(s => {
            const el = document.getElementById(s);
            if (el) el.classList.add('hidden');
        });

        if (screenId === 'main-menu') {
            document.getElementById('main-menu').classList.remove('hidden');
            this.isRunning = false;
        } else if (screenId === 'hud') {
            document.getElementById('hud').classList.remove('hidden');
        } else if (screenId === 'game-over-screen') {
            document.getElementById('game-over-screen').classList.remove('hidden');
        }
    }

    triggerEduTip(key, title, text) {
        if (this.shownTips.has(key)) return;
        this.shownTips.add(key);
        this.isPausedForEdu = true;
        document.getElementById('edu-title').textContent = title;
        document.getElementById('edu-text').textContent = text;
        document.getElementById('educational-popup').classList.remove('hidden');
    }

    spawnEntities() {
        if (this.frame % Math.max(25, Math.floor(70 - this.speed * 2)) === 0) {
            const lane = Math.floor(Math.random() * 3);
            const types = ['virus', 'phishing', 'lock_open'];
            const type = types[Math.floor(Math.random() * types.length)];
            this.obstacles.push({
                x: this.laneX[lane],
                y: -50,
                lane: lane,
                type: type,
                size: 45
            });
        }

        if (this.frame % 160 === 0 && Math.random() > 0.3) {
            const lane = Math.floor(Math.random() * 3);
            const types = ['shield_2fa', 'antivirus', 'lock_closed'];
            const type = types[Math.floor(Math.random() * types.length)];
            this.powerups.push({
                x: this.laneX[lane],
                y: -50,
                lane: lane,
                type: type,
                size: 40
            });
        }
    }

    update() {
        if (!this.isRunning || this.isPausedForEdu) return;

        this.frame++;

        const targetX = this.laneX[this.currentLane];
        this.playerX += (targetX - this.playerX) * 0.25;

        this.distance += Math.floor(this.speed / 2);
        this.score += 1 * this.combo;

        if (this.frame % 300 === 0 && this.speed < 16) {
            this.speed += 0.5;
        }

        if (this.shieldActive) {
            this.shieldTimer--;
            if (this.shieldTimer <= 0) {
                this.shieldActive = false;
            }
        }

        this.bgLines.forEach(line => {
            line.y += line.speed + this.speed;
            if (line.y > this.canvas.height) {
                line.y = -line.length;
                line.x = Math.random() * this.canvas.width;
            }
        });

        this.spawnEntities();

        // Obstáculos
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.y += this.speed;

            const distY = Math.abs(obs.y - this.playerY);
            const distX = Math.abs(obs.x - this.playerX);

            if (distY < 35 && distX < 30) {
                this.handleObstacleCollision(obs);
                this.obstacles.splice(i, 1);
                continue;
            }

            if (obs.y > this.canvas.height + 50) {
                this.obstacles.splice(i, 1);
            }
        }

        // Power-ups
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const pw = this.powerups[i];
            pw.y += this.speed;

            const distY = Math.abs(pw.y - this.playerY);
            const distX = Math.abs(pw.x - this.playerX);

            if (distY < 35 && distX < 30) {
                this.handlePowerUpCollect(pw);
                this.powerups.splice(i, 1);
                continue;
            }

            if (pw.y > this.canvas.height + 50) {
                this.powerups.splice(i, 1);
            }
        }

        // Partículas
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.03;
            if (p.alpha <= 0) this.particles.splice(i, 1);
        }

        this.updateHUD();
    }

    handleObstacleCollision(obs) {
        if (this.shieldActive) {
            this.shieldActive = false;
            sounds.playShield();
            this.createExplosion(obs.x, obs.y, '#00f3ff');
            return;
        }

        // COMBO REINICIA IMEDIATAMENTE AO PERDER VIDA
        this.lives--;
        this.combo = 1; 
        sounds.playHit();
        this.createExplosion(obs.x, obs.y, '#ff0055');

        // MENSAGENS EDUCATIVAS PARA AMEAÇAS
        if (obs.type === 'phishing') {
            this.triggerEduTip('phishing', '🎣 AMEAÇA: PHISHING!', 'Phishing tenta roubar senhas e dados bancários com e-mails e links falsos. Fique atento aos remetentes!');
        } else if (obs.type === 'virus') {
            this.triggerEduTip('virus', '🦠 AMEAÇA: VÍRUS/MALWARE!', 'Programas maliciosos infectam sistemas por downloads suspeitos. Nunca baixe arquivos de fontes desconhecidas!');
        } else if (obs.type === 'lock_open') {
            this.triggerEduTip('lock_open', '🔓 AMEAÇA: SENHA FRACA!', 'Senhas simples ou repetidas facilitam invasões. Use senhas fortes com números e símbolos!');
        }

        if (this.lives <= 0) {
            this.gameOver();
        }
    }

    handlePowerUpCollect(pw) {
        sounds.playCollect();
        this.createExplosion(pw.x, pw.y, '#00ffcc');

        // INCREMENTA O COMBO AO COLETAR ITENS BONS
        this.combo = Math.min(10, this.combo + 1);

        // MENSAGENS EDUCATIVAS PARA POWER-UPS
        if (pw.type === 'shield_2fa') {
            this.shieldActive = true;
            this.shieldTimer = this.maxShieldTime;
            this.score += 200 * this.combo;
            this.triggerEduTip('shield_2fa', '🛡️ DEFESA: AUTENTICAÇÃO 2FA!', 'A verificação em duas etapas adiciona uma camada extra de proteção. Mesmo que descubram sua senha, o acesso é bloqueado!');
        } else if (pw.type === 'antivirus') {
            this.obstacles = [];
            this.score += 300 * this.combo;
            this.triggerEduTip('antivirus', '🧹 DEFESA: ANTIVÍRUS ATIVO!', 'Manter seu antivírus e o sistema operacional atualizados elimina as ameaças antes que façam estragos!');
        } else if (pw.type === 'lock_closed') {
            this.score += 150 * this.combo;
            this.triggerEduTip('lock_closed', '🔒 DEFESA: CRIPTOGRAFIA!', 'A criptografia protege suas mensagens e senhas contra interceptações durante o tráfego na rede!');
        }
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                color: color,
                alpha: 1
            });
        }
    }

    gameOver() {
        this.isRunning = false;
        sounds.playGameOver();

        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }

        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-distance').textContent = `${this.distance}m`;
        document.getElementById('high-score').textContent = this.highScore;

        this.showScreen('game-over-screen');
    }

    updateHUD() {
        let hearts = '';
        for (let i = 0; i < 3; i++) {
            hearts += i < this.lives ? '❤️ ' : '💔 ';
        }
        document.getElementById('lives-display').textContent = hearts;
        document.getElementById('score-display').textContent = `PONTOS: ${this.score}`;
        document.getElementById('distance-display').textContent = `${this.distance}m`;
        document.getElementById('combo-display').textContent = `COMBO: x${this.combo}`;

        const shieldBar = document.getElementById('shield-bar-container');
        const shieldInner = document.getElementById('shield-bar-inner');
        if (this.shieldActive) {
            shieldBar.classList.remove('hidden');
            const pct = (this.shieldTimer / this.maxShieldTime) * 100;
            shieldInner.style.width = `${pct}%`;
        } else {
            shieldBar.classList.add('hidden');
        }
    }

    render() {
        this.ctx.imageSmoothingEnabled = false;

        this.ctx.fillStyle = '#030814';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.2)';
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        this.ctx.moveTo(310, 0); this.ctx.lineTo(310, this.canvas.height);
        this.ctx.moveTo(490, 0); this.ctx.lineTo(490, this.canvas.height);
        this.ctx.stroke();

        this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.4)';
        this.bgLines.forEach(line => {
            this.ctx.beginPath();
            this.ctx.moveTo(line.x, line.y);
            this.ctx.lineTo(line.x, line.y + line.length);
            this.ctx.stroke();
        });

        // Obstáculos
        this.obstacles.forEach(obs => {
            AssetGenerator.drawObstacle(this.ctx, obs.x, obs.y, obs.size, obs.type);
        });

        // Power-ups
        this.powerups.forEach(pw => {
            AssetGenerator.drawPowerUp(this.ctx, pw.x, pw.y, pw.size, pw.type, this.frame);
        });

        // Mascote
        AssetGenerator.drawMascot(
            this.ctx,
            this.playerX,
            this.playerY,
            this.playerSize,
            this.frame,
            this.shieldActive,
            false
        );

        // Partículas
        this.particles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillRect(p.x, p.y, 4, 4);
        });
        this.ctx.globalAlpha = 1.0;
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => {
    loadGameAssets(() => {
        new Game();
    });
});