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
//expand passage
$(document).on('click', '.passage_expand', function(){
    var text = $(this).text();
    var originals = {
        keys: $(this).siblings('.original_passage_keys').val(),
        content: $(this).siblings('.original_passage_content').val()
    };
    //check against originals to see if Ajax request is needed
    if(text == '+'){
        text = '-';
        $('.passage_content').attr('contenteditable', 'true');
    }
    else{
        text = '+';
        $('.passage_content').attr('contenteditable', 'false');
        //update passage
        //because we are now closing it
        var thiz = $(this);
        var keys = thiz.siblings('.passage_keys').children('.passage_edit_keys').text();
        var content = thiz.siblings('.passage_content').text();
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
               }
            });
        }
    }
    $(this).text(text);
    $(this).siblings('.passage_author').fadeToggle();
    $(this).siblings('.passage_chapter').fadeToggle();
    $(this).siblings('.passage_keys').fadeToggle();
});
//delete passage
//$(document).on('click', '.passage_expand', function(e){
//    var thiz = $(this);
//    //update passage
//    // $.ajax({
//    //     type: 'post',
//    //     url: '/delete_passage',
//    //     data: {
//    //         _id: thiz.siblings('.passage_id').text()
//    //     },
//    //     success: function(data){
//    //         thiz.parent().fadeOut(300, function(){
//    //             $(this).remove();
//    //         });
//    //     }
//    // });
//    $(this).find('.passage_author').fadeToggle();
//    $(this).find('.passage_chapter').fadeToggle();
//    $(this).find('.passage_keys').fadeToggle();
//});
var GRA = function(thiz){
    //keys are read case insensitive
    //extract keys and content from passage
    var keys = thiz.find('.passage_edit_keys').text().split(',').map(item => item.trim());
    var content = thiz.find('.passage_content').text();
    //keys next because they are more important
    //and might undo the above
    //go through every key
    //You have content keys (_html) that read content to work
    //and keys that require arguments (_color:someColor), and have free content
    for(key of keys){
        key = key.toLowerCase();
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
            case '_html':
                //create html
                $('body').append(content);
                break;
            case '_js':
                //eval JS
                //So great and so Evil!
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
                break;
        }
    }

};
//GRA: Golden Road Algorithm
$(document).on('click', '#chapter_options', function(){
    var background = $(this).css('background-color');
    //same as #353535
    if(background == 'rgb(53, 53, 53)'){
        $(this).css('background-color', 'gold');
        //run Golden Road Algorithm
        $('.passage').each(function(){
            GRA($(this));
        });
    }
    else{
        $(this).css('background-color', '#353535');
        //then reload page to reset
        window.location.reload();
    }
});
// $('#chapter_options').click();

