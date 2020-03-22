'use strict';
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
//sub passages belong to passages
//passages belong to chapters
//chapters and passages and sub passages all have categories

//in the ppe you search by category

//ex
/*
category Houses
find all 'houses'
will give all passages and chapters with the category house
And we want to order by stars of course
//must do this
Passage.find({categories: new RegExp('^'+category+'$', "i")});
//if we use regex you can search for one or more cats
Category.find({title: new RegExp('^'+category+'$', "i")}, function(cat){
    //if we do this we can't order by stars
	cat.passages.foreach(function(){
	
	});
});

You add passages to categories like:
cat1, cat2, cat3, cat4 is more complex
then search: "cat4", or "cat3"
but not: "cat1, cat3"
In other words, you can only search one category at a time
*/
const categorySchema = mongoose.Schema({
    title: {
    	type: String,
    },
    passages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Passage'
    }],
    chapters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter'
    }],
    stars: Number
});
categorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Category', categorySchema, 'Categories');