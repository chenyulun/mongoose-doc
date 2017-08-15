## 快速开始
始首先确保你有[MongoDB](http://www.mongodb.org/downloads)和[Nodejs](http://nodejs.org/)安装。  
接下来使用命令行中使用npm安装Mongoose:
> $ npm install mongoose  

安装完成后,启动MongoDB服务器，接下来我们需要在我们的项目中引用mongoose,并且使用他链接测试数据库（test）：
```javascript
// getting-started.js
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
```
我们有一个等待连接到本地主机上运行的测试数据库。我们现在需要得到通知如果连接成功或如果出现连接错误:  
```javascript
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  // yay!
  console.log("connected!");
});
```
一旦连接打开时,我们就会调用回调。为了简单起见,我们假设所有代码都在这个回调。  
在mongoose里面，一切都来源于模式(Schema),让我们引用定义我们的小猫:  
```javascript
var kittySchema = mongoose.Schema({
    name: String
})
```
非常好，我们创建了一个模式和一个类型为<code>String</code>的属性<code>name</code>，下一步是模式编译成一个模型：
```javascript
var Kitten = mongoose.model('Kitten', kittySchema);
```
然后我们开始实例化一个猫的实例
```javascript
let silence = new Kitten({ name: 'Silence' });
	console.log(silence.name);// 'Silence'
```
上面只定义了实例的名称，我们在给这个模式添加一个<code>speak</code>方法：
```javascript
	kittySchema.methods.speak = function () {
		let greeting = this.name
			? "Meow name is " + this.name
			: "I don't have a name";
		console.log(greeting);
	};
```
再重新实例化一个实例并执行我们刚刚添加的方法
```javascript
let fluffy = new Kitten({ name: 'fluffy' });
fluffy.speak(); // "Meow name is fluffy"
```
上面的实例化的数据只会在缓存里面，我们需要把这些数据存储在我们刚才链接的数据库里面，代码如下(官方文档代码有问题,请直接看代码)：  
```javascript
	let fluffySave = fluffy.save();
	fluffySave.then(fluffy => {
		fluffy.speak();
	},console.error);
```
现在的save方法返回的是一个promise对象，需要用promise方式操作，如果控制台报了错误：
> (node:24341) DeprecationWarning: Mongoose: mpromise (mongoose's default promise library) is deprecated, plug in your own promise library instead: http://mongoosejs.com/docs/promises.html

请在加载mongoose后面添加
```javascript
mongoose.Promise = global.Promise;
```
如果上面的代码运行执行了speak方法说明我们存储到数据库数据成功了，<code>Tips</code>可以打开mongoDB命令行:
```
> use test
switched to db test
db.kittens.find() //这里用的是kittens，mongoose.model方法传入的第一个参数的复数
[ { _id: 59928612805a765efe997251, name: 'fluffy', __v: 0 } ]
```
接着我们在下面的代码查找我们刚才存入的数据：
```javascript
let KittenFind = Kitten.find();
	KittenFind.then(kittens => {
		console.log(kittens);
		// [ { _id: 59928612805a765efe997251, name: 'fluffy', __v: 0 } ]
	},console.error);
```
当然我们可以在find方法里面传入参数来控制查询参数，比如：
```javascript
Kitten.find({ name: /^Fluff/ });//输出为空数组[],应为找不到指定名称的数据
```
#### 恭喜你
学到这里的时候，我们的快速开始教程已经结束了，我们在这个案例中创建了一个模式，添加了一个自定义的文档方法，并且使用mongoose保存再MongoDB中，接下来你可以继续阅读API文档及其他更高级的应用了。