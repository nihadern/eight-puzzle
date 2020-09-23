// blank value for the board
const BLANK = null;
// predetermined goal state
const GOAL_STATE = [
  [1, 2, 3],
  [4, null, 5],
  [6, 7, 8],
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
      let input = document.createElement("input");
      input.value = state[i][j];
      col.appendChild(input);
    }
  }
}

// finds the index of an element in a 2d array
function arrayFind(arr, k) {
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
  constructor(state, level, evalScore) {
    // the state of the board
    this.state = state;
    // the level of the node i.e g(n) = cost so far
    // to reach initial state
    this.level = level;
    // the evaluation score  f(n) = g(n) + h(n) where h is the heuristic
    this.evalScore = evalScore;
    this.getChildNodes = this.getChildNodes.bind(this);
  }

  getChildNodes() {
    [blankX, blankY] = arrayFind(this.state, BLANK);
    const moves = [
      [blankX - 1, blankY],
      [blankX + 1, blankY],
      [blankX, blankY - 1],
      [blankX, blankY + 1],
    ];
    const validChildren = [];
    moves.forEach(([moveX, moveY]) => {
      const childState = moveBlank(this.state, blankX, blankY, moveX, moveY);
      if (childState)
        validChildren.push(EightPuzzleNode(childState, this.level + 1, null));
    });

    return validChildren;
  }
}

[blankX, blankY] = arrayFind(GOAL_STATE, BLANK);
console.log(moveBlank(GOAL_STATE, blankX, blankY, 1, 2));

renderState(GOAL_STATE);
