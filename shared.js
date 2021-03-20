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
                      <div class="editor_code_select_container"style="text-align:center;margin:10px;">
                        <select class="editor_code_select" autocomplete="off">
                          <option value="javascript">Javascript</option>
                          <option value="python">Python</option>
                          <option value="ruby">Ruby</option>
                          <option value="html">HTML</option>
                          <option value="css">CSS</option>
                        </select>
                      </div>
                      <div class="editor_option"id="editor_code">Code</div>
                    </div>
                    <div class="add_passage_icons"style="text-align:left">
                        <ion-icon title="Add Image"class="image_upload_icon"src="/images/ionicons/images-outline.svg"></ion-icon>
                        <!-- <ion-icon title="Attach File"name="attach"></ion-icon> -->
                        <ion-icon data-status="empty"title="Add Audio Recording"class="mic_record_icon"src="/images/ionicons/mic-circle-outline.svg"></ion-icon>
                        <!--<ion-icon title="Choose Editor" class="editor_choose" src="/images/ionicons/newspaper-outline.svg"></ion-icon>-->
                        <ion-icon title="Add Tags" name="tags"class="tag_add" src="/images/ionicons/add-circle-outline.svg"></ion-icon>
                        <!-- <ion-icon title="Make Drawing"name="create"class="draw_icon"></ion-icon> -->
                        <ion-icon title="Content Warning" class="flag_icon add_flag" src="/images/ionicons/flag-outline.svg"></ion-icon>
                        <ion-icon title="Javascript" class="editor_choose"src="/images/ionicons/logo-javascript.svg"></ion-icon>
                        <!--<a class="basic_link" rel="modal:open"href="#stream_palette"><ion-icon title="Mutate"src="/images/ionicons/color-palette-outline.svg"></ion-icon></a>-->
                        <!--<ion-icon class="icon_top_add"title="Add to Top"src="/images/ionicons/caret-up-outline.svg"></ion-icon>-->
                    </div>
                    <input class="control_input tag_input" value="`+categories+`"placeholder="Tag1, tag2, tag3, ..."name="tags" autocomplete="off"/>
                    <textarea class="control_textarea add_passage_textarea" cols="30" placeholder="" name="passage" rows="6" autocomplete="off">`+content+`</textarea>
                    <input name="chapterID" type="hidden" value="`+chapter+`"/>
                    <input class="dataURL"name="dataURL" type="hidden" value=""/>
                    <input class="flagged"name="flagged" type="hidden" value="false"/>
                    <input class="javascript"name="javascript" type="hidden" value="false"/>
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
                    <!--<div id="properties"class="properties">
                        <div class="add_property"><ion-icon src="/images/ionicons/add-circle-outline.svg"></ion-icon> Add Key</div> 
                    </div>-->
                    </form>
    `;
    return ret;
  };
  exports.printPropertySelect = function(key, value){
    key = key || 'Color';
    value = value || '';
    return `
<div class="property_select">
    <ion-icon title="Remove"class="remove_property"src="/images/ionicons/remove-circle-outline.svg"></ion-icon> 
    <ion-icon title="Help"class="property_info"src="/images/ionicons/help-circle-outline.svg"></ion-icon> 
    <!-- For Passages -->
    <select name="property_key"class="property_key" autocomplete="off">
        <option selected="selected">`+key+`</option>
        <!-- Currently Active or Pending -->
        <option>Hyperlink</option>
        <option>Markdown</option>
        <option>CSS</option>
        <option>HTML</option>
        <option>Eval JS</option>
        <option>Syntax Highlight</option>
        <option>Canvas</option>
        <option>Label</option>
        <option>Audio</option>
        <!--Only show header-->
        <option>Hidden</option>
        <!--Display as Rich Text-->
        <option>Quill JS</option>
        <!--Display as code-->
        <option>Code Mirror</option>
        <!--Click play button on load-->
        <option>Autoplay</option>
        <option>Hide Tools</option>
        <option>Align</option>
        <option>Help</option>
        <option>Music</option>
        <option>Head</option>
        <option>Class</option>
        <option>ID</option>
        <!--Add donation link-->
        <option>Donate</option>
        <!--Sync with a file in filesystem-->
        <option>File</option>
        <!--Link to source else reference
        If there is also a passage source it will display alongside-->
        <option>Source</option>
        <!--Enables mutations and hides @sasame tags-->
        <option>Sasame</option>
        <!--Link to an alternate passage with the same purpose-->
        <option>Alternate</option>
        <!--Properties and Methods-->
        <option>Metadata</option>
        <!--Include a Passage-->
        <option>Include</option>
        <!-- Displays chapter contents as sub passages, puts in the TOC -->
        <option>Chapter</option>

        <!-- Currently Inactive -->
        <option>Animation</option>
        <option>Tone</option>
        <option>Graph</option>
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
  // print chapter with ajax dropdown for passages
  exports.printChap = function(chapter, user){
    var ret = '';
    ret += `
    <div id="chap">
      <ion-icon style="font-size: 0.75em;"title="View" src="/images/ionicons/caret-down-outline.svg"></ion-icon>
      <ion-icon style="font-size: 0.75em;"title="Copy to Side Chapter" style="color:#fff;"src="/images/ionicons/copy-outline.svg"></ion-icon>
      <ion-icon style="font-size: 0.75em;" title="Add Passage" src="/images/ionicons/add-circle-outline.svg" role="img"></ion-icon>
      <a href="/`+chapter.title+`/`+chapter._id+`" class="basic_link passage_label_link">`+chapter.title+`</a>
    </div>
    `;
    return ret;
  };
  exports.printPassage = function(passage, user, queueItem=false){
       var metadata = JSON.parse(passage.metadata);
       var ret = '';
        ret += `
        <div id="`+passage._id+`" class="passage">`;
        ret += '<div class="star_container"><span title="Stars"class="star_count_'+passage._id+'">'+(passage.stars || 0 )+'<ion-icon id="star_`+passage._id+`"title="Star"class="star_icon" src="/images/ionicons/star-sharp.svg"></ion-icon></span></div>';

            ret += `<div id="modal_add_sub_passage_`+passage._id+`" class="modal">`
          ret += exports.printAddForm('', false, '', passage._id) 
         ret +=   `</div>`;
            ret += `<input id="passage_metadata_`+passage._id+`"class="metadata"type="hidden" value='`+passage.metadata+`'/>`;
            ret += `<div class="passage_author">`;
        //     ret += `<div title="Useful"class="special_mark">
        // <ion-icon class="special_icon" src="/images/ionicons/checkmark-circle-outline.svg"></ion-icon>
        // </div>`;

            ret += `<ion-icon class="profile_image"src="/images/ionicons/person-circle-outline.svg"></ion-icon>`;
            if(passage.author){
                ret += `<a class="profile_author basic_link" href="/user/`+passage.author._id+`">`+passage.author.username+`</a>`;
            }else{
                ret += `<a class="profile_author basic_link" href="#">Anonymous</a>`;
            }
            ret += `<div class="proteins">
             <ion-icon class="view_sub"title="Context" src="/images/ionicons/book-outline.svg"></ion-icon>
             <ion-icon id="passage_details_`+passage.id+`"class="passage_details_icon"title="Details"src="/images/ionicons/settings-outline.svg"></ion-icon>
             `;
             // if(user){
             //    ret += `<ion-icon id="star_`+passage._id+`"title="Star"class="star_icon" src="/images/ionicons/star-outline.svg"></ion-icon> `;
             // } 
             ret += `<ion-icon id="passage_flag_`+passage._id+`"title="Content Warning" class="flag_icon`+(passage.flagged == true ? ' flagged': '')+`" src="/images/ionicons/flag-outline.svg"></ion-icon>
             <!--<ion-icon class="passage_mutate"title="Mutate"src="/images/ionicons/color-palette-outline.svg"></ion-icon>-->
             <ion-icon class="passage_play"title="Play" src="/images/ionicons/play-circle-outline.svg"></ion-icon>
             <ion-icon class="view_sub"title="Comments" src="/images/ionicons/chatbubbles-outline.svg"></ion-icon>
             <!--<ion-icon title="Update" id="passage_update_`+passage._id+`"src="/images/ionicons/share-outline.svg"></ion-icon>-->
             <ion-icon title="Copy to Side Chapter" style="color:#fff;"src="/images/ionicons/copy-outline.svg"></ion-icon>
             <ion-icon class=""title="Split Selected to Side Chapter" src="/images/ionicons/cut-outline.svg"></ion-icon>
             <ion-icon class=""title="Share" src="/images/ionicons/share-social-outline.svg"></ion-icon>
             <ion-icon title="Donate to Author" class="passage_donate"src="/images/ionicons/card-outline.svg"></ion-icon>
             <ion-icon title="Delete" id="passage_delete_`+passage._id+`"src="/images/ionicons/close-circle-outline.svg"></ion-icon>
             `;
             ret += `</div>`;
            // if(passage.chapter && !passage.chapter.title){
            //   ret += `<div class="passage_label"><a class="basic_link passage_label_link"></a></div>`;
            // }
            // else if (passage.chapter && passage.chapter.title){
            //   ret += `<div class="passage_label"><a href="/`+passage.chapter.title+`/`+passage.chapter._id+`" class="basic_link passage_label_link">`+passage.chapter.title+`</a></div>`;
            //   ret += '<input class="passage_chapter_id"type="hidden"value="'+passage.chapter._id+'">';
            // }
            // else{
            //   ret += `<div class="passage_label"><a class="basic_link passage_label_link" href="/">General</a></div>`;

            // }
            ret += `<div id="modal_`+passage._id+`" class="modal">
                <div class="passage_details">`;
                    //date.toDateString() in future
                    ret += `<p>Created: `+passage.date.toString().split(' ').splice(0,4).join(' ')+`</p>`;
                    if(passage.author){
                        ret += `<p>By: `+passage.author.username+` </p>`;
                    }else{
                        ret += `<p>By: Anonymous</p>`;
                    }
                    var stars = passage.stars || 0;
                    ret += `<p>`+stars+` Star`+(stars == 1 ? '' : 's')+`</p>`;
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
            </div>`;
             ret += `<input class="parentPassage"name="parentPassage" type="hidden" value="`+(passage.parentPassage || '')+`"/>
            <input type="hidden" class="original_passage_content" value="`+escapeHTML(passage.content)+`"/>
                <div class="passage_chapter">Sasame</div>`;
            var none = '';
            if(passage.content.length <= 0){
              none = ' none';
            }
            ret += `<div id="passage_content_`+passage._id+`"class="passage_content`+none+`">`+ escapeHTML(passage.content)+`</div>`;
            ret += `<canvas class="passage_canvas"></canvas>`;
            if(passage.filename){
              ret += `<div class="passage_white"><img class="passage_image"src="/uploads/`+passage.filename+`"></div>`;
            }
            ret += `<audio class="passage_audio"controls="true"></audio>
            <input type="hidden" id="canvas_name_` + metadata['Canvas']+`"/>
            <div class="sub_passages">`;
                passage.passages.forEach(function(sub){
                    ret += `<div class="sub_passage">`;
                     ret += exports.printPassage(sub, user);
                     ret += `</div>`;
                });
            ret += `<div class="add_sub_passage"><a class="add_sub_passage_modal basic_link"href="#modal_add_sub_passage_${passage._id}" rel="modal:open"><ion-icon title="Add Sub Passage"src="/images/ionicons/add-circle-outline.svg"></ion-icon></a></div>
            </div>`;
            // if(passage.passages.length > 0){
            //   ret += '<div class="special_view_sub_container"style="text-align: center;margin-top:5px;"><ion-icon class="special_view_sub"title="Sub Passages"src="/images/ionicons/caret-down-outline.svg"></ion-icon></div>';
            // }
            ret += `<div class="add_from_queue">Add</div>
        </div>`;
        return ret;
  };
  exports.printCanvas = function(passage, user=null){
    var metadata = JSON.parse(passage.metadata);
    var ret = '<div id="ppe_container_'+passage._id+'"class="ppe_canvas_container">';
    //same icons as passages
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
             <div class="canvas_proteins">
             <ion-icon id="passage_details_`+passage.id+`"class="passage_details_icon"title="Details"src="/images/ionicons/settings-outline.svg"></ion-icon>
             `;
             if(user){
                ret += `<ion-icon id="star_`+passage._id+`"title="Star"class="star_icon" src="/images/ionicons/star-outline.svg"></ion-icon> `;
             } 
             ret += `<ion-icon id="passage_flag_`+passage._id+`"title="Content Warning" class="flag_icon`+(passage.flagged == true ? ' flagged': '')+`" src="/images/ionicons/flag-outline.svg"></ion-icon>
             <!--<ion-icon class="passage_mutate"title="Mutate"src="/images/ionicons/color-palette-outline.svg"></ion-icon>-->
             <ion-icon class="passage_play"title="Play" src="/images/ionicons/play-circle-outline.svg"></ion-icon>
             <ion-icon title="Donate to Author" class="passage_donate"src="/images/ionicons/card-outline.svg"></ion-icon>
             <ion-icon title="Delete" id="passage_delete_`+passage._id+`"src="/images/ionicons/close-circle-outline.svg"></ion-icon>
             `;
             ret += `</div>`;
    //END

    if(passage.filename){
      ret += `<img class="ppe_queue_canvas"src="/uploads/`+passage.filename+`"/></div>`;
      return ret;
    }
    ret += `
    <canvas height="${metadata['Canvas']}" width="${metadata['Canvas']}"data-canvas="${passage.content}"data-canvas_size="${metadata['Canvas']}"class="ppe_queue_canvas"></canvas>`;
    ret += '</div>';
    return ret;
  };
  exports.printChapter = function(chapter){
    var ret = '';
    ret += `
    <a class="chapter_link" href="/`+chapter.title+`/`+chapter._id+`"><div class="category">`;
      ret += `
        <div class="chapter_flag">`;
    if(chapter.flagged){
      ret += `
            <ion-icon title="Content Warning" src="/images/ionicons/flag-outline.svg"></ion-icon>
      `;
    }
    ret +=    `</div><div>
            `+chapter.title+`
        </div>
        <div class="category_id">`+chapter._id+`</div>
    </div></a>`;
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
             <ion-icon class="square_icon"title="Add to Queue"src="/images/ionicons/list-circle-outline.svg"></ion-icon>
             <ion-icon title="Split" src="/images/ionicons/cut-outline.svg"></ion-icon>
             <ion-icon title="Move line from above"src="/images/ionicons/add-circle-outline.svg"></ion-icon>
             <ion-icon title="Move line to above"src="/images/ionicons/remove-circle-outline.svg"></ion-icon>
             <ion-icon class="file_play"title="Run File" src="/images/ionicons/play-circle.svg"></ion-icon>
             <ion-icon class="file_update"title="Update File" src="/images/ionicons/share-outline.svg"></ion-icon>
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
  // Print Chapter in Entirety
  exports.displayWholeChapter = function(chapter){
    return `
      <span  class="chapter_tools"id="parent_chapter_title">`+chapter.title+`</span>
                            <div class="chapter_tools">
                                  <!-- <a class="basic_link" rel="modal:open"href="#stream_palette"><ion-icon title="Mutate"src="/images/ionicons/color-palette.svg"></ion-icon></a> -->
                                 <a class="basic_link" rel="modal:open"href="#chapter_settings"><ion-icon title="Chapter Settings"src="/images/ionicons/settings-outline.svg"></ion-icon></a>
                                 <!-- <ion-icon title="Add to Queue"class="square_icon"src="/images/ionicons/list-circle-outline.svg"></ion-icon> -->
                                 <ion-icon id="chapter_star_`+chapter._id+`"title="Star"class="star_icon"src="/images/ionicons/star-outline.svg"></ion-icon>
                                 <ion-icon id="chapter_flag_`+chapter._id+`"title="Content Warning" class="flag_icon`+(chapter.flagged == true ? ' flagged' : '')+`" src="/images/ionicons/flag-outline.svg"></ion-icon>
                                 <ion-icon class=""title="Share" src="/images/ionicons/share-social-outline.svg"></ion-icon>
                                 <ion-icon id="play_all"title="Play All" src="/images/ionicons/play-circle-outline.svg"></ion-icon>
                                 <ion-icon title="Load All"src="/images/ionicons/reload-circle-outline.svg"></ion-icon>
                                 <ion-icon title="Download as PDF"src="/images/ionicons/download-outline.svg"></ion-icon>
                                 <ion-icon title="Update Order" id="update_order_`+chapter._id+`"src="/images/ionicons/documents-outline.svg"></ion-icon>
                                 <ion-icon class=""title="Bookmark" src="/images/ionicons/bookmark-outline.svg"></ion-icon>
                            </div>
                            <br>
                            <div id="chapter_description">
                              Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                              tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                              quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                              consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
                              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                              proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                            </div>  
                            <br>
                            <!-- <span  class="chapter_tools"id="parent_chapter_title">`+chapter.title+`</span> -->
                                <input id="parent_chapter_id"type="hidden" value="`+chapter._id+`"/>
                                <input id="page" type="hidden" value="2" autocomplete="off"/>
                            <div id="chapter_settings" class="modal">
                              <p class="modal_title">Chapter Options</p>
                              <p>`+(chapter.stars || 0 )+` Stars </p>
                              <form id="update_chapter_form">
                                  Title:
                                  <p><input class="control_input"value="`+chapter.title+`"type="" name="title" autocomplete="off"></p>
                                  Access (Currently `+chapter.access+`):<br><br>
                                  <div>
                                      <select class="modal_select" name="access" autocomplete="off">
                                      <option value="public">Public (Everyone can add and edit/delete everything)</option>
                                      <option value="protected">Protected (Everyone can add and edit/delete their own work)</option>
                                      <option value="private">Private (Only Team can add/edit/delete)</option>
                                      <option value="exclusive">Exclusive (Only Team can see Chapter)</option>
                                  </select>
                                  <br>
                                  <div>Team: Author, ..., ..., ...</div>
                                  <div><input placeholder="Add User to Team"type="" name=""></div>
                                  <br><br>
                                  <input id="is_tools_active"type="checkbox" name="tools"  `+(chapter.tools == true ? 'checked' : '')+` autocomplete="off"> Tools
                                  <br><br>
                                  </div>
                                  <input type="hidden" name="_id" value="`+chapter._id+`" autocomplete="off">
                                  <button class="control_button">Update</button>
                              </form>
                              <p class="chapter_delete_`+chapter._id+`">Delete Chapter</p>
                            </div>
    `;
  };

  exports.listChapters = function(chapters){

  };

}(typeof exports === 'undefined' ? this.share = {} : exports));