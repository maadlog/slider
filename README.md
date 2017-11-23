# slider
Simple slider game using HTML5 Canvas and Js


# HTML5 and Canvas 2D
## Slider

Application example using jQuery for UI purposes, and HTML5 Canvas and Javascript for rendering and game logic.

### Points of Intrest
#### Solvability Algorithm
The example uses Johnson & Story parity argument to check wether the puzzle has a solution
( [Explanation Here](https://en.wikipedia.org/wiki/15_puzzle#Solvability) )

``` javascript
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
            return item. index > i  && item.piece.number < actual_item.piece.number;
        });
        inversions_count += permutations.length;
    };
    return inversions_count;
}
```
#### Shuffle Algorithm
The example uses basic shuffling based on Fisher-Yates algorithm 
( [Explanation Here](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle) )

``` javascript
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
```
