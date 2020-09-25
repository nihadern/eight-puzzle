// finds the index of an element in a 2d array
function boardFind(arr, k) {
  for (let i = 0; i < arr.length; i++)
    for (let j = 0; j < arr.length; j++) if (arr[i][j] === k) return [i, j];
  return null;
}

// copies a board state
function copyState(state) {
  const newState = new Array(state.length);
  for (let i = 0; i < state.length; i++) {
    const row = new Array(state[0].length);
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
      const childState = moveBlank(
        this.state,
        blankRow,
        blankCol,
        moves[i][0],
        moves[i][1]
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

function goalStatePosition(number) {
  // lookup the position of the number in the goal board
  const goalCol = (number - 1) % BOARD_SIZE;
  const goalRow = Math.floor((number - 1) / BOARD_SIZE);
  return [goalRow, goalCol];
}

// first heuristic: the manhatan distance of each tile i.e. h(x)
function manhattanHeuristic(currentState) {
  let score = 0;
  for (let i = 0; i < currentState.length; i++)
    for (let j = 0; j < currentState[0].length; j++) {
      // add the distance to the score for every number except blank
      if (currentState[i][j] !== BLANK) {
        const [goalRow, goalCol] = goalStatePosition(currentState[i][j]);
        score += Math.abs(i - goalRow) + Math.abs(j - goalCol);
      }
    }
  return score;
}

// first heuristic: number of misplaced i.e. h(x)
function hammingHeuristic(currentState) {
  let score = 0;
  for (let i = 0; i < currentState.length; i++)
    for (let j = 0; j < currentState[0].length; j++) {
      // add one to the score if not blank and in a different position than
      // goal
      if (currentState[i][j] !== BLANK) {
        const goalCol = (currentState[i][j] - 1) % BOARD_SIZE;
        const goalRow = Math.floor((currentState[i][j] - 1) / BOARD_SIZE);
        if (goalCol !== j || goalRow !== i) score++;
      }
    }
  return score;
}

// evaluation function for the A* algorithm i.e. f(x)
function evalFunction(currentState, level) {
  // f(x) = h(x) + g(x)
  return manhattanHeuristic(currentState) + level;
}

// the driver for the eight puzzle
class EightPuzzle {
  constructor(initialState) {
    // a puzzle has a start state/node and how many iterations has passed
    this.start = new EightPuzzleNode(initialState, 0, null);
    this.iter = 0;
  }

  // computes the inversion count to determine if the board is solvable
  isSolvable() {
    let inversionCount = 0;
    // inversion is computed with the flatttened array
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
  solve(maxIter = Number.MAX_VALUE) {
    // if the puzzle is not solvable return null to indicate no solution
    if (!this.isSolvable()) return null;
    // compute evaluation function for start node
    this.start.evalScore = evalFunction(this.start.state, this.start.level);

    // priority queue to determine which node to visit first
    const open = new PriorityQueue((a, b) => a.evalScore < b.evalScore);
    // add start node to open list
    open.enqueue(this.start);

    this.iter = 0;
    while (open.length() > 0) {
      // pop the best node
      let currentNode = open.dequeue();

      // solution reached if heuristic is 0
      if (manhattanHeuristic(currentNode.state) === 0) return currentNode;

      // compute eval function for each child node
      currentNode.getChildNodes().forEach((childNode) => {
        // compute f(x) for the child and add it to the queue based on f(x)
        childNode.evalScore = evalFunction(childNode.state, childNode.level);
        open.enqueue(childNode);
      });

      // stops if max iteration is reached (convinience feature)
      this.iter++;
      if (this.iter > maxIter) throw "Max iteration reached!";
    }
    // if all moves exhausted, there is no solution
    return null;
  }
}
