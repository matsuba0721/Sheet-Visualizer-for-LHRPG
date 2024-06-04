$(document).foundation();

const imagePath = "zoneBackground.png";
drawBackground(document.getElementById("zone-background-layer"), imagePath).then((canvas) => {
	const foregroundLayer = document.getElementById("zone-foreground-layer");
	foregroundLayer.width = canvas.width;
	foregroundLayer.height = canvas.height;
});
const serverNameInput = document.getElementById("server-name");
const zoneNameInput = document.getElementById("zone-name");
const areaNameInput = document.getElementById("area-name");
const otherNameInputs = [document.getElementById("other-name-0"), document.getElementById("other-name-1"), document.getElementById("other-name-2"), document.getElementById("other-name-3")];
[serverNameInput, zoneNameInput, areaNameInput].concat(otherNameInputs).forEach((input) => {
	input.addEventListener("change", (event) => {
		const info = getZoneInfo();
		const foregroundLayer = document.getElementById("zone-foreground-layer");
		const context = foregroundLayer.getContext("2d");
		context.clearRect(0, 0, foregroundLayer.width, foregroundLayer.height);
		drawForeground(foregroundLayer, info);
	});
});
function getZoneInfo() {
	return {
		server: serverNameInput.value,
		zone: zoneNameInput.value,
		area: areaNameInput.value,
		others: [otherNameInputs[0].value, otherNameInputs[1].value, otherNameInputs[2].value, otherNameInputs[3].value],
	};
}
async function drawBackground(canvas, imagePath) {
	return new Promise((resolve) => {
		const image = new Image();
		image.addEventListener("load", function () {
			canvas.width = image.naturalWidth;
			canvas.height = image.naturalHeight;
			const ctx = canvas.getContext("2d");
			ctx.drawImage(image, 0, 0);
			resolve(canvas);
		});
		image.src = imagePath;
	});
}
function drawForeground(canvas, info) {
	const context = canvas.getContext("2d");
	context.font = 'bold 18px "游明朝体", "Yu Mincho", YuMincho, "ヒラギノ明朝 Pro", "Hiragino Mincho Pro", "MS P明朝", "MS PMincho", serif';
	context.fillStyle = "#EEEEEE";
	context.textBaseline = "top";
	context.textAlign = "left";
	context.fillText(info.server, 100, 153, 268);
	context.fillText(info.zone, 100, 207, 268);
	context.fillText(info.area, 100, 259, 268);
	for (let index = 0; index < info.others.length; index++) {
		const other = info.others[index];
		context.fillText(other, 100, 312 + index * 25, 268);
	}
}

$("#download").click(function () {
	drawBackground(document.createElement("canvas"), imagePath).then((canvas) => {
		const info = getZoneInfo();
		drawForeground(canvas, info);
		var base64 = canvas.toDataURL("image/png");
		const a = document.createElement("a");
		document.body.appendChild(a);
		a.download = "zone.png";
		a.href = base64;
		a.click();
		a.remove();
		URL.revokeObjectURL(base64);
	});
});
