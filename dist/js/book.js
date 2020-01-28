// For the Book of Sasame
$('#mobile_active_close').on('click', function(){
    $('#mobile_book_menu_main').fadeOut();
    $('#control_panel').fadeIn();
});
$('#mobile_book_menu').on('click', function(){
    $('#control_panel').fadeOut();
    $('#mobile_book_menu_main').css('display', 'block');
});
$('.category').on('mouseover', function(){
    $(this).find('.category_delete').css('color', '#353535');
});
$('.category').on('mouseout', function(){
    $(this).find('.category_delete').css('color', 'transparent');
});
$('.category_delete').on('click', function(){
    $(this).parent().fadeOut();
});
$('.star_icon').on('click', function(){
    $(this).attr('name', function(index, attr){
        return attr == 'star-outline' ? 'star' : 'star-outline';
    });
    $(this).toggleClass('gold_color');
});
$('.square_icon').on('click', function(){
    var parentClass = $(this).parent().parent().attr('class').split(' ')[0];
    $(this).attr('name', function(index, attr){
        if(attr == 'square-outline'){
            //add passage to queue
            $('#queue').append($('.'+parentClass).clone());
            return 'checkbox-outline';
        }
        else{
            //remove passage from queue
            $('#queue .'+parentClass).hide();
            return 'square-outline';
        }
    });
});
$('#right_side_select').on('change', function(){
    switch($(this).val()){
        case 'chapters':
            $('#queue').hide();
            $('#categories').show();
            $('#right_passages').remove();
            $('#right_panel_search').show();
            $('.category').show();
            break;
        case 'brief':
            $('#queue').hide();
            $('#categories').show();
            $('.category').hide();
            $('#right_panel_search').hide();
            $('#categories').append('<div id="right_passages">'+$('#passages').html()+'</div>');
            $('#right_passages .passage').css({
                'font-size': '0.3em',
                'padding': '0px',
                'line-height': '6px'
            });
            break;
        case 'queue':
            $('#categories').hide();
            $('#right_passages').remove();
            $('#queue').show();
            break;
    }
});
//Infinite scroll for the Book of Sasame
window.onscroll = function(ev) {
    if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
        var chapter = $('#parent_chapter_id').val();
        var page = parseInt($('#page').val());
        var isProfile = $('#is_profile').val();
        if(isProfile != 'true'){
            $.ajax({
                type: 'post',
                url: '/paginate',
                data: {
                    page: page,
                    chapter: chapter
                },
                success: function(data){
                    //Add Passages and Chapters based on data
                    dataObj = JSON.parse(data);
                    var passages = dataObj.passages;
                    var chapters = dataObj.chapters;
                    var html = '';
                    passages.docs.forEach(function(passage){
                        html = '<div class="passage"> <div class="passage_expand">+</div>';
                        if(typeof passage.chapter != 'undefined' && typeof passage.chapter.title != 'undefined'){
                            html += ' <div class="passage_chapter"><a class="basic_link"href="/sasasame/'+passage.chapter.title+'/'+passage.chapter._id+'">'+passage.chapter.title+'></a></div>';
                        }
                        else{
                            html += '<div class="passage_chapter">Sasame</div>';
                        }
                        // html += '<div class="passage_author">'+passage.author+'</div>';
                        if(passage.keys != ''){
                            html += ' <div class="passage_keys">Keys: <div class="passage_edit_keys" contenteditable="true">'+passage.keys+'</div></div>';
                            html += '<input type="hidden" class="original_passage_keys" value="'+passage.keys+'"/>';
                        }
                        else{
                            html += ' <div class="passage_keys">Keys: <div class="passage_edit_keys" contenteditable="true"></div></div>';
                            html += '<input type="hidden" class="original_passage_keys" value=""/>';
                        }
                        html += '<div class="passage_content">'+passage.content+'</div> <div class="passage_id">'+passage._id+'</div></div>';
                        html += '<input type="hidden" class="original_passage_content" value="'+passage.content+'"/>';
                        $('#book_of_sasame').append(html);
                    });
                    html = '';
                    //only if ParentChapter is not Sasame
                    var parentChapterTitle = $('#parent_chapter_title').text();
                    if(parentChapterTitle != 'Sasame'){
                        chapters.docs.forEach(function(chapter){
                            html = '<p class="category"><a class="link" href="/sasasame/'+chapter.title+'/'+chapter._id+'">'+chapter.title+'</a></p>';
                            $('#categories').append(html);
                        });
                    }
                    $('#page').val(++page);
                }
            });
        }
    }
};

var fixmeTop = $('#codeform').offset().top;       // get initial position of the element

$(window).scroll(function() {                  // assign scroll event listener

    var currentScroll = $(window).scrollTop() + 20; // get current position

    if (currentScroll >= fixmeTop) {           // apply position: fixed if you
        $('#codeform').css({                      // scroll to that element or below it
            position: 'fixed',
            top: '20px',
            width: '24%'
        });
    } else {                                   // apply position: static
        $('#codeform').css({                      // if you scroll above it
            position: 'relative',
            width: 'auto'
        });
    }

});