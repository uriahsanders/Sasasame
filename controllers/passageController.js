const Passage = require('../models/Passage');
const Chapter = require('../models/Chapter');

module.exports = {
    addPassage: function(options) {
        if(options.chapter != '' && options.chapter != null){
            let post = new Passage({
                content: options.content,
                chapter: options.chapter,
                author: options.author
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
                author: options.author
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
    }
}