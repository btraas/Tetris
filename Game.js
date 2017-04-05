/**
 * Created by Brayd on 4/4/2017.
 */


var randomProperty = function (obj) {
    var keys = Object.keys(obj)
    return obj[keys[ keys.length * Math.random() << 0]];
};

NEXT_SHAPE = randomProperty(SHAPES);
CURRENT_SHAPE = null;
GAMEDATA = [];
interval = 0;
ticks = 0;
cleared = 0;

function haveBlocks(start, end) {
    for(let i = start; i <= end && i < GAMEDATA.length; ++i) {
        if(i < 0 || GAMEDATA[i] == null) continue;
        if(GAMEDATA[i].Block == null) return false;
    }
    return true;
}

function tick() {
    var move = false;
    var toMove = [];


    for (let i = GAMEDATA.length - 1; i >= 0; --i) {
        var nextRow = i + parseInt(BOARD_X);
        if(GAMEDATA[i].Block != null && !GAMEDATA[i].blocked) { // if block exists here, and is moveable
            var orig = GAMEDATA[i].Block;
            if(nextRow < GAMEDATA.length && GAMEDATA[nextRow] != null && !GAMEDATA[nextRow].blocked) { // if space below is empty/moveable
                //alert('moving '+i+" to "+nextRow);
                move = true;
                toMove.push(i);
            }
            else { // short circuit, can't move. (space below is not empty / not moveable)
                move = false;
                break;
            }
        }
    }
    if(move) { // if we are moving the shape down
        for(let i = 0; i < toMove.length; ++i)
            moveDown(toMove[i]);
    } else {

        // clear blocks
        for(let i = GAMEDATA.length - BOARD_X; i >= 0; i-=BOARD_X) {
            var end = (i+BOARD_X)-1;
            if(haveBlocks(i, end)) {
                cleared++;
                for(let j = end; j >= 0; --j) {
                    GAMEDATA[j].blocked = false;
                }
                for(let j = end; j >= i; --j) {
                    GAMEDATA[j].Block = null;
                }
                clearInterval(interval);
                draw();
                INPUT_PAUSED = true;
                setTimeout(function(){startTimer(); INPUT_PAUSED = false;}, 100);
                return;
            }
        }


        for(let i = 0; i < GAMEDATA.length; ++i) { // reset blocked status. TODO change to if stuck only
            if(GAMEDATA[i].Block == null) {
                GAMEDATA[i].blocked = false;
            } else {
                GAMEDATA[i].blocked = true;
            }
        }
        addShape();
    }


    draw();




}


function moveableBlock(idx) {
    if(idx < 0 || idx >= GAMEDATA.length) return false;
    if(GAMEDATA[idx] == null) return false;
    if(GAMEDATA[idx].blocked) return false;
    return true;
}

function addShape() {
    var shape = NEXT_SHAPE;

    forceAddShapeAt(NEXT_SHAPE, 0, 0);

    NEXT_SHAPE = randomProperty(SHAPES);
    //draw();
}

function addShapeAt(shape, startIdx) {

    if(startIdx < 0) return false;

    if(checkAddShapeAt(shape, startIdx)) forceAddShapeAt(shape, startIdx);


}

function checkAddShapeAt(shape, startIdx) {

    if(startIdx < 0) return false;

    for(let i = 0; i < shape.blocks.length; ++i) {
        var idx = startIdx + shape.blocks[i].Point.x + (shape.blocks[i].Point.y * BOARD_X);
        if(!moveableBlock(idx)) {
            var tableIndex = new TableIndex(idx);
            //alert('cant move to '+idx.x + ","+idx.y)
            return false;
        }

    };
    return true;

}

function forceAddShapeAt(shape, startIdx) {
    CURRENT_SHAPE = shape;
    $.each(shape.blocks, function(key, block) {
        var idx = startIdx + block.Point.x + (block.Point.y * BOARD_X);
        if(!moveableBlock(idx)) {
            alert('Game Over!');
            window.clearInterval(interval);
            INPUT_PAUSED = true;
            return false;
        }
        GAMEDATA[idx].Block = block;
    });
}

function draw() {
    for (let i = GAMEDATA.length - 1; i >= 0; --i) {
        if(GAMEDATA[i].Block != null)
            $('#gameTable #cell_'+i).html(GAMEDATA[i].Block.html());
        else
            $('#gameTable #cell_'+i).html('');
    }
    $('#nextShape').html(NEXT_SHAPE.html());
}

function startTimer() {
    interval = window.setInterval(function() {tick(); ticks++}, TICK_DELAY);
}

window.onload = function(){
    var table = document.createElement("table");
    table.id = "gameTable";
    for(let i = 0; i < BOARD_Y; ++i) {
        var row = document.createElement("tr");
        for(let j = 0; j < BOARD_X; ++j) {
            GAMEDATA.push(new Cell(j,i));
            var cell = document.createElement("td");
            cell.id = "cell_"+(GAMEDATA.length-1)
            cell.width = BLOCK_SIZE;
            cell.height = BLOCK_SIZE;
            cell.border=1
            row.appendChild(cell)
        }
        table.appendChild(row);
    }
    document.querySelector('#gameboard').appendChild(table)

    $('#nextShape').html(NEXT_SHAPE.html());
    startTimer();


}


