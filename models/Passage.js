'use strict';
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const passageSchema = mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    //original source passage reference
    originalPassage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Passage'
    },
    //previous source passage reference
    previousPassage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Passage'
    },
    content: String,
    //forces content to be a unique value unless null
    // content: {
    //     type: String,
    //     index: {
    //         unique: true,
    //         partialFilterExpression: {content: {$type: "string"}}
    //     }
    // },
    //chapter the passage belongs to
    chapter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter'
    },
    //parent passage the passage belongs to
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Passage'
    },
    // sub passages under this passage
    passages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Passage'
    }],
    //categories the passage is labeled with
    categories: String,
    //date of creation
    date: {type: Date, default: Date.now},
    //date last updated
    updated: {type: Date, default: Date.now},
    //which users find this passage useful?
    stars: {
        type: Number,
        default: 0
    },
    //JSON for properties
    metadata: String,
    // What rules are being used to read the metadata?
    //also JSON
    keySchema: String,
    //is this passage a key schema?
    isSchema: Boolean,
    flagged: {
        type: Boolean,
        default: false
    }, //content warning
    label: String,
    canvas: Boolean, // Has Canvas tag?
    filename: String,
    deleted: {
        type: Boolean,
        default: false
    },
    visible: {
        type: Boolean,
        default: true
    }, // Visible in central stream? (!exclusive chapters)
    //is the passage in a queue? (invisible everywhere but to user queue)
    queue: {
        type: Boolean,
        default: false
    },
    //has the passage been marked useful?
    //only really applies to passages created by Sasame or Task responses
    useful: {
        type: Boolean,
        default: false
    }
});
var autoPopulateChildren = function(next) {
    this.populate('passages');
    next();
};

passageSchema
.pre('findOne', autoPopulateChildren)
.pre('find', autoPopulateChildren)
passageSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Passage', passageSchema, 'Passages');