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
    var keys = thiz.find('.passage_edit_keys').text().split(',');
    var content = thiz.find('.passage_content').text();
    var lastChar = content.substr(content.length - 1, 1);
    if(lastChar == '.' || lastChar == '!' || lastChar == '?'){
        content = content.substr(0, content.length - 1);
    }
    //go through every word in content
    content = content.split(' ');
    for(word of content){
        word = word.toLowerCase();
        switch(word){
            case 'dota':
                thiz.find('.passage_content').css('color', 'crimson');
                break;
            case 'blueberry':
            case 'baby':
                thiz.find('.passage_content').css('color', 'blue');
                break;

        }
    }
    //keys next because they are more important
    //and might undo the above
    //go through every key
    for(key of keys){
        key = key.toLowerCase();
        switch(key){
            case '_hide':
                thiz.hide();
                break;
            case 'red':
                thiz.find('.passage_content').css('color', 'crimson');
                break;
            case 'blue':
                thiz.find('.passage_content').css('color', 'blue');
                break;
            default:
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
$('#chapter_options').click();

