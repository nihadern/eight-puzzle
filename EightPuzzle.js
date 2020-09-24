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
  for (let i = 0; i < state.length; i++) {
    let row = new Array(state[0].length);
    for (let j = 0; j < state[0].length; j++) row[j] = state[i][j];
    newState[i] = row;
  }
  return newState;
}

// moves the blank to the desired position and retuns new state
// retuns null if invalid move / out of bounds
function moveBlank(state, blankRow, blankCol, moveRow, moveCol) {
  if (
    // check for bounds
    moveRow < BOARD_SIZE &&
    moveRow >= 0 &&
    moveCol < BOARD_SIZE &&
    moveCol >= 0
  ) {
    newState = copyState(state);
    newState[blankRow][blankCol] = newState[moveRow][moveCol];
    newState[moveRow][moveCol] = BLANK;
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
  }

  getChildNodes() {
    // find the blank index
    const [blankRow, blankCol] = boardFind(this.state, BLANK);
    // try all possible moves
    const moves = [
      [blankRow - 1, blankCol],
      [blankRow + 1, blankCol],
      [blankRow, blankCol - 1],
      [blankRow, blankCol + 1],
    ];
    // create a node for each valid move
    const validChildren = [];

    for (let i = 0; i < moves.length; i++) {
      const moveRow = moves[i][0];
      const moveCol = moves[i][1];
      const childState = moveBlank(
        this.state,
        blankRow,
        blankCol,
        moveRow,
        moveCol
      );
      // only add if move is valid and creates a valid board state
      if (childState)
        validChildren.push(
          new EightPuzzleNode(childState, this.level + 1, null, this)
        );
    }
    return validChildren;
  }
}

// first heuristic: number of misplaced time i.e. h(x)
function manhattanHeuristic(currentState) {
  let score = 0;
  for (let i = 0; i < currentState.length; i++)
    for (let j = 0; j < currentState[0].length; j++) {
      if (currentState[i][j] !== BLANK) {
        const goalCol = (currentState[i][j] - 1) % BOARD_SIZE;
        const goalRow = Math.floor((currentState[i][j] - 1) / BOARD_SIZE);
        score += Math.abs(i - goalRow) + Math.abs(j - goalCol);
      }
    }
  return score;
}

// evaluation function for the A* algorithm i.e. f(x)
function evalFunction(currentState, level) {
  return manhattanHeuristic(currentState) + level;
}

// the driver for the eight puzzle
class EightPuzzle {
  constructor(initialState) {
    this.start = new EightPuzzleNode(initialState, 0, null);
    this.solve = this.solve.bind(this);
    this.iter = 0;
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
    this.start.evalScore = evalFunction(this.start.state, this.start.level);

    const open = new PriorityQueue((a, b) => a.evalScore > b.evalScore);
    // add start node to open list
    open.enqueue(this.start);

    this.iter = 0;
    while (true) {
      // pop the best node
      let currentNode = open.dequeue();

      // solution reached if heuristic is 0
      if (manhattanHeuristic(currentNode.state) === 0) return currentNode;

      // compute eval function for each child node
      currentNode.getChildNodes().forEach((childNode) => {
        childNode.evalScore = evalFunction(childNode.state, childNode.level);
        open.enqueue(childNode);
      });
      this.iter++;
      if (maxIter && this.iter > maxIter) return null;
    }
  }
}
