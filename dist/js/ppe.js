function ppe(){
    var canvas = document.getElementById('ppe_canvas');
    var cursor = document.getElementById('ppe_cursor');
    var cursorctx = cursor.getContext('2d');
    var ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth - 10;
    canvas.height = window.innerHeight;
    cursor.width = window.innerWidth - 10;
    cursor.height = window.innerHeight;
    var queuePos = 0;
    // var image = $('#ppe_queue').find(">:first-child")[0];
    // var imageContext = image.getContext('2d');

    function draw(e) {
        var pos = getMousePos(canvas, e);
        posx = pos.x;
        posy = pos.y;
        //Cursor
        cursorctx.fillStyle = "#000000";
        cursorctx.clearRect(0, 0, canvas.width, canvas.height); 
        cursorctx.beginPath();
        cursorctx.arc(posx, posy, 50, 0, 2 * Math.PI);
        cursorctx.stroke();
        //Queue Item
        var image = $('#ppe_queue').find(".ppe_queue_selected")[0];
        var imageContext = image.getContext('2d');
        cursorctx.drawImage(image, (posx - image.width/2), (posy - image.height/2), image.width, image.height);
    }
    $(document).on('click', function(){
        var image = $('#ppe_queue').find(".ppe_queue_selected")[0];
        var imageContext = image.getContext('2d');
        ctx.drawImage(image, (posx - image.width/2), (posy - image.height/2), image.width, image.height);
    });
    cursor.addEventListener('mousemove', draw, 0);
    $(document).on('keydown', function(e){
        if(e.keyCode == 37){
            ++queuePos;
        }
        if(e.keyCode == 39){
            queuePos = queuePos - 1;
        }
        $('#ppe_queue').find(".ppe_queue_selected").removeClass('ppe_queue_selected');
        $('#ppe_queue').children().eq(queuePos).addClass('ppe_queue_selected');
    });

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
            y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
        };
    }
}
ppe();