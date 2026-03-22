var CARD_IMAGE_MAP = ["CG.png", "CR.png", "CV.png", "DG.png", "DR.png", "DV.png"];
var firstSelection = null;
var secondSelection = null;
var lockBoard = false;
var matchedPairs = 0;
var TOTAL_PAIRS = 6;
var gameStartTime = null;
var timerInterval = null;

function createDeck() {
    var cards = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6];
    for (var i = cards.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = cards[i];
        cards[i] = cards[j];
        cards[j] = temp;
    }
    return cards;
}

function resetSelections() {
    firstSelection = null;
    secondSelection = null;
    lockBoard = false;
}

function revealCard(card) {
    var value = parseInt(card.dataset.value, 10);
    if (!value) return;
    card.style.backgroundImage = "url('Imagen/" + CARD_IMAGE_MAP[value - 1] + "')";
}

function hideCard(card) {
    card.style.backgroundImage = "url('Imagen/base.png')";
}

function saveScore(seconds) {
    var scores = JSON.parse(localStorage.getItem('memoriaScores')) || [];
    var now = new Date();
    var dateStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
    scores.push({
        time: seconds,
        date: dateStr
    });
    scores.sort(function(a, b) {
        return a.time - b.time;
    });
    if (scores.length > 10) {
        scores.pop();
    }
    localStorage.setItem('memoriaScores', JSON.stringify(scores));
}

function checkWin() {
    if (matchedPairs >= TOTAL_PAIRS) {
        stopTimer();
        var elapsedTime = getElapsedTime();
        saveScore(elapsedTime);
        document.getElementById('message').textContent = '¡Felicidades! Ganaste en ' + formatTime(elapsedTime) + '.';
        return true;
    }
    return false;
}

function formatTime(seconds) {
    var mins = Math.floor(seconds / 60);
    var secs = seconds % 60;
    return (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
}

function getElapsedTime() {
    if (!gameStartTime) return 0;
    return Math.floor((Date.now() - gameStartTime) / 1000);
}

function updateTimerDisplay() {
    var elapsed = getElapsedTime();
    document.getElementById('timer').textContent = 'Tiempo: ' + formatTime(elapsed);
}

function startTimer() {
    gameStartTime = Date.now();
    updateTimerDisplay();
    timerInterval = setInterval(updateTimerDisplay, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function onCardClick(event) {
    if (lockBoard) return;
    var card = event.currentTarget;
    if (card.dataset.matched === 'true') return;
    if (firstSelection === card) return;

    revealCard(card);

    if (!firstSelection) {
        firstSelection = card;
        return;
    }

    secondSelection = card;

    if (firstSelection.dataset.value === secondSelection.dataset.value) {
        firstSelection.dataset.matched = 'true';
        secondSelection.dataset.matched = 'true';
        matchedPairs += 1;
        firstSelection = null;
        secondSelection = null;
        checkWin();
        return;
    }

    lockBoard = true;
    setTimeout(function () {
        hideCard(firstSelection);
        hideCard(secondSelection);
        resetSelections();
    }, 800);
}

function attachEventListeners() {
    var squares = document.querySelectorAll('#contenedor div');
    squares.forEach(function(card) {
        card.addEventListener('click', onCardClick);
        card.addEventListener('mouseenter', function() { this.classList.add('pulse'); });
        card.addEventListener('mouseleave', function() { this.classList.remove('pulse'); this.classList.remove('stretchRight'); });
        card.addEventListener('click', function() { this.classList.add('stretchRight'); });
    });
}

function init() {
    stopTimer();
    matchedPairs = 0;
    resetSelections();
    document.getElementById('message').textContent = '';
    document.getElementById('timer').textContent = 'Tiempo: 00:00';
    var numbers = createDeck();
    for (var row = 0; row < 3; row++) {
        for (var col = 0; col < 4; col++) {
            var pos = 'cuadrado' + col + row;
            var card = document.getElementById(pos);
            card.dataset.value = numbers.pop();
            card.dataset.matched = 'false';
            hideCard(card);
        }
    }
    attachEventListeners();
    startTimer();
}

function restartGame() {
    init();
}

window.addEventListener('load', init);
