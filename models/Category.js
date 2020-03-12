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
And we want to order 
Passage.find({categories: new RegExp('^'+category+'$', "i")});
Category.find({title: title}, function(cat){
	cat.passages.foreach(function(){
	
	});
});
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
});
categorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Category', categorySchema, 'Categories');