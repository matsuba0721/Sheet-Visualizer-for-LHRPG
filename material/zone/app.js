$(document).foundation();

const areaNameInput = document.getElementById("area-name");
areaNameInput.value = "呼び声の砦";
const serverNameTextArea = document.getElementById("server-name");
serverNameTextArea.value = "日本サーバー";
const zoneNameTextArea = document.getElementById("zone-name");
zoneNameTextArea.value = "シブヤの街";
const propInfoTextArea = document.getElementById("prop-info");
propInfoTextArea.value = "フィールド / モンスター出現あり";
const otherInfoTextArea = document.getElementById("other-info");
otherInfoTextArea.value = "戦闘行為可能区域\n全特技使用可能\n侵入許可 / 無制限\n退出許可 / 無制限";
const eventInfoInput = document.getElementById("event-info");
eventInfoInput.value = "現在発生中のイベントはありません";
const transparentRateButtons = document.getElementById("transparent-rates");
transparentRateButtons.setAttribute("data-transparent-value", "C0");
const colorThemeSelect = document.getElementById("color-theme");
[areaNameInput, serverNameTextArea, zoneNameTextArea, propInfoTextArea, otherInfoTextArea, eventInfoInput, colorThemeSelect].forEach((element) => {
	element.addEventListener("change", (event) => {
		draw();
	});
});
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
	accentPrimary: "#A87043",
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

drawBackground();
draw();

function drawBackground() {
	const canvas = document.getElementById("area-frame-background");
	const context = canvas.getContext("2d");
	context.fillStyle = "#FFFFFF";
	context.fillRect(0, 0, 410, 800);
	context.fillStyle = "#808080";
	for (let x = 0; x < 41; x++) {
		for (let y = 0; y < 80; y++) {
			if ((x + y) % 2) {
				context.fillRect(x * 10, y * 10, 10, 10);
			}
		}
	}
}
function draw() {
	const canvas = document.getElementById("area-frame");
	const context = canvas.getContext("2d");
	const colorTheme = colorThemes[colorThemeSelect.value];
	const contents = new Object();
	contents.name = areaNameInput.value;
	contents.items = [];
	if (serverNameTextArea.value.length > 0) {
		contents.items.push({ name: "サーバー", values: serverNameTextArea.value.split("\n") });
	}
	if (zoneNameTextArea.value.length > 0) {
		contents.items.push({ name: "ゾーン", values: zoneNameTextArea.value.split("\n") });
	}
	if (propInfoTextArea.value.length > 0) {
		contents.items.push({ name: "区分", values: propInfoTextArea.value.split("\n") });
	}
	if (otherInfoTextArea.value.length > 0) {
		contents.items.push({ name: "その他", values: otherInfoTextArea.value.split("\n") });
	}
	if (eventInfoInput.value.length > 0) {
		contents.items.push({ name: "イベント", values: eventInfoInput.value.split("\n") });
	}

	contents.height = 0;
	contents.items.forEach((item) => {
		contents.height += 18;
		item.values.forEach((value) => {
			contents.height += 26;
		});
		contents.height += 8;
	});
	canvas.height = contents.height + 186;

	colorTheme.transparent = transparentRateButtons.getAttribute("data-transparent-value");

	drawFrame(context, colorTheme, contents);
}

function drawForeground(canvas, info) {
	const context = canvas.getContext("2d");
	context.font = 'bold 36px "游明朝体", "Yu Mincho", YuMincho, "ヒラギノ明朝 Pro", "Hiragino Mincho Pro", "MS P明朝", "MS PMincho", serif';
	context.fillStyle = "#EEEEEE";
	context.textBaseline = "top";
	context.textAlign = "center";
	context.fillText(info.area, 225, 54, 226);
	context.font = 'bold 18px "游明朝体", "Yu Mincho", YuMincho, "ヒラギノ明朝 Pro", "Hiragino Mincho Pro", "MS P明朝", "MS PMincho", serif';
	context.textAlign = "left";
	context.fillText(info.server, 100, 153, 268);
	context.fillText(info.zone, 100, 207, 268);
	context.fillText(info.prop, 100, 259, 268);
	for (let index = 0; index < info.others.length; index++) {
		const other = info.others[index];
		context.fillText(other, 100, 312 + index * 25, 268);
	}
}

function drawFrame(context, colorTheme, contents) {
	drawFrameBackground(context, colorTheme, contents);
	drawHeaderBackground(context, colorTheme);
	drawAccessory(context, colorTheme);
	drawEarthMark(context, colorTheme);
	drawCloseMark(context, colorTheme);
	context.font = 'bold 36px "游明朝体", "Yu Mincho", YuMincho, "ヒラギノ明朝 Pro", "Hiragino Mincho Pro", "MS P明朝", "MS PMincho", serif';
	context.fillStyle = "#EEEEEE";
	context.textBaseline = "top";
	context.textAlign = "center";
	context.fillText(contents.name, 225, 54, 226);

	let posision = { x: 0, y: 138 };
	context.translate(posision.x, posision.y);
	const shift = function (y) {
		context.translate(0, y);
		posision.y += y;
	};
	contents.items.forEach((item) => {
		drawLabel(context, colorTheme);
		drawLabelText(context, colorTheme, item.name, { x: 98, y: 2 });
		shift(18);

		item.values.forEach((value) => {
			drawPropertyText(context, colorTheme, value, { x: 98, y: 2 }, 264);
			shift(26);
		});
		shift(8);
	});

	shift(-93);
	drawFooterBackground(context, colorTheme);
	drawAccessory(context, colorTheme);
	context.font = "19px candara";
	context.fillStyle = colorTheme.base;
	context.textBaseline = "top";
	context.textAlign = "left";
	context.fillText("ZONE", 87, 112);
	context.translate(-posision.x, -posision.y);
}
function drawFrameBackground(context, colorTheme, contents) {
	context.strokeStyle = colorTheme.base;
	context.lineWidth = 1.5;
	context.beginPath();
	context.moveTo(64, 1);
	context.lineTo(1, 64);
	context.lineTo(40, 103);
	context.lineTo(30, 113);
	context.lineTo(66, 148);
	context.lineTo(66, contents.height + 116);
	context.lineTo(31, contents.height + 151);
	context.lineTo(31, contents.height + 151);
	context.lineTo(65, contents.height + 185);
	context.lineTo(70, contents.height + 180);
	context.lineTo(143, contents.height + 180);
	context.lineTo(161, contents.height + 162);
	context.lineTo(363, contents.height + 162);
	context.lineTo(380, contents.height + 179);
	context.lineTo(408, contents.height + 151);
	context.lineTo(382, contents.height + 125);
	context.lineTo(382, 132);
	context.lineTo(408, 106);
	context.lineTo(342, 40);
	context.lineTo(103, 40);
	context.lineTo(64, 1);
	context.stroke();

	context.fillStyle = colorTheme.mainSecondary + colorTheme.transparent;
	context.beginPath();
	context.moveTo(210, 130);
	context.lineTo(64, 1);
	context.lineTo(1, 64);
	context.lineTo(40, 103);
	context.lineTo(30, 113);
	context.lineTo(66, 148);
	context.lineTo(66, contents.height + 116);
	context.lineTo(31, contents.height + 151);
	context.lineTo(31, contents.height + 151);
	context.lineTo(65, contents.height + 185);
	context.lineTo(70, contents.height + 180);
	context.lineTo(143, contents.height + 180);
	context.lineTo(161, contents.height + 162);
	context.lineTo(363, contents.height + 162);
	context.lineTo(380, contents.height + 179);
	context.lineTo(408, contents.height + 151);
	context.lineTo(382, contents.height + 125);
	context.lineTo(382, 132);
	context.lineTo(408, 106);
	context.lineTo(342, 40);
	context.lineTo(103, 40);
	context.lineTo(64, 1);
	context.fill();

	context.strokeStyle = colorTheme.base;
	context.lineWidth = 1;
	context.beginPath();
	context.moveTo(83, 130);
	context.lineTo(72, 141);
	context.lineTo(72, contents.height + 117);
	context.lineTo(83, contents.height + 117 + 11);
	context.stroke();
	context.beginPath();
	context.moveTo(375.5 - 11, 130);
	context.lineTo(375.5, 141);
	context.lineTo(375.5, contents.height + 117);
	context.lineTo(375.5 - 11, contents.height + 117 + 11);
	context.stroke();
}
function drawHeaderBackground(context, colorTheme) {
	context.fillStyle = colorTheme.mainPrimary + colorTheme.transparent;
	context.beginPath();
	context.moveTo(63, 64);
	context.lineTo(8, 64);
	context.lineTo(63.5, 8.5);
	context.lineTo(102, 46);
	context.lineTo(102, 113);
	context.lineTo(90.5, 113);
	context.lineTo(63.5, 140);
	context.lineTo(36, 113);
	context.lineTo(47, 103);
	context.lineTo(8, 64);
	context.fill();
	context.fillRect(102, 46, 240, 67);
	context.beginPath();
	context.moveTo(342, 46);
	context.lineTo(404.5, 106);
	context.lineTo(380.5, 130);
	context.lineTo(363.5, 113);
	context.lineTo(342, 113);
	context.fill();
}
function drawFooterBackground(context, colorTheme) {
	context.fillStyle = colorTheme.mainPrimary + colorTheme.transparent;
	context.beginPath();
	context.moveTo(36, 107);
	context.lineTo(63.5, 78);
	context.lineTo(85, 101);
	context.lineTo(159, 101);
	context.lineTo(159, 113);
	context.lineTo(141, 131);
	context.lineTo(68, 131);
	context.lineTo(63.5, 135.5);
	context.fill();
	context.fillRect(159, 101, 205, 12);
	context.beginPath();
	context.moveTo(363.5, 101);
	context.lineTo(380.5, 84);
	context.lineTo(403, 106.5);
	context.lineTo(380.5, 130);
	context.lineTo(363.5, 113);
	context.fill();
}
function drawAccessory(context, colorTheme) {
	context.strokeStyle = colorTheme.accentPrimary;
	context.lineWidth = 5;
	context.beginPath();
	context.moveTo(45, 105.5);
	context.lineTo(63.5, 87);
	context.lineTo(80, 105.5);
	context.lineTo(80 + 295, 105.5);
	context.stroke();
	context.beginPath();
	context.moveTo(373, 106);
	context.lineTo(380, 99);
	context.lineTo(387, 106);
	context.lineTo(380, 113);
	context.lineTo(373, 106);
	context.stroke();

	context.strokeStyle = colorTheme.accentSecondary;
	context.beginPath();
	context.moveTo(63.5, 103.0);
	context.lineTo(75.0, 115.0);
	context.lineTo(63.5, 126.5);
	context.lineTo(52.0, 115.0);
	context.lineTo(63.5, 103.0);
	context.lineTo(75.0, 115.0);
	context.stroke();

	context.strokeStyle = colorTheme.base;
	context.beginPath();
	context.moveTo(387, 97.5);
	context.lineTo(395.5, 106.0);
	context.lineTo(387, 114.5);
	context.stroke();
}
function drawEarthMark(context, colorTheme) {
	let size = 72;
	const lineargradient = context.createLinearGradient(0 - size / 2, 0 - size / 2, size, size);
	lineargradient.addColorStop(0, colorTheme.base);
	lineargradient.addColorStop(0.5, colorTheme.accentPrimary);
	context.fillStyle = lineargradient;
	context.rotate(Math.PI / 4);
	const posision = { x: 90, y: 0 };
	context.translate(posision.x, posision.y);
	context.fillRect(0 - size / 2, 0 - size / 2, size, size);
	size -= 10;
	context.clearRect(0 - size / 2, 0 - size / 2, size, size);
	context.fillStyle = colorTheme.mainPrimary + colorTheme.transparent;
	context.fillRect(0 - size / 2, 0 - size / 2, size, size);
	context.translate(-posision.x, -posision.y);
	context.rotate(-Math.PI / 4);

	context.strokeStyle = colorTheme.earthMark;
	context.lineWidth = 5;
	context.beginPath();
	context.arc(63, 64, 24, 0, 2 * Math.PI);
	context.stroke();
	context.beginPath();
	context.arc(97, 64, 24 * 1.8, 2.55, 3.7);
	context.stroke();
	context.beginPath();
	context.arc(30, 64, 24 * 1.8, 2.55 + Math.PI, 3.7 + Math.PI);
	context.stroke();
	context.beginPath();
	context.arc(63, 10, 24 * 1.8, 1.1, 2.0);
	context.stroke();
	context.beginPath();
	context.arc(63, 10, 24 * 1.8, 1.1, 2.0);
	context.stroke();
	context.beginPath();
	context.arc(63, 118, 24 * 1.8, 1.1 + Math.PI, 2.0 + Math.PI);
	context.stroke();
	context.beginPath();
	context.moveTo(63 - 23, 64);
	context.lineTo(63 + 23, 64);
	context.stroke();
}
function drawCloseMark(context, colorTheme) {
	context.strokeStyle = colorTheme.base;
	context.lineWidth = 2;
	context.beginPath();
	context.arc(360.5, 52.5, 15.5, 0, 2 * Math.PI);
	context.stroke();
	context.lineWidth = 1;
	context.beginPath();
	context.arc(360.5, 52.5, 10.5, 0, 2 * Math.PI);
	context.stroke();
	context.lineWidth = 6;
	context.beginPath();
	context.moveTo(352.5, 44.5);
	context.lineTo(367.5, 59.5);
	context.stroke();
	context.beginPath();
	context.moveTo(352.5, 59.5);
	context.lineTo(367.5, 44.5);
	context.stroke();
}
function drawLabel(context, colorTheme) {
	context.translate(84, 0);
	context.strokeStyle = colorTheme.brackets;
	context.lineWidth = 3.5;
	context.beginPath();
	context.moveTo(8, 2);
	context.lineTo(2, 8);
	context.lineTo(8, 14);
	context.stroke();
	context.beginPath();
	context.arc(8.5, 8, 0.5, 0, 2 * Math.PI);
	context.stroke();
	context.beginPath();
	context.moveTo(66.5, 2);
	context.lineTo(72.5, 8);
	context.lineTo(66.5, 14);
	context.stroke();
	context.beginPath();
	context.arc(66.5, 8, 0.5, 0, 2 * Math.PI);
	context.stroke();
	context.translate(-84, 0);
}
function drawLabelText(context, colorTheme, text, offset, maxWidth) {
	context.font = 'bold 11px "游明朝体", "Yu Mincho", YuMincho, "ヒラギノ明朝 Pro", "Hiragino Mincho Pro", "MS P明朝", "MS PMincho", serif';
	context.fillStyle = colorTheme.base;
	context.textBaseline = "top";
	context.textAlign = "left";
	context.fillText(text, offset.x, offset.y, maxWidth);
}
function drawPropertyText(context, colorTheme, text, offset, maxWidth) {
	context.font = 'bold 18px "游明朝体", "Yu Mincho", YuMincho, "ヒラギノ明朝 Pro", "Hiragino Mincho Pro", "MS P明朝", "MS PMincho", serif';
	context.fillStyle = colorTheme.base;
	context.textBaseline = "top";
	context.textAlign = "left";
	context.fillText(text, offset.x, offset.y, maxWidth);
}
$("#download").click(function () {
	const canvas = document.getElementById("area-frame");
	var base64 = canvas.toDataURL("image/png");
	const a = document.createElement("a");
	document.body.appendChild(a);
	a.download = "zone.png";
	a.href = base64;
	a.click();
	a.remove();
	URL.revokeObjectURL(base64);
});
