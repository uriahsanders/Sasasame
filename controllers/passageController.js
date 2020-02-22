const Passage = require('../models/Passage');
const Chapter = require('../models/Chapter');

module.exports = {
    addPassage: function(options) {
        if(options.chapter != '' && options.chapter != null){
            let post = new Passage({
                content: options.content,
                chapter: options.chapter,
                author: options.author,
                metadata: options.metadata
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
            });
        }
        else{
            //level 1 passage
            let post = new Passage({
                content: options.content,
                author: options.author,
                metadata: options.metadata
            }).save();
        }
        options.callback();
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
        var i = 0;
        if(Array.isArray(property_key)){
            property_key.forEach(function(key){
                metadata[key] = property_value[i++];
            });
        }
        else{
            metadata[property_key] = property_value;
        }
        Passage.updateOne({_id: passageID.trim()}, {
            content: content,
            metadata: JSON.stringify(metadata)
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
    }
}