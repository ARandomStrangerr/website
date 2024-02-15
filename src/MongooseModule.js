const mongooseModule = require("mongoose");

const itemSchematic = new mongooseModule.Schema({
	name: {type:String,required: true},
	price: {type:Number,required: true},
	unit: {type:String,required: true},
	stock: {type:Number,required: true},
	desc: {type:String,required: true},
	img: {type:[String],required: true}
});
const itemModel = mongooseModule.model("Item", itemSchematic);

function connect(uri){
	mongooseModule.connect(uri);
}

function addItem(name, price, unit, stock, desc, img){
	let newItem = new itemModel({
		name:name,
		price:price,
		unit:unit,
		stock:stock,
		desc:desc,
		img:img
	});
	newItem.save();
}

function updateItem (id, name, price, unit, stock, desc, img) {
	itemModel.findByIdAndUpdate(id, {
		name: name,
		price: price,
		unit: unit,
		stock: stock,
		desc: desc,
		img: img
	}).exec();
}

function getItem(id){
	return itemModel.findById(id).exec();
}

function getItemList(page, limit, fields){
	return itemModel.find().skip(page-1).limit(limit).select(fields);
}

function countItems() {
	return itemModel.find();
}

function deleteItem(id){
	itemModel.findByIdAndDelete(id).exec();
}

module.exports = {
	connect: connect,
	addItem: addItem,
	getItem: getItem,
	deleteItem: deleteItem,
	getItemList: getItemList,
	countItems: countItems,
	updateItem: updateItem
};
