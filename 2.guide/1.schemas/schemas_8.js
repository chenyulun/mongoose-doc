/**
 * Created by EX_WLJR_CHENYULUN on 2017/10/20.
 */
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
    const teammateSchema = new Schema({
        name:String,
    },{_id:false});
    const teamSchema = new Schema({
        teammate:[teammateSchema]
    });

// example use

    let teammate = [ { name: 'useruser1' }];
    var Team = mongoose.model('Team', teamSchema);

    var m = new Team({teammate});
    // m.save(callback);
    const thingPromise = m.save();
    thingPromise.then(thing => {
        console.log('save succeed');
    },console.error);
});

