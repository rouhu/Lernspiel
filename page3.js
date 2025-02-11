const wordAudio = {
  'SCHWEIN': 'Schwein',
  'PFERD': 'Pferd',
  'SCHAF': 'Schaf',
  'KUH': 'Kuh',
  'ENTE': 'Ente',
  'HUHN': 'Huhn',
  'HUND': 'Hund',
  'KATZE': 'Katze',
  'MAUS': 'Maus'
};

const crosswordData = {
  size: { rows: 9, cols: 10 },
  words: [
    // From Excel layout:
    //   S   P F E R D
    // S C H W E I N
    //   H U H N   T
    // K A T Z E   E
    // A F   N   K U H
    // T     T   M A U S
    // Z     E     N
    // E           D

    // Horizontal words (1-6)
    { word: 'PFERD', startRow: 0, startCol: 4, direction: 'horizontal', number: 1 },
    { word: 'SCHWEIN', startRow: 1, startCol: 0, direction: 'horizontal', number: 2 },
    { word: 'HUHN', startRow: 2, startCol: 1, direction: 'horizontal', number: 3 },
    { word: 'KATZE', startRow: 3, startCol: 0, direction: 'horizontal', number: 4 },
    { word: 'KUH', startRow: 4, startCol: 6, direction: 'horizontal', number: 5 },
    { word: 'MAUS', startRow: 5, startCol: 6, direction: 'horizontal', number: 6 },

    // Vertical words (7-9)
    { word: 'SCHAF', startRow: 0, startCol: 1, direction: 'vertical', number: 7 },
    { word: 'ENTE', startRow: 0, startCol: 6, direction: 'vertical', number: 8 },
    { word: 'HUND', startRow: 4, startCol: 8, direction: 'vertical', number: 9 }
  ]
};

let currentSpeech = null;

function createCrossword() {
  const crossword = document.getElementById('crossword');
  crossword.innerHTML = '';
  const { rows, cols } = crosswordData.size;

  // Create grid cells
  const grid = Array(rows).fill().map(() => Array(cols).fill(null));

  // First pass: Mark cells and store letter information
  crosswordData.words.forEach(({ word, startRow, startCol, direction, number }) => {
    for (let i = 0; i < word.length; i++) {
      const row = direction === 'horizontal' ? startRow : startRow + i;
      const col = direction === 'horizontal' ? startCol + i : startCol;

      if (!grid[row][col]) {
        grid[row][col] = {
          letter: word[i],
          isStart: false,
          words: []
        };
      }
      
      // Set isStart and number if this is the start of a word
      if (i === 0) {
        grid[row][col].isStart = number;
      }
      
      grid[row][col].words.push({ word, direction, position: i });
    }
  });

  // Create DOM elements
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      
      if (grid[row][col]) {
        cell.className = 'cell active';
        
        // Add number if this cell is the start of any word
        if (grid[row][col].isStart) {
          const numberSpan = document.createElement('span');
          numberSpan.className = 'number';
          numberSpan.textContent = grid[row][col].isStart;
          cell.appendChild(numberSpan);
        }
        
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 1;
        input.dataset.row = row;
        input.dataset.col = col;
        input.dataset.letter = grid[row][col].letter;
        input.dataset.words = JSON.stringify(grid[row][col].words);
        
        cell.appendChild(input);
      } else {
        cell.className = 'cell inactive';
      }
      
      crossword.appendChild(cell);
    }
  }
}

function createClues() {
  const horizontalClues = crosswordData.words
    .filter(w => w.direction === 'horizontal')
    .map(w => `<div class="clue">
      ${w.number}. <span class="emoji" onmouseover="playWord('${w.word}')">${getEmoji(w.word)}</span> 
      (${w.word.length} Buchstaben)
    </div>`).join('');

  const verticalClues = crosswordData.words
    .filter(w => w.direction === 'vertical')
    .map(w => `<div class="clue">
      ${w.number}. <span class="emoji" onmouseover="playWord('${w.word}')">${getEmoji(w.word)}</span> 
      (${w.word.length} Buchstaben)
    </div>`).join('');

  document.querySelector('.clues').innerHTML = `
    <div class="horizontal">
      <h3>Horizontal ➡️</h3>
      ${horizontalClues}
    </div>
    <div class="vertical">
      <h3>Vertikal ⬇️</h3>
      ${verticalClues}
    </div>
  `;
}

function getEmoji(word) {
  const emojis = {
    'SCHWEIN': '🐷',
    'PFERD': '🐴',
    'SCHAF': '🐑',
    'KUH': '🐮',
    'ENTE': '🦆',
    'HUHN': '🐔',
    'HUND': '🐶',
    'KATZE': '🐱',
    'MAUS': '🐭'
  };
  return emojis[word] || '❓';
}

function addInputListeners() {
  const inputs = document.querySelectorAll('.cell input');
  inputs.forEach(input => {
    input.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase();
      if (e.target.value) {
        const nextInput = findNextInput(e.target);
        if (nextInput) nextInput.focus();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value) {
        e.preventDefault();
        const prevInput = findPrevInput(e.target);
        if (prevInput) {
          prevInput.focus();
          prevInput.value = '';
        }
      }
    });

    // Add touch event handling for mobile
    input.addEventListener('focus', function() {
      this.select();
    });
  });
}

function findNextInput(currentInput) {
  const allInputs = Array.from(document.querySelectorAll('.cell input'));
  const currentIndex = allInputs.indexOf(currentInput);
  return allInputs[currentIndex + 1] || null;
}

function findPrevInput(currentInput) {
  const allInputs = Array.from(document.querySelectorAll('.cell input'));
  const currentIndex = allInputs.indexOf(currentInput);
  return allInputs[currentIndex - 1] || null;
}

function playWord(word) {
  if (currentSpeech) {
    window.speechSynthesis.cancel();
  }
  currentSpeech = new SpeechSynthesisUtterance(wordAudio[word]);
  currentSpeech.lang = 'de-DE';
  currentSpeech.rate = 0.8;
  window.speechSynthesis.speak(currentSpeech);
}

function checkCrossword() {
  const inputs = document.querySelectorAll('.cell input');
  let allCorrect = true;
  let hasInput = false;

  inputs.forEach(input => {
    const cell = input.parentElement;
    cell.classList.remove('correct', 'incorrect');
    
    if (input.value) {
      hasInput = true;
      if (input.value.toUpperCase() === input.dataset.letter) {
        cell.classList.add('correct');
      } else {
        cell.classList.add('incorrect');
        allCorrect = false;
      }
    }
  });

  if (hasInput && allCorrect) {
    const utterance = new SpeechSynthesisUtterance('Sehr gut! Alles Richtig!');
    utterance.lang = 'de-DE';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }
}

function resetCrossword() {
  const inputs = document.querySelectorAll('.cell input');
  inputs.forEach(input => {
    input.value = '';
    input.parentElement.classList.remove('correct', 'incorrect');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  createCrossword();
  createClues();
  addInputListeners();
});
