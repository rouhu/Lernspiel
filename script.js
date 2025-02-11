const animals = {
  sheep: { emoji: '🐑', name: 'Das Schaf' },
  pig: { emoji: '🐷', name: 'Das Schwein' },
  horse: { emoji: '🐴', name: 'Das Pferd' },
  cow: { emoji: '🐮', name: 'Die Kuh' }
};

const sentences = [
  'Das Schaf spielt fröhlich auf der grünen Wiese.',
  'Das Schwein rollt sich glücklich im Matsch.',
  'Das Pferd galoppiert elegant über die Felder.',
  'Die Kuh gibt uns jeden Tag frische Milch.'
];

let currentSpeech = null;
let draggedEmoji = null;
let isDragging = false;

document.addEventListener('DOMContentLoaded', () => {
  const emojis = document.querySelectorAll('.emoji');
  const dropZones = document.querySelectorAll('.drop-zone');

  emojis.forEach(emoji => {
    emoji.addEventListener('dragstart', handleDragStart);
    emoji.addEventListener('dragend', handleDragEnd);
    emoji.addEventListener('mouseout', hidePopup);
    
    // Touch events for mobile
    emoji.addEventListener('touchstart', handleTouchStart);
    emoji.addEventListener('touchend', handleTouchEnd);
  });

  dropZones.forEach(zone => {
    zone.addEventListener('dragenter', handleDragEnter);
    zone.addEventListener('dragover', handleDragOver);
    zone.addEventListener('dragleave', handleDragLeave);
    zone.addEventListener('drop', handleDrop);
  });
});

function speakTargetWord(animalKey) {
  // Don't speak if we're dragging
  if (isDragging) return;

  const popup = document.getElementById('popup');
  popup.textContent = animals[animalKey].name;
  popup.style.display = 'block';

  if (currentSpeech) {
    window.speechSynthesis.cancel();
  }

  currentSpeech = new SpeechSynthesisUtterance(animals[animalKey].name);
  currentSpeech.lang = 'de-DE';
  currentSpeech.rate = 0.8;
  window.speechSynthesis.speak(currentSpeech);
}

function handleDragStart(e) {
  isDragging = true;
  draggedEmoji = this;
  this.classList.add('dragging');
  e.dataTransfer.setData('text/plain', this.dataset.animal);
}

function handleDragEnd(e) {
  isDragging = false;
  this.classList.remove('dragging');
}

function handleTouchStart(e) {
  e.preventDefault();
  isDragging = true;
  this.classList.add('dragging');
  draggedEmoji = this;

  // Speak the animal name on touch start
  const animalKey = this.dataset.animal;
  speakTargetWord(animalKey);
}

function handleTouchEnd(e) {
  e.preventDefault();
  isDragging = false;
  this.classList.remove('dragging');
  
  const touch = e.changedTouches[0];
  const dropZone = document.elementFromPoint(touch.clientX, touch.clientY);
  
  if (dropZone && dropZone.classList.contains('drop-zone')) {
    if (dropZone.children.length === 0) {
      dropZone.textContent = animals[draggedEmoji.dataset.animal].emoji;
      dropZone.dataset.dropped = draggedEmoji.dataset.animal;
    }
  }
  
  draggedEmoji = null;
  hidePopup();
}

function handleDragEnter(e) {
  e.preventDefault();
  this.classList.add('drag-over');
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDragLeave(e) {
  this.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  
  const animalType = e.dataTransfer.getData('text/plain');
  if (this.children.length === 0) {
    this.textContent = animals[animalType].emoji;
    this.dataset.dropped = animalType;
  }
}

function hidePopup() {
  const popup = document.getElementById('popup');
  popup.style.display = 'none';
  
  if (currentSpeech && !isDragging) {
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
  const dropZones = document.querySelectorAll('.drop-zone');
  let allCorrect = true;

  dropZones.forEach(zone => {
    zone.classList.remove('correct', 'incorrect');
    if (zone.dataset.dropped === zone.dataset.expects) {
      zone.classList.add('correct');
    } else {
      zone.classList.add('incorrect');
      allCorrect = false;
    }
  });

  if (allCorrect) {
    const utterance = new SpeechSynthesisUtterance('Sehr gut! Alle Antworten sind richtig!');
    utterance.lang = 'de-DE';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  }
}

function clearDropZones() {
  const dropZones = document.querySelectorAll('.drop-zone');
  dropZones.forEach(zone => {
    zone.textContent = '';
    zone.dataset.dropped = '';
    zone.classList.remove('correct', 'incorrect', 'drag-over');
  });
}
