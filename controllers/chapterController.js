const Chapter = require('../models/Chapter');

module.exports = {
    addChapter: function (options) {
        if(options.chap != '' && options.chap != null){
            let chapter = new Chapter({
                title: options.title,
                chapter: options.chap,
                author: options.user
            }).save().then(data => {
            });
        }
        else{
            // Level 1
            let chapter = new Chapter({
                title: options.title,
                author: options.user
            }).save(function(err,chap){
                if(err){
                    console.log(err);
                }
            });
        }
        options.callback();
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
    }
}