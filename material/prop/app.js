$(document).foundation();

const ui = new Object();
ui.name = document.getElementById("prop-name");
ui.name.value = "一般地形";
ui.image = document.getElementById("prop-image");
ui.imageFile = null;
ui.tags = [document.getElementById("prop-tags-0"), document.getElementById("prop-tags-1"), document.getElementById("prop-tags-2")];
ui.tags[0].value = "地形";
ui.tags[1].value = "出自可変";
ui.tags[2].value = "";
ui.roll = new Object();
ui.roll.detection = document.getElementById("prop-roll-detection");
ui.roll.detection.value = "自動";
ui.roll.analyze = document.getElementById("prop-roll-analyze");
ui.roll.analyze.value = "自動";
ui.roll.release = document.getElementById("prop-roll-release");
ui.roll.release.value = "不可";
ui.effect = document.getElementById("prop-effect");
ui.effect.value = "何の効果もない地形。特にシナリオで記載されない限り、全てのＳｑには【一般地形】が存在する。\n荒れ地や草原、街中の石畳や、ダンジョンや屋内の床などをあらわす。";

const transparentRateButtons = document.getElementById("transparent-rates");
transparentRateButtons.setAttribute("data-transparent-value", "FF");
const colorThemeSelect = document.getElementById("color-theme");
[ui.name, ui.tags[0], ui.tags[1], ui.tags[2], ui.roll.detection, ui.roll.analyze, ui.roll.release, ui.effect, colorThemeSelect].forEach((element) => {
	element.addEventListener("change", (event) => {
		draw();
	});
});
ui.image.addEventListener(
	"change",
	function (e) {
		ui.imageFile = null;
		const file = e.target.files[0];
		console.log(file);
		if (file) {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = function () {
				const dataUrl = reader.result;
				const img = new Image();
				img.src = dataUrl;
				img.onload = function () {
					ui.imageFile = img;
					draw();
				};
			};
		} else {
			draw();
		}
	},
	false
);
Array.from(document.getElementById("transparent-rates").children).forEach((button) => {
	button.addEventListener("click", (event) => {
		transparentRateButtons.setAttribute("data-transparent-value", event.target.value);
		Array.from(document.getElementById("transparent-rates").children).forEach((ele) => ele.classList.add("hollow"));
		event.target.classList.remove("hollow");
		draw();
	});
});
const colorThemes = new Object();
colorThemes.default = {
	mainPrimary: "#000000",
	mainSecondary: "#808080",
	accentPrimary: "#000000",
	accentSecondary: "#EFFF66",
	base: "#EEEEEE",
	earthMark: "#A5E2E3",
	brackets: "#00ADAD",
};
colorThemes.guardianSilver = {
	mainPrimary: "#000000",
	mainSecondary: "#808080",
	accentPrimary: "#92A2B3",
	accentSecondary: "#EFFF66",
	base: "#EEEEEE",
	earthMark: "#A5E2E3",
	brackets: "#00ADAD",
};
colorThemes.samuraiBlood = {
	mainPrimary: "#000000",
	mainSecondary: "#808080",
	accentPrimary: "#972E2E",
	accentSecondary: "#EFFF66",
	base: "#EEEEEE",
	earthMark: "#A5E2E3",
	brackets: "#00ADAD",
};
colorThemes.monkFire = {
	mainPrimary: "#000000",
	mainSecondary: "#808080",
	accentPrimary: "#E5623E",
	accentSecondary: "#EFFF66",
	base: "#EEEEEE",
	earthMark: "#A5E2E3",
	brackets: "#00ADAD",
};
colorThemes.clericGold = {
	mainPrimary: "#000000",
	mainSecondary: "#808080",
	accentPrimary: "#B59E54",
	accentSecondary: "#EFFF66",
	base: "#EEEEEE",
	earthMark: "#A5E2E3",
	brackets: "#00ADAD",
};
colorThemes.druidMoss = {
	mainPrimary: "#000000",
	mainSecondary: "#808080",
	accentPrimary: "#79853C",
	accentSecondary: "#EFFF66",
	base: "#EEEEEE",
	earthMark: "#A5E2E3",
	brackets: "#00ADAD",
};
colorThemes.priestObsidian = {
	mainPrimary: "#000000",
	mainSecondary: "#808080",
	accentPrimary: "#4B4268",
	accentSecondary: "#EFFF66",
	base: "#EEEEEE",
	earthMark: "#A5E2E3",
	brackets: "#00ADAD",
};
colorThemes.assassinAsh = {
	mainPrimary: "#000000",
	mainSecondary: "#808080",
	accentPrimary: "#555752",
	accentSecondary: "#EFFF66",
	base: "#EEEEEE",
	earthMark: "#A5E2E3",
	brackets: "#00ADAD",
};
colorThemes.swashbucklerSky = {
	mainPrimary: "#000000",
	mainSecondary: "#808080",
	accentPrimary: "#53A5C5",
	accentSecondary: "#EFFF66",
	base: "#EEEEEE",
	earthMark: "#A5E2E3",
	brackets: "#00ADAD",
};
colorThemes.bardCobalt = {
	mainPrimary: "#000000",
	mainSecondary: "#808080",
	accentPrimary: "#0045B7",
	accentSecondary: "#EFFF66",
	base: "#EEEEEE",
	earthMark: "#A5E2E3",
	brackets: "#00ADAD",
};
colorThemes.sorcererRouge = {
	mainPrimary: "#000000",
	mainSecondary: "#808080",
	accentPrimary: "#AA6DAB",
	accentSecondary: "#EFFF66",
	base: "#EEEEEE",
	earthMark: "#A5E2E3",
	brackets: "#00ADAD",
};
colorThemes.samonerEmerald = {
	mainPrimary: "#000000",
	mainSecondary: "#808080",
	accentPrimary: "#4F7E61",
	accentSecondary: "#EFFF66",
	base: "#EEEEEE",
	earthMark: "#A5E2E3",
	brackets: "#00ADAD",
};
colorThemes.enchanterIris = {
	mainPrimary: "#000000",
	mainSecondary: "#808080",
	accentPrimary: "#8137AF",
	accentSecondary: "#EFFF66",
	base: "#EEEEEE",
	earthMark: "#A5E2E3",
	brackets: "#00ADAD",
};

draw();

function draw() {
	const canvas = document.getElementById("prop-frame");
	const context = canvas.getContext("2d");
	const colorTheme = colorThemes[colorThemeSelect.value];
	const contents = new Object();
	contents.name = ui.name.value;
	contents.tags = [ui.tags[0].value, ui.tags[1].value, ui.tags[2].value];
	contents.detection = ui.roll.detection.value;
	contents.analyze = ui.roll.analyze.value;
	contents.release = ui.roll.release.value;
	contents.effect = ui.effect.value;
	contents.image = ui.imageFile;

	console.log(contents);

	colorTheme.transparent = transparentRateButtons.getAttribute("data-transparent-value");

	canvas.height = calcHeight(contents);
	drawFrame(context, colorTheme, contents);
}

function drawFrame(context, colorTheme, contents) {
	const font = function (size, isBold = false) {
		const fontF = '"游ゴシック体", YuGothic, "游ゴシック Medium", "Yu Gothic Medium", "游ゴシック", "Yu Gothic", sans-serif';
		const bold = isBold ? "bold " : "";
		return `${bold} ${size}px ${fontF}`;
	};
	const height = calcHeight(contents);
	//background
	context.fillStyle = colorTheme.accentPrimary + colorTheme.transparent;
	context.fillRect(0, 0, 400, height);

	//icon
	if (contents.image) {
		context.drawImage(contents.image, 8, 8, 80 - 16, 80 - 16);
		context.clearRect(7, 7, 4, 4);
		context.clearRect(7, 69, 4, 4);
		context.clearRect(69, 69, 4, 4);
		context.clearRect(69, 7, 4, 4);
		context.fillStyle = colorTheme.accentPrimary + colorTheme.transparent;
		context.fillRect(7, 7, 4, 4);
		context.fillRect(7, 69, 4, 4);
		context.fillRect(69, 69, 4, 4);
		context.fillRect(69, 7, 4, 4);
	} else {
		context.clearRect(8, 8, 80 - 16, 80 - 16);
		context.fill();
		context.fillStyle = colorTheme.accentPrimary + colorTheme.transparent;
		drawRoundRectCorner(context, 8, 8, 80 - 16, 80 - 16, 8);
	}

	//icon
	context.strokeStyle = "#FFFFFF";
	context.lineWidth = 2;
	createRoundRectPath(context, 8, 8, 80 - 16, 80 - 16, 8);
	context.stroke();

	//name
	context.font = font(24, true);
	context.fillStyle = "#FFFFFF";
	context.textBaseline = "top";
	context.textAlign = "left";
	context.fillText(contents.name, 80, 8, 400 - 80 - 8);

	//tags
	createRoundRectPath(context, 80, 40, 100, 30, 8);
	context.font = font(24, false);
	context.textBaseline = "middle";
	context.textAlign = "center";
	if (contents.tags[0]) {
		context.fillStyle = "#FFFFFF";
		context.fill();
		context.fillStyle = "#000000";
		context.fillText(contents.tags[0], 80 + 50, 40 + 15, 100);
	} else {
		context.fillStyle = "#B4B4B4";
		context.fill();
	}
	createRoundRectPath(context, 80 + 100 + 8, 40, 100, 30, 8);
	if (contents.tags[1]) {
		context.fillStyle = "#FFFFFF";
		context.fill();
		context.fillStyle = "#000000";
		context.fillText(contents.tags[1], 80 + 100 + 8 + 50, 40 + 15, 100);
	} else {
		context.fillStyle = "#B4B4B4";
		context.fill();
	}
	createRoundRectPath(context, 80 + 100 * 2 + 8 * 2, 40, 100, 30, 8);
	if (contents.tags[2]) {
		context.fillStyle = "#FFFFFF";
		context.fill();
		context.fillStyle = "#000000";
		context.fillText(contents.tags[2], 80 + 100 * 2 + 8 * 2 + 50, 40 + 15, 100);
	} else {
		context.fillStyle = "#B4B4B4";
		context.fill();
	}

	//inner
	context.fillStyle = "#FFFFFF" + colorTheme.transparent;
	context.fillRect(2, 80, 400 - 4, height - 80 - 2);

	//rolls
	context.font = font(24);
	context.textAlign = "center";
	context.textBaseline = "middle";

	context.fillStyle = "#000000";
	context.fillRect(7, 87, 60, 40 - 2);
	context.fillStyle = "#FFFFFF";
	context.fillText("探知", 8 + 29, 88 + 18, 60 - 2);

	context.strokeStyle = "#000000";
	context.lineWidth = 1;
	createRoundRectPath(context, 8, 88, 120, 40 - 4, 8);
	context.stroke();
	context.fillStyle = "#000000";
	context.fillText(contents.detection, 60 + 8 + 29, 88 + 18, 60 - 2);

	context.fillStyle = "#000000";
	context.fillRect(7 + 132, 87, 60, 40 - 2);
	context.fillStyle = "#FFFFFF";
	context.fillText("解析", 8 + 132 + 29, 88 + 18, 60 - 2);

	context.strokeStyle = "#000000";
	context.lineWidth = 1;
	createRoundRectPath(context, 8 + 132, 88, 120, 40 - 4, 8);
	context.stroke();
	context.fillStyle = "#000000";
	context.fillText(contents.analyze, 60 + 8 + 132 + 29, 88 + 18, 60 - 2);

	context.fillStyle = "#000000";
	context.fillRect(7 + 132 * 2, 87, 60, 40 - 2);
	context.fillStyle = "#FFFFFF";
	context.fillText("解除", 8 + 132 * 2 + 29, 88 + 18, 60 - 2);

	context.strokeStyle = "#000000";
	context.lineWidth = 1;
	createRoundRectPath(context, 8 + 132 * 2, 88, 120, 40 - 4, 8);
	context.stroke();
	context.fillStyle = "#000000";
	context.fillText(contents.release, 60 + 8 + 132 * 2 + 29, 88 + 18, 60 - 2);

	//effect mark
	const maxRowCount = 17;
	const fontWidth = (400 - 16) / maxRowCount;
	context.fillStyle = "#B8B8B8";
	context.beginPath();
	context.moveTo(8, 132);
	context.lineTo(8, 156);
	context.lineTo(25, (132 + 156) / 2);
	context.closePath();
	context.fill();

	//effect
	context.fillStyle = "#000000";
	context.font = font(fontWidth, true);
	context.textBaseline = "top";
	context.textAlign = "left";
	context.fillText("効果：", 32, 132);

	context.font = font(fontWidth);
	const effectCharacters = contents.effect.split("");
	for (let index = 0, row = 3, column = 0; index < effectCharacters.length; index++) {
		const chara = effectCharacters[index];
		if (chara == "\n") {
			column += 1;
			row = -1;
		} else {
			column += Math.floor((row + 1) / maxRowCount);
			row = (row + 1) % maxRowCount;
			context.fillText(chara, fontWidth * row + 8, (fontWidth + 8) * column + 132);
		}
	}
}
function createRoundRectPath(context, x, y, w, h, r) {
	context.beginPath();
	context.moveTo(x + r, y);
	context.lineTo(x + w - r, y);
	context.arc(x + w - r, y + r, r, Math.PI * (3 / 2), 0, false);
	context.lineTo(x + w, y + h - r);
	context.arc(x + w - r, y + h - r, r, 0, Math.PI * (1 / 2), false);
	context.lineTo(x + r, y + h);
	context.arc(x + r, y + h - r, r, Math.PI * (1 / 2), Math.PI, false);
	context.lineTo(x, y + r);
	context.arc(x + r, y + r, r, Math.PI, Math.PI * (3 / 2), false);
	context.closePath();
}
function drawRoundRectCorner(context, x, y, w, h, r) {
	context.beginPath();
	context.moveTo(x, y);
	context.lineTo(x, y + r);
	context.arc(x + r, y + r, r, Math.PI, Math.PI * (3 / 2), false);
	context.closePath();
	context.fill();

	context.beginPath();
	context.moveTo(x, y);
	context.lineTo(x, y + r);
	context.arc(x + r, y + r, r, Math.PI, Math.PI * (3 / 2), false);
	context.closePath();
	context.fill();

	context.beginPath();
	context.moveTo(x + w - r, y);
	context.arc(x + w - r, y + r, r, Math.PI * (3 / 2), 0, false);
	context.lineTo(x + w, y);
	context.closePath();
	context.fill();

	context.beginPath();
	context.moveTo(x + w, y + h - r);
	context.arc(x + w - r, y + h - r, r, 0, Math.PI * (1 / 2), false);
	context.lineTo(x + w, y + h);
	context.closePath();
	context.fill();

	context.beginPath();
	context.moveTo(x + r, y + h);
	context.arc(x + r, y + h - r, r, Math.PI * (1 / 2), Math.PI, false);
	context.lineTo(x, y + h);
	context.closePath();
	context.fill();
}
function calcHeight(contents) {
	const maxRowCount = 17;
	const fontWidth = (400 - 16) / maxRowCount;
	const effectCharacters = contents.effect.split("");
	let row = 3,
		column = 0;
	for (let index = 0; index < effectCharacters.length; index++) {
		const chara = effectCharacters[index];
		if (chara == "\n") {
			column += 1;
			row = -1;
		} else {
			column += Math.floor((row + 1) / maxRowCount);
			row = (row + 1) % maxRowCount;
		}
	}
	return (fontWidth + 8) * (column + 1) + 132;
}
$("#download").click(function () {
	const canvas = document.getElementById("prop-frame");
	var base64 = canvas.toDataURL("image/png");
	const a = document.createElement("a");
	document.body.appendChild(a);
	a.download = "prop.png";
	a.href = base64;
	a.click();
	a.remove();
	URL.revokeObjectURL(base64);
});
$("#download-txt").click(function () {
	if (navigator.clipboard) {
		try {
			let tags = "";
			ui.tags.forEach((element) => {
				if (element.value) {
					tags += `［${element.value}］`;
				}
			});
			navigator.clipboard.writeText(`${ui.name.value}＿${tags}＿${ui.roll.detection.value}＿${ui.roll.analyze.value}＿${ui.roll.release.value}＿${ui.effect.value}`);
			showAlert("プロップ情報をテキスト化しました。", "green");
		} catch (err) {
			console.log(err);
			showAlert("プロップ情報のテキスト化に失敗しました。", "red");
		}
	}
});

async function wait(timeout) {
	return new Promise((resolve) => setTimeout(resolve, timeout));
}
async function showAlert(content, color = "green") {
	const alertArea = document.getElementById("alert");
	const card = document.createElement("div");
	card.className = "card alert";
	card.style.backgroundColor = "whitesmoke";
	card.style.margin = "5px";
	card.style.borderRadius = "5px";
	card.style.opacity = 0;
	card.style.transform = `translate(300px, 0)`;
	card.style.width = "300px";
	const cardSection = document.createElement("div");
	cardSection.name = "card-section";
	const contentParagraph = document.createElement("p");
	contentParagraph.style.fontSize = "small";
	contentParagraph.innerHTML = content;
	const bar = document.createElement("div");
	bar.style.backgroundColor = color;
	bar.style.width = "100%";
	bar.style.height = "5px";
	alertArea.appendChild(card);
	card.appendChild(cardSection);
	cardSection.appendChild(contentParagraph);
	card.appendChild(bar);
	for (let frame = 0; frame < 90; frame++) {
		await wait(30);
		if (frame <= 5) {
			const rate = Math.sin((Math.PI * frame) / 10);
			card.style.transform = `translate(${(1 - rate) * 300}px, 0)`;
			card.style.opacity = rate;
		} else if (frame > 85) {
			const rate = Math.sin((Math.PI * (frame - 85)) / 10);
			card.style.opacity = 1 - rate;
		} else {
			const rate = 100 * (1 - (frame - 5) / 80);
			bar.style.width = `${Math.round(rate)}%`;
		}
	}
	card.remove();
}
