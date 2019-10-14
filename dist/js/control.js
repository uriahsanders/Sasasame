// For the Control Panel
// Checking Passages
$(document).on('click', '.control_select', function(){
    $(this).toggleClass('control_select_gold');
});
// Search for Passages that match the keys
$('#control_search_form').submit(function(e){
    e.preventDefault();
    var keys = $('#control_key_search').val();
    if(keys.length > 1){
        $.ajax({
            type: 'post',
            url: '/search_by_key',
            data: {
                keys: keys
            },
            success: function(passages){
                $('#golden_road_form').remove();
                $('.control_select').each(function(){
                    if(!$(this).hasClass('control_select_gold')){
                        $(this).parent().remove();
                    }
                });
                var html = '';
                var form = '<form id="golden_road_form"action="/make_golden_road" method="post"> <input placeholder="New Chapter Title"id="control_new_chapter_title" type="text" name="new_chapter_title" value=""autocomplete="off"> <input type="hidden" name="passage_ids" id="" value=""> <button id="control_submit"type="submit">Create Golden Road</button> </form>';

                JSON.parse(passages).forEach(function(p){
                    html += '<div class="control_passage">\
                        <div class="control_select"></div>\
                        <div class="control_passage_chapter">';
                    if(p.category != null){
                        html += p.chapter.title;
                    }
                    else{
                        html += 'Sasame';
                    }
                    html += '</div><div>Keys:</div><div class="control_passage_keys" contenteditable="true">';
                    html += p.keys;
                    html += '</div><div class="control_passage_passage" contenteditable="true">';
                    html += p.content;
                    html += '</div></div>';
                
                });
                //don't show form if there are no passages
                if(html == ''){
                    alert('No matching passages.');
                    form = '';
                }
                html = form + $('#control_passages').html() + html;
                $('#control_passages').html(html);
            }
        });
    }
});
$('#golden_road_form').submit(function(e){
    e.preventDefault();
    //make JSON from Passage HTML
    var passages = [];
    $('.control_passage').each(function(){
        if($(this).find('.control_select').hasClass('control_select_gold')){
            passages.push({
                keys: $(this).find('.control_passage_keys').text(),
                content: $(this).find('.control_passage_passage').text()
            });
        }
    });
    console.log(passages);
    var chapterTitle = $('#control_new_chapter_title').val();
    if(passages.length > 1 && chapterTitle != ''){
        $.ajax({
            type: 'post',
            url: '/make_golden_road',
            data: {
                passages: JSON.stringify(passages),
                title: chapterTitle
            },
            success: function(data){
                alert(data);
            }
        });
    }
});


