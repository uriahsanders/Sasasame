const Chapter = require('../models/Chapter');

module.exports = {
    addChapter: function (options) {
        if(options.chap != '' && options.chap != null){
            let chapter = new Chapter({
                title: options.title,
                chapter: options.chap,
                author: options.author
            }).save().then(data => {
                options.callback(data);
            });
        }
        else{
            // Level 1
            let chapter = new Chapter({
                title: options.title,
                author: options.author
            }).save()
            .then(data => {
                options.callback(data);
            });
        }
    },
    deleteChapter: function(req, res) {
        let chapterID = req.body._id;
        //delete chapter
        //in the future consider also deleting all passages within this chapter
        Chapter.deleteOne( {_id: chapterID.trim() }, function(err){
            if(err){
                console.log(err);
            }
            res.send('The chapter has been deleted.');
        });
    },
    updateChapterOrder: function(req, res, callback) {
        var chapterID = req.body.chapterID;
        var passages = JSON.parse(req.body.passages);
        let trimmedPassages = passages.map(str => str.trim());
        Chapter.updateOne({_id: chapterID.trim()}, {
            passages: trimmedPassages,
        }, function(err, affected, resp){
            if(err){
                console.log(err);
            }
            callback();
        });
    },
}