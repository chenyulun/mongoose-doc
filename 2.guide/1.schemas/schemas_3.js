/**
 * Created by CHENYULUN on 2017/8/15.
 */
const mongoose = require('mongoose');
	const Schema = mongoose.Schema;
// ready to go!
// define a schema
const personSchema = new Schema({
	name: {
		first: String,
		last: String
	}
});
personSchema.virtual('fullName').get(function () {
	return this.name.first + ' ' + this.name.last;
}).
set(function(v) {
	this.name.first = v.substr(0, v.indexOf(' '));
	this.name.last = v.substr(v.indexOf(' ') + 1);
});
// compile our model
const Person = mongoose.model('Person', personSchema);

// create a document
const axl = new Person({
	name: { first: 'Axl', last: 'Rose' }
});
console.log(axl.name.first + ' ' + axl.name.last); // Axl Rose

console.log(axl.fullName); // Axl Rose
axl.fullName = 'William Rose'; // Now `axl.name.first` is "William"
console.log(axl.toObject());
/**
 * { _id: 5992bffd611cbd6323a5a493,
  name: { first: 'William', last: 'Rose' } }
 */
console.log(axl.toObject({ virtuals: true }));
/**
 * { _id: 5992bf1ff4b5896313f07d81,
  name: { first: 'William', last: 'Rose' },
  id: '5992bf1ff4b5896313f07d81',
  fullName: 'William Rose' }
 */

