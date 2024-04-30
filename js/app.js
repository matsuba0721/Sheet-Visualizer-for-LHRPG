class LocalStorage {
	constructor() {
		this._tempStrage = new Object();
	}

	Read(name, defaultValue = new Object()) {
		if (name in this._tempStrage) return this._tempStrage[name];
		else return (this._tempStrage[name] = name in localStorage ? JSON.parse(localStorage[name]) : defaultValue);
	}

	async Write(name, value) {
		this._tempStrage[name] = value;
		localStorage[name] = JSON.stringify(value);
	}
}
class Config {
	constructor() {
		this.ccforiaOutput = new Object();
		this.ccforiaOutput.isAbility = true;
		this.ccforiaOutput.isCalcDamege = true;
		this.ccforiaOutput.isSkill = true;
		this.ccforiaOutput.isBasicSkill = true;
		this.ccforiaOutput.isEquipment = true;
		this.ccforiaOutput.isBelongings = true;
		this.ccforiaOutput.isConsumableChart = true;
		this.ccforiaOutput.isTreasureChart = true;
		this.ccforiaOutput.isOtherChart = false;
		this.ccforiaOutput.skillSort = new Object();
		this.ccforiaOutput.skillSort.inherit = true;
		this.ccforiaOutput.skillSort.byTiming = false;
		this.ccforiaOutput.skillSort.timingOrder = [
			"常時",
			"セットアップ",
			"イニシアチブ",
			"判定直前",
			"判定直後",
			"クリンナップ",
			"プリプレイ",
			"ブリーフィング",
			"レストタイム",
			"ムーブ",
			"マイナー",
			"メジャー",
			"行動",
			"インスタント",
			"ダメージロール",
			"ダメージ適用直前",
			"ダメージ適用直後",
			"本文",
		];
		this.ccforiaOutput.isAliasOnly = false;
		this.isAdvanced = false;
	}
}
class Chatpalette {
	constructor() {
		this.type = "Roll";
		this.condition = "";
		this.text = "";
		this.isAdvanced = false;
	}
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

$(document).foundation();

const _master = new Object();
const _config = new Config();
const _characters = new Object();
const _localStorage = new LocalStorage();

init();

function getJson(url) {
	return new Promise((resolve) => {
		try {
			var request = new XMLHttpRequest();
			request.ontimeout = function () {
				alert("JSONデータの取得に失敗しました。");
			};
			request.onload = function () {
				var jsonRaw = this.response;
				resolve(JSON.parse(jsonRaw));
			};
			request.open("GET", url, true);
			request.send();
		} catch (err) {
			console.log(err);
			alert("JSONデータの取得に失敗しました。");
		}
	});
}
function copy(dest, source) {
	Object.keys(source).forEach((key) => {
		if (Object.getPrototypeOf(source[key]).constructor.name === "Object") {
			if (!(key in source)) dest[key] = new Object();
			copy(dest[key], source[key]);
		} else {
			dest[key] = source[key];
		}
	});
}
function init() {
	const loadButton = document.getElementById("load");
	loadButton.disabled = true;

	copy(_config, _localStorage.Read("config"));

	const outputAbilityCheckBox = document.getElementById("output-ability");
	outputAbilityCheckBox.checked = _config.ccforiaOutput.isAbility;
	outputAbilityCheckBox.addEventListener("change", (event) => {
		_config.ccforiaOutput.isAbility = event.target.checked;
		_localStorage.Write("config", _config);
	});

	const outputCalcDamegeCheckBox = document.getElementById("output-calc-damege");
	outputCalcDamegeCheckBox.checked = _config.ccforiaOutput.isCalcDamege;
	outputCalcDamegeCheckBox.addEventListener("change", (event) => {
		_config.ccforiaOutput.isCalcDamege = event.target.checked;
		_localStorage.Write("config", _config);
	});

	const outputSkillCheckBox = document.getElementById("output-skill");
	outputSkillCheckBox.checked = _config.ccforiaOutput.isSkill;
	outputSkillCheckBox.addEventListener("change", (event) => {
		_config.ccforiaOutput.isSkill = event.target.checked;
		_localStorage.Write("config", _config);
	});

	const outputBasicSkillCheckBox = document.getElementById("output-basic-skill");
	outputBasicSkillCheckBox.checked = _config.ccforiaOutput.isBasicSkill;
	outputBasicSkillCheckBox.addEventListener("change", (event) => {
		_config.ccforiaOutput.isBasicSkill = event.target.checked;
		_localStorage.Write("config", _config);
	});

	const outputEquipmentCheckBox = document.getElementById("output-equipment");
	outputEquipmentCheckBox.checked = _config.ccforiaOutput.isEquipment;
	outputEquipmentCheckBox.addEventListener("change", (event) => {
		_config.ccforiaOutput.isEquipment = event.target.checked;
		_localStorage.Write("config", _config);
	});

	const outputBelongingsCheckBox = document.getElementById("output-belongings");
	outputBelongingsCheckBox.checked = _config.ccforiaOutput.isBelongings;
	outputBelongingsCheckBox.addEventListener("change", (event) => {
		_config.ccforiaOutput.isBelongings = event.target.checked;
		_localStorage.Write("config", _config);
	});

	const outputConsumablesChartCheckBox = document.getElementById("output-consumables-chart");
	outputConsumablesChartCheckBox.checked = _config.ccforiaOutput.isConsumableChart;
	outputConsumablesChartCheckBox.addEventListener("change", (event) => {
		_config.ccforiaOutput.isConsumableChart = event.target.checked;
		_localStorage.Write("config", _config);
	});

	const outputTreasureChartCheckBox = document.getElementById("output-treasure-chart");
	outputTreasureChartCheckBox.checked = _config.ccforiaOutput.isTreasureChart;
	outputTreasureChartCheckBox.addEventListener("change", (event) => {
		_config.ccforiaOutput.isTreasureChart = event.target.checked;
		_localStorage.Write("config", _config);
	});

	const outputOtherChartCheckBox = document.getElementById("output-other-chart");
	outputOtherChartCheckBox.checked = _config.ccforiaOutput.isOtherChart;
	outputOtherChartCheckBox.addEventListener("change", (event) => {
		_config.ccforiaOutput.isOtherChart = event.target.checked;
		_localStorage.Write("config", _config);
	});

	const outputSkillSortInheritCheckBox = document.getElementById("output-skill-sort-inherit");
	outputSkillSortInheritCheckBox.checked = _config.ccforiaOutput.skillSort.inherit;
	outputSkillSortInheritCheckBox.addEventListener("change", (event) => {
		_config.ccforiaOutput.skillSort.inherit = true;
		_config.ccforiaOutput.skillSort.byTiming = false;
		_localStorage.Write("config", _config);
		document.getElementById("output-skill-sort-timing-order").style.display = _config.ccforiaOutput.skillSort.byTiming ? "" : "none";
	});

	const outputSkillSortByTimingCheckBox = document.getElementById("output-skill-sort-timing");
	outputSkillSortByTimingCheckBox.checked = _config.ccforiaOutput.skillSort.byTiming;
	outputSkillSortByTimingCheckBox.addEventListener("change", (event) => {
		_config.ccforiaOutput.skillSort.inherit = false;
		_config.ccforiaOutput.skillSort.byTiming = true;
		document.getElementById("output-skill-sort-timing-order").style.display = _config.ccforiaOutput.skillSort.byTiming ? "" : "none";
		_localStorage.Write("config", _config);
	});
	const outputSkillSortByTimingOrderList = document.getElementById("output-skill-sort-timing-order");
	outputSkillSortByTimingOrderList.style.display = _config.ccforiaOutput.skillSort.byTiming ? "" : "none";
	const timingUList = outputSkillSortByTimingOrderList.getElementsByTagName("ul")[0];
	for (let index = 0; index < _config.ccforiaOutput.skillSort.timingOrder.length; index++) {
		const timing = _config.ccforiaOutput.skillSort.timingOrder[index];
		const li = document.createElement("li");
		li.id = `output-skill-sort-timing-order-${index}`;
		li.draggable = true;
		li.textContent = timing;
		li.style.cursor = "pointer";
		li.style.fontSize = "small";
		li.style.backgroundColor = "#EEE";
		li.style.margin = "2px";
		li.ondragstart = function (event) {
			event.dataTransfer.setData("text/plain", event.target.id);
		};
		li.ondragover = function (event) {
			event.preventDefault();
			this.style.borderTop = "3px solid";
		};
		li.ondragleave = function () {
			this.style.borderTop = "";
		};
		li.ondrop = function (event) {
			event.preventDefault();
			let id = event.dataTransfer.getData("text");
			let element_drag = document.getElementById(id);
			this.before(element_drag, this);
			this.style.borderTop = "";
			_config.ccforiaOutput.skillSort.timingOrder = Array.from(element_drag.parentNode.querySelectorAll("li"), (x) => x.textContent);
			_localStorage.Write("config", _config);
		};
		timingUList.appendChild(li);
	}

	const aliasOnlyCheckBox = document.getElementById("output-alias-only");
	aliasOnlyCheckBox.checked = _config.isAdvanced;
	aliasOnlyCheckBox.addEventListener("change", (event) => {
		_config.ccforiaOutput.isAliasOnly = event.target.checked;
		_localStorage.Write("config", _config);
	});

	const advancedCheckBox = document.getElementById("advanced-mode");
	advancedCheckBox.checked = _config.isAdvanced;
	advancedCheckBox.addEventListener("change", (event) => {
		_config.isAdvanced = event.target.checked;
		_localStorage.Write("config", _config);
		const display = _config.isAdvanced ? "" : "none";
		const elements = document.getElementsByClassName("chatpalette");
		for (let index = 0; index < elements.length; index++) {
			const element = elements[index];
			if (element.getAttribute("data-is-advanced") == "true") element.style.display = display;
		}
	});

	getJson("json/master.json").then((master) => {
		Object.keys(master).forEach((key) => (_master[key] = master[key]));
		loadButton.disabled = false;
	});

	refreshHistoryTable();
}
function loadCharactor() {
	loadCharactorFrom(document.getElementById("link").value);
}
function loadCharactorFrom(url) {
	const id = getCharactorId(url);
	if (id < 0 || id in _characters) return;

	getJson(`https://lhrpg.com/lhz/api/${id}.json`).then((character) => {
		character.id = id;
		initCharacter(character);

		_characters[id] = character;
		const panelId = "panel" + id;

		const characterTabs = document.getElementById("character-tabs");

		const tabTitle = document.createElement("li");
		tabTitle.className = "tabs-title";
		characterTabs.appendChild(tabTitle);

		const characterTablink = document.createElement("a");
		characterTablink.href = "#" + panelId;
		characterTablink.setAttribute("data-tabs-target", panelId);
		characterTablink.setAttribute("data-characte-id", id);
		characterTablink.textContent = character.name;
		characterTablink.addEventListener("click", (event) => {
			const id = parseInt(event.target.getAttribute("data-characte-id"));
			Object.values(_characters).forEach((character) => {
				character.isDisplay = character.id == id;
			});
		});
		tabTitle.appendChild(characterTablink);

		const characterContents = document.getElementById("character-contents");
		const tabPanel = document.createElement("div");
		tabPanel.className = "callout tabs-panel";
		tabPanel.id = panelId;
		characterContents.appendChild(tabPanel);

		displayCharacter(tabPanel, character);

		Foundation.reInit("tabs");
		characterTablink.click();

		appendHistory(character);
		refreshHistoryTable();
	});
}
function releaseCharacter(id) {
	if (!(id in _characters)) return;

	const tab = document.getElementById("character-tabs").getElementsByClassName("is-active")[0];
	const content = document.getElementById("character-contents").getElementsByClassName("is-active")[0];
	tab.remove();
	content.remove();
	delete _characters[id];

	const tabCollection = document.getElementById("character-tabs").children;
	if (tabCollection.length > 1) {
		tabCollection[1].click();
		const id = parseInt(tabCollection[1].children[0].getAttribute("data-characte-id"));
		Object.values(_characters).forEach((character) => {
			character.isDisplay = character.id == id;
		});
	} else {
		tabCollection[0].click();
	}
}
function getCurrentCharacter() {
	const keys = Object.keys(_characters);
	for (let index = 0; index < keys.length; index++) {
		const key = keys[index];
		if (_characters[key].isDisplay) {
			return _characters[key];
		}
	}
	return null;
}
function initCharacter(character) {
	const toStruct = (roll) => {
		const result = roll.match(/([0-9]+)[+-]([0-9]+)D/);
		return { dice: result[2], mod: result[1] };
	};
	character.ability = new Object();
	character.ability.motion = toStruct(character.abl_motion);
	character.ability.durability = toStruct(character.abl_durability);
	character.ability.dismantle = toStruct(character.abl_dismantle);
	character.ability.operate = toStruct(character.abl_operate);
	character.ability.sense = toStruct(character.abl_sense);
	character.ability.negotiate = toStruct(character.abl_negotiate);
	character.ability.knowledge = toStruct(character.abl_knowledge);
	character.ability.analyze = toStruct(character.abl_analyze);
	character.ability.avoid = toStruct(character.abl_avoid);
	character.ability.resist = toStruct(character.abl_resist);
	character.ability.hit = toStruct(character.abl_hit);

	const targetItems = [character.hand1, character.hand2, character.armor, character.support_item1, character.support_item2, character.support_item3, character.bag].concat(character.items);
	character.totalMagicGrade = 0;
	character.totalPrice = 0;
	const getMagicGrade = function (tags) {
		for (let index = 0; index < tags.length; index++) {
			const tag = tags[index];
			const result = tag.match(/M([0-9]+)/);
			if (!result) continue;
			return parseInt(result[1]);
		}
		return 0;
	};
	targetItems.forEach((targetItem) => {
		if (targetItem) {
			character.totalMagicGrade += getMagicGrade(targetItem.tags);
			character.totalPrice += targetItem.price;
		}
	});

	character.skills = character.skills.concat(_master.commonSkills);
	character._skillIndexes = new Object();
	for (let index = 0; index < character.skills.length; index++) {
		const skill = character.skills[index];
		character._skillIndexes[skill.id] = index;
		skill.isCommon = skill.id >= 10000;
		skill.characterId = character.id;
	}
	character.getSkillById = (id) => {
		return _skillIndexes[id];
	};

	return character;
}
function getCharactorId(url) {
	let result = url.match(/lhrpg.com\/lhz\/pc.*\?id=([0-9]+)/);
	if (result) return parseInt(result[1]);
	result = url.match(/lhrpg.com\/lhz\/sheets\/([0-9]+)/);
	if (result) return parseInt(result[1]);
	return -1;
}
function getSkillChatpalettes(skill) {
	const name = `character-${skill.characterId}`;
	const data = _localStorage.Read(name);
	if ("skillChatpalettes" in data && skill.id in data.skillChatpalettes) {
		return data.skillChatpalettes[skill.id];
	} else {
		return _master.skillChatpalettes[skill.id];
	}
}
function setSkillChatpalettes(skill, chatpalettes) {
	const name = `character-${skill.characterId}`;
	const data = _localStorage.Read(name);
	if (!("skillChatpalettes" in data)) data.skillChatpalettes = new Object();
	data.skillChatpalettes[skill.id] = chatpalettes;
	_localStorage.Write(name, data);
}
function getSkillById(character, id) {
	return character.skills[character._skillIndexes[id]];
}
function displayCharacter(panel, character) {
	const menuCell = createMenuCell(character);
	panel.appendChild(menuCell);
	const profileCell = createProfileCell(character);
	panel.appendChild(profileCell);
	panel.appendChild(document.createElement("hr"));
	const statusGrid = createStatusGrid(character);
	panel.appendChild(statusGrid);

	const tabButtonGroup = document.createElement("div");
	tabButtonGroup.classList.add("small", "expanded", "button-group");
	tabButtonGroup.style.marginBottom = "0.5rem";
	panel.appendChild(tabButtonGroup);

	const skillPanelGrid = createSkillPanelGrid(character);
	const itemPanelGrid = createItemPanelGrid(character);
	const otherPanelGrid = createOtherPanelGrid(character);
	itemPanelGrid.style.display = "none";
	otherPanelGrid.style.display = "none";
	const changePanel = (event) => {
		const buttons = Object.values(event.target.parentNode.getElementsByClassName("button"));
		buttons.forEach((button) => {
			const gridId = button.getAttribute("element-grid-id");
			if (button == event.target) {
				button.classList.remove("hollow");
				document.getElementById(gridId).style.display = "";
			} else {
				button.classList.add("hollow");
				document.getElementById(gridId).style.display = "none";
			}
		});
	};
	const skillTabButton = document.createElement("a");
	skillTabButton.classList.add("button", "secondary");
	skillTabButton.innerText = "SKILL";
	skillTabButton.setAttribute("element-grid-id", skillPanelGrid.id);
	skillTabButton.onclick = changePanel;
	tabButtonGroup.appendChild(skillTabButton);
	const itemTabButton = document.createElement("a");
	itemTabButton.classList.add("hollow", "button", "secondary");
	itemTabButton.innerText = "ITEM";
	itemTabButton.setAttribute("element-grid-id", itemPanelGrid.id);
	itemTabButton.onclick = changePanel;
	tabButtonGroup.appendChild(itemTabButton);
	const otherTabButton = document.createElement("a");
	otherTabButton.classList.add("hollow", "button", "secondary");
	otherTabButton.innerText = "OTHER";
	otherTabButton.setAttribute("element-grid-id", otherPanelGrid.id);
	otherTabButton.onclick = changePanel;
	tabButtonGroup.appendChild(otherTabButton);

	panel.appendChild(skillPanelGrid);
	panel.appendChild(itemPanelGrid);
	panel.appendChild(otherPanelGrid);

	// const GridContainer = document.createElement("div");
	// GridContainer.className = "grid-container";
	// GridContainer.id = `character-${character.id}-tool`;
	// GridContainer.style.position = "fixed";
	// GridContainer.style.bottom = "0";
	// GridContainer.style.left = "calc(50% - 50rem/2)";
	// GridContainer.style.display = "none";
	// document.getElementsByTagName("body")[0].children[0].after(GridContainer);

	// const Content = document.createElement("div");
	// Content.className = "tabs-content";
	// GridContainer.appendChild(Content);

	// const Panel = document.createElement("div");
	// Panel.className = "tabs-panel is-active";
	// Panel.classList.add("callout");
	// Content.appendChild(Panel);

	// const Grid = createStatusGrid(character);
	// Panel.appendChild(Grid);

	// const Grid = createGridElement();
	// Panel.appendChild(Grid);

	// const Cell = createCellElement(12);
	// Cell.classList.add("tabs-content");
	// Grid.appendChild(Cell);

	// const Label = document.createElement("label");
	// Cell.appendChild(Label);
	// const NumberInput = document.createElement("input");
	// NumberInput.type = "number";
	// Label.appendChild(NumberInput);
}
function createMenuCell(character) {
	const menuCell = createCellElement();
	const ccfoliaButton = createCcfoliaButton(character);
	const lhrpgButton = createLHRPGButton(character);
	const closebButton = createCloseButton(character);

	closebButton.href = "javascript:void(0);";
	closebButton.setAttribute("onclick", `releaseCharacter(${character.id});`);

	menuCell.appendChild(closebButton);
	menuCell.appendChild(ccfoliaButton);
	menuCell.appendChild(lhrpgButton);
	return menuCell;
}
function createProfileCell(character) {
	const profileCell = createCellElement();
	const profileImage = document.createElement("img");
	profileImage.src = character.image_url;
	profileImage.className = "profile-image";
	profileImage.style.width = "100px";
	profileImage.style.margin = "0em 1em 1em 0em";
	profileImage.style.float = "left";
	profileCell.appendChild(profileImage);

	const profileName = document.createElement("div");
	const profileCrLv = document.createElement("div");
	const profileAttr = document.createElement("div");
	const profileTags = document.createElement("div");
	const profileTotalMagicGrade = document.createElement("div");
	const profileTotalPrice = document.createElement("div");
	profileName.className = "header-1";
	profileName.innerText = character.name;
	profileCrLv.className = "text-1";
	profileCrLv.innerText = `CR.${character.character_rank} Lv.${character.level}`;
	profileAttr.className = "text-2";
	profileAttr.innerText = `${character.gender} ${character.race} ${character.archetype}/${character.main_job} ${character.sub_job}`;
	profileTags.className = "text-2";
	character.tags.forEach((tag) => {
		profileTags.innerText += `[${tag}]`;
	});
	profileTotalMagicGrade.className = "text-3";
	profileTotalMagicGrade.innerText = `マジックアイテムのグレード数合計:${character.totalMagicGrade}`;
	profileTotalMagicGrade.style.marginTop = "5px";
	profileTotalPrice.className = "text-3";
	profileTotalPrice.innerText = `所持品の価格合計:${character.totalPrice}G`;
	profileCell.appendChild(profileName);
	profileCell.appendChild(profileCrLv);
	profileCell.appendChild(profileAttr);
	profileCell.appendChild(profileTags);
	profileCell.appendChild(profileTotalMagicGrade);
	profileCell.appendChild(profileTotalPrice);

	return profileCell;
}
function createStatusGrid(character) {
	const appendRow = function (array) {
		const row = document.createElement("tr");
		row.style.color = "#333";
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

	foundationTableBody.appendRow(["STR", `${character.str_basic_value}(+${character.str_value})`, "運動値", character.abl_motion, "耐久値", character.abl_durability]);
	foundationTableBody.appendRow(["DEX", `${character.dex_basic_value}(+${character.dex_value})`, "解除値", character.abl_dismantle, "操作値", character.abl_operate]);
	foundationTableBody.appendRow(["POW", `${character.pow_basic_value}(+${character.pow_value})`, "知覚値", character.abl_sense, "交渉値", character.abl_negotiate]);
	foundationTableBody.appendRow(["INT", `${character.int_basic_value}(+${character.int_value})`, "知識値", character.abl_knowledge, "解析値", character.abl_analyze]);
	foundationTableBody.appendRow(["命中値", character.abl_hit, "回避値", character.abl_avoid, "抵抗値", character.abl_resist]);

	const battleCell = createCellElement(6);
	grid.appendChild(battleCell);

	const battleTable = document.createElement("table");
	battleTable.className = "unstriped ";
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

	battleTableBody.appendRow(["最大HP", character.max_hitpoint, "初期因果力", character.effect]);
	battleTableBody.appendRow(["行動力", character.action, "移動力", character.move]);
	battleTableBody.appendRow(["武器の射程", character.range, "回復力", character.heal_power]);
	battleTableBody.appendRow(["攻撃力", character.physical_attack, "物理防御力", character.physical_defense]);
	battleTableBody.appendRow(["魔力", character.magic_attack, "魔法防御力", character.magic_defense]);

	return grid;
}
function createSkillPanelGrid(character) {
	const grid = createGridElement();
	grid.id = `skill-${character.id}`;

	const filterCell = createCellElement(12);
	filterCell.style.position = "relative";
	filterCell.style.marginBottom = "0.5em";
	filterCell.style.backgroundClip = "content-box";
	filterCell.style.backgroundColor = "#eaeaea";
	filterCell.setAttribute("data-is-multi-select", true);
	grid.appendChild(filterCell);

	const filterResetButton = document.createElement("button");
	filterResetButton.className = "small secondary button";
	filterResetButton.type = "button";
	filterResetButton.innerHTML = "リセット";
	filterResetButton.style.backgroundColor = "#999";
	filterResetButton.style.position = "absolute";
	filterResetButton.style.padding = "0.2rem";
	filterResetButton.style.top = "3.4rem";
	filterResetButton.style.right = "1.1rem";
	filterResetButton.setAttribute("data-id", character.id);
	filterResetButton.onclick = (event) => {
		const id = event.target.getAttribute("data-id");
		const filterButtons = Object.values(document.getElementsByClassName("filter-skill-" + id));
		filterButtons.forEach((filterButton) => {
			filterButton.classList.add("hollow");
		});
		const character = getCurrentCharacter();
		character.skills.forEach((skill) => {
			skill.cell.style.display = "";
		});
	};
	filterCell.appendChild(filterResetButton);

	const selectModeButton = document.createElement("button");
	selectModeButton.className = "small secondary button";
	selectModeButton.type = "button";
	selectModeButton.innerHTML = "複数選択";
	selectModeButton.style.position = "absolute";
	selectModeButton.style.padding = "0.2rem";
	selectModeButton.style.top = "3.4rem";
	selectModeButton.style.right = "4.8rem";
	selectModeButton.setAttribute("data-id", character.id);
	selectModeButton.onclick = (event) => {
		event.target.parentNode.setAttribute("data-is-multi-select", !event.target.classList.toggle("hollow"));
	};
	filterCell.appendChild(selectModeButton);

	const activeSkillTimings = [];
	character.skills.forEach((skill) => {
		if (!activeSkillTimings.includes(skill.timing)) {
			activeSkillTimings.push(skill.timing);
		}
	});

	const activeTags = [];
	character.skills.forEach((skill) => {
		skill.tags.forEach((tag) => {
			if (!activeTags.includes(tag)) {
				activeTags.push(tag);
			}
		});
	});

	const createFilterButton = (group, category, value, style = "primary") => {
		const button = createButton();
		button.classList.add(`filter-skill-${character.id}`, style, "hollow");
		button.value = category;
		button.innerText = value;
		button.disabled = !activeSkillTimings.includes(value) && !activeTags.includes(value);
		button.onclick = function (event) {
			const filterButtonClassName = event.target.classList[1];
			const id = filterButtonClassName.match(/[0-9]+/)[0];
			const selectedTimings = [];
			const selectedTags = [];
			const isMultiSelect = event.target.parentNode.parentNode.getAttribute("data-is-multi-select") == "true";

			if (isMultiSelect) {
				event.target.classList.toggle("hollow");
			} else {
				const buttons = Object.values(event.target.parentNode.parentNode.getElementsByClassName(filterButtonClassName));
				buttons.forEach((button) => {
					if (button == event.target) {
						button.classList.toggle("hollow");
					} else {
						button.classList.add("hollow");
					}
				});
			}

			Object.values(document.getElementsByClassName(event.target.classList[1])).forEach((element) => {
				switch (element.value) {
					case "timing":
						if (!Object.values(element.classList).includes("hollow")) {
							selectedTimings.push(element.innerText);
						}
						break;
					case "tag":
						if (!Object.values(element.classList).includes("hollow")) {
							selectedTags.push(element.innerText);
						}
						break;

					default:
						break;
				}
			});

			const character = getCurrentCharacter();
			character.skills.forEach((skill) => {
				const isDisplayByTiming = selectedTimings.length == 0 || selectedTimings.includes(skill.timing);
				let isDisplayByTag = selectedTags.length == 0;
				selectedTags.forEach((selectedTag) => {
					isDisplayByTag = isDisplayByTag || skill.tags.includes(selectedTag);
				});
				if (selectedTimings.length > 0 && selectedTags.length > 0) {
					skill.cell.style.display = isDisplayByTiming || isDisplayByTag ? "" : "none";
				} else {
					skill.cell.style.display = isDisplayByTiming && isDisplayByTag ? "" : "none";
				}
			});
		};
		group.appendChild(button);
	};
	const filterSpecialButtonGroup = document.createElement("div");
	filterSpecialButtonGroup.classList.add("small", "button-group");
	filterSpecialButtonGroup.style.marginBottom = "0.2em";
	filterSpecialButtonGroup.style.marginLeft = "0.2em";
	filterSpecialButtonGroup.style.marginTop = "0.2em";
	filterCell.appendChild(filterSpecialButtonGroup);
	const SpecialTimings = ["常時", "セットアップ", "イニシアチブ", "判定直前", "判定直後", "クリンナップ", "プリプレイ", "ブリーフィング", "レストタイム"];
	SpecialTimings.forEach((timing) => createFilterButton(filterSpecialButtonGroup, "timing", timing));

	const filterMainprocessButtonGroup = document.createElement("div");
	filterMainprocessButtonGroup.classList.add("small", "button-group");
	filterMainprocessButtonGroup.style.marginBottom = "0.4em";
	filterMainprocessButtonGroup.style.marginLeft = "0.2em";
	filterCell.appendChild(filterMainprocessButtonGroup);
	const MainprocessTimings = ["ムーブ", "マイナー", "メジャー", "行動", "インスタント", "ダメージロール", "ダメージ適用直前", "ダメージ適用直後", "本文"];
	MainprocessTimings.forEach((timing) => createFilterButton(filterMainprocessButtonGroup, "timing", timing));

	const filterTagButtonGroup = document.createElement("div");
	filterTagButtonGroup.classList.add("small", "button-group");
	filterTagButtonGroup.style.marginBottom = "0.2em";
	filterTagButtonGroup.style.marginLeft = "0.2em";
	filterCell.appendChild(filterTagButtonGroup);
	const tags = ["準備", "速攻", "移動", "構え", "援護歌", "支援"];
	tags.forEach((timing) => createFilterButton(filterTagButtonGroup, "tag", timing, "secondary"));

	character.skills.forEach((skill) => {
		const cell = createSkillCell(skill);
		grid.appendChild(cell);
	});

	return grid;
}
function createSkillCell(skill) {
	const cell = createCellElement(12);

	const skillTable = document.createElement("table");
	cell.appendChild(skillTable);

	const skillTableHead = document.createElement("thead");
	skillTable.appendChild(skillTableHead);
	const skillTableHeadRow = createSkillTitleRow(skill);
	skillTableHead.appendChild(skillTableHeadRow);

	const skillTableBody = document.createElement("tbody");
	skillTable.appendChild(skillTableBody);
	const propertyRow = createSkillPropertyRow(skill);
	skillTableBody.appendChild(propertyRow);
	const functionRow = createSkillFunctionRow(skill);
	skillTableBody.appendChild(functionRow);
	const explainRow = createSkillExplainRow(skill);
	skillTableBody.appendChild(explainRow);

	displaySkillChatpalette(skillTableBody, skill);

	skill.cell = cell;
	return cell;
}
function createSkillTitleRow(skill) {
	const skillTableHeadRow = document.createElement("tr");
	skillTableHeadRow.style.color = "whitesmoke";

	const skillTableHeadRowData = document.createElement("th");
	skillTableHeadRowData.colSpan = 7;
	skillTableHeadRowData.style.padding = "0.2em";
	skillTableHeadRow.appendChild(skillTableHeadRowData);
	if (skill.isCommon) {
		skillTableHeadRowData.style.color = "#333";
		skillTableHeadRowData.style.background = "#BBB";
	}

	const skillTableHeadRowTitle = document.createElement("ul");
	skillTableHeadRowTitle.style.margin = 0;
	skillTableHeadRowTitle.style.padding = 0;
	skillTableHeadRowData.appendChild(skillTableHeadRowTitle);

	const skillTableHeadRowName = document.createElement("li");
	skillTableHeadRowName.textContent = skill.name + "　";
	skillTableHeadRowTitle.appendChild(skillTableHeadRowName);

	const skillTableHeadRowType = document.createElement("li");
	skillTableHeadRowType.textContent = skill.type;
	skillTableHeadRowType.style.border = "solid 1px #fff";
	skillTableHeadRowType.style.padding = "0 2px";
	skillTableHeadRowType.style.fontSize = "90%";
	skillTableHeadRowType.style.verticalAlign = "middle";
	skillTableHeadRowTitle.appendChild(skillTableHeadRowType);

	skill.tags.forEach((tag) => {
		const skillTableHeadRowtag = document.createElement("li");
		skillTableHeadRowtag.textContent = tag;
		skillTableHeadRowtag.style.border = "solid 1px #fff";
		skillTableHeadRowtag.style.backgroundColor = "white";
		skillTableHeadRowtag.style.color = "black";
		skillTableHeadRowtag.style.padding = "0 2px";
		skillTableHeadRowtag.style.fontSize = "90%";
		skillTableHeadRowtag.style.verticalAlign = "middle";
		skillTableHeadRowTitle.appendChild(skillTableHeadRowtag);
	});
	return skillTableHeadRow;
}
function createSkillPropertyRow(skill) {
	const propertyRow = document.createElement("tr");
	propertyRow.style.color = "#444";
	propertyRow.style.fontSize = "smaller";

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

	return propertyRow;
}
function createSkillFunctionRow(skill) {
	const functionRow = document.createElement("tr");
	functionRow.style.color = "#444";
	functionRow.style.fontSize = "smaller";

	const functionData = document.createElement("td");
	functionData.colSpan = 7;
	functionData.textContent = `効果：${skill.function}`;
	functionRow.appendChild(functionData);

	return functionRow;
}
function createSkillExplainRow(skill) {
	const explainRow = document.createElement("tr");
	explainRow.style.color = "#444";
	explainRow.style.fontSize = "smaller";

	const explainData = document.createElement("td");
	explainData.colSpan = 7;
	explainData.textContent = `解説：${skill.explain}`;
	explainRow.appendChild(explainData);

	return explainRow;
}
function displaySkillChatpalette(tableBody, skill) {
	const appendChatpaletteRow = (tableBodyElement, skillId, chatpalette = new Chatpalette()) => {
		const chatpaletteRow = document.createElement("tr");
		chatpaletteRow.className = "chatpalette";
		chatpaletteRow.setAttribute("data-is-advanced", chatpalette.isAdvanced);
		chatpaletteRow.style.color = "#444";
		chatpaletteRow.style.display = chatpalette.isAdvanced && !_config.isAdvanced ? "none" : "";
		tableBodyElement.appendChild(chatpaletteRow);

		const chatpaletteData = document.createElement("td");
		chatpaletteData.colSpan = 7;
		chatpaletteRow.appendChild(chatpaletteData);

		const typeSelect = document.createElement("select");
		_master.chatpaletteTypes.forEach((typeCandidate) => {
			const option = document.createElement("option");
			option.value = typeCandidate.value;
			option.innerText = typeCandidate.text;
			option.selected = chatpalette.type == typeCandidate.type;
			typeSelect.appendChild(option);
		});
		typeSelect.style.float = "left";
		typeSelect.style.width = "18%";
		typeSelect.className = "chatpalette-type";
		typeSelect.value = chatpalette.type;
		typeSelect.setAttribute("data-skill-id", skillId);
		typeSelect.onchange = (event) => {
			saveChatpalettes(event.target.closest("tBody"), event.target.getAttribute("data-skill-id"));
		};
		chatpaletteData.appendChild(typeSelect);

		const textInput = document.createElement("input");
		textInput.type = "text";
		textInput.className = "chatpalette-text";
		textInput.value = chatpalette.text;
		textInput.style.float = "left";
		textInput.style.width = "75%";
		textInput.setAttribute("data-skill-id", skill.id);
		textInput.onchange = (event) => {
			saveChatpalettes(event.target.closest("tBody"), event.target.getAttribute("data-skill-id"));
		};
		chatpaletteData.appendChild(textInput);

		const removeChatpaletteButton = document.createElement("a");
		removeChatpaletteButton.className = "alert";
		removeChatpaletteButton.style.float = "right";
		removeChatpaletteButton.innerText = "削除";
		removeChatpaletteButton.setAttribute("data-skill-id", skillId);
		removeChatpaletteButton.onclick = (event) => {
			if (window.confirm("本当に削除しまか？")) {
				const tBody = event.target.closest("tBody");
				event.target.closest("tr").remove();
				saveChatpalettes(tBody, event.target.getAttribute("data-skill-id"));
			}
		};
		chatpaletteData.appendChild(removeChatpaletteButton);
	};
	const saveChatpalettes = (tableBodyElement, skillId) => {
		const chatpalettes = [];
		const comandelements = Object.values(tableBodyElement.getElementsByClassName("chatpalette"));
		comandelements.forEach((comandelement) => {
			const typeSelect = comandelement.getElementsByClassName("chatpalette-type");
			const textInput = comandelement.getElementsByClassName("chatpalette-text")[0];
			if (textInput.value) {
				const chatpalette = new Chatpalette();
				chatpalette.type = typeSelect[0].value;
				chatpalette.text = textInput.value;
				chatpalette.isAdvanced = comandelement.getAttribute("data-is-advanced") == "true";
				chatpalettes.push(chatpalette);
			}
		});
		const character = getCurrentCharacter();
		setSkillChatpalettes(getSkillById(character, skillId), chatpalettes);
	};

	const chatpalettesRow = document.createElement("tr");
	chatpalettesRow.style.color = "#444";
	chatpalettesRow.style.fontWeight = "bold";
	tableBody.appendChild(chatpalettesRow);
	const chatpalettesData = document.createElement("td");
	chatpalettesData.colSpan = 7;
	chatpalettesRow.appendChild(chatpalettesData);
	const addChatpaletteButton = document.createElement("a");
	addChatpaletteButton.textContent = "追加";
	addChatpaletteButton.setAttribute("data-skill-id", skill.id);
	addChatpaletteButton.style.float = "right";
	addChatpaletteButton.onclick = (event) => {
		appendChatpaletteRow(event.target.closest("tBody"), event.target.getAttribute("data-skill-id"));
	};
	chatpalettesData.appendChild(addChatpaletteButton);
	const chatpalettesTitleData = document.createElement("div");
	chatpalettesTitleData.innerText = "チャットパレット";
	chatpalettesData.appendChild(chatpalettesTitleData);

	getSkillChatpalettes(skill).forEach((chatpalette) => {
		appendChatpaletteRow(tableBody, skill.id, chatpalette);
	});
}

function createItemPanelGrid(character) {
	const grid = createGridElement();
	grid.id = `item-${character.id}`;

	const equipmentCell = createEquipmentCell(character);
	grid.appendChild(equipmentCell);
	const belongingsCell = createBelongingsCell(character);
	grid.appendChild(belongingsCell);
	return grid;
}
function createEquipmentCell(character) {
	const cell = createCellElement(12);

	const equipmentTable = document.createElement("table");
	cell.appendChild(equipmentTable);

	const equipmentTableHead = document.createElement("thead");
	equipmentTable.appendChild(equipmentTableHead);
	const equipmentTableHeadRow = document.createElement("tr");
	equipmentTableHeadRow.style.background = "#767676";
	equipmentTableHeadRow.style.color = "whitesmoke";
	equipmentTableHead.appendChild(equipmentTableHeadRow);

	const equipmentTableHeadRowData = document.createElement("th");
	equipmentTableHeadRowData.colSpan = 7;
	equipmentTableHeadRowData.textContent = "装備スロット";
	equipmentTableHeadRowData.style.padding = "0.2em";
	equipmentTableHeadRow.appendChild(equipmentTableHeadRowData);

	const equipmentTableBody = document.createElement("tbody");
	equipmentTable.appendChild(equipmentTableBody);

	const createEquipmentRow = () => {
		const row = document.createElement("tr");
		row.style.color = "#444";
		row.style.fontSize = "smaller";
		return row;
	};
	const createEquipmentRowData = (name) => {
		const rowData = document.createElement("th");
		rowData.textContent = name;
		rowData.style.color = "white";
		rowData.style.backgroundColor = "#664933";
		rowData.style.borderTop = "1px solid #664933";
		rowData.style.borderBottom = "1px solid #ddd";
		rowData.style.width = "54px";
		rowData.style.padding = "0.2em";
		return rowData;
	};

	const createEquipmentTitleRows = (partName, items) => {
		for (let index = 0; index < items.length; index++) {
			const item = items[index] ? items[index] : { name: "", alias: "", tags: [], prefix_function: "" };
			const itemTitleRow = createEquipmentRow();
			equipmentTableBody.appendChild(itemTitleRow);
			const itemPrefixRow = createEquipmentRow();
			equipmentTableBody.appendChild(itemPrefixRow);
			if (index == 0) {
				const itemRowData = createEquipmentRowData(partName);
				itemRowData.rowSpan = items.length * 2;
				itemTitleRow.appendChild(itemRowData);
			}
			createEquipmentTitleDataList(item).forEach((element) => {
				itemTitleRow.appendChild(element);
			});
			itemPrefixRow.appendChild(createEquipmentPrefixData(item));
		}
	};

	createEquipmentTitleRows("手", [character.hand1, character.hand2]);
	createEquipmentTitleRows("防具", [character.armor]);
	createEquipmentTitleRows("補助装備", [character.support_item1, character.support_item2, character.support_item3]);
	createEquipmentTitleRows("鞄", [character.bag]);

	return cell;
}
function createEquipmentTitleDataList(item) {
	const titleRowData = document.createElement("td");
	titleRowData.colSpan = 5;
	titleRowData.style.padding = "0.2em";
	const priceRowData = document.createElement("td");
	priceRowData.style.padding = "0.2em";

	if (item.name) {
		const itemNameList = document.createElement("ul");
		itemNameList.style.margin = 0;
		itemNameList.style.padding = 0;
		titleRowData.appendChild(itemNameList);

		const itemNameItem = document.createElement("li");
		itemNameItem.textContent = (item.alias != item.name ? `${item.alias}(${item.name})` : item.name) + "　";
		if (item.alias.includes(item.name)) itemNameItem.textContent = item.alias + "　";
		itemNameItem.style.fontWeight = "bold";
		itemNameList.appendChild(itemNameItem);

		const itemTypeItem = document.createElement("li");
		itemTypeItem.textContent = item.type;
		itemTypeItem.style.color = "white";
		itemTypeItem.style.backgroundColor = "#664933";
		itemTypeItem.style.border = "solid 1px #664933";
		itemTypeItem.style.padding = "0 2px";
		itemTypeItem.style.fontSize = "90%";
		itemTypeItem.style.verticalAlign = "middle";
		itemNameList.appendChild(itemTypeItem);

		item.tags.forEach((tag) => {
			const itemTagItem = document.createElement("li");
			itemTagItem.textContent = tag;
			itemTagItem.style.border = "solid 1px #aaa";
			itemTagItem.style.backgroundColor = "white";
			itemTagItem.style.color = "black";
			itemTagItem.style.padding = "0 2px";
			itemTagItem.style.fontSize = "90%";
			itemTagItem.style.verticalAlign = "middle";
			itemNameList.appendChild(itemTagItem);
		});

		priceRowData.textContent = `価格：${item.price}`;
	} else {
		titleRowData.textContent = "　";
		priceRowData.textContent = "　";
	}
	return [titleRowData, priceRowData];
}
function createEquipmentPrefixData(item) {
	const rowData = document.createElement("td");
	rowData.colSpan = 6;
	if (item.name) {
		rowData.innerHTML = `効果・解説：${item.function ? item.function : "なし"}`;
		if (item.prefix_function) {
			rowData.innerHTML += `<br>${item.prefix_function}`;
		}
	} else {
		rowData.textContent = "　";
	}
	rowData.style.borderBottom = "1px solid #888";
	rowData.style.padding = "0.2em";
	return rowData;
}
function createBelongingsCell(character) {
	const cell = createCellElement(12);

	const table = document.createElement("table");
	cell.appendChild(table);

	const tableHead = document.createElement("thead");
	table.appendChild(tableHead);
	const tableHeadRow = document.createElement("tr");
	tableHeadRow.style.background = "#767676";
	tableHeadRow.style.color = "whitesmoke";
	tableHead.appendChild(tableHeadRow);

	const tableHeadRowData = document.createElement("th");
	tableHeadRowData.colSpan = 7;
	tableHeadRowData.textContent = "所持品スロット";
	tableHeadRowData.style.padding = "0.2em";
	tableHeadRow.appendChild(tableHeadRowData);

	const tableBody = document.createElement("tbody");
	table.appendChild(tableBody);

	const createRow = () => {
		const row = document.createElement("tr");
		row.style.color = "#444";
		row.style.fontSize = "smaller";
		return row;
	};
	const createRowData = (name) => {
		const rowData = document.createElement("th");
		rowData.textContent = name;
		rowData.style.color = "white";
		rowData.style.backgroundColor = "#664933";
		rowData.style.borderTop = "1px solid #664933";
		rowData.style.borderBottom = "1px solid #ddd";
		rowData.style.width = "54px";
		rowData.style.padding = "0.2em";
		return rowData;
	};

	const createBelongingsRows = (bagName, belongings) => {
		for (let index = 0; index < belongings.length; index++) {
			const item = belongings[index] ? belongings[index] : { name: "", alias: "", timing: "", roll: "", target: "", range: "", tags: [], prefix_function: "" };
			const itemTitleRow = createRow();
			tableBody.appendChild(itemTitleRow);
			const itemPrefixRow = createRow();
			tableBody.appendChild(itemPrefixRow);
			if (index == 0) {
				const itemRowData = createRowData(bagName);
				itemRowData.rowSpan = belongings.length * 2;
				itemTitleRow.appendChild(itemRowData);
			}
			createBelongingsTitleDataList(item).forEach((element) => {
				itemTitleRow.appendChild(element);
			});
			itemPrefixRow.appendChild(createBelongingsFunctionData(item));
		}
	};
	const initBags = [{ name: "", alias: "", slot_size: 2 }];
	const skillPayload = character.skills.find((skill) => skill.id == 1906);
	if (skillPayload) initBags.push({ name: skillPayload.name, alias: "", slot_size: skillPayload.skill_rank * 4 });
	const skillCardMastery = character.skills.find((skill) => skill.id == 124);
	if (skillCardMastery) initBags.push({ name: skillCardMastery.name, alias: "", slot_size: skillCardMastery.skill_rank * 3 });

	const bags = initBags.concat(
		[character.hand1, character.hand2, character.armor, character.support_item1, character.support_item2, character.support_item3, character.bag].filter((item) => {
			if (item) return item.slot_size > 0;
			return false;
		})
	);
	for (let index = 0, start = 0; index < bags.length; index++) {
		const bag = bags[index];
		createBelongingsRows(bag.name, character.items.slice(start, start + bag.slot_size));
		start += bag.slot_size;
	}

	return cell;
}
function createBelongingsTitleDataList(item) {
	const titleRowData = document.createElement("td");
	titleRowData.colSpan = 2;
	titleRowData.style.padding = "0.2em";
	const timingData = document.createElement("td");
	timingData.style.padding = "0.2em";
	const targetData = document.createElement("td");
	targetData.style.padding = "0.2em";
	const rangeData = document.createElement("td");
	rangeData.style.padding = "0.2em";

	if (item.name) {
		const itemNameList = document.createElement("ul");
		itemNameList.style.margin = 0;
		itemNameList.style.padding = 0;
		titleRowData.appendChild(itemNameList);

		const itemNameItem = document.createElement("li");
		itemNameItem.textContent = (item.alias != item.name ? `${item.alias}(${item.name})` : item.name) + "　";
		if (item.alias.includes(item.name)) itemNameItem.textContent = item.alias + "　";
		itemNameItem.style.fontWeight = "bold";
		itemNameList.appendChild(itemNameItem);

		const itemTypeItem = document.createElement("li");
		itemTypeItem.textContent = item.type;
		itemTypeItem.style.color = "white";
		itemTypeItem.style.backgroundColor = "#664933";
		itemTypeItem.style.border = "solid 1px #664933";
		itemTypeItem.style.padding = "0 2px";
		itemTypeItem.style.fontSize = "90%";
		itemTypeItem.style.verticalAlign = "middle";
		itemNameList.appendChild(itemTypeItem);

		item.tags.forEach((tag) => {
			const itemTagItem = document.createElement("li");
			itemTagItem.textContent = tag;
			itemTagItem.style.border = "solid 1px #aaa";
			itemTagItem.style.backgroundColor = "white";
			itemTagItem.style.color = "black";
			itemTagItem.style.padding = "0 2px";
			itemTagItem.style.fontSize = "90%";
			itemTagItem.style.verticalAlign = "middle";
			itemNameList.appendChild(itemTagItem);
		});

		timingData.textContent = `タイミング：${item.timing}`;
		targetData.textContent = `対象：${item.target}`;
		rangeData.textContent = `射程：${item.range}`;
	} else {
		titleRowData.textContent = "　";
		timingData.textContent = "　";
		targetData.textContent = "　";
		rangeData.textContent = "　";
	}
	return [titleRowData, timingData, targetData, rangeData];
}
function createBelongingsFunctionData(belongings) {
	const rowData = document.createElement("td");
	rowData.colSpan = 6;
	if (belongings.name) {
		rowData.textContent = `効果：${belongings.function ? belongings.function : "なし"}`;
	} else {
		rowData.textContent = "　";
	}
	rowData.style.borderBottom = "1px solid #888";
	rowData.style.padding = "0.2em";
	return rowData;
}

function createOtherPanelGrid(character) {
	const grid = createGridElement();
	grid.id = `other-${character.id}`;

	const remarksCell = createRemarksCell(character);
	grid.appendChild(remarksCell);
	const guidingCreedCell = createGuidingCreedCell(character);
	grid.appendChild(guidingCreedCell);
	const connectionAndUnionCreedCell = createConnectionAndUnionCell(character);
	grid.appendChild(connectionAndUnionCreedCell);

	return grid;
}
function createRemarksCell(character) {
	const cell = createCellElement(12);

	const table = document.createElement("table");
	cell.appendChild(table);

	const tableHead = document.createElement("thead");
	table.appendChild(tableHead);
	const tableHeadRow = document.createElement("tr");
	tableHeadRow.style.color = "whitesmoke";
	tableHead.appendChild(tableHeadRow);
	const tableHeadRowData = document.createElement("th");
	tableHeadRowData.textContent = "概要";
	tableHeadRowData.style.padding = "0.2em";
	tableHeadRow.appendChild(tableHeadRowData);

	const tableBody = document.createElement("tbody");
	table.appendChild(tableBody);
	const detailRow = document.createElement("tr");
	detailRow.style.color = "#444";
	tableBody.appendChild(detailRow);
	const detailRowData = document.createElement("td");
	detailRowData.innerHTML = character.remarks ? character.remarks.replaceAll("\n", "<br>") : "";
	detailRow.appendChild(detailRowData);

	return cell;
}
function createGuidingCreedCell(character) {
	const cell = createCellElement(12);

	const table = document.createElement("table");
	cell.appendChild(table);

	const tableHead = document.createElement("thead");
	table.appendChild(tableHead);
	const tableHeadRow = createGuidingCreedTitleRow(character);
	tableHead.appendChild(tableHeadRow);

	const tableBody = document.createElement("tbody");
	table.appendChild(tableBody);
	const propertyRow = createGuidingCreedPropertyRow(character);
	tableBody.appendChild(propertyRow);
	const detailRow = createGuidingCreedDetailRow(character);
	tableBody.appendChild(detailRow);

	return cell;
}
function createGuidingCreedTitleRow(character) {
	const row = document.createElement("tr");
	row.style.color = "whitesmoke";

	const rowData = document.createElement("th");
	rowData.textContent = "ガイディングクリード";
	rowData.colSpan = 3;
	rowData.style.padding = "0.2em";
	row.appendChild(rowData);

	return row;
}
function createGuidingCreedPropertyRow(character) {
	const row = document.createElement("tr");
	row.style.color = "#444";

	const nameData = document.createElement("td");
	nameData.textContent = `クリード名：${character.creed_name}`;
	row.appendChild(nameData);
	const creedData = document.createElement("td");
	creedData.textContent = `信念：${character.creed}`;
	row.appendChild(creedData);
	const tagData = document.createElement("td");
	tagData.textContent = `人物タグ：${character.creed_tag}`;
	row.appendChild(tagData);

	return row;
}
function createGuidingCreedDetailRow(character) {
	const row = document.createElement("tr");
	row.style.color = "#444";

	const nameData = document.createElement("td");
	nameData.textContent = `説明：${character.creed_detail}`;
	nameData.colSpan = 3;
	row.appendChild(nameData);

	return row;
}
function createConnectionAndUnionCell(character) {
	const cell = createCellElement(12);

	const table = document.createElement("table");
	cell.appendChild(table);

	const tableHead = document.createElement("thead");
	table.appendChild(tableHead);
	const tableHeadRow = createConnectionAndUnionTitleRow(character);
	tableHead.appendChild(tableHeadRow);

	const tableBody = document.createElement("tbody");
	table.appendChild(tableBody);
	character.connections.forEach((connection) => {
		const row = createConnectionRow(connection);
		tableBody.appendChild(row);
	});
	character.unions.forEach((union) => {
		const row = createUnionRow(union);
		tableBody.appendChild(row);
	});
	return cell;
}
function createConnectionAndUnionTitleRow(character) {
	const row = document.createElement("tr");
	row.style.color = "whitesmoke";

	const rowData = document.createElement("th");
	rowData.textContent = "コネクション・ユニオン";
	rowData.colSpan = 3;
	rowData.style.padding = "0.2em";
	row.appendChild(rowData);

	return row;
}
function createConnectionRow(connection) {
	const row = document.createElement("tr");
	row.style.color = "#444";
	row.style.fontSize = "smaller";

	const nameData = document.createElement("td");
	nameData.textContent = connection.name;
	row.appendChild(nameData);
	const tagData = document.createElement("td");
	tagData.textContent = `タグ：${Array.from(connection.tags, (tag) => `[${tag}]`).join()}`;
	row.appendChild(tagData);
	const detailData = document.createElement("td");
	detailData.textContent = `関係：${connection.detail}`;
	detailData.style.width = "8rem";
	row.appendChild(detailData);

	return row;
}
function createUnionRow(union) {
	const row = document.createElement("tr");
	row.style.color = "#444";
	row.style.fontSize = "smaller";

	const nameData = document.createElement("td");
	nameData.textContent = union.name;
	row.appendChild(nameData);
	const tagData = document.createElement("td");
	tagData.textContent = `タグ：${Array.from(union.tags, (tag) => `[${tag}]`).join()}`;
	row.appendChild(tagData);
	const detailData = document.createElement("td");
	detailData.textContent = `備考：${union.detail}`;
	detailData.style.width = "8rem";
	row.appendChild(detailData);

	return row;
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
function createButton() {
	const button = document.createElement("button");
	button.className = "button";
	return button;
}
function createCcfoliaButton(character) {
	const button = document.createElement("a");
	button.className = "success button";
	button.classList.add("tiny");
	button.href = "javascript:void(0);";
	button.setAttribute("onclick", `ExportCcforia(${character.id});`);
	button.innerHTML = `CCFOLIA`;
	button.style.float = "right";
	button.style.color = "whitesmoke";
	button.style.fontWeight = "bold";
	button.style.margin = "8.5em 0.25em 0 0";
	return button;
}
function createLHRPGButton(character) {
	const button = document.createElement("a");
	button.className = "button";
	button.classList.add("tiny");
	button.href = "https://lhrpg.com/lhz/pc?id=" + character.id;
	button.target = "_blank";
	button.innerHTML = `冒険者窓口`;
	button.style.float = "right";
	button.style.color = "whitesmoke";
	button.style.fontWeight = "bold";
	button.style.margin = "8.5em 0.25em 0 0";
	return button;
}
function createSecondaryButton() {
	const button = document.createElement("a");
	button.className = "secondary button";
	return button;
}
function createAlertButton() {
	const button = document.createElement("a");
	button.className = "alert button";
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
	createCcforiaJson(getCurrentCharacter(id));
}
function createCcforiaJson(character) {
	const ccforia = new Ccforia();
	ccforia.setName(character.name);
	let tags = "";
	character.tags.forEach((tag) => {
		tags += `[${tag}]`;
	});
	ccforia.setMemo(
		`PL:${character.player_name}\n防御:物理${character.physical_defense}/魔法${character.magic_defense}\nSTR${character.str_value}/DEX${character.dex_value}/POW${character.pow_value}/INT${character.int_value}\nLv:${character.level} タグ:${tags}\nマジックアイテムのグレード数合計:${character.totalMagicGrade}\n所持品の価格合計:${character.totalPrice}`
	);
	ccforia.setInitiative(character.action);
	ccforia.setExternalUrl(character.sheet_url);

	ccforia.appendStatus("HP", character.max_hitpoint, character.max_hitpoint);
	ccforia.appendStatus("因果力", character.effect, character.effect);
	ccforia.appendStatus("障壁", 0, 0);
	ccforia.appendStatus("再生", 0, 0);
	ccforia.appendStatus("ヘイト", 0, 0);
	ccforia.appendStatus("疲労", 0, 0);

	ccforia.setCommands(createChatpalette(character));

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
function createChatpalette(character) {
	const replaceParameter = (text, skill, tags) => {
		return text
			.replace("${CR}", character.character_rank)
			.replace("${MOTION-DICE}", character.ability.motion.dice)
			.replace("${MOTION-MOD}", character.ability.motion.mod)
			.replace("${DURABILITY-DICE}", character.ability.durability.dice)
			.replace("${DURABILITY-MOD}", character.ability.durability.mod)
			.replace("${DISMANTLE-DICE}", character.ability.dismantle.dice)
			.replace("${DISMANTLE-MOD}", character.ability.dismantle.mod)
			.replace("${OPERATE-DICE}", character.ability.operate.dice)
			.replace("${OPERATE-MOD}", character.ability.operate.mod)
			.replace("${SENSE-DICE}", character.ability.sense.dice)
			.replace("${SENSE-MOD}", character.ability.sense.mod)
			.replace("${NEGOTIATE-DICE}", character.ability.negotiate.dice)
			.replace("${NEGOTIATE-MOD}", character.ability.negotiate.mod)
			.replace("${KNOWLEDGE-DICE}", character.ability.knowledge.dice)
			.replace("${KNOWLEDGE-MOD}", character.ability.knowledge.mod)
			.replace("${ANALYZE-DICE}", character.ability.analyze.dice)
			.replace("${ANALYZE-MOD}", character.ability.analyze.mod)
			.replace("${HIT-DICE}", character.ability.hit.dice)
			.replace("${HIT-MOD}", character.ability.hit.mod)
			.replace("${AVOID-DICE}", character.ability.avoid.dice)
			.replace("${AVOID-MOD}", character.ability.avoid.mod)
			.replace("${RESIST-DICE}", character.ability.resist.dice)
			.replace("${RESIST-MOD}", character.ability.resist.mod)
			.replace("${NAME}", skill.name)
			.replace("${TAGS}", tags)
			.replace("${SR}", skill.skill_rank)
			.replace("${MSR}", skill.skill_max_rank)
			.replace("${TIMING}", skill.timing)
			.replace("${ROLL}", skill.roll)
			.replace("${TARGET}", skill.target)
			.replace("${RANGE}", skill.range)
			.replace("${COST}", skill.cost)
			.replace("${LIMIT}", skill.limit)
			.replace("${FUNCTION}", skill.function);
	};
	const chatpalettes = [];
	if (_config.ccforiaOutput.isAbility) {
		chatpalettes.push("### ■能力値判定");
		chatpalettes.push(`${character.ability.hit.dice}LH+${character.ability.hit.mod}>=0 命中`);
		chatpalettes.push(`${character.ability.avoid.dice}LH+${character.ability.avoid.mod}>=0 回避`);
		chatpalettes.push(`${character.ability.resist.dice}LH+${character.ability.resist.mod}>=0 抵抗`);
		chatpalettes.push(`${character.ability.motion.dice}LH+${character.ability.motion.mod}>=0 運動`);
		chatpalettes.push(`${character.ability.durability.dice}LH+${character.ability.durability.mod}>=0 耐久`);
		chatpalettes.push(`${character.ability.dismantle.dice}LH+${character.ability.dismantle.mod}>=0 解除`);
		chatpalettes.push(`${character.ability.operate.dice}LH+${character.ability.operate.mod}>=0 操作`);
		chatpalettes.push(`${character.ability.sense.dice}LH+${character.ability.sense.mod}>=0 知覚`);
		chatpalettes.push(`${character.ability.negotiate.dice}LH+${character.ability.negotiate.mod}>=0 交渉`);
		chatpalettes.push(`${character.ability.knowledge.dice}LH+${character.ability.knowledge.mod}>=0 知識`);
		chatpalettes.push(`${character.ability.analyze.dice}LH+${character.ability.analyze.mod}>=0 解析`);
	}

	if (_config.ccforiaOutput.isCalcDamege) {
		chatpalettes.push("### ■被ダメ計算");
		chatpalettes.push("C(0-{物防}-0) 被ダメージ=物理ダメージ-物防-軽減");
		chatpalettes.push("C(0-{魔防}-0) 被ダメージ=魔法ダメージ-魔防-軽減");
		chatpalettes.push("C(({HP}+{障壁})-0-{ヘイト}*0-0) 残HP＝(HP+障壁)-ダメージ-ヘイトダメージ-その他");
		chatpalettes.push("C(0-{HP}) 残障壁=残HP-HP");
	}
	if (_config.ccforiaOutput.isSkill) {
		chatpalettes.push("### ■特技");
		const createSkillChatpalette = (skill) => {
			let tags = "";
			skill.tags.forEach((tag) => {
				tags += `[${tag}]`;
			});
			_master.chatpaletteTypes.forEach((typeCandidate) => {
				getSkillChatpalettes(skill)
					.filter((chatpalette) => chatpalette.type == typeCandidate.value)
					.forEach((chatpalette) => {
						if (isFulfillConditions(character, skill, chatpalette.condition)) {
							chatpalettes.push(replaceParameter(chatpalette.text, skill, tags));
						}
					});
			});
		};
		if (_config.ccforiaOutput.skillSort.byTiming) {
			_config.ccforiaOutput.skillSort.timingOrder.forEach((timing) => {
				chatpalettes.push(`○${timing}`);
				character.skills.filter((x) => x.timing == timing).forEach(createSkillChatpalette);
			});
		} else {
			character.skills.forEach(createSkillChatpalette);
		}
	}
	if (_config.ccforiaOutput.isEquipment) {
		chatpalettes.push("### ■装備アイテム");
		const equipments = [character.hand1, character.hand2, character.armor, character.support_item1, character.support_item2, character.support_item3, character.bag].filter((x) => x);
		equipments.forEach((equipment) => {
			let chatpalette = "";
			if (!_config.ccforiaOutput.isAliasOnly && equipment.alias) {
				chatpalette += `《${equipment.alias != equipment.name ? `${equipment.alias}(${equipment.name})` : equipment.name}》`;
			} else {
				chatpalette += `《${equipment.alias}》`;
			}
			if (equipment.tags.toString().includes("非売品")) chatpalette += `効果：${equipment.function}》`;
			if (equipment.prefix_function) chatpalette += `プレフィックスド効果：${equipment.prefix_function}》`;
			chatpalettes.push(chatpalette);
		});
	}
	if (_config.ccforiaOutput.isBelongings) {
		chatpalettes.push("### ■所持アイテム");
		character.items
			.filter((x) => x)
			.forEach((item) => {
				let chatpalette = "";
				chatpalette += `《${item.alias != item.name ? `${item.alias}(${item.name})` : item.name}》`;
				chatpalette += `効果・解説：${item.function}`;
				if (item.prefix_function) chatpalette += `プレフィックスド効果：${item.prefix_function}》`;
				chatpalettes.push(chatpalette);
			});
	}
	if (_config.ccforiaOutput.isConsumableChart) {
		chatpalettes.push("### ■消耗表");
		chatpalettes.push("PCT{CR}+0 体力消耗表");
		chatpalettes.push("ECT{CR}+0 気力消耗表");
		chatpalettes.push("GCT{CR}+0 物品消耗表");
		chatpalettes.push("CCT{CR}+0 金銭消耗表");
	}
	if (_config.ccforiaOutput.isTreasureChart) {
		chatpalettes.push("### ■財宝表");
		chatpalettes.push("CTRS{CR}+0 金銭財宝表");
		chatpalettes.push("MTRS{CR}+0 魔法素材財宝表");
		chatpalettes.push("ITRS{CR}+0 換金アイテム財宝表");
	}
	if (_config.ccforiaOutput.isOtherChart) {
		chatpalettes.push("### ■その他");
		chatpalettes.push("HTRS{CR}+0 ヒロイン財宝表");
		chatpalettes.push("GTRS{CR}+0 ゴブリン財宝表");
		chatpalettes.push("ESTL{CR}+0 イースタル探索表");
		chatpalettes.push("ESCT{CR}+0 ロデ研は爆発だ！");
		chatpalettes.push("CSCT{CR}+0 アルヴの呪いじゃ！");
		chatpalettes.push("IAT{CR}+0 ロデ研の新発明ランダム決定表");
		chatpalettes.push("PTAG パーソナリティタグ表");
		chatpalettes.push("KOYU 交友表");
		chatpalettes.push("HLOC 攻撃命中箇所ランダム決定表");
		chatpalettes.push("PCNM PC名ランダム決定表");
		chatpalettes.push("TIAS アキバの街で遭遇するトラブルランダム決定表");
		chatpalettes.push("ABDC 廃棄児ランダム決定表");
	}

	chatpalettes.push("### ■ステータス");
	chatpalettes.push(`//CR=${character.character_rank}`);
	chatpalettes.push(`//STR=${character.str_value}`);
	chatpalettes.push(`//STR基本値=${character.str_value}`);
	chatpalettes.push(`//DEX=${character.dex_value}`);
	chatpalettes.push(`//DEX基本値=${character.dex_value}`);
	chatpalettes.push(`//POW=${character.pow_value}`);
	chatpalettes.push(`//POW基本値=${character.pow_value}`);
	chatpalettes.push(`//INT=${character.int_value}`);
	chatpalettes.push(`//INT基本値=${character.int_value}`);
	chatpalettes.push(`//攻撃力=${character.physical_attack}`);
	chatpalettes.push(`//魔力=${character.magic_attack}`);
	chatpalettes.push(`//回復力=${character.heal_power}`);
	chatpalettes.push(`//武器の射程Sq=${character.range}`);
	chatpalettes.push(`//物理防御力=${character.physical_defense}`);
	chatpalettes.push(`//魔法防御力=${character.magic_defense}`);
	chatpalettes.push(`//行動力=${character.action}`);
	chatpalettes.push(`//移動力=${character.move}`);
	chatpalettes.push(`//最大HP=${character.max_hitpoint}`);
	chatpalettes.push(`//初期因果力=${character.effect}`);
	chatpalettes.push(`//空きスロット数=${character.items.filter((item) => item == null).length}`);
	return chatpalettes.join("\n");
}
function isFulfillConditions(character, skill, condition) {
	return true;
}

function appendHistory(character) {
	const histories = _localStorage.Read("character-loadHistory");
	const getDate = () => {
		const date = new Date();
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const day = date.getDate().toString().padStart(2, "0");
		const hour = date.getHours().toString().padStart(2, "0");
		const minute = date.getMinutes().toString().padStart(2, "0");
		const second = date.getSeconds().toString().padStart(2, "0");
		return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
	};
	const historyData = new Object();
	historyData.id = character.id;
	historyData.characterName = character.name;
	historyData.playerName = character.player_name;
	historyData.tags = Array.from(character.tags, (tag) => `[${tag}]`).join();
	historyData.url = character.sheet_url;
	historyData.date = getDate();
	histories[character.id] = historyData;

	_localStorage.Write("character-loadHistory", histories);
}
async function refreshHistoryTable() {
	const historyTable = document.getElementById("history-table");
	if (historyTable) historyTable.remove();

	const panel = document.getElementById("history");
	const cell = createCellElement(12);

	const table = document.createElement("table");
	table.id = "history-table";
	cell.appendChild(table);

	const tableHead = document.createElement("thead");
	table.appendChild(tableHead);
	const tableHeadRow = createHistoryTitleRow();
	tableHead.appendChild(tableHeadRow);

	const tableBody = document.createElement("tbody");
	table.appendChild(tableBody);

	const histories = _localStorage.Read("character-loadHistory");
	Object.values(histories)
		.sort((x, y) => (x.date > y.date ? -1 : 1))
		.forEach((historyData) => {
			const row = createHistoryRow(historyData);
			tableBody.appendChild(row);
		});

	panel.appendChild(cell);
}
function createHistoryTitleRow() {
	const row = document.createElement("tr");
	row.style.color = "whitesmoke";

	const characterNameRowData = document.createElement("th");
	characterNameRowData.textContent = "PC名";
	characterNameRowData.style.padding = "0.2em";
	row.appendChild(characterNameRowData);

	const characterNamerowData = document.createElement("th");
	characterNamerowData.textContent = "PL名";
	characterNamerowData.style.padding = "0.2em";
	row.appendChild(characterNamerowData);

	const tagsRowData = document.createElement("th");
	tagsRowData.textContent = "人物タグ";
	tagsRowData.style.padding = "0.2em";
	row.appendChild(tagsRowData);

	const dateRowData = document.createElement("th");
	dateRowData.textContent = "日付";
	dateRowData.style.padding = "0.2em";
	row.appendChild(dateRowData);

	return row;
}
function createHistoryRow(historyData) {
	const row = document.createElement("tr");
	row.style.color = "#444";

	const characterNameRowData = document.createElement("td");
	characterNameRowData.style.padding = "0.2em";
	row.appendChild(characterNameRowData);
	const characterNameLink = document.createElement("a");
	characterNameLink.textContent = historyData.characterName;
	characterNameLink.setAttribute("data-href", historyData.url);
	characterNameLink.addEventListener("click", (event) => {
		const url = event.target.getAttribute("data-href");
		loadCharactorFrom(url);
		document.getElementById("history").getElementsByClassName("close-button")[0].click();
	});
	characterNameRowData.appendChild(characterNameLink);

	const characterNamerowData = document.createElement("td");
	characterNamerowData.textContent = historyData.playerName;
	characterNamerowData.style.padding = "0.2em";
	row.appendChild(characterNamerowData);

	const tagsRowData = document.createElement("td");
	tagsRowData.textContent = historyData.tags;
	tagsRowData.style.padding = "0.2em";
	row.appendChild(tagsRowData);

	const dateRowData = document.createElement("td");
	dateRowData.textContent = historyData.date;
	dateRowData.style.padding = "0.2em";
	row.appendChild(dateRowData);

	return row;
}

function createBackup() {
	const data = localStorage;

	const blob = new Blob([JSON.stringify(data)], { type: "text/plain" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	document.body.appendChild(a);
	a.download = "SheetVisualizer-for-LHRPG.json";
	a.href = url;
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}

function restreBackup() {
	const input = document.createElement("input");
	input.type = "file";
	input.accept = ".json";
	input.addEventListener("change", (event) => {
		const file = event.target.files[0];
		const reader = new FileReader();

		reader.onload = function (event) {
			const ls = JSON.parse(event.target.result);
			console.log(ls);
			Object.keys(ls).forEach((key) => {
				localStorage[key] = ls[key];
			});
			window.location.reload();
		};
		reader.readAsText(file);
	});
	input.click();
	input.remove();
}
