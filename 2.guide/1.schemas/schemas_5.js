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
	const thingSchema = new Schema({
		// iAmNotInTheSchema: Boolean
	},{ strict: false });
	const Thing = mongoose.model('Thing', thingSchema);
	const thing = new Thing({ iAmNotInTheSchema: true });
	const thingPromise = thing.save(); // iAmNotInTheSchema is not saved to the db
	thingPromise.then(thing => {
		console.log('iAmNotInTheSchema:' + thing.iAmNotInTheSchema);
		//{ strict: true } iAmNotInTheSchema:undefined
		//{ strict: false } iAmNotInTheSchema:true
	},console.error);
});
