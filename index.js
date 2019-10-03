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
    keys: [String],
    //category the passage belongs to
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    golden: String
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
    res.render('about');
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
        Category.find().sort({_id: -1}).exec(function(err, categories){
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
    var keys = req.body.keys.split('\n');
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
var golden_road = function(similarity){
    similarity = similarity || 0;
    Passage.find({}, (err, passages) => {
        console.log('RUNNING THE GOLDEN ROAD ALGORITHM');
        if(err){}
        //compare every passage to every other passage
        for(const passage of passages){
            for(const passage2 of passages){
                similarity = key_similarity(passage.keys, passage2.keys);
                if(similarity > 0 && passage.keys.length > 0){
                    console.log(('' + similarity).split('.').join(''));
                    passage.golden = 'golden';
                    passage2.golden = 'golden';
                }
            }
            //only need to do this once
            passage.save();
        }
        // 60 second break
        setTimeout(golden_road, 60000);
    });
};
golden_road();

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
