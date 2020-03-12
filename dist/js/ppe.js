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
    var masterScale = 1;
    var masterRotate = 0;

    // var image = $('#ppe_queue').find(">:first-child")[0];
    // var imageContext = image.getContext('2d');
    function drawImage(image, x, y, delv){
    delv.setTransform(masterScale, 0, 0, masterScale, posx, posy); // sets scale and origin
    delv.rotate(masterRotate*(Math.PI/180));
    delv.drawImage(image, -image.width / 2, -image.height / 2);
    delv.setTransform(1,0,0,1,0,0);
} 
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
        //Also need to star the related passage
        drawImage(image, (posx - image.width/2), (posy - image.height/2), cursorctx);
        // cursorctx.drawImage(image, (posx - image.width/2*scale), (posy - image.height/2*scale), image.width*scale, image.height*scale);
    }
    function select(e) {
        var pos = getMousePos(canvas, e);
        posx = pos.x;
        posy = pos.y;
        //Cursor
        cursorctx.fillStyle = "#000000";
        cursorctx.clearRect(0, 0, canvas.width, canvas.height); 
        cursorctx.beginPath();
        cursorctx.rect(posx, posy, 100, 100);
        cursorctx.stroke();
    }
    $(document).on('click', '#ppe_mutate', function(){
        var mutationCanvas = $('#ppe_mutation')[0];
        var mutationctx = mutationCanvas.getContext('2d');
        mutationctx.clearRect(0, 0, mutationCanvas.width, mutationCanvas.height);
        var size = parseInt(share.mutate(
            (Math.floor(Math.random() * 9) + 1) + ''
            +
            (Math.floor(Math.random() * 9) + 1) + ''
            , ''), 10);
        if(isNaN(size) || size < 10){
            size = 10;
        }
        console.log(size);
        var sideNumb = parseInt(share.mutate(Math.floor(Math.random() * 9) + 1 + '', ''), 10);
        if(isNaN(sideNumb)){
            sideNumb = 0;
        }
        var rotation = parseInt(share.mutate(
            (Math.floor(Math.random() * 9) + 1) + ''
            +
            (Math.floor(Math.random() * 9) + 1) + ''
            +
            (Math.floor(Math.random() * 9) + 1) + ''
            , ''), 10);
        if(isNaN(rotation)){
            rotation = 0;
        }
        var height = size,
        width = size,
        sideLen = size/2;
        // sideNumb = numSides,
        // rotation = r;
        rotation *= Math.PI/180;
        var xCenter = mutationCanvas.width/2;
        var yCenter = mutationCanvas.height/2;
        mutationctx.beginPath();
        if(sideNumb == 0){
            mutationctx.arc(xCenter, yCenter, sideLen, 0, 2 * Math.PI);
        }
        else{
            mutationctx.moveTo (xCenter +  sideLen * Math.cos(rotation), yCenter +  sideLen *  Math.sin(rotation));           

        }
        for (var i = 1; i <= sideNumb; i += 1) {
            mutationctx.lineTo (xCenter +  sideLen * Math.cos(rotation + (i * 2 * Math.PI / sideNumb)), yCenter +  sideLen *  Math.sin(rotation + (i * 2 * Math.PI / sideNumb)));
        }
        var color1 = '#' + share.mutate('0A1B2C3D4E5F6789', '').substring(0,6);
        var color2 = '#' + share.mutate('0A1B2C3D4E5F6789', '').substring(0,6);
        mutationctx.strokeStyle = color1;
        mutationctx.fillStyle = color2;
        var lineWidth = parseInt(share.mutate(Math.floor(Math.random() * 9) + 1 + '', ''), 10);
        if(isNaN(lineWidth)){
            lineWidth = 0;
        }
        mutationctx.lineWidth = lineWidth;
        // mutationctx.stroke();
        mutationctx.fill();
    });
    $(document).on('click', '#ppe_cursor', function(){
        if($('#ppe_select').data('select') == 'off'){
            var image = $('#ppe_queue').find(".ppe_queue_selected")[0];
            var imageContext = image.getContext('2d');
            drawImage(image, (posx - image.width/2), (posy - image.height/2), ctx);
            // ctx.drawImage(image, (posx - image.width/2*scale), (posy - image.height/2*scale), image.width*scale, image.height*scale);

        }
        else{
            $('<canvas height="100" width="100"class="ppe_queue_canvas"></canvas>')
                .appendTo('#ppe_queue');
                var little = $('#ppe_queue').children().eq(-1)[0];
                var littlectx = little.getContext('2d');
                var data = ctx.getImageData(posx, posy, 100, 100);
                littlectx.putImageData(data, 0, 0);
        }
    });
    $(document).on('click', '#ppe_select', function(){
        var thiz = $(this);
        jqueryToggle($(this), function(){
            thiz.attr('title', 'Draw');
            thiz.attr('src', '/images/ionicons/brush-sharp.svg');
            cursor.removeEventListener('mousemove', draw, 0);
            cursor.addEventListener('mousemove', select, 0);
        }, function(){
            thiz.attr('title', 'Select');
            thiz.attr('src', '/images/ionicons/scan-sharp.svg');
            cursor.removeEventListener('mousemove', select, 0);
            cursor.addEventListener('mousemove', draw, 0);
        }, 'select', ['on', 'off']);
    });
    cursor.addEventListener('mousemove', draw, 0);
    $(document).on('keydown', function(e){
        if($('#ppe_select').data('select') == 'on'){
            $('#ppe_select').click();
        }
        if($('.graphic_mode').attr('title') == 'Book Mode'){
            if(e.keyCode == 37 || e.keyCode == 39){
                if(e.keyCode == 37){
                queuePos = queuePos - 1;
                }
                if(e.keyCode == 39){
                    queuePos = queuePos + 1;
                }
                $('#ppe_queue').find(".ppe_queue_selected").removeClass('ppe_queue_selected');
                $('#ppe_queue').children().eq(queuePos).addClass('ppe_queue_selected');
                // Clear and redraw cursor with new item
                cursorctx.fillStyle = "#000000";
                cursorctx.clearRect(0, 0, canvas.width, canvas.height); 
                cursorctx.beginPath();
                cursorctx.arc(posx, posy, 50, 0, 2 * Math.PI);
                cursorctx.stroke();
                var image = $('#ppe_queue').find(".ppe_queue_selected")[0];
                var imageContext = image.getContext('2d');
                cursorctx.drawImage(image, (posx - image.width/2), (posy - image.height/2), image.width, image.height);
            }
            else if(e.keyCode == 13){
                jqueryToggle($(this), function(){
                    $('#ppe_search_modal').show();
                    $('#ppe_search').focus();
                }, function(){
                    $.ajax({
                        type: 'post',
                        url: '/ppe',
                        data: {
                            search: $('#ppe_search').val()
                        },
                        success: function(data){
                            $('#ppe_queue').append(data);
                            $('#ppe_search_modal').hide();
                        }
                    });
                }, 'ppe_search');
                
            }
        }
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