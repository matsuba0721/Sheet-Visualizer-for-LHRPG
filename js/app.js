$(document).foundation();

const characters = new Object();

document.getElementById("link").value = "https://lhrpg.com/lhz/sheets/200446.html";
loadCharactor();
document.getElementById("link").value = "https://lhrpg.com/lhz/sheets/200524.html";
loadCharactor();

// getJson(`https://lhrpg.com/lhz/api/skills.json`, (data) => {
// 	const timings = new Object();
// 	data.skills.forEach((skill) => {
// 		timings[skill.timing] = 1;
// 	});
// 	console.dir(Object.keys(timings));
// });

function getJson(url, func) {
	try {
		var request = new XMLHttpRequest();
		request.ontimeout = function () {
			alert("JSONデータの取得に失敗しました。");
		};
		request.onload = function () {
			var data = this.response;
			func(JSON.parse(data));
		};

		request.open("GET", url, true);
		request.send();
	} catch (err) {
		console.log(err);
		alert("JSONデータの取得に失敗しました。");
	}
}

function loadCharactor() {
	const url = document.getElementById("link").value;
	const id = getCharactorId(url);
	if (id > 0 && id in characters) return;

	getJson(`https://lhrpg.com/lhz/api/${id}.json`, (data) => {
		data.id = id;
		const character = new Object();
		character.data = data;
		character.skillCells = new Object();
		characters[id] = character;
		const panelId = "panel" + id;

		const characterTabs = document.getElementById("character-tabs");
		character.TabTitle = document.createElement("li");
		const characterTablink = document.createElement("a");

		character.TabTitle.className = "tabs-title";
		characterTabs.appendChild(character.TabTitle);

		characterTablink.href = "#" + panelId;
		characterTablink.setAttribute("data-tabs-target", panelId);
		characterTablink.textContent = data.name;
		character.TabTitle.appendChild(characterTablink);

		const characterContents = document.getElementById("character-contents");
		character.TabPanel = document.createElement("div");

		character.TabPanel.className = "callout tabs-panel";
		character.TabPanel.id = panelId;
		characterContents.appendChild(character.TabPanel);

		init(character.TabPanel, data);
		Foundation.reInit("tabs");
		characterTablink.click();
	});
}
function releaseCharacter(id) {
	if (!(id in characters)) return;
	const character = characters[id];
	character.TabTitle.remove();
	character.TabPanel.remove();
	delete characters[id];

	const idList = Object.keys(characters);
	if (idList.length > 0) {
		characters[idList[0]].TabTitle.children[0].click();
	} else {
		$("#howto-label").click();
	}
}
function getCharactorId(url) {
	let result = url.match(/lhrpg.com\/lhz\/pc.*\?id=([0-9]+)/);
	if (result) return parseInt(result[1]);
	result = url.match(/lhrpg.com\/lhz\/sheets\/([0-9]+)/);
	if (result) return parseInt(result[1]);
	return -1;
}
function init(panel, data) {
	displayProfile(panel, data);
	panel.appendChild(document.createElement("hr"));
	displayStatus(panel, data);
	panel.appendChild(document.createElement("hr"));
	displaySkills(panel, data);
}
function displayProfile(panel, data) {
	const commandCell = createCellElement();
	const ccforiaLink = createSuccessButton();
	const closebButton = createCloseButton();

	ccforiaLink.href = "javascript:void(0);";
	ccforiaLink.setAttribute("onclick", `ExportCcforia(${data.id});`);
	ccforiaLink.innerText = "CCFORIA(仮)";
	ccforiaLink.style.float = "right";
	ccforiaLink.style.color = "whitesmoke";
	ccforiaLink.style.fontWeight = "bold";
	ccforiaLink.style.margin = "4em 1.5em 0 0";

	closebButton.href = "javascript:void(0);";
	closebButton.setAttribute("onclick", `releaseCharacter(${data.id});`);

	panel.appendChild(commandCell);
	commandCell.appendChild(closebButton);
	commandCell.appendChild(ccforiaLink);

	const profileCell = createCellElement();
	const profileImage = document.createElement("img");
	profileImage.src = data.image_url;
	profileImage.className = "profile-image";
	profileImage.style.width = "100px";
	profileImage.style.margin = "0em 1em 1em 0em";
	profileImage.style.float = "left";
	panel.appendChild(profileCell);
	profileCell.appendChild(profileImage);

	const profileName = document.createElement("div");
	const profileCrLv = document.createElement("div");
	const profileAttr = document.createElement("div");
	const profileTags = document.createElement("div");
	profileName.className = "header-1";
	profileName.innerText = data.name;
	profileCrLv.className = "text-1";
	profileCrLv.innerText = `CR.${data.character_rank} Lv.${data.level}`;
	profileAttr.className = "text-2";
	profileAttr.innerText = `${data.gender} ${data.race} ${data.archetype}/${data.main_job} ${data.sub_job}`;
	profileTags.className = "text-2";
	data.tags.forEach((tag) => {
		profileTags.innerText += `[${tag}]`;
	});
	profileCell.appendChild(profileName);
	profileCell.appendChild(profileCrLv);
	profileCell.appendChild(profileAttr);
	profileCell.appendChild(profileTags);
}
function displayStatus(panel, data) {
	const appendRow = function (array) {
		const row = document.createElement("tr");
		row.style.color = "#444";
		row.style.fontWeight = "bold";
		array.forEach((element) => {
			const data = document.createElement("td");
			data.textContent = element;
			row.appendChild(data);
		});

		this.appendChild(row);
	};

	const grid = createGridElement();

	const foundationCell = createCellElement(6);
	grid.appendChild(foundationCell);

	const foundationTable = document.createElement("table");
	foundationTable.className = "unstriped";
	foundationCell.appendChild(foundationTable);

	const foundationTableHead = document.createElement("thead");
	const foundationTableHeadRow = document.createElement("tr");
	const foundationTableHeadRowData = document.createElement("th");
	foundationTableHeadRowData.colSpan = 6;
	foundationTableHeadRowData.textContent = "FOUNDATION";
	foundationTableHeadRow.style.background = "#ED6E37";
	foundationTableHeadRow.style.color = "whitesmoke";
	foundationTable.appendChild(foundationTableHead);
	foundationTableHead.appendChild(foundationTableHeadRow);
	foundationTableHeadRow.appendChild(foundationTableHeadRowData);

	const foundationTableBody = document.createElement("tbody");
	foundationTable.appendChild(foundationTableBody);

	foundationTableBody.appendRow = appendRow;

	foundationTableBody.appendRow(["STR", `${data.str_basic_value}(+${data.str_value})`, "運動値", data.abl_motion, "耐久値", data.abl_durability]);
	foundationTableBody.appendRow(["DEX", `${data.dex_basic_value}(+${data.dex_value})`, "解除値", data.abl_dismantle, "操作値", data.abl_operate]);
	foundationTableBody.appendRow(["POW", `${data.pow_basic_value}(+${data.pow_value})`, "知覚値", data.abl_sense, "交渉値", data.abl_negotiate]);
	foundationTableBody.appendRow(["INT", `${data.int_basic_value}(+${data.int_value})`, "知識値", data.abl_knowledge, "解析値", data.abl_analyze]);
	foundationTableBody.appendRow(["命中値", data.abl_hit, "回避値", data.abl_avoid, "抵抗値", data.abl_resist]);

	const battleCell = createCellElement(6);
	grid.appendChild(battleCell);

	const battleTable = document.createElement("table");
	battleTable.className = "unstriped";
	battleCell.appendChild(battleTable);

	const battleTableHead = document.createElement("thead");
	const battleTableHeadRow = document.createElement("tr");
	const battleTableHeadRowData = document.createElement("th");
	battleTableHeadRowData.colSpan = 6;
	battleTableHeadRowData.textContent = "BATTLE";
	battleTableHeadRow.style.background = "#ED6E37";
	battleTableHeadRow.style.color = "whitesmoke";
	battleTable.appendChild(battleTableHead);
	battleTableHead.appendChild(battleTableHeadRow);
	battleTableHeadRow.appendChild(battleTableHeadRowData);

	const battleTableBody = document.createElement("tbody");
	battleTable.appendChild(battleTableBody);

	battleTableBody.appendRow = appendRow;

	battleTableBody.appendRow(["行動力", data.action, "移動力", data.move]);
	battleTableBody.appendRow(["武器の射程", data.range, "回復力", data.heal_power]);
	battleTableBody.appendRow(["攻撃力", data.physical_attack, "物理防御力", data.physical_defense]);
	battleTableBody.appendRow(["魔力", data.magic_attack, "魔法防御力", data.magic_defense]);

	panel.appendChild(grid);
}
function displaySkills(panel, data) {
	const grid = createGridElement();

	const filterCell = createCellElement(12);
	filterCell.className += " secondary callout";
	grid.appendChild(filterCell);

	const activeSkillTimings = [];
	data.skills.forEach((skill) => {
		if (!activeSkillTimings.includes(skill.timing)) {
			activeSkillTimings.push(skill.timing);
		}
	});

	const createButtons = (group, timing) => {
		const button = createButton();
		button.classList.add(`filter-timing-${data.id}`, "primary", "hollow");
		button.value = timing;
		button.innerText = timing;
		button.disabled = !activeSkillTimings.includes(timing);
		button.onclick = function (event) {
			if (Object.values(event.target.classList).includes("hollow")) {
				event.target.classList.remove("hollow");
			} else {
				event.target.classList.add("hollow");
			}
			const selectedTimings = [];
			const className = event.target.classList[1];
			const id = parseInt(className.match(/[0-9]+/)[0]);
			Object.values(document.getElementsByClassName(event.target.classList[1])).forEach((element) => {
				if (!Object.values(element.classList).includes("hollow")) {
					selectedTimings.push(element.value);
				}
			});
			const character = characters[id];
			character.data.skills.forEach((skill) => {
				const cell = character.skillCells[skill.id];
				let isDisplay = true;
				isDisplay &= selectedTimings.length == 0 || selectedTimings.includes(skill.timing);
				cell.style.display = isDisplay ? "" : "none";
			});
		};
		group.appendChild(button);
	};
	const filterSpecialButtonGroup = document.createElement("div");
	filterSpecialButtonGroup.classList.add("small", "button-group");
	filterSpecialButtonGroup.style.marginBottom = "0.2em";
	filterCell.appendChild(filterSpecialButtonGroup);
	const SpecialTimings = ["常時", "セットアップ", "イニシアチブ", "判定直前", "判定直後", "クリンナップ", "プリプレイ", "ブリーフィング", "レストタイム"];
	SpecialTimings.forEach((timing) => createButtons(filterSpecialButtonGroup, timing));

	const filterMainprocessButtonGroup = document.createElement("div");
	filterMainprocessButtonGroup.classList.add("small", "button-group");
	filterMainprocessButtonGroup.style.marginBottom = "0.2em";
	filterCell.appendChild(filterMainprocessButtonGroup);
	const MainprocessTimings = ["ムーブ", "マイナー", "メジャー", "行動", "インスタント", "ダメージロール", "ダメージ適用直前", "ダメージ適用直後", "本文"];
	MainprocessTimings.forEach((timing) => createButtons(filterMainprocessButtonGroup, timing));

	data.skills.forEach((skill) => {
		const cell = displaySkill(grid, skill);
		characters[data.id].skillCells[skill.id] = cell;
	});

	panel.appendChild(grid);
}
function displaySkill(grid, skill) {
	const cell = createCellElement(12);
	grid.appendChild(cell);

	const skillTable = document.createElement("table");
	cell.appendChild(skillTable);

	const skillTableHead = document.createElement("thead");
	skillTable.appendChild(skillTableHead);

	const skillTableHeadRow = document.createElement("tr");
	skillTableHeadRow.style.background = "#767676";
	skillTableHeadRow.style.color = "whitesmoke";
	skillTableHead.appendChild(skillTableHeadRow);

	const skillTableHeadRowData = document.createElement("th");
	skillTableHeadRowData.colSpan = 7;
	skillTableHeadRowData.style.padding = "0.2em";
	skillTableHeadRow.appendChild(skillTableHeadRowData);

	const skillTableHeadRowTitle = document.createElement("ul");
	skillTableHeadRowTitle.style.display = "table";
	skillTableHeadRowTitle.style.margin = 0;
	skillTableHeadRowTitle.style.padding = 0;
	skillTableHeadRowData.appendChild(skillTableHeadRowTitle);

	const skillTableHeadRowName = document.createElement("li");
	skillTableHeadRowName.textContent = skill.name + "　";
	skillTableHeadRowTitle.appendChild(skillTableHeadRowName);

	const skillTableHeadRowType = document.createElement("li");
	skillTableHeadRowType.textContent = skill.type;
	skillTableHeadRowType.style.display = "table-cell";
	skillTableHeadRowType.style.border = "solid 1px #fff";
	skillTableHeadRowType.style.padding = "0 2px";
	skillTableHeadRowType.style.fontSize = "90%";
	skillTableHeadRowType.style.verticalAlign = "middle";
	skillTableHeadRowTitle.appendChild(skillTableHeadRowType);

	skill.tags.forEach((tag) => {
		const skillTableHeadRowtag = document.createElement("li");
		skillTableHeadRowtag.textContent = tag;
		skillTableHeadRowtag.style.display = "table-cell";
		skillTableHeadRowtag.style.border = "solid 1px #fff";
		skillTableHeadRowtag.style.backgroundColor = "white";
		skillTableHeadRowtag.style.color = "black";
		skillTableHeadRowtag.style.padding = "0 2px";
		skillTableHeadRowtag.style.fontSize = "90%";
		skillTableHeadRowtag.style.verticalAlign = "middle";
		skillTableHeadRowTitle.appendChild(skillTableHeadRowtag);
	});

	const skillTableBody = document.createElement("tbody");
	skillTable.appendChild(skillTableBody);

	const propertyRow = document.createElement("tr");
	propertyRow.style.color = "#444";
	propertyRow.style.fontSize = "smaller";
	skillTableBody.appendChild(propertyRow);

	const SRData = document.createElement("td");
	SRData.textContent = `SR：${skill.skill_rank} / ${skill.skill_max_rank}`;
	propertyRow.appendChild(SRData);
	const TimingData = document.createElement("td");
	TimingData.textContent = `タイミング：${skill.timing}`;
	propertyRow.appendChild(TimingData);
	const rollData = document.createElement("td");
	rollData.textContent = `判定：${skill.roll}`;
	propertyRow.appendChild(rollData);
	const targetData = document.createElement("td");
	targetData.textContent = `対象：${skill.target}`;
	propertyRow.appendChild(targetData);
	const rangeData = document.createElement("td");
	rangeData.textContent = `射程：${skill.range}`;
	propertyRow.appendChild(rangeData);
	const costData = document.createElement("td");
	costData.textContent = `コスト：${skill.cost}`;
	propertyRow.appendChild(costData);
	const limitData = document.createElement("td");
	limitData.textContent = `制限：${skill.limit}`;
	propertyRow.appendChild(limitData);

	const functionRow = document.createElement("tr");
	functionRow.style.color = "#444";
	skillTableBody.appendChild(functionRow);

	const functionData = document.createElement("td");
	functionData.colSpan = 7;
	functionData.textContent = `効果：${skill.function}`;
	functionRow.appendChild(functionData);

	const explainRow = document.createElement("tr");
	explainRow.style.color = "#444";
	skillTableBody.appendChild(explainRow);

	const explainData = document.createElement("td");
	explainData.colSpan = 7;
	explainData.textContent = `解説：${skill.explain}`;
	explainRow.appendChild(explainData);

	return cell;
}

function createGridElement() {
	const grid = document.createElement("div");
	grid.className = "grid-x grid-padding-x";
	return grid;
}
function createCellElement(size) {
	const cell = document.createElement("div");
	if (size) {
		cell.className = `large-${size} medium-${size} small-${size} cell`;
	} else {
		cell.className = `cell`;
	}
	return cell;
}
function createAccordionElement() {
	const accordion = document.createElement("div");
	accordion.className = "accordion";
	accordion.setAttribute("data-accordion", "");
	accordion.setAttribute("data-multi-expand", "true");
	return accordion;
}
function createAccordionItemElement(isActive = false) {
	const item = document.createElement("li");
	item.className = `accordion-item${isActive ? " is-active" : ""}`;
	item.setAttribute("data-accordion-item", "");
	return item;
}
function createAccordionTitleElement() {
	const title = document.createElement("a");
	title.className = "accordion-title";
	title.href = "#";
	return title;
}
function createAccordionContentElement() {
	const content = document.createElement("a");
	content.className = "accordion-content";
	content.setAttribute("data-tab-content", "");
	return content;
}
function createButton() {
	const button = document.createElement("button");
	button.className = "button";
	return button;
}
function createSuccessButton() {
	const button = document.createElement("a");
	button.className = "success button";
	return button;
}
function createCloseButton() {
	const button = document.createElement("button");
	button.className = "close-button";
	button.type = "button";
	button.innerHTML = "<span>&times;</span>";
	return button;
}

function ExportCcforia(id) {
	getJson(`https://lhrpg.com/lhz/api/${id}.json`, createCcforiaJson);
}
function createCcforiaJson(data) {
	const ccforia = new Ccforia();
	const getMagicGrade = function (tags) {
		for (let index = 0; index < tags.length; index++) {
			const tag = tags[index];
			const result = tag.match(/M([0-9]+)/);
			if (!result) continue;
			return parseInt(result[1]);
		}
		return 0;
	};

	ccforia.setName(data.name);
	let tags = "";
	data.tags.forEach((tag) => {
		tags += `[${tag}]`;
	});
	ccforia.setMemo(`PL:${data.player_name}\n防御:物理${data.physical_defense}/魔法${data.magic_defense}\nSTR${data.str_value}/DEX${data.dex_value}/POW${data.pow_value}/INT${data.int_value}\nLv:${data.level} タグ:${tags}`);
	ccforia.setInitiative(data.action);
	ccforia.setExternalUrl(data.sheet_url);
	ccforia.appendStatus("HP", data.max_hitpoint, data.max_hitpoint);
	ccforia.appendStatus("因果力", data.effect, data.effect);
	ccforia.appendStatus("障壁", 0, 0);
	ccforia.appendStatus("再生", 0, 0);
	ccforia.appendStatus("ヘイト", 0, 0);
	ccforia.appendStatus("疲労", 0, 0);
	ccforia.appendParams("CR", data.character_rank.toString());
	ccforia.appendParams("STR", data.str_value.toString());
	ccforia.appendParams("DEX", data.dex_value.toString());
	ccforia.appendParams("POW", data.pow_value.toString());
	ccforia.appendParams("INT", data.int_value.toString());
	ccforia.appendParams("攻撃力", data.physical_attack.toString());
	ccforia.appendParams("魔力", data.magic_attack.toString());
	ccforia.appendParams("回復力", data.heal_power.toString());
	ccforia.appendParams("武器の射程Sq", data.range);
	ccforia.appendParams("物防", data.physical_defense.toString());
	ccforia.appendParams("魔防", data.magic_defense.toString());
	ccforia.appendParams("行動値", data.action.toString());
	ccforia.appendParams("最大HP", data.max_hitpoint.toString());
	ccforia.appendParams("初期因果力", data.effect.toString());
	ccforia.appendParams("空きスロット数", data.items.filter((item) => item == null).length.toString());
	const targetItems = [data.hand1, data.hand2, data.armor, data.support_item1, data.support_item2, data.support_item3, data.bag].concat(data.items);
	let totalMagicGrade = 0;
	let totalPrice = 0;
	targetItems.forEach((targetItem) => {
		if (targetItem) {
			totalMagicGrade += getMagicGrade(targetItem.tags);
			totalPrice += targetItem.price;
		}
	});

	ccforia.appendParams("マジックアイテムのグレード数合計", totalMagicGrade.toString());
	ccforia.appendParams("所持品の価格合計", totalPrice.toString());

	if (navigator.clipboard) {
		try {
			navigator.clipboard.writeText(ccforia.getJson());
			alert("クリップボードにコピーしました。ココフォリアにペーストすることでデータを取り込めます。");
		} catch (err) {
			console.log(err);
			alert("クリップボードのコピーに失敗しました。");
		}
	}
}
function FilterSkills(id) {
	const character = characters[id];
	const timing = document.getElementById("filter-timing-200524").value;
	character.data.skills.forEach((skill) => {
		const cell = character.skillCells[skill.id];
		let isDisplay = true;
		isDisplay &= "-" == timing || skill.timing == timing;
		cell.style.display = isDisplay ? "" : "none";
	});
}

class Ccforia {
	constructor() {
		this.clipboardData = new Object();
		this.clipboardData.kind = "character";
		this.clipboardData.data = new Object();
		this.clipboardData.data.name = "";
		this.clipboardData.data.memo = "";
		this.clipboardData.data.initiative = 0;
		this.clipboardData.data.externalUrl = "";
		this.clipboardData.data.status = [];
		this.clipboardData.data.params = [];
		this.clipboardData.data.secret = false;
		this.clipboardData.data.invisible = false;
		this.clipboardData.data.hideStatus = false;
		this.clipboardData.data.commands = "";
	}

	setName(value) {
		this.clipboardData.data.name = value;
		return this;
	}
	setMemo(value) {
		this.clipboardData.data.memo = value;
		return this;
	}
	setInitiative(value) {
		this.clipboardData.data.initiative = value;
		return this;
	}
	setExternalUrl(value) {
		this.clipboardData.data.externalUrl = value;
		return this;
	}
	appendStatus(label, value, max) {
		this.clipboardData.data.status.push({ label: label, value: value, max: max });
	}
	appendParams(label, value) {
		this.clipboardData.data.params.push({ label: label, value: value });
	}
	setCommands(value) {
		this.clipboardData.data.commands = value;
		return this;
	}

	getJson() {
		return JSON.stringify(this.clipboardData);
	}
}
