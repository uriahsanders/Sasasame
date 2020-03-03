'use strict';
const express = require('express');
const bcrypt = require('bcrypt');
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
const { promisify } = require('util');
const { v4 } = require('uuid');

const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);

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

// make sure recordings folder exists
const recordingFolder = './dist/recordings/';
if (!fs.existsSync(recordingFolder)) {
  fs.mkdirSync(recordingFolder);
}


// Setup Frontend Templating Engine - ejs
const ejs = require('ejs');
app.use(express.static('./dist'));
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

// User Session Setup Logic
const session = require('express-session');
const cookieParser = require('cookie-parser');
var MongoStore  = require('connect-mongo');
app.use(cookieParser());
app.use(session({
    secret: "Sasame; just a cute little seed with a Really Big HEART!",
    resave: true,
    saveUninitialized: true,
    // store: new MongoStore({
    //     url: process.env.MONGODB_CONNECTION_URL
    // })
}));
app.use(function(req, res, next) {
  res.locals.user = req.session.user;
  next();
});

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


//recordings
app.get('/recordings', (req, res) => {
  readdir(recordingFolder)
    .then(messageFilenames => {
      res.status(200).json({ messageFilenames });
    })
    .catch(err => {
      console.log('Error reading message directory', err);
      res.sendStatus(500);
    });
});

app.post('/recordings', (req, res) => {
  if (!req.body.recording) {
    return res.status(400).json({ error: 'No req.body.message' });
  }
  const messageId = v4();
  writeFile(recordingFolder + messageId, req.body.recording, 'base64')
    .then(() => {
        res.send(messageId);
    })
    .catch(err => {
      console.log('Error writing message to file', err);
      res.sendStatus(500);
    });
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

function requiresLogin(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    var err = new Error('You must be logged in to view this page.');
    err.status = 401;
    return next(err);
  }
}

app.get('/verify/:permalink/:token', function (req, res) {
    var permalink = req.params.permalink;
    var token = req.params.token;

    User.findOne({'permalink': permalink}, function (err, user) {
        if (user.verify_token == token) {
            console.log('that token is correct! Verify the user');

            User.findOneAndUpdate({'permalink': permalink}, {'verified': true}, function (err, resp) {
                console.log('The user has been verified!');
            });

            res.redirect('/login');
        } else {
            console.log('The token is wrong! Reject the user. token should be: ' + user.verify_token);
        }
    });
});
//authenticate input against database
var authenticateUser = function (email, password, callback) {
  User.findOne({ email: email })
    .exec(function (err, user) {
      if (err) {
        return callback(err)
      } else if (!user) {
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          return callback(err, user);
        } else {
          return callback(err);
        }
      })
    });
}
app.post('/login/', function(req, res) {
    //check if email has been verified
    authenticateUser(req.body.email, req.body.password, function(err, user){
        if(err){
            console.log(err);
        }
        req.session.user = user;
        return res.redirect('/user/' + user._id);
    });
});
app.post('/register/', function(req, res) {
    if (req.body.email &&
      req.body.username &&
      req.body.password &&
      req.body.passwordConf) {  
        var userData = {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
      }  //use schema.create to insert data into the db
      User.create(userData, function (err, user) {
        req.session.user = user;
        //send verification email
        if (err) {
          console.log(err);
        } else {
          res.redirect('/user/' + user._id);
        }
      });
    }
});
app.get('/logout', function(req, res) {
    if (req.session) {
        // delete session object
        req.session.destroy(function(err) {
          if(err) {
            return next(err);
          } else {
          }
        });
      }
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
                res.render("index", {
                    session: req.session.user,
                    profile: profile_user,
                    isProfile: 'true',
                    chapter: '',
                    chapterTitle: 'Sasame',
                    parentChapter: null,
                    book: passages,
                    chapters: chapters,
                    paginate: 'profile',
                    addChapterAllowed: false,
                    scripts: scripts
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
app.post('/ppe', function(req, res) {
    Passage.find({canvas: true})
    .select('metadata')
    .select('content')
    .limit(20)
    .exec()
    .then(function(passages){
        var ret = '';
        passages.forEach(passage => {
            ret += scripts.printCanvas(passage);
        });
        res.send(ret);
    });
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
        var chapterFind = {};
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
    else if(which == 'chapter_load' || which == 'chapter_load_mobile'){
        Chapter.paginate(chapterFind, {page: page, limit: DOCS_PER_PAGE, sort: 'stars', select: 'title'})
        .then(function(chapters){
            res.send(JSON.stringify(chapters));
        }).then(function(err){
            if(err) console.log(err);
        });
    }
});
app.get(/\/?(:category\/:category_ID)?/, function(req, res) {
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
        .sort([['stars', -1]])
        .limit(DOCS_PER_PAGE)
        .exec()
        .then(function(chapters){
            Passage.find({
                parent: undefined
            })
            .populate('chapter author')
            .sort([['_id', -1]])
            .limit(DOCS_PER_PAGE)
            .exec()
            .then(function(passages){
                res.render("index", {
                    session: req.session,
                    chapter: '',
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
        Chapter.findOne({_id:urlEnd})
        .populate({
            path: 'passages',
            model: 'Passage',
            populate: {
                path: 'author',
                model: 'User',
            },
            
        })
        .exec()
        .then(function(chapter){
            Chapter.find()
            .select('title')
            .sort([['stars', -1]])
            .limit(DOCS_PER_PAGE)
            .exec()
            .then(function(chaps){
                res.render("index", {
                    session: req.session,
                    parentChapter: chapter,
                    chapter: urlEnd,
                    book: chapter.passages,
                    chapters: chaps,
                    addPassageAllowed: addPassageAllowed,
                    addChapterAllowed: addChapterAllowed,
                    scripts: scripts
                });
            })
        })
        .then(function(err){
            if(err){
                console.log(err);
            }
        });
    }
});
function generateMetadata(property_keys, property_values){
    var metadata = {};
    var canvas = false;
    var i = 0;
    if(Array.isArray(property_keys) && Array.isArray(property_values)){
        property_keys.forEach(function(key){
            if(key == 'Canvas'){
                canvas = true;
            }
            if(key == 'Label'){
                label = property_values[i];
            }
            metadata[key] = property_values[i++];
        });
    }
    else if(Array.isArray(property_keys)){
        property_keys.forEach(function(key){
            if(key == 'Canvas'){
                canvas = true;
            }
            if(key == 'Label'){
                label = '';
            }
            metadata[key] = '';
        });
    }
    else{
        if(property_keys == 'Canvas'){
            canvas = true;
        }
        if(property_keys == 'Label'){
            label = property_values;
        }
        metadata[property_keys] = property_values;
    }
    return {
        canvas: canvas,
        json: metadata
    };
}
app.post(/\/create_queue_chapter\/?/, (req, res) => {
    var user = req.session.user_id || null;
    var passages = JSON.parse(req.body.passages);
    chapterController.addChapter({
        'title': req.body.title,
        'author': user,
        'callback': function(chapter){
            for(var key in passages){
                var parentPassage = passages[key].parentPassage || '';
                //build metadata from separate arrays
                var json = passages[key].metadata;
                var canvas = json.canvas || false;
                passageController.addPassage({
                    'chapter': chapter._id,
                    'content': passages[key].content,
                    'author': user,
                    // 'sourceAuthor': passage.user,
                    // 'sourceChapter': passages[key].chapter,
                    'canvas': canvas,
                    'metadata': JSON.stringify(json),
                    'callback': function(psg){
                        // console.log(psg);
                    },
                    'parentPassage': parentPassage
                });
            }
            res.send(scripts.printChapter(chapter));
        }
    });
});
app.post(/\/add_passage\/?/, (req, res) => {
    var chapterID = req.body.chapterID;
    var type = req.body.type;
    var user = req.session.user || null;
    var content = req.body.passage || '';
    var parentPassage = req.body.parentPassage || '';
    var property_key = req.body['property_key[]'] || req.body.property_key;
    var property_value = req.body['property_value[]'] || req.body.property_value;
    //build metadata from separate arrays
    var metadata = generateMetadata(property_key, property_value);
    var json = metadata.json;
    var canvas = metadata.canvas;
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
            'canvas': canvas,
            'metadata': JSON.stringify(json),
            'callback': passageCallback,
            'parentPassage': parentPassage
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
app.post('/flag_passage', (req, res) => {
    var _id = req.body._id.trim();
    Passage.findOne({_id: _id}, function(err, passage){
        passage.flagged = !passage.flagged;
        passage.save();
    });
});
app.post('/flag_chapter', (req, res) => {
    var _id = req.body._id.trim();
    Chapter.findOne({_id: _id}, function(err, chapter){
        chapter.flagged = !chapter.flagged;
        chapter.save();
    });
});
app.post('/star/', (req, res) => {
    var _id = req.body._id.trim();
    Passage.findOne({_id: _id})
    .populate('chapter author')
    .exec(function(err, passage){
        passage.stars += 1;
        passage.chapter.stars += 1;
        passage.author.stars += 1;
        passage.save();
        passage.chapter.save();
        passage.author.save();
        res.send('Done');
    });
});
app.post('/star_chapter/', (req, res) => {
    var _id = req.body._id.trim();
    Chapter.findOne({_id: _id})
    .populate('author')
    .exec(function(err, chapter){
        chapter.stars += 1;
        chapter.author.stars += 1;
        chapter.save();
        chapter.author.save();
        res.send('Done');
    });
});
app.post('/add_sub_passage/', (req, res) => {
    passageController.addSubPassage(req, res, function(){
        var backURL=req.header('Referer') || '/';
        res.redirect(backURL);
    });
});
app.post('/update_passage/', (req, res) => {
    passageController.updatePassage(req, res, function(){
        var backURL=req.header('Referer') || '/';
        res.redirect(backURL);
    });
});
app.post('/update_chapter/', (req, res) => {
    chapterController.updateChapter(req, res, function(){
        res.send('Updated');
    });
});
app.post('/update_chapter_order/', (req, res) => {
    chapterController.updateChapterOrder(req, res, function(){
        res.send('Updated');
    });
});
app.post('/update_passage_content', (req, res) => {
    passageController.updatePassageContent(req, res, function(){
        res.send('Updated');
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
