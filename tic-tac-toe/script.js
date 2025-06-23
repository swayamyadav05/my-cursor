const board = document.getElementById('board');
const cells = Array.from(document.querySelectorAll('.cell'));
const statusDisplay = document.getElementById('status');
const resetBtn = document.getElementById('resetBtn');

let currentPlayer = 'X';
let gameActive = true;
let gameState = ['', '', '', '', '', '', '', '', ''];

const winningConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

const playerColors = { 'X': '#ff4d4d', 'O': '#4d79ff' };

function handleCellPlayed(clickedCell, clickedIndex) {
  gameState[clickedIndex] = currentPlayer;
  clickedCell.textContent = currentPlayer;
  clickedCell.style.color = playerColors[currentPlayer];
}

function handlePlayerChange() {
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  statusDisplay.textContent = `It's ${currentPlayer}'s turn`;
  statusDisplay.style.color = playerColors[currentPlayer];
}

function handleResultValidation() {
  let roundWon = false;
  for (let i = 0; i < winningConditions.length; i++) {
    const winCondition = winningConditions[i];
    let a = gameState[winCondition[0]];
    let b = gameState[winCondition[1]];
    let c = gameState[winCondition[2]];
    if (a === '' || b === '' || c === '') {
      continue;
    }
    if (a === b && b === c) {
      roundWon = true;
      highlightWinningCells(winCondition);
      break;
    }
  }

  if (roundWon) {
    statusDisplay.textContent = `Player ${currentPlayer} has won!`;
    gameActive = false;
    return;
  }

  const roundDraw = !gameState.includes('');
  if (roundDraw) {
    statusDisplay.textContent = `Game ended in a draw!`;
    gameActive = false;
    return;
  }

  handlePlayerChange();
}

function highlightWinningCells(winCondition) {
  winCondition.forEach(index => {
    cells[index].style.backgroundColor = currentPlayer === 'X' ? '#ff9999' : '#9999ff';
  });
}

function handleCellClick(event) {
  const clickedCell = event.target;
  const clickedIndex = parseInt(clickedCell.getAttribute('data-index'));

  if (gameState[clickedIndex] !== '' || !gameActive) {
    return;
  }

  handleCellPlayed(clickedCell, clickedIndex);
  handleResultValidation();
}

function handleResetGame() {
  currentPlayer = 'X';
  gameActive = true;
  gameState = ['', '', '', '', '', '', '', '', ''];
  statusDisplay.textContent = `It's ${currentPlayer}'s turn`;
  statusDisplay.style.color = playerColors[currentPlayer];
  cells.forEach(cell => {
    cell.textContent = '';
    cell.style.backgroundColor = '#f0f0f0';
  });
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetBtn.addEventListener('click', handleResetGame);

handleResetGame();