// This file is for Initializing the Database
const Chapter = require('../models/Chapter');
const Passage = require('../models/Passage');

// Make Initial Chapters
var topLevels = ['Foreword', 'Infinity Forum', 'RULES', 'Keys', 'Golden Roads', 'Death by Bubbles', 'Development', 'Afterword'];
var chaptersToCreate = [];
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
    chaptersToCreate.push(models.Chapter({
        author: 7,
        title: topLevels[chapter],
        level: 1,
        addPassageAllowed: addPassageAllowed,
        addChapterAllowed: addChapterAllowed
    }));
}
//Actually create the categories
Chapter.create(chaptersToCreate, function(err, chapters){
    if (err) console.log(err);
    console.log(chapters);
    console.log('All Done!');
    process.exit(1);
});
