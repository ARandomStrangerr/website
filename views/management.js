const url = "http://localhost:3000";

let addNotification = function (msg, style){
	let notificationContainer = document.querySelector("#message-container");
	let container = document.createElement("div");
	container.innerText = msg;
	container.classList.add(style);
	container.onclick = function () {
		container.remove();
	}
	notificationContainer.appendChild(container);
}

let drops = document.querySelectorAll(".drop");
for (let drop of drops){
	drop.addEventListener('click',() => {
		drop.classList.toggle('collapsed');
	});
	for (let selection of drop.querySelectorAll(":nth-child(2) > div")){
		selection.onclick = () => {
			drop.querySelector(":nth-child(1)").innerText = selection.innerText;
		}
	}
}

let addImageFunction = function(imgNode){
	let imgContainer = document.createElement("div");
	imgContainer.appendChild(imgNode);
	imgContainer.addEventListener("click", () => {
		let imgDisplay = imgNode.cloneNode();
		let imgDisplayContainer = document.querySelector("#image-display");
		try{
			imgDisplayContainer.replaceChild(imgDisplay, imgDisplayContainer.children[0]);
		} catch (e){
			imgDisplayContainer.appendChild(imgDisplay);
		}
	});
	let imgDeleteButton = document.createElement("div");
	imgDeleteButton.onclick = () => {
		imgContainer.remove();
	}
	imgContainer.appendChild(imgDeleteButton);
	let imgSlideshow = document.querySelector("#image-slideshow");
	imgSlideshow.appendChild(imgContainer);
}

let getItemList = function (page, limit){
	fetch(`${url}/management/get-item-list?limit=${limit}&page=${page}`)
	.then(async function(response) {
		let returnData = JSON.parse(await response.text());
		let itemList = returnData.itemList;
		document.querySelector("#item-total-page-number").innerText = returnData.totalPage;
		document.querySelector("#item-page-number").value = 1;
		for (let i = 0; i < itemList.length; i++) {
			let numberCell = document.createElement("td");
			numberCell.innerText = limit * (page - 1) + i + 1;
			let idCell = document.createElement("td");
			idCell.innerText = itemList[i]["_id"];
			let nameCell = document.createElement("td");
			nameCell.innerText = itemList[i].name;
			let categoryCell = document.createElement("td");
			categoryCell.innerText = itemList[i].unit;
			let stockCell = document.createElement("td");
			stockCell.innerText = itemList[i].stock;
			let deleteButton = document.createElement("i");
			deleteButton.className = "button red-button";
			let editButton = document.createElement("i");
			editButton.classList.add(["button"]);
			let buttonCell = document.createElement("td");
			buttonCell.appendChild(editButton);
			buttonCell.appendChild(deleteButton);
			let tableRow = document.createElement("tr");
			tableRow.appendChild(numberCell);
			tableRow.appendChild(idCell);
			tableRow.appendChild(nameCell);
			tableRow.appendChild(categoryCell);
			tableRow.appendChild(stockCell);
			tableRow.appendChild(buttonCell);
			deleteButton.onclick = () => {
				fetch(`${url}/management/delete-item/${itemList[i]["_id"]}`,{method:"DELETE"})
				.then(async function (response) {
					addNotification(await response.text(), "green");
				});
				tableRow.remove();
			}
			editButton.onclick = () => {
				fetch(`${url}/management/get-item/${itemList[i]["_id"]}`)
				.then(async function(response) {
					let returnJson = JSON.parse(await response.text());
					document.querySelector("#item-name").value = returnJson.name;
					document.querySelector("#item-unit").value = returnJson.unit;
					document.querySelector("#item-price").value = returnJson.price;
					document.querySelector("#item-stock").value = returnJson.stock;
					for (let item of returnJson.img){
						let img = document.createElement("img");
						img.imageName = item;
						img.src = `${url}/management/download-image/${item}`;
						addImageFunction(img);
					}
					document.querySelector("#add-item-overlay").classList.toggle("hidden");
					document.querySelector("#accept-item-button").onclick = updateItemFunction;
				});
			}
			document.querySelector("#item-table table").appendChild(tableRow);
		}
	});
};

let oldNumberPerPageValue = document.querySelector("#item-per-page-input").value;
document.querySelector("#item-per-page-input").onchange = (event) => {
	if (event.target.value <= 0) {
		addNotification("Number of view items cannot be less than 1", "red");
		event.target.value = oldNumberPerPageValue;
	} else if (event.target.value >=30) {
		addNotification("Number of view items cannot be exceeded 30", "red");
		event.target.value = oldNumberPerPageValue;
	} else {
		getItemList(1, event.target.value);
		oldNumberPerPageValue = event.target.value;
	}
}

document.querySelector("#item-page-number").onchange = (event) => {
	getItemList(event.target.value, oldNumberPerPageValue);
};

document.querySelector("#item-table-refresh-button").onclick = () => {
	let itemTable  = document.querySelector("#item-table table")
	while(itemTable.children.length != 1) itemTable.children[1].remove();
	getItemList(1, oldNumberPerPageValue);
}

document.querySelector("#add-item-button").addEventListener("click", () => {
	document.querySelector("#add-item-overlay").classList.toggle("hidden");
	document.querySelector("#accept-item-button").onclick = uploadNewItemFunction;
});

let addImgButton = document.querySelector("#add-image-button");
addImgButton.addEventListener("click", () => {
	let fileInput = document.createElement("input");
	fileInput.type = "file";
	fileInput.onchange = () => {
		let [file] = fileInput.files;
		let img = document.createElement("img");
		img.src = URL.createObjectURL(file);
		img.originalFile = file;
		addImageFunction(img);
	}
	fileInput.click();
});

document.querySelector("#decline-item-button").addEventListener("click", () => {
	let addItemOverlay = document.querySelector("#add-item-overlay");
	addItemOverlay.classList.toggle("hidden");
	document.querySelector("#item-name").value = "";
	document.querySelector("#item-unit").value = "";
	document.querySelector("#item-stock").value = "";
	document.querySelector("#item-price").value = "";
	document.querySelector("#item-description").value = "";
	let imageDisplay = document.querySelector('#image-display');
	if (imageDisplay.children.length != 0) imageDisplay.children[0].remove();
	let imgSlidshow = document.querySelector("#image-slideshow");
	while (imgSlidshow.children.length != 1) imgSlidshow.children[1].remove();
	document.querySelector("#accept-item-button").onclick = null;
});

let uploadNewItemFunction = function() {
	let itemName = document.querySelector("#item-name").value;
	let itemUnit = document.querySelector("#item-unit").value;
	let itemStock = document.querySelector("#item-stock").value;
	let itemPrice = document.querySelector("#item-price").value;
//	let itemDesc = quill.getContent();
	let imgSlideshow = document.querySelector("#image-slideshow");
	let formData = new FormData();
	formData.append("itemName", itemName);
	formData.append("itemUnit", itemUnit);
	formData.append("itemStock", itemStock);
	formData.append("itemPrice", itemPrice);
//	formData.append("itemDesc", itemDesc);
	for (let i=1;i<imgSlideshow.children.length;i++){
		formData.append("pics", imgSlideshow.children[i].children[0].originalFile);
	}
	let url = 'http://localhost:3000/management/add-item';
	const options = {
  		method: 'POST',
		body: formData
	};
	fetch(url, options).then(async function(response) {
		addNotification(await response.text(), "green");
	}).catch(async function(response){
		addNotification(await response.text(), "red");
	});
};

let updateItemFunction = function() {
	let itemName = document.querySelector("#item-name").value;
	let itemUnit = document.querySelector("#item-unit").value;
	let itemStock = document.querySelector("#item-stock").value;
	let itemPrice = document.querySelector("#item-price").value;
//	let itemDesc = quill.getContent();
	let imgSlideshow = document.querySelector("#image-slideshow");
	
}

document.querySelector("#item-table-refresh-button").click();
