## SchemaTypes 数据类型
数据类型用于定义默认路径， 验证方式， 获取/设置方法，用于数据库查询的默认字段，以及其他针对字符串与数字的特性。关于详细信息请查阅相关API文档。  

> 译注：默认路径即某个域相对于文档而言的路径，如{a: 1}这个文档中，若指定路径为’a’，即可访问到1这个数据。  

接下来是Mongoose中所有可用的数据类型。

*   String(字符串)
*   Number(数字)
*   Date(日期)
*   Buffer(缓存区)
*   Boolean(布尔值)
*   Mixed(混合)
*   ObjectId(对象ID)
*   Array  (数组)  

##### 举个例子：
```javascript
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
    m.age = 125;
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
```
上面的例子会报错：
> Thing validation failed: age: Path `age` (125) is more than maximum allowed value (65).  

把age修改到18到65就可以保存成功；
### SchemaTypes options 数据类型参数
你可以直接声明类型来创建一个数据类型，或者使用一个对象来描述一个数据类型：
```javascript
var schema1 = new Schema({
  test: String // `test` is a path of type String
});

var schema2 = new Schema({
  test: { type: String } // `test` is a path of type string
});
```
除了类型属性之外，还可以为路径指定额外的属性。例如，如果在保存之前想要小写的字符串:
```javascript
var schema2 = new Schema({
  test: {
    type: String,
    lowercase: true // Always convert `test` to lowercase
  }
});
```
属性`lowercase`只适用于字符串。有一些特定的选项适用于所有的模式类型，还有一些适用于特定的模式类型。
##### All Schema Types（通用类型）

*   required：布尔值(boolean)或者是函数(function),如果该值或函数返回值为真(true)为该数据类型添加必选校验
*   default：函数(function)或者任意值(any)，default就是当该数据为空的时候，数据类型默认的值
*   select:布尔值(boolean)，指定查询的默认投影
*   validate: 函数(function),为该数据类型添加一个校验函数
*   get: 函数(function),获取使用get函数获取该数据类型的值；
*   set: 函数(function),获取使用set函数设置该数据类型的值；
*   alias: 字符串(string), 只支持mongoose >= 4.10.0版本. 定义一个具有给定名称的虚拟的名称，并设置此路径。
```javascript
var numberSchema = new Schema({
  integerOnly: {
    type: Number,
    get: v => Math.round(v),
    set: v => Math.round(v),
    alias: 'i'
  }
});

var Number = mongoose.model('Number', numberSchema);

var doc = new Number();
doc.integerOnly = 2.001;
doc.integerOnly; // 2
doc.i; // 2
doc.i = 3.001;
doc.integerOnly; // 3
doc.i; // 3
```
##### Indexes（索引类型）
您还可以使用数据类型选项定义MongoDB索引[MongoDB indexs](https://docs.mongodb.com/manual/indexes/)。
*   index:布尔值(boolean)，是否把该属性定义为定义索引
*   unique:布尔值(boolean)，是否把该属性定义为定义唯一的索引[unique index](https://docs.mongodb.com/manual/core/index-unique/)
*   sparse:布尔值(boolean)，是否把该属性定义为定义稀有的索引[sparse index](https://docs.mongodb.com/manual/core/index-sparse/)  
```javascript
var schema2 = new Schema({
  test: {
    type: String,
    index: true,
    unique: true // Unique index. If you specify `unique: true`
    // specifying `index: true` is optional if you do `unique: true`
  }
});
```
##### String（字符串类型）
*  lowercase: 布尔值(boolean), 是否对该值进行 .toLowerCase() 处理
*  uppercase: boolean, 是否对该值进行 .toUppercase() 处理
*  trim: 布尔值(boolean), 是否对该值进行 .trim() 处理
*  match: 正则(RegExp), 用该正则匹配校验该值，属于校验
*  enum: 数组Array, 所输入的值必须在该数组内，属于校验
##### Number（数值类型）
*  min: 数值(Number), 该数据值允许的最小值(包括min)，属于校验
*  max: 数值(Number), 该数据值允许的最大值(包括max)，属于校验
##### Date（日期类型）
*  min: 日期类型(Date), 该数据值允许的最小值(包括min)，属于校验
*  max: 日期类型(Date), 该数据值允许的最大值(包括max)，属于校验
#### 用法要点

##### Dates 日期型

Mongoose不跟踪JS内建的日期方法对数据造成的改变。这意味着如果你在文档中使用Date 类型并用setMonth之类的方法去修改它，Mongoose不会意识到它的改变，调用doc.save方法保存时不会保留这个修改。如果你一定要用JS内建的方法修改Date类型的数据，在保存之前用doc.markModified 方法告诉Mongoose这个改变。
```javascript
var Assignment = mongoose.model('Assignment', { dueDate: Date });
Assignment.findOne(function (err, doc) {
  doc.dueDate.setMonth(3);
  doc.save(callback); // THIS DOES NOT SAVE YOUR CHANGE
  
  doc.markModified('dueDate');
  doc.save(callback); // works
})
```
##### Mixed 混合型
混合型是一种“存啥都行”的数据类型，它的灵活性来自于对可维护性的妥协。Mixed类型用Schema.Types.Mixed 或者一个字面上的空对象{}来定义。下面的定义是等价的：
```javascript
var Any = new Schema({ any: {} });
var Any = new Schema({ any: Object });
var Any = new Schema({ any: Schema.Types.Mixed });
```
因为它是一种无固定模式的类型，所以你可以想怎么改就怎么改，但是Mongoose 没有能力去自动检测和保存这些改动。请通过调用doc.markModified 方法来告诉Mongoose某个混合类型的值被改变了。
```javascript
person.anything = { x: [3, 4, { y: "changed" }] };
person.markModified('anything');
person.save(); // anything will now get saved
```
##### ObjectIds 对象ID型
用Schema.Types.ObjectId 来声明一个对象ID类型。
>  对象ID同MongoDB内置的_id 的类型。由24位Hash字符串。
```javascript
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Car = new Schema({ driver: ObjectId });
// or just Schema.ObjectId for backwards compatibility with v2
```
##### Arrays 数组型
提供创造各种数据类型或子文档的数组的方法。
```javascript
var ToySchema = new Schema({ name: String });
var ToyBox = new Schema({
  toys: [ToySchema],
  buffers: [Buffer],
  string:  [String],
  numbers: [Number]
  // ... etc
});
```
注意：用一个空数组来定义等价于创建一个混合型的数组。下面都是创建混合型数组的例子：
```javascript
var Empty1 = new Schema({ any: [] });
var Empty2 = new Schema({ any: Array });
var Empty3 = new Schema({ any: [Schema.Types.Mixed] });
var Empty4 = new Schema({ any: [{}] });
```
##### Creating Custom Types 创建自定义类型
Mongoose也支持使用自定义的数据类型来拓展功能。从[Mongoose插件](http://plugins.mongoosejs.com/)站搜索合适的类型，比如mongoose-long，mongoose-int32或者其他类型。 想要自己创建类型的话请参考[创建一个基础的自定义数据类型](../custom/custom.md)。
##### 函数 `schema.path()`
`schema.path()`函数返回该数据类型完整描述
```javascript
var sampleSchema = new Schema({ name: { type: String, required: true } });
console.log(sampleSchema.path('name'));
// Output looks like:
/**
 * SchemaString {
 *   enumValues: [],
 *   regExp: null,
 *   path: 'name',
 *   instance: 'String',
 *   validators: ...
 */
```
您可以使用该函数检查给定路径的模式类型，包括它拥有的验证器和类型是什么。
#### 下一节内容
现在我们看完数据类型部分，让我们来看看[模型部分](../../2.models/models.md)。


