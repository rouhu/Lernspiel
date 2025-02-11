class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.velocity = {
      x: (Math.random() - 0.5) * 8,
      y: (Math.random() - 0.5) * 8
    };
    this.alpha = 1;
    this.decay = 0.02;
    this.element = document.createElement('div');
    this.element.className = 'particle';
    this.element.style.backgroundColor = color;
    this.element.style.left = this.x + 'px';
    this.element.style.top = this.y + 'px';
    document.querySelector('.container').appendChild(this.element);
  }

  update() {
    this.velocity.y += 0.1;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.alpha -= this.decay;
    
    this.element.style.left = this.x + 'px';
    this.element.style.top = this.y + 'px';
    this.element.style.opacity = this.alpha;
    
    return this.alpha > 0;
  }

  remove() {
    this.element.remove();
  }
}

class Confetti {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    this.velocity = {
      x: (Math.random() - 0.5) * 5,
      y: Math.random() * 3 + 2
    };
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 10;
    this.element = document.createElement('div');
    this.element.className = 'confetti';
    this.element.style.backgroundColor = this.color;
    this.element.style.left = this.x + 'px';
    this.element.style.top = this.y + 'px';
    document.querySelector('.container').appendChild(this.element);
  }

  update() {
    this.velocity.y += 0.1;
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.rotation += this.rotationSpeed;
    
    this.element.style.left = this.x + 'px';
    this.element.style.top = this.y + 'px';
    this.element.style.transform = `rotate(${this.rotation}deg)`;
    
    return this.y < window.innerHeight;
  }

  remove() {
    this.element.remove();
  }
}

class SnakeGame {
  constructor() {
    this.init();
  }

  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.canvas.width = 480;
    this.canvas.height = 480;
    
    this.gridSize = 12;
    this.tileSize = this.canvas.width / this.gridSize;
    this.initialSpeed = 300;
    this.gameStarted = false;
    this.celebrating = false;
    this.particles = [];
    this.confetti = [];
    
    this.animals = {
      '🐷': 'Das Schwein',
      '🐮': 'Die Kuh',
      '🐑': 'Das Schaf',
      '🐴': 'Das Pferd',
      '🐔': 'Das Huhn',
      '🦆': 'Die Ente',
      '🐰': 'Das Kaninchen',
      '🐐': 'Die Ziege',
      '🐶': 'Der Hund',
      '🐱': 'Die Katze',
      '🐭': 'Die Maus'
    };
    
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.gameLoop = this.gameLoop.bind(this);
    
    this.setupControls();
    this.initializeGame();
  }

  celebrate() {
    if (this.celebrating) return;
    this.celebrating = true;

    const createFirework = (x, y) => {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
      for (let i = 0; i < 30; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        this.particles.push(new Particle(x, y, color));
      }
    };

    const createConfetti = () => {
      for (let i = 0; i < 100; i++) {
        this.confetti.push(new Confetti(
          Math.random() * window.innerWidth,
          -20
        ));
      }
    };

    const launchFireworks = () => {
      const container = document.querySelector('.container');
      const rect = container.getBoundingClientRect();
      
      createFirework(rect.width / 3, rect.height / 2);
      createFirework(rect.width / 2, rect.height / 2);
      createFirework(2 * rect.width / 3, rect.height / 2);
    };

    launchFireworks();
    createConfetti();

    const animate = () => {
      if (!this.celebrating) return;

      this.particles = this.particles.filter(particle => {
        const alive = particle.update();
        if (!alive) particle.remove();
        return alive;
      });

      this.confetti = this.confetti.filter(conf => {
        const alive = conf.update();
        if (!alive) conf.remove();
        return alive;
      });

      if (this.particles.length > 0 || this.confetti.length > 0) {
        requestAnimationFrame(animate);
      } else {
        this.celebrating = false;
      }
    };

    animate();
  }

  initializeGame() {
    this.snake = [
      { x: 6, y: 6 },
      { x: 5, y: 6 }
    ];
    this.direction = 'right';
    this.nextDirection = 'right';
    this.score = 0;
    this.gameOver = false;
    this.gameWon = false;
    
    this.foodItems = this.generateFoodItems(4);
    this.targetFood = this.foodItems[Math.floor(Math.random() * this.foodItems.length)];
    
    document.getElementById('score').textContent = this.score;
    document.getElementById('targetEmoji').textContent = this.targetFood.emoji;
    document.getElementById('targetName').textContent = this.animals[this.targetFood.emoji];

    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }

    this.draw();

    const startBtn = document.getElementById('startBtn');
    startBtn.textContent = 'Start';
    startBtn.style.display = 'block';

    this.particles.forEach(p => p.remove());
    this.confetti.forEach(c => c.remove());
    this.particles = [];
    this.confetti = [];
    this.celebrating = false;
  }

  startGame() {
    if (this.gameOver) {
      this.gameStarted = false;
      this.initializeGame();
    }

    if (!this.gameStarted) {
      this.gameStarted = true;
      const startBtn = document.getElementById('startBtn');
      startBtn.textContent = 'Neu starten';
      
      const initialAnnouncement = new SpeechSynthesisUtterance('Finde: ' + this.animals[this.targetFood.emoji]);
      initialAnnouncement.lang = 'de-DE';
      initialAnnouncement.rate = 0.8;
      window.speechSynthesis.speak(initialAnnouncement);

      this.gameInterval = setInterval(this.gameLoop, this.initialSpeed);
    } else {
      this.gameStarted = false;
      this.initializeGame();
      this.startGame();
    }
  }

  generateFoodItems(count) {
    const foodItems = [];
    const animalEmojis = Object.keys(this.animals);
    const usedPositions = new Set();
    const usedEmojis = new Set();

    while (foodItems.length < count) {
      const emoji = animalEmojis[Math.floor(Math.random() * animalEmojis.length)];
      
      if (usedEmojis.has(emoji)) continue;
      
      let x, y;
      let posKey;
      do {
        x = Math.floor(Math.random() * this.gridSize);
        y = Math.floor(Math.random() * this.gridSize);
        posKey = `${x},${y}`;
      } while (
        usedPositions.has(posKey) || 
        this.snake.some(segment => segment.x === x && segment.y === y)
      );

      usedPositions.add(posKey);
      usedEmojis.add(emoji);
      foodItems.push({ x, y, emoji });
    }

    return foodItems;
  }
  
  setupControls() {
    document.addEventListener('keydown', this.handleKeyDown);
    
    const upBtn = document.getElementById('upBtn');
    const downBtn = document.getElementById('downBtn');
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const startBtn = document.getElementById('startBtn');

    if (upBtn) upBtn.addEventListener('click', () => this.setDirection('up'));
    if (downBtn) downBtn.addEventListener('click', () => this.setDirection('down'));
    if (leftBtn) leftBtn.addEventListener('click', () => this.setDirection('left'));
    if (rightBtn) rightBtn.addEventListener('click', () => this.setDirection('right'));
    if (startBtn) startBtn.addEventListener('click', () => this.startGame());
  }
  
  handleKeyDown(e) {
    if (!this.gameStarted) {
      if (e.key === ' ' || e.key === 'Enter') {
        this.startGame();
      }
      return;
    }

    switch(e.key) {
      case 'ArrowUp':
        this.setDirection('up');
        break;
      case 'ArrowDown':
        this.setDirection('down');
        break;
      case 'ArrowLeft':
        this.setDirection('left');
        break;
      case 'ArrowRight':
        this.setDirection('right');
        break;
    }
  }
  
  setDirection(newDirection) {
    if (!this.gameStarted) return;

    const opposites = {
      'up': 'down',
      'down': 'up',
      'left': 'right',
      'right': 'left'
    };
    
    if (opposites[newDirection] !== this.direction) {
      this.nextDirection = newDirection;
    }
  }
  
  moveSnake() {
    const head = { ...this.snake[0] };
    this.direction = this.nextDirection;
    
    switch(this.direction) {
      case 'up': head.y--; break;
      case 'down': head.y++; break;
      case 'left': head.x--; break;
      case 'right': head.x++; break;
    }
    
    if (head.x < 0 || head.x >= this.gridSize || 
        head.y < 0 || head.y >= this.gridSize) {
      this.gameOver = true;
      return;
    }
    
    if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      this.gameOver = true;
      return;
    }
    
    this.snake.unshift(head);
    
    const foodIndex = this.foodItems.findIndex(food => food.x === head.x && food.y === head.y);
    if (foodIndex !== -1) {
      const caughtFood = this.foodItems[foodIndex];
      
      if (caughtFood === this.targetFood) {
        window.speechSynthesis.cancel();

        this.score += 10;
        document.getElementById('score').textContent = this.score;
        
        if (this.score >= 100) {
          this.gameWon = true;
          this.gameOver = true;
          const winUtterance = new SpeechSynthesisUtterance('Sehr gut! Du hast gewonnen!');
          winUtterance.lang = 'de-DE';
          winUtterance.rate = 0.8;
          window.speechSynthesis.speak(winUtterance);
          this.celebrate();
          return;
        }

        this.foodItems = this.generateFoodItems(4);
        this.targetFood = this.foodItems[Math.floor(Math.random() * this.foodItems.length)];
        
        document.getElementById('targetEmoji').textContent = this.targetFood.emoji;
        document.getElementById('targetName').textContent = this.animals[this.targetFood.emoji];

        const nextAnnouncement = new SpeechSynthesisUtterance('Finde: ' + this.animals[this.targetFood.emoji]);
        nextAnnouncement.lang = 'de-DE';
        nextAnnouncement.rate = 0.8;
        window.speechSynthesis.speak(nextAnnouncement);
      } else {
        this.gameOver = true;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance('Das war das falsche Tier!');
        utterance.lang = 'de-DE';
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
      }
    } else {
      this.snake.pop();
    }
  }
  
  draw() {
    this.ctx.fillStyle = '#9EAD86';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.snake.forEach((segment, index) => {
      this.ctx.fillStyle = index === 0 ? '#2c2f28' : '#494F42';
      this.ctx.fillRect(
        segment.x * this.tileSize + 1,
        segment.y * this.tileSize + 1,
        this.tileSize - 2,
        this.tileSize - 2
      );
    });
    
    this.foodItems.forEach(food => {
      this.ctx.font = `${this.tileSize * 0.8}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(
        food.emoji,
        food.x * this.tileSize + this.tileSize / 2,
        food.y * this.tileSize + this.tileSize / 2
      );
    });
    
    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = 'white';
      this.ctx.font = '40px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        this.gameWon ? 'Gewonnen!' : 'Game Over!',
        this.canvas.width / 2,
        this.canvas.height / 2
      );
    }
    
    if (!this.gameStarted && !this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = 'white';
      this.ctx.font = '40px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Drücke Start', this.canvas.width / 2, this.canvas.height / 2);
    }
  }
  
  gameLoop() {
    if (!this.gameOver && this.gameStarted) {
      this.moveSnake();
      this.draw();
    }

    if (this.gameOver) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.game = new SnakeGame();
});
