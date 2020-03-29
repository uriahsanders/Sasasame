const Passage = require('../models/Passage');
const Chapter = require('../models/Chapter');
//Call in Scripts
const scripts = require('../shared');
var fs = require('fs'); 

module.exports = {
    addPassage: function(options) {
        var post;
        if(options.chapter != '' && options.chapter != null){
            post = new Passage({
                content: options.content,
                chapter: options.chapter,
                sourceChapter: options.chapter,
                author: options.author,
                sourceAuthor: options.author,
                canvas: options.canvas,
                label: options.label,
                metadata: options.metadata,
                filename: options.filename,
                categories: options.categories
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
                post = new Passage({
                    content: options.content,
                    author: options.author,
                    metadata: options.metadata,
                    canvas: options.canvas,
                    parent: options.parentPassage,
                    filename: options.filename,
                    categories: options.categories
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
                post = new Passage({
                    content: options.content,
                    author: options.author,
                    sourceAuthor: options.author,
                    metadata: options.metadata,
                    canvas: options.canvas,
                    filename: options.filename,
                    categories: options.categories
                }).save()
                .then(data => {
                    options.callback(data);
                });
            }
            
        }
        //Do Passage Metadata functions
        //also need to do on update and delete
        for(let [key, value] of Object.entries(options.metadata)){
            switch(key){
                case 'Categories':
                //We need to create the category if it does not exist
                Category.find({title: new RegExp('^'+value+'$', "i")})
                .exec(function(cats){
                    //we need to create the Category
                    if(!cats){
                        Category.create({
                            title: value
                        }, function(err, cat){
                            cat.passages.push(post);
                            cat.save();
                        });
                    }
                    else{
                        cats.forEach(function(cat){
                            cat.passages.push(post);
                            cat.save();
                        });
                    }
                });
                break;
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
    updatePassage: function(options) {
        Passage.updateOne({_id: options.id.trim()}, {
            content: options.content,
            canvas: options.canvas,
            label: options.label,
            metadata: options.metadata,
            categories: options.categories
        }, function(err, affected, resp){
            if(err){
                console.log(err);
            }
            options.callback();
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
        Passage.findOneAndDelete({_id: passageID.trim()}, function(err, passage){
            if(passage.filename){
                fs.unlink('./dist/uploads/'+passage.filename, (err) => {
                    if (err) throw err;
                    console.log('./dist/uploads/'+passage.filename+' was deleted');
                });
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