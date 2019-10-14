// For the Book of Sasame
$('#mobile_active_close').on('click', function(){
    $('#mobile_book_menu_main').fadeOut();
    $('#control_panel').fadeIn();
});
$('#mobile_book_menu').on('click', function(){
    $('#control_panel').fadeOut();
    $('#mobile_book_menu_main').css('display', 'block');
});
//Infinite scroll for the Book of Sasame
window.onscroll = function(ev) {
    if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
        var chapter = $('#parent_chapter_id').val();
        var page = parseInt($('#page').val());
        console.log(page);
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
                    html = '<div class="passage"> <div class="passage_delete">x</div>';
                    if(typeof passage.chapter != 'undefined' && typeof passage.chapter.title != 'undefined'){
                        html += ' <div class="passage_chapter"><a class="basic_link"href="/sasasame/'+passage.chapter.title+'/'+passage.chapter._id+'">'+passage.chapter.title+'></a></div>';
                    }
                    else{
                        html += '<div class="passage_chapter">Sasame</div>';
                    }
                    // html += '<div class="passage_author">'+passage.author+'</div>';
                    if(passage.keys != ''){
                        html += '<div class="passage_keys">Keys: '+passage.keys+'</div>';
                    }
                    html += '<div class="passage_content">'+passage.content+'</div> <div class="passage_id">'+passage._id+'</div></div>';
                    $('#book_of_sasame').append(html);
                });
                html = '';
                chapters.docs.forEach(function(chapter){
                    html = '<p class="category"><a class="link" href="/sasasame/'+chapter.title+'/'+chapter._id+'">'+chapter.title+'</a></p>';
                    $('#categories').append(html);
                });
                $('#page').val(++page);
            }
        });
    }
};
