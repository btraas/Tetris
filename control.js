/**
 * Created by Brayd on 4/2/2017.
 */

mytimer = 0;

// does not do any drawing
// does not make sure other blocks can move
function moveDown(idx) {

    idx = parseInt(idx);
    const amount = parseInt(BOARD_X);
    const orig = GAMEDATA[idx].Block;
    const next = GAMEDATA[idx + amount];

    if(orig === null || next === null || typeof next === 'undefined') return false;          // if invalid input or beyond the bounds of game data
    if(next.Block !== null) {
        return false;

        // NO recursion!
        //if(next.blocked) return false;                  // if occupied and can't move it
        //if(!moveDown(idx+amount)) return false; // if occupied and can't move it (recursively)
    }


    GAMEDATA[idx+amount].Block = orig.clone();
    GAMEDATA[idx].Block = null;
    return true;

}

// does not do any drawing
// does not make sure other blocks can move
function moveLR(idx, amount){

    //console.log("moveLR("+idx+", "+amount+")");

    idx = parseInt(idx);
    amount = parseInt(amount);
    const orig = GAMEDATA[idx].Block;
    const next = GAMEDATA[idx + amount];

    if(orig === null || next === null) return false;          // if invalid input or beyond the bounds of game data
    if(next.Point.y !== GAMEDATA[idx].Point.y) return false; // if not the same row
    if(next.Block !== null) {
        //if(next.blocked) return false;                  // if occupied and can't move it
        //if(!moveLR(idx+amount, amount)) return false; // if occupied and can't move it (recursively)
        return false;
    }


    GAMEDATA[idx+amount].Block = orig.clone();
    GAMEDATA[idx].Block = null;
    return true;
}


function rotateShape() {

    let tmpShape = window.CURRENT_SHAPE.clone();
    tmpShape.rotate();

    let replace = [];

    // iterate over game board to find moveables
    for (let i = 0; i < GAMEDATA.length; ++i) {
        // continue looping if not a valid game block, nothing here, or a blocked game block.
        if (GAMEDATA[i] === null || GAMEDATA[i].Block === null || !GAMEDATA[i].Block.controllable) continue;
        replace.push(i);
    }
    if(replace.length === 0) return;

    const tableIdx1 = new TableIndex(replace[0]);
    const beginCol = tableIdx1.x;

    const tableIdx2 = new TableIndex(replace[0] + tmpShape.length());
    let endCol = tableIdx2.x;

    if(endCol < beginCol) {
    //    return false;
    } // cannot cross left/right edges

    // also need to check if crossing the side
    if(checkAddShapeAt(tmpShape, replace[0])) {
        //alert('all good')
        for(let i = 0; i < replace.length; ++i) {
            GAMEDATA[replace[i]].Block = null;
        }
        forceAddShapeAt(window.CURRENT_SHAPE, replace[0]);
    } else if(checkAddShapeAt(tmpShape, replace[0]+1)) {
        //alert('all good')
        for(let i = 0; i < replace.length; ++i) {
            GAMEDATA[replace[i]].Block = null;
        }
        forceAddShapeAt(window.CURRENT_SHAPE, replace[0]+1);
    } else if(checkAddShapeAt(tmpShape, replace[0]-1)) {
        //alert('all good')
        for (let i = 0; i < replace.length; ++i) {
            GAMEDATA[replace[i]].Block = null;
        }
        forceAddShapeAt(window.CURRENT_SHAPE, replace[0] - 1);
    }
    //addShapeAt(window.CURRENT_SHAPE, firstIdx);


}












onkeydown=handleKey;

ARROW_RIGHT = 39;
ARROW_LEFT  = 37;
ARROW_DOWN  = 40;
ARROW_UP    = 38;

window.INPUT_PAUSED = false;

function handleKey(e){
    let keycode = null;

    if(e.event){
        keycode = e.event
    }else if(e.which){
        keycode = e.which
    }

    if( window.INPUT_PAUSED ) return;
    if((keycode === ARROW_LEFT || keycode === ARROW_RIGHT)) {
        let move = false;
        const toMove = [];
        const amount = (keycode === ARROW_LEFT ? -1 : 1);

        // iterate over game board to find moveables
        for (let i = 0; i < GAMEDATA.length; ++i) {

            // continue looping if not a valid game block, nothing here, or a blocked game block.
            if (GAMEDATA[i] === null || GAMEDATA[i].Block === null || !GAMEDATA[i].Block.controllable) continue;

            //var orig1 = GAMEDATA[i].Block;
            //var next1 = i + amount;
            if (GAMEDATA[i+amount] !== null && GAMEDATA[i] !== null
                && GAMEDATA[i+amount].Point !== null && GAMEDATA[i].Point !== null
                && GAMEDATA[i+amount].Point.y === GAMEDATA[i].Point.y
                && !GAMEDATA[i+amount].blocked) {                       // if next is empty/moveable and on this row
                //alert('moving '+i+" to "+nextRow);
                move = true;
                if(!(GAMEDATA[i].Point.x in toMove)) toMove[GAMEDATA[i].Point.x] = [];
                toMove[GAMEDATA[i].Point.x].push(GAMEDATA[i]);
            }
            else { // short circuit, can't move. (space is not empty / not moveable)
                //alert('no can do')

                move = false;
                break;
            }
        }

        if(move && toMove.length > 0) {
            //console.log(toMove);
            let start = 0;
            let increment = 1;
            if(keycode === ARROW_RIGHT) {
                start = toMove.length - 1;
                //var end = 0;
                increment = -1;
            }


            for(let i = start; i >= 0 && i < toMove.length; i+=increment) {

                let cells = toMove[i];

                if(typeof cells === 'undefined') continue;
               // alert(cells.length)
                for(let j = 0; j < cells.length; ++j) {
                    let p = cells[j].Point;


                    moveLR(p.x + (p.y*BOARD_X), amount);
                }

            }
        }


    }


    else if (keycode === ARROW_DOWN) {
        clearInterval(window.interval);
        window.extraScore += 10;
        tick();
        startTimer();
    } else if (keycode === ARROW_UP) {
        rotateShape();
    } else {
        console.log(keycode);
    }
    draw();
}

