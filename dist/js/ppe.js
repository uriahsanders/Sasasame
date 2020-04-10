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
    var isDrawing = false;
    var isErasing = false;
    var fadeCounter = 0;
    var hardOpacity = false;
    var increasingOpacity = false;
    var decreasingOpacity = true;
    var opacity = 1;
    function fadeOut(){
        // if(++fadeCounter % 10 == 0){
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        // }
    }
    // var image = $('#ppe_queue').find(">:first-child")[0];
    // var imageContext = image.getContext('2d');
    function drawImage(image, x, y, delv, realImage=false){
        delv.globalAlpha = opacity;
        delv.setTransform(masterScale, 0, 0, masterScale, posx, posy); // sets scale and origin
        delv.rotate(masterRotate*(Math.PI/180));
        if(realImage && image.width > 300){
            var adjustedHeight = 300 * (image.height/image.width);
            delv.drawImage(image, -300 / 2, -adjustedHeight / 2, 300, adjustedHeight);
        }
        else{
            delv.drawImage(image, -image.width / 2, -image.height / 2);
        }
        delv.setTransform(1,0,0,1,0,0);
    } 
    function draw(e) {
        var pos = getMousePos(canvas, e);
        posx = pos.x;
        posy = pos.y;
        drawCursor();
        if($('#ppe_select').data('select') == 'off' && isDrawing){
            var image = $('#ppe_queue').find(".ppe_queue_selected")[0];
            // var imageContext = image.getContext('2d');
            // fadeOut();
            drawImage(image, (posx - image.width/2), (posy - image.height/2), ctx);
            // ctx.drawImage(image, (posx - image.width/2*scale), (posy - image.height/2*scale), image.width*scale, image.height*scale);
            drawCursor();
        }
    }
    function select(e) {
        var pos = getMousePos(canvas, e);
        posx = pos.x;
        posy = pos.y;
        drawSelect();
        if(isErasing){
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(posx, posy, 50*masterScale, 50*masterScale);
        }
    }
    function drawSelect(){
        cursorctx.fillStyle = "#000000";
        cursorctx.clearRect(0, 0, canvas.width, canvas.height); 
        cursorctx.beginPath();
        cursorctx.rect(posx, posy, 50*masterScale, 50*masterScale);
        cursorctx.stroke();
    }
    // Returns an random integer, positive or negative
    // between the given value
    function randInt(min, max, positive) {

      let num;
      if (positive === false) {
        num = Math.floor(Math.random() * max) - min;
        num *= Math.floor(Math.random() * 2) === 1 ? 1 : -1;
      } else {
        num = Math.floor(Math.random() * max) + min;
      }

      return num;

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
        var color2 = 'rgba('+randInt(0,255)+
        ','+randInt(0,255)+
        ','+randInt(0,255)+
        ','+opacity+
        ')';
        // mutationctx.strokeStyle = color1;
        mutationctx.fillStyle = color2;
        var lineWidth = parseInt(share.mutate(Math.floor(Math.random() * 9) + 1 + '', ''), 10);
        if(isNaN(lineWidth)){
            lineWidth = 0;
        }
        mutationctx.lineWidth = lineWidth;
        if(sideNumb == 2){
            mutationctx.stroke();
        }
        mutationctx.fill();
        drawCursor();
    });
    function drawCursor(){
        //Queue Item
        $('#ppe_queue').find(".ppe_queue_selected").show();
        var image = $('#ppe_queue').find(".ppe_queue_selected")[0];
        var isRealImage = image instanceof HTMLImageElement ? true : false;
        // var imageContext = image.getContext('2d');
        //Cursor
        cursorctx.globalAlpha = 1;
        cursorctx.fillStyle = "#000000";
        cursorctx.clearRect(0, 0, canvas.width, canvas.height); 
        cursorctx.beginPath();
        cursorctx.arc(posx, posy, image.width/2*masterScale, 0, 2 * Math.PI);
        cursorctx.stroke();
        //Also need to star the related passage
        drawImage(image, (posx - image.width/2), (posy - image.height/2), cursorctx, isRealImage);

    }
    $(document).on('click', '#ppe_cursor', function(){
        if($('#ppe_select').data('select') == 'off'){
            var image = $('#ppe_queue').find(".ppe_queue_selected")[0];
            var isRealImage = image instanceof HTMLImageElement ? true : false;
            drawImage(image, (posx - image.width/2), (posy - image.height/2), ctx, isRealImage);
            drawCursor();
        }
        else{
            if($('#ppe_erase').data('on') == 'true'){
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.fillRect(posx, posy, 50*masterScale, 50*masterScale);
            }
            else{
                //select is active; add item to queue
                $('<canvas height="'+50*masterScale+'" width="'+50*masterScale+'"class="ppe_queue_canvas"></canvas>')
                    .appendTo('#ppe_queue');
                    var little = $('#ppe_queue').children().eq(-1)[0];
                    var littlectx = little.getContext('2d');
                    var data = ctx.getImageData(posx, posy, 50*masterScale, 50*masterScale);
                    littlectx.putImageData(data, 0, 0);
                masterScale = 1;
                $('#ppe_queue').find(".ppe_queue_selected").removeClass('ppe_queue_selected');
                queuePos = $('#ppe_queue').children().length - 1;
                $('#ppe_queue').children().eq(queuePos).addClass('ppe_queue_selected');
                $('#ppe_select').click();
                var dataURL = little.toDataURL();
                $('#code').modal();
                $('.properties').prepend($('#property_select').html());
                $('.property_key').val('Canvas');
                $('.property_value').val('Image');
                $('.dataURL').val(dataURL);
                //Now add the passage to database
                // $.ajax({
                //     type: 'post',
                //     url: '/passage/add_passage/',
                //     data: {
                //         type: 'passage',
                //         passage: '',
                //         property_key: 'Canvas',
                //         property_value: 'image',
                //         dataURL: dataURL
                //     },
                //     success: function(data){
                //         console.log(data);
                //     }
                // });
            }
        }
    });
    $(document).on('click', '#ppe_erase', function(){
        var thiz = $(this);
        jqueryToggle($(this), function(){
            thiz.data('on', 'true');
            thiz.css('color', 'gold');
            $('#ppe_select').data('select', 'on');
            cursor.removeEventListener('mousemove', draw, 0);
            cursor.addEventListener('mousemove', select, 0);
            drawSelect();
        }, function(){
            thiz.css('color', '#fff');
            thiz.data('on', 'false');
            cursor.removeEventListener('mousemove', select, 0);
            cursor.addEventListener('mousemove', draw, 0);
            drawCursor();
        });
    });
    $(document).on('click', '#ppe_select', function(){
        var thiz = $(this);
        $('#ppe_erase').data('on', 'false');
        jqueryToggle($(this), function(){
            thiz.attr('title', 'Draw');
            thiz.attr('src', '/images/ionicons/brush-sharp.svg');
            cursor.removeEventListener('mousemove', draw, 0);
            cursor.addEventListener('mousemove', select, 0);
            drawSelect();
        }, function(){
            thiz.attr('title', 'Select');
            thiz.attr('src', '/images/ionicons/scan-sharp.svg');
            cursor.removeEventListener('mousemove', select, 0);
            cursor.addEventListener('mousemove', draw, 0);
            drawCursor();
        }, 'select', ['on', 'off']);
    });
    function cursorSelect(){
        return $('#ppe_select').data('select');
    }
    cursor.addEventListener('mousemove', draw, 0);
    cursor.addEventListener('mousedown', function(){
        isDrawing = true;
        isErasing = true;
    }, 0);
    cursor.addEventListener('mouseup', function(){
        isDrawing = false;
        isErasing = false;
    }, 0);
    $(document).on('keydown', function(e){
        if($('.graphic_mode').attr('title') == 'Book Mode (b)'){
            if(e.keyCode == 80 || e.keyCode == 78){
                //p for previous
                if(e.keyCode == 80){
                queuePos = queuePos - 1;
                }
                //n for next
                if(e.keyCode == 78){
                    queuePos = queuePos + 1;
                }
                $('#ppe_queue').find(".ppe_queue_selected").removeClass('ppe_queue_selected');
                
                if(queuePos >= $('#ppe_queue').children().length){
                    queuePos = 0;
                }
                if(queuePos < 0){
                    queuePos = $('#ppe_queue').children().length;
                }
                $('#ppe_queue').children().eq(queuePos).addClass('ppe_queue_selected');

                // Clear and redraw cursor with new item
                // cursorctx.fillStyle = "#000000";
                cursorctx.clearRect(0, 0, canvas.width, canvas.height); 
                drawCursor();
                // cursorctx.beginPath();
                // cursorctx.arc(posx, posy, 50, 0, 2 * Math.PI);
                // cursorctx.stroke();
                // var image = $('#ppe_queue').find(".ppe_queue_selected")[0];
                // var imageContext = image.getContext('2d');
                // cursorctx.drawImage(image, (posx - image.width/2), (posy - image.height/2), image.width, image.height);
            }
            //Search on space
            // else if(e.keyCode == 32){
            //     jqueryToggle($(this), function(){
            //         $('#ppe_search_modal').show();
            //         $('#ppe_queue').show();
            //         $('#ppe_search').focus();
            //         $('#ppe_search').select();
            //     }, function(){
            //         $.ajax({
            //             type: 'post',
            //             url: '/ppe_search',
            //             data: {
            //                 search: $('#ppe_search').val()
            //             },
            //             success: function(data){
            //                 $('#ppe_queue').append(data);
            //                 $('#ppe_search_modal').hide();
            //             }
            //         });
            //     }, 'ppe_search');
                
            // }
            //Create passage on space
            // else if(e.keyCode == 32){
            //     jqueryToggle($(this), function(){
            //         $('#ppe_create_modal').show();
            //         $('#ppe_create').focus();
            //         $('#ppe_create').select();
            //     }, function(){
            //         $.ajax({
            //             type: 'post',
            //             url: '/ppe_create',
            //             data: {
            //                 title: $('#ppe_search').val()
            //             },
            //             success: function(data){
            //                 $('#ppe_queue').append(data);
            //                 $('#ppe_search_modal').hide();
            //             }
            //         });
            //     }, 'ppe_search');
                
            // }
            //m for mutate
            else if(e.keyCode == 77){
                if($('#ppe_select').data('select') == 'on'){
                    $('#ppe_select').click();
                }
                $('#ppe_mutate').click();
                $('#ppe_queue').find(".ppe_queue_selected").removeClass('ppe_queue_selected');
                $('#ppe_queue').children().eq(0).addClass('ppe_queue_selected');
                drawCursor();
            }
            //o for toggle opacity
            else if(e.keyCode == 79){
                if(opacity > 1){
                    opacity = 1;
                }
                if(opacity < 0.02){
                    opacity = 0.02;
                }
                if(opacity == 1){
                    decreasingOpacity = true;
                    increasingOpacity = false;
                }
                if(opacity == 0.02){
                    increasingOpacity = true;
                    decreasingOpacity = false;
                }
                if(increasingOpacity){
                    opacity += 0.02;
                }
                if(decreasingOpacity){
                    opacity -= 0.02;
                }
                if(e.shiftKey){
                    increasingOpacity = !increasingOpacity;
                    decreasingOpacity = !decreasingOpacity;
                }
                drawCursor();
            }
            //e for erase
            else if(e.keyCode == 69){
                $('#ppe_erase').click();
            }
            //q for select
            else if(e.keyCode == 81){
                masterScale = 1;
                $('#ppe_select').click();
            }
            //s for scale
            else if(e.keyCode == 83){
                if(e.shiftKey){
                    masterScale -= 0.01;
                }
                else{
                    masterScale += 0.01;
                }
                if(cursorSelect() == 'off'){
                    drawCursor();
                }
                else if(cursorSelect() == 'on'){
                    drawSelect();
                }
            }
            //r for rotate
            else if(e.keyCode == 82){
                if(e.shiftKey){
                    masterRotate -= 1;
                }
                else{
                    masterRotate += 1;
                }
                drawCursor();
            }
            //c for clear
            else if(e.keyCode == 67){
                if(e.shiftKey){
                    //clear entire canvas
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
                masterRotate = 0;
                masterScale = 1;
                opacity = 1;
                drawCursor();
            }
            //f for fade
            else if(e.keyCode == 70){
                fadeOut();
            }
            //b for book mode
            else if(e.keyCode == 66){
                $('.graphic_mode').click()
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