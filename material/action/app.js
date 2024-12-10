$(document).foundation();

const ui = new Object();
ui.name = document.getElementById("action-name");
ui.type = document.getElementById("action-type");
ui.tags = [document.getElementById("action-tags-0"), document.getElementById("action-tags-1"), document.getElementById("action-tags-2")];
ui.tags[0].value = "";
ui.tags[1].value = "";
ui.tags[2].value = "";
ui.rule = new Object();
ui.rule.timing = document.getElementById("action-rule-timing");
ui.rule.roll = document.getElementById("action-rule-roll");
ui.rule.target = document.getElementById("action-rule-target");
ui.rule.range = document.getElementById("action-rule-range");
ui.rule.cost = document.getElementById("action-rule-cost");
ui.rule.limit = document.getElementById("action-rule-limit");
ui.effect = document.getElementById("action-effect");
ui.effect.value = "";

const transparentRateButtons = document.getElementById("transparent-rates");
transparentRateButtons.setAttribute("data-transparent-value", "FF");
const colorThemeSelect = document.getElementById("color-theme");
[ui.name, ui.type, ui.tags[0], ui.tags[1], ui.tags[2], ui.rule.timing, ui.rule.roll, ui.rule.target, ui.rule.range, ui.rule.cost, ui.rule.limit, ui.effect, colorThemeSelect].forEach((element) => {
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
	const canvas = document.getElementById("action-frame");
	const context = canvas.getContext("2d");
	const colorTheme = colorThemes[colorThemeSelect.value];
	const contents = new Object();

	contents.name = ui.name.value;
	contents.type = ui.type.value;
	contents.tags = [ui.tags[0].value, ui.tags[1].value, ui.tags[2].value];
	contents.rules = [];
	if (ui.rule.timing.value) {
		contents.rules.push({ name: "タイミング", value: ui.rule.timing.value });
	}
	if (ui.rule.roll.value) {
		contents.rules.push({ name: "判定", value: ui.rule.roll.value });
	}
	if (ui.rule.target.value) {
		contents.rules.push({ name: "対象", value: ui.rule.target.value });
	}
	if (ui.rule.range.value) {
		contents.rules.push({ name: "射程", value: ui.rule.range.value });
	}
	if (ui.rule.cost.value) {
		contents.rules.push({ name: "コスト", value: ui.rule.cost.value });
	}
	if (ui.rule.limit.value) {
		contents.rules.push({ name: "制限", value: ui.rule.limit.value });
	}
	contents.effect = ui.effect.value;

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

	//name
	context.font = font(24, true);
	context.fillStyle = "#FFFFFF";
	context.textBaseline = "top";
	context.textAlign = "left";
	context.fillText(contents.name, 8, 8, 250);

	//type
	if (contents.type) {
		context.font = font(24, true);
		context.fillStyle = "#FFFFFF";
		context.textBaseline = "top";
		context.textAlign = "center";
		context.fillText(contents.type, 250 + 6 + 68, 8, 150 - 16);
		context.strokeStyle = "#FFFFFF";
		context.lineWidth = 2;
		context.strokeRect(250 + 6, 6, 150 - 12, 40 - 12);
	}

	//tags
	createRoundRectPath(context, 8, 40, 124, 30, 8);
	context.font = font(22, false);
	context.textBaseline = "middle";
	context.textAlign = "center";
	if (contents.tags[0]) {
		context.fillStyle = "#FFFFFF";
		context.fill();
		context.fillStyle = "#000000";
		context.fillText(contents.tags[0], 8 + 62, 40 + 15, 124);
	} else {
		context.fillStyle = "#B4B4B4";
		context.fill();
	}
	createRoundRectPath(context, 8 + 128 + 2, 40, 124, 30, 8);
	if (contents.tags[1]) {
		context.fillStyle = "#FFFFFF";
		context.fill();
		context.fillStyle = "#000000";
		context.fillText(contents.tags[1], 8 + 128 + 2 + 62, 40 + 15, 124);
	} else {
		context.fillStyle = "#B4B4B4";
		context.fill();
	}
	createRoundRectPath(context, 8 + 128 * 2 + 4, 40, 124, 30, 8);
	if (contents.tags[2]) {
		context.fillStyle = "#FFFFFF";
		context.fill();
		context.fillStyle = "#000000";
		context.fillText(contents.tags[2], 8 + 128 * 2 + 4 + 62, 40 + 15, 124);
	} else {
		context.fillStyle = "#B4B4B4";
		context.fill();
	}

	//inner
	context.fillStyle = "#FFFFFF" + colorTheme.transparent;
	context.fillRect(2, 80, 400 - 4, height - 80 - 2);

	//rules
	context.font = font(18);
	let currentY = 84;
	for (let index = 0; index < contents.rules.length; index++, currentY += 30) {
		const rule = contents.rules[index];

		context.strokeStyle = "#626262";
		context.lineWidth = 1;
		createRoundRectPath(context, 8, currentY, 400 - 16, 24, 8);
		context.stroke();
		context.textAlign = "left";
		context.textBaseline = "middle";
		context.fillStyle = "#000000";
		context.fillText(rule.value, 120 + 8, currentY + 12, 280 - 20);

		context.textAlign = "center";
		context.textBaseline = "middle";
		context.fillStyle = "#626262";
		context.fillRect(7, currentY - 1, 120 - 2, 26);
		context.fillStyle = "#FFFFFF";
		context.fillText(rule.name, 8 + 60 - 4, currentY + 12, 120 - 16);
	}

	//effect mark
	const maxRowCount = 20;
	const fontWidth = (400 - 16) / maxRowCount;
	context.fillStyle = "#B8B8B8";
	context.beginPath();
	context.moveTo(8, currentY + 4);
	context.lineTo(8, currentY + 4 + fontWidth);
	context.lineTo(24, currentY + 4 + fontWidth / 2);
	context.closePath();
	context.fill();

	//effect
	context.fillStyle = "#000000";
	context.font = font(fontWidth, true);
	context.textBaseline = "top";
	context.textAlign = "left";
	context.fillText("効果：", 8 + fontWidth, currentY + 4);

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
			context.fillText(chara, fontWidth * row + 8, (fontWidth + 8) * column + currentY + 4);
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
function calcHeight(contents) {
	const maxRowCount = 20;
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
	return (fontWidth + 8) * (column + 1) + 84 + contents.rules.length * 30 + 4;
}
$("#download").click(function () {
	const canvas = document.getElementById("action-frame");
	var base64 = canvas.toDataURL("image/png");
	const a = document.createElement("a");
	document.body.appendChild(a);
	a.download = "action.png";
	a.href = base64;
	a.click();
	a.remove();
	URL.revokeObjectURL(base64);
});
$("#download-txt").click(function () {
	if (navigator.clipboard) {
		try {
			let text = `《${ui.name.value}》`;
			if (ui.type.value) {
				text += `[${ui.type.value}]`;
			}
			ui.tags.forEach((element) => {
				if (element.value) {
					text += `[${element.value}]`;
				}
			});
			if (ui.rule.timing.value) {
				text += ` タイミング：${ui.rule.timing.value}`;
			}
			if (ui.rule.roll.value) {
				text += ` 判定：${ui.rule.roll.value}`;
			}
			if (ui.rule.target.value) {
				text += ` 対象：${ui.rule.target.value}`;
			}
			if (ui.rule.range.value) {
				text += ` 射程：${ui.rule.range.value}`;
			}
			if (ui.rule.cost.value) {
				text += ` コスト：${ui.rule.cost.value}`;
			}
			if (ui.rule.limit.value) {
				text += ` 制限：${ui.rule.limit.value}`;
			}
			text += ` 効果：${ui.effect.value}`;
			navigator.clipboard.writeText(text);
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
