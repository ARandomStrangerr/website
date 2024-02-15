const expressModule = require('express');
const multerModule = require('multer');
const mongooseModule = require('./MongooseModule.js');
const fs = require("fs");
const expressApplication = expressModule();
const port = 3000;
const assessWithRender = {
	address: "http://localhost:3000"
}
//todo: implement a thread-lock for multi access
let config = JSON.parse(fs.readFileSync("config.txt", "utf8"));

const upload = multerModule({storage: multerModule.memoryStorage()});
expressApplication.use(expressModule.static("views"));
expressApplication.use("/item", expressModule.static("views"));
expressApplication.use(expressModule.json());
expressApplication.use(expressModule.urlencoded({extended: true}));
expressApplication.set('view engine', 'ejs');

// declare path
expressApplication.get('/', homePath);
expressApplication.get('/item/:id', itemPath);
expressApplication.get('/management',managementPath);
expressApplication.get('/management/download-image/:file',downloadImage);
expressApplication.post('/management/upload-item', upload.array("pics"), addItem);
expressApplication.post('/management/update-item/:id', upload.array("pics"), updateItem);
expressApplication.get('/management/get-item/:id',getSpecificItem);
expressApplication.get('/management/get-item-list', getItemList);
expressApplication.delete('/management/delete-item/:id', deleteItem);
expressApplication.get('*',ndePath);

// connect to mongodb
try{
	mongooseModule.connect("mongodb://localhost:27017/database");
} catch (e){
	console.error(e);
	process.exit(0);
}

// start listening to requests
expressApplication.listen(port,	listener);

function listener(){
	console.log(`Currently running at port ${port}`);
}

async function homePath (request, response) {
	let items = await mongooseModule.getItemList(1, 10, ["_id", "name", "price", "img"]);
	response.render('home.ejs', {address: "http://localhost:3000", items});
}

async function itemPath (request, response) {
	let item = await mongooseModule.getItem(request.params.id);
	response.render('item.ejs', {assessWithRender, item});
}

function managementPath(requrest, response){
	response.render("management.ejs");
}

function addItem(request, response){
	let img = [];
	let name = request.body.name;
	let price = request.body.price;
	let unit = request.body.unit;
	let stock = request.body.stock;
	let desc = request.body.desc;
	if (!name || name==="") {
		response.status(400).send("Tên sản phẩm chưa được điền");
		return;
	} else if (!price || price==""){
		response.status(400).send("Giá tiền sản phẩm chưa được điền");
		return;
	} else if (isNaN(price)){
		response.status(400).send("Giá tiền không phải dưới định dạng số");
		return;
	} else if (!unit || unit===""){
		response.status(400).send("Đơn vị tính chưa được điền");
		return;
	} else if (!stock || stock==""){
		response.status(400).send("Số lượng tồn chưa được điền");
		return;
	} else if (isNaN(stock)){
		response.status(400).send("Số lượng tồn không phải dưới định dạng số");
		return;
	} else if (!desc || desc===""){
		response.status(400).send("Miêu tả về sản phẩm chưa được điền");
		return;
	} else if (!request.files || request.files.length === 0) {
		response.status(400).send("Chưa có hình ảnh về sản phẩm");
		return;
	}
	for (let file of request.files){
		let fileName = `${config.fileIndex}.${file.originalname.split(".")[1]}`;
		fs.writeFileSync(`upload-img/${fileName}`, file.buffer);
		img.push(fileName);
		config.fileIndex++;
	}
	mongooseModule.addItem(name,price,unit,stock,desc,img);
	response.send("Thành công nhận dữ liệu");
	fs.writeFile("config.txt", JSON.stringify(config), (error) => {
		if (error) console.log(`cannot write the file due to ${error}`);
	});
	return;
}

async function updateItem(request, response){
	let oldItem = await mongooseModule.getItem(request.params.id);
	for (let i = 0; i<request.body.img.length;i++) { // loop through the name of the images
		for (let j=0; j<oldItem.img.length; j++) // find the current image in the old file name list. 
			if(oldItem.img[j] === request.body.img[i]) oldItem.img.splice(j,1); // if found, remove the name from the old list
		for (let j=0; j<request.files.length; j++){ // find the current image in the list of files send by client
			if (request.files[j].originalname === request.body.img[i]) { // if match, record the file.
				let fileName = `${config.fileIndex}.${request.files[j].originalname.split(".")[1]}`;
				fs.writeFile(`upload-img/${fileName}`,request.files[i].buffer);
				request.body.img[i] = fileName;
				config.fileIndex++;
			}
		}
	}
	for (let fileName of oldItem.img) // loop through the remain name of the old list
		fs.unlink(`upload-img/${fileName}`, (error) => {
			if (error) console.log(`Cannot delete the file ${fileName} due to ${error}`)
		}); // the remain files are deleted in client one.
	response.send(`Updated item with ID ${request.params.id}`);
	console.log(`info: ${request.params.id}\n
		${request.body.name}\n
		${request.body.price}\n
		${request.body.stock}\n
		${request.body.desc}\n
		${request.body.img}`);
	mongooseModule.updateItem(request.params.id, request.body.name, request.body.price, request.body.unit, request.body.stock, request.body.desc, request.body.img);
	return;
}

async function getSpecificItem(request,response){
	response.send(await mongooseModule.getItem(request.params.id));
}

async function getItemList(request,response){
	response.send({
		itemList: await mongooseModule.getItemList(request.query.page, request.query.limit, ["name", "unit", "stock"]),
		totalPage: Math.ceil((await mongooseModule.countItems()).length / request.query.limit)
	});
}

function downloadImage(request,response){
	response.sendFile(`/Users/thanhdo/workplace/project/webpage/upload-img/${request.params.file}`);
}

async function deleteItem(request,response) {
	console.log("delete item ", request.params.id);
	response.status(200).send(`Xoá sản phẩm ${request.params.id}`);
	let item = await mongooseModule.getItem(request.params.id);
	for (let imageName of item.img) {
		fs.unlink(`/Users/thanhdo/workplace/project/webpage/upload-img/${imageName}`, (error) => {
			console.log(`cannot delete file due to: ${error}`);
		});
	}
	mongooseModule.deleteItem(request.params.id);
	return;
}

function ndePath(request, response){
	console.log("path does not exists");
	response.send("this page does not exists");
}
