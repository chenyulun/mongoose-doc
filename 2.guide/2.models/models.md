### Models(模型)
模型是由我们的模式定义编译的高级构造函数。这些模型的实例表示可以从我们的数据库中保存和检索的文档。所有从数据库创建和检索的文档都是由这些模型处理的。

##### 编写你的第一个模型
```javascript
var schema = new mongoose.Schema({ name: 'string', size: 'string' });
var Tank = mongoose.model('Tank', schema);
```
第一个参数是您的模型所使用的集合的唯一名称。Mongoose自动寻找你的模型名的复数版本(数据库存储的集合为tanks)。因此，对于上面的示例，model Tank是用于数据库中的tanks集合。.model()函数产生一个模式的副本。确保您在调用.model()之前已经添加了您想要的所有内容！