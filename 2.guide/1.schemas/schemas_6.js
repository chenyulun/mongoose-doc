/**
 * Created by CHENYULUN on 2017/8/15.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// ready to go!
// define a schema
var schema = new Schema({ name: String });
schema.path('name').get(function (v) {
	return v + ' is my name';
});
schema.set('toJSON', { getters: true, virtuals: false });
// schema.set('toObject', { getters: true });
var M = mongoose.model('Person', schema);
var m = new M({ name: 'Max Headroom' });
console.log(m.toObject()); // { _id: 504e0cd7dd992d9be2f20b6f, name: 'Max Headroom' }
console.log(m.toJSON()); // { _id: 504e0cd7dd992d9be2f20b6f, name: 'Max Headroom is my name' }
// since we know toJSON is called whenever a js object is stringified:
console.log(JSON.stringify(m)); // { "_id": "504e0cd7dd992d9be2f20b6f", "name": "Max Headroom is my name" }

