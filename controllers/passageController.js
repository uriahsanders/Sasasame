const Passage = require('../models/Passage');
const Chapter = require('../models/Chapter');

module.exports = {
    addPassage: function(options) {
        if(options.chapter != '' && options.chapter != null){
            let post = new Passage({
                content: options.content,
                chapter: options.chapter,
                author: options.user
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
                author: options.user
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
    updatePassage: function(req, res) {
        let passageID = req.body._id;
        let content = req.body.content;
        //remove white space and separate by comma
        // let keys = req.body.keys.replace(/\s/g,'').split(',');
        let keys = req.body.keys;
        Passage.updateOne({_id: passageID.trim()}, {
            keys: keys,
            content: content
        }, function(err, affected, resp){
            if(err){
                console.log(err);
            }
            res.send(resp);
        });
    },
    deletePassage: function(req, res) {
        let passageID = req.body._id;
        Passage.deleteOne({ _id: passageID.trim() }, function(err) {
            if(err){
                console.log(err);
            }
            res.send('The passage has been deleted.');
        });
    }
}