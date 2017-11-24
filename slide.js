$(document).ready(function(){
    //Canvas stuff
    var canvas = $("#canvas")[0];
    var ctx = canvas.getContext("2d");
    var w = $(canvas).width();
    var h = $(canvas).height();

    //Lets save the cell width in a variable for easy control
    var side = 3;
    var board;
    var cw = Math.round(w/side);
    var win = false;
    var winstring;
    var enabled = true;
    var time = 0;

    function BoardSlot(x,y,board) {
        this.board = board;
        this.x = x;
        this.y = y;
        this.piece = null;

        this.set_piece = function(aPiece) {
            this.piece = aPiece;
            this.piece.update_board_slot(this);
        }

        this.is_space_now = function() {
            this.board.set_space_slot(this);
        }

        this.render = function() {
            this.piece.render(this.x,this.y);
        }
    }

    function Piece (number,space,original_x,original_y) {
        this.number = number;
        
        this.space = space;
        this.slot = null;

        this.original_x = original_x;
        this.original_y = original_y;
        
        this.update_board_slot = function(aSlot) {
            this.slot = aSlot;
            if (this.space) this.slot.is_space_now();
        }

        this.render = function(x,y) {

            var image = document.getElementById("image");
            var scw = (image.width/side);

            if(this.space && ! win) {

                ctx.fillStyle = "white";
                ctx.fillRect(x*cw, y*cw, cw, cw);

            }
            else
            {
                ctx.drawImage(image, original_x*scw, original_y*scw, scw, scw, x*cw, y*cw, cw, cw);
            }



            ctx.strokeStyle = "white";
            ctx.strokeRect(x*cw, y*cw, cw, cw);

        }

    }

    function Board(side) {
        this.side = side;
        this.slots = [];
        this.space_slot = null;

        this.set_space_slot = function(slot) {
            this.space_slot = slot;
        }


        this.createPiece = function(x,y){
            if(x==y && x == (this.side -1))
                {
                return new Piece((this.side*x) + y,true,x,y);    
                }
            else
             {
                return new Piece((this.side*x) + y,false,x,y);
             }
            
        }

        this.init = function() {
            for(var i = 0; i < this.side; i++)
            {
                for(var j = 0; j < this.side; j++)
                {
                    var slot = new BoardSlot(i,j,this);
                    var piece = this.createPiece(i,j);
                    slot.set_piece(piece);
                    this.slots.push(slot);
                }
            }

            this.shuffle();
        }

        this.shuffle = function() {
            
            for (var i = 0; i < this.slots.length; i++) {
                var random_idx = i + Math.round(Math.random() * (this.slots.length-(i+1)))

                var aux = this.slots[i].piece;
                this.slots[i].set_piece(this.slots[random_idx].piece);
                this.slots[random_idx].set_piece(aux);
            }

            if (this.solvable()) {
                return;
            } else {
                console.log("Not Solvable");
                this.shuffle();
            }
            
        }


        this.solvable = function() {
            
            //Inversions start as 0 -> All numbers in order and space slot in squared position (side*side)
            //So result = even;

            // any legal movement its still even  ->
            //      move up -> I now have the space on uneven position and n + (n-1) more permutations (uneven) so => result = even
            //      move down -> Reverse: even space position and n + (n-1) less permutations => result = even
            //      move left -> ueven space position and one more permutation => result = even
            //      move right -> even space position and one less permutation => result = even

            //Any combination that gets the space on an even slot also shields even permutations
            //Any combination that gets the space on an uneven slot also shields uneven permutations

            var inversions_count = this.get_inversions(this.slots);
            var e = this.space_slot.y + this.space_slot.x;
            return ((inversions_count + e) % 2) == 0;

        }

        this.get_inversions = function (slot_array) {
            var inversions_count = 0;
            for (var i = 0; i < slot_array.length; i++) {
                var actual_item = slot_array[i];
                var permutations = slot_array.filter(function(item,index) {
                    return index > i  && item.piece.number < actual_item.piece.number;
                });
                inversions_count += permutations.length;
            };
            return inversions_count;
        }

        this.render = function() {

            for(var i = 0; i < this.slots.length; i++)
            {
                this.slots[i].render();
            }
        }

        this.idx_slot_at = function(x,y) {
            return (x*this.side) + y;
        }

        this.switch_with = function(direction)
        {
            var direction_to_move = direction.mov(this.space_slot);

            if (direction_to_move.x < 0 || direction_to_move.y < 0 || direction_to_move.x >= this.side || direction_to_move.y >= this.side) { return; }

            var idx_to_move = this.idx_slot_at(direction_to_move.x,direction_to_move.y);
            var idx_space = this.idx_slot_at(this.space_slot.x,this.space_slot.y);

            var aux = this.slots[idx_to_move].piece;
            this.slots[idx_to_move].set_piece(this.slots[idx_space].piece);
            this.slots[idx_space].set_piece(aux);

            this.check_win();
        }

        this.check_win = function (argument) {
            var winning = true;
            for (var i = 0; i < this.slots.length; i++) {
                if (winning) {
                    winning = this.slots[i].piece.number == i;    
                }
            };
            win = winning;
        }
    }

  //directions
    var Left = { mov: function(slot) {  return { x: slot.x -1, y: slot.y } } };
    var Up = { mov: function(slot) {  return { x: slot.x, y: slot.y -1 } } };
    var Right = { mov: function(slot) {  return { x: slot.x +1, y: slot.y } } };
    var Down = { mov: function(slot) {  return { x: slot.x , y: slot.y +1 } } };
   
    function paint()
    {
        time += 1;

        //We need to paint the BG on every frame
        //Lets paint the canvas now
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "black";
        ctx.strokeRect(0, 0, w, h);

        
        board.render();    

        document.getElementById("time").textContent = time + "";

        if(win && enabled)
        {
            alert("Ganaste");
            enabled = false;
        }        

        
    }


    $("#restart").on("click",function(e) {
            init();
            return;
        });

    

    function init()
    {
        side = document.getElementById("sides").value;
        cw = Math.round(w/side);
        win = false;
        enabled = true;
        board = new Board(side);
        board.init();

        time = 0;

        if(typeof game_loop != "undefined") clearInterval(game_loop);
        game_loop = setInterval(paint, 60);
    }


    //Lets add the keyboard controls now
    $(document).keydown(function(e){
        if  (!enabled) {return;}
        var key = e.which;
        //We will add another clause to prevent reverse gear
        if(key == "37") board.switch_with(Left);
        else if(key == "38") board.switch_with(Up);
        else if(key == "39") board.switch_with(Right);
        else if(key == "40") board.switch_with(Down);
        //The snake is now keyboard controllable
    });

    init();
});
