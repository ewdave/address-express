'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
	name: {
		first: String,
		last: String
	},
	email: String,
	mobile: String,
	address: String
})

schema.virtual('name.full').get(function() {
	return this.name.first + ' ' + this.name.last;
});

schema.virtual('name.full').set(function(name) {
	var split = name.split(' ');
	this.name.first = split[0];
	this.name.last = split[1];
});

schema.statics.findByName = function(name, callback) {
	return this.find({ name: new RegExp(name.first, 'i') }, callback)
};

var Contact = mongoose.model('Contact', schema);

module.exports = Contact;