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

  parity() {
    let inversionCount = 0;
    // inversion is computed with the flatttened array
    const flatBoard = this.state.flat();
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
  // first heuristic: the manhatan distance of each tile i.e. h(x)
  manhattanHeuristic(goalLookup) {
    let score = 0;
    for (let i = 0; i < this.state.length; i++)
      for (let j = 0; j < this.state[0].length; j++) {
        // add the distance to the score for every number except blank
        if (this.state[i][j] !== BLANK) {
          const [goalRow, goalCol] = goalLookup[this.state[i][j]];
          score += Math.abs(i - goalRow) + Math.abs(j - goalCol);
        }
      }
    return score;
  }

  // first heuristic: number of misplaced i.e. h(x)
  hammingHeuristic(goalLookup) {
    let score = 0;
    for (let i = 0; i < this.state.length; i++)
      for (let j = 0; j < this.state[0].length; j++) {
        // add one to the score if not blank and in a different position than
        // goal
        if (this.state[i][j] !== BLANK) {
          const [goalRow, goalCol] = goalLookup[this.state[i][j]];
          if (goalCol !== j || goalRow !== i) score++;
        }
      }
    return score;
  }

  // evaluation function for the A* algorithm i.e. f(x)
  evalFunction(goalLookup) {
    // f(x) = h(x) + g(x)
    return this.manhattanHeuristic(goalLookup) + this.level;
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

// the driver for the eight puzzle
class EightPuzzle {
  constructor(initialState, goalState) {
    // a puzzle has a start state/node and a goal node/state
    this.start = new EightPuzzleNode(initialState, 0, null);
    this.goal = new EightPuzzleNode(goalState, 0, null);

    // create a goal map for faster goal lookup
    this.goalLookup = new Map();

    for (let i = 0; i < goalState.length; i++)
      for (let j = 0; j < goalState.length; j++)
        this.goalLookup[goalState[i][j]] = [i, j];

    //how many iterations has passed
    this.iter = 0;
  }

  // computes the inversion count to determine if the board is solvable
  isSolvable() {
    // solvable if the parity of the goal and start are the same
    return this.start.parity() === this.goal.parity();
  }

  solve(maxIter = Number.MAX_VALUE) {
    // if the puzzle is not solvable return null to indicate no solution
    if (!this.isSolvable()) return null;
    // compute evaluation function for start node
    this.start.evalScore = this.start.evalFunction(this.goalLookup);

    // priority queue to determine which node to visit first
    const open = new PriorityQueue((a, b) => a.evalScore < b.evalScore);
    // add start node to open list
    open.enqueue(this.start);

    this.iter = 0;
    while (open.length() > 0) {
      // pop the best node
      let currentNode = open.dequeue();

      // solution reached if heuristic is 0
      if (currentNode.manhattanHeuristic(this.goalLookup) === 0)
        return currentNode;

      // compute eval function for each child node
      currentNode.getChildNodes().forEach((childNode) => {
        // compute f(x) for the child and add it to the queue based on f(x)
        childNode.evalScore = childNode.evalFunction(this.goalLookup);
        open.enqueue(childNode);
      });

      // stops if max iteration is reached (convinience feature)
      this.iter++;
      if (this.iter > maxIter) throw "Max iterations reached!";
    }
    // if all moves exhausted, there is no solution
    return null;
  }
}
