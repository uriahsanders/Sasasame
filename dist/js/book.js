//Add passages
// $.fn.serializeObject = function() {
//     var o = {};
//     var a = this.serializeArray();
//     $.each(a, function() {
//         if (o[this.name]) {
//             if (!o[this.name].push) {
//                 o[this.name] = [o[this.name]];
//             }
//             o[this.name].push(this.value || '');
//         } else {
//             o[this.name] = this.value || '';
//         }
//     });
//     return o;
// };
// $('#codeform').on('submit', function(e){
//     e.preventDefault();
//     var info = $(this).serializeObject();
//     alert(JSON.stringify(info));
//     $.ajax({
//         type: 'post',
//         url: '/passage/add_passage/',
//         data: info,
//         success: function(data){
//             alert(data);
//         }
//     });
// });
  $( function() {
    $( document ).tooltip();
    $(document).find('title').remove();
  } );
//search
$('#chapter_search').on('keypress', function(e){
    if(e.which == 13){
        $.ajax({
            type: 'post',
            url: '/search/',
            data: {
                title: $(this).val()
            },
            success: function(data){
                $('.category').remove();
                $('#categories').append(data);
            }
        });

    }
});
$('#add_select').on('change', function(){
    if($(this).val() == 'chapter'){
        $('#add_passage_icons').hide();
    }
    else{
        $('#add_passage_icons').show();
    }
});
$('[id^=star_]').on('click', function(){
    var _id = $(this).attr('id').split('_')[1];
    // $.ajax({
    //         type: 'post',
    //         url: '/star/',
    //         data: {
    //             _id: _id
    //         },
    //         success: function(data){
    //             // alert(JSON.stringify(data));
    //         }
    //     });
});

$('.add_property').on('click', function(){
    $(this).parent().prepend($('#property_select').html());
});
$(document).on('click', '.remove_property', function(){
    $(this).parent().remove();
});
$('#add_sub_property').on('click', function(){
    $('#sub_properties').prepend($('#sub_property_select').html());
});
$(document).on('click', '.remove_property', function(){
    $(this).parent().remove();
});
$(document).on('click', '.passage_content', function(){
    $(this).parent().children('.sub_passages').slideToggle();
});
var doSomethingThoughtStream = function(){

};
var doSomethingFileStream = function(){
    $('#categories').html('');
    $.ajax({
        type: 'post',
        url: '/fileStream',
        data: 1,
        success: function(data){
            var ret = '';
            data.title.forEach(function(item){
                ret += share.printDir(item);
            });
            $('#fileStreamPath').val(data.path);
            $('#categories').html(ret);
            $('#passages').html('');
        }
    });
};
$(document).on('click', '.fileStreamChapter', function(){
    $.ajax({
        type: 'post',
        url: '/file',
        data: {
            dir: $('#fileStreamPath').val() || '',
            fileName: $(this).text()
        },
        success: function(data){
            if(data.type == 'file'){
                $('#passages').html(data.data);
            }
            else if(data.type == 'dir'){
                $('#categories').html(data.data);
            }
            fixIconTitles();
        }
    });
});
$('#parent_chapter_title').on('click', function(){
    var something = $(this).text();
    //The File Stream is stored in the File Stream
    //and is very dangerous
    if(something == 'File Stream'){
        //The Thought Stream is stored in the database
        something = "Thought Stream"
        doSomethingThoughtStream();
    }
    else if(something == 'Thought Stream'){
        something = 'File Stream';
        doSomethingFileStream();
    }
    $(this).text(something);

});
$('#mobile_active_close').on('click', function(){
    $('#mobile_book_menu_main').fadeOut();
    $('#control_panel').fadeIn();
});
$('#mobile_book_menu').on('click', function(){
    $('#control_panel').fadeOut();
    $('#mobile_book_menu_main').css('display', 'block');
});
$('.category').on('mouseover', function(){
    $(this).find('.chapter_flag').show();
});
$('.category').on('mouseout', function(){
    $(this).find('.chapter_flag').hide();
});
$('.category_delete').on('click', function(){
    $(this).parent().fadeOut();
});
$('.star_icon').on('click', function(){
    $(this).attr('src', function(index, attr){
        return attr == '/images/ionicons/star-outline.svg' ? '/images/ionicons/star.svg' : '/images/ionicons/star-outline.svg';
    });
    $(this).toggleClass('gold_color');
});
$('.sun_icon').on('click', function(){
    $(this).toggleClass('gold_color');
});
$('.flag_icon').on('click', function(){
    $(this).toggleClass('crimson_color');
});
$('.square_icon').on('click', function(){
    var parentClass = $(this).parent().parent().attr('class').split(' ')[0];
    $(this).attr('src', function(index, attr){
        if(attr == '/images/ionicons/square-outline.svg'){
            //add passage to queue
            $('#queue_items').append($('.'+parentClass).clone());
            return '/images/ionicons/checkbox-outline.svg';
        }
        else{
            //remove passage from queue
            $('#queue_items .'+parentClass).hide();
            return '/images/ionicons/square-outline.svg';
        }
    });
});

$('#right_side_select').on('change', function(){
    switch($(this).val()){
        case 'chapters':
            $('#queue').hide();
            $('#categories').show();
            $('#right_passages').remove();
            $('#chapter_search').show();
            $('.category').show();
            break;
        case 'brief':
            $('#queue').hide();
            $('#categories').show();
            $('.category').hide();
            $('#chapter_search').hide();
            $('#categories').append('<div id="right_passages">'+$('#passages').html()+'</div>');
            $('#right_passages .passage').css({
                'font-size': '0.5em',
                'padding': '0px',
                'line-height': '10px'
            });
            $('#right_passages').sortable();
            break;
        case 'queue':
            $('#categories').hide();
            $('#right_passages').remove();
            $('#queue').show();
            $('#queue_items').sortable();
            break;
    }
});
$('#more_chapters').on('click', function(){
    var chapter = $('#parent_chapter_id').val();
    var passagePage = parseInt($('#passage_page').val());
    var chapterPage = parseInt($('#chapter_page').val());
    var isProfile = $('#is_profile').val();
    if(isProfile != 'true'){
        $.ajax({
            type: 'post',
            url: '/paginate',
            data: {
                passagePage: passagePage,
                chapterPage: chapterPage,
                chapter: chapter
            },
            success: function(data){
                //Add Passages and Chapters based on data
                dataObj = JSON.parse(data);
                var passages = dataObj.passages;
                var chapters = dataObj.chapters;
                var html = '';
                passages.docs.forEach(function(passage){
                    html += share.printPassage(passage);
                });
                $('#book_of_sasame').append(html);
                html = '';
                //only if ParentChapter is not Sasame
                var parentChapterTitle = $('#parent_chapter_title').text();
                if(parentChapterTitle != 'Sasame' && $('#right_side_select').val() === 'chapters'){
                    chapters.docs.forEach(function(chapter){
                        html += share.printChapter(chapter);
                    });
                    $('#categories').append(html);
                }
                $('#passage_page').val(++passagePage);
                $('#chapter_page').val(++chapterPage);
            }
        });
    }
});
window.onscroll = function(ev) {
    if ((window.innerHeight * 1.5 + window.pageYOffset) >= document.body.offsetHeight) {
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
                        html += share.printPassage(passage);
                    });
                    $('#book_of_sasame').append(html);
                    html = '';
                    //only if ParentChapter is not Sasame
                    var parentChapterTitle = $('#parent_chapter_title').text();
                    if(parentChapterTitle != 'Sasame' && $('#right_side_select').val() === 'chapters'){
                        chapters.docs.forEach(function(chapter){
                            html += share.printChapter(chapter);
                        });
                        $('#categories').append(html);
                    }
                    $('#page').val(++page);
                    fixIconTitles();
                }
            });
        }
    }
};
fixIconTitles();
function fixIconTitles(){
    $('title').each(function(){
        if($(this).text().split('-')[0] == 'ionicons'){
            $(this).remove();
        }
    });
}

// var fixmeTop = $('#codeform').offset().top;       // get initial position of the element

// $(window).scroll(function() {                  // assign scroll event listener

//     var currentScroll = $(window).scrollTop() + 20; // get current position

//     if (currentScroll >= fixmeTop) {           // apply position: fixed if you
//         $('#codeform').css({                      // scroll to that element or below it
//             position: 'fixed',
//             top: '20px',
//             width: '24%'
//         });
//     } else {                                   // apply position: static
//         $('#codeform').css({                      // if you scroll above it
//             position: 'relative',
//             width: 'auto'
//         });
//     }

// });