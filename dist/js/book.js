//Add passages
$.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name]) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};
$('.codeform_add').on('submit', function(e){
    e.preventDefault();
    var info = $(this).serializeObject();
    $.ajax({
        type: 'post',
        url: '/passage/add_passage/',
        data: info,
        success: function(data){
            if(info.type == 'passage'){
                $('#passages').prepend(data);
                readPassageMetadata($('#passages').find(">:first-child").children('.metadata'));
            }
            else if(info.type == 'chapter'){
                $('#chapters').prepend(data);
            }
        }
    });
});
  $( function() {
    $( document ).tooltip();
  } );
//search
$('#chapter_search').on('keypress', function(e){
    $('#search_val').val($(this).val());
    if(e.which == 13){
        $.ajax({
            type: 'post',
            url: '/search/',
            data: {
                title: $(this).val()
            },
            success: function(data){
                $('.category').not('#chapter_load').remove();
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
function readPassageMetadata(thiz){
    var metadata = thiz.val();
    var _id = thiz.attr('id').split('_')[2];
    metadata = JSON.parse(metadata);
    var content = thiz.siblings('.passage_content').text();
      for (let [key, value] of Object.entries(metadata)) {
            switch(key){
                case 'Hyperlink':
                thiz.siblings('.passage_content').attr('title', value);
                thiz.siblings('.passage_content').click(function(){
                    window.open(value, '_blank');
                });
                break;
                case 'Color':
                thiz.siblings('.passage_content').css('color', value);
                break;
                case 'CSS':
                thiz.siblings('.passage_content').css(JSON.parse(value));
                break;
                case 'Hidden':
                thiz.siblings('.passage_content').css('display', 'none');
                thiz.siblings().not('.passage_canvas').css('opacity', '0.6');
                break;
                case 'Tone':
                thiz.siblings('.proteins').children('.passage_play').on('click', function(){
                    var lines = content.split("\n");
                    lines.forEach(function(item, index){
                        var context=new AudioContext()
                        var vars = item.split('.');
                        var frequency = vars[0];
                        var type = vars[1];
                        var time = vars[2];
                        var o=null;
                        var g=null;
                        o=context.createOscillator();
                        g=context.createGain();
                        o.type=type;
                        o.connect(g);
                        o.frequency.value=frequency;
                        g.connect(context.destination);
                        o.start(0);
                        g.gain.exponentialRampToValueAtTime(0.00001,context.currentTime+time);
                    });
                });
                break;
                case 'Markdown':
                thiz.siblings('.passage_content').html(marked(content));
                break;
                case 'Code':
                //syntax highlight
                thiz.siblings('.passage_content').html('<pre><code class="language-'+value+'">'+content+'</code></pre>');
                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightBlock(block);
                  });
                break;
                case 'Canvas':
                //circles, squares/rectangles
                //shape.color.x.y.l.w (value = name)or
                //name.x.y
                var canvas = thiz.siblings('.passage_canvas');
                canvas.css('display', 'block');
                var ctx = canvas[0].getContext('2d');
                var name = value;
                // console.log(name);
                thiz.siblings('.canvas_name').attr('id', '#canvas_name_'+value);
                var lines = content.split("\n");
                lines.forEach(function(item, index){
                    var vars = item.split('.');
                    var length = vars.length;
                    if(length == 6 || length == 5){
                        var shape = vars[0];
                        var color = vars[1];
                        var x = vars[2];
                        var y = vars[3];
                        var l = vars[4];
                        var w = vars[5];
                        console.log(color);
                        ctx.fillStyle = color;
                        ctx.strokeStyle = color;
                        if(shape == 'rectangle'){
                            ctx.fillRect(x, y, l, w);
                        }
                        else if(shape == 'circle'){
                            ctx.arc(x, y, l, 0, 2 * Math.PI);
                            ctx.fill();
                        }
                        else if(shape == 'line'){
                            ctx.beginPath();
                            ctx.moveTo(x, y);
                            ctx.lineTo(l, w);
                            ctx.stroke(); 
                        }
                    }
                    else if(length == 3){
                        //Get passage content of canvas with same name
                        var x = vars[1];
                        var y = vars[2];
                        var find_name = vars[0];
                        //Find first canvas that has the same name
                        var image = $('#canvas_name_' + find_name).siblings('.passage_canvas')[0];
                        var imageContext = image.getContext('2d');
                        ctx.putImageData(imageContext.getImageData(0, 0, image.width, image.height), x, y);
                    }
                });
            }
        }
}
$('[id^=passage_metadata_]').each(function(){
    readPassageMetadata($(this));
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
$(document).on('click', '.view_sub', function(){
    $(this).parent().parent().children('.sub_passages').slideToggle();
});
var doSomethingThoughtStream = function(){
    window.location.reload();
};
var doSomethingFileStream = function(){
    $('#categories').html('');
    $('#passage_load').hide();
    $('#chapter_load').hide();
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
$(document).on('click', '[id^=passage_delete_]', function(){
    var _id = $(this).attr('id').split('_')[2];
    $.ajax({
        type: 'post',
        url: '/delete_passage',
        data: {
            _id: _id
        },
        success: function(data){
            $('.passage_' + _id).remove();
        }
    });
});
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
                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightBlock(block);
                  });
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
$(document).on('change', '.property_key', function(){
    var placeholder = '';
    switch($(this).val()){
        case 'Color':
            placeholder = 'Enter a Color';
            break;
        case 'Hidden':
            placeholder = 'True/False';
            break;
        case 'Canvas':
            placeholder = 'shape.color.x.y.l.w or reference.x.y';
            break;
        case 'Tone':
            placeholder = 'frequency.type.seconds';
            break;
    }
    $(this).siblings('.property_value').attr('placeholder',placeholder);
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
            $('#chapter_load').show();
            $('#queue').hide();
            $('#categories').show();
            $('#right_passages').remove();
            $('#chapter_search').show();
            $('.category').show();
            break;
        case 'brief':
            $('#queue').hide();
            $('#chapter_load').hide();
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
            $('#chapter_load').hide();
            $('#categories').hide();
            $('#right_passages').remove();
            $('#queue').show();
            $('#queue_items').sortable();
            break;
    }
});
$('.load_more').on('click', function(){
    var chapter = $('#parent_chapter_id').val();
    var page = parseInt($('#page').val());
    var isProfile = $('#is_profile').val();
    var which = $(this).attr('id');
    if(isProfile != 'true'){
        $.ajax({
            type: 'post',
            url: '/paginate',
            data: {
                page: page,
                chapter: chapter,
                which: which,
                search: $('#search_val').val()
            },
            success: function(data){
                var html = '';
                if(which == 'passage_load'){
                    var passages = JSON.parse(data);
                    passages.docs.forEach(function(passage){
                        html += share.printPassage(passage);
                    });
                    $('#passages').append(html);
                }
                else if(which == 'chapter_load'){
                    var chapters = JSON.parse(data);
                    chapters.docs.forEach(function(chapter){
                        html += share.printChapter(chapter);
                    });
                    $('#categories').append(html);
                }
                $('#page').val(++page);
            }
        });
    }
});
function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
}
function replaceSelectedText(replacementText) {
    var sel, range;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(replacementText));
        }
    } else if (document.selection && document.selection.createRange) {
        range = document.selection.createRange();
        range.text = replacementText;
    }
}
//if in FileStream and Filetype is JS
$(document).on('keydown', function(e){
    if(e.keyCode == 191 && e.ctrlKey){
        var text = getSelectionText().split('\n');
        var ret = [];
        text.forEach(function(line){
            if(line[0] == '/' && line[1] == '/'){
                //uncomment
                if(line[2] == ' '){
                    line = line.substring(3);
                }else{
                    line = line.substring(2);
                }
            }
            else{
                //comment
                line = '// ' + line;
            }
            ret.push(line);
        });
        replaceSelectedText(ret.join("\n"))
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
          });
        e.preventDefault();
    }
});
$(document).on('click', '.file_play', function(){
    var fileName = $('#parent_chapter_title').text();
    $.ajax({
        type: 'post',
        url: '/run_file',
        data: {
            file: fileName,
        },
        success: function(data){
            alert(data);
        }
    });
});
$(document).on('click', '.file_update', function(){
    var fileName = $('#parent_chapter_title').text();
    var fileContent = $(this).parent().siblings('.passage_content').text();
    $.ajax({
        type: 'post',
        url: '/update_file',
        data: {
            file: fileName,
            content: fileContent
        },
        success: function(data){
            alert(data);
        }
    });
});