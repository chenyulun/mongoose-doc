## 模式(schemas)
如果你还没有准备好，请先阅读quick_start文档，快速了解mongoose是如何工作的，如果你是用2.x迁移到3.x版本，本教程不提供迁移教程，请移步到官方文档查看迁移文档[migration guide](http://www.nodeclass.com/api/mongoose.html#guide_migration)   

### 定义你的模式
所有的mongoose都是从Schema开始的，每个Schema映射到MongoDB集合和定义文档集合内的形状。可以理解为模板，或者接口；
废话不多说，我们先定义一个bolg数据模型
```javascript
// schemas_1.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const blogSchema = new Schema({
	title:  String,
	author: String,
	body:   String,
	comments: [{ body: String, date: Date }],
	date: { type: Date, default: Date.now },
	hidden: Boolean,
	meta: {
		votes: Number,
		favs:  Number
	}
});
```
如果您创建完成后还想添加额外的属性，可以使用[Schema#add](http://www.nodeclass.com/api/mongoose.html#schema_Schema-add)定义的方法进行添加；  
我们的bolgSchema中的每一个属性都定义了一个类型，其类型集合如下：
*   String
*   Number
*   Date
*   Buffer
*   Boolean
*   Mixed
*   ObjectId
*   Array  
更多的类型请查看[SchemaTyp](http://www.nodeclass.com/api/mongoose.html#schematype_SchemaType)。

### 创建一个模型
刚刚我们创建了一个schema模式，我们需要使用一个model来创建使用他，使用的方法是<code>mongoose.model(modelName, schema)<code>:
```javascript
const Blog = mongoose.model('Blog', blogSchema);
// ready to go!
```
### 实例方法
models的实例方法都在[documents](http://www.nodeclass.com/api/mongoose.html#guide_documents)里面，文档里面定义了很多实例方法，我们也可以定义自己的modles实例方法(注意不能使用箭头函数，不然找不到对象)：
```javascript
// define a schema
const animalSchema = new Schema({ name: String, type: String });
// assign a function to the "methods" object of our animalSchema
animalSchema.methods.findSimilarTypes = function (cb) {
	return this.model('Animal').find({ type: this.type }, cb);
};
```
现在我们所有的animalSchema实例都可以使用findSimilarTypes方法：
```javascript
// define a schema
const animalSchema = new Schema({ name: String, type: String });
// assign a function to the "methods" object of our animalSchema
animalSchema.methods.findSimilarTypes = function (cb) {
  return this.model('Animal').find({ type: this.type }, cb);
}
```
使用实例方法如下：
```javascript
	const Animal = mongoose.model('Animal', animalSchema);
	const dog = new Animal({type: 'dog'});
	dog.findSimilarTypes(function (err, dogs) {
		console.log(dogs); // woof
	   /**
        * [ { _id: 5992a4f6e08c76b8c5a30da9, type: 'dog', name: 'wangnima' },{ _id: 5992a52fe08c76b8c5a30daa, type: 'dog', name: 'fido' } ]
        */
	});
```
这里find查询的test数据库所有的Animal集合(<code>db.animals.find({type: 'dog'})</code>);由于dog没存储，返回数据库集合可能为[];
可以打开命令行先预先存储数据，切换到test数据库：
```
db.animals.insert({type:'dog',name:'wangnima'})
db.animals.insert({type:'dog',name:'fido'})
```

### 静态方法
向Model里面添加一个静态方法也很简单，我们继续在animalSchema上创建静态方法：
```javascript
// assign a function to the "statics" object of our animalSchema
	animalSchema.statics.findByName = function (name, cb) {
		this.find({ name: new RegExp(name, 'i') }, cb);
	}
	Animal.findByName('fido', function (err, animals) {
		console.log(animals);
		//[ { _id: 5992a52fe08c76b8c5a30daa, type: 'dog', name: 'fido' } ]
	});
```
注意方法添加的顺序，不然会报错的，方法添加必须在mongoose.model使用之前

### 查询助手
你也可以添加查询方法，可以简化查询代码（注意方法定义的位置和使用位置）：
```javascript
animalSchema.query.byName = function(name) {
  return this.find({ name: new RegExp(name, 'i') });
};

const Animal = mongoose.model('Animal', animalSchema);
Animal.find().byName('fido').exec(function(err, animals) {
  console.log(animals);
});
```

### 索引(Indexes)
MongoDB 支持[二级索引(secondary indexes)](http://docs.mongodb.org/manual/indexes/) .在mongoose里， 我们可以在文档属性里面定义索引(field level)，也可以定义模式索引(schema level),在创建复杂的模式是定义模式级别的所有是很有必要的:
```javascript
// schemas_2.js
	const animalSchema = new Schema({
		name: String,
		type: String,
		tags: {type: [String], index: true} //field level
	});
animalSchema.index({ name: 1, type: -1 }); // schema level 1是正序，-1是倒序
```
如果我们手动设置了索引，可以取消系统自带的自动索引,因为过多的索引会降低CUD操作，所有取消自动索引：
```javascript
mongoose.connect('mongodb://user:pass@localhost:port/database', { config: { autoIndex: false } });
// or  
mongoose.createConnection('mongodb://user:pass@localhost:port/database', { config: { autoIndex: false } });
// or
animalSchema.set('autoIndex', false);
// or
new Schema({}, { autoIndex: false });
```
Mongoose建立索引的完成的时候会发出一个事件，可以通过此事件回调判断索引建立是否成功：
```javascript
// Will cause an error because mongodb has an _id index by default that
// is not sparse
animalSchema.index({ _id: 1 }, { sparse: true });
var Animal = mongoose.model('Animal', animalSchema);

Animal.on('index', function(error) {
  // "_id index cannot be sparse"
  console.log(error.message);
  // error:The field 'sparse' is not valid for an _id index specification. Specification: { v: 2, ns: "test.animals", key: { _id: 1 }, name: "_id_1", sparse: true, background: true, unique: false }
});
```
查看更多[模式索引](http://mongoosejs.com/docs/api.html#model_Model.ensureIndexes)方法

### 虚拟文档
虚拟文档指创建模型的时候不依赖mongoose.model，且不存储到MongoDB,直接实例化模式，创建虚拟文档方法：
```javascript
// schemas_3.js
// define a schema
const personSchema = new Schema({
	name: {
		first: String,
		last: String
	}
});
// compile our model
const Person = mongoose.model('Person', personSchema);

// create a document
const axl = new Person({
	name: { first: 'Axl', last: 'Rose' }
});
```
上面定义的方法和前面相比，少了mongoose.model,接下来使用数据：
```javascript
console.log(axl.name.first + ' ' + axl.name.last); // Axl Rose
```
如果我们想直接获取全部名称该怎么办呢？我们可以给我们的模型定义虚拟获取数据方法：
```javascript
personSchema.virtual('fullName').get(function () {
  return this.name.first + ' ' + this.name.last;
});
```
这样的话我们就可以直接使用获取完整的名称了：
```javascript
console.log(axl.fullName); // Axl Rose
```
但是执行axl.toObject()或者toJSON()的时候fullName不会存在，需要在这个方法中添加参数
```javascript
axl.toObject({ virtuals: true })
```
你也可以设置该方法的存取方式：
```javascript
personSchema.virtual('fullName').
  get(function() { return this.name.first + ' ' + this.name.last; }).
  set(function(v) {
    this.name.first = v.substr(0, v.indexOf(' '));
    this.name.last = v.substr(v.indexOf(' ') + 1);
  });
  
axl.fullName = 'William Rose'; // Now `axl.name.first` is "William"
```
### 模式别名
模式别名设置名称的时候可以设置单独设置类型(type)和别名(alias):
```javascript
const personSchema = new Schema({
	n: {
		type: String,
		// Now accessing `name` will get you the value of `n`, and setting `n` will set the value of `name`
		alias: 'name'
	}
});
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
```
官方文档少了Person定义，我在这里补上

### 模式参数
定义模式的时候我们可以传入额外参数来自定义模式，方法如下：
```
new Schema({..}, options);

// or

var schema = new Schema({..});
schema.set(option, value);
```
#### 有效的参数:  
autoIndex  
capped  
collection  
emitIndexErrors  
id  
_id  
minimize  
read  
safe  
shardKey  
strict  
toJSON  
toObject  
typeKey  
validateBeforeSave  
versionKey  
skipVersioning  
timestamps  
retainKeyOrder  

##### 参数：autoIndex:Boolean
设置是否自动建立索引，v3版本默认为true,mongoose建立索引的时候会发送事件，可以绑定回调函数进行监控：
```javascript
const schema = new Schema({}, { autoIndex: false });
const Clock = mongoose.model('Clock', schema);
Clock.ensureIndexes(callback);
```
##### 参数：bufferCommands:Boolean
默认情况下，mongoose会缓存数据，直到重连，禁止缓存可以设置为false:
```javascript
const schema = new Schema({}, { bufferCommands: false });
```
##### 参数：capped:Boolean
在mongoose支持mongoDB里面设置一次性修改集合大小最大值，该属性能限制一次操作的量(单位为bytes):
```javascript
new Schema({}, { capped: 1024 });
```
限制选项也可以被设置为一个对象,如果你想通过附加选项如max或autoIndexId。在这种情况下,您必须显式地通过大小选项是必需的。
```javascript
new Schema({}, { capped: { size: 1024, max: 1000, autoIndexId: true } });
```
更多详情请查看[MongoDB-Capped](http://www.mongodb.org/display/DOCS/Capped+Collections#CappedCollections-size.)

##### 参数：collection:String
mongoose在默认情况下生成一个集合名称通过toCollectionName方法生成效用模型的名字。这种方法和复数的名字，该参数可以自己喜欢的名称：
```javascript
new Schema({}, { collection: 'data' });
```
##### 参数：emitIndexErrors:Boolean
默认情况下建立索引会发出如下事件：
```javascript
MyModel.on('index', function(error) {
  /* If error is truthy, index build failed */
});
```
如果该参数设置为true,会额外通知error事件：
```javascript
MyModel.schema.options.emitIndexErrors; // true
MyModel.on('error', function(error) {
  // gets an error whenever index build fails
});
```
##### 参数：id:Boolean
之前的案例中输出了_id和id数据时一样的，这里可以设置模式的id为空：
```javascript
// default behavior
const schema = new Schema({ name: String });
const Page = mongoose.model('Page', schema);
const p = new Page({ name: 'mongodb.org' });
console.log(p.id); // '50341373e894ad16347efe01'

// disabled id
const schema = new Schema({ name: String }, { id: false });
const Page = mongoose.model('Page', schema);
const p = new Page({ name: 'mongodb.org' });
console.log(p.id); // undefined
```
##### 参数：_id:Boolean
同上

##### 参数：minimize:Boolean
默认为true,默认情况下，创建模型时，如果定义的对象为空，着会过滤掉该属性或者对象：
```javascript
var schema = new Schema({ name: String, inventory: {} });
var Character = mongoose.model('Character', schema);

// will store `inventory` field if it is not empty
var frodo = new Character({ name: 'Frodo', inventory: { ringOfPower: 1 }});
Character.findOne({ name: 'Frodo' }, function(err, character) {
  console.log(character); // { name: 'Frodo', inventory: { ringOfPower: 1 }}
});

// will not store `inventory` field if it is empty
var sam = new Character({ name: 'Sam', inventory: {}});
Character.findOne({ name: 'Sam' }, function(err, character) {
  console.log(character); // { name: 'Sam' }
});
```
如果设置minimize为false,则创建模型是保留对象或者属性：
```javascript
var schema = new Schema({ name: String, inventory: {} }, { minimize: false });
var Character = mongoose.model('Character', schema);

// will store `inventory` if empty
var sam = new Character({ name: 'Sam', inventory: {}});
Character.findOne({ name: 'Sam' }, function(err, character) {
  console.log(character); // { name: 'Sam', inventory: {}}
});
```
##### 参数：minimize:String
允许设置[查询#读](http://mongoosejs.com/docs/api.html#query_Query-read)选项在模式级别,默认为primary级别，提供我们一种对所有查询应用默认ReadPreferences源自一个模型：
```javascript
new Schema({}, { read: 'primary' });            // also aliased as 'p'
new Schema({}, { read: 'primaryPreferred' });   // aliased as 'pp'
new Schema({}, { read: 'secondary' });          // aliased as 's'
new Schema({}, { read: 'secondaryPreferred' }); // aliased as 'sp'
new Schema({}, { read: 'nearest' });            // aliased as 'n'
```
##### 参数：safe:Boolean
这个配置会在MongoDB所有的操作中起作用。如果设置成true就是在操作的时候要等待返回的MongoDB返回的结果，比如update，要返回影响的条数，才往后执行，如果safe：false，则表示不用等到结果就向后执行了。
默认设置为true能保证所有的错误能通过我们写的回调函数。我们也能设置其它的安全等级如：
```javascript
var safe = true;
new Schema({}, { safe: safe });
var safe = { w: "majority", wtimeout: 10000 };
new Schema({}, { safe: safe });
var safe = { w: "1",j: ture, wtimeout: 10000 };
new Schema({}, { safe: safe });
```
相关文章[mongodb的write concern](http://kyfxbl.iteye.com/blog/1952941)
##### 参数：shardKey:Object
shardKey选项时使用我们有一个分片MongoDB架构。每个分片收集碎片键必须出现在所有的插入/更新操作。我们只需要设置该模式选择相同的分片键),我们将所有的设置：
```javascript
new Schema({}, { shardKey: { tag: 1, name: 1 }})
```
##### 参数：strict:Boolean|String
设置是否严格按照模式模板设置数据，默认true,strict也可以设置为throw，表示出现问题将会抛出错误而不是抛弃不合适的数据。如下：
```javascript
//schemas_5.js
	const thingSchema = new Schema({
		// iAmNotInTheSchema: Boolean
	});
	const Thing = mongoose.model('Thing', thingSchema);
	const thing = new Thing({ iAmNotInTheSchema: true });
	const thingPromise = thing.save(); // iAmNotInTheSchema is not saved to the db
	thingPromise.then(thing => {
		console.log('iAmNotInTheSchema:' + thing.iAmNotInTheSchema);
		//iAmNotInTheSchema:undefined
	},console.error);
```
上面的代码可以在数据库中查到空的数据
```
{ "_id" : ObjectId("5992d058e6af9164c1d4d45b"), "__v" : 0 }
```
下面是设置为false：
```javascript
	const thingSchema = new Schema({
		// iAmNotInTheSchema: Boolean
	},{ strict: false });
	const Thing = mongoose.model('Thing', thingSchema);
	const thing = new Thing({ iAmNotInTheSchema: true });
	const thingPromise = thing.save(); // iAmNotInTheSchema is not saved to the db
	thingPromise.then(thing => {
		console.log('iAmNotInTheSchema:' + thing.iAmNotInTheSchema);
		//{ strict: false } iAmNotInTheSchema:true
	},console.error);
```
成功插入数据到数据库：
```
{ "_id" : ObjectId("5992d1242c7d7764d2564171"), "iAmNotInTheSchema" : true, "__v" : 0 }
```
这个属性也会影响到<code>doc.set()</code>设置属性：
```javascript
var thingSchema = new Schema({})
var Thing = mongoose.model('Thing', thingSchema);
var thing = new Thing;
thing.set('iAmNotInTheSchema', true);
thing.save(); // iAmNotInTheSchema is not saved to the db
```
该选项也可以在Model级别使用,传入参数来控制是否启用这个严格模式：
```javascript
var Thing = mongoose.model('Thing');
var thing = new Thing(doc, true);  // enables strict mode
var thing = new Thing(doc, false); // disables strict mode
```
##### 参数：toJSON
设置toJSON方法的参数
```javascript
//schemas_6.js
var schema = new Schema({ name: String });
schema.path('name').get(function (v) {
	return v + ' is my name';
});
schema.set('toJSON', { getters: true, virtuals: false });
var M = mongoose.model('Person', schema);
var m = new M({ name: 'Max Headroom' });
console.log(m.toObject()); // { _id: 504e0cd7dd992d9be2f20b6f, name: 'Max Headroom' }
console.log(m.toJSON()); // { _id: 504e0cd7dd992d9be2f20b6f, name: 'Max Headroom is my name' }
// since we know toJSON is called whenever a js object is stringified:
console.log(JSON.stringify(m)); // { "_id": "504e0cd7dd992d9be2f20b6f", "name": "Max Headroom is my name" }
```
##### 参数：toObject
设置toObject方法的参数:
```javascript
var schema = new Schema({ name: String });
schema.path('name').get(function (v) {
  return v + ' is my name';
});
schema.set('toObject', { getters: true });
var M = mongoose.model('Person', schema);
var m = new M({ name: 'Max Headroom' });
console.log(m); // { _id: 504e0cd7dd992d9be2f20b6f, name: 'Max Headroom is my name' }
```
##### 参数：typeKey:String
默认情况下，属性模式对象如果设置了type属性，则该属性类型为type设置的属性：
```javascript
// Mongoose interprets this as 'loc is a String'
var schema = new Schema({ loc: { type: String, coordinates: [Number] } });
```
然而，我们可以自定义类型参数：
```javascript
var schema = new Schema({
  // Mongoose interpets this as 'loc is an object with 2 keys, type and coordinates'
  loc: { type: String, coordinates: [Number] },
  // Mongoose interprets this as 'name is a String'
  name: { $type: String }
}, { typeKey: '$type' }); // A '$type' key means this object is a type declaration
```
##### 参数：validateBeforeSave:Boolean
是否在保存之前是否通过mongoose验证，默认为true,验证不通过都不保存，且触发validate函数，区别在于：
>  如果不设置或者设置true，会抛出系统级别错误，程序终止，
>  如果设置为false,验证不通过时，通知validate函数，由validate捕捉错误，程序不终止，如下：
```javascript
var schema = new Schema({ name: String });
schema.set('validateBeforeSave', false);
schema.path('name').validate(function (value) {
    return value !== null;
});
var M = mongoose.model('Person', schema);
var m = new M({ name: null });
m.validate(function(err) {
    console.log(err); // Will tell you that null is not allowed.
});
m.save(); // Succeeds despite being invalid
```
##### 参数：versionKey:String|Boolean
默认存储的数据里面带有有__v:0,用于版本控制，是否修复过该数据：
```javascript
var schema = new Schema({ name: String });
var Thing = mongoose.model('Thing', schema);
var thing = new Thing({ name: 'mongoose v3' });
thing.save(); // { __v: 0, name: 'mongoose v3' }

// customized versionKey
new Schema({name:String}, { versionKey: '_somethingElse' })
var Thing = mongoose.model('Thing', schema);
var thing = new Thing({ name: 'mongoose v3' });
thing.save(); // { _somethingElse: 0, name: 'mongoose v3' }
```
当然你可以可以取消掉这个字段：
```javascript
new Schema({name:String}, { versionKey: false });
var Thing = mongoose.model('Thing', schema);
var thing = new Thing({ name: 'no versioning please' });
thing.save(); // { name: 'no versioning please' }
```
##### 参数：versionKey:Object
用于控制什么时候版本需要增加：
```javascript
new Schema({}, { skipVersioning: { dontVersionMe: true } });
thing.dontVersionMe.push('hey');
thing.save(); // version is not incremented
```
#### 参数：timestamps：Object
用于设置保存数据的时间戳，修改数据的时候也会改变该值：
```javascript
var thingSchema = new Schema({}, { timestamps: { createdAt: 'created_at' } });
var Thing = mongoose.model('Thing', thingSchema);
var thing = new Thing();
thing.save(); // `created_at` & `updatedAt` will be included
```
#### 参数：useNestedStrict：Boolean
在mongoose4版本以上，<code>update()</code>和<code>findOneAndUpdate()</code>只检查顶级属性，无法支持'child.name',下面的代码可以正常执行:
```javascript
var childSchema = new Schema({}, { strict: false });
var parentSchema = new Schema({ child: childSchema }, { strict: 'throw' });
var Parent = mongoose.model('Parent', parentSchema);
Parent.update({}, { 'child.name': 'Luke Skywalker' }, function(error) {
  // Error because parentSchema has `strict: throw`, even though
  // `childSchema` has `strict: false`
});

var update = { 'child.name': 'Luke Skywalker' };
var opts = { strict: false };
Parent.update({}, update, opts, function(error) {
  // This works because passing `strict: false` to `update()` overwrites
  // the parent schema.
});
```
如果update方法不添加opts的话，就需要在模式里面添加useNestedStrict: true才能正常更新数据:
```javascript
var childSchema = new Schema({}, { strict: false });
var parentSchema = new Schema({ child: childSchema },
  { strict: 'throw', useNestedStrict: true });
var Parent = mongoose.model('Parent', parentSchema);
Parent.update({}, { 'child.name': 'Luke Skywalker' }, function(error) {
  // Works!
});
```
#### 参数：retainKeyOrder：Boolean
默认情况，mongoose逆转关键顺序文件的性能优化，例如：<code>new Model({ first: 1, second: 2 })</code>存储到mongoDB的时候会变成<code>new Model({ second: 2, first: 1 })</code>,这种行为会有意想不到的副作用，包括难以操作温度的_id字段，  
在mongoose >= 4.6.4版本添加了<code>retainKeyOrder</code>参数选择模式，确保mongoose能始终正确的保存数据：
```javascript
var testSchema = new Schema({ first: Number, second: Number }, { retainKeyOrder: true });
var Test = mongoose.model('Test', testSchema);
Test.create({ first: 1, second: 2 }); // Will be stored in mongodb as `{ first: 1, second: 2 }`
```
### 模式扩展
模式也是可扩展的,这允许我们打包可重用功能插件,可以共享与社区之间的或只是你的项目。

### 下一章
现在我们已经介绍了模式,让我们看看[SchemaTypes](./types/types.md)。







