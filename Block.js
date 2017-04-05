/**
 * Created by Brayd on 4/2/2017.
 */

function Block(point, size, color) {
    this.Point = point; // point within the original shape.. doesn't mean anything after placing on the gameboard really.
    this.ShapePos = null;
    this.controllable = false;

    this.size = size;
    this.color = color;

    this.init = function() {
        this.ShapePos = new Point(this.size*this.Point.x, this.size*this.Point.y);
    };
    this.init();


    this.clone = function() {
        let block = new Block(this.Point, this.size, this.color);
        block.controllable = this.controllable;
        return block;
    };

    this.element = function() {
        if(this.Point === null || !this.size || isNaN(this.ShapePos.x)) return null;

        let e = document.createElement("div");
        e.className = 'block';
        e.style.height = this.size + "px";
        e.style.width  = this.size + "px";
        e.style.backgroundColor = this.color;
        e.style.boxShadow = "inset 0px 1px 4px 2px rgba(0,0,0,0.3)";

        return e;
    };


}

function Point(x, y) {
    this.orientation = 0;
    this.x = x;
    this.y = y;
    const self = this;

    this.shift = function(x,y) {
        this.x += x;
        this.y += y;
        return self;
    };

    this.invert = function() {
        let tmpX = this.x;
        this.x = this.y;
        this.y = tmpX;
    };
    this.rotate = function() {
        if(this.orientation % 1 === 1) this.x = this.x/-1;
        else this.y = this.y/-1;

        this.invert();

        this.orientation++;
    }
}

function TableIndex(idx) {
    this.x = idx % BOARD_X;
    this.y = parseInt(idx / BOARD_X);

    this.cell = new Cell(this.x, this.y);
    this.cell.refresh();
}

function Cell(x, y) {
    this.blocked = false;
    this.Point = new Point(x,y);
    this.Block = null;
    this.connectedToBottom = false;

    this.idx = function() {
        return x + (BOARD_X*y);
    };
    this.tableIndex = function() {
        return new TableIndex(this.idx());
    };
    this.refresh = function() {
        let tmpCell = GAMEDATA[this.idx()];
        if(tmpCell === null || typeof tmpCell === 'undefined') return;
        this.blocked = tmpCell.blocked;
        this.Point = tmpCell.Point;
        this.Block = tmpCell.Block;
        this.connectedToBottom = tmpCell.connectedToBottom;
        //this.cacheConnected = tmpCell.connectedCache;
        //this.cachedTick = tmpCell.cachedTick;
    };
    this.refresh();

    this.cache = function(data) {

      let idx = this.idx();
      if(GAMEDATA[idx] === null || typeof GAMEDATA[idx] === 'undefined') return;
      GAMEDATA[idx].connectedCache = data;
      GAMEDATA[idx].cachedTick = window.ticks;
      this.refresh();

    };


    this.connectedBlocks = function(skip) {
        //console.log("window.ticks ("+window.ticks+") === this.cachedTick ("+this.cachedTick+")? ");

        if(typeof skip === 'undefined') {
            skip = [];
        }

        let found = [];
        if(this.Block === null) return found;

        found.push(this.idx());     // found = everything new
        skip.push(this.idx());      // skip = everything so far

        let nextX = this.Point.x + 1;
        let prevX = this.Point.x - 1;
        let nextY = this.Point.y + 1;
        let prevY = this.Point.y - 1;

        if(nextX < BOARD_X) {
            let cell = new Cell(nextX, this.Point.y);
            if(skip.indexOf(cell.idx()) === -1) {
                let f2 = cell.connectedBlocks(skip);
                found = found.concat(f2);
                skip = skip.concat(f2);
            }
        }

        if(prevX >= 0) {
            let cell = new Cell(prevX, this.Point.y);
            if(skip.indexOf(cell.idx()) === -1) {
                let f2 = cell.connectedBlocks(skip);
                found = found.concat(f2);
                skip = skip.concat(f2);
            }
        }

        if(nextY < BOARD_Y) {
            let cell = new Cell(this.Point.x, nextY);
            if(skip.indexOf(cell.idx()) === -1) {
                let f2 = cell.connectedBlocks(skip);
                found = found.concat(f2);
                skip = skip.concat(f2);
            }
        }

        if(prevY >= 0) {
            let cell = new Cell(this.Point.x, prevY);
            if(skip.indexOf(cell.idx()) === -1) {
                let f2 = cell.connectedBlocks(skip);
                found = found.concat(f2);
                //skip = skip.concat(f2);
            }
        }


        return found;

    };

    this.below = function() {
        if(this.Point.y + 1 >= BOARD_Y) return null;
        return new Cell(this.Point.x, this.Point.y+1);
    };

    this.onBottom = function() {
        let minBottom = (new Cell(0, BOARD_Y-1)).idx();
        return (this.idx() >= minBottom);
    };

    /*
    this.connectedToBottom = function() {
        //let minBottom = (new Cell(0, BOARD_Y-1)).idx();
        //let connected = this.connectedBlocks();
        //for(let i = 0; i < connected.length; ++i) {
            if(connected[i] >= minBottom) return true;
        }
        return false;
    }
    */


}

// shortcut
function p(x,y) {
    return new Point(x, y);
}

function Shape(grid, size, color) {
    this.grid = grid;
    this.size = size;
    this.color = color;
    this.blocks = [];
    const self = this;

    this.init = function() {
        for(let i = 0; i < grid.length; ++i) {
            let tmpBlock = new Block(grid[i], size, color);
            self.blocks.push(tmpBlock);
        }
    };
    this.init();


    this.clone = function() {
        return new Shape(this.grid, this.size, this.color);
    };

    this.length = function() {
        let max = 0;
        for(let i = 0; i < this.blocks.length; ++i) {
            const pt = this.blocks[i].Point.x;
            if(pt > max) max = pt;
        }
        return ++max;
    };

    this.shift = function(x,y){
        for(let i = 0; i < this.blocks.length; ++i) {
            this.blocks[i].Point.shift(x,y);
            this.blocks[i].init();
        }
    };

    // 4-point rotate is: -X to +Y to +X to -Y
    this.rotate = function() {

        let maxX = 0;
        let maxY = 0;

        for(let i = 0; i < this.blocks.length; ++i) {
            if(this.blocks[i].Point.x > maxX) maxX = this.blocks[i].Point.x;
            if(this.blocks[i].Point.y > maxY) maxY = this.blocks[i].Point.y;
        }

        let newMaxX = 0;
        let newMaxY = 0;
        for(let i = 0; i < this.blocks.length; ++i) {
            this.blocks[i].Point.rotate();
            if(this.blocks[i].Point.x > newMaxX) newMaxX = this.blocks[i].Point.x;
            if(this.blocks[i].Point.y > newMaxY) newMaxY = this.blocks[i].Point.y;

        }

        this.shift(maxY-newMaxX, maxX-newMaxY); // keep in bounds

    };

    this.element = function() {
        let div = document.createElement("div");

        for(let i = 0; i < this.blocks.length; ++i) {
            let block = this.blocks[i];
            let inner = document.createElement("div");
            inner.style.position = "absolute";
            inner.style.left = parseInt(block.ShapePos.x+(3*block.Point.x)) + "px";
            inner.style.top  = parseInt(block.ShapePos.y+(3*block.Point.y)) + "px";
            inner.style.border = "1px solid #444444";
            inner.appendChild(block.element());
            div.appendChild(inner);
        }
        return div;

    };


}

if(typeof BLOCK_SIZE === 'undefined') alert('BLOCK_SIZE is undefined!');

SIZE = BLOCK_SIZE;
SHAPES = {};
SHAPES.CYAN     = new Shape([p(0,0), p(1,0), p(2,0), p(3,0)], SIZE, "#00BCD4" );
SHAPES.YELLOW   = new Shape([p(0,0), p(0,1), p(1,0), p(1,1)], SIZE, "#FFEB3B");
SHAPES.ORANGE   = new Shape([p(0,0), p(0,1), p(0,2), p(1,2)], SIZE, "#FF9800");
SHAPES.BLUE     = new Shape([p(0,0), p(0,1), p(1,1), p(2,1)], SIZE, "#2962FF");
SHAPES.PURPLE   = new Shape([p(0,0), p(1,0), p(1,1), p(2,0)], SIZE, "#9C27B0");
SHAPES.GREEN    = new Shape([p(0,0), p(0,1), p(1,1), p(1,2)], SIZE, "#4CAF50");
SHAPES.RED      = new Shape([p(0,0), p(1,0), p(1,1), p(2,1)], SIZE, "#F44336");
