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
    // js method binding
    this.getChildNodes = this.getChildNodes.bind(this);
  }

  getChildNodes() {
    // find the blank index
    const [blankX, blankY] = arrayFind(this.state, BLANK);
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
          new EightPuzzleNode(childState, this.level + 1, null)
        );
    });

    return validChildren;
  }
}

// first heuristic: number of misplaced time i.e. h(x)
function misplacedHeuristic(currentState, goalState) {
  score = 0;
  for (let i = 0; i < goalState.length; i++)
    for (let j = 0; j < goalState[0].length; j++) {
      if (currentState[i][j] !== goalState[i][j]) score += 1;
    }
  return score;
}

// evaluation function for the A* algorithm i.e. f(x)
function evalFunction(currentState, goalState, level) {
  return misplacedHeuristic(currentState, goalState) + level;
}

// the driver for the eight puzzle
class EightPuzzle {
  constructor(initialState) {
    this.start = new EightPuzzleNode(initialState, 0, null);
    this.open = [];
    this.closed = [];
  }

  solve() {
    // compute evaluation function for start node
    this.start.evalScore = evalFunction(
      this.start.state,
      GOAL_STATE,
      this.start.level
    );
    // add start node to open list
    this.open.push(this.start);

    while (true) {
      // pop the best node
      let currentNode = this.open.shift();

      console.log(currentNode.level, currentNode.state);
      // solution reached if heuristic is 0
      if (misplacedHeuristic(currentNode.state, GOAL_STATE) === 0) break;

      // compute eval function for each child node
      currentNode.getChildNodes().forEach((childNode) => {
        childNode.evalScore = evalFunction(
          childNode.state,
          GOAL_STATE,
          childNode.level
        );
        this.open.push(childNode);
      });
      // sort the open list by the evaluation scores
      this.open.sort((nodeA, nodeB) => nodeA.evalScore - nodeB.evalScore);
      // close the current node
      this.closed.push(currentNode);
    }
  }
}

puzzle = new EightPuzzle([
  [2, 8, 3],
  [1, 6, 4],
  [7, BLANK, 5],
]);
puzzle.solve();

renderState(GOAL_STATE);
