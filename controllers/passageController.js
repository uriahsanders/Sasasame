const Passage = require('../models/Passage');
const Chapter = require('../models/Chapter');
//Call in Scripts
const scripts = require('../shared');

module.exports = {
    addPassage: function(options) {
        //Do Passage Metadata functions
        //also need to do on update and delete
        for(let [key, value] of Object.entries(options.metadata)){
            switch(key){
                case 'Category':
                break;
            }
        }
        //
        if(options.chapter != '' && options.chapter != null){
            let post = new Passage({
                content: options.content,
                chapter: options.chapter,
                sourceChapter: options.chapter,
                author: options.author,
                sourceAuthor: options.author,
                canvas: options.canvas,
                label: options.label,
                metadata: options.metadata,
            }).save().then(data => {
                Chapter.findOne({_id:options.chapter}).exec(function(err, chap){
                    if(chap.passages){
                        chap.passages.push(data);
                    }
                    else{
                        chap.passages = [data];
                    }
                    chap.save();
                });
                options.callback(data);
            });
        }
        else{
            //level 1 sub passage
            if(options.parentPassage != '' && options.parentPassage != null){
                let post = new Passage({
                    content: options.content,
                    author: options.author,
                    metadata: options.metadata,
                    canvas: options.canvas,
                    parent: options.parentPassage
                }).save()
                .then(data => {
                    Passage.findOne({_id:options.parentPassage}).exec(function(err, passage){
                        if(passage.passages){
                            passage.passages.push(data);
                        }
                        else{
                            passage.passages = [data];
                        }
                        passage.save();
                    });
                    options.callback(data);
                });
            }else{
                //level 1 passage
                let post = new Passage({
                    content: options.content,
                    author: options.author,
                    sourceAuthor: options.author,
                    metadata: options.metadata,
                    canvas: options.canvas
                }).save()
                .then(data => {
                    options.callback(data);
                });
            }
            
        }
    },
    addPassageToCategory: function(passageID, chapterID, callback) {
        Chapter.find({_id:chapterID}).sort([['_id', 1]]).exec(function(err, chapter){
            chapter.passages.append(passageID);
            chapter.save().then((data) => {
                callback();
            });
        });
    },
    updatePassage: function(req, res, callback) {
        var passageID = req.body._id;
        var chapterID = req.body.chapterID;
        var type = req.body.type;
        var user = req.session.user_id || null;
        var content = req.body.passage || '';
        var property_key = req.body['property_key[]'] || req.body.property_key;
        var property_value = req.body['property_value[]'] || req.body.property_value;
        //build metadata from separate arrays
        var metadata = {};
        var canvas = false;
        var label = '';
        var i = 0;
        if(Array.isArray(property_key)){
            property_key.forEach(function(key){
                if(key == 'Canvas'){
                    canvas = true;
                }
                if(key == 'Label'){
                    label = property_value[i];
                }
                metadata[key] = property_value[i++];
            });
        }
        else{
            if(property_key == 'Canvas'){
            canvas = true;
            }
            if(property_key == 'Label'){
                label = property_value;
            }
            metadata[property_key] = property_value;
        }
        Passage.updateOne({_id: passageID.trim()}, {
            content: content,
            canvas: canvas,
            label: label,
            metadata: JSON.stringify(metadata)
        }, function(err, affected, resp){
            if(err){
                console.log(err);
            }
            callback();
        });
    },
    updatePassageContent: function(req, res, callback) {
        var passageID = req.body._id;
        var content = req.body.content || '';
        Passage.updateOne({_id: passageID.trim()}, {
            content: content,
        }, function(err, affected, resp){
            if(err){
                console.log(err);
            }
            callback();
        });
    },
    deletePassage: function(req, res, callback) {
        let passageID = req.body._id;
        Passage.deleteOne({ _id: passageID.trim() }, function(err) {
            if(err){
                console.log(err);
            }
            callback();
        });
    },
    duplicatePassage: function(req, res, callback){
        //make a copy of the passage
        //but change the author
        var passage = new Passage(req.body.passage);
        passage.author = session.user;
        passage.chapter = req.body.chapter.
        passage.save();
    }
}