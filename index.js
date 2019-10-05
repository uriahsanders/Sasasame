'use strict';
const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');

var app = express();
app.use(express.static('./dist'));
app.set('view engine', 'ejs');
app.set('views', './views');
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var session = require('express-session');

const options = {
    useNewUrlParser: true
};
mongoose.connect('mongodb://localhost/sasame', { useNewUrlParser: true }, function(err){
    if (err) {
        return console.error(err);
    }
    setTimeout( () => {
        mongoose.connect('mongodb://localhost/sasame', options);
    }, 5000);
});
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var categorySchema = mongoose.Schema({
    author: Number,
    title: String, //name of the category
    //passages that belong to this category
    passages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Passage'
    }], //array of passage IDs
    //categories that belong to this category
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    //category the category belongs to
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    golden: Boolean,
    votes: Number
});
var passageSchema = mongoose.Schema({
    author: Number,
    rank: Number, //rank is the average of the array
    content: String,
    keys: [String],
    //category the passage belongs to
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    golden: String,
    votes: Number
});
// Perfect 100 Scheme
// Uriah is 7
// GRA members are 66
// Chromia is 9 (same privileges as 7 plus Leader in the Rules)
// Akira is 99
// Default is 100
// Deszha and Key have no Number (0, not in the 100) (same privileges as 7)
// 1 (same privileges as 7)
// Relax, Wabi, Jeremy, Mohamed, Arty are 10
var userSchema = mongoose.Schema({
    perfect: Number,
    password: { type: String, required: true, index: {unique:true} },
});
userSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};
var Passage = mongoose.model('Post', passageSchema, 'Posts');
var Category = mongoose.model('Category', categorySchema, 'Categories');
var User = mongoose.model('User', userSchema, 'Users');
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
    Passage.count({}, function( err, count){
        console.log(count);
        Passage.findOne().sort({_id: -1}).exec(function(err, passage) {
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
    //home page
    if(url_end == '' || url_end.length < 15){
        Category.find().sort({_id: 1}).exec(function(err, categories){
            Passage.find().sort([['_id', -1]]).exec(function(err, passages){
                res.render("sasasame", {sasasame: 'sasasame', category: '', book: passages, categories: categories});
            });
        });
    }
    //category ID
    else{
        //find all passages in this category
        Passage.find({category: url_end}).exec(function(err, passages){
            //find all categories in this category
            Category.find({category: url_end}).exec(function(err, cats){
                res.render("sasasame", {sasasame: 'xyz', category: url_end, book: passages, categories: cats});
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
        let post = new Passage({
            content: content,
            category: category,
            keys: keys
        }).save().then(data => {
            if(category != ''){
                Category.findOne({_id:category}).exec(function(err, cat){
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
        let post = new Passage({
            content: content,
            keys: keys
        }).save();
    }
    callback();
};
var add_category = function(cat, title, callback) {
    if(cat != ''){
        let category = new Category({
            title: title,
            category: cat
        }).save().then(data => {
            if(cat != ''){
                Category.findOne({_id:cat}).exec(function(err, cat){
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
        let category = new Category({
            title: title,
        }).save();
    }
    callback();
};
var add_passage_to_category = function(passageID, categoryID, callback) {
    Category.find({_id:categoryID}).sort([['_id', 1]]).exec(function(err, category){
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
    Passage.findOne().sort({_id: -1}).exec(function(err, passage) {
        if(err){
            console.log(err);
        }
        if (info.content != passage.content){
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
app.get('/fruit', (req, res) => {
    let test = null;
    Passage.find().sort([['_id', 1]]).exec(function(err, response){
        res.render("fruit", {fruit: response});
    });
});

app.listen(3000, () => {
    console.log("Sasame Started...");
});

// GOLDEN ROAD ALGORITHM
// 1: Create Golden Road Chapters by comparing all Passages to all other Passages
// 2: Create Main Golden Road by comparing all Passages to the next Passage
// 3: Create Golden Roads on existing Chapters by comparing all passages in each chapter to the next passage in said chapter
// 1 and 2 run automatically. Number 3 will run manually.
var golden_road = function(similarity, last_passage, golden_passages){
    similarity = similarity || 0;
    last_passage = last_passage || {keys: []};
    golden_passages = [];
    Passage.find({}, (err, passages) => {
        console.log('RUNNING THE GOLDEN ROAD ALGORITHM');
        if(err){}
        //2
        for(const passage of passages){
            similarity = key_similarity(passage.keys, last_passage.keys);
            similarity = ('' + similarity).split('.').join('');
            if(similarity > 0 && passage.keys.length > 0){
                passage.golden = 'golden' + similarity;
                last_passage = passage;
                passage.save();
            }
            //1
            for(const passage2 of passages){
                similarity = key_similarity(passage.keys, passage2.keys);
                similarity = ('' + similarity).split('.').join('');
                if(similarity > 0 && passage.keys.length > 0 && passage != passage2){
                    golden_passages.push(passage);
                    golden_passages.push(passage2);
                }
            }
        }
        let category = new Category({
            title: 'Golden Road',
            passages: golden_passages
        }).save();
        // 60 second break
        setTimeout(golden_road, 60000);
    });
};
// golden_road();
//now delete old Golden Road Chapters and all associated passages

function key_similarity(arrayA, arrayB) {
    var matches = 0;
    var short_array = arrayA.length;
    var long_array = arrayB.length;
    //iterate over the shortest array
    if(arrayB.length < short_array){
        short_array = arrayB.length;
        long_array = arrayA.length;
    }
    for (var i=0;i<short_array;++i) {
        if (arrayB.indexOf(arrayA[i]) != -1)
            ++matches;
    }
    //percentage in decimal form is matches/longest_array_length
    return matches / long_array;
}
