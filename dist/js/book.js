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
$('#login_form').on('submit', function(e){
    e.preventDefault();
    $.ajax({
        type: 'post',
        url: '/login/',
        data: {
            name: $('#login_name').val()
        },
        success: function(data){
            window.location.replace(data);
        }
    });
});
$('.add_select').on('change', function(){
    if($(this).val() == 'chapter'){
        $(this).parent().siblings('.add_passage_icons').hide();
    }
    else{
        $(this).parent().siblings('.add_passage_icons').show();
    }
});
$('[class^=passage_metadata_]').each(function(){
    var metadata = $(this).val();
    metadata = JSON.parse(metadata);
      for (let [key, value] of Object.entries(metadata)) {
            switch(key){
                case 'Hyperlink':
                $(this).siblings('.passage_content').attr('title', value);
                $(this).siblings('.passage_content').click(function(){
                    window.open(value, '_blank');
                });
                break;
                case 'Color':
                $(this).siblings('.passage_content').css('color', value);
                break;
                case 'CSS':
                $(this).siblings('.passage_content').css(JSON.parse(value));
                break;
                case 'Hidden':
                $(this).siblings('.passage_content').css('display', 'none');
                $(this).parent().css('opacity', '0.6');
                break;
                case 'Canvas':
                //circles, squares/rectangles
                //shape.color.x.y.l.w (value = name)or
                //name.x.y
                var canvas = $(this).siblings('.passage_canvas');
                canvas.css('display', 'block');
                var content = $(this).siblings('.passage_content').text();
                var ctx = canvas[0].getContext('2d');
                var name = value;
                var vars = content.split('.');
                var length = vars.length;
                if(length == 6){
                    var shape = vars[0];
                    var color = vars[1];
                    var x = vars[2];
                    var y = vars[3];
                    var l = vars[4];
                    var w = vars[5];
                    ctx.fillStyle = color;
                    if(shape == 'rectangle'){
                        ctx.rect(x, y, l, w);
                        ctx.fill();
                    }
                    else if(shape == 'ellipse'){
                        ctx.arc(x, y, l, 0, 2 * Math.PI);
                        ctx.fill();
                    }
                }
                else if(length == 3){
                    //Get passage content of canvas with same name
                    var x = vars[1];
                    var y = vars[2];
                }
                

            }
        }
});
$('[id^=star_]').on('click', function(){
    var _id = $(this).attr('id').split('_')[1];
    $.ajax({
        type: 'post',
        url: '/star/',
        data: {
            _id: _id
        },
        success: function(data){
            // alert(JSON.stringify(data));
        }
    });
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
    window.location.reload();
};
var doSomethingFileStream = function(){
    $('#categories').html('');
    $.ajax({
        type: 'post',
        url: '/fileStream',
        data: 1,
        success: function(data){
            var categories = `
                <div class="category">
                    <div>
                        <a class="link fileStreamChapter">../</a>
                    </div>
                </div>` + data.dirs;
            $('#fileStreamPath').val(data.path);
            $('#categories').html(categories);
            $('#passages').html('');
            $('#parent_chapter_title').text(data.path);
        }
    });
};
$(document).on('click', '.fileStreamChapter', function(){
    var title = $(this).text();
    var fileStreamPath = $('#fileStreamPath').val();
    if(title == '../'){
        fileStreamPath = fileStreamPath.split('/');
         fileStreamPath.pop();
         fileStreamPath.pop();
        fileStreamPath = fileStreamPath.join('/');
        title = '';
    }
    $.ajax({
        type: 'post',
        url: '/file',
        data: {
            dir: fileStreamPath || '',
            fileName: title
        },
        success: function(data){
            if(data.type == 'file'){
                $('#passages').html(data.data);
                $('#parent_chapter_title').text(fileStreamPath + title);
            }
            else if(data.type == 'dir'){
                var categories = `
                <div class="category">
                    <div>
                        <a class="link fileStreamChapter">../</a>
                    </div>
                </div>` + data.data;
                $('#categories').html(categories);
                $('#fileStreamPath').val(data.dir);
                $('#passages').html('');
            }
            $('#parent_chapter_title').text(data.dir);
            
        }
    });
});
$('#parent_chapter_title').on('click', function(){
    var something = $(this).text();
    //The File Stream is stored in the File Stream
    //and is very dangerous
    if(something == 'Thought Stream'){
        doSomethingFileStream();
    }
    else{
        //The Thought Stream is stored in the database
        something = "Thought Stream"
        doSomethingThoughtStream();
        $(this).text(something);
    }

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
    $(this).attr('name', function(index, attr){
        return attr == 'star-outline' ? 'star' : 'star-outline';
    });
    $(this).toggleClass('gold_color');
});
$('.sun_icon').on('click', function(){
    $(this).toggleClass('gold_color');
});
$('.flag_icon').on('click', function(){
    $(this).toggleClass('crimson_color');
});
$(document).on('click', '.icon_top_add', function(){
    var thiz = $(this);
    $(this).attr('src', function(index, attr){
        if(attr == '/images/ionicons/caret-up-outline.svg'){
            thiz.prop('title', 'Add to Bottom');
            return '/images/ionicons/caret-down-outline.svg';
        }
        else{
            thiz.prop('title', 'Add to Top');
            return '/images/ionicons/caret-up-outline.svg';
        }
    });
});
$('.square_icon').on('click', function(){
    var parentClass = $(this).parent().parent().attr('class').split(' ')[0];
    $(this).attr('name', function(index, attr){
        if(attr == 'square-outline'){
            //add passage to queue
            $('#queue_items').append($('.'+parentClass).clone());
            return 'checkbox-outline';
        }
        else{
            //remove passage from queue
            $('#queue_items .'+parentClass).hide();
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
// window.onscroll = function(ev) {
//     if ((window.innerHeight * 1.5 + window.pageYOffset) >= document.body.offsetHeight) {
//         var chapter = $('#parent_chapter_id').val();
//         var page = parseInt($('#page').val());
//         var isProfile = $('#is_profile').val();
//         if(isProfile != 'true'){
//             $.ajax({
//                 type: 'post',
//                 url: '/paginate',
//                 data: {
//                     page: page,
//                     chapter: chapter
//                 },
//                 success: function(data){
//                     //Add Passages and Chapters based on data
//                     dataObj = JSON.parse(data);
//                     var passages = dataObj.passages;
//                     var chapters = dataObj.chapters;
//                     var html = '';
//                     passages.docs.forEach(function(passage){
//                         html += share.printPassage(passage);
//                     });
//                     $('#book_of_sasame').append(html);
//                     html = '';
//                     //only if ParentChapter is not Sasame
//                     var parentChapterTitle = $('#parent_chapter_title').text();
//                     if(parentChapterTitle != 'Sasame' && $('#right_side_select').val() === 'chapters'){
//                         chapters.docs.forEach(function(chapter){
//                             html += share.printChapter(chapter);
//                         });
//                         $('#categories').append(html);
//                     }
//                     $('#page').val(++page);
                    
//                 }
//             });
//         }
//     }
// };

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
