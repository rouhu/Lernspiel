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

class BubbleShooter {
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
    this.targetWord = this.getRandomAnimalWord();
    this.bubble = null;
    this.arrowAngle = 0;
    this.arrowSpeed = Math.PI / 36;
    this.arrowLength = 80;
    this.gameOver = false;
    this.lettersFound = Array(this.targetWord.replace(/\s/g, '').length).fill(false);
    this.startX = this.canvas.width / 2;
    this.startY = this.canvas.height - 24;
    this.particles = [];
    this.confetti = [];
    this.celebrating = false;

    this.animalEmojis = {
      'Das Schaf': '🐑',
      'Die Kuh': '🐮',
      'Das Schwein': '🐷',
      'Das Pferd': '🐴',
      'Das Huhn': '🐔',
      'Die Ente': '🦆',
      'Die Katze': '🐱',
      'Der Hund': '🐶',
      'Die Maus': '🐭'
    };

    this.moveArrow = this.moveArrow.bind(this);
    this.shootBubble = this.shootBubble.bind(this);
    this.draw = this.draw.bind(this);
    this.update = this.update.bind(this);
    
    this.setupControls();
    this.reset();
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

  getRandomAnimalWord() {
    const words = ['Das Schaf', 'Die Kuh', 'Das Schwein', 'Das Pferd', 'Das Huhn', 'Die Ente', 'Die Katze', 'Der Hund', 'Die Maus'];
    return words[Math.floor(Math.random() * words.length)];
  }

  reset() {
    this.particles.forEach(p => p.remove());
    this.confetti.forEach(c => c.remove());
    this.particles = [];
    this.confetti = [];
    this.celebrating = false;

    this.gameOver = false;
    this.targetWord = this.getRandomAnimalWord();
    this.lettersFound = Array(this.targetWord.replace(/\s/g, '').length).fill(false);
    document.getElementById('targetEmoji').textContent = this.animalEmojis[this.targetWord];
    this.bubble = this.createBubble();
    this.arrowAngle = 0;
    this.draw();
  }

  createBubble() {
    const allLetters = this.targetWord.split(' ').join('').split('');
    const availableLetters = allLetters.filter((_, index) => !this.lettersFound[index]);
    
    if (availableLetters.length === 0) {
      const utterance = new SpeechSynthesisUtterance('Sehr gut! Du hast gewonnen!');
      utterance.lang = 'de-DE';
      window.speechSynthesis.speak(utterance);
      this.gameOver = true;
      return null;
    }
    
    const randomLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
    
    return {
      letter: randomLetter,
      x: this.startX,
      y: this.startY,
      radius: 16,
      speed: 4,
      dx: 0,
      dy: 0,
      flying: false
    };
  }

  setupControls() {
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const shootBtn = document.getElementById('shootBtn');
    const resetBtn = document.getElementById('resetBtn');

    if (leftBtn) leftBtn.addEventListener('click', () => this.moveArrow(-1));
    if (rightBtn) rightBtn.addEventListener('click', () => this.moveArrow(1));
    if (shootBtn) shootBtn.addEventListener('click', this.shootBubble);
    if (resetBtn) resetBtn.addEventListener('click', () => this.reset());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.moveArrow(-1);
      if (e.key === 'ArrowRight') this.moveArrow(1);
      if (e.key === ' ') this.shootBubble();
    });
  }

  moveArrow(direction) {
    if (this.bubble && !this.bubble.flying && !this.gameOver) {
      this.arrowAngle += direction * this.arrowSpeed;
      this.arrowAngle = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, this.arrowAngle));
      this.draw();
    }
  }

  shootBubble() {
    if (this.bubble && !this.bubble.flying && !this.gameOver) {
      this.bubble.flying = true;
      this.bubble.dx = Math.sin(this.arrowAngle) * this.bubble.speed;
      this.bubble.dy = -Math.cos(this.arrowAngle) * this.bubble.speed;
      requestAnimationFrame(this.update);
    }
  }

  getLetterPosition(index) {
    const words = this.targetWord.split(' ');
    const firstWordLength = words[0].length;
    const totalLetters = this.targetWord.replace(/\s/g, '').length;
    const totalWidth = totalLetters * this.tileSize + (words.length > 1 ? this.tileSize : 0);
    const startX = (this.canvas.width - totalWidth) / 2;

    if (index < firstWordLength) {
      return { x: startX + (index * this.tileSize), isFirstWord: true };
    } else {
      return { 
        x: startX + (firstWordLength * this.tileSize) + this.tileSize + ((index - firstWordLength) * this.tileSize),
        isFirstWord: false 
      };
    }
  }

  draw() {
    this.ctx.fillStyle = '#9EAD86';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    const targetLetters = this.targetWord.replace(/\s/g, '').split('');
    targetLetters.forEach((letter, index) => {
      const letterPos = this.getLetterPosition(index);
      const x = letterPos.x;
      const y = 10;

      this.ctx.fillStyle = this.lettersFound[index] ? '#4CAF50' : '#f5f5f5';
      this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
      this.ctx.strokeStyle = '#333';
      this.ctx.strokeRect(x, y, this.tileSize, this.tileSize);
      if (this.lettersFound[index]) {
        this.ctx.fillStyle = '#333';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(letter, x + this.tileSize / 2, y + this.tileSize / 1.5);
      }
    });
    
    if (this.bubble && !this.gameOver) {
      this.ctx.fillStyle = '#494F42';
      this.ctx.beginPath();
      this.ctx.arc(this.bubble.x, this.bubble.y, this.bubble.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.fillStyle = 'white';
      this.ctx.font = '20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.bubble.letter, this.bubble.x, this.bubble.y + 7);
    }
    
    if (this.bubble && !this.bubble.flying && !this.gameOver) {
      this.ctx.strokeStyle = '#333';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY - this.bubble.radius * 2);
      this.ctx.lineTo(
        this.startX + Math.sin(this.arrowAngle) * this.arrowLength,
        this.startY - this.bubble.radius * 2 - Math.cos(this.arrowAngle) * this.arrowLength
      );
      this.ctx.stroke();
    }
    
    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = 'white';
      this.ctx.font = '40px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        this.lettersFound.every(found => found) ? 'Gewonnen!' : 'Game Over!',
        this.canvas.width / 2,
        this.canvas.height / 2
      );
    }
  }

  update() {
    if (!this.bubble || this.gameOver) {
      this.draw();
      return;
    }

    if (this.bubble.flying) {
      this.bubble.x += this.bubble.dx;
      this.bubble.y += this.bubble.dy;

      if (this.bubble.x - this.bubble.radius < 0 || this.bubble.x + this.bubble.radius > this.canvas.width) {
        this.bubble.dx *= -1;
      }
      if (this.bubble.y - this.bubble.radius < 0) {
        this.bubble.dy *= -1;
      }

      if (this.bubble.y > this.canvas.height) {
        this.bubble = this.createBubble();
        if (this.bubble) {
          requestAnimationFrame(this.update);
        }
        return;
      }

      const targetLetters = this.targetWord.replace(/\s/g, '').split('');
      let collisionOccurred = false;

      targetLetters.forEach((letter, index) => {
        if (collisionOccurred) return;

        const letterPos = this.getLetterPosition(index);
        const x = letterPos.x;
        const y = 10;

        if (
          this.bubble.x > x && this.bubble.x < x + this.tileSize &&
          this.bubble.y > y && this.bubble.y < y + this.tileSize
        ) {
          collisionOccurred = true;
          if (this.bubble.letter === letter && !this.lettersFound[index]) {
            this.lettersFound[index] = true;
            
            const utterance = new SpeechSynthesisUtterance(this.bubble.letter);
            utterance.lang = 'de-DE';
            window.speechSynthesis.speak(utterance);

            if (this.lettersFound.every(found => found)) {
              this.gameOver = true;
              const winUtterance = new SpeechSynthesisUtterance('Sehr gut! Du hast gewonnen!');
              winUtterance.lang = 'de-DE';
              window.speechSynthesis.speak(winUtterance);
              this.bubble = null;
              this.draw();
              this.celebrate();
              return;
            }
          } else {
            const utterance = new SpeechSynthesisUtterance('Das war der falsche Buchstabe!');
            utterance.lang = 'de-DE';
            window.speechSynthesis.speak(utterance);
          }
          
          this.bubble = this.createBubble();
          if (this.bubble) {
            requestAnimationFrame(this.update);
          }
          return;
        }
      });

      if (!collisionOccurred && !this.gameOver) {
        requestAnimationFrame(this.update);
      }
    }
    
    this.draw();
  }
}

function speakTargetWord() {
  if (window.game) {
    const utterance = new SpeechSynthesisUtterance(window.game.targetWord);
    utterance.lang = 'de-DE';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.game = new BubbleShooter();
});
