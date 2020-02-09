'use strict';
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const helmet = require('helmet');
const PORT = process.env.PORT || 3000;
require('dotenv').config()
// Models
const User = require('./models/User');
const Chapter = require('./models/Chapter');
const Passage = require('./models/Passage');
// Controllers
const chapterController = require('./controllers/chapterController');
const passageController = require('./controllers/passageController');
// Routes
const passageRoutes = require('./routes/passage');

const DOCS_PER_PAGE = 10; // Documents per Page Limit (Pagination)

// Database Connection Setup
mongoose.connect(process.env.MONGODB_CONNECTION_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});

var app = express();
app.use(helmet());

// Setup Frontend Templating Engine - ejs
const ejs = require('ejs');
app.use(express.static('./dist'));
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// User Session Setup Logic
const session = require('express-session');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(session({
    secret: "Shh, its a secret!",
    resave: true,
    saveUninitialized: true
}));

//Call in Scripts
const scripts = require('./scripts');

// Password Protection for When Upgrading
var securedRoutes = require('express').Router();
securedRoutes.use((req, res, next) => {

  // -----------------------------------------------------------------------
  // authentication middleware

  const auth = {
        login: 'developer',
        password: 'sasame'
    } // change this

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
    res.redirect('/sasasame');
});
app.get('/login', function(req, res) {
    res.render('login', {session: req.session});
});
app.get('/register', function(req, res) {
    res.render('register', {session: req.session});
});
app.post('/login_user', function(req, res) {
    let email = req.body.email;
    let pass = req.body.password;
    User.findOne({email: email, password: pass}, function(err, user) {
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
    let user = {
       name: req.body.name,
       email: req.body.email,
       password: req.body.password,
       perfect: 100 
   };
   User.create(user, function(err, newUser) {
      if(err) return next(err);
      req.session.user = newUser.email;
      return res.send('Logged In!');
   });
});
app.get('/profile', function(req, res) {
    //scripts.renderBookPage(req, res);
    let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    let urlEnd = fullUrl.split('/')[fullUrl.split('/').length - 1];
    let chapterTitle = fullUrl.split('/')[fullUrl.split('/').length - 2];
    let golden = '';
    let addPassageAllowed = true;
    let addChapterAllowed = true;
    //home page
    if(urlEnd == '' || urlEnd.length < 15){
        //get all level 1 chapters (explicit)
        Chapter.find({author:mongoose.Types.ObjectId(req.session.user_id)})
        .sort({_id: 0})
        .exec()
        .then(function(chapters){
            Passage.find({author: mongoose.Types.ObjectId(req.session.user_id)})
            .populate('chapter')
            .sort([['_id', -1]])
            .limit(DOCS_PER_PAGE)
            .exec()
            .then(function(passages){
                res.render("sasasame", {
                    session: req.session,
                    isProfile: 'true',
                    chapter: '',
                    sasasame: 'sasasame',
                    chapterTitle: 'Sasame',
                    parentChapter: null,
                    book: passages,
                    chapters: chapters,
                    paginate: 'profile',
                    addChapterAllowed: false
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
app.get('/control', function(req, res) {
    res.render('control', {session: req.session});
});

//make app.post for pagination
//call same queries from function
//but with changing parameters in paginate
//simply return new object list for client to add into html
app.post('/paginate', function(req, res){
    let page = req.body.page;
    let ret = {};
    //what category is the user looking at?
    let chapter = req.body.chapter;
    let find = {chapter: chapter.trim()};
    if(chapter.trim() == 'Sasame'){
        find = {};
    }
    //now properly return both Passages and Chapters in this Chapter
    Passage.paginate(find, {page: page, limit: DOCS_PER_PAGE})
    .then(function(passages){
        Chapter.paginate(find, {page: page, limit: DOCS_PER_PAGE})
        .then(function(chapters){
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
    let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    let urlEnd = fullUrl.split('/')[fullUrl.split('/').length - 1];
    let chapterTitle = fullUrl.split('/')[fullUrl.split('/').length - 2];
    let golden = '';
    let addPassageAllowed = true;
    let addChapterAllowed = true;
    //home page
    if(urlEnd == '' || urlEnd.length < 15){
        Chapter.find().sort({_id: -1})
        .exec()
        .then(function(chapters){
            Passage.find({})
            .populate('chapter author')
            .sort([['_id', -1]])
            .limit(DOCS_PER_PAGE)
            .exec()
            .then(function(passages){
                res.render("sasasame", {
                    session: req.session,
                    chapter: '',
                    sasasame: 'sasasame',
                    chapterTitle: 'Sasame',
                    parentChapter: null,
                    book: passages,
                    chapters: chapters,
                    addPassageAllowed: true,
                    addChapterAllowed: false
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
    //category ID
    else{
        //find all passages in this chapter
        Passage.find({chapter: urlEnd})
        .sort({_id: -1})
        .populate('chapter author')
        .limit(DOCS_PER_PAGE)
        .exec()
        .then(function(passages){
            //get the parent chapter
            Chapter.findOne({_id:urlEnd})
            .populate('chapter')
            .limit(DOCS_PER_PAGE)
            .exec()
            .then(function(chapter){
                //find all chapters in this chapter
                Chapter.find()
                .sort({_id: -1})
                .limit(DOCS_PER_PAGE * 4)
                .exec()
                .then(function(chaps){
                    res.render("sasasame", {
                        session: req.session,
                        sasasame: 'xyz',
                        parentChapter: chapter,
                        chapter: urlEnd,
                        book: passages,
                        chapters: chaps,
                        addPassageAllowed: addPassageAllowed,
                        addChapterAllowed: addChapterAllowed
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
        })
        .then(function(err){
            if(err){
                console.log(err);
            }
        });
    }
});
app.use('/passage', passageRoutes);
app.post(/search/, (req, res) => {
    let title = req.body.title;
    Chapter.find({title: new RegExp(''+title+'', "i")})
    .select('title')
    .sort('stars')
    .exec(function(err, chapters){
        res.send(JSON.stringify(chapters));
    });

});
app.get('/feed_sasame', (req, res) => {
    let info = req.query;
    // author,
    // rank,
    // content
    Passage.findOne()
    .sort({_id: -1})
    .exec(function(err, passage) {
        if(err){
            console.log(err);
        }
        if (passage && info.content != passage.content){
            passageController.addPassage('', '', info.content, function(){
                res.redirect("/");
            });
        }
        else{
            passageController.addPassage('', '', 'LIGHT is the fire behind life.', function(){
                res.redirect("/");
            });
        }
    });
});
app.post('/search_by_key', (req, res) => {
    // let keys = req.body.keys.replace(/\s/g,'').split(',');
    let keys = req.body.keys;
    //Paginate here
    Passage.find({keys: new RegExp('^'+keys+'$', "i")})
    .populate('chapter')
    .exec(function(err, passages){
        // res.render('control', {passages: passages});
        res.send(JSON.stringify(passages));
    });
});
app.post('/make_golden_road', (req, res) => {
    let title = req.body.title;
    let passages = JSON.parse(req.body.passages);
    //Find the Category for all Golden Roads first
    Chapter.findOne({level: 1, title: 'Golden Roads'})
    .exec(function(err, chapter){
        //We need to make a new category and add all the selected passages to it
        let cat = new Chapter({
            title: title,
            chapter: chapter,
        }).save(function(err, new_chapter){
            //now get all passages by the ID list sent to use by the client
            //And then create the new passages
            //Make sure they're linked to the chapter
            passages.forEach(function(p){
                p.chapter = new_chapter;
            });
            Passage.create(passages, function(err, ps){
                if(err) console.log(err);
            });
        });
    });
    res.send('Done');
});
app.get('/fruit', (req, res) => {
    let test = null;
    Passage.find()
    .sort([['_id', 1]])
    .exec(function(err, response){
        res.render("fruit", {
            fruit: response,
            session: req.session
        });
    });
});

var server = app.listen(PORT, () => {
    console.log(`Sasame started on Port ${PORT}`);
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
