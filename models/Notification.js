'use strict';
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const notificationSchema = mongoose.Schema({
    //who is the notification for?
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    content: String,
    //date of creation
    date: {type: Date, default: Date.now},
    type: String
});

notificationSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Notification', notificationSchema, 'Notifications');