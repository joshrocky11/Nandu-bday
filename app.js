(() => {
  const stepNames = ['A LITTLE BIRTHDAY SURPRISE', 'A SPECIAL DELIVERY', 'WORDS FROM THE HEART', 'YOUR MEMORY GARDEN', 'A FEW MORE WISHES', 'THE WISH GARDEN'];
  const steps = [...document.querySelectorAll('.step-section')];
  const dots = [...document.querySelectorAll('#step-dots i')];
  const stepLabel = document.getElementById('step-label');
  let currentStep = 0;
  function goToStep(index) {
    if (index < 0 || index >= steps.length) return;
    steps[currentStep].classList.remove('active', 'entering');
    steps[currentStep].setAttribute('aria-hidden', 'true');
    currentStep = index;
    steps[currentStep].classList.add('active', 'entering');
    steps[currentStep].setAttribute('aria-hidden', 'false');
    dots.forEach((dot, i) => dot.classList.toggle('current', i === currentStep));
    stepLabel.textContent = stepNames[currentStep];
    if (currentStep === 2 && !letterStarted) beginLetter();
    setTimeout(() => steps[currentStep]?.classList.remove('entering'), 650);
  }

  const heartField = document.getElementById('floatingHearts');
  const heartIcons = ['♡', '♥', '✦', '✧', '💗'];
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(() => {
      if (heartField.childElementCount >= 17) return;
      const heart = document.createElement('span');
      heart.className = 'drifting-heart';
      heart.textContent = heartIcons[Math.floor(Math.random() * heartIcons.length)];
      heart.style.left = `${Math.random() * 96}vw`;
      heart.style.fontSize = `${12 + Math.floor(Math.random() * 16)}px`;
      heart.style.animationDuration = `${7 + Math.random() * 5}s`;
      heart.addEventListener('animationend', () => heart.remove());
      heartField.appendChild(heart);
    }, 720);
  }

  document.getElementById('start-btn').addEventListener('click', () => goToStep(1));
  const envelope = document.getElementById('envelope');
  envelope.addEventListener('click', () => {
    if (envelope.classList.contains('opened')) return;
    envelope.classList.add('opened');
    document.getElementById('envelope-hint').textContent = 'Your letter is ready ✨';
    document.getElementById('letter-next').classList.remove('hidden');
  });
  document.getElementById('letter-next').addEventListener('click', () => goToStep(2));

  const message = 'Happy birthday, Nandhu! I hope this new year brings you more of the things that make you feel most like yourself: people who make you laugh, little moments that turn into favorite memories, and room to follow every dream that matters to you.\n\nYou deserve to feel celebrated not just today, but in all the everyday moments still to come. Keep being your thoughtful, bright, wonderfully one-of-a-kind self. The world is happier with you in it.\n\nHere is to a year full of good surprises, brave beginnings, and so much joy. Make a wish — this next chapter is yours.';
  const letterTarget = document.getElementById('letter-text');
  const letterNext = document.getElementById('gallery-next');
  const letterSkip = document.getElementById('letter-skip');
  let letterStarted = false;
  let typingTimer;
  function completeLetter() {
    clearTimeout(typingTimer);
    letterTarget.textContent = message;
    letterNext.classList.remove('hidden');
    letterSkip.classList.add('hidden');
  }
  function beginLetter() {
    if (letterStarted) return;
    letterStarted = true;
    let index = 0;
    letterSkip.classList.remove('hidden');
    const typeNext = () => {
      if (index >= message.length) {
        completeLetter();
        return;
      }
      letterTarget.textContent = message.slice(0, ++index);
      const ch = message[index - 1];
      typingTimer = setTimeout(typeNext, ch === '.' || ch === '!' ? 190 : ch === ',' ? 105 : ch === '\n' ? 230 : 22);
    };
    typeNext();
  }
  letterSkip.addEventListener('click', completeLetter);
  letterNext.addEventListener('click', () => goToStep(3));

  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function photoToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('read failed'));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error('image failed'));
        image.onload = () => {
          const scale = Math.min(1, 1500 / Math.max(image.width, image.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', .82));
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  document.querySelectorAll('[data-upload]').forEach(input => {
    const key = `nandhu-birthday-v2-photo-${input.dataset.upload}`;
    const frame = document.querySelector(`[data-photo="${input.dataset.upload}"]`);
    const img = frame.querySelector('img');
    const layoutSidewaysPhoto = () => {
      if (!img.classList.contains('sideways-photo')) return;
      const { width, height } = frame.getBoundingClientRect();
      img.style.width = `${height}px`;
      img.style.height = `${width}px`;
    };
    layoutSidewaysPhoto();
    if ('ResizeObserver' in window) new ResizeObserver(layoutSidewaysPhoto).observe(frame);
    img.addEventListener('load', layoutSidewaysPhoto);
    const applyPhoto = data => {
      img.src = data;
      img.classList.remove('sideways-photo');
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.transform = 'translate(-50%,-50%)';
    };
    try {
      const saved = localStorage.getItem(key);
      if (saved) applyPhoto(saved);
    } catch { /* Storage can be disabled by the browser. */ }
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        showToast('Please choose an image file.');
        input.value = '';
        return;
      }
      if (file.size > 12 * 1024 * 1024) {
        showToast('That photo is over 12 MB. Choose a smaller image.');
        input.value = '';
        return;
      }
      try {
        const data = await photoToDataUrl(file);
        applyPhoto(data);
        try {
          localStorage.setItem(key, data);
          showToast('A lovely memory, saved here ✦');
        } catch {
          showToast('Photo added for this visit. Browser storage is full.');
        }
      } catch {
        showToast('This photo could not be opened. Try another one.');
      }
      input.value = '';
    });
  });
  document.getElementById('cards-next').addEventListener('click', () => goToStep(4));
  document.querySelectorAll('.flip-card').forEach(card => card.addEventListener('click', () => {
    card.classList.toggle('flipped');
    card.setAttribute('aria-pressed', String(card.classList.contains('flipped')));
  }));
  document.getElementById('game-next').addEventListener('click', () => goToStep(5));

  const startGame = document.getElementById('start-game');
  const field = document.getElementById('playfield');
  const scoreDisplay = document.getElementById('score');
  const timerDisplay = document.getElementById('timer');
  const gameStatus = document.getElementById('game-status');
  const gameProgress = document.getElementById('game-progress');
  const gameWelcome = document.getElementById('game-welcome');
  const finale = document.getElementById('birthday-finale');
  let score = 0;
  let timeLeft = 20;
  let spawnLoop;
  let clockLoop;
  let gameLive = false;
  const wishIcons = ['✦', '✧', '✴', '♡', '✦', '✺'];
  function spawnWish() {
    if (!gameLive) return;
    const star = document.createElement('button');
    star.type = 'button';
    star.className = 'wish-star';
    star.textContent = wishIcons[Math.floor(Math.random() * wishIcons.length)];
    star.setAttribute('aria-label', 'Catch this birthday wish');
    star.style.left = `${3 + Math.random() * 88}%`;
    star.style.top = '-9px';
    star.style.animationDuration = `${1.75 + Math.random() * .85}s`;
    star.addEventListener('click', () => {
      if (!gameLive) return;
      score += 1;
      scoreDisplay.textContent = String(score).padStart(2, '0');
      gameProgress.style.width = `${Math.min(score / 15 * 100, 100)}%`;
      star.remove();
      if (score === 10) showToast('Ten wishes! You’re on a roll, Nandhu ✨');
    });
    star.addEventListener('animationend', () => star.remove());
    field.appendChild(star);
  }
  function finishGame() {
    gameLive = false;
    clearInterval(spawnLoop);
    clearInterval(clockLoop);
    field.querySelectorAll('.wish-star').forEach(star => star.remove());
    gameStatus.textContent = 'WISHES GATHERED';
    startGame.innerHTML = 'Play again <span>↻</span>';
    gameWelcome.hidden = false;
    gameWelcome.querySelector('strong').textContent = score >= 10 ? 'A garden full of birthday magic!' : 'Your wishes are safe and sound';
    gameWelcome.querySelector('span').textContent = `You caught ${score} ${score === 1 ? 'wish' : 'wishes'}. Make them count!`;
    finale.classList.remove('hidden');
  }
  startGame.addEventListener('click', () => {
    clearInterval(spawnLoop);
    clearInterval(clockLoop);
    gameLive = true;
    score = 0;
    timeLeft = 20;
    scoreDisplay.textContent = '00';
    timerDisplay.textContent = '20';
    gameProgress.style.width = '0%';
    gameStatus.textContent = 'CATCH THE WISHES!';
    startGame.innerHTML = 'Playing… <span>✦</span>';
    gameWelcome.hidden = true;
    finale.classList.add('hidden');
    field.querySelectorAll('.wish-star').forEach(star => star.remove());
    spawnWish();
    spawnLoop = setInterval(spawnWish, 620);
    clockLoop = setInterval(() => {
      timeLeft -= 1;
      timerDisplay.textContent = String(timeLeft);
      if (timeLeft <= 0) finishGame();
    }, 1000);
  });

  const musicToggle = document.getElementById('music-toggle');
  const musicPanel = document.getElementById('music-panel');
  const musicStatus = document.getElementById('music-status');
  const birthdayAudio = document.getElementById('birthday-audio');
  function updateMusicState(isPlaying) {
    musicToggle.classList.toggle('playing', isPlaying);
    musicToggle.setAttribute('aria-pressed', String(isPlaying));
    musicStatus.textContent = isPlaying ? 'Playing · tap to pause' : 'Paused · tap to resume';
  }
  musicToggle.addEventListener('click', () => {
    musicPanel.classList.remove('hidden');
    musicToggle.setAttribute('aria-expanded', 'true');
    if (birthdayAudio.paused) {
      birthdayAudio.play().then(() => updateMusicState(true)).catch(() => {
        musicStatus.textContent = 'Could not play the music file';
        showToast('The birthday music file could not be played.');
      });
    } else {
      birthdayAudio.pause();
      updateMusicState(false);
    }
  });
  birthdayAudio.addEventListener('play', () => updateMusicState(true));
  birthdayAudio.addEventListener('pause', () => updateMusicState(false));
  birthdayAudio.addEventListener('error', () => {
    musicStatus.textContent = 'Music file unavailable';
    musicToggle.classList.remove('playing');
    musicToggle.setAttribute('aria-pressed', 'false');
  });
})();
