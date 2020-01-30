'use strict';
const express = require('express');
const mongoose = require('mongoose');
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
var cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(session({
    secret: "Shh, its a secret!",
    resave: true,
    saveUninitialized: true
}));
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
var LIMIT = 10; //how many documents per page for pagination
// Uncomment these lines to password protect while evolving Sasame
// securedRoutes.get('path1', /* ... */);
// app.use('/', securedRoutes);
// app.get('public', /* ... */);
app.get('/', function(req, res) {
    res.redirect('/sasasame');
});
app.get('/login', function(req, res) {
    res.render('login', {session: req.session});
});
app.get('/register', function(req, res) {
    res.render('register', {session: req.session});
});
app.post('/login_user', function(req, res) {
    var email = req.body.email;
    var pass = req.body.password;
    models.User.findOne({email: email, password: pass}, function(err, user) {
        if(err) return next(err);
        if(!user) return res.send('Not logged in!');
        req.session.user = email;
        req.session.email = email;
        req.session.name = user.name;
        req.session.user_id = user._id;
        res.redirect('/profile');
    });
});
app.get('/logout', function(req, res) {
    req.session.user = null;
    res.redirect('/login');
});
app.post('/register_user', function(req, res) {
    var user = {
       name: req.body.name,
       email: req.body.email,
       password: req.body.password,
       perfect: 100 
   };
   models.User.create(user, function(err, newUser) {
      if(err) return next(err);
      req.session.user = newUser.email;
      return res.send('Logged In!');
   });
});
app.get('/profile', function(req, res) {
    //scripts.renderBookPage(req, res);
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    var urlEnd = fullUrl.split('/')[fullUrl.split('/').length - 1];
    var chapterTitle = fullUrl.split('/')[fullUrl.split('/').length - 2];
    var golden = '';
    var addPassageAllowed = true;
    var addChapterAllowed = true;
    //home page
    if(urlEnd == '' || urlEnd.length < 15){
        //get all level 1 chapters (explicit)
        models.Chapter.find({author:mongoose.Types.ObjectId(req.session.user_id)}).sort({_id: 0}).exec()
        .then(function(chapters){
            models.Passage.find({author: mongoose.Types.ObjectId(req.session.user_id)}).populate('chapter').sort([['_id', -1]]).limit(LIMIT).exec()
            .then(function(passages){
                res.render("sasasame", {session: req.session, isProfile: 'true', chapter: '', sasasame: 'sasasame', chapterTitle: 'Sasame', parentChapter: null, 
                book: passages, chapters: chapters, paginate: 'profile', addChapterAllowed: false});
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
app.get('/control', function(req, res) {
    res.render('control', {session: req.session});
});

//make app.post for pagination
//call same queries from function
//but with changing parameters in paginate
//simply return new object list for client to add into html
app.post('/paginate', function(req, res){
    var page = req.body.page;
    var ret = {};
    //what category is the user looking at?
    var chapter = req.body.chapter;
    var find = {chapter: chapter.trim()};
    if(chapter.trim() == 'Sasame'){
        find = {};
    }
    //now properly return both Passages and Chapters in this Chapter
    models.Passage.paginate(find, {page: page, limit: LIMIT}).then(function(passages){
        models.Chapter.paginate(find, {page: page, limit: LIMIT}).then(function(chapters){
            ret.passages = passages;
            ret.chapters = chapters;
            if(ret.chapters && ret.chapters.docs[0] && ret.chapters.docs[0].chapter){
                if(typeof ret.chapters.docs[0].chapter == 'undefined' || typeof ret.chapters.docs[0].level != 'undefined'){
                    if(ret.chapters.docs[0].level == 1){
                        ret.chapters = {};
                    }
                }
            }
            res.send(JSON.stringify(ret));
        }).then(function(err){
            if(err) console.log(err);
        });
    }).then(function(err){
        if(err) console.log(err);
    });
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
        models.Chapter.find().sort({_id: -1}).exec()
        .then(function(chapters){
            models.Passage.find({}).populate('chapter').populate('author').sort([['_id', -1]]).limit(LIMIT).exec()
            .then(function(passages){
                res.render("sasasame", {session: req.session, chapter: '', sasasame: 'sasasame', chapterTitle: 'Sasame', parentChapter: null, 
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
        //find all passages in this chapter
        models.Passage.find({chapter: urlEnd}).sort({_id: -1}).populate('chapter').populate('author').limit(LIMIT)
        .exec()
        .then(function(passages){
            //get the parent chapter
            models.Chapter.findOne({_id:urlEnd}).populate('chapter').limit(LIMIT).exec()
            .then(function(chapter){
                //find all chapters in this chapter
                models.Chapter.find({chapter: urlEnd}).sort({_id: -1}).limit(LIMIT * 4).exec()
                .then(function(chaps){
                    res.render("sasasame", {session: req.session, sasasame: 'xyz', parentChapter: chapter, 
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
var addPassage = function(options) {
    if(options.chapter != '' && options.chapter != null){
        let post = new models.Passage({
            content: options.content,
            chapter: options.chapter,
            author: options.user
        }).save().then(data => {
            models.Chapter.findOne({_id:options.chapter}).exec(function(err, chap){
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
        let post = new models.Passage({
            content: options.content,
            author: options.user
        }).save();
    }
    options.callback();
};
var addChapter = function(options) {
    if(options.chap != '' && options.chap != null){
        let chapter = new models.Chapter({
            title: options.title,
            chapter: options.chap,
            author: options.user
        }).save().then(data => {
        });
    }
    else{
        // Level 1
        let chapter = new models.Chapter({
            title: options.title,
            author: options.user
        }).save(function(err,chap){
            if(err){
                console.log(err);
            }
        });
    }
    options.callback();
};
var addPassageToCategory = function(passageID, chapterID, callback) {
    models.Chapter.find({_id:chapterID}).sort([['_id', 1]]).exec(function(err, chapter){
        chapter.passages.append(passageID);
        chapter.save().then((data) => {
            callback();
        });
    });
};
app.post(/\/add_passage\/?/, (req, res) => {
    var chapterID = req.body.chapterID;
    var type = req.body.type;
    var user = req.session.user_id || null;
    var backURL=req.header('Referer') || '/';
    var content = req.body.passage || '';
    var callback = function(){
        res.redirect(backURL);
    };
    if(type == 'passage'){
        addPassage({
            'chapter': chapterID,
            'content': content,
            'author': user,
            'callback': callback
        });
    }
    else if(type == 'chapter' && content != ''){
        addChapter({
            'title': content,
            'author': user,
            'callback': callback
        });
    }
});
app.post(/\/delete_passage\/?/, (req, res) => {
    var passageID = req.body._id;
    models.Passage.deleteOne({_id: passageID.trim()}, function(err){
        if(err){
            console.log(err);
        }
        res.send('Deleted.');
    });
});
app.post(/\/delete_category\/?/, (req, res) => {
    var chapterID = req.body._id;
    //delete chapter
    //in the future consider also deleting all passages within this chapter
    models.Chapter.deleteOne({_id: chapterID.trim()}, function(err){
        if(err){
            console.log(err);
        }
        res.send('Deleted.');
    });
});
app.post(/\/update_passage\/?/, (req, res) => {
    var passageID = req.body._id;
    var content = req.body.content;
    //remove white space and separate by comma
    // var keys = req.body.keys.replace(/\s/g,'').split(',');
    var keys = req.body.keys;
    models.Passage.updateOne({_id: passageID.trim()}, {
        keys: keys,
        content: content
    }, function(err, affected, resp){
        if(err){
            console.log(err);
        }
        res.send(resp);
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
    // var keys = req.body.keys.replace(/\s/g,'').split(',');
    var keys = req.body.keys;
    //Paginate here
    models.Passage.find({keys: new RegExp('^'+keys+'$', "i")}).populate('chapter').exec(function(err, passages){
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
            });
        });
    });
    res.send('Done');
});
app.get('/fruit', (req, res) => {
    let test = null;
    models.Passage.find().sort([['_id', 1]]).exec(function(err, response){
        res.render("fruit", {fruit: response, session: req.session});
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
