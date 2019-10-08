// This file is for Initializing the Database
var models = require('./models');
// Make Initial Chapters
var topLevels = ['Foreword', 'Infinity Forum', 'RULES', 'Keys', 'Golden Roads', 'Death by Bubbles', 'Development', 'Afterword'];
var categoriesToCreate = [];
var addPassageAllowed;
var addChapterAllowed;
for(var chapter in topLevels){
    switch(chapter){
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
    categoriesToCreate.push(models.Category({
        author: 7,
        title: topLevels[chapter],
        level: 1,
        addPassageAllowed: addPassageAllowed,
        addChapterAllowed: addChapterAllowed
    }));
}
//Actually create the categories
models.Category.create(categoriesToCreate, function(err, categories){
    if (err) console.log(err);
    console.log(categories);
    process.exit(1);
});


//Depending on what the category is (level and name)
//we need to allow or disallow certain actions
var GRA = function(category){
    //These rules are for Perfect 100
    var canMakeChapters = false;
    var canMakePassages = false;

};
//Keypad is determined by the community
//And tells the client side GRA what keys do what
var keypad = {

};
// Make Initial Users
