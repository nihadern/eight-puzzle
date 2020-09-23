const GOAL_STATE = [[1, 2,3],[4,null,5],[6,7,8]]

function renderState(state, tableName="eight-puzzle"){
    const table =  document.getElementById(tableName);
    for(let i=0;i<state.length; i++){
        let row =  table.insertRow();
        for(let j=0; j< state[0].length;j++){
            let col = row.insertCell();
            let input = document.createElement("input");
            input.value = state[i][j];
            col.appendChild(input);
        }
    }
}


class EightPuzzleNode {
    constructor(state, level) {
        this.state = state;
        this.level = level;
    }

    
}


renderState(GOAL_STATE)