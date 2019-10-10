// This file is the 'Controller'
'use strict';
const express = require('express');
const ejs = require('ejs');

var app = express();
app.use(express.static('./dist'));
app.set('view engine', 'ejs');
app.set('views', './views');
// For POST requests
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// For Logging in
var session = require('express-session');
//Call in Models
var models = require('./models');
//Call in Scripts
var scripts = require('./scripts');
// Password Protection for When Upgrading
var securedRoutes = require('express').Router();
securedRoutes.use((req, res, next) => {

  // -----------------------------------------------------------------------
  // authentication middleware

  const auth = {login: 'developer', password: 'sasame'} // change this

  // parse login and password from headers
  const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
  const [login, password] = new Buffer(b64auth, 'base64').toString().split(':')

  // Verify login and password are set and correct
  if (login && password && login === auth.login && password === auth.password) {
    // Access granted...
    return next()
  }

  // Access denied...
  res.set('WWW-Authenticate', 'Basic realm="401"') // change this
  res.status(401).send('Authentication required.') // custom message

  // -----------------------------------------------------------------------

});
// Uncomment these lines to password protect while evolving Sasame
// securedRoutes.get('path1', /* ... */);
// app.use('/', securedRoutes);
// app.get('public', /* ... */);
app.get('/', function(req, res) {
    //scripts.renderIndexPage(req, res);
    models.Passage.countDocuments({}, function( err, count){
        models.Passage.findOne().sort({_id: -1}).exec(function(err, passage) {
            if(!err) {
                res.render('index', { passage: passage, light: count });
            }
            else{
                console.log(err);
            }
        });
    });
});
app.get('/login', function(req, res) {
    res.render('login');
});
app.get('/control', function(req, res) {
    res.render('control');
});

app.get('/help', function(req, res) {
    res.render('help');
});
app.get('/history', function(req, res) {
    res.render('history');
});
app.get('/team', function(req, res) {
    res.render('blog', { posts });
});
app.get('/applications', function(req, res) {
    res.render('blog', { posts });
});
app.get(/\/sasasame\/?(:category\/:category_ID)?/, function(req, res) {
    //scripts.renderBookPage(req, res);
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    var urlEnd = fullUrl.split('/')[fullUrl.split('/').length - 1];
    var chapterTitle = fullUrl.split('/')[fullUrl.split('/').length - 2];
    var golden = '';
    var addPassageAllowed = true;
    var addChapterAllowed = true;
    //home page
    if(urlEnd == '' || urlEnd.length < 15){
        models.Chapter.find({level:1}).sort({_id: 0}).exec()
        .then(function(chapters){
            //Paginate here
            models.Passage.find().populate('chapter').sort([['_id', -1]]).exec()
            .then(function(passages){
                res.render("sasasame", {chapter: '', sasasame: 'sasasame', chapterTitle: 'Sasame', parentChapter: null, 
                book: passages, chapters: chapters, addPassageAllowed: true, addChapterAllowed: false});
            })
            .then(function(err){
                if(err){
                    console.log(err);
                }
            });
        })
        .then(function(err){
            if(err){
                console.log(err);
            }
        });
    }
    //category ID
    else{
        //find all passages in this category
        //Paginate here
        models.Passage.find({chapter: urlEnd}).populate('chapter')
        .exec()
        .then(function(passages){
            models.Chapter.find({_id:urlEnd}).populate('chapter').exec()
            .then(function(chapter){
                //find all categories in this category
                //Paginate Priority 2
                models.Chapter.find({chapter: urlEnd}).exec()
                .then(function(chaps){
                    res.render("sasasame", {sasasame: 'xyz', parentChapter: chapter[0], 
                    chapter: urlEnd, book: passages, chapters: chaps, 
                    addPassageAllowed: addPassageAllowed, addChapterAllowed: addChapterAllowed});
                })
                .then(function(err){
                    if(err){
                        console.log(err);
                    }
                });
            })
            .then(function(err){
                if(err){
                    console.log(err);
                }
            });
        })
        .then(function(err){
            if(err){
                console.log(err);
            }
        });
    }
});
var addPassage = function(chapter, keys, content, callback) {
    console.log('test');
    keys = keys || '';
    if(chapter != '' && chapter != null){
        let post = new models.Passage({
            content: content,
            chapter: chapter,
            keys: keys
        }).save().then(data => {
            models.Chapter.findOne({_id:chapter}).exec(function(err, chap){
                console.log(chapter);
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
        console.log('level 1');
        let post = new models.Passage({
            content: content,
            keys: keys
        }).save();
    }
    callback();
};
var addChapter = function(chap, title, callback) {
    if(chap != '' && chap != null){
        let chapter = new models.Chapter({
            title: title,
            chapter: chap
        }).save().then(data => {
            console.log(data.chapter);
        });
    }
    else{
        // Level 1
        let chapter = new models.Chapter({
            title: title,
        }).save(function(err,chap){
            if(err){
                console.log(err);
            }
        });
    }
    callback();
};
var addPassageToCategory = function(passageID, chapterID, callback) {
    models.Chapter.find({_id:chapterID}).sort([['_id', 1]]).exec(function(err, chapter){
        chapter.passages.append(passageID);
        chapter.save().then((data) => {
            callback();
        });
    });
};

app.get(/\/add_chapter\/?(:chapterID)?/, (req, res) => {
    let info = req.query;
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    var urlEnd = fullUrl.split('/')[fullUrl.split('/').length - 1];
    var chapterID = urlEnd.split('?')[0] || '';
    var backURL=req.header('Referer') || '/';
    if(info.title != ''){
        addChapter(chapterID, info.title, function(){
            res.redirect(backURL);
        });
    }
    else{
        addChapter(chapterID, 'Moist SOIL', function(){
            res.redirect(backURL);
        });
    }
});
app.post(/\/add_passage\/?/, (req, res) => {
    var chapterID = req.body.chapterID;
    var backURL=req.header('Referer') || '/';
    //remove white space and separate by comma
    var keys = req.body.keys.replace(/\s/g,'').split(',');
    if(req.body.passage != ''){
        addPassage(chapterID, keys, req.body.passage, function(){
            res.redirect(backURL);
        });
    }
    else{
        addPassage(chapterID, '', 'WATER nourishes even fire.', function(){
            res.redirect(backURL);
        });
    }
});
app.post(/\/delete_passage\/?/, (req, res) => {
    var passageID = req.body._id;
    models.Passage.deleteOne({_id: passageID.trim()}, function(err){
        if(err){
            console.log(err);
        }
    });
});
app.get('/feed_sasame', (req, res) => {
    let info = req.query;
    // author,
    // rank,
    // content
    models.Passage.findOne().sort({_id: -1}).exec(function(err, passage) {
        if(err){
            console.log(err);
        }
        if (passage && info.content != passage.content){
            addPassage('', '', info.content, function(){
                res.redirect("/");
            });
        }
        else{
            addPassage('', '', 'LIGHT is the fire behind life.', function(){
                res.redirect("/");
            });
        }
    });
});
app.post('/search_by_key', (req, res) => {
    var keys = req.body.keys.replace(/\s/g,'').split(',');
    //Paginate here
    models.Passage.find({keys:keys}).populate('chapter').exec(function(err, passages){
        // res.render('control', {passages: passages});
        res.send(JSON.stringify(passages));
    });
});
app.post('/make_golden_road', (req, res) => {
    var title = req.body.title;
    var passages = JSON.parse(req.body.passages);
    //Find the Category for all Golden Roads first
    models.Chapter.findOne({level: 1, title: 'Golden Roads'}).exec(function(err, chapter){
        //We need to make a new category and add all the selected passages to it
        var cat = new models.Chapter({
            title: title,
            chapter: chapter,
        }).save(function(err, new_chapter){
            //now get all passages by the ID list sent to use by the client
            //And then create the new passages
            //Make sure they're linked to the chapter
            passages.forEach(function(p){
                p.chapter = new_chapter;
            });
            models.Passage.create(passages, function(err, ps){
                if(err) console.log(err);
                console.log(ps);
            });
        });
    });
    res.send('Done');
});
app.get('/fruit', (req, res) => {
    let test = null;
    models.Passage.find().sort([['_id', 1]]).exec(function(err, response){
        res.render("fruit", {fruit: response});
    });
});

var server = app.listen(3000, () => {
    console.log("Sasame Started...");
});
process.on('uncaughtException', function(err){
    console.log('uncaughtExceptionError');
    console.log(err);
    server.close();
});
process.on('SIGTERM', function(err){
    console.log('SIGTERM');
    console.log(err);
    server.close();
});
