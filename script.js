const diceElements = document.querySelectorAll('.die');
const rollButton = document.getElementById('roll-button');
const playerContainer = document.querySelector('.players');
const rollsLeftDisplay = document.querySelector('.rolls-left');
const scoreTable = document.querySelector('.score-table');
const messageDisplay = document.querySelector('.message');
const numPlayersInput = document.getElementById('num-players');
const startGameButton = document.getElementById('start-game-button');
const setupArea = document.querySelector('.setup-area');
const gameArea = document.querySelector('.game-area');
const restartButton = document.getElementById('restart-button');

let currentPlayer = 1;
let diceValues = [0, 0, 0, 0, 0];
let selectedDice = [false, false, false, false, false];
let rollsLeft = 3;
let scores = {};
let gameOver = false;
let numPlayers = 2;
let playerElements = [];

const diceSVGs = {
    1: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="12" fill="black" /></svg>`,
    2: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="25" r="12" fill="black" /><circle cx="75" cy="75" r="12" fill="black" /></svg>`,
    3: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="25" r="12" fill="black" /><circle cx="50" cy="50" r="12" fill="black" /><circle cx="75" cy="75" r="12" fill="black" /></svg>`,
    4: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="25" r="12" fill="black" /><circle cx="75" cy="25" r="12" fill="black" /><circle cx="25" cy="75" r="12" fill="black" /><circle cx="75" cy="75" r="12" fill="black" /></svg>`,
    5: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="25" r="12" fill="black" /><circle cx="75" cy="25" r="12" fill="black" /><circle cx="50" cy="50" r="12" fill="black" /><circle cx="25" cy="75" r="12" fill="black" /><circle cx="75" cy="75" r="12" fill="black" /></svg>`,
    6: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="25" r="12" fill="black" /><circle cx="75" cy="25" r="12" fill="black" /><circle cx="25" cy="50" r="12" fill="black" /><circle cx="75" cy="50" r="12" fill="black" /><circle cx="25" cy="75" r="12" fill="black" /><circle cx="75" cy="75" r="12" fill="black" /></svg>`
};

startGameButton.addEventListener('click', () => {
    numPlayers = parseInt(numPlayersInput.value);
    if (numPlayers < 2) {
        displayMessage("Bitte mindestens 2 Spieler eingeben.");
        return;
    }
    initGame();
    setupArea.classList.add('hidden');
    gameArea.classList.remove('hidden');
});

restartButton.addEventListener('click', () => {
    initGame();
});

function initGame() {
    currentPlayer = 1;
    diceValues = [0, 0, 0, 0, 0];
    selectedDice = [false, false, false, false, false];
    rollsLeft = 3;
    scores = {};
    gameOver = false;
    playerContainer.innerHTML = '';
    playerElements = [];
    for (let i = 1; i <= numPlayers; i++) {
        scores[i] = {};
        const playerDiv = document.createElement('div');
        playerDiv.classList.add('player');
        playerDiv.textContent = `Spieler ${i}`;
        playerDiv.dataset.player = i;
        playerContainer.appendChild(playerDiv);
        playerElements.push(playerDiv);
    }

    playerElements[0].classList.add('active');
    updateScoreboard();
    updateDisplay();
    updateDiceDisplay();
    clearScoreBoards();
}


function rollDice() {
    if (gameOver) return;
    if (rollsLeft <= 0) return;

    for (let i = 0; i < 5; i++) {
        if (!selectedDice[i]) {
            diceValues[i] = Math.floor(Math.random() * 6) + 1;
        }
    }

    rollsLeft--;
    updateDisplay();
    updateDiceDisplay();
}

function updateDisplay() {
    playerElements.forEach(player => {
        player.classList.remove('active');
    });

    playerElements[currentPlayer - 1].classList.add('active');
    rollsLeftDisplay.textContent = `Würfe übrig: ${rollsLeft}`;
    updateHighlightedColumn();
}

function updateDiceDisplay() {
    diceElements.forEach((die, index) => {
        die.innerHTML = diceValues[index] ? diceSVGs[diceValues[index]] : '';
        die.classList.toggle('selected', selectedDice[index]);
    });
}

function toggleDieSelection(index) {
    if (rollsLeft === 3 || gameOver) return;
    selectedDice[index] = !selectedDice[index];
    updateDiceDisplay();
}

diceElements.forEach((die, index) => {
    die.addEventListener('click', () => toggleDieSelection(index));
});

rollButton.addEventListener('click', rollDice);

function updateScoreboard() {
      const headerRow = scoreTable.querySelector('thead tr');
      // Remove existing player columns
       while (headerRow.cells.length > 1) {
          headerRow.deleteCell(1);
      }

    for (let i = 1; i <= numPlayers; i++) {
        const th = document.createElement('th');
        th.textContent = `Spieler ${i}`;
        headerRow.appendChild(th);
    }
    const scoreRows = scoreTable.querySelectorAll('tbody tr');
    scoreRows.forEach(row => {
      //Remove existing score columns
         while (row.cells.length > 1) {
          row.deleteCell(1);
        }
        for (let i = 1; i <= numPlayers; i++) {
            const cell = document.createElement('td');
            cell.classList.add('score-cell');
            cell.dataset.player = i;
            row.appendChild(cell);
            if (row.dataset.cat !== 'bonus' ) {
              if(!row.classList.contains('total')) {
                cell.addEventListener('click', function () {
                    if (gameOver) return;
                    if (rollsLeft === 3) return;
                    const player = parseInt(this.dataset.player);
                    if (player !== currentPlayer) {
                        displayMessage('Nicht dein Zug');
                        return;
                    }
                    const category = this.closest('tr').dataset.cat;
                    if (scores[player][category] !== undefined) {
                        displayMessage('Kategorie bereits ausgewählt');
                        return;
                    }
                    selectScore(category, player, this)
                  })
               }
            }
        }
    })
}


function displayMessage(text) {
    messageDisplay.textContent = text;
    setTimeout(() => {
        messageDisplay.textContent = '';
    }, 2000);
}

function selectScore(category, player, cell) {
    let score = calculateScore(category);
    scores[player][category] = score;
    cell.textContent = score;
    const bonusAssigned = updateBonusScore(player);
    updateScoreboardTotal();
    if (!bonusAssigned) {
        resetTurn();
        switchPlayer();
        checkGameEnd();
    }

}

function updateBonusScore(player) {
    const bonusCell = scoreTable.querySelector(`tr[data-cat="bonus"] td[data-player="${player}"]`);
    if (bonusCell && scores[player]["bonus"] === undefined) {
        const bonus = calculateBonus(player);
        if (bonus > 0) {
            scores[player]["bonus"] = bonus;
            bonusCell.textContent = bonus;
            return true;
        }
    }
    return false;
}

function resetTurn() {
    rollsLeft = 3;
    diceValues = [0, 0, 0, 0, 0];
    selectedDice = [false, false, false, false, false];
    updateDisplay();
    updateDiceDisplay();
}

function switchPlayer() {
    currentPlayer = currentPlayer === numPlayers ? 1 : currentPlayer + 1;
    updateDisplay();
}

function clearScoreBoards() {
    scoreTable.querySelectorAll('td.score-cell').forEach(cell => {
        cell.textContent = '';
    });
    scoreTable.querySelectorAll('.total .score-cell').forEach(cell => {
        cell.textContent = '';
    });
    updateHighlightedColumn();
}


function checkGameEnd() {
    let allFinished = true;
    for (let i = 1; i <= numPlayers; i++) {
        const categories = Object.keys(scores[i]).filter(cat => cat !== 'bonus');
        if (categories.length < 13) {
            allFinished = false;
            break;
        }
    }

    if (allFinished) {
        gameOver = true;
        let winner = 0;
        let highestScore = 0;
        let winningScoreBoardString = '';
        for (let i = 1; i <= numPlayers; i++) {
            const totalScore = calculateTotalScore(i);
            if (totalScore > highestScore) {
                highestScore = totalScore;
                winner = i;
            } else if (totalScore === highestScore) {
                winner = 0;
            }
        }
        let winnerMessage = winner === 0 ? "Es ist ein Unentschieden!" : `Spieler ${winner} gewinnt!`;
        const totalCell = scoreTable.querySelector('.total td:first-child');
        totalCell.textContent = `${winnerMessage} Punktzahl: ${highestScore}`;
    }
}


function updateHighlightedColumn() {
    const headerCells = scoreTable.querySelectorAll('thead th');
    const scoreCells = scoreTable.querySelectorAll('tbody td');

    headerCells.forEach(cell => {
        cell.classList.remove('active-column');
    });
    scoreCells.forEach(cell => {
        cell.classList.remove('active-column');
    })

    const playerHeader = scoreTable.querySelector(`thead th:nth-child(${currentPlayer + 1})`);
    if (playerHeader) playerHeader.classList.add('active-column');

    scoreCells.forEach(cell => {
        if (parseInt(cell.dataset.player) === currentPlayer) {
            cell.classList.add('active-column');
        }
    })
}

function calculateScore(category) {
    const counts = {};
    for (const value of diceValues) {
        counts[value] = (counts[value] || 0) + 1;
    }

    const sortedValues = diceValues.slice().sort();

    switch (category) {
        case 'aces': return counts[1] ? counts[1] * 1 : 0;
        case 'twos': return counts[2] ? counts[2] * 2 : 0;
        case 'threes': return counts[3] ? counts[3] * 3 : 0;
        case 'fours': return counts[4] ? counts[4] * 4 : 0;
        case 'fives': return counts[5] ? counts[5] * 5 : 0;
        case 'sixes': return counts[6] ? counts[6] * 6 : 0;
        case 'bonus': return calculateBonus(currentPlayer);
        case 'three-of-a-kind':
            for (const value in counts) {
                if (counts[value] >= 3) return diceValues.reduce((a, b) => a + b, 0);
            }
            return 0;
        case 'four-of-a-kind':
            for (const value in counts) {
                if (counts[value] >= 4) return diceValues.reduce((a, b) => a + b, 0);
            }
            return 0;
        case 'full-house':
            let hasTwo = false;
            let hasThree = false;
            for (const value in counts) {
                if (counts[value] === 2) hasTwo = true;
                if (counts[value] === 3) hasThree = true;
            }
            return hasTwo && hasThree ? 25 : 0;
        case 'small-straight':
            if (containsSmallStraight(sortedValues)) return 30;
            return 0;
        case 'large-straight':
            if (containsLargeStraight(sortedValues)) return 40;
            return 0;
        case 'kniffel':
            for (const value in counts) {
                if (counts[value] === 5) return 50;
            }
            return 0;
        case 'chance':
            return diceValues.reduce((a, b) => a + b, 0);
        default: return 0;
    }
}

function containsSmallStraight(sortedValues) {
    const uniqueSorted = [...new Set(sortedValues)];
    for (let i = 0; i <= uniqueSorted.length - 4; i++) {
        if (uniqueSorted[i] === uniqueSorted[i + 1] - 1 &&
            uniqueSorted[i + 1] === uniqueSorted[i + 2] - 1 &&
            uniqueSorted[i + 2] === uniqueSorted[i + 3] - 1) {
            return true;
        }
    }
    return false;
}

function containsLargeStraight(sortedValues) {
    const uniqueSorted = [...new Set(sortedValues)];
    if (uniqueSorted.length !== 5) return false;
    for (let i = 0; i < uniqueSorted.length - 1; i++) {
        if (uniqueSorted[i] !== uniqueSorted[i + 1] - 1) return false;
    }
    return true;
}

function calculateBonus(player) {
    let sum = 0;
    for (let i = 1; i <= 6; i++) {
        const category = Object.keys(scores[player]).find(key => key === getCategoryName(i));
        if (category && scores[player][category]) {
            sum += scores[player][category];
        }
    }
    return sum >= 63 ? 35 : 0;
}

function getCategoryName(number) {
    switch (number) {
        case 1: return 'aces';
        case 2: return 'twos';
        case 3: return 'threes';
        case 4: return 'fours';
        case 5: return 'fives';
        case 6: return 'sixes';
        default: return null;
    }
}

function calculateTotalScore(player) {
    let total = 0;
    for (let category in scores[player]) {
        total += scores[player][category];
    }
    return total;
}


function updateScoreboardTotal() {
    for (let player = 1; player <= numPlayers; player++) {
        const totalScore = calculateTotalScore(player);
        scoreTable.querySelector(`.total .score-cell[data-player="${player}"]`).textContent = totalScore;
    }
}