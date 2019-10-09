// This file is the 'Controller'
'use strict';
const express = require('express');
const ejs = require('ejs');

var app = express();
app.use(express.static('./dist'));
app.set('view engine', 'ejs');
app.set('views', './views');
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var session = require('express-session');

var models = require('./models');
// Security
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
//
///////////////////////////////////////////////////////////
// Create Perfect Numbers
// var users_to_add = [];
// User.create(users_to_add, function(err, user){
//     if (err) console.log(err);
// });
// User.findOne({perfect: 10}, function(err, user){
//     console.log(user.perfect);
// });
// // save user to database
// testUser.save(function(err) {
//     if (err) throw err;
// });
///////////////////////////////////////////////////////////

// // fetch user and test password verification
// User.findOne({ username: 'jmar777' }, function(err, user) {
//     if (err) throw err;

//     // test a matching password
//     user.comparePassword('Password123', function(err, isMatch) {
//         if (err) throw err;
//         console.log('Password123:', isMatch); // -&gt; Password123: true
//     });

//     // test a failing password
//     user.comparePassword('123Password', function(err, isMatch) {
//         if (err) throw err;
//         console.log('123Password:', isMatch); // -&gt; 123Password: false
//     });
// });
///////////////////////////////////////////////////////////

app.get('/', function(req, res) {
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
    // Passage.find({}, (err, passages) => {
    //     if(!err) {
    //         res.render('index', { fruit: passages });
    //     }
    // });
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
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    var urlEnd = fullUrl.split('/')[fullUrl.split('/').length - 1];
    var golden = '';
    var addPassageAllowed = true;
    var addChapterAllowed = true;
    //home page
    if(urlEnd == '' || urlEnd.length < 15){
        models.Chapter.find({level:1}).sort({_id: 0}).exec(function(err, chapters){
            models.Passage.find().sort([['_id', -1]]).exec(function(err, passages){
                res.render("sasasame", {sasasame: 'sasasame', chapter: '', book: passages, chapters: chapters, addPassageAllowed: true, addChapterAllowed: false});
            });
        });
    }
    //category ID
    else{
        //find all passages in this category
        models.Passage.find({chapter: urlEnd}).populate('chapter').exec(function(err, passages){
            models.Chapter.find({_id:urlEnd, level: 1}).exec(function(err, chapter){
                switch(category.title){
                    case 'Foreword':
                        addPassageAllowed = false;
                        addChapterAllowed = false;
                        break;
                    case 'Infinity Forum':
                        addPassageAllowed = true;
                        addChapterAllowed = true;
                        break;
                    case 'RULES':
                        addPassageAllowed = false;
                        addChapterAllowed = false;
                        break;
                    case 'Keys':
                        addPassageAllowed = true;
                        addChapterAllowed = false;
                        break;
                    case 'Golden Roads':
                        addPassageAllowed = false;
                        addChapterAllowed = false;
                        break;
                    case 'Death by Bubbles':
                        addPassageAllowed = true;
                        addChapterAllowed = true;
                        break;
                    case 'Development':
                        addPassageAllowed = true;
                        addChapterAllowed = true;
                        break;
                    case 'Afterword':
                        addPassageAllowed = true;
                        addChapterAllowed = false;
                        break;
                    default:
                        addPassageAllowed = true;
                        addChapterAllowed = true;
                }
                //find all categories in this category
                models.Chapter.find({chapter: urlEnd}).exec(function(err, chaps){
                    res.render("sasasame", {sasasame: 'xyz', chapter: urlEnd, book: passages, chapter: chaps, addPassageAllowed: addPassageAllowed, addChapterAllowed: addChapterAllowed});
                });
            });
        });
        // Category.findOne({_id:url_end}).exec(function(err, category){
        //     console.log(category.passages);
        //     if(!category.passages){
        //         category.passages = '';
        //     }
        //     if(!category.categories){
        //         category.categories = '';
        //     }
        //     res.render("sasasame", {category: url_end, book: category.passages, categories: category.categories});
        // });
    }
});
var addPassage = function(chapter, keys, content, callback) {
    keys = keys || '';
    if(chapter != ''){
        let post = new models.Passage({
            content: content,
            chapter: chapter,
            keys: keys
        }).save().then(data => {
            if(chapter != ''){
                models.Chapter.findOne({_id:chapter}).exec(function(err, chap){
                    if(chap.passages){
                        chap.passages.push(data);
                    }
                    else{
                        chap.passages = [data];
                    }
                    chap.save();
                });
            }
        });
    }
    else{
        let post = new models.Passage({
            content: content,
            keys: keys
        }).save();
    }
    callback();
};
var addChapter = function(chap, title, callback) {
    if(chap != ''){
        let chapter = new models.Chapter({
            title: title,
            chapter: chap
        }).save().then(data => {
            if(chap != ''){
                models.Chapter.findOne({_id:chap}).exec(function(err, chap){
                    if(chap.chapters){
                        chap.chapters.push(data);
                    }
                    else{
                        chap.chapters = [data];
                    }
                    chap.save();
                });
            }
        });
    }
    else{
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
    models.Passage.find({keys:keys}).populate('chapter').exec(function(err, passages){
        res.render('control', {passages: passages});
    });
});
app.post('/make_golden_road', (req, res) => {
    var keys = req.body.keys.replace(/\s/g,'').split(',');
    var newChapterTitle = req.body.newChapterTitle;
    //passage IDs are in a hidden form, comma separated
    var passages = req.body.passages.split(',');
    //as are the keys
    var keys = req.body.keys.split(',');
    //Find the Category for all Golden Roads first
    models.Chapter.findOne({level: 1, title: 'Golden Roads'}).exec(function(err, chapter){
        //We need to make a new category and add all the selected passages to it
        var cat = new models.Chapter({
            title: 'Golden Road',
            chapter: chapter,
        }).save(function(err, new_chapter){
            //now get all passages by the ID list sent to use by the client
            //And then create the new passages
            models.Passage.create(listOfPassages);
        });
    });

    models.Passage.find({keys:keys}).populate('chapter').exec(function(err, passages){
        res.render('control', {passages: passages});
    });
});
app.get('/fruit', (req, res) => {
    let test = null;
    models.Passage.find().sort([['_id', 1]]).exec(function(err, response){
        res.render("fruit", {fruit: response});
    });
});

app.listen(3000, () => {
    console.log("Sasame Started...");
});
