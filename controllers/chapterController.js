const Chapter = require('../models/Chapter');

module.exports = {
    addChapter: function (options) {
        if(options.chap != '' && options.chap != null){
            let chapter = new Chapter({
                title: options.title,
                chapter: options.chap,
                author: options.author
            }).save().then(data => {
            });
        }
        else{
            // Level 1
            let chapter = new Chapter({
                title: options.title,
                author: options.author
            }).save(function(err,chap){
                if(err){
                    console.log(err);
                }
            });
        }
        options.callback();
    }
}