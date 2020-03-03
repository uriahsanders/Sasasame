//shared code for server/client
(function(exports){
  exports.printAddForm = function(chapter, update, after, parentPassage){
    update = update || false;
    parentPassage = parentPassage || '';
    after = after || '';
    var which = (update == false) ? 'add' : 'update';
    var bt_which = (update == false) ? 'Add' : 'Update';
    var content = (update == false) ? '' : update.content;
    var _id = (update == false) ? '' : update._id;
    var ret = '';
    ret += `
    <form class="codeform_`+which+` add_form"action="/`+which+`_passage/" method="POST">`;
                    if(!update){
                      ret += `<div class="header no_cursive"><select name="type" class="add_select" autocomplete="off">
                        <option value="passage">Passage</option>
                        <option value="chapter">Chapter</option>
                    </select></div>`;
                    }
                    ret += `
                    <div class="add_passage_icons"style="text-align:left">
                        <ion-icon title="Add Image"class="image_upload_icon"src="/images/ionicons/images-sharp.svg"></ion-icon>
                        <!-- <ion-icon title="Attach File"name="attach"></ion-icon> -->
                        <ion-icon data-status="empty"title="Add Audio Recording"class="mic_record_icon"src="/images/ionicons/mic-sharp.svg"></ion-icon>
                        <!-- <ion-icon title="Make Drawing"name="create"class="draw_icon"></ion-icon> -->
                        <ion-icon title="Content Warning" class="flag_icon" src="/images/ionicons/flag-sharp.svg"></ion-icon>
                        <a class="basic_link" rel="modal:open"href="#stream_palette"><ion-icon title="Mutate"src="/images/ionicons/color-palette-sharp.svg"></ion-icon></a>
                        <ion-icon class="icon_top_add"title="Add to Top"src="/images/ionicons/caret-up-sharp.svg"></ion-icon>
                    </div>
                    <textarea class="control_textarea" cols="30" placeholder="Details" name="passage" rows="6" autocomplete="off">`+content+`</textarea>
                    <input name="chapterID" type="hidden" value="`+chapter+`"/>
                    <input name="parentPassage" type="hidden" value="`+parentPassage+`"/>
                    <input name="_id" type="hidden" value="`+_id+`"/>
                    <button class="control_button" class="add_passage">`+bt_which+`</button>
                    <div class="properties">
                        <div class="add_property"><ion-icon src="/images/ionicons/add-circle-sharp.svg"></ion-icon> Add Key</div> 
                    </div>
                    `+after+`
                    </form>
    `;
    return ret;
  };
  exports.printPropertySelect = function(key, value){
    key = key || 'Color';
    value = value || '';
    return `
<div class="property_select">
    <ion-icon title="Remove"class="remove_property"src="/images/ionicons/remove-circle-sharp.svg"></ion-icon> 
    <ion-icon title="Help"class="property_info"src="/images/ionicons/help-circle-sharp.svg"></ion-icon> 
    <!-- For Passages -->
    <select name="property_key"class="property_key" autocomplete="off">
        <option selected="selected">`+key+`</option>
        <option>Hyperlink</option>
        <option>CSS</option>
        <option>HTML</option>
        <option>Syntax Highlight</option>
        <option>Markdown</option>
        <option>Canvas</option>
        <option>Animation</option>
        <option>Tone</option>
        <option>Hidden</option>
        <option>Audio</option>
        <option>Graph</option>
        <option>Directory</option>
        <option>Webpage</option>
        <option>File</option>
        <!-- Point to another passage -->
        <option>Pointer</option>
        <option>Free Polygon</option>
        <option>Regular Polygon</option>
        <option>Key Schema</option>
        <option>Is Key Schema?</option>
        <option>Impress JS</option>
        <option>Auto Expand</option>
        <option>Quill</option>
        <option>Code Mirror</option>
        <option>Eval JS</option>
        <option>Custom</option>
        <option>Reference</option>
        <option>Autoplay</option>
        <option>Loop</option>
        <option>Question</option>
        <option>Task</option>
        <option>Hide Tools</option>
        <option>Category</option>
        <option>Align</option>
        <option>Mutate</option>
    </select>
    <br><br>
    <input value="`+value+`"name="property_value"class="property_value"type="" name="">
</div>
    `;
  };
  exports.printPassage = function(passage, user){
       var ret = '';
        ret += `
        <div id="`+passage._id+`" class="passage">`;
            ret += `<div id="modal_add_sub_passage_`+passage._id+`" class="modal">`
          ret += exports.printAddForm('', false, '', passage._id)
         ret +=   `</div>`;
            ret += `<input id="passage_metadata_`+passage._id+`"class="metadata"type="hidden" value='`+passage.metadata+`'/>`;
            ret += `<div class="passage_author">`;
            if(passage.author){
                ret += `<div><a class="basic_link" href="/user/`+passage.author._id+`">`+passage.author.username+`</a>`;
            }else{
                ret += `<div><a class="basic_link" href="#">Anonymous</a>`;
            }
            ret += '<span class="star_container"><span class="star_count_'+passage._id+'">'+(passage.stars || 0 )+'</span> '+(passage.stars == 1 ? 'Star' : 'Stars')+'<span>';
            ret += '</div>';
            ret += `<div id="modal_`+passage._id+`" class="modal">
                <p>PASSAGE OPTIONS</p>
                <div class="passage_details">`;
                    //date.toDateString() in future
                    ret += `<p>Created: `+passage.date+`</p>`;
                    if(passage.author){
                        ret += `<p>By: `+passage.author.username+` </p>`;
                    }else{
                        ret += `<p>By: Anonymous</p>`;
                    }
                    ret += `<p>`+(passage.stars || 0 )+` Stars </p>`;
                    var chapterID = '';
                    if(passage.chapter && passage.chapter.title){
                      chapterID = passage.chapter._id;
                      ret += `<p>Chapter:<a class="link" href="/${passage.chapter.title}/${passage.chapter._id}">`+passage.chapter.title+`</a></p>`;
                    }
                ret += `</div>`;
              var i = 0;
              var after = '<br>';
              var metadata = JSON.parse(passage.metadata);
              for (let [key, value] of Object.entries(metadata)) {
                    after += exports.printPropertySelect(key, value);
                }
              ret += exports.printAddForm(chapterID, {
                content: passage.content,
                flagged: passage.flagged,
                _id: passage._id
              }, after);
              ret += `
              <div class="passage_id">`+passage._id+`</div>
            </div>
            </div>
             <div class="proteins">
             <a class="basic_link" href="#modal_`+passage._id+`" rel="modal:open"><ion-icon title="Details"src="/images/ionicons/settings-sharp.svg"></ion-icon></a>
             <ion-icon class="square_icon"title="Add to Queue"src="/images/ionicons/square-sharp.svg"></ion-icon>
             `;
             if(user){
                ret += `<ion-icon id="star_`+passage._id+`"title="Star"class="star_icon" src="/images/ionicons/star-sharp.svg"></ion-icon> `;
             } 
             ret += `<ion-icon id="passage_flag_`+passage._id+`"title="Content Warning" class="flag_icon`+(passage.flagged == true ? ' flagged': '')+`" src="/images/ionicons/flag.svg"></ion-icon>
             <ion-icon class="passage_mutate"title="Mutate"src="/images/ionicons/color-palette.svg"></ion-icon>
             <ion-icon class="passage_play"title="Play" src="/images/ionicons/play-circle.svg"></ion-icon>
             <ion-icon class="view_sub"title="View Sub Passages" src="/images/ionicons/caret-down-sharp.svg"></ion-icon>
             <ion-icon title="Update" id="passage_update_`+passage._id+`"src="/images/ionicons/share-sharp.svg"></ion-icon>
             <ion-icon title="Delete" id="passage_delete_`+passage._id+`"src="/images/ionicons/close-circle.svg"></ion-icon>
             </div>
             <input class="parentPassage"name="parentPassage" type="hidden" value="`+(passage.parentPassage || '')+`"/>
            <input type="hidden" class="original_passage_content" value="`+passage.content+`"/>
                <div class="passage_chapter">Sasame</div>
            <div class="passage_content" contenteditable="true">`+ passage.content+`</div>
            <canvas class="passage_canvas"></canvas>
            <audio class="passage_audio"controls="true"></audio>
            <input type="hidden" id="canvas_name_` + metadata['Canvas']+`"/>
            <div class="sub_passages">`;
                passage.passages.forEach(function(sub){
                    ret += `<div class="sub_passage">`;
                     ret += exports.printPassage(sub, user);
                     ret += `</div>`;
                });
            ret += `<div class="add_sub_passage"><a class="add_sub_passage_modal basic_link"href="#modal_add_sub_passage_${passage._id}" rel="modal:open"><ion-icon title="Add Sub Passage"src="/images/ionicons/add-circle-sharp.svg"></ion-icon></a></div>
            </div>

        </div>`;
        return ret;
  };
  exports.printChapter = function(chapter){
    var ret = '';
    ret += `
    <div class="category">
        <!-- For Future
        <div class="chapter_flag">
            <ion-icon title="Content Warning" name="flag"></ion-icon>
        </div>
         -->
        <div>
            <a class="link" href="/`+chapter.title+`/`+chapter._id+`">`+chapter.title+`</a>
        </div>
        <div class="category_id">`+chapter._id+`</div>
    </div>`;
    return ret;
  };
  function escapeHTML(s) { 
    return s.replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}
  exports.printFile = function(content, fileName=''){
    var lang = fileName.split('.')[fileName.split('.').length - 1];
    lang = (lang == 'ejs') ? 'html' : lang;
    var ret = '';
        ret += `
        <div class="passage">
             <div class="proteins">
             <input type="hidden" value="`+fileName+`" id="file_name"/>
             <ion-icon class="square_icon"title="Add to Queue"src="/images/ionicons/square-sharp.svg"></ion-icon>
             <ion-icon title="Split" src="/images/ionicons/cut-sharp.svg"></ion-icon>
             <ion-icon title="Move line from above"src="/images/ionicons/add-sharp.svg"></ion-icon>
             <ion-icon title="Move line to above"src="/images/ionicons/remove-sharp.svg"></ion-icon>
             <ion-icon class="file_play"title="Run File" src="/images/ionicons/play-circle.svg"></ion-icon>
             <ion-icon class="file_update"title="Update File" src="/images/ionicons/share-sharp.svg"></ion-icon>
             </div>
            <div class="passage_content" contenteditable="true"><pre><code class="lang-`+lang+`">`+ escapeHTML(content)+`</code></pre></div>
        </div>`;
        return ret;
  };
  exports.printDir = function(dirname){
    var ret = '';
    ret += `
    <div class="category">
        <div>
            <a class="link fileStreamChapter">`+dirname+`</a>
        </div>
    </div>`;
    return ret;
  };
  exports.printCanvas = function(passage){
    var metadata = JSON.parse(passage.metadata);
    var ret = '';
    ret += `
    <canvas data-canvas="${passage.content}"data-canvas_size="${metadata['Canvas']}"class="ppe_queue_canvas"></canvas>`;
    return ret;
  };
  exports.mutate = function(data, indice, iterations=0){
    //what we want to do is convert ANY type of data into a chromosomal form,
    //where independent data chunks serve as genes,
    //and can thus be mutated and recombinated accordingly.

    //All data can be represented as a string, conveniently!
    //We just convert it back after handling it.

    //so, whatever data we get will be split up into chunks.
    //These chunks might be words in the case of sentences,
    //characters in the case of words
    //perhaps lines in a document, functions in code, shapes in a drawing, etc.

    //in order for them to be chunks, they must be separated by indices.
    //These indices might be spaces, punctuation marks, new lines, whatever.
    //The indice being used depends on the data and will be passed along with it.

    var chunks = data.split(indice);

    //Okay, so now that we have our chunks,
    //we can treat them like genes.
    //That means we can mutate the chunks
    //or pass the entire array of chunks into a recombination function
    //where it technically mates with another chunk to form a chunky baby,
    //haha!!

    //so, how should we mutate a chunk in a way that's useful?
    //well, we can insert, delete, or, well, mutate any given chunk.
    //which one we choose should be random!
    var options = ['insert', 'delete', 'mutate'];
    for(var i = 0; i < chunks.length; ++i){
      //random num between 1 and 3
      var random = Math.floor(Math.random() * options.length) + 1;
      switch(options[random]){
        case 'insert':
        //perform an insertion by duplicating a chunk!
        var nextChunk = chunks[i + 1];
        chunks[i + 1] = chunks[i];
        //then carry down the changes to the end of the array
        for(var j = i + 1; j < chunks.length; ++j){
          chunks[j + 1] = chunks[j];
        }
        break;
        case 'delete':
        //delete a chunk by making it equal the next chunk!
        chunks[i] = chunks[i + 1];
        //then make each following chunk equal the next chunk,
        //removing the last chunk (technically just a left shift)
        for(var j = i + 1; j < chunks.length; ++j){
          if(j + 1 < chunks.length){
            chunks[j] = chunks[j + 1];
          }
          else{
            chunks.pop();
          }
        }
        break;
        case 'mutate':
        //We want to shift the value of a single point within the chunk,
        //if you are familiar with biology, this is an SNP!
        var points = chunks[i].split('');
        //get random point
        //and make it equal some other random point!
        //random num between 1 and points.length
        var ran = Math.floor(Math.random() * points.length) + 1;
        var ran2 = Math.floor(Math.random() * points.length) + 1;
        //we're using a random point from within the same chunk
        //this decreases the level of strangeness we might get
        points[ran] = points[ran2];
        //then bring the points back together again, with one now different!
        chunks[i] = points.join('');
        break;
      }
    }
    return chunks.join(indice);
  };

}(typeof exports === 'undefined' ? this.share = {} : exports));