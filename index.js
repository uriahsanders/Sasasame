'use strict';
const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');

var app = express();
app.use(express.static('./dist'));
app.set('view engine', 'ejs');
app.set('views', './views');

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
var categorySchema = mongoose.Schema({
    author: String,
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
    }
});
var passageSchema = mongoose.Schema({
    author: String,
    rank: Number, //rank is the average of the array
    content: String,
    //category the passage belongs to
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }
});
var Passage = mongoose.model('Post', passageSchema, 'Posts');
var Category = mongoose.model('Category', categorySchema, 'Categories');

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

app.get('/about', function(req, res) {
    res.render('about', { posts });
});
app.get('/history', function(req, res) {
    res.render('history', { posts });
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
    //home page
    if(url_end == '' || url_end.length < 15){
        Category.find().sort({_id: 1}).exec(function(err, categories){
            Passage.find().sort([['_id', 1]]).exec(function(err, passages){
                res.render("sasasame", {category: '', book: passages, categories: categories});
            });
        });
    }
    //category ID
    else{
        //find all passages in this category
        Passage.find({category: url_end}).exec(function(err, passages){
            //find all categories in this category
            Category.find({category: url_end}).exec(function(err, cats){
                res.render("sasasame", {category: url_end, book: passages, categories: cats});
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
var add_passage = function(category, content, callback) {
    if(category != ''){
        let post = new Passage({
            content: content,
            category: category
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
    if(info.passage != ''){
        add_category(categoryID, info.title, function(){
            res.redirect(backURL);
        });
    }
    res.redirect(backURL);
});
app.get(/\/add_passage\/?(:categoryID)?/, (req, res) => {
    let info = req.query;
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    var url_end = fullUrl.split('/')[fullUrl.split('/').length - 1];
    var categoryID = url_end.split('?')[0] || '';
    var backURL=req.header('Referer') || '/';
    if(info.passage != ''){
        add_passage(categoryID, info.passage, function(){
            res.redirect(backURL);
        });
    }
    res.redirect(backURL);
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
            add_passage('', info.content, function(){
                res.redirect("/");
            });
        }
        else{
            add_passage('', 'Light', function(){
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

// var post = new Post({
//     author: 'Uriah Sanders',
//     rank: 0,
//     content: 'Sasame is an intelligent program that automatically saves the world.'
// });
// post.save();

var rank_passage = function(id, rank){
    Post.find({_id: id}).exec(function(err, res){
        res.rank.push(rank);
        let average = (array) => array.reduce((a, b) => a + b) / array.length;
        res.rank = Math.round(average(res.rank));
        res.save();
    });
};

var posts = [];

// -1 is junk, 0 is unranked, 1 is least, 3 is greatest
var ranks = [-1, 0, 1, 2, 3];

var textForAdding = 'Add a better explanation of Sasame.';
var textForPathing = ['Best', 'Worst', 'Junk'];

var display = "seed"; // start by showing the seed
var speech = function(user_speech) {
    // Update display
    display = user_speech;
    // Add new Speech to database as Junk
    make_post('Anon', -1, user_speech);

};

var sieve = function(id, rank){
    //rank the speech in database
    rank_post(id, rank);
};

var path = function(user_path){
    var paths = textForPathing; //same options
    //Grab records from DB in appropriate order depending on rank
};
app.listen(3000, () => {
    console.log("Sasame Started...");
});


