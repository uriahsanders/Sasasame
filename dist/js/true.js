//For the True PolyPrismatic Engine
var blockWidth = 10;
var blockHeight = 10;
var count = 0;
//in blocks
var width = 10;
var height = 10;
var blocks = [];
// console.log(width);
var row = 0;
var column = 0;
for(var i = 0; i < width; i += 1){
	blocks[i] = [];
	for(var j = 0; j < height; j += 1){
		blocks[i][j] = {
			_id: '#block_'+i+'_'+j,
			height: 10,
			width: 10,
			color: '#000',
		};
		$('#test').append('<div id="block_'+i+'_'+j+'" class="block"></div>');
		$('#'+'block_'+i+'_'+j).data('object', blocks[i][j]);
		$('#'+'block_'+i+'_'+j).css('background', blocks[i][j].color);
		// $(document).on('mouseover', '#'+'block_'+i+'_'+j, function(){
		// 	var data = $(this).data('object');
		// 	$(this).css('background', '#fff');
		// });
	}
	$('#test').append('<br/>');
}
var current = blocks[row][column];
$(current._id).css('background', '#fff');
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
$(document).on('keydown', function(e){
	if(!current){
		current = blocks[0][0];
	}
	$(current._id).css('background', '#000');
	if(e.keyCode == 39){
		row += 1;
	}
	if(e.keyCode == 37){
		row -= 1;
	}
	if(e.keyCode == 38){
		column += 1;
	}
	if(e.keyCode == 40){
		column -= 1;
	}
	console.log(blocks[1][0]);
	current = blocks[column][row];
	$(current._id).css('background', '#fff');
});
