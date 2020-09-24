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
function clearSolveStates(statesSpaceid = "states") {
  const statesSpace = document.getElementById(statesSpaceid);
  while (statesSpace.firstChild) {
    statesSpace.removeChild(statesSpace.lastChild);
  }
}

function renderStates(states, statesSpaceid = "states") {
  const statesSpace = document.getElementById(statesSpaceid);

  states.forEach((state, i) => {
    const table = document.createElement("table");
    const header = document.createElement("th");
    header.colSpan = BOARD_SIZE;
    header.innerText = `Step ${i + 1}`;
    table.appendChild(header);
    table.id = `state${i}`;
    statesSpace.appendChild(table);

    renderState(state, table.id);
  });
}

// finds the index of an element in a 2d array
function boardFind(arr, k) {
  for (let i = 0; i < arr.length; i++) {
    let j = arr[i].indexOf(k);
    if (j > -1) {
      return [i, j];
    }
  }
  return null;
}

// copies a board state
function copyState(state) {
  let newState = new Array(state.length);
  for (let i = 0; i < state.length; i++) newState[i] = state[i].slice();
  return newState;
}

// moves the blank to the desired position and retuns new state
// retuns null if invalid move / out of bounds
function moveBlank(state, blankX, blankY, moveX, moveY) {
  if (
    // check for bounds
    moveX < BOARD_SIZE &&
    moveX >= 0 &&
    moveY < BOARD_SIZE &&
    moveY >= 0
  ) {
    newState = copyState(state);
    newState[blankX][blankY] = newState[moveX][moveY];
    newState[moveX][moveY] = BLANK;
    return newState;
  } else return null;
}

class EightPuzzleNode {
  constructor(state, level, evalScore, previousNode) {
    // the state of the board
    this.state = state;
    // the level of the node i.e g(n) = cost so far
    // to reach initial state
    this.level = level;
    // the evaluation score  f(n) = g(n) + h(n) where h is the heuristic
    this.evalScore = evalScore;
    // link previous node
    this.previousNode = previousNode;
    // js method binding
    this.getChildNodes = this.getChildNodes.bind(this);
  }

  getChildNodes() {
    // find the blank index
    const [blankX, blankY] = boardFind(this.state, BLANK);
    // try all possible moves
    const moves = [
      [blankX - 1, blankY],
      [blankX + 1, blankY],
      [blankX, blankY - 1],
      [blankX, blankY + 1],
    ];
    // create a node for each valid move
    const validChildren = [];
    moves.forEach(([moveX, moveY]) => {
      const childState = moveBlank(this.state, blankX, blankY, moveX, moveY);
      // only add if move is valid and creates a valid board state
      if (childState)
        validChildren.push(
          new EightPuzzleNode(childState, this.level + 1, null, this)
        );
    });

    return validChildren;
  }
}

// first heuristic: number of misplaced time i.e. h(x)
function manhattanHeuristic(currentState, goalState) {
  let score = 0;
  for (let i = 0; i < goalState.length; i++)
    for (let j = 0; j < goalState[0].length; j++) {
      const [goalX, goalY] = boardFind(goalState, currentState[i][j]);
      score +=
        currentState[i][j] === BLANK
          ? 0
          : Math.abs(i - goalX) + Math.abs(j - goalY);
    }
  return score;
}

// evaluation function for the A* algorithm i.e. f(x)
function evalFunction(currentState, goalState, level) {
  return manhattanHeuristic(currentState, goalState) + level;
}

// the driver for the eight puzzle
class EightPuzzle {
  constructor(initialState) {
    this.start = new EightPuzzleNode(initialState, 0, null);
    this.open = [];

    this.solve = this.solve.bind(this);
    this.isSolvable = this.isSolvable.bind(this);
  }

  // computes the inversion count to determine if the board is solvable
  isSolvable() {
    let inversionCount = 0;
    const flatBoard = this.start.state.flat();
    for (let i = 0; i < flatBoard.length; i++)
      for (let j = i + 1; j < flatBoard.length; j++)
        if (
          flatBoard[j] !== BLANK &&
          flatBoard[i] !== BLANK &&
          flatBoard[j] > flatBoard[i]
        )
          inversionCount++;
    return inversionCount % 2 === 0;
  }
  solve(maxIter) {
    if (!this.isSolvable()) return null;
    // compute evaluation function for start node
    this.start.evalScore = evalFunction(
      this.start.state,
      GOAL_STATE,
      this.start.level
    );
    // add start node to open list
    this.open.push(this.start);

    this.iter = 0;
    while (true) {
      // pop the best node
      let currentNode = this.open.shift();

      // console.log(currentNode.level, currentNode.state);

      // solution reached if heuristic is 0
      if (manhattanHeuristic(currentNode.state, GOAL_STATE) === 0)
        return currentNode;

      // compute eval function for each child node
      currentNode.getChildNodes().forEach((childNode) => {
        childNode.evalScore = evalFunction(
          childNode.state,
          GOAL_STATE,
          childNode.level
        );
        this.open.push(childNode);
      });
      // sort the open list by the evaluation scores/ a prioty list could
      // be used instead
      this.open.sort((nodeA, nodeB) => nodeA.evalScore - nodeB.evalScore);
      this.iter++;
      if (maxIter && this.iter > maxIter) return null;
    }
  }
}

function randomizeBoard(tableName = "eight-puzzle-input") {
  const table = document.getElementById(tableName).childNodes[1];
  const shuffledBoard = GOAL_STATE.flat().sort(() => Math.random() - 0.5);
  for (let i = 0; i < BOARD_SIZE; i++) {
    const row = table.rows[i];
    for (let j = 0; j < BOARD_SIZE; j++)
      row.cells[j].childNodes[0].value = shuffledBoard.pop();
  }
}

function parseInputBoard(tableName = "eight-puzzle-input") {
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

function displayMessage(message, success = true, messageBoxId = "output") {
  const messageBox = document.getElementById(messageBoxId);
  messageBox.style = success ? "color:green;" : "color:red;";
  messageBox.innerText = message;
}

function solvePuzzle() {
  clearSolveStates();
  let maxIter = parseInt(document.getElementById("max-iter").value);
  let board = copyState(GOAL_STATE);

  try {
    board = parseInputBoard();
  } catch (error) {
    displayMessage("Invalid input board!", false);
    return;
  }

  puzzle = new EightPuzzle(board);
  const solved = puzzle.solve(maxIter);
  if (solved) {
    const solvedStates = [];
    let node = solved;
    while (node) {
      solvedStates.push(node.state);
      node = node.previousNode;
    }
    renderStates(solvedStates.reverse());
  } else {
    displayMessage("The puzzle is unsolvable!", false);
    return;
  }
  displayMessage(`Solved in ${puzzle.iter} iterations!`);
}

function randomizeSolveBoard() {
  randomizeBoard();
  solvePuzzle();
}

solvePuzzle();
