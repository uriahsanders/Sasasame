if($('#parent_chapter_id').val() != 'Sasame'){
    $('#passages').sortable();
    $(document).on('focus', '.passage_content', function(){
        $('#passages').sortable('disable');
    });
    $(document).on('focusout', '.passage_content', function(){
        $('#passages').sortable({
            disabled: false
        });
    });
}
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
//Record Audio
//Thanks https://medium.com/@bryanjenningz/how-to-record-and-play-audio-in-javascript-faa1b2b3e49b
const recordAudio = () =>
  new Promise(async resolve => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];

    mediaRecorder.addEventListener("dataavailable", event => {
      audioChunks.push(event.data);
    });

    const start = () => mediaRecorder.start();

    const stop = () =>
      new Promise(resolve => {
        mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks);
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          const play = () => audio.play();
          resolve({ audioBlob, audioUrl, play });
        });

        mediaRecorder.stop();
      });

    resolve({ start, stop });
  });
const handleAction = async () => {
    var recorder = await recordAudio();
    var audio;
    $('.mic_record_icon').on('click', async function(){
        switch($(this).data('status')){
            case 'empty':
            $(this).data('status', 'recording');
            $(this).css('color', 'red');
            recorder.start();
            break;
            case 'recording':
            $(this).data('status', 'empty');
            $(this).css('color', 'black');
            var thiz = $(this);
            audio = await recorder.stop();
            audio.play();
            const reader = new FileReader();
            reader.readAsDataURL(audio.audioBlob);
            reader.onload = () => {
              const base64AudioMessage = reader.result.split(',')[1];
              $.ajax({
                    type: 'post',
                    url: '/recordings',
                    data: {
                        recording: base64AudioMessage
                    },
                    success: function(data){
                        thiz.parent().parent().children('.properties').prepend(share.printPropertySelect('Audio', data));
                    }
                });
            };
            recorder = await recordAudio();
            break;
        }
    });
};
handleAction();

$('.codeform_add').on('submit', function(e){
    e.preventDefault();
    var info = $(this).serializeObject();
    var thiz = $(this);
    $.ajax({
        type: 'post',
        url: '/passage/add_passage/',
        data: info,
        success: function(data){
            if(info.type == 'passage'){
                thiz.children('.control_textarea').val('');
                $('.property_select').remove();
                if($('#add_position').val() == 'bottom'){
                    $('#passages').append(data);
                    readPassageMetadata($('#passages').find(">:last-child").children('.metadata'));
                }
                else{
                    $('#passages').prepend(data);
                    readPassageMetadata($('#passages').find(">:first-child").children('.metadata'));
                }
            }
            else if(info.type == 'chapter'){
                $('#chapters').prepend(data);
            }
        }
    });
});
$('#queue_form').on('submit', function(e){
    e.preventDefault();
    $.ajax({
        type: 'post',
        url: '/create_queue_chapter/',
        data: {
            passages: $('#queue_passages').val(),
            title: $('#queue_title').val()
        },
        success: function(data){
            $('#queue').prepend(data);
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
                $('.category').not('#chapter_load').not('#chapter_load_mobile').remove();
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
        $(this).parent().siblings('.properties').hide();
    }
    else{
        $(this).parent().siblings('.add_passage_icons').show();
        $(this).parent().siblings('.properties').show();
    }
});
function jqueryToggle(thiz, func1, func2){
    if(thiz.data('toggle') == 0){
        thiz.data('toggle', 1);
        func2();
    }
    else{
        thiz.data('toggle', 0);
        func1();
    }
}
function readPassageMetadata(thiz){
    var metadata = thiz.val();
    var _id = thiz.attr('id').split('_')[2];
    metadata = JSON.parse(metadata);
    var content = thiz.siblings('.passage_content').text();
    thiz.siblings('.proteins').children('.passage_play').hide();
      for (let [key, value] of Object.entries(metadata)) {
            function playTone(content, lineNumber){
                var lines = content.split("\n");
                var numLines = lines.length;
                var item = lines[lineNumber];
                var vars = item.split('.');
                var frequency = vars[0];
                var type = vars[1];
                var time = vars[2] / 1000;
                var context=new AudioContext()
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
                setTimeout(function(){
                    if(lineNumber + 1 < numLines){
                        playTone(content, lineNumber + 1);
                    }
                }, time * 1000);
            }
            switch(key){
                case 'Hyperlink':
                thiz.siblings('.passage_content').attr('title', value);
                thiz.siblings('.passage_content').css('cursor', 'pointer');
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
                case 'Audio':
                thiz.siblings('.proteins').children('.passage_play').show();
                thiz.siblings('.proteins').children('.passage_play').on('click', function(){
                $(this).parent().siblings('.passage_audio').attr('src', '/recordings/'+value);
                $(this).parent().siblings('.passage_audio').show();
                $(this).parent().siblings('.passage_audio')[0].play();
                });
                break;
                case 'Tone':
                thiz.siblings('.proteins').children('.passage_play').show();
                thiz.siblings('.proteins').children('.passage_play').on('click', function(){
                    playTone(content, 0);   
                });
                break;
                case 'Markdown':
                thiz.siblings('.proteins').children('.passage_play').show();
                thiz.siblings('.proteins').children('.passage_play').on('click', function(){
                    jqueryToggle(thiz, function(){
                        thiz.siblings('.passage_content').html(marked(thiz.siblings('.passage_content').text()));
                    }, function(){
                        thiz.siblings('.passage_content').html(content);
                    });
                });
                break;
                case 'Code':
                //syntax highlight
                thiz.siblings('.passage_content').html('<pre><code class="language-'+value+'">'+content+'</code></pre>');
                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightBlock(block);
                  });
                break;
                case 'Canvas':
                //create a colored polygon
                //format: color, x,y, x,y x,y ...
                var canvas = thiz.siblings('.passage_canvas');
                runCanvasKey(canvas, value);
                    // else if(length == 3){
                    //     //Get passage content of canvas with same name
                    //     var x = vars[1];
                    //     var y = vars[2];
                    //     var find_name = vars[0];
                    //     //Find first canvas that has the same name
                    //     var image = $('#canvas_name_' + find_name).siblings('.passage_canvas')[0];
                    //     var imageContext = image.getContext('2d');
                    //     ctx.putImageData(imageContext.getImageData(0, 0, image.width, image.height), x, y);
                    // }
                // });
                break;
                case 'Eval JS':
                //store value in DOM
                var storage = $('#custom_pairs').val();
                if(storage == ''){
                    storage = {};
                    storage[value] = content;
                }
                else{
                    storage = JSON.parse(storage);
                    storage[value] = content;
                }
                $('#custom_pairs').val(JSON.stringify(storage));
                thiz.siblings('.proteins').children('.passage_play').show();
                thiz.siblings('.proteins').children('.passage_play').on('click', function(){
                    eval(content); 
                });
                break;
                case 'Custom':
                thiz.siblings('.proteins').children('.passage_play').show();
                thiz.siblings('.proteins').children('.passage_play').on('click', function(){
                    //read all value/content pairs from DOM as
                    var pairs = JSON.parse($('#custom_pairs').val());
                    var string = `switch(value){`;
                    for(var key in pairs){
                        string += `
                            case '${key}':
                            ${pairs[key]}
                            break;
                        `;
                    }
                    string += '}';
                    eval(string);
                });
                break;
            }
        }
}
function runCanvasKey(canvas, value){
    var arr = value.split(',').map(x => x.trim());
    var color = arr.shift();
    var poly = arr.slice();
    var max = Math.max.apply(Math, poly.map(x => parseInt(x, 10)));
    var x = [];
    var y = [];
    for(var i=0 ; i < poly.length; i +=2){
        x.push(poly[i])
        y.push(poly[i+1]);
    }
    canvas[0].height = Math.max.apply(Math, y.map(a => parseInt(a, 10)));
    canvas[0].width = Math.max.apply(Math, x.map(a => parseInt(a, 10)));
    canvas.css('display', 'inline-block');
    var ctx = canvas[0].getContext('2d');
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(poly[0], poly[1]);
    for( item=2 ; item < poly.length-1 ; item+=2 ){
        ctx.lineTo( poly[item] , poly[item+1] )
    }

    ctx.closePath();
    ctx.fill();
}
$('[id^=passage_metadata_]').each(function(){
    readPassageMetadata($(this));
});
function flashIcon(thiz, color='gold'){
    thiz.css('color', color);
    setTimeout(function(){
        thiz.css('color', 'black');
    }, 250);
}
$(document).on('click', '[id^=star_]', function(){
    var _id = $(this).attr('id').split('_')[1];
    var thiz = $(this);
    var newCount = parseInt($('.star_count_'+_id).text(), 10) + 1;
    $.ajax({
        type: 'post',
        url: '/star/',
        data: {
            _id: _id
        },
        success: function(data){
            flashIcon(thiz);
            $('.star_count_'+_id).text(newCount);
        }
    });
});
$(document).on('click', '[id^=chapter_star_]', function(){
    var _id = $(this).attr('id').split('_')[2];
    var thiz = $(this);
    $.ajax({
        type: 'post',
        url: '/star_chapter/',
        data: {
            _id: _id
        },
        success: function(data){
            flashIcon(thiz);
        }
    });
});
$('[id^=update_order_]').on('click', function(){
    var _id = $(this).attr('id').split('_')[1];
    $.ajax({
        type: 'post',
        url: '/update_chapter_order/',
        data: {
            passages: JSON.stringify($('#passages').sortable('toArray')),
            chapterID: $('#parent_chapter_id').val()
        },
        success: function(data){
            alert('Updated');
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
    $('#alpha').hide();
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
$(document).on('click', '[id^=passage_flag_]', function(){
    var _id = $(this).attr('id').split('_')[2];
    $.ajax({
        type: 'post',
        url: '/flag_passage',
        data: {
            _id: _id
        },
        success: function(data){
            
        }
    });
});
$(document).on('click', '[id^=chapter_flag_]', function(){
    var _id = $(this).attr('id').split('_')[2];
    $.ajax({
        type: 'post',
        url: '/flag_chapter',
        data: {
            _id: _id
        },
        success: function(data){
            
        }
    });
});
$(document).on('click', '[id^=passage_delete_]', function(){
    var _id = $(this).attr('id').split('_')[2];
    $.ajax({
        type: 'post',
        url: '/delete_passage',
        data: {
            _id: _id
        },
        success: function(data){
            $('#' + _id).remove();
        }
    });
});
$(document).on('click', '[id^=passage_update_]', function(){
    var _id = $(this).attr('id').split('_')[2];
    var content = $(this).parent().siblings('.passage_content').text();
    var thiz = $(this);
    $.ajax({
        type: 'post',
        url: '/update_passage_content',
        data: {
            _id: _id,
            content: content
        },
        success: function(data){
            flashIcon(thiz, 'gold');
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
    if(something == 'Sasame'){
        doSomethingFileStream();
    }
    else{
        something = "Sasame"
        doSomethingThoughtStream();
        $(this).text(something);
    }

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
    // $(this).toggleClass('gold_color');
});
$('.sun_icon').on('click', function(){
    $(this).toggleClass('gold_color');
});
$('.flag_icon').on('click', function(){
    $(this).toggleClass('flagged');
});
$('.graphic_mode').on('click', function(){
    var thiz = $(this);
    jqueryToggle($(this), function(){
        thiz.attr('src', '/images/ionicons/book-sharp.svg');
        thiz.attr('title', 'Book Mode');
        $('#control_blocks').hide();
        $('#ppe').show();
        $('.ppe_option').css('display', 'inline-block');
        $('.book_option').hide();
        $('.option_distraction_free').hide();
        $.ajax({
            type: 'post',
            url: '/ppe',
            data: {
                test: 'test'
            },
            success: function(data){
                $('#ppe_queue').html(data);
                var first = true;
                $('.ppe_queue_canvas').each(function(){
                    if(first){
                        $(this).addClass('ppe_queue_selected');
                    }
                    first = false;
                    runCanvasKey($(this), $(this).data('canvas'));
                });
            }
        });
    }, function(){
        thiz.attr('src', '/images/ionicons/brush-sharp.svg');
        thiz.attr('title', 'Graphic Mode');
        $('#control_blocks').show();
        $('#ppe').hide();
        $('.ppe_option').hide();
        $('.book_option').show();
        if(!$('#mobile_book_menu').is(':visible')){
            $('.option_distraction_free').show();
        }
    });
});

$(document).on('click', '.icon_top_add', function(){
    var thiz = $(this);
    $(this).attr('src', function(index, attr){
        if(attr == '/images/ionicons/caret-up-sharp.svg'){
            thiz.prop('title', 'Add to Bottom');
            $('#add_position').val('bottom');
            return '/images/ionicons/caret-down-sharp.svg';
        }
        else{
            thiz.prop('title', 'Add to Top');
            $('#add_position').val('top');
            return '/images/ionicons/caret-up-sharp.svg';
        }
    });
});
$(document).on('click', '.square_icon', function(){
    var passage = $(this).parent().parent();
    var id = passage.attr('id');
    var content = passage.children('.passage_content').text();
    var metadata = passage.children('.metadata').val();
    var parentPassage = passage.children('.parentPassage').val();
    var passagesJSON = $('#queue_passages').val();
    var passages;
    if(passagesJSON != ''){
        passages = JSON.parse(passagesJSON);
    }
    else{
        passages = {};
    }
    $(this).attr('src', function(index, attr){
        if(attr == '/images/ionicons/square-sharp.svg'){
            //add passage to queue
            $('#queue_items').append(passage.clone().attr('id', 'clone_'+id));
            $('#clone_'+id).children('.sub_passages').remove();
            $('#clone_'+id).children('.proteins').hide();
            $('#queue_items')
            passages[id] = {
                content: content,
                metadata: metadata,
                parentPassage: parentPassage,
                // originalAuthor: passage.author,
            };
            $('#queue_passages').val(JSON.stringify(passages));
            return '/images/ionicons/checkbox-sharp.svg';
        }
        else{
            //remove passage from queue
            $('#queue_items #clone_'+id).remove();
            delete passages[id];
            $('#queue_passages').val(JSON.stringify(passages));
            return '/images/ionicons/square-sharp.svg';
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
            // $('#right_passages').sortable();
            break;
        case 'queue':
            $('#chapter_load').hide();
            $('#categories').hide();
            $('#right_passages').remove();
            $('#queue').show();
            // $('#queue_items').sortable();
            break;
    }
});
$(document).on('click', '.load_more', function(){
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
                    $('#passages').sortable();
                    $('[id^=passage_metadata_]').each(function(){
                        readPassageMetadata($(this));
                    });
                }
                else if(which == 'chapter_load' || which == 'chapter_load_mobile'){
                    var chapters = JSON.parse(data);
                    chapters.docs.forEach(function(chapter){
                        html += share.printChapter(chapter);
                    });
                    $('#categories').append(html);
                    $('#mobile_category_list').append(html);
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
$('.option_distraction_free').on('click', function(){
    if($(this).data('hidden') == 'true'){
        $('#toc').show();
        $('#code').show();
        $('#passage_load').show();
        $('.header').show();
        $(this).data('hidden', 'false')
    }
    else{
        $('#toc').hide();
        $('#code').hide();
        $('.header').hide();
        $('#passage_load').hide();
        $(this).data('hidden', 'true')
    }
});
$('.toggle_tools').on('click', function(){
    if($(this).data('hidden') == 'true'){
        $('.proteins').show();
        $('.passage_author').show();
        $(this).data('hidden', 'false')
    }
    else{
        $('.proteins').hide();
        $('.passage_author').hide();
        $(this).data('hidden', 'true')
    }
});