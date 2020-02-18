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
const scripts = require('./shared');
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
app.get('/jquery.min.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/jquery/dist/jquery.min.js');
});
app.get('/jquery-ui.min.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/jquery-ui-dist/jquery-ui.min.js');
});
app.get('/jquery.modal.min.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/jquery-modal/jquery.modal.min.js');
});
app.get('/jquery.modal.min.css', function(req, res) {
    res.sendFile(__dirname + '/node_modules/jquery-modal/jquery.modal.min.css');
});
app.get('/shared.js', function(req, res) {
    res.sendFile(__dirname + '/shared.js');
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
        res.redirect('/user/' + user._id);
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
app.get(/\/user\/?(:user_id)?/, function(req, res) {
    //scripts.renderBookPage(req, res);
    let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    let urlEnd = fullUrl.split('/')[fullUrl.split('/').length - 1];
    let user_id = fullUrl.split('/')[fullUrl.split('/').length - 1];
    let golden = '';
    let addPassageAllowed = true;
    let addChapterAllowed = true;
    //home page
    //get all level 1 chapters (explicit)
    User.findOne({_id: user_id.trim()})
    .exec()
    .then(function(profile_user){
        Chapter.find({author:mongoose.Types.ObjectId(user_id)})
        .exec()
        .then(function(chapters){
            Passage.find({author: mongoose.Types.ObjectId(user_id)})
            .populate('author')
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
                    addChapterAllowed: false,
                    parentChapter: {title: profile_user.name}
                });
            })
            .then(function(err){
                if(err){
                    console.log(err);
                }
            });
        });
    });
});
app.get('/control', function(req, res) {
    res.render('control', {session: req.session});
});
app.get('/ppe', function(req, res) {
    res.render('ppe', {session: req.session});
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
    Passage.paginate(find, {page: page, limit: DOCS_PER_PAGE, sort: [['_id', -1]]})
    .then(function(passages){
        Chapter.paginate(find, {page: page, limit: DOCS_PER_PAGE, sort: 'stars'})
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
        Chapter.find()
        .sort('stars')
        .limit(DOCS_PER_PAGE)
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
                    addChapterAllowed: false,
                    printPassage: scripts.printPassage,
                    printChapter: scripts.printChapter
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
            //(NEEDS TO BE REWORKED, CHAPTERS NO LONGER HAVE SUBCHAPTERS)
            Chapter.findOne({_id:urlEnd})
            .limit(DOCS_PER_PAGE)
            .exec()
            .then(function(chapter){
                //find all chapters
                Chapter.find()
                .select('title')
                .sort('stars')
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

app.post(/\/add_passage\/?/, (req, res) => {
    var chapterID = req.body.chapterID;
    var type = req.body.type;
    var user = req.session.user_id || null;
    var backURL=req.header('Referer') || '/';
    var content = req.body.passage || '';
    var callback = function(){
        console.log(user);
        res.redirect(backURL);
    };
    if(type == 'passage'){
        passageController.addPassage({
            'chapter': chapterID,
            'content': content,
            'author': user,
            'callback': callback
        });
    }
    else if(type == 'chapter' && content != ''){
        chapterController.addChapter({
            'title': content,
            'author': user,
            'callback': callback
        });
    }
});
app.post(/\/delete_passage\/?/, (req, res) => {
    var passageID = req.body._id;
    Passage.deleteOne({_id: passageID.trim()}, function(err){
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
    Chapter.deleteOne({_id: chapterID.trim()}, function(err){
        if(err){
            console.log(err);
        }
        res.send('Deleted.');
    });
});

app.use('/passage', passageRoutes);
app.post(/search/, (req, res) => {
    let title = req.body.title;
    Chapter.find({title: new RegExp(''+title+'', "i")})
    .select('title')
    .sort('stars')
    .limit(DOCS_PER_PAGE)
    .exec(function(err, chapters){
        let html = '';
        if(chapters){
            chapters.forEach(function(f){
                html += `
                <div class="category">
                    <!-- For Future
                    <div class="chapter_flag">
                        <ion-icon title="Content Warning" name="flag"></ion-icon>
                    </div>
                     -->
                    <div>
                        <a class="link" href="/sasasame/`+f.title+`/`+f._id+`">`
                        +f.title+`</a>
                    </div>
                    <div class="category_id">`+f._id+`</div>
                </div>`;
            });
        }
        res.send(html);
    });
});
app.post(/star/, (req, res) => {
    var _id = req.body._id.trim();
    Passage.findOneAndUpdate({_id: _id}, {
        $inc: {
            stars: 1
        }
    }, function(err, documents){
        res.send(documents);
    })

});
app.post(/\/update_passage\/?/, (req, res) => {
    var passageID = req.body._id;
    var content = req.body.content;
    //remove white space and separate by comma
    // var keys = req.body.keys.replace(/\s/g,'').split(',');
    var keys = req.body.keys;
    Passage.updateOne({_id: passageID.trim()}, {
        keys: keys,
        content: content
    }, function(err, affected, resp){
        if(err){
            console.log(err);
        }
        res.send(resp);
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
