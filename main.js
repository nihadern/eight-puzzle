// blank value for the board
const BLANK = null;
// predetermined goal state
const GOAL_STATE = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, BLANK],
];

// board widht/height
const BOARD_SIZE = 3;

// renders the state of the board to html
function renderState(state, tableName = "eight-puzzle") {
  const table = document.getElementById(tableName);
  for (let i = 0; i < state.length; i++) {
    let row = table.insertRow();
    for (let j = 0; j < state[0].length; j++) {
      let col = row.insertCell();
      col.innerText = state[i][j];
    }
  }
}

// clears the solve moves from document
function clearSolveStates(statesSpaceid = "states") {
  const statesSpace = document.getElementById(statesSpaceid);
  while (statesSpace.firstChild) {
    statesSpace.removeChild(statesSpace.lastChild);
  }
}

// renders to html all solve moves left to right
function renderStates(states, statesSpaceid = "states") {
  const statesSpace = document.getElementById(statesSpaceid);

  states.forEach((state, i) => {
    const table = document.createElement("table");
    const header = document.createElement("th");
    header.colSpan = BOARD_SIZE;
    header.innerText = `Move ${i + 1}`;
    table.appendChild(header);
    table.id = `state${i}`;
    statesSpace.appendChild(table);

    renderState(state, table.id);
  });
}

// creates a random board and renders it to the tableName element
function randomizeBoard(tableName = "eight-puzzle-start") {
  const table = document.getElementById(tableName).childNodes[1];
  const shuffledBoard = GOAL_STATE.flat().sort(() => Math.random() - 0.5);
  for (let i = 0; i < BOARD_SIZE; i++) {
    const row = table.rows[i];
    for (let j = 0; j < BOARD_SIZE; j++)
      row.cells[j].childNodes[0].value = shuffledBoard.pop();
  }
}

// parses an input board from the html doc and returns a 2d array
function parseInputBoard(tableName = "eight-puzzle-start") {
  const possible = new Set(GOAL_STATE.flat());
  const table = document.getElementById(tableName).childNodes[1];
  const board = new Array(BOARD_SIZE);
  for (let i = 0; i < BOARD_SIZE; i++) {
    const boardRow = new Array(BOARD_SIZE);
    const row = table.rows[i];
    for (let j = 0; j < BOARD_SIZE; j++) {
      let colVal = row.cells[j].childNodes[0].value
        ? parseInt(row.cells[j].childNodes[0].value)
        : BLANK;
      if (possible.has(colVal)) {
        possible.delete(colVal);
        boardRow[j] = colVal;
      } else {
        throw "Duplicated or unknown values!";
      }
    }
    board[i] = boardRow;
  }
  return board;
}

// displays a message with green if success and red if not
function displayMessage(message, success = true, messageBoxId = "output") {
  const messageBox = document.getElementById(messageBoxId);
  messageBox.style = success ? "color:green;" : "color:red;";
  messageBox.innerText = message;
}

// main driver to solve puzzle
function solvePuzzle() {
  // remove all moves from previous puzzles
  clearSolveStates();
  // parse the max iteration input
  let maxIter = parseInt(document.getElementById("max-iter").value);
  let board = copyState(GOAL_STATE);
  let goalBoard = copyState(GOAL_STATE);
  // validate input board
  try {
    board = parseInputBoard();
  } catch (error) {
    displayMessage("Invalid input board!", false);
    return;
  }
  try {
    goalBoard = parseInputBoard("eight-puzzle-goal");
  } catch (error) {
    displayMessage("Invalid goal board!", false);
    return;
  }
  // create a new puzzle
  puzzle = new EightPuzzle(board, goalBoard);
  let solved = null;
  // try to solve it and show an error if failed
  try {
    solved = puzzle.solve(maxIter);
  } catch (error) {
    displayMessage(error, false);
    return;
  }

  // if solution is found render all  the moves
  if (solved) {
    const solvedStates = [];
    let node = solved;
    while (node) {
      solvedStates.push(node.state);
      node = node.previousNode;
    }
    renderStates(solvedStates.reverse().slice(1));
  } else {
    // otherwise puzzle is unsolvable
    displayMessage("The puzzle is unsolvable!", false);
    return;
  }
  // diplay moves and iterations taken
  displayMessage(
    `Solved in  ${solved.level} moves and ${puzzle.iter} iterations!`
  );
}

// creates and random board and solves it
function randomizeSolveBoard() {
  randomizeBoard();
  solvePuzzle();
}

// solves initial board
solvePuzzle();
