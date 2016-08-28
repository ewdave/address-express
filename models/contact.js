'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
	first: {
		type: String,
		trim: true,
		unique: true
	},
	last: {
		type: String,
		trim: true
	},
	email: {
		type: String,
		trim: true,
		lowercase: true,
		match: [/.+\@.+\..+/, 'Please fill a valid email address']
	},
	mobile: {
		type: Number,
		required: true,
	},
	address: String,
	updated: {
		type: Date
	},
	created: {
		type: Date,
		default: Date.now
	}
})

schema.statics.search = function(str, callback) {
	var regexp = new RegExp(str, 'i');
	return this.find({'or': [{first: regexp}, {last: regexp}]}, callback);
};

schema.virtual('name.full').get(function() {
	return this.first + ' ' + this.last;
});

schema.virtual('name.full').set(function(name) {
	var split = name.split(' ');
	this.first = split[0];
	this.last = split[1];
});

schema.statics.findByName = function(name, callback) {
	return this.find({ first: new RegExp(name, 'i') }, callback)
};

var Contact = mongoose.model('Contact', schema);

module.exports = Contact;