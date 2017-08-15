/**
 * Created by CHENYULUN on 2017/8/15.
 */
const mongoose = require('mongoose');
	const Schema = mongoose.Schema;
// ready to go!
// define a schema
const personSchema = new Schema({
	n: {
		type: String,
		// Now accessing `name` will get you the value of `n`, and setting `n` will set the value of `name`
		alias: 'name'
	}
});//,{ id: false }可以添加参数禁止创建id
const Person = mongoose.model('Person', personSchema);
// Setting `name` will propagate to `n`
const person = new Person({ name: 'Val' });
console.log(person); // { n: 'Val', _id: 5992c1f7947e46637ac49287 }
console.log(person.toObject({ virtuals: true }));
/**
 * { n: 'Val',
  _id: 5992c1f7947e46637ac49287,
  id: '5992c1f7947e46637ac49287',
  name: 'Val' }
 */
console.log(person.name); // "Val"

person.name = 'Not Val';
console.log(person); // { n: 'Not Val', _id: 5992c1f7947e46637ac49287 }



