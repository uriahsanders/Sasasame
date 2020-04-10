//shared code for server/client
(function(exports){
  exports.printAddForm = function(chapter, update, after, parentPassage){
    update = update || false;
    parentPassage = parentPassage || '';
    after = after || '';
    var which = (update == false) ? 'add' : 'update';
    var bt_which = (update == false) ? 'Add' : 'Update';
    var content = (update == false) ? '' : update.content;
    var categories = (update == false) ? '' : update.categories;
    var _id = (update == false) ? '' : update._id;
    var ret = '';
    ret += `
    <form class="codeform_`+which+` add_form"action="/`+which+`_passage/"enctype="multipart/form-data" method="POST">`;
                    if(!update){
                      ret += `<div class="header no_cursive"><select name="type" class="add_select" autocomplete="off">
                        <option value="passage">Passage</option>
                        <option value="chapter">Chapter</option>
                    </select></div>`;
                    }
                    ret += `
                    <div id="add_passage_editor"class="modal">
                      <div class="header">Choose Editor</div>
                      <div class="editor_option"id="editor_plain">Plain</div>
                      <div class="editor_option"id="editor_rich">Rich</div>
                      <div class="editor_option"id="editor_code">Code</div>
                    </div>
                    <div class="add_passage_icons"style="text-align:left">
                        <ion-icon title="Add Image"class="image_upload_icon"src="/images/ionicons/images-sharp.svg"></ion-icon>
                        <!-- <ion-icon title="Attach File"name="attach"></ion-icon> -->
                        <ion-icon data-status="empty"title="Add Audio Recording"class="mic_record_icon"src="/images/ionicons/mic-circle-sharp.svg"></ion-icon>
                        <ion-icon title="Choose Editor" class="editor_choose" src="/images/ionicons/newspaper-sharp.svg"></ion-icon>
                        <ion-icon title="Add Tags" name="tags"class="tag_add" src="/images/ionicons/add-circle-sharp.svg"></ion-icon>
                        <!-- <ion-icon title="Make Drawing"name="create"class="draw_icon"></ion-icon> -->
                        <ion-icon title="Content Warning" class="flag_icon add_flag" src="/images/ionicons/flag-sharp.svg"></ion-icon>
                        <!--<a class="basic_link" rel="modal:open"href="#stream_palette"><ion-icon title="Mutate"src="/images/ionicons/color-palette-sharp.svg"></ion-icon></a>-->
                        <!--<ion-icon class="icon_top_add"title="Add to Top"src="/images/ionicons/caret-up-sharp.svg"></ion-icon>-->
                    </div>
                    <input class="control_input tag_input" value="`+categories+`"placeholder="Tag1, tag2, tag3, ..."name="tags" autocomplete="off"/>
                    <textarea class="control_textarea add_passage_textarea" cols="30" placeholder="" name="passage" rows="6" autocomplete="off">`+content+`</textarea>
                    <input name="chapterID" type="hidden" value="`+chapter+`"/>
                    <input class="dataURL"name="dataURL" type="hidden" value=""/>
                    <input class="flagged"name="flagged" type="hidden" value="false"/>
                    <input name="parentPassage" type="hidden" value="`+parentPassage+`"/>
                    <input name="_id" type="hidden" value="`+_id+`"/>
                     <input class="hidden_upload"name="file" type="file" autocomplete="off"/>
                    <div class="chapter_properties">
                      <select class="modal_select" name="access" autocomplete="off">
                          <option value="public">Public (Everyone can add and edit/delete everything)</option>
                          <option value="protected">Protected (Users can add and edit/delete their own work)</option>
                          <option value="private">Private (Only Author can add/edit/delete)</option>
                          <option value="exclusive">Exclusive (Only Author can see Chapter)</option>
                      </select>
                      <br><br>
                      <input type="checkbox" name="tools" autocomplete="off" checked> Tools
                      <br><br>
                    </div>
                    <button class="control_button" class="add_passage">`+bt_which+`</button>
                    `+after+`
                    <div id="properties"class="properties">
                        <div class="add_property"><ion-icon src="/images/ionicons/add-circle-sharp.svg"></ion-icon> Add Key</div> 
                    </div>
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
        <!-- Currently Active -->
        <option>Hyperlink</option>
        <option>Markdown</option>
        <option>CSS</option>
        <option>HTML</option>
        <option>Eval JS</option>
        <option>Syntax Highlight</option>
        <option>Canvas</option>
        <option>Label</option>
        <option>Audio</option>
        <option>Hidden</option>
        <option>Quill JS</option>
        <option>Code Mirror</option>
        <option>Autoplay</option>
        <option>Loop</option>
        <option>Hide Tools</option>
        <option>Align</option>
        <option>Help</option>
        <option>Music</option>
        <option>Head</option>
        <option>Class</option>
        <option>Donate</option>
        <option>File</option>

        <!-- Currently Inactive -->
        <option>Animation</option>
        <!-- Displays chapter contents as sub passages -->
        <option>Chapter</option>
        <option>Tone</option>
        <option>Graph</option>
        <option>Directory</option>
        <option>Webpage</option>
        <option>Pointer</option>
        <option>Key Schema</option>
        <option>Is Key Schema?</option>
        <option>Impress JS</option>
        <option>Auto Expand</option>
        <option>Custom</option>
        <option>Reference</option>
        <option>Dropdown</option>
        <option>Question</option>
        <option>Task</option>
        <option>TODO</option>
        <option>Mutate</option>
    </select>
    <br><br>
    <input value="`+value+`"name="property_value"class="property_value"type="" name="" autocomplete="off">
</div>
    `;
  };
  exports.printQueuePassage = function(passage, user){
    
  };
  exports.printPassages = function(passages, user){
    var ret = '';
    passages.forEach(function(passage){
      if(!passage.deleted){
        ret += exports.printPassage(passage, user);
      }
    });
    return ret;
  };
  exports.printPassage = function(passage, user, queueItem=false){
       var metadata = JSON.parse(passage.metadata);
       var ret = '';
        ret += `
        <div id="`+passage._id+`" class="passage">`;
            ret += `<div id="modal_add_sub_passage_`+passage._id+`" class="modal">`
          ret += exports.printAddForm('', false, '', passage._id)
         ret +=   `</div>`;
            ret += `<input id="passage_metadata_`+passage._id+`"class="metadata"type="hidden" value='`+passage.metadata+`'/>`;
            ret += `<div class="passage_author">`;

            ret += `<ion-icon class="profile_image"src="/images/ionicons/person-circle-sharp.svg"></ion-icon>`;
            if(passage.author){
                ret += `<div><a class="basic_link" href="/user/`+passage.author._id+`">`+passage.author.username+`</a>`;
            }else{
                ret += `<div><a class="basic_link" href="#">Anonymous</a>`;
            }
            if(passage.chapter && !passage.chapter.title){
              ret += `<div class="passage_label"><a class="basic_link passage_label_link"></a></div>`;
            }
            else if (passage.chapter && passage.chapter.title){
              ret += `<div class="passage_label"><a href="/`+passage.chapter.title+`/`+passage.chapter._id+`" class="basic_link passage_label_link">`+passage.chapter.title+`/</a></div>`;
              ret += '<input class="passage_chapter_id"type="hidden"value="'+passage.chapter._id+'">';
            }
            else{
              ret += `<div class="passage_label"><a class="basic_link passage_label_link" href="/">Sasame/</a></div>`;

            }
            ret += '</div>';
            ret += `<div id="modal_`+passage._id+`" class="modal">
                <p class="modal_title">Passage Options</p>
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
                      ret += `<p>Chapter: <a class="link" href="/${passage.chapter.title}/${passage.chapter._id}">`+passage.chapter.title+`</a></p>`;
                    }
                ret += `</div>`;
              var i = 0;
              var after = '<br>';
              for (let [key, value] of Object.entries(metadata)) {
                    after += exports.printPropertySelect(key, value);
                }
              ret += exports.printAddForm(chapterID, {
                content: passage.content,
                flagged: passage.flagged,
                _id: passage._id,
                categories: passage.categories
              }, after);
              ret += `
              <div class="passage_id">`+passage._id+`</div>
            </div>
            </div>
             <div class="proteins">
             <a class="basic_link" href="#modal_`+passage._id+`" rel="modal:open"><ion-icon title="Details"src="/images/ionicons/settings-sharp.svg"></ion-icon></a>
             `;
             if(user){
                ret += `<ion-icon class="square_icon"title="Add to Queue"src="/images/ionicons/list-circle-sharp.svg"></ion-icon>
                <ion-icon id="star_`+passage._id+`"title="Star"class="star_icon" src="/images/ionicons/star-sharp.svg"></ion-icon> `;
             } 
             ret += `<ion-icon id="passage_flag_`+passage._id+`"title="Content Warning" class="flag_icon`+(passage.flagged == true ? ' flagged': '')+`" src="/images/ionicons/flag-sharp.svg"></ion-icon>
             <!--<ion-icon class="passage_mutate"title="Mutate"src="/images/ionicons/color-palette-sharp.svg"></ion-icon>-->
             <ion-icon class="passage_play"title="Play" src="/images/ionicons/play-circle-sharp.svg"></ion-icon>
             <ion-icon class="view_sub"title="View Sub Passages" src="/images/ionicons/caret-down-sharp.svg"></ion-icon>
             <ion-icon title="Update" id="passage_update_`+passage._id+`"src="/images/ionicons/share-sharp.svg"></ion-icon>
             <ion-icon title="Donate to Author" class="passage_donate"src="/images/ionicons/card-sharp.svg"></ion-icon>
             <ion-icon title="Delete" id="passage_delete_`+passage._id+`"src="/images/ionicons/close-circle-sharp.svg"></ion-icon>
             `;
            ret += '<div class="star_container"><span class="star_count_'+passage._id+'">'+(passage.stars || 0 )+'</span> '+(passage.stars == 1 ? 'Star' : 'Stars')+'</div>';

             ret += `</div>
             <input class="parentPassage"name="parentPassage" type="hidden" value="`+(passage.parentPassage || '')+`"/>
            <input type="hidden" class="original_passage_content" value="`+escapeHTML(passage.content)+`"/>
                <div class="passage_chapter">Sasame</div>`;
            var none = '';
            if(passage.content.length <= 0){
              none = ' none';
            }
            ret += `<div id="passage_content_`+passage._id+`"class="passage_content`+none+`">`+ escapeHTML(passage.content)+`</div>`;
            ret += `<canvas class="passage_canvas"></canvas>`;
            if(passage.filename){
              ret += `<img class="passage_image"src="/uploads/`+passage.filename+`">`;
            }
            ret += `<audio class="passage_audio"controls="true"></audio>
            <input type="hidden" id="canvas_name_` + metadata['Canvas']+`"/>
            <div class="sub_passages">`;
                passage.passages.forEach(function(sub){
                    ret += `<div class="sub_passage">`;
                     ret += exports.printPassage(sub, user);
                     ret += `</div>`;
                });
            ret += `<div class="add_sub_passage"><a class="add_sub_passage_modal basic_link"href="#modal_add_sub_passage_${passage._id}" rel="modal:open"><ion-icon title="Add Sub Passage"src="/images/ionicons/add-circle-sharp.svg"></ion-icon></a></div>
            </div>
            <div class="add_from_queue">Add</div>
        </div>`;
        return ret;
  };
  exports.printChapter = function(chapter){
    var ret = '';
    ret += `
    <div class="category">`;
    if(chapter.flagged){
      ret += `
        <div class="chapter_flag">
            <ion-icon title="Content Warning" src="/images/ionicons/flag-sharp.svg"></ion-icon>
        </div>
      `;
    }
    ret +=    `<div>
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
        <div class="passage passage_file">
          <input type="hidden" value="`+fileName+`" id="file_name"/>
             <div class="proteins">
             <ion-icon class="square_icon"title="Add to Queue"src="/images/ionicons/list-circle-sharp.svg"></ion-icon>
             <ion-icon title="Split" src="/images/ionicons/cut-sharp.svg"></ion-icon>
             <ion-icon title="Move line from above"src="/images/ionicons/add-circle-sharp.svg"></ion-icon>
             <ion-icon title="Move line to above"src="/images/ionicons/remove-circle-sharp.svg"></ion-icon>
             <ion-icon class="file_play"title="Run File" src="/images/ionicons/play-circle.svg"></ion-icon>
             <ion-icon class="file_update"title="Update File" src="/images/ionicons/share-sharp.svg"></ion-icon>
             </div>
            <textarea class="passage_content">`+ escapeHTML(content)+`</textarea>
        </div>`;
        return ret;
  };
  exports.printDir = function(dirname){
    var ret = '';
    ret += `<div>
            <span class="fileStreamChapter">`+dirname+`</span>
        </div>`;
    return ret;
  };
  exports.printCanvas = function(passage){
    var metadata = JSON.parse(passage.metadata);
    if(passage.filename){
      return `<img class="ppe_queue_canvas"src="/uploads/`+passage.filename+`"/>`;
    }
    return `
    <canvas height="${metadata['Canvas']}" width="${metadata['Canvas']}"data-canvas="${passage.content}"data-canvas_size="${metadata['Canvas']}"class="ppe_queue_canvas"></canvas>
    `;
  };
  exports.mate = function(arr1, arr2){
    var min = arr1.length;
    var returnArr = [];
    if(arr2.length < min){
      min = arr2.length;
    }
    for(var i = 0; i < min; ++i){
      if(i % 2 == 0){
        returnArr.push(arr2[i]);
      }
      else{
        returnArr.push(arr1[i]);
      }
    }
    return returnArr;
  };
  exports.describe = function(data, translation){
    var translationKey = {};
    translationKey[data] = translation;
  };
  //where translationKey is an array of functions,
  //indexed by data
  exports.translate = function(data, translationKey){
    for(var i = 0; i < data.length; ++i){
      translationKey[data[i]]();
    }
  };
  exports.mutate = function(data, indice, iterations=0){
    var chunks = data.split(indice);
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
        var ran = Math.floor(Math.random() * chunks.length) + 1;
        var ran2 = Math.floor(Math.random() * chunks.length) + 1;
        if(indice != ''){
          var points = chunks[i].split('');
          points[ran] = points[ran2];
          chunks[i] = points.join('');
        }
        else{
          chunks[ran] = chunks[ran2];
        }
        break;
      }
    }
    return chunks.join(indice);
  };

}(typeof exports === 'undefined' ? this.share = {} : exports));