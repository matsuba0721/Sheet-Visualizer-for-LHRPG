$(document).foundation();

class Chatpalette {
	constructor() {
		this.type = "Roll";
		this.condition = "";
		this.text = "";
		this.isAdvanced = false;
	}
}

const _characters = new Object();
const _setting = new Object();
const _common = new Object();
loadSetting();

function loadSetting() {
	const loadButton = document.getElementById("load");
	loadButton.disabled = true;
	getJson("setting.json")
		.then((data) => {
			Object.keys(data).forEach((key) => {
				_setting[key] = data[key];
			});
		})
		.then(() => {
			return getJson("common.skill.json");
		})
		.then((data) => {
			Object.keys(data).forEach((key) => {
				_common[key] = data[key];
			});
			loadButton.disabled = false;

			document.getElementById("link").value = "https://lhrpg.com/lhz/sheets/200524.html";
			loadCharactor();
		});
}

function getJson(url) {
	return new Promise((resolve) => {
		try {
			var request = new XMLHttpRequest();
			request.ontimeout = function () {
				alert("JSONデータの取得に失敗しました。");
			};
			request.onload = function () {
				var data = this.response;
				resolve(JSON.parse(data));
			};
			request.open("GET", url, true);
			request.send();
		} catch (err) {
			console.log(err);
			alert("JSONデータの取得に失敗しました。");
		}
	});
}

function loadCharactor() {
	const url = document.getElementById("link").value;
	const id = getCharactorId(url);
	if (id < 0 || id in _characters) return;

	getJson(`https://lhrpg.com/lhz/api/${id}.json`).then((data) => {
		data.id = id;
		init(data);

		const character = new Object();
		character.data = data;
		character.skillCells = new Object();
		_characters[id] = character;
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

		displayCharacter(character.TabPanel, data);
		Foundation.reInit("tabs");
		characterTablink.click();
	});
}
function init(data) {
	data.skills = data.skills.concat(_common.skills);
	data.skills.forEach((skill) => {
		skill.isCommon = skill.id >= 10000;
	});

	const targetItems = [data.hand1, data.hand2, data.armor, data.support_item1, data.support_item2, data.support_item3, data.bag].concat(data.items);
	data.totalMagicGrade = 0;
	data.totalPrice = 0;
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
			data.totalMagicGrade += getMagicGrade(targetItem.tags);
			data.totalPrice += targetItem.price;
		}
	});
	return data;
}
function releaseCharacter(id) {
	if (!(id in _characters)) return;
	const character = _characters[id];
	character.TabTitle.remove();
	character.TabPanel.remove();
	delete _characters[id];

	const idList = Object.keys(_characters);
	if (idList.length > 0) {
		_characters[idList[0]].TabTitle.children[0].click();
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
function displayCharacter(panel, data) {
	const menuCell = createMenuCell(data);
	panel.appendChild(menuCell);
	const profileCell = createProfileCell(data);
	panel.appendChild(profileCell);
	panel.appendChild(document.createElement("hr"));
	const statusGrid = createStatusGrid(data);
	panel.appendChild(statusGrid);
	panel.appendChild(document.createElement("hr"));

	const tabButtonGroup = document.createElement("div");
	tabButtonGroup.classList.add("small", "expanded", "button-group");
	tabButtonGroup.style.marginBottom = "0.5rem";
	panel.appendChild(tabButtonGroup);

	const skillPanelGrid = createSkillPanelGrid(data);
	const itemPanelGrid = createItemPanelGrid(data);
	const otherPanelGrid = createOtherPanelGrid(data);
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
}
function createMenuCell(data) {
	const menuCell = createCellElement();
	const ccfoliaLink = createCcfoliaButton(data);
	const configLink = createSecondaryButton();
	const closebButton = createCloseButton();

	configLink.classList.add("small");
	configLink.href = "javascript:void(0);";
	configLink.innerText = "⚙";
	configLink.style.float = "right";
	configLink.style.color = "whitesmoke";
	configLink.style.fontWeight = "bold";
	configLink.style.margin = "5.5em 1.5em 0 0";

	closebButton.href = "javascript:void(0);";
	closebButton.setAttribute("onclick", `releaseCharacter(${data.id});`);

	menuCell.appendChild(closebButton);
	menuCell.appendChild(configLink);
	menuCell.appendChild(ccfoliaLink);
	return menuCell;
}
function createProfileCell(data) {
	const profileCell = createCellElement();
	const profileImage = document.createElement("img");
	profileImage.src = data.image_url;
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
	profileName.innerText = data.name;
	profileCrLv.className = "text-1";
	profileCrLv.innerText = `CR.${data.character_rank} Lv.${data.level}`;
	profileAttr.className = "text-2";
	profileAttr.innerText = `${data.gender} ${data.race} ${data.archetype}/${data.main_job} ${data.sub_job}`;
	profileTags.className = "text-2";
	data.tags.forEach((tag) => {
		profileTags.innerText += `[${tag}]`;
	});
	profileTotalMagicGrade.className = "text-3";
	profileTotalMagicGrade.innerText = `マジックアイテムのグレード数合計:${data.totalMagicGrade}`;
	profileTotalMagicGrade.style.marginTop = "5px";
	profileTotalPrice.className = "text-3";
	profileTotalPrice.innerText = `所持品の価格合計:${data.totalPrice}G`;
	profileCell.appendChild(profileName);
	profileCell.appendChild(profileCrLv);
	profileCell.appendChild(profileAttr);
	profileCell.appendChild(profileTags);
	profileCell.appendChild(profileTotalMagicGrade);
	profileCell.appendChild(profileTotalPrice);

	return profileCell;
}
function createStatusGrid(data) {
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

	foundationTableBody.appendRow(["STR", `${data.str_basic_value}(+${data.str_value})`, "運動値", data.abl_motion, "耐久値", data.abl_durability]);
	foundationTableBody.appendRow(["DEX", `${data.dex_basic_value}(+${data.dex_value})`, "解除値", data.abl_dismantle, "操作値", data.abl_operate]);
	foundationTableBody.appendRow(["POW", `${data.pow_basic_value}(+${data.pow_value})`, "知覚値", data.abl_sense, "交渉値", data.abl_negotiate]);
	foundationTableBody.appendRow(["INT", `${data.int_basic_value}(+${data.int_value})`, "知識値", data.abl_knowledge, "解析値", data.abl_analyze]);
	foundationTableBody.appendRow(["命中値", data.abl_hit, "回避値", data.abl_avoid, "抵抗値", data.abl_resist]);

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

	battleTableBody.appendRow(["最大HP", data.max_hitpoint, "初期因果力", data.effect]);
	battleTableBody.appendRow(["行動力", data.action, "移動力", data.move]);
	battleTableBody.appendRow(["武器の射程", data.range, "回復力", data.heal_power]);
	battleTableBody.appendRow(["攻撃力", data.physical_attack, "物理防御力", data.physical_defense]);
	battleTableBody.appendRow(["魔力", data.magic_attack, "魔法防御力", data.magic_defense]);

	return grid;
}
function createEquipmentCell(panel, data) {
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
	foundationTable.className = "unstriped hover";
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
	battleTable.className = "unstriped hover";
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

	battleTableBody.appendRow(["最大HP", data.max_hitpoint, "初期因果力", data.effect]);
	battleTableBody.appendRow(["行動力", data.action, "移動力", data.move]);
	battleTableBody.appendRow(["武器の射程", data.range, "回復力", data.heal_power]);
	battleTableBody.appendRow(["攻撃力", data.physical_attack, "物理防御力", data.physical_defense]);
	battleTableBody.appendRow(["魔力", data.magic_attack, "魔法防御力", data.magic_defense]);

	panel.appendChild(grid);
}
function createSkillPanelGrid(data) {
	const grid = createGridElement();
	grid.id = `skill-${data.id}`;

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
	filterResetButton.setAttribute("data-id", data.id);
	filterResetButton.onclick = (event) => {
		const id = event.target.getAttribute("data-id");
		const filterButtons = Object.values(document.getElementsByClassName("filter-skill-" + id));
		filterButtons.forEach((filterButton) => {
			filterButton.classList.add("hollow");
		});
		const character = _characters[id];
		character.data.skills.forEach((skill) => {
			character.skillCells[skill.id].style.display = "";
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
	selectModeButton.setAttribute("data-id", data.id);
	selectModeButton.onclick = (event) => {
		event.target.parentNode.setAttribute("data-is-multi-select", !event.target.classList.toggle("hollow"));
	};
	filterCell.appendChild(selectModeButton);

	const activeSkillTimings = [];
	data.skills.forEach((skill) => {
		if (!activeSkillTimings.includes(skill.timing)) {
			activeSkillTimings.push(skill.timing);
		}
	});

	const activeTags = [];
	data.skills.forEach((skill) => {
		skill.tags.forEach((tag) => {
			if (!activeTags.includes(tag)) {
				activeTags.push(tag);
			}
		});
	});

	const createFilterButton = (group, category, value, style = "primary") => {
		const button = createButton();
		button.classList.add(`filter-skill-${data.id}`, style, "hollow");
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
						button.classList.remove("hollow");
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

			const character = _characters[id];
			character.data.skills.forEach((skill) => {
				const cell = character.skillCells[skill.id];
				const isDisplayByTiming = selectedTimings.length == 0 || selectedTimings.includes(skill.timing);
				let isDisplayByTag = selectedTags.length == 0;
				selectedTags.forEach((selectedTag) => {
					isDisplayByTag = isDisplayByTag || skill.tags.includes(selectedTag);
				});
				if (selectedTimings.length > 0 && selectedTags.length > 0) {
					cell.style.display = isDisplayByTiming || isDisplayByTag ? "" : "none";
				} else {
					cell.style.display = isDisplayByTiming && isDisplayByTag ? "" : "none";
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

	data.skills.forEach((skill) => {
		if (!skill.isCommon) {
			const cell = createSkillCell(skill);
			grid.appendChild(cell);
			_characters[data.id].skillCells[skill.id] = cell;
		}
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

	return cell;
}
function createSkillTitleRow(skill) {
	const skillTableHeadRow = document.createElement("tr");
	skillTableHeadRow.style.color = "whitesmoke";

	const skillTableHeadRowData = document.createElement("th");
	skillTableHeadRowData.colSpan = 7;
	skillTableHeadRowData.style.padding = "0.2em";
	skillTableHeadRow.appendChild(skillTableHeadRowData);

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
		chatpaletteRow.style.display = chatpalette.isAdvanced ? "none" : "";
		tableBodyElement.appendChild(chatpaletteRow);

		const chatpaletteData = document.createElement("td");
		chatpaletteData.colSpan = 7;
		chatpaletteRow.appendChild(chatpaletteData);

		const typeSelect = document.createElement("select");
		typeSelect.style.float = "left";
		typeSelect.style.width = "18%";
		typeSelect.className = "chatpalette-type";
		typeSelect.value = chatpalette.type;
		typeSelect.setAttribute("data-skill-id", skillId);
		typeSelect.onchange = (event) => {
			saveChatpalettes(event.target.closest("tBody"), event.target.getAttribute("data-skill-id"));
		};
		chatpaletteData.appendChild(typeSelect);
		_setting.typeCandidates.forEach((typeCandidate) => {
			const option = document.createElement("option");
			option.value = typeCandidate.value;
			option.innerText = typeCandidate.text;
			option.selected = chatpalette.type == typeCandidate.type;
			typeSelect.appendChild(option);
		});
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
			const tBody = event.target.closest("tBody");
			event.target.closest("tr").remove();
			saveChatpalettes(tBody, event.target.getAttribute("data-skill-id"));
		};
		chatpaletteData.appendChild(removeChatpaletteButton);
	};
	const saveChatpalettes = (tableBodyElement, skillId) => {
		const chatpalettes = [];
		const comandelements = Object.values(tableBodyElement.getElementsByClassName("chatpalette"));
		comandelements.slice(1, comandelements.length).forEach((comandelement) => {
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
		_setting.skills[skillId].chatpalettes = chatpalettes;
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

	_setting.skills[skill.id].chatpalettes.forEach((chatpalette) => {
		appendChatpaletteRow(tableBody, skill.id, chatpalette);
	});
}

function createItemPanelGrid(data) {
	const grid = createGridElement();
	grid.id = `item-${data.id}`;

	const equipmentCell = createEquipmentCell(data);
	grid.appendChild(equipmentCell);
	const belongingsCell = createBelongingsCell(data);
	grid.appendChild(belongingsCell);
	return grid;
}
function createEquipmentCell(data) {
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

	createEquipmentTitleRows("手", [data.hand1, data.hand2]);
	createEquipmentTitleRows("防具", [data.armor]);
	createEquipmentTitleRows("補助装備", [data.support_item1, data.support_item2, data.support_item3]);
	createEquipmentTitleRows("鞄", [data.bag]);

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
function createBelongingsCell(data) {
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
	const bags = [{ name: "", alias: "", slot_size: 2 }, data.hand1, data.hand2, data.armor, data.support_item1, data.support_item2, data.support_item3, data.bag].filter((item) => {
		if (item) return item.slot_size > 0;
		return false;
	});
	for (let index = 0, start = 0; index < bags.length; index++) {
		const bag = bags[index];
		createBelongingsRows(bag.name, data.items.slice(start, start + bag.slot_size));
		start += bag.slot_size;
	}
	bags.forEach((bag) => {});

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

function createOtherPanelGrid(data) {
	const grid = createGridElement();
	grid.id = `other-${data.id}`;

	const remarksCell = createRemarksCell(data);
	grid.appendChild(remarksCell);
	const guidingCreedCell = createGuidingCreedCell(data);
	grid.appendChild(guidingCreedCell);
	const connectionAndUnionCreedCell = createConnectionAndUnionCell(data);
	grid.appendChild(connectionAndUnionCreedCell);

	return grid;
}
function createRemarksCell(data) {
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
	detailRowData.innerHTML = data.remarks.replaceAll("\n", "<br>");
	detailRow.appendChild(detailRowData);

	return cell;
}
function createGuidingCreedCell(data) {
	const cell = createCellElement(12);

	const table = document.createElement("table");
	cell.appendChild(table);

	const tableHead = document.createElement("thead");
	table.appendChild(tableHead);
	const tableHeadRow = createGuidingCreedTitleRow(data);
	tableHead.appendChild(tableHeadRow);

	const tableBody = document.createElement("tbody");
	table.appendChild(tableBody);
	const propertyRow = createGuidingCreedPropertyRow(data);
	tableBody.appendChild(propertyRow);
	const detailRow = createGuidingCreedDetailRow(data);
	tableBody.appendChild(detailRow);

	return cell;
}
function createGuidingCreedTitleRow(data) {
	const row = document.createElement("tr");
	row.style.color = "whitesmoke";

	const rowData = document.createElement("th");
	rowData.textContent = "ガイディングクリード";
	rowData.colSpan = 3;
	rowData.style.padding = "0.2em";
	row.appendChild(rowData);

	return row;
}
function createGuidingCreedPropertyRow(data) {
	const row = document.createElement("tr");
	row.style.color = "#444";

	const nameData = document.createElement("td");
	nameData.textContent = `クリード名：${data.creed_name}`;
	row.appendChild(nameData);
	const creedData = document.createElement("td");
	creedData.textContent = `信念：${data.creed}`;
	row.appendChild(creedData);
	const tagData = document.createElement("td");
	tagData.textContent = `人物タグ：${data.creed_tag}`;
	row.appendChild(tagData);

	return row;
}
function createGuidingCreedDetailRow(data) {
	const row = document.createElement("tr");
	row.style.color = "#444";

	const nameData = document.createElement("td");
	nameData.textContent = `説明：${data.creed_detail}`;
	nameData.colSpan = 3;
	row.appendChild(nameData);

	return row;
}
function createConnectionAndUnionCell(data) {
	const cell = createCellElement(12);

	const table = document.createElement("table");
	cell.appendChild(table);

	const tableHead = document.createElement("thead");
	table.appendChild(tableHead);
	const tableHeadRow = createConnectionAndUnionTitleRow(data);
	tableHead.appendChild(tableHeadRow);

	const tableBody = document.createElement("tbody");
	table.appendChild(tableBody);
	data.connections.forEach((connection) => {
		const row = createConnectionRow(connection);
		tableBody.appendChild(row);
	});
	data.unions.forEach((union) => {
		const row = createUnionRow(union);
		tableBody.appendChild(row);
	});
	return cell;
}
function createConnectionAndUnionTitleRow(data) {
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
function createCcfoliaButton(data) {
	const button = document.createElement("a");
	button.className = "ccforia success button";
	button.classList.add("small");
	button.href = "javascript:void(0);";
	button.setAttribute("onclick", `ExportCcforia(${data.id});`);
	button.innerHTML = `CCFOLIA`;
	button.style.float = "right";
	button.style.color = "whitesmoke";
	button.style.fontWeight = "bold";
	button.style.margin = "5.5em 0.25em 0 0";
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
	createCcforiaJson(_characters[id].data);
}
function createCcforiaJson(data) {
	const ccforia = new Ccforia();
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
	ccforia.appendParams("STR基本値", data.str_value.toString());
	ccforia.appendParams("DEX", data.dex_value.toString());
	ccforia.appendParams("DEX基本値", data.dex_value.toString());
	ccforia.appendParams("POW", data.pow_value.toString());
	ccforia.appendParams("POW基本値", data.pow_value.toString());
	ccforia.appendParams("INT", data.int_value.toString());
	ccforia.appendParams("INT基本値", data.int_value.toString());
	ccforia.appendParams("攻撃力", data.physical_attack.toString());
	ccforia.appendParams("魔力", data.magic_attack.toString());
	ccforia.appendParams("回復力", data.heal_power.toString());
	ccforia.appendParams("武器の射程Sq", data.range);
	ccforia.appendParams("物理防御力", data.physical_defense.toString());
	ccforia.appendParams("魔法防御力", data.magic_defense.toString());
	ccforia.appendParams("行動力", data.action.toString());
	ccforia.appendParams("移動力", data.move.toString());
	ccforia.appendParams("最大HP", data.max_hitpoint.toString());
	ccforia.appendParams("初期因果力", data.effect.toString());
	ccforia.appendParams("空きスロット数", data.items.filter((item) => item == null).length.toString());
	ccforia.setCommands(createChatpalette(data));

	ccforia.appendParams("マジックアイテムのグレード数合計", data.totalMagicGrade.toString());
	ccforia.appendParams("所持品の価格合計", data.totalPrice.toString());

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
function createChatpalette(data) {
	const replaceParameter = (text, skill, tags) => {
		const toStruct = (roll) => {
			const result = roll.match(/([0-9]+)[+-]([0-9]+)D/);
			return { dice: result[2], mod: result[1] };
		};
		const abl_motion = toStruct(data.abl_motion);
		const abl_durability = toStruct(data.abl_durability);
		const abl_dismantle = toStruct(data.abl_dismantle);
		const abl_operate = toStruct(data.abl_operate);
		const abl_sense = toStruct(data.abl_sense);
		const abl_negotiate = toStruct(data.abl_negotiate);
		const abl_knowledge = toStruct(data.abl_knowledge);
		const abl_analyze = toStruct(data.abl_analyze);
		const abl_avoid = toStruct(data.abl_avoid);
		const abl_resist = toStruct(data.abl_resist);
		const abl_hit = toStruct(data.abl_hit);
		return text
			.replace("${CR}", data.character_rank)
			.replace("${MOTION-DICE}", abl_motion.dice)
			.replace("${MOTION-MOD}", abl_motion.mod)
			.replace("${DURABILITY-DICE}", abl_durability.dice)
			.replace("${DURABILITY-MOD}", abl_durability.mod)
			.replace("${DISMANTLE-DICE}", abl_dismantle.dice)
			.replace("${DISMANTLE-MOD}", abl_dismantle.mod)
			.replace("${OPERATE-DICE}", abl_operate.dice)
			.replace("${OPERATE-MOD}", abl_operate.mod)
			.replace("${SENSE-DICE}", abl_sense.dice)
			.replace("${SENSE-MOD}", abl_sense.mod)
			.replace("${NEGOTIATE-DICE}", abl_negotiate.dice)
			.replace("${NEGOTIATE-MOD}", abl_negotiate.mod)
			.replace("${KNOWLEDGE-DICE}", abl_knowledge.dice)
			.replace("${KNOWLEDGE-MOD}", abl_knowledge.mod)
			.replace("${ANALYZE-DICE}", abl_analyze.dice)
			.replace("${ANALYZE-MOD}", abl_analyze.mod)
			.replace("${AVOID-DICE}", abl_avoid.dice)
			.replace("${AVOID-MOD}", abl_avoid.mod)
			.replace("${RESIST-DICE}", abl_resist.dice)
			.replace("${RESIST-MOD}", abl_resist.mod)
			.replace("${HIT-DICE}", abl_hit.dice)
			.replace("${HIT-MOD}", abl_hit.mod)
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
	data.skills.forEach((skill) => {
		let tags = "";
		skill.tags.forEach((tag) => {
			tags += `[${tag}]`;
		});
		if (skill.id in _setting.skills) {
			_setting.typeCandidates.forEach((typeCandidate) => {
				_setting.skills[skill.id].chatpalettes
					.filter((chatpalette) => chatpalette.type == typeCandidate.value)
					.forEach((chatpalette) => {
						if (isFulfillConditions(data, skill, chatpalette.condition)) {
							chatpalettes.push(replaceParameter(chatpalette.text, skill, tags));
						}
					});
			});
		}
	});
	return chatpalettes.join("\n");
}
function isFulfillConditions(data, skill, condition) {
	return true;
}
function FilterSkills(id) {
	const character = _characters[id];
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
