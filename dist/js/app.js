// document.addEventListener("load", function() {
//     document.forms[0].addEventListener("submit", function(e) {
//         e.preventDefault();
//         fetch('/submit', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 // 'Content-Type': 'application/x-www-form-urlencoded',
//             },
//             body: {
//                 "author": document.forms[0].children.name.value,
//                 "content": document.forms[0].children.content.value
//             }
//         }).then(function(response) {
//             console.log("Submitted");
//         });
//     });
// });
// For All Pages
//allow tabs in textareas
var textareas = document.getElementsByTagName('textarea');
var count = textareas.length;
for(var i=0;i<count;i++){
    textareas[i].onkeydown = function(e){
        if(e.keyCode==9 || e.which==9){
            e.preventDefault();
            var s = this.selectionStart;
            this.value = this.value.substring(0,this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
            this.selectionEnd = s+1;
        }
    };
}
var updatePassage = function(thiz){
    var originals = {
        keys: thiz.siblings('.original_passage_keys').val(),
        content: thiz.siblings('.original_passage_content').val()
    };
    var keys = thiz.siblings('.passage_keys').children('.passage_edit_keys').text();
    // var content = thiz.siblings('.passage_content').text();
    // protect new lines
    var content = thiz.siblings('.passage_content').html().replace(/<div>/gi,'').replace(/<\/div>/gi,'\n');
    if(keys != originals.keys || content != originals.content){
        $.ajax({
           type: 'post',
           url: '/update_passage',
           data: {
               _id: thiz.siblings('.passage_id').text(),
               keys: keys,
               content: content,
           },
           success: function(data){
               //Done
               //refresh the GRA
               runGRA();
           }
        });
    }
};
$(document).on('focusout', '.passage', function(){
    updatePassage($(this).find('.passage_expand'));
});
//expand passage
$(document).on('click', '.passage_expand', function(){
    var text = $(this).text();
    //check against originals to see if Ajax request is needed
    if(text == '+'){
        text = '-';
        // $('.passage_content').attr('contenteditable', 'true');
    }
    else{
        text = '+';
        // $('.passage_content').attr('contenteditable', 'false');
        //update passage
        //because we are now closing it
        updatePassage($(this));
    }
    $(this).text(text);
    $(this).siblings('.passage_author').fadeToggle();
    $(this).siblings('.passage_chapter').fadeToggle();
    $(this).siblings('.passage_keys').fadeToggle();
    $(this).siblings('.passage_delete').fadeToggle();
});
//delete passage
$(document).on('click', '.passage_delete', function(e){
    var thiz = $(this);
    //delete passage
    $.ajax({
        type: 'post',
        url: '/delete_passage',
        data: {
            _id: thiz.siblings('.passage_id').text()
        },
        success: function(data){
            thiz.parent().fadeOut(300, function(){
                $(this).remove();
            });
        }
    });
});
var GRA = function(thiz, clicked){
    //keys are read case insensitive
    //extract keys and content from passage
    var keys = thiz.find('.passage_edit_keys').text().split(',').map(item => item.trim());
    var content = thiz.find('.passage_content').text();
    clicked = clicked || false;
    //keys next because they are more important
    //and might undo the above
    //go through every key
    //You have content keys (_html) that read content to work
    //and keys that require arguments (_color:someColor), and have free content
    var count = 0;
    for(key of keys){
        key = key.toLowerCase();
        if(clicked == true){
            //run all keys
        }
        else{
            //don't run JS keys
            if(key == '_js'){
                //JS keys can't autorun
                continue;
            }
        }
        //some keys only run on click, so check for those!
        switch(key){
            case '_kiss_css':
                //run css rules for content
                //line by line, 3 words separated by periods.
                //ex. class.style.value
                var lines = content.split('\n');
                for(line of lines){
                    var words = line.split('.');
                    //how pretty
                    $(words[0]).css(words[1], words[2]);
                }
                break;
            case '_canvas':
                var lines = content.split('\n');
                //add canvas for us to manipulate
                // thiz.find('.passage_content').html('<canvas id="canvas"class="_canvas'+count+'"></canvas>');
                for(line of lines){
                    //check if there is a JS function for line
                    //
                    //each word draws something specific on the canvas
                    switch(line){
                        case 'blueberry':
                            //Draw baby blueberry
                            function draw() {
                              var canvas = thiz.find('.passage_canvas').get(0);
                              if (canvas.getContext) {
                                var ctx = canvas.getContext('2d');
                                //body
                                var drawBody = function(){
                                    ctx.fillStyle = 'lightblue';
                                    ctx.beginPath();
                                    ctx.arc(100, 75, 50, 0, 2 * Math.PI);
                                    ctx.stroke();
                                    ctx.fill();
                                };
                                var drawEyes = function(){
                                    //left
                                    ctx.fillStyle = 'white';
                                    ctx.beginPath();
                                    ctx.arc(75, 75, 20, 0, 2 * Math.PI);
                                    ctx.stroke();
                                    ctx.fill();
                                    ctx.fillStyle = 'black';
                                    ctx.beginPath();
                                    ctx.arc(75, 75, 10, 0, 2 * Math.PI);
                                    ctx.stroke();
                                    ctx.fill();
                                    //right
                                    ctx.fillStyle = 'white';
                                    ctx.beginPath();
                                    ctx.arc(125, 75, 20, 0, 2 * Math.PI);
                                    ctx.stroke();
                                    ctx.fill();
                                    ctx.fillStyle = 'black';
                                    ctx.beginPath();
                                    ctx.arc(125, 75, 10, 0, 2 * Math.PI);
                                    ctx.stroke();
                                    ctx.fill();
                                };
                                var drawMouth = function(){
                                    ctx.beginPath();
                                    ctx.moveTo(85, 110);
                                    ctx.lineTo(110, 110);
                                    ctx.stroke(); 
                                };
                                drawBody();
                                drawEyes();
                                drawMouth();
                              }
                            }
                            draw();
                            break;
                        case 'stick':
                            //Draw stick figure
                          var canvas = thiz.find('.passage_canvas').get(0);
                            var ctx = canvas.getContext('2d');
                            var headx = 75;
                            var heady = 35;
                            var headr = 20;
                            //head
                            ctx.beginPath();
                            ctx.arc(headx, heady, 20, 0, 2 * Math.PI);
                            ctx.stroke();
                            //body
                            ctx.beginPath();
                            ctx.moveTo(headx, heady+20);
                            ctx.lineTo(75, 110);
                            ctx.stroke(); 
                            //left arm
                            ctx.beginPath();
                            ctx.moveTo(headx, heady+30);
                            ctx.lineTo(65, 100);
                            ctx.stroke(); 
                            //right arm
                            ctx.beginPath();
                            ctx.moveTo(headx, heady+30);
                            ctx.lineTo(85, 100);
                            ctx.stroke(); 
                            //left leg
                            ctx.beginPath();
                            ctx.moveTo(75, 110);
                            ctx.lineTo(55, 180);
                            ctx.stroke(); 
                            //right leg
                            ctx.beginPath();
                            ctx.moveTo(75, 110);
                            ctx.lineTo(95, 180);
                            ctx.stroke(); 
                            break;
                    }
                }
                thiz.find('.passage_canvas').fadeIn();
                break;
            case '_html':
                //create html
                $('body').append(content);
                break;
            case '_js':
                //eval js
                //so great and so evil!
                eval(content);
                break;
            case '_hidden':
                thiz.hide();
                break;
            default:
                //for keys that take arguments, ex.
                //_color:some_color
                var keyData = key.split(':');
                if(keyData[0] == '_color'){
                    thiz.find('.passage_content').css('color', keyData[1]);
                }
                else if(keyData[0] == '_class'){
                    thiz.find('.passage_content').addClass(keyData[1]);
                }
                //html can also be called with an argument
                //to stick into passage rather than append to body
                else if(keyData[0] == '_html'){
                    thiz.find('.passage_content').html(keyData[1]);
                }
                else if(keyData[0] == '_canvas'){
                    var lines = content.split('\n');
                    for(line of lines){
                        words = line.split('.');
                        var canvas = thiz.find('.passage_canvas').get(0);
                        var ctx = canvas.getContext('2d');
                        var type = words[0];
                        var radius;
                        var endx;
                        var endy;
                        ctx.strokeStyle = words[1];
                        ctx.beginPath();
                        switch(type){
                            case 'circle':
                                ctx.fillStyle = words[2];
                                ctx.arc(words[3], words[4], words[5], 0, 2 * Math.PI);
                                break;
                            case 'line':
                                ctx.moveTo(words[2], words[3]);
                                ctx.lineTo(words[4], words[5]);
                                break;
                        }
                        ctx.stroke();
                        ctx.fill();
                    }
                    thiz.find('.passage_canvas').fadeIn();
                }
                //for custom keys
                //_custom:key1,key2
                // else if(keyData[0] == '_custom'){
                //     var text = thiz.find('.passage_content').text();
                //     var custom_keys = key_data[1].split(',');

                // }
                break;
        }
        ++count;
    }

};
//show options menu on hover
$(document).on('mouseover', '#chapter_options', function(){
    $('#chapter_options_menu').fadeToggle();
});
$(document).on('click', '#expansion_toggle', function(){
    $('.passage_expand').each(function(){
        $(this).click();
    });
});
//GRA: Golden Road Algorithm
$(document).on('click', '#key_toggle, #chapter_options', function(){
    var background = $('#chapter_options').css('background-color');
    //same as #353535
    if(background == 'rgb(53, 53, 53)'){
        $('#chapter_options').css('background-color', 'gold');
        //run Golden Road Algorithm
        $('.passage').each(function(){
            GRA($(this), true);
        });
    }
    else{
        $('#chapter_options').css('background-color', '#353535');
        //then reload page to reset
        window.location.reload();
    }
});
// $('#chapter_options').click();

function runGRA(){
    $('.passage').each(function(){
        GRA($(this), false);
    });
}
//run auto run keys
//does not include any JS,
//so don't make gold
runGRA();
