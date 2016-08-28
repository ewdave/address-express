const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
//const engines = require('consolidate');
var hbs = require('express-hbs');
require('dotenv').config({ silent: true });

const mongoose = require('mongoose');
var Contacts = require('./models/contact');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://127.0.0.1/contactsapp', function(err) {
	if (err) {
		console.error('Error connecting to DB')
		throw err
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

app.engine('hbs', hbs.express4({
	defaultLayout: (__dirname + '/views/layout.hbs')
}))
app.set('views', './views')
app.set('view engine', 'hbs')

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
	Contacts.find({}).sort({'name.first': 'asc'}).exec(function(err, contacts) {
		if (err) throw err

		res.render('index', {contacts: contacts})
	})
})

app.get('/contacts/:id', (req, res) => {
	Contacts.findOne({_id : req.params.id }, function(err, doc) {
		if (err) {
			console.log(err)
			res.send({
				'message': err
			})
		}

		//if (!docs) req.flash('error', 'Contact not Found') ;
		res.render('contact', {
			title: 'Contact Index',
			contact: doc
		})
	})
})

app.get('/new', (req, res) => {
	res.render('new', {title: 'New Contact'});
});

app.post('/', (req, res) => {
	var contact = new Contacts({
		name: { first: req.body.first, last: req.body.last },
		email: req.body.email,
		mobile: req.body.mobile,
		address: req.body.address
	});
	contact.save(function(err) {
		if (err) {
			console.log(err)
			res.send({
				'message': err
			})
		} else {
			res.json(contact);
		}
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

		if (!doc) {
			res.send('Contact not Found')
			console.log('Contact not Found')
		}

		doc.name = { first: req.body.first, last: req.body.last };
		doc.email = req.body.email;
		doc.mobile = req.body.mobile;
		doc.address = req.body.address;
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
				return res.send(500, err)
			} else {
				res.send('Contact Deleted')
			}
		})
	})
})

app.listen(process.env.PORT || 3000, function() {
	console.log('Node server running on port ' + process.env.PORT)
});