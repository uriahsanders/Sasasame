'use strict';
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const helmet = require('helmet');
const PORT = process.env.PORT || 3000;
require('dotenv').config();
// Models
const User = require('./models/User');
const Chapter = require('./models/Chapter');
const Passage = require('./models/Passage');
// Controllers
const chapterController = require('./controllers/chapterController');
const passageController = require('./controllers/passageController');
// Routes
const passageRoutes = require('./routes/passage');

var fs = require('fs'); 
var path = require('path');
const { exec } = require('child_process');

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
app.get('/ionicons.esm.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/ionicons/dist/ionicons/ionicons.esm.js');
});
app.get('/ionicons.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/ionicons/dist/ionicons/ionicons.js');
});
app.get('/p-af480238.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/ionicons/dist/ionicons/p-af480238.js');
});
app.get('/p-vsz5ekad.entry.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/ionicons/dist/ionicons/p-vsz5ekad.entry.js');
});
app.get('/p-763ce0c6.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/ionicons/dist/ionicons/p-763ce0c6.js');
});
app.get('/marked.min.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/marked/marked.min.js');
});
app.get('/highlight.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/highlight.js/lib/highlight.js');
});
app.get('/highlight/javascript.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/highlight.js/lib/languages/javascript.js');
});
app.get('/highlight/default.css', function(req, res) {
    res.sendFile(__dirname + '/node_modules/highlight.js/styles/tomorrow.css');
});
// Uncomment these lines to password protect while evolving Sasame
// securedRoutes.get('path1', /* ... */);
// app.use('/', securedRoutes);
// app.get('public', /* ... */);
app.get('/', function(req, res) {
    res.redirect('/sasasame');
});
app.post('/login/', function(req, res) {
    let name = req.body.name;
    User.findOne({name: name}, function(err, user) {
        //Register
        if(!user){
           var obj = new User();
           obj.name = name;
           obj.save(function(err2, newUser) {
              req.session.user = newUser;
              req.session.name = newUser.name;
              req.session.user_id = newUser._id;
              res.send('/user/' + newUser._id);
           });
        }
        //Login
        else{
            req.session.user = user;
            req.session.name = user.name;
            req.session.user_id = user._id;
            res.send('/user/' + user._id);
        }
    });
});
app.get('/logout', function(req, res) {
    req.session.user = null;
    res.redirect('/');
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
                    parentChapter: {title: profile_user.name},
                    printPassage: scripts.printPassage,
                    printChapter: scripts.printChapter
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
app.post('/fileStream', function(req, res) {
    var result = '';
    var dir = __dirname + '/';
    fs.readdir(dir, (err, files) => {
      var ret = '';
      var stat2;
      files.forEach(function(file){
        stat2 = fs.lstatSync(dir + '/' +file);
        if(stat2.isDirectory()){
            file += '/';
        }
        ret += scripts.printDir(file);
      });
      res.send({
        dirs: ret,
        type: 'dir',
        path: dir
      });
    });
});
app.post('/file', function(req, res) {
    var file = req.body.fileName;
    if(req.body.dir[req.body.dir.length - 1] == '/'){
        var dir = req.body.dir + file;
    }
    else{
        var dir = req.body.dir + '/' + file;
    }
    var stat = fs.lstatSync(dir);
    if(stat.isFile()){
        fs.readFile(dir, {encoding: 'utf-8'}, function(err,data){
                if (!err) {
                    res.send({
                        data: scripts.printFile(data, __dirname + '/' +file),
                        type: 'file'
                    });
                } else {
                    console.log(err);
                }
        });
    }
    else if (stat.isDirectory()){
        fs.readdir(dir, (err, files) => {
          var ret = '';
          var stat2;
          files.forEach(function(file){
            stat2 = fs.lstatSync(dir + '/' +file);
            if(stat2.isDirectory()){
                file += '/';
            }
            ret += scripts.printDir(file);
          });
          res.send({
            data: ret,
            type: 'dir',
            dir: dir
          });
        });
    }
});
app.post('/run_file', function(req, res) {
    var file = req.body.file;
    var ext = file.split('.')[file.split('.').length - 1];
    var bash = 'ls';
    switch(ext){
        case 'js':
        bash = 'node ' + file;
        break;
        case 'sh':
        bash = 'sh ' + file;
        break;
    }
    exec(bash, (err, stdout, stderr) => {
      if (err) {
        // node couldn't execute the command
        res.send(JSON.stringify(err));
        return;
      }
      res.send(stdout);
      // the *entire* stdout and stderr (buffered)
      // console.log(`stdout: ${stdout}`);
      // console.log(`stderr: ${stderr}`);
    });
});
app.post('/update_file', function(req, res) {
    var file = req.body.file;
    var content = req.body.content;
    fs.writeFile(file, content, function(err){
      if (err) return console.log(err);
      res.send('Done');
    });
});
app.get('/ppe', function(req, res) {
    res.render('ppe', {session: req.session});
});

//simply return new object list for client to add into html
app.post('/paginate', function(req, res){
    let page = req.body.page;
    let which = req.body.which; //chap or passage
    let search = req.body.search;
    //what category is the user looking at?
    let chapter = req.body.chapter;
    let find = {chapter: chapter.trim()};
    if(chapter.trim() == 'Sasame'){
        find = {};
    }
    if(search == ''){
        var chapterFind = find;
    }
    else{
        var chapterFind = {
            title: new RegExp(''+search+'', "i")
        };
    }
    if(which == 'passage_load'){
        Passage.paginate(find, {page: page, limit: DOCS_PER_PAGE, sort: [['_id', -1]]})
        .then(function(passages){
            res.send(JSON.stringify(passages));
        }).then(function(err){
            if(err) console.log(err);
        });
    }
    else if(which == 'chapter_load'){
        Chapter.paginate(chapterFind, {page: page, limit: DOCS_PER_PAGE, sort: 'stars', select: 'title'})
        .then(function(chapters){
            res.send(JSON.stringify(chapters));
        }).then(function(err){
            if(err) console.log(err);
        });
    }
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
                    scripts: scripts
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
            .select('title')
            .limit(DOCS_PER_PAGE)
            .exec()
            .then(function(chapter){
                //find all chapters
                Chapter.find()
                .select('title')
                .sort('stars')
                .limit(DOCS_PER_PAGE)
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
                        addChapterAllowed: addChapterAllowed,
                        scripts: scripts
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
    var property_key = req.body['property_key[]'] || req.body.property_key;
    var property_value = req.body['property_value[]'] || req.body.property_value;
    //build metadata from separate arrays
    var metadata = {};
    var i = 0;
    if(Array.isArray(property_key)){
        property_key.forEach(function(key){
            metadata[key] = property_value[i++];
        });
    }
    else{
        metadata[property_key] = property_value;
    }
    var passageCallback = function(data){
        res.send(scripts.printPassage(data));
    };
    var chapterCallback = function(data){
        res.send(scripts.printChapter(data));
    };
    if(type == 'passage'){
        passageController.addPassage({
            'chapter': chapterID,
            'content': content,
            'author': user,
            'metadata': JSON.stringify(metadata),
            'callback': passageCallback,
        });
    }
    else if(type == 'chapter' && content != ''){
        chapterController.addChapter({
            'title': content,
            'author': user,
            'callback': chapterCallback
        });
    }
});
app.post(/\/delete_passage\/?/, (req, res) => {
    var backURL=req.header('Referer') || '/';
    passageController.deletePassage(req, res, function(){
        res.send(backURL);
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
                html += scripts.printChapter(f);
            });
        }
        res.send(html);
    });
});
app.post(/star/, (req, res) => {
    var _id = req.body._id.trim();
    Passage.findOneAndUpdate({_id: _id}, {
        $push: {
            stars: req.session.user
        }
    }, function(err, documents){
        res.send(documents);
    })

});
app.post(/\/update_passage\/?/, (req, res) => {
    passageController.updatePassage(req, res, function(){
        var backURL=req.header('Referer') || '/';
        res.redirect(backURL);
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
