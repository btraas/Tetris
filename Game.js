/**
 * Created by Brayd on 4/4/2017.
 */
const randomProperty = function (obj) {
    const keys = Object.keys(obj);
    return obj[keys[keys.length * Math.random() << 0]];
};

window.NEXT_SHAPE = null;
window.CURRENT_SHAPE = null;
GAMEDATA = [];
window.interval = null;
ticks = 0;
cleared = 0;
extraScore = 0;

function haveBlocks(start, end) {
    for(let i = start; i <= end && i < GAMEDATA.length; ++i) {
        if(i < 0 || GAMEDATA[i] === null) continue;
        if(GAMEDATA[i].Block === null) return false;
    }
    return true;
}

function tick() {
    if(window.NEXT_SHAPE === null) return;
    ++ticks;
    let move = false;
    const toMove = [];

    for(let i = 0; i < GAMEDATA.length; ++i) {
        if(GAMEDATA[i] === null || GAMEDATA[i].Block === null) {
            GAMEDATA[i].blocked = false;
        } else {
            GAMEDATA[i].connectedToBottom = false;
            if (GAMEDATA[i].onBottom()) { // last row
                let connected = GAMEDATA[i].connectedBlocks();
                for(let j = 0; j < connected.length; ++j) {
                    GAMEDATA[connected[j]].connectedToBottom = true;
                }
            }
        }
    }

    for (let i = GAMEDATA.length - 1; i >= 0; --i) {
        const nextRow = i + parseInt(BOARD_X);

        let cell = (new TableIndex(i)).cell;


        /*
        if(GAMEDATA[i].Block !== null && !GAMEDATA[i].blocked) { // if block exists here, and is moveable
            //let orig = GAMEDATA[i].Block;
            if(nextRow < GAMEDATA.length && GAMEDATA[nextRow] !== null && !GAMEDATA[nextRow].blocked) { // if space below is empty/moveable
                //alert('moving '+i+" to "+nextRow);
                move = true;
                toMove.push(i);
            }
            else { // short circuit, can't move. (space below is not empty / not moveable)
                move = false;
                break;
            }
        }
        */
        if(typeof cell === 'undefined' || cell === null || cell.Block === null) continue;


        if(cell.Block.controllable) { // short circuit and prevent moving
            let below = cell.below();
            //console.log(below);

            if(below === null || (below.Block !== null && !below.Block.controllable) ) {
                console.log("breaking");
                console.log(below);
                move = false;
                break;
            }
        }

        if((!cell.connectedToBottom) || cell.Block.controllable) {
            move = true;
            toMove.push(i);
        }
    }
    if(move) { // if we are moving the shape down
        for(let i = 0; i < toMove.length; ++i)
            moveDown(toMove[i]);
    } else {

        // clear blocks
        for(let i = GAMEDATA.length - BOARD_X; i >= 0; i-=BOARD_X) { //iterate from begining of the last line to beginnig of first (one line at a time)
            const end = (i + BOARD_X) - 1;
            if(haveBlocks(i, end)) {            // if this whole row has blocks
                cleared++;
                for(let j = GAMEDATA.length - 1; j >= 0; --j) {
                    GAMEDATA[j].blocked = false;
                    if(GAMEDATA[j].Block !== null) GAMEDATA[j].Block.controllable = false;
                }
                for(let j = end; j >= i; --j) {
                    GAMEDATA[j].Block = null;           // clear blocks
                }
                return;
                /*
                clearInterval(window.interval);
                draw();
                window.INPUT_PAUSED = true;
                window.setTimeout(function(){
                    for(let j = GAMEDATA.length-1; j >= 0; --j) {
                        let cell = (new TableIndex(j)).cell;
                        if(cell.Block !== null) {
                            console.log("moving: ");
                            console.log(cell);
                        }
                        moveDown(j);
                    }
                    draw();
                    window.INPUT_PAUSED = false;
                    startTimer();
                }, 100);

                //window.INPUT_PAUSED = true;
                //setTimeout(tick, 100);
                return;
                */
            }
        }


        for(let i = 0; i < GAMEDATA.length; ++i) { // reset blocked status. TODO change to if stuck only
            GAMEDATA[i].blocked = GAMEDATA[i].Block !== null;
            if(GAMEDATA[i].Block !== null) GAMEDATA[i].Block.controllable = false;
        }
        addShape();
    }
    window.INPUT_PAUSED = false;
    if(window.NEXT_SHAPE !== null) startTimer();
    draw();


}


function moveableBlock(idx) {
    if(idx < 0 || idx >= GAMEDATA.length) return false;
    if(GAMEDATA[idx] === null) return false;
    return !GAMEDATA[idx].blocked;

}

function addShape() {

    let cont = forceAddShapeAt(window.NEXT_SHAPE, 0, 0);

    if(cont) window.NEXT_SHAPE = randomProperty(SHAPES);
    //draw();
}

/*
function addShapeAt(shape, startIdx) {

    if(startIdx < 0) return false;

    if(checkAddShapeAt(shape, startIdx)) forceAddShapeAt(shape, startIdx);


}
*/

function checkAddShapeAt(shape, startIdx) {

    if(startIdx < 0) return false;

    for(let i = 0; i < shape.blocks.length; ++i) {
        const idx = startIdx + shape.blocks[i].Point.x + (shape.blocks[i].Point.y * BOARD_X);
        if(!moveableBlock(idx)) {
            //let tableIndex = new TableIndex(idx);
            //alert('cant move to '+idx.x + ","+idx.y)
            return false;
        }

    }
    return true;

}

function forceAddShapeAt(shape, startIdx) {
    window.CURRENT_SHAPE = shape;

    for(let i = 0;  i < shape.blocks.length; ++i)
    {
        const block = shape.blocks[i];
        block.controllable = true;
        const idx = startIdx + block.Point.x + (block.Point.y * BOARD_X);
        if (!moveableBlock(idx)) {
            window.clearInterval(window.interval);
            window.INPUT_PAUSED = true;
            window.NEXT_SHAPE = null;
            alert('Game Over!');
            return false;
        }
        GAMEDATA[idx].Block = block;
    }
    return true;
}

function replaceChildren(parent, child) {
    while(parent.lastChild) {
        parent.removeChild(parent.lastChild);
    }
    if(child !== null) parent.appendChild(child);
}

function draw() {
    if(!window.NEXT_SHAPE) return false;
    for (let i = GAMEDATA.length - 1; i >= 0; --i) {
        let elem = document.querySelector('#gameTable #cell_'+i);

        if(GAMEDATA[i].Block !== null)
            replaceChildren(elem, GAMEDATA[i].Block.element());
        else
            replaceChildren(elem, null);
    }

    // update score
    let score = (ticks * 10) + (cleared * 1000) + extraScore + "";
    replaceChildren(document.querySelector('#score'), document.createTextNode(score));

    // update next shape
    replaceChildren(document.querySelector('#nextShape'), window.NEXT_SHAPE.element());
}

function startTimer() {
    window.clearInterval(window.interval);
    if(!window.NEXT_SHAPE) return;
    window.interval = window.setInterval(tick, TICK_DELAY);
}

initTable = function() {
    const table = document.createElement("table");
    table.id = "gameTable";
    for(let i = 0; i < BOARD_Y; ++i) {
        const row = document.createElement("tr");
        for(let j = 0; j < BOARD_X; ++j) {
            GAMEDATA.push(new Cell(j,i));
            const cell = document.createElement("td");
            cell.id = "cell_"+(GAMEDATA.length-1);
            cell.width = BLOCK_SIZE;
            cell.height = BLOCK_SIZE;
            cell.border=1;
            row.appendChild(cell)
        }
        table.appendChild(row);
    }
    replaceChildren(document.querySelector('#gameboard'), table);
};


window.onload = function() {

    initTable();
    draw();

};

window.start = function(){

    window.clearInterval(interval);

    window.NEXT_SHAPE = randomProperty(SHAPES);
    window.CURRENT_SHAPE = null;
    window.GAMEDATA = [];
    window.interval = null;
    window.ticks = 0;
    window.cleared = 0;
    window.extraScore = 0;

    initTable();

    //document.querySelector('#nextShape').innerHTML = window.NEXT_SHAPE.html();
    draw();
    startTimer();


};


