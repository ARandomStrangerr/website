// set the dot to the money text
for (let moneyText of document.querySelectorAll('.money-text')) {
	let text = moneyText.innerText;
	for (let i=text.length-3; i>=2; i=i-3){
		moneyText.innerText = text.slice(0, i)+ "," +text.slice(i);
	}
}

// image slideshow
for (let imageSlideshowItem of document.querySelectorAll('.image-slideshow-item')) {
	imageSlideshowItem.onclick = () => {
		let imageDisplay = document.querySelector('.image-display');
		let img = imageSlideshowItem.children[0].cloneNode();
		imageDisplay.replaceChild(img, imageDisplay.children[0]);
	}	
}
