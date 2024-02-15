const imageSlideshow = document.querySelector("#image-slideshow");
const bigImageContainer = document.querySelector("#image-container");
const addImageButton = document.querySelector("#add-image-button");
addImageButton.addEventListener("click", addImageOnClickEvent);

function addImageOnClickEvent() {
	let fileInput = document.createElement("input");
	fileInput.type="file";
	fileInput.onchange = () => {
		let [file] = fileInput.files;
		let imageContainer = document.createElement("div");
		let image = document.createElement("img");
		imageSlideshow.appendChild(imageContainer);
		imageContainer.appendChild(image);
		imageContainer.classList.add("small-item-image-container");
		image.src = URL.createObjectURL(file);
		imageContainer.addEventListener("click", () => {
			let displayImage = image.cloneNode();
			displayImage.classList.add("small-item-image-container");
			try{
				bigImageContainer.replaceChild(displayImage, bigImageContainer.children[0]);
			}catch(e){
				bigImageContainer.appendChild(displayImage);
			}
		});
	}
	fileInput.click();
}
