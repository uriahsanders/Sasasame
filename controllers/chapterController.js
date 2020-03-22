const Chapter = require('../models/Chapter');

module.exports = {
    addChapter: function (options) {
        if(options.chap != '' && options.chap != null){
            let chapter = new Chapter({
                title: options.title,
                chapter: options.chap,
                author: options.author,
                tools: true,
                distraction_free: false,
                categories: options.categories
            }).save().then(data => {
                options.callback(data);
            });
        }
        else{
            // Level 1
            let chapter = new Chapter({
                title: options.title,
                author: options.author,
                tools: true,
                distraction_free: false,
                categories: options.categories
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
    updateChapter: function(req, res, callback){
        var chapterID = req.body._id;
        var distraction_free = req.body.distraction_free || false;
        distraction_free = distraction_free == 'on' ? true : false;
        var tools = req.body.tools || true;
        tools = tools == 'on' ? true : false;
        Chapter.updateOne({_id: chapterID.trim()}, {
            title: req.body.title,
            distraction_free: distraction_free,
            tools: tools,
            access: req.body.access
        }, function(err, affected, resp){
            if(err){
                console.log(err);
            }
            callback();
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