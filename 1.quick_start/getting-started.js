/**
 * Created by CHENYULUN on 2017/8/15.
 */

let mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/test',{
	useMongoClient: true
});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	// yay!
	console.log("connected!");
	let kittySchema = mongoose.Schema({
		name: String
	});
	kittySchema.methods.speak = function () {
		let greeting = this.name
			? "Meow name is " + this.name
			: "I don't have a name";
		console.log(greeting);
	};
	let Kitten = mongoose.model('Kitten', kittySchema);
	let silence = new Kitten({ name: 'Silence' });
	console.log(silence.name);// 'Silence'

	let fluffy = new Kitten({ name: 'fluffy' });
	// let fluffySave = fluffy.save();
	// fluffySave.then(fluffy => {
	// 	fluffy.speak();
	// },console.error);

	let KittenFind = Kitten.find({ name: /^Fluff/ });
	KittenFind.then(kittens => {
		console.log(kittens);
	},console.error);
	// fluffy.speak() // "Meow name is fluffy"
});
// const MongoClient = require('mongodb').MongoClient;
// const url = 'mongodb://localhost:27017/test';
// MongoClient.connect(url, (err, db) => {
// 	// Create a collection we want to drop later
// 	if (err) {
// 		console.log(err);
// 		return;
// 	}
// 	console.log("connected!");
// });
