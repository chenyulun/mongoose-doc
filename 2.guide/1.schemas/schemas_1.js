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
	/**
	 * 先在命令行插入2条数据，方便测试
	 * db.animals.insert({type:'dog',name:'wangnima'})
	 * db.animals.insert({type:'dog',name:'fido'})
	 */
// define a schema
	const animalSchema = new Schema({name: String, type: String});
// assign a function to the "methods" object of our animalSchema
	animalSchema.methods.findSimilarTypes = function (cb) {
		let Animal = this.model('Animal');
		Animal.find({type: this.type}, cb);
	};

	animalSchema.query.byName = function(name) {
		return this.find({ name: new RegExp(name, 'i') });
	};
// assign a function to the "statics" object of our animalSchema
	animalSchema.statics.findByName = function (name, cb) {
		this.find({ name: new RegExp(name, 'i') }, cb);
	};
	const Animal = mongoose.model('Animal', animalSchema);
	const dog = new Animal({type: 'dog'});
	dog.findSimilarTypes(function (err, dogs) {
		console.log(dogs);
		/**
		 * [ { _id: 5992a4f6e08c76b8c5a30da9, type: 'dog', name: 'wangnima' },{ _id: 5992a52fe08c76b8c5a30daa, type: 'dog', name: 'fido' } ]
		 */
	});

	Animal.find().byName('fido').exec(function(err, animals) {
		console.log(animals);
	});
	Animal.findByName('fido', function (err, animals) {
		console.log(animals);
		//[ { _id: 5992a52fe08c76b8c5a30daa, type: 'dog', name: 'fido' } ]
	});
});
