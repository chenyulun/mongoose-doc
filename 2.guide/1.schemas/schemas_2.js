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
	const animalSchema = new Schema({
		name: String,
		type: String,
		tags: {type: [String], index: true} //field level
	});
	// animalSchema.index({ name: 1, type: -1 }); // schema level

	// Will cause an error because mongodb has an _id index by default that
// is not sparse
	animalSchema.index({ _id: 1 }, { sparse: true });
	var Animal = mongoose.model('Animal', animalSchema);

	Animal.on('index', function(error) {
		// "_id index cannot be sparse"
		console.log('error:' + error.message);
	});
	// 去掉自定义索引方法
	// mongoose.connect('mongodb://user:pass@localhost:port/database', { config: { autoIndex: false } });
// or
	// mongoose.createConnection('mongodb://user:pass@localhost:port/database', { config: { autoIndex: false } });
// or
	// animalSchema.set('autoIndex', false);
// or
	// new Schema({}, { autoIndex: false });
});
