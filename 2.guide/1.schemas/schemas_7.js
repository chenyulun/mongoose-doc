/**
 * Created by CHENYULUN on 2017/8/15.
 */
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/test',{
	useMongoClient: true
});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	const Schema = mongoose.Schema;
// ready to go!
// define a schema
	var schema = new Schema({ name: String });
	// schema.set('validateBeforeSave', false);
	schema.path('name').validate(function (value) {
		return value !== null;
	});
	var M = mongoose.model('Person', schema);
	var m = new M({ name: null });
	m.validate(function(err) {
		console.log('验证失败了'); // Will tell you that null is not allowed.
	});
	const thingPromise = m.save(); // Succeeds despite being invalid
	thingPromise.then(person => {
		// console.log('name:' + person.name);
		//{ strict: true } iAmNotInTheSchema:undefined
		//{ strict: false } iAmNotInTheSchema:true
	},console.error);
});
