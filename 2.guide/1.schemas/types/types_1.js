/**
 * Created by EX_WLJR_CHENYULUN on 2017/10/13.
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
    var schema = new Schema({
        name:    String,
        binary:  Buffer,
        living:  Boolean,
        updated: { type: Date, default: Date.now },
        age:     { type: Number, min: 18, max: 65 },
        mixed:   Schema.Types.Mixed,
        _someId: Schema.Types.ObjectId,
        array:      [],
        ofString:   [String],
        ofNumber:   [Number],
        ofDates:    [Date],
        ofBuffer:   [Buffer],
        ofBoolean:  [Boolean],
        ofMixed:    [Schema.Types.Mixed],
        ofObjectId: [Schema.Types.ObjectId],
        ofArrays:   [[]],
        ofArrayOfNumbers: [[Number]],
        nested: {
            stuff: { type: String, lowercase: true, trim: true }
        }
    })

// example use

    var Thing = mongoose.model('Thing', schema);

    var m = new Thing;
    m.name = 'Statue of Liberty';
    m.age = 25;
    m.updated = new Date;
    m.binary = new Buffer(0);
    m.living = false;
    m.mixed = { any: { thing: 'i want' } };
    m.markModified('mixed');
    m._someId = new mongoose.Types.ObjectId;
    m.array.push(1);
    m.ofString.push("strings!");
    m.ofNumber.unshift(1,2,3,4);
    m.ofDates.addToSet(new Date);
    m.ofBuffer.pop();
    m.ofMixed = [1, [], 'three', { four: 5 }];
    m.nested.stuff = 'good';
    // m.save(callback);
    const thingPromise = m.save();
    thingPromise.then(thing => {
        console.log('save succeed');
    },console.error);
});

