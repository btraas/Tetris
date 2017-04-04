/**
 * Created by Brayd on 4/2/2017.
 */

function Block(point, size, color) {
    this.Point = point;
    this.ShapePos = null;

    this.size = size;
    this.color = color;

    this.init = function() {
        this.ShapePos = new Point(this.size*this.Point.x, this.size*this.Point.y);
    }
    this.init();

    this.clone = function() {
        return new Block(this.Point, this.size, this.color);
    }

    this.html = function() {
        if(this.Point == null || !this.size || isNaN(this.ShapePos.x)) return '';
        return `<div class=block
                          style='
                            position: relative;
                            display: block; 
                            border: 1px solid black;
                            height: ${this.size}px;
                            width: ${this.size}px;
                            background-color: ${this.color}'>
                            
                </div>`;
    }

}

function Point(x, y) {
    this.orientation = 0;
    this.x = x;
    this.y = y;
    var self = this;

    this.shift = function(x,y) {
        this.x += x;
        this.y += y;
        return self;
    }

    this.invert = function() {
        var tmpX = this.x;
        this.x = this.y;
        this.y = tmpX;
    }
    this.rotate = function() {
        if(this.orientation % 1 == 0) this.x = this.x/-1;
        else this.y = this.y/-1;

        this.invert();
        //this.x += 2;
        //this.y += 2;

        this.orientation++;
    }
}

function TableIndex(idx) {
    this.x = idx % BOARD_X;
    this.y = idx / BOARD_X;
}

function Cell(x, y) {
    this.blocked = false;
    this.Point = new Point(x,y);
    this.Block = null;
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
    var self = this;

    this.init = function() {
        $.each(grid, function(key, point){
            var tmpBlock = new Block(point, size, color);
            self.blocks.push(tmpBlock);
        })
    }
    this.init();


    this.clone = function() {
        return new Shape(this.grid, this.size, this.color);
    }

    this.length = function() {
        var max = 0;
        for(let i = 0; i < this.blocks.length; ++i) {
            var pt = this.blocks[i].Point.x;
            if(pt > max) max = pt;
        }
        return ++max;
    }

    this.shift = function(x,y){
        for(let i = 0; i < this.blocks.length; ++i) {
            this.blocks[i].Point.shift(x,y);
            this.blocks[i].init();
        }
    }

    // 4-point rotate is: -X to +Y to +X to -Y
    this.rotate = function() {

        var maxX = 0;
        var maxY = 0;

        for(let i = 0; i < this.blocks.length; ++i) {
            if(this.blocks[i].Point.x > maxX) maxX = this.blocks[i].Point.x;
            if(this.blocks[i].Point.y > maxY) maxY = this.blocks[i].Point.y;
        }

        var newMaxX = 0;
        var newMaxY = 0;
        for(let i = 0; i < this.blocks.length; ++i) {
            this.blocks[i].Point.rotate();
            if(this.blocks[i].Point.x > newMaxX) newMaxX = this.blocks[i].Point.x;
            if(this.blocks[i].Point.y > newMaxY) newMaxY = this.blocks[i].Point.y;

        }

        this.shift(maxY-newMaxX, maxX-newMaxY); // keep in bounds

    }

    this.html = function() {
        var data = "";
        $.each(this.blocks, function(key, block) {
            data += "<div style='position: absolute; left: "+block.ShapePos.x+"px; top: "+block.ShapePos.y+"px;'>" + block.html() + "</div>";
        })
        return data;
    }

}

if(typeof BLOCK_SIZE == 'undefined') alert('BLOCK_SIZE is undefined!');

SIZE = BLOCK_SIZE;
SHAPES = {};
SHAPES.BLUE     = new Shape([p(0,0), p(1,0), p(2,0), p(3,0)], SIZE, "cyan" );
SHAPES.YELLOW   = new Shape([p(0,0), p(0,1), p(1,0), p(1,1)], SIZE, "yellow");
SHAPES.ORANGE   = new Shape([p(0,0), p(0,1), p(0,2), p(1,2)], SIZE, "orange");
SHAPES.GREEN    = new Shape([p(0,0), p(0,1), p(1,1), p(2,1)], SIZE, "green");
SHAPES.PURPLE   = new Shape([p(0,0), p(1,0), p(1,1), p(2,0)], SIZE, "magenta");
