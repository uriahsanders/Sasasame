var Sasame = true;
if($('#parent_chapter_id').val() != 'Sasame'){
    Sasame = false;
    $('#passages').sortable({
        handle: '.passage_author'
    });
    // $(document).on('focus', '.passage_content', function(){
    //     $('#passages').sortable('disable');
    // });
    // $(document).on('focusout', '.passage_content', function(){
    //     $('#passages').sortable({
    //         disabled: false,
    //         handle: '.passage_author'
    //     });
    // });
}
//For forms
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
  var recorder;
  var audio;
  $(document).on('click', '.mic_record_icon', async function(){
        switch($(this).data('status')){
            case 'empty':
            recorder = await recordAudio();
            audio;
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

$('.codeform_add').on('submit', function(e){
    e.preventDefault();
    var formdata = new FormData(this);
    var info = $(this).serializeObject();
    var thiz = $(this);
    $.ajax({
        type: 'post',
        url: '/passage/add_passage/',
        data: formdata,
       contentType: false,
       enctype: 'multipart/form-data',
       processData: false,
        success: function(data){
            thiz.children('.control_textarea').val('');
            $('.blocker').click();
            if(info.type == 'passage'){
                $('.property_select:visible').remove();
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
$('.codeform_update').on('submit', function(e){
    e.preventDefault();
    var formdata = new FormData(this);
    var info = $(this).serializeObject();
    var thiz = $(this);
    $.ajax({
        type: 'post',
        url: '/update_passage/',
        data: formdata,
       contentType: false,
       enctype: 'multipart/form-data',
       processData: false,
        success: function(data){
            alert('Updated!');
            $('.blocker').click();
        }
    });
});
$('#update_chapter_form').on('submit', function(e){
    e.preventDefault();
    var info = $(this).serializeObject();
    var thiz = $(this);
    $.ajax({
        type: 'post',
        url: '/update_chapter/',
        data: info,
        success: function(data){
            window.location.reload();
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

$('.add_select').on('change', function(){
    if($(this).val() == 'chapter'){
        $(this).parent().siblings('.add_passage_icons').hide();
        $(this).parent().siblings('.properties').hide();
        $(this).parent().siblings('.control_textarea').replaceWith('<input class="control_textarea"type="text" name="passage"/>');

    }
    else{
        $(this).parent().siblings('.add_passage_icons').show();
        $(this).parent().siblings('.properties').show();
        $(this).parent().siblings('.control_textarea').replaceWith('<textarea class="control_textarea" cols="30" placeholder="" name="passage" rows="6" autocomplete="off"></textarea>');
    }
});
function jqueryToggle(thiz, func1, func2, dataType='toggle', dataValue=[0, 1]){
    if(thiz.data(dataType) == dataValue[0]){
        thiz.data(dataType, dataValue[1]);
        func2();
    }
    else{
        thiz.data(dataType, dataValue[0]);
        func1();
    }
    return thiz.data(dataType);
}
$(document).on('click', '.passage_mutate', function(){
    flashIcon($(this), 'red');
    var content = $(this).parent().siblings('.passage_content').text();
    $(this)
    .parent()
    .parent()
    .append('<input class="reserve"type="hidden"value="'+content+'"/>');
    var newContent = $(this).parent().siblings('.reserve').val();
    newContent = share.mutate(newContent, ' ');
    $(this).parent().siblings('.passage_content').html(newContent);
});
$(document).on('click', '.image_upload_icon', function(){
    $(this).css('color', 'red');
    $(this).parent().siblings('.hidden_upload').click();
});
function readPassageMetadata(thiz){
    var metadata = thiz.val();
    var _id = thiz.attr('id').split('_')[2];
    metadata = JSON.parse(metadata);
    var content = thiz.siblings('.passage_content').text();
    thiz.siblings('.proteins').children('.passage_play').hide();
    var autoplay = false;
    function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
    }
      for (let [key, value] of Object.entries(metadata)) {
            if(key == 'Autoplay'){
                autoplay = true;
            }
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
            function autoPlay(autoplay, thiz, canvas=false){
                if((autoplay == true && !Sasame) || (autoplay == true && canvas)){
                    thiz.siblings('.proteins').children('.passage_play').click();
                    autoplay = false;
                }
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
                case 'Code Mirror':
                thiz.siblings('.passage_content').replaceWith('<textarea class="passage_content">'+content+'</textarea>');
                var scriptURL = '/mode/'+value+'/'+value+'.js';
                var editor;
                if(scriptLoaded(scriptURL)){
                    editor = CodeMirror.fromTextArea(thiz.siblings('.passage_content')[0]);
                }
                else{
                    $.getScript(scriptURL)
                    .done(function( script, textStatus ) {
                       editor = CodeMirror.fromTextArea(thiz.siblings('.passage_content')[0]);
                      })
                      .fail(function( jqxhr, settings, exception ) {
                        $( "div.log" ).text( "Triggered ajaxError handler." );
                    });
                }
                break;
                case 'Quill JS':
                $('head').append('<link rel="stylesheet" type="text/css" href="/quill.snow.css">');
                var toolbarOptions = [
                  // ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                  ['blockquote', 'code-block'],

                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript

                  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

                  [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                  // [{ 'font': [] }],
                  [{ 'align': [] }],

                  ['clean']                                         // remove formatting button
                ];
                if(scriptLoaded('/quill.js')){
                    var quill = new Quill('#passage_content_'+thiz.parent().attr('id'), {
                        modules: {
                            toolbar: toolbarOptions
                        },
                        theme: 'snow'
                      });
                }
                else{
                    $.getScript('/quill.js')
                    .done(function( script, textStatus ) {
                       var quill = new Quill('#passage_content_'+thiz.parent().attr('id'), {
                            modules: {
                                toolbar: toolbarOptions
                            },
                            theme: 'snow'
                          });
                      })
                      .fail(function( jqxhr, settings, exception ) {
                        $( "div.log" ).text( "Triggered ajaxError handler." );
                    });
                }
                thiz.siblings('.proteins').children('.passage_play').show();
                thiz.siblings('.proteins').children('.passage_play').on('click', function(){
                    jqueryToggle(thiz, function(){
                        thiz.siblings('.passage_content').hide();
                        thiz.siblings('.ql-toolbar').hide();
                        var html = '<div id="passage_content_'+thiz.parent().attr('id')+'_temp">'+$('#passage_content_'+thiz.parent().attr('id')).children('.ql-editor').html()+'</div>';
                        thiz.parent().append(html)
                    }, function(){
                        thiz.siblings('.passage_content').show();
                        thiz.siblings('.ql-toolbar').show();
                        $('#passage_content_'+thiz.parent().attr('id')+'_temp').remove();
                    })
                });
                autoPlay(autoplay, thiz);
                break;
                case 'CSS':
                // thiz.siblings('.passage_content').css(JSON.parse(value));
                thiz.siblings('.passage_content')[0].style = value;
                break;
                case 'Align':
                // thiz.siblings('.passage_content').css(JSON.parse(value));
                thiz.siblings('.passage_content').css('text-align', value);
                break;
                case 'HTML':
                var html = thiz.siblings('.passage_content').html();
                // thiz.siblings('.passage_content').text(html);
                //syntax highlight
                thiz.siblings('.passage_content').html('<pre id="hljs_block_'+_id+'"><code class="language-html">'+escapeHtml(html)+'</code></pre>');
                hljs.highlightBlock($('#hljs_block_'+_id+ ' code')[0]);
                thiz.siblings('.proteins').children('.passage_play').show();
                thiz.siblings('.proteins').children('.passage_play').on('click', function(){
                    jqueryToggle(thiz, function(){
                        thiz.siblings('.passage_content').html(html);
                    }, function(){
                        // thiz.siblings('.passage_content').text(html);
                        //syntax highlight
                        thiz.siblings('.passage_content').html('<pre id="hljs_block_'+_id+'"><code class="language-html">'+escapeHtml(html)+'</code></pre>');
                        hljs.highlightBlock($('#hljs_block_'+_id+ ' code')[0]);
                    })
                });
                autoPlay(autoplay, thiz);
                break;
                case 'Hidden':
                thiz.siblings('.passage_content').css('display', 'none');
                thiz.siblings().not('.passage_canvas').css('opacity', '0.6');
                break;
                case 'Hide Tools':
                thiz.siblings('.proteins').hide();
                break;
                case 'Audio':
                thiz.siblings('.proteins').children('.passage_play').show();
                thiz.siblings('.proteins').children('.passage_play').on('click', function(){
                $(this).parent().siblings('.passage_audio').attr('src', '/recordings/'+value);
                $(this).parent().siblings('.passage_audio').show();
                $(this).parent().siblings('.passage_audio')[0].loop = true;
                $(this).parent().siblings('.passage_audio')[0].play();
                });
                autoPlay(autoplay, thiz);
                break;
                case 'Tone':
                thiz.siblings('.proteins').children('.passage_play').show();
                thiz.siblings('.proteins').children('.passage_play').on('click', function(){
                    playTone(content, 0);   
                });
                autoPlay(autoplay, thiz);
                break;
                case 'Markdown':
                thiz.siblings('.proteins').children('.passage_play').show();
                thiz.siblings('.proteins').children('.passage_play').on('click', function(){
                    jqueryToggle(thiz, function(){
                        thiz.siblings('.passage_content').html(marked(thiz.siblings('.passage_content').text()));
                        thiz.siblings('.passage_content').css('white-space', 'initial');
                    }, function(){
                        thiz.siblings('.passage_content').html(content);
                        thiz.siblings('.passage_content').css('white-space', 'pre-line');
                    });
                });
                autoPlay(autoplay, thiz);
                break;
                case 'Syntax Highlight':
                //syntax highlight
                thiz.siblings('.passage_content').html('<pre><code class="language-'+value+'">'+content+'</code></pre>');
                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightBlock(block);
                  });
                break;
                case 'Canvas':
                var canvas = thiz.siblings('.passage_canvas');
                var ctx = canvas[0].getContext('2d');
                //not generated from JS
                if(value == 'image'){
                    break;
                }
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
                if(key == 'Canvas'){
                    var isCanvasKey = true;
                }
                else{
                    var isCanvasKey = false;
                }
                $('#custom_pairs').val(JSON.stringify(storage));
                thiz.siblings('.proteins').children('.passage_play').show();
                thiz.siblings('.proteins').children('.passage_play').on('click', function(){
                    eval(content); 
                    if(key == 'Canvas'){
                        canvas.css('display', 'inline-block');
                        //now we need to update the passage on the server
                        //with the image generated from the canvas
                    }
                });
                autoPlay(autoplay, thiz, isCanvasKey);
                break;
                case 'Custom':
                thiz.siblings('.proteins').children('.passage_play').show();
                thiz.siblings('.proteins').children('.passage_play').on('click', function(){
                    //read all value/content pairs from DOM as
                    var storage = $('#custom_pairs').val();
                    if(storage !== ''){
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
                    }
                });
                autoPlay(autoplay, thiz);
                break;
                case 'Autoplay':
                autoPlay(autoplay, thiz);
                break;
                default:
                var html = thiz.siblings('.passage_content').text();
                thiz.siblings('.passage_content').html(escapeHtml(html));
            }
        }
        if(Object.keys(metadata).length === 0){
            var html = thiz.siblings('.passage_content').text();
            thiz.siblings('.passage_content').html(escapeHtml(html));
        }
}
function scriptLoaded(url) {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length; i--;) {
        if (scripts[i].src == url) return true;
    }
    return false;
}
function runCanvasKey(canvas, content, canvas_size){
    canvas.css('display', 'inline-block');
    var ctx = canvas[0].getContext('2d');
    //read value line by line
    var lines = content.split("\n");
    // canvas[0].height = canvas_size;
    //     canvas[0].width = canvas_size;
    // numSides.color.size
    // numSides.fill.stroke.size
    // numSides.color.size.x.y
    // numSides.color.size.x.y.r
    // numSides.fill.stroke.size.x.y
    // numSides.fill.stroke.size.x.y.r
    lines.forEach(function(line){
        var parts = line.split('.');
        var numParts = parts.length;
        var numSides = parts[0];
        //init
        var fill = parts[1];
        var color = parts[1];
        var stroke = parts[1];
        var size;
        var x = false;
        var y = false;
        var r = 0;
        //
        switch(numParts){
            case 3:
            color = parts[1];
            size = parts[2];
            break;
            case 4:
            fill = parts[1];
            stroke = parts[2];
            size = parts[3];
            break;
            case 5:
            color = parts[1];
            size = parts[2];
            x = parseInt(parts[3], 10);
            y = parseInt(parts[4], 10);
            break;
            case 6:
            //is it defining strokeStyle or size?
            if(parseInt(parts[2])){
                //size
                color = parts[1];
                size = parts[2];
                x = parseInt(parts[3], 10);
                y = parseInt(parts[4], 10);

            }
            else{
                fill = parts[1];
                stroke = parts[2];
                size = parts[3];
                x = parseInt(parts[4], 10);
                y = parseInt(parts[5], 10);
            }
            break;
            case 7:
            fill = parts[1];
            stroke = parts[2];
            size = parts[3];
            x = parseInt(parts[4], 10);
            y = parseInt(parts[5], 10);
            r = parseInt(parts[6], 10);
            break;
        }
        var height = size,
        width = size,
        sideLen = size/2,
        sideNumb = numSides,
        rotation = r;
        rotation *= Math.PI/180;
        var xCenter = x || width/2;
        var yCenter = y || height/2;
        ctx.beginPath();
        if(sideNumb == 0){
            ctx.arc(xCenter, yCenter, sideLen, 0, 2 * Math.PI);
        }
        else{
            ctx.moveTo (xCenter +  sideLen * Math.cos(rotation), yCenter +  sideLen *  Math.sin(rotation));           

        }
        for (var i = 1; i <= sideNumb; i += 1) {
            ctx.lineTo (xCenter +  sideLen * Math.cos(rotation + (i * 2 * Math.PI / sideNumb)), yCenter +  sideLen *  Math.sin(rotation + (i * 2 * Math.PI / sideNumb)));
        }
        ctx.strokeStyle = stroke;
        ctx.fillStyle = fill;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fill();
    });
}
$('[id^=passage_metadata_]').each(function(){
    readPassageMetadata($(this));
});
function flashIcon(thiz, color='gold'){
    thiz.css('color', color);
    setTimeout(function(){
        thiz.css('color', 'inherit');
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
            if(data == "You don't have enough stars to give!"){
                alert(data);
            }
            else{
                flashIcon(thiz);
                $('.star_count_'+_id).text(newCount);
            }
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
$(document).on('click', '.add_property', function(){
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
    var content = $(this).parent().siblings('.passage_content');
    var text;
    if(content.prop('tagName') == 'TEXTAREA'){
        editor = content.next('.CodeMirror').get(0).CodeMirror;
        text = editor.getValue();
    }
    else if(content.children('.ql-editor').length){
        text = content.children('.ql-editor').html();
    }
    else{
        text = content.text();
    }
    var thiz = $(this);
    $.ajax({
        type: 'post',
        url: '/update_passage_content',
        data: {
            _id: _id,
            content: text
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
// FILE STREAM INACTIVE
$('#parent_chapter_title').css('cursor', 'default');
// $('#parent_chapter_title').on('click', function(){
//     var something = $(this).text();
//     if(something == 'Sasame'){
//         doSomethingFileStream();
//     }
//     else{
//         something = "Sasame"
//         doSomethingThoughtStream();
//         $(this).text(something);
//     }

// });
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
    //update help modal
    // var placeholder = '';
    // switch($(this).val()){
    //     case 'Color':
    //         placeholder = 'Enter a Color';
    //         break;
    //     case 'Hidden':
    //         placeholder = 'True/False';
    //         break;
    //     case 'Canvas':
    //         placeholder = 'shape.color.x.y.l.w or reference.x.y';
    //         break;
    //     case 'Tone':
    //         placeholder = 'frequency.type.seconds';
    //         break;
    // }
    // $(this).siblings('.property_value').attr('placeholder',placeholder);
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
        thiz.attr('title', 'Book Mode (b)');
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
                $('#ppe_queue').append(data);
                var first = true;
                $('.ppe_queue_canvas').each(function(){
                    if(first){
                        $(this).addClass('ppe_queue_selected');
                    }
                    else{
                        //we need to print the image to canvas per the filename
                        runCanvasKey($(this), $(this).data('canvas'), $(this).data('canvas_size'));
                    }
                    first = false;
                });
                $('#ppe_mutate').click();
            }
        });
    }, function(){
        thiz.attr('src', '/images/ionicons/brush-sharp.svg');
        thiz.attr('title', 'Graphic Mode (g)');
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
            $('#right_select_help').show();
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
            $('#right_select_help').hide();
            // $('#right_passages').sortable();
            break;
        case 'queue':
            $('#chapter_load').hide();
            $('#categories').hide();
            $('#right_passages').remove();
            $('#queue').show();
            $('#right_select_help').hide();
            // $('#queue_items').sortable();
            break;
        case 'categories':
            $('#chapter_load').hide();
            $('#categories').hide();
            $('#right_passages').remove();
            $('#queue').hide();
            $('#right_select_help').show();
            break;
        case 'users':
            $('#chapter_load').hide();
            $('#categories').hide();
            $('#right_passages').remove();
            $('#queue').hide();
            $('#right_select_help').show();
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
                    $('#passages').sortable({
                        handle: '.passage_author'
                    });
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
        // $('#code').show();
        $('#passage_load').show();
        // $('.header').show();
        // $('#book_of_sasame').css('width', '40%');
        $(this).data('hidden', 'false')
    }
    else{
        $('#toc').hide();
        // $('#code').hide();
        // $('.header').hide();
        $('#passage_load').hide();
        // $('#book_of_sasame').css('width', '100%');
        $(this).data('hidden', 'true')
    }
});
$('.toggle_tools').on('click', function(){
    if($(this).data('hidden') == 'true'){
        $('.proteins').show();
        $('.tool_header').show();
        $('.chapter_tools').show();
        $('.passage_author').show();
        $('.passage').css('padding-bottom', '32px');
        $(this).data('hidden', 'false')
    }
    else{
        $('.proteins').hide();
        $('.tool_header').hide();
        $('.chapter_tools').hide();
        $('.passage_author').hide();
        $('.passage').css('padding-bottom', '0px');
        $(this).data('hidden', 'true')
    }
});
if($('#is_distraction_free').is(':checked')){
    $('.option_distraction_free').click();
}
if($('#is_tools_active').length && !$('#is_tools_active').is(':checked') && !Sasame){
    $('.toggle_tools').click();
}
$('#play_all').on('click', function(){
    flashIcon($(this), 'red');
    $('.passage_play').each(function(){
        $(this).click();
    });
});

$(document).on('keydown', function(e){
    var thiz = $(this);
    if($('.graphic_mode').attr('title') == 'Graphic Mode (g)'){
        //hotkeys not for editable elements
        var el = document.activeElement;
        try {
            if (el && el.selectionStart !== undefined || el.isContentEditable) {
                return; // active element has caret, do not proceed
            }
        } catch (ex) {}
        //m for menu
        if(e.keyCode == 77){
            // $('.option_distraction_free').click();
            jqueryToggle(thiz, function(){
                flashIcon($('.passage_adder'), 'gold');
                $('#toc').modal();
                $('#right_side_select').val('chapters').change();
            }, function(){
                $('.blocker').click();
            }, 'add_form_modal')
        }
        //q for queue
        if(e.keyCode == 81){
            // $('.option_distraction_free').click();
            jqueryToggle(thiz, function(){
                flashIcon($('.passage_adder'), 'gold');
                $('#toc').modal();
                $('#right_side_select').val('queue').change();
            }, function(){
                $('.blocker').click();
            }, 'add_form_modal')
        }
        //t for toggle tools
        else if(e.keyCode == 84){
            $('.toggle_tools').click();
        }
        //a for add passage
        else if(e.keyCode == 65){
            jqueryToggle(thiz, function(){
                flashIcon($('.passage_adder'), 'gold');
                $('#code').modal();
            }, function(){
                $('.blocker').click();
            }, 'add_form_modal');
        }
        //h for home
        else if(e.keyCode == 72){
            window.location = '/';
        }
        //g for graphic mode
        else if(e.keyCode == 71){
            $('.graphic_mode').click();
        }
    }
});

// console.log('Final output:' + share.mutate(`const User = require('./models/User');
// const Chapter = require('./models/Chapter');
// const Passage = require('./models/Passage');
// // Controllers`, '/'));