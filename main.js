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

// computes the inversion count to determine if the board is solvable
function isSolvable(currentState) {
  let inversionCount = 0;
  for (let i = 0; i < BOARD_SIZE - 1; i++)
    for (let j = i + 1; j < BOARD_SIZE; j++)
      if (
        currentState[j][i] !== BLANK &&
        currentState[j][i] > currentState[i][j]
      )
        inversionCount++;

  // puzzle is solvable if inversion count is even
  return inversionCount % 2 === 0;
}
// the driver for the eight puzzle
class EightPuzzle {
  constructor(initialState) {
    this.start = new EightPuzzleNode(initialState, 0, null);
    this.open = [];

    this.solve = this.solve.bind(this);
  }

  solve() {
    if (!isSolvable(this.start.state)) return null;
    // compute evaluation function for start node
    this.start.evalScore = evalFunction(
      this.start.state,
      GOAL_STATE,
      this.start.level
    );
    // add start node to open list
    this.open.push(this.start);

    let iter = 0;
    while (true) {
      // pop the best node
      let currentNode = this.open.shift();

      console.log(currentNode.level, currentNode.state);

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
      iter++;
      if (iter > 50) break;
    }
  }
}

puzzle = new EightPuzzle([
  [1, BLANK, 3],
  [4, 2, 6],
  [7, 5, 8],
]);
// puzzle = new EightPuzzle(GOAL_STATE);
console.log(puzzle.solve());
renderState(GOAL_STATE);
