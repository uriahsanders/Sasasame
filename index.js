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
    var url_end = fullUrl.split('/')[fullUrl.split('/').length - 1];
    var golden = '';
    var addPassageAllowed = true;
    var addChapterAllowed = true;
    //home page
    if(url_end == '' || url_end.length < 15){
        models.Category.find({level:1}).sort({_id: 0}).exec(function(err, categories){
            models.Passage.find().sort([['_id', -1]]).exec(function(err, passages){
                res.render("sasasame", {sasasame: 'sasasame', category: '', book: passages, categories: categories, addPassageAllowed: true, addChapterAllowed: false});
            });
        });
    }
    //category ID
    else{
        //find all passages in this category
        models.Passage.find({category: url_end}).populate('category').exec(function(err, passages){
            models.Category.find({_id:url_end, level: 1}).exec(function(err, category){
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
                models.Category.find({category: url_end}).exec(function(err, cats){
                    res.render("sasasame", {sasasame: 'xyz', category: url_end, book: passages, categories: cats, addPassageAllowed: addPassageAllowed, addChapterAllowed: addChapterAllowed});
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
var add_passage = function(category, keys, content, callback) {
    keys = keys || '';
    if(category != ''){
        let post = new models.Passage({
            content: content,
            category: category,
            keys: keys
        }).save().then(data => {
            if(category != ''){
                models.Category.findOne({_id:category}).exec(function(err, cat){
                    if(cat.passages){
                        cat.passages.push(data);
                    }
                    else{
                        cat.passages = [data];
                    }
                    cat.save();
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
var add_category = function(cat, title, callback) {
    if(cat != ''){
        let category = new models.Category({
            title: title,
            category: cat
        }).save().then(data => {
            if(cat != ''){
                models.Category.findOne({_id:cat}).exec(function(err, cat){
                    if(cat.categories){
                        cat.categories.push(data);
                    }
                    else{
                        cat.categories = [data];
                    }
                    cat.save();
                });
            }
        });
    }
    else{
        let category = new models.Category({
            title: title,
        }).save(function(err,cat){
            if(err){
                console.log(err);
            }
        });
    }
    callback();
};
var add_passage_to_category = function(passageID, categoryID, callback) {
    models.Category.find({_id:categoryID}).sort([['_id', 1]]).exec(function(err, category){
        category.passages.append(passageID);
        category.save().then((data) => {
            callback();
        });
    });
};
var get_density_of_category = function(category){
    return category.passages.length;
};

app.get(/\/add_category\/?(:categoryID)?/, (req, res) => {
    let info = req.query;
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    var url_end = fullUrl.split('/')[fullUrl.split('/').length - 1];
    var categoryID = url_end.split('?')[0] || '';
    var backURL=req.header('Referer') || '/';
    if(info.title != ''){
        add_category(categoryID, info.title, function(){
            res.redirect(backURL);
        });
    }
    else{
        add_category(categoryID, 'Moist SOIL', function(){
            res.redirect(backURL);
        });
    }
});
app.post(/\/add_passage\/?/, (req, res) => {
    var categoryID = req.body.categoryID;
    var backURL=req.header('Referer') || '/';
    //remove white space and separate by comma
    var keys = req.body.keys.replace(/\s/g,'').split(',');
    if(req.body.passage != ''){
        add_passage(categoryID, keys, req.body.passage, function(){
            res.redirect(backURL);
        });
    }
    else{
        add_passage(categoryID, '', 'WATER nourishes even fire.', function(){
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
            add_passage('', '', info.content, function(){
                res.redirect("/");
            });
        }
        else{
            add_passage('', '', 'LIGHT is the fire behind life.', function(){
                res.redirect("/");
            });
        }
    });
});
app.post('/search_by_key', (req, res) => {
    var keys = req.body.keys.replace(/\s/g,'').split(',');
    models.Passage.find({keys:keys}).populate('category').exec(function(err, passages){
        res.render('control', {passages: passages});
    });
});
app.post('/make_golden_road', (req, res) => {
    var keys = req.body.keys.replace(/\s/g,'').split(',');
    var new_chapter_title = req.body.new_chapter_title;

    add_category();
    models.Passage.find({keys:keys}).populate('category').exec(function(err, passages){
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
