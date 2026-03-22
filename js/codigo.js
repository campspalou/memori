var CARD_IMAGE_MAP = ["CG.png", "CR.png", "CV.png", "DG.png", "DR.png", "DV.png"];
var firstSelection = null;
var secondSelection = null;
var lockBoard = false;
var matchedPairs = 0;
var aiMatchedPairs = 0;
var TOTAL_PAIRS = 6;
var gameStartTime = null;
var timerInterval = null;
var isPlayerTurn = true;
var aiMemory = {};
var gameMode = 'solo';

function setGameMode(mode) {
    gameMode = mode;
}

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
    if (matchedPairs + aiMatchedPairs >= TOTAL_PAIRS) {
        stopTimer();
        updateScoreDisplay();
        if (gameMode === 'solo') {
            var elapsedTime = getElapsedTime();
            saveScore(elapsedTime);
            document.getElementById('message').textContent = '¡Felicidades! Ganaste en ' + formatTime(elapsedTime) + '.';
        } else {
            if (matchedPairs > aiMatchedPairs) {
                document.getElementById('message').textContent = '¡Felicidades! Ganaste ' + matchedPairs + '-' + aiMatchedPairs + ' contra la IA.';
            } else if (aiMatchedPairs > matchedPairs) {
                document.getElementById('message').textContent = 'La IA ganó ' + aiMatchedPairs + '-' + matchedPairs + '. ¡Mejor suerte la próxima vez!';
            } else {
                document.getElementById('message').textContent = '¡Empate! ' + matchedPairs + '-' + aiMatchedPairs;
            }
        }
        return true;
    }
    return false;
}

function updateScoreDisplay() {
    if (gameMode === 'ai') {
        document.getElementById('score').textContent = 'Tu: ' + matchedPairs + ' | IA: ' + aiMatchedPairs;
    }
}

function updateTurnIndicator() {
    var indicator = document.getElementById('turn-indicator');
    if (gameMode !== 'ai') {
        indicator.style.display = 'none';
        return;
    }
    if (isPlayerTurn) {
        indicator.textContent = '🎮 Tu turno';
        indicator.className = 'player-turn';
    } else {
        indicator.textContent = '🤖 Turno de la IA';
        indicator.className = 'ai-turn';
    }
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
    if (gameMode === 'ai' && !isPlayerTurn) return;
    
    var card = event.currentTarget;
    if (card.dataset.matched === 'true') return;
    if (firstSelection === card) return;

    revealCard(card);
    aiMemory[card.id] = card.dataset.value;

    if (!firstSelection) {
        firstSelection = card;
        return;
    }

    secondSelection = card;

    if (firstSelection.dataset.value === secondSelection.dataset.value) {
        firstSelection.dataset.matched = 'true';
        secondSelection.dataset.matched = 'true';
        matchedPairs += 1;
        updateScoreDisplay();
        firstSelection = null;
        secondSelection = null;
        if (!checkWin() && gameMode === 'ai') {
            updateTurnIndicator();
            lockBoard = true;
            setTimeout(makeAIMove, 1200);
        }
        return;
    }

    lockBoard = true;
    setTimeout(function () {
        hideCard(firstSelection);
        hideCard(secondSelection);
        resetSelections();
        if (gameMode === 'ai') {
            isPlayerTurn = false;
            updateTurnIndicator();
            setTimeout(makeAIMove, 800);
        }
    }, 800);
}

function makeAIMove() {
    lockBoard = true;
    var cards = document.querySelectorAll('#contenedor div');
    var availableCards = [];
    
    cards.forEach(function(card) {
        if (card.dataset.matched !== 'true') {
            availableCards.push(card);
        }
    });

    if (availableCards.length === 0) {
        endGame();
        return;
    }

    var firstCard = null;
    var secondCard = null;

    for (var i = 0; i < availableCards.length; i++) {
        if (aiMemory[availableCards[i].id]) {
            firstCard = availableCards[i];
            break;
        }
    }

    if (firstCard) {
        for (var i = 0; i < availableCards.length; i++) {
            if (availableCards[i] !== firstCard && 
                aiMemory[availableCards[i].id] && 
                aiMemory[availableCards[i].id] === aiMemory[firstCard.id]) {
                secondCard = availableCards[i];
                break;
            }
        }

        if (!secondCard) {
            var randomIndex = Math.floor(Math.random() * availableCards.length);
            secondCard = availableCards[randomIndex];
        }
    } else {
        var randomIndex1 = Math.floor(Math.random() * availableCards.length);
        firstCard = availableCards[randomIndex1];
        
        var randomIndex2 = Math.floor(Math.random() * availableCards.length);
        while (randomIndex2 === randomIndex1 && availableCards.length > 1) {
            randomIndex2 = Math.floor(Math.random() * availableCards.length);
        }
        secondCard = availableCards[randomIndex2];
    }

    setTimeout(function() {
        revealCard(firstCard);
        aiMemory[firstCard.id] = firstCard.dataset.value;
    }, 200);

    setTimeout(function() {
        revealCard(secondCard);
        aiMemory[secondCard.id] = secondCard.dataset.value;
    }, 800);

    setTimeout(function() {
        if (firstCard.dataset.value === secondCard.dataset.value) {
            firstCard.dataset.matched = 'true';
            secondCard.dataset.matched = 'true';
            aiMatchedPairs += 1;
            updateScoreDisplay();
            lockBoard = false;
            if (!checkWin()) {
                setTimeout(makeAIMove, 600);
            }
        } else {
            hideCard(firstCard);
            hideCard(secondCard);
            lockBoard = false;
            isPlayerTurn = true;
            updateTurnIndicator();
        }
    }, 1600);
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
    aiMatchedPairs = 0;
    resetSelections();
    isPlayerTurn = true;
    aiMemory = {};
    document.getElementById('message').textContent = '';
    document.getElementById('timer').textContent = 'Tiempo: 00:00';
    if (gameMode === 'ai') {
        document.getElementById('score').textContent = 'Tu: 0 | IA: 0';
    } else {
        document.getElementById('score').style.display = 'none';
    }
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
    updateTurnIndicator();
}

function endGame() {
    lockBoard = false;
    checkWin();
}

function restartGame() {
    init();
}

window.addEventListener('load', init);
