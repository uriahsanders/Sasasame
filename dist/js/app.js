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
        $.ajax({
           type: 'post',
           url: '/update_passage',
           data: {
               _id: thiz.siblings('.passage_id').text(),
               keys: keys,
               content: thiz.siblings('.passage_content').text(),
           },
           success: function(data){
               //Done
           }
        });
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
    //extract keys and content from passage
    var keys = thiz.find('.passage_keys').text().split(',');
    var content = thiz.find('.passage_content').text();
    for(key in keys){
        switch(key){
            case '_hide':
                thiz.hide();
                break;
            default:
                break;
        }
    }

};
//GRA: Golden Road Algorithm
$(document).on('click', '#runGRA', function(){
    $('.passage').each(function(){
        GRA($(this));
    });

});

