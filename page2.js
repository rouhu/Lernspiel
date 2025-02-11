const words = {
  barn: {
    german: 'Die Scheune',
    coords: { top: '5%', left: '10%', width: '30%', height: '40%' }
  },
  windmill: {
    german: 'Die Windmühle',
    coords: { top: '5%', right: '5%', width: '15%', height: '25%' }
  },
  tractor: {
    german: 'Der Traktor',
    coords: { top: '30%', right: '20%', width: '25%', height: '25%' }
  },
  hen: {
    german: 'Die Henne',
    coords: { top: '45%', left: '20%', width: '20%', height: '20%' }
  },
  chick: {
    german: 'Das Küken',
    coords: { top: '55%', left: '35%', width: '15%', height: '15%' }
  },
  cat: {
    german: 'Die Katze',
    coords: { bottom: '15%', right: '30%', width: '15%', height: '15%' }
  },
  boot: {
    german: 'Der Stiefel',
    coords: { bottom: '10%', left: '10%', width: '15%', height: '20%' }
  },
  rake: {
    german: 'Der Rechen',
    coords: { top: '10%', right: '25%', width: '20%', height: '10%' }
  },
  hammer: {
    german: 'Der Hammer',
    coords: { bottom: '10%', right: '10%', width: '15%', height: '15%' }
  },
  sun: {
    german: 'Die Sonne',
    coords: { top: '5%', left: '40%', width: '15%', height: '15%' }
  }
};

const sentences = [
  'Die Scheune ist groß und rot.',
  'Die Windmühle dreht sich im Wind.',
  'Der Traktor fährt über das Feld.',
  'Die Henne pickt Körner vom Boden.',
  'Das Küken folgt seiner Mutter.',
  'Die Katze schläft in der Sonne.',
  'Der Stiefel steht neben dem Zaun.',
  'Der Rechen ist für die Gartenarbeit.',
  'Der Hammer liegt auf dem Boden.',
  'Die Sonne scheint hell am Himmel.'
];

let currentSpeech = null;

document.addEventListener('DOMContentLoaded', () => {
  // Position all items according to their coordinates
  Object.entries(words).forEach(([key, value]) => {
    const element = document.querySelector(`.item[data-item="${key}"]`);
    if (element) {
      Object.entries(value.coords).forEach(([prop, val]) => {
        element.style[prop] = val;
      });
      // Add mouse events
      element.addEventListener('mouseover', () => playWord(key));
      element.addEventListener('mouseout', hidePopup);
    }
  });

  // Initialize article and word input fields
  const inputContainers = document.querySelectorAll('.article-input, .word-input');
  inputContainers.forEach(container => {
    const word = container.dataset.word;
    for (let i = 0; i < word.length; i++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'letter-input' + (i === 0 ? ' capital' : '');
      input.dataset.correct = word[i];
      input.dataset.isCapital = (i === 0).toString();
      container.appendChild(input);
    }
  });

  // Add event listeners for input navigation
  document.querySelectorAll('.letter-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const isCapital = e.target.dataset.isCapital === 'true';
      if (e.target.value.length === 1) {
        e.target.value = isCapital ? 
          e.target.value.toUpperCase() : 
          e.target.value.toLowerCase();
          
        const next = findNextInput(e.target);
        if (next) next.focus();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && e.target.value === '') {
        const prev = findPrevInput(e.target);
        if (prev) prev.focus();
      }
    });
  });
});

function findNextInput(currentInput) {
  const allInputs = Array.from(document.querySelectorAll('.letter-input'));
  const currentIndex = allInputs.indexOf(currentInput);
  return allInputs[currentIndex + 1];
}

function findPrevInput(currentInput) {
  const allInputs = Array.from(document.querySelectorAll('.letter-input'));
  const currentIndex = allInputs.indexOf(currentInput);
  return allInputs[currentIndex - 1];
}

function playWord(item) {
  const popup = document.getElementById('popup');
  popup.textContent = words[item].german;
  popup.style.display = 'block';

  if (currentSpeech) {
    window.speechSynthesis.cancel();
  }

  currentSpeech = new SpeechSynthesisUtterance(words[item].german);
  currentSpeech.lang = 'de-DE';
  currentSpeech.rate = 0.8;
  window.speechSynthesis.speak(currentSpeech);
}

function hidePopup() {
  const popup = document.getElementById('popup');
  popup.style.display = 'none';
  
  if (currentSpeech) {
    window.speechSynthesis.cancel();
    currentSpeech = null;
  }
}

function playSentence(index) {
  if (currentSpeech) {
    window.speechSynthesis.cancel();
  }
  
  currentSpeech = new SpeechSynthesisUtterance(sentences[index]);
  currentSpeech.lang = 'de-DE';
  currentSpeech.rate = 0.8;
  window.speechSynthesis.speak(currentSpeech);
}

function readStory() {
  if (currentSpeech) {
    window.speechSynthesis.cancel();
  }

  const story = sentences.join(' ');
  currentSpeech = new SpeechSynthesisUtterance(story);
  currentSpeech.lang = 'de-DE';
  currentSpeech.rate = 0.8;
  window.speechSynthesis.speak(currentSpeech);
}

function checkAnswers() {
  const inputs = document.querySelectorAll('.letter-input');
  let allCorrect = true;

  inputs.forEach(input => {
    const userInput = input.value;
    const correctLetter = input.dataset.correct;
    
    input.classList.remove('correct', 'incorrect');
    if (userInput === correctLetter) {
      input.classList.add('correct');
    } else {
      input.classList.add('incorrect');
      allCorrect = false;
    }
  });

  if (allCorrect) {
    const utterance = new SpeechSynthesisUtterance('Sehr gut! Alle Wörter sind richtig!');
    utterance.lang = 'de-DE';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }
}

function clearDropZones() {
  const inputs = document.querySelectorAll('.letter-input');
  inputs.forEach(input => {
    input.value = '';
    input.classList.remove('correct', 'incorrect');
  });
}
