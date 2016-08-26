const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const engines = require('consolidate');
require('dotenv').config({ silent: true });

const mongoose = require('mongoose');
var Contacts = require('./models/contact');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/contactsapp', function(err) {
	if (err) {
		console.info('Error connecting to DB')
	} else { console.info('Connected to ContactsApp DB')}
})

// Express setup
const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000")
  res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')
  res.header('Access-Control-Allow-Credentials', true)
  next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.engine('hbs', engines.handlebars)
app.set('views', './views')
app.set('view engine', 'hbs')

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
	Contacts.find({}, function(err, contacts) {
		if (err) throw err

		res.render('index', {contacts: contacts})
	})
})

app.get('/contacts/:id', (req, res) => {
	Contacts.findOne({ _id: req.params.id }, function(err, docs) {
		if (err) {
			console.log(err)
			res.send({
				'message': err
			})
		}

		//if (!docs) req.flash('error', 'Contact not Found') ;

		res.render('index', {contact: docs})
	})
})

app.post('/contacts', (req, res) => {
	var contact = new Contacts({
		name: { first: req.body.first, last: req.body.last },
		email: req.body.email,
		mobile: req.body.mobile,
		location: req.body.location
	});
	contact.save(function(err, docs) {
		if (err) {
			console.log(err)
			res.send({
				'message': err
			})
		}

		res.send(docs);
	})
})

app.put('/contacts/:id', (req, res) => {
	var id = req.params.id;
	Contacts.findById(id, function(err, doc) {
		if (err) {
			console.log(err)
			res.send({
				'message': err
			})
		}

		doc.name = { first: req.body.first, last: req.body.last };
		doc.email = req.body.email;
		doc.mobile = req.body.mobile;
		doc.location = req.body.location;
		doc.save(function(err, contact) {
			if (err) res.send('err');
			res.send(contact)
		})
	})
})

app.delete('/contacts/:id', (req, res) => {
	Contacts.findById(req.params.id, function(err, doc) {
		doc.remove(function(err) {
			if (err) {
				console.log(err)
				res.send({
					'message': err
				})
			}
		})
	})
})

app.listen(process.env.PORT || 3000, function() {
	console.log('Node server running on port ' + process.env.PORT)
});