// ========================================
// 定数定義
// ========================================

const CONSTANTS = {
	// ドロップ関連
	DROP_MULTIPLIER: {
		MOB: 0.5,
		BOSS: 1.5,
		RAID: 2.0,
	},
	BASE_DROP_VALUE: 10, // ランク × 10G

	// ダイス数
	NORMAL_DICE_MAX: 6,
	RAID_DICE_MAX: 10,

	// テーマ
	THEME_KEY: "enemy-editor-theme",
	THEME_LIGHT: "light-mode",

	// データパス
	DROPS_DB_PATH: "json/drops_database.json",
	SKILLS_DB_PATH: "json/enemy_skills_optimized.json",
};

// ========================================
// ヘルパー関数
// ========================================

// ひらがなをカタカナに変換
function hiraganaToKatakana(str) {
	return str.replace(/[\u3041-\u3096]/g, (match) => {
		return String.fromCharCode(match.charCodeAt(0) + 0x60);
	});
}

// ========================================
// Ccfoliaクラス
// ========================================

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

// ========================================
// グローバル変数
// ========================================

let skillCounter = 0;
let dropsDatabase = null;
let draggedElement = null;
let masterSkills = [];

// ========================================
// テーマ管理
// ========================================

// テーマ切り替え
function toggleTheme() {
	const body = document.body;
	const isLightMode = body.classList.toggle("light-mode");
	localStorage.setItem("theme", isLightMode ? "light" : "dark");
	showAlert(isLightMode ? "ライトモードに切り替えました" : "ダークモードに切り替えました", "blue");
}

// テーマを読み込み
function loadTheme() {
	const savedTheme = localStorage.getItem("theme");
	if (savedTheme === "light") {
		document.body.classList.add("light-mode");
	}
}

// roll-listを更新
function updateRollList() {
	const rollList = document.getElementById("roll-list");
	if (!rollList) return;

	const type = document.getElementById("enemy-type").value;
	const throne = document.getElementById("enemy-throne").value;
	const [str, dex, pow, int] = [parseInt(document.getElementById("enemy-str").value) || 0, parseInt(document.getElementById("enemy-dex").value) || 0, parseInt(document.getElementById("enemy-pow").value) || 0, parseInt(document.getElementById("enemy-int").value) || 0];

	const hitDice = ["spear", "archer", "shooter", "bomber"].includes(type) ? 3 : 2;
	const hitMod = Math.max(str, dex, pow, int) + (["archer", "shooter", "bomber"].includes(type) ? 0 : ["spear"].includes(type) ? 1 : 2);

	if (throne != "mob") {
		rollList.innerHTML = `
		<option value="対決 (${hitMod}+${hitDice}D / 回避)"></option>
		<option value="対決 (${hitMod}+${hitDice}D / 抵抗)"></option>
		<option value="判定なし"></option>
		<option value="自動成功"></option>
	`;
	} else {
		rollList.innerHTML = `
		<option value="対決 (${hitMod + hitDice * 3}[固定] / 回避)"></option>
		<option value="対決 (${hitMod + hitDice * 3}[固定] / 抵抗)"></option>
		<option value="判定なし"></option>
		<option value="自動成功"></option>
	`;
	}
}

// ユーティリティ関数
async function wait(timeout) {
	return new Promise((resolve) => setTimeout(resolve, timeout));
}

async function showConfirm(message) {
	return new Promise((resolve) => {
		const overlay = document.createElement("div");
		overlay.style.position = "fixed";
		overlay.style.top = "0";
		overlay.style.left = "0";
		overlay.style.width = "100%";
		overlay.style.height = "100%";
		overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
		overlay.style.display = "flex";
		overlay.style.justifyContent = "center";
		overlay.style.alignItems = "center";
		overlay.style.zIndex = "10000";

		const dialog = document.createElement("div");
		dialog.style.backgroundColor = "#1e1e1e";
		dialog.style.padding = "24px";
		dialog.style.borderRadius = "8px";
		dialog.style.boxShadow = "0 4px 20px rgba(0,0,0,0.5)";
		dialog.style.maxWidth = "400px";
		dialog.style.color = "#e0e0e0";

		const messageEl = document.createElement("p");
		messageEl.textContent = message;
		messageEl.style.marginBottom = "20px";
		messageEl.style.fontSize = "14px";
		messageEl.style.lineHeight = "1.5";

		const buttonContainer = document.createElement("div");
		buttonContainer.style.display = "flex";
		buttonContainer.style.gap = "12px";
		buttonContainer.style.justifyContent = "flex-end";

		const cancelButton = document.createElement("button");
		cancelButton.textContent = "キャンセル";
		cancelButton.style.padding = "8px 16px";
		cancelButton.style.border = "1px solid #505050";
		cancelButton.style.backgroundColor = "#2a2a2a";
		cancelButton.style.color = "#e0e0e0";
		cancelButton.style.borderRadius = "4px";
		cancelButton.style.cursor = "pointer";
		cancelButton.style.fontSize = "13px";
		cancelButton.onclick = () => {
			document.body.removeChild(overlay);
			resolve(false);
		};

		const confirmButton = document.createElement("button");
		confirmButton.textContent = "OK";
		confirmButton.style.padding = "8px 16px";
		confirmButton.style.border = "none";
		confirmButton.style.backgroundColor = "#1e88e5";
		confirmButton.style.color = "#ffffff";
		confirmButton.style.borderRadius = "4px";
		confirmButton.style.cursor = "pointer";
		confirmButton.style.fontSize = "13px";
		confirmButton.onclick = () => {
			document.body.removeChild(overlay);
			resolve(true);
		};

		buttonContainer.appendChild(cancelButton);
		buttonContainer.appendChild(confirmButton);
		dialog.appendChild(messageEl);
		dialog.appendChild(buttonContainer);
		overlay.appendChild(dialog);
		document.body.appendChild(overlay);
	});
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
	card.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
	card.style.transition = "all 0.3s";
	const cardSection = document.createElement("div");
	cardSection.style.padding = "15px";
	const contentParagraph = document.createElement("p");
	contentParagraph.style.fontSize = "small";
	contentParagraph.style.margin = "0";
	contentParagraph.style.color = "#333";
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

// ========================================
// 初期化
// ========================================

// ページ読み込み時の初期化
window.addEventListener("DOMContentLoaded", () => {
	loadTheme();
	updateIdentificationDifficulty();
	loadMasterSkills();
	loadDropsDatabase();

	document.getElementById("enemy-rank").addEventListener("change", () => {
		updateIdentificationDifficulty();
		calculateDropExpectedValue();
	});
	document.getElementById("enemy-popularity").addEventListener("change", updateIdentificationDifficulty);
	document.getElementById("enemy-throne").addEventListener("change", calculateDropExpectedValue);

	calculateStatus();
	initializeSkills();
	calculateDropExpectedValue();
});

// 識別難易度を自動計算
function updateIdentificationDifficulty() {
	const cr = parseInt(document.getElementById("enemy-rank").value) || 0;
	const popularity = parseInt(document.getElementById("enemy-popularity").value) || 0;
	const difficulty = popularity == 0 ? "自動" : Math.floor((cr - 1) / 3 + 1 + popularity);
	document.getElementById("enemy-identification").value = difficulty;
}
// ドロップ期待値を取得
function getDropExpected(rank) {
	if (rank == 1) {
		return 23;
	} else if (rank == 2) {
		return 28;
	} else if (rank == 3) {
		return 35;
	} else if (rank == 4) {
		return 42;
	} else if (rank == 5) {
		return 52;
	} else if (rank == 6) {
		return 63;
	} else if (rank == 7) {
		return 75;
	} else if (rank == 8) {
		return 89;
	} else if (rank == 9) {
		return 104;
	} else if (rank == 10) {
		return 120;
	} else if (rank == 11) {
		return 138;
	} else if (rank == 12) {
		return 158;
	} else if (rank == 13) {
		return 179;
	} else if (rank == 14) {
		return 201;
	} else if (rank == 15) {
		return 225;
	} else if (rank == 16) {
		return 250;
	} else if (rank == 17) {
		return 276;
	} else if (rank == 18) {
		return 305;
	} else if (rank == 19) {
		return 334;
	} else if (rank == 20) {
		return 365;
	} else if (rank == 21) {
		return 397;
	} else if (rank == 22) {
		return 431;
	} else if (rank == 23) {
		return 467;
	} else if (rank == 24) {
		return 503;
	} else if (rank == 25) {
		return 541;
	} else if (rank == 26) {
		return 581;
	} else if (rank == 27) {
		return 622;
	} else if (rank == 28) {
		return 665;
	} else if (rank == 29) {
		return 708;
	} else if (rank == 30) {
		return 754;
	} else return 0;
}
// 特技を初期化
function initializeSkills(initialCount = 1) {
	const container = document.getElementById("skills-container");
	container.innerHTML = "";
	skillCounter = 0;
	for (let i = 0; i < initialCount; i++) {
		addSkill();
	}
	// 初期化時に能力値が設定されていれば基本攻撃手段も生成
	const type = document.getElementById("enemy-type").value;
	const rank = parseInt(document.getElementById("enemy-rank").value) || 1;
	const throne = document.getElementById("enemy-throne").value;
	const str = parseInt(document.getElementById("enemy-str").value) || 0;
	const dex = parseInt(document.getElementById("enemy-dex").value) || 0;
	const pow = parseInt(document.getElementById("enemy-pow").value) || 0;
	const int = parseInt(document.getElementById("enemy-int").value) || 0;
	const hate = parseInt(document.getElementById("enemy-hate").value) || 1;

	if (type && str > 0) {
		generateBasicSkill(type, rank, throne, str, dex, pow, int, hate);
	}
}

// 特技を追加
function addSkill() {
	const container = document.getElementById("skills-container");
	const skillId = skillCounter++;

	const skillItem = document.createElement("div");
	skillItem.className = "skill-item";
	skillItem.id = `skill-${skillId}`;
	skillItem.draggable = false;

	// ドラッグ&ドロップイベントの設定
	skillItem.addEventListener("dragstart", handleDragStart);
	skillItem.addEventListener("dragend", handleDragEnd);
	skillItem.addEventListener("dragover", handleDragOver);
	skillItem.addEventListener("drop", handleDrop);
	skillItem.addEventListener("dragenter", handleDragEnter);
	skillItem.addEventListener("dragleave", handleDragLeave);

	skillItem.innerHTML = `
                <div class="skill-header" onclick="toggleSkill(${skillId})">
                    <div>
                        <span class="skill-name" id="skill-name-display-${skillId}">特技${skillId + 1}</span>
                        <span class="skill-info" id="skill-info-${skillId}">タイミング:- / 対象:- / 射程:-</span>
                    </div>
                    <div class="skill-controls" onclick="event.stopPropagation()">
                        <button onclick="deleteSkill(${skillId})" style="color: #d9534f">削除</button>
                    </div>
                </div>
                <div class="skill-body" id="skill-body-${skillId}">
                    <table class="data-table">
                        <tr>
                            <th style="width: 80px">特技名</th>
                            <td colspan="3">
                                <input type="text" id="skill-name-${skillId}" placeholder="特技名" onchange="updateSkillDisplay(${skillId})" />
                            </td>
                        </tr>
                        <tr>
                            <th>タイミング</th>
                            <td>
                                <input type="text" id="skill-timing-${skillId}" list="timing-list" placeholder="メジャー" onchange="updateSkillDisplay(${skillId})" />
                            </td>
                            <th style="width: 80px">判定</th>
                            <td>
                                <input type="text" id="skill-roll-${skillId}" list="roll-list" placeholder="自動成功" />
                            </td>
                        </tr>
                        <tr>
                            <th>対象</th>
                            <td>
                                <input type="text" id="skill-target-${skillId}" list="target-list" placeholder="単体" onchange="updateSkillDisplay(${skillId})" />
                            </td>
                            <th>射程</th>
                            <td>
                                <input type="text" id="skill-range-${skillId}" list="range-list" placeholder="至近" onchange="updateSkillDisplay(${skillId})" />
                            </td>
                        </tr>
                        <tr>
                            <th>コスト</th>
                            <td>
                                <input type="text" id="skill-cost-${skillId}" placeholder="なし" />
                            </td>
                            <th>制限</th>
                            <td>
                                <input type="text" id="skill-limit-${skillId}" list="limit-list" placeholder="なし" />
                            </td>
                        </tr>
                        <tr>
                            <th>タグ</th>
                            <td colspan="3">
                                <input type="text" id="skill-tag-${skillId}-0" placeholder="タグ1" style="width: 15%; margin-right: 5px;" />
                                <input type="text" id="skill-tag-${skillId}-1" placeholder="タグ2" style="width: 15%; margin-right: 5px;" />
                                <input type="text" id="skill-tag-${skillId}-2" placeholder="タグ3" style="width: 15%; margin-right: 5px;" />
                                <input type="text" id="skill-tag-${skillId}-3" placeholder="タグ4" style="width: 15%; margin-right: 5px;" />
                                <input type="text" id="skill-tag-${skillId}-4" placeholder="タグ5" style="width: 15%; margin-right: 5px;" />
                                <input type="text" id="skill-tag-${skillId}-5" placeholder="タグ6" style="width: 15%;" />
                            </td>
                        </tr>
                        <tr>
                            <th>効果</th>
                            <td colspan="3">
                                <textarea id="skill-effect-${skillId}" placeholder="特技の効果" style="width: 100%; min-height: 100px"></textarea>
                            </td>
                        </tr>
                        <tr>
                            <th>コマンド</th>
                            <td colspan="3">
                                <textarea id="skill-command-${skillId}" placeholder="チャットパレット用コマンド" style="width: 100%; min-height: 70px"></textarea>
                            </td>
                        </tr>
                    </table>
                </div>
            `;

	container.appendChild(skillItem);

	// skill-headerをドラッグハンドルとして設定
	const skillHeader = skillItem.querySelector(".skill-header");
	skillHeader.style.cursor = "move";
	skillHeader.addEventListener("mousedown", (e) => {
		// 削除ボタンがクリックされた場合はドラッグを無効化
		if (e.target.tagName === "BUTTON" || e.target.closest(".skill-controls")) {
			return;
		}
		skillItem.draggable = true;
	});
	skillHeader.addEventListener("mouseup", () => {
		skillItem.draggable = false;
	});
	skillHeader.addEventListener("mouseleave", () => {
		skillItem.draggable = false;
	});
}

// 特技の表示を更新
function updateSkillDisplay(skillId) {
	const name = document.getElementById(`skill-name-${skillId}`).value || `特技${skillId + 1}`;
	const timing = document.getElementById(`skill-timing-${skillId}`).value || "-";
	const target = document.getElementById(`skill-target-${skillId}`).value || "-";
	const range = document.getElementById(`skill-range-${skillId}`).value || "-";

	document.getElementById(`skill-name-display-${skillId}`).textContent = name;
	document.getElementById(`skill-info-${skillId}`).textContent = `タイミング:${timing} / 対象:${target} / 射程:${range}`;
}

// 特技の展開/折りたたみ
function toggleSkill(skillId) {
	const skillItem = document.getElementById(`skill-${skillId}`);
	skillItem.classList.toggle("expanded");
}

// ドラッグ開始
function handleDragStart(e) {
	draggedElement = this;
	this.classList.add("dragging");
	e.dataTransfer.effectAllowed = "move";
	e.dataTransfer.setData("text/html", this.innerHTML);
}

// ドラッグ終了
function handleDragEnd(e) {
	this.classList.remove("dragging");

	// すべての要素からdrag-overクラスを削除
	document.querySelectorAll(".skill-item").forEach((item) => {
		item.classList.remove("drag-over");
	});
}

// ドラッグオーバー
function handleDragOver(e) {
	if (e.preventDefault) {
		e.preventDefault();
	}
	e.dataTransfer.dropEffect = "move";
	return false;
}

// ドラッグ進入
function handleDragEnter(e) {
	if (this !== draggedElement) {
		this.classList.add("drag-over");
	}
}

// ドラッグ離脱
function handleDragLeave(e) {
	this.classList.remove("drag-over");
}

// ドロップ
function handleDrop(e) {
	if (e.stopPropagation) {
		e.stopPropagation();
	}

	if (draggedElement !== this) {
		const container = document.getElementById("skills-container");
		const allItems = [...container.querySelectorAll(".skill-item")];
		const draggedIndex = allItems.indexOf(draggedElement);
		const targetIndex = allItems.indexOf(this);

		if (draggedIndex < targetIndex) {
			container.insertBefore(draggedElement, this.nextSibling);
		} else {
			container.insertBefore(draggedElement, this);
		}
	}

	this.classList.remove("drag-over");
	return false;
}

// 特技を削除
async function deleteSkill(skillId) {
	if (await showConfirm("この特技を削除しますか?")) {
		document.getElementById(`skill-${skillId}`).remove();
	}
}

// 能力値を自動計算
function calculateStatus() {
	const rank = parseInt(document.getElementById("enemy-rank").value) || 1;
	const type = document.getElementById("enemy-type").value;
	const throne = document.getElementById("enemy-throne").value;

	if (!type) {
		showAlert("エネミータイプを選択してください", "red");
		return;
	}
	if (!throne) {
		showAlert("エネミーランクを選択してください", "red");
		return;
	}

	let str, dex, pow, int, avoid, resist, physicalDefense, magicalDefense, hitpoint, hate, initiative, move, fate;
	let strBase, dexBase, powBase, intBase;

	// エネミータイプごとの基本能力値計算
	if (type === "armorer") {
		strBase = 7 + rank + Math.floor(rank / 10);
		dexBase = 3 + rank + Math.floor(rank / 10);
		powBase = 4 + rank + Math.floor(rank / 10);
		intBase = 2 + rank + Math.floor(rank / 10);
		str = Math.floor(strBase / 3);
		dex = Math.floor(dexBase / 3);
		pow = Math.floor(powBase / 3);
		int = Math.floor(intBase / 3);
		avoid = Math.floor((4 + rank + Math.floor(rank / 5)) / 3) + "+2D";
		resist = Math.floor((2 + rank + Math.floor(rank / 10)) / 3) + "+2D";
		physicalDefense = 8 + rank + Math.floor(rank * 1.2);
		magicalDefense = 2 + rank + Math.floor(rank * 0.7);
		hitpoint = 48 + Math.floor(rank * 8.5);
		hate = 2 + Math.floor(rank / 6);
		initiative = Math.floor((strBase + intBase) / 3) - 2;
	} else if (type === "fencer") {
		strBase = 7 + rank + Math.floor(rank / 10);
		dexBase = 4 + rank + Math.floor(rank / 10);
		powBase = 2 + rank + Math.floor(rank / 10);
		intBase = 3 + rank + Math.floor(rank / 10);
		str = Math.floor(strBase / 3);
		dex = Math.floor(dexBase / 3);
		pow = Math.floor(powBase / 3);
		int = Math.floor(intBase / 3);
		avoid = Math.floor((4 + rank + Math.floor(rank / 10)) / 3) + "+2D";
		resist = Math.floor((2 + rank + Math.floor(rank / 10)) / 3) + "+2D";
		physicalDefense = 5 + rank + Math.floor(rank * 0.7);
		magicalDefense = 1 + rank + Math.floor(rank * 0.7);
		hitpoint = 45 + Math.floor(rank * 8.4);
		hate = 1 + Math.floor(rank / 6);
		initiative = Math.floor((strBase + powBase) / 3) - 2;
	} else if (type === "grappler") {
		strBase = 6 + rank + Math.floor(rank / 10);
		dexBase = 4 + rank + Math.floor(rank / 10);
		powBase = 2 + rank + Math.floor(rank / 10);
		intBase = 3 + rank + Math.floor(rank / 10);
		str = Math.floor(strBase / 3);
		dex = Math.floor(dexBase / 3);
		pow = Math.floor(powBase / 3);
		int = Math.floor(intBase / 3);
		avoid = Math.floor((2 + rank + Math.floor(rank / 10)) / 3) + "+3D";
		resist = Math.floor((4 + rank + Math.floor(rank / 10)) / 3) + "+3D";
		physicalDefense = 2 + rank + Math.floor(rank * -0.096);
		magicalDefense = 3 + rank + Math.floor(rank * 0.3);
		hitpoint = 45 + Math.floor(rank * 7.5);
		hate = 1 + Math.floor(rank / 6);
		initiative = Math.floor((strBase + intBase) / 3);
	} else if (type === "supporter") {
		strBase = 4 + rank + Math.floor(rank / 10);
		dexBase = 2 + rank + Math.floor(rank / 10);
		powBase = 7 + rank + Math.floor(rank / 10);
		intBase = 3 + rank + Math.floor(rank / 10);
		str = Math.floor(strBase / 3);
		dex = Math.floor(dexBase / 3);
		pow = Math.floor(powBase / 3);
		int = Math.floor(intBase / 3);
		avoid = Math.floor((2 + rank + Math.floor(rank / 5)) / 3) + "+2D";
		resist = Math.floor((7 + rank + Math.floor(rank / 10)) / 3) + "+2D";
		physicalDefense = 3 + rank + Math.floor(rank * 0.5);
		magicalDefense = 5 + rank + Math.floor(rank * 0.8);
		hitpoint = 35 + Math.floor(rank * 5);
		hate = 1 + Math.floor(rank / 6);
		initiative = Math.floor((dexBase + powBase) / 3) + 2;
	} else if (type === "healer") {
		strBase = 3 + rank + Math.floor(rank / 10);
		dexBase = 2 + rank + Math.floor(rank / 10);
		powBase = 7 + rank + Math.floor(rank / 10);
		intBase = 4 + rank + Math.floor(rank / 10);
		str = Math.floor(strBase / 3);
		dex = Math.floor(dexBase / 3);
		pow = Math.floor(powBase / 3);
		int = Math.floor(intBase / 3);
		avoid = Math.floor((2 + rank + Math.floor(rank / 5)) / 3) + "+2D";
		resist = Math.floor((7 + rank + Math.floor(rank / 10)) / 3) + "+2D";
		physicalDefense = 8 + rank + Math.floor(rank * 0.8);
		magicalDefense = 1 + rank + Math.floor(rank * 0.7);
		hitpoint = 30 + Math.floor(rank * 6);
		hate = 1 + Math.floor(rank / 6);
		initiative = Math.floor((dexBase + powBase) / 3) - 2;
	} else if (type === "spear") {
		strBase = 4 + rank + Math.floor(rank / 10);
		dexBase = 7 + rank + Math.floor(rank / 10);
		powBase = 2 + rank + Math.floor(rank / 10);
		intBase = 3 + rank + Math.floor(rank / 10);
		str = Math.floor(strBase / 3);
		dex = Math.floor(dexBase / 3);
		pow = Math.floor(powBase / 3);
		int = Math.floor(intBase / 3);
		avoid = Math.floor((7 + rank + Math.floor(rank / 5)) / 3) + "+2D";
		resist = Math.floor((2 + rank + Math.floor(rank / 10)) / 3) + "+2D";
		physicalDefense = 5 + rank + Math.floor(rank * 0.7);
		magicalDefense = 3 + rank + Math.floor(rank * 0.5);
		hitpoint = 30 + Math.floor(rank * 6);
		hate = 2 + Math.floor(rank / 6);
		initiative = Math.floor((dexBase + powBase) / 3);
	} else if (type === "archer") {
		strBase = 3 + rank + Math.floor(rank / 10);
		dexBase = 4 + rank + Math.floor(rank / 10);
		powBase = 2 + rank + Math.floor(rank / 10);
		intBase = 7 + rank + Math.floor(rank / 10);
		str = Math.floor(strBase / 3);
		dex = Math.floor(dexBase / 3);
		pow = Math.floor(powBase / 3);
		int = Math.floor(intBase / 3);
		avoid = Math.floor((4 + rank + Math.floor(rank / 10)) / 3) + "+2D";
		resist = Math.floor((2 + rank + Math.floor(rank / 10)) / 3) + "+2D";
		physicalDefense = 6 + rank + Math.floor(rank * 0.6);
		magicalDefense = 5 + rank + Math.floor(rank * 0.9);
		hitpoint = 26 + Math.floor(rank * 5);
		hate = 2 + Math.floor((rank + 2) / 6);
		initiative = Math.floor((powBase + intBase) / 3);
	} else if (type === "shooter") {
		strBase = 3 + rank + Math.floor(rank / 10);
		dexBase = 2 + rank + Math.floor(rank / 10);
		powBase = 5 + rank + Math.floor(rank / 10);
		intBase = 7 + rank + Math.floor(rank / 10);
		str = Math.floor(strBase / 3);
		dex = Math.floor(dexBase / 3);
		pow = Math.floor(powBase / 3);
		int = Math.floor(intBase / 3);
		avoid = Math.floor((2 + rank + Math.floor(rank / 5)) / 3) + "+2D";
		resist = Math.floor((5 + rank + Math.floor(rank / 10)) / 3) + "+2D";
		physicalDefense = 3 + rank + Math.floor(rank * 0.3);
		magicalDefense = 5 + rank + Math.floor(rank * 0.9);
		hitpoint = 26 + Math.floor(rank * 4);
		hate = 2 + Math.floor((rank + 2) / 6);
		initiative = Math.floor((powBase + intBase) / 3);
	} else if (type === "bomber") {
		strBase = 3 + rank + Math.floor(rank / 10);
		dexBase = 2 + rank + Math.floor(rank / 10);
		powBase = 5 + rank + Math.floor(rank / 10);
		intBase = 7 + rank + Math.floor(rank / 10);
		str = Math.floor(strBase / 3);
		dex = Math.floor(dexBase / 3);
		pow = Math.floor(powBase / 3);
		int = Math.floor(intBase / 3);
		avoid = Math.floor((2 + rank + Math.floor(rank / 5)) / 3) + "+2D";
		resist = Math.floor((5 + rank + Math.floor(rank / 10)) / 3) + "+2D";
		physicalDefense = 3 + rank + Math.floor(rank * 0.3);
		magicalDefense = 5 + rank + Math.floor(rank * 0.9);
		hitpoint = 26 + Math.floor(rank * 4);
		hate = 2 + Math.floor((rank + 2) / 6);
		initiative = Math.floor((dexBase + intBase) / 3) - 2;
	} else {
		showAlert("未対応のエネミータイプです", "red");
		return;
	}

	// エネミーランク(throne)による補正
	fate = 0;
	move = 2;
	if (throne === "mob") {
		hitpoint = Math.floor(hitpoint / 2);
		avoid = eval(avoid.replace("D", "*3"));
		resist = eval(resist.replace("D", "*3"));
	} else if (throne === "single-boss") {
		hitpoint = hitpoint * 4;
		fate = 4;
	} else if (throne === "multi-boss") {
		hitpoint = hitpoint * 2;
		fate = 4;
	} else if (throne === "single-raid-boss") {
		hitpoint = hitpoint * 10;
		fate = 4;
	} else if (throne === "multi-raid-boss") {
		hitpoint = hitpoint * 5;
		fate = 4;
	}

	// フォームに反映
	document.getElementById("enemy-str").value = str;
	document.getElementById("enemy-dex").value = dex;
	document.getElementById("enemy-pow").value = pow;
	document.getElementById("enemy-int").value = int;
	document.getElementById("enemy-avoid").value = avoid;
	document.getElementById("enemy-resist").value = resist;
	document.getElementById("enemy-physical-defense").value = physicalDefense;
	document.getElementById("enemy-magical-defense").value = magicalDefense;
	document.getElementById("enemy-hitpoint").value = hitpoint;
	document.getElementById("enemy-hate").value = hate;
	document.getElementById("enemy-initiative").value = initiative;
	document.getElementById("enemy-move").value = move;
	document.getElementById("enemy-fate").value = fate;

	// ドロップ品期待値を設定
	const dropExpected = getDropExpected(rank);
	if (dropExpected > 0) {
		document.getElementById("drop-expected-value").innerText = `${dropExpected}`;
	}

	// 基本攻撃手段を生成（最初の特技スロットに設定）
	generateBasicSkill(type, rank, throne, str, dex, pow, int, hate);

	// roll-listを更新
	updateRollList();

	showAlert("能力値を自動計算しました。", "green");
}

// 基本攻撃手段を生成
function generateBasicSkill(type, rank, throne, str, dex, pow, int, hate) {
	let hit, damage, tag, roll, target, range, effect, command, diceCount, rollcommand;
	const isMob = throne === "mob";

	if (type === "armorer" || type === "fencer" || type === "grappler") {
		hit = Math.max(str, dex, pow, int) + 2;
		diceCount = 2;
		damage = 9 + Math.floor(rank * 3.5);
		tag = "白兵攻撃";
		roll = isMob ? `対決 (${hit + diceCount * 3}[固定] / 回避)` : `対決 (${hit}+${diceCount}D / 回避)`;
		target = "単体";
		range = type === "grappler" ? "至近" : "至近";
		effect = `対象に[${damage}+2D]の物理ダメージを与える。`;
		rollcommand = isMob ? `c${hit + diceCount * 3} [固定]` : `${diceCount}LH+${hit}`;
		command = `${rollcommand} 基本攻撃手段 命中/回避\n2D+${damage} 基本攻撃手段 ダメージ/物理 ヘイト倍率x${hate}`;
	} else if (type === "supporter") {
		hit = Math.max(str, dex, pow, int) + 2;
		diceCount = 2;
		damage = 1 + Math.floor(rank * 3.5);
		tag = "魔法攻撃";
		roll = isMob ? `対決 (${hit + diceCount * 3}[固定] / 抵抗)` : `対決 (${hit}+${diceCount}D / 抵抗)`;
		target = "単体";
		range = "4Sq";
		effect = `対象に[${damage}+2D]の魔法ダメージを与える。`;
		rollcommand = isMob ? `c${hit + diceCount * 3} [固定]` : `${diceCount}LH+${hit}`;
		command = `${rollcommand} 基本攻撃手段 命中/抵抗\n2D+${damage} 基本攻撃手段 ダメージ/魔法 ヘイト倍率x${hate}`;
	} else if (type === "healer") {
		hit = Math.max(str, dex, pow, int) + 2;
		diceCount = 2;
		damage = 9 + Math.floor(rank * 3.5);
		tag = "白兵攻撃";
		roll = isMob ? `対決 (${hit + diceCount * 3}[固定] / 回避)` : `対決 (${hit}+${diceCount}D / 回避)`;
		target = "単体";
		range = "2Sq";
		effect = `対象に[${damage}+2D]の物理ダメージを与える。`;
		rollcommand = isMob ? `c${hit + diceCount * 3} [固定]` : `${diceCount}LH+${hit}`;
		command = `${rollcommand} 基本攻撃手段 命中/回避\n2D+${damage} 基本攻撃手段 ダメージ/物理 ヘイト倍率x${hate}`;
	} else if (type === "spear") {
		hit = Math.max(str, dex, pow, int) + 1;
		diceCount = 3;
		damage = 19 + Math.floor(rank * 6);
		tag = "白兵攻撃";
		roll = isMob ? `対決 (${hit + diceCount * 3}[固定] / 回避)` : `対決 (${hit}+${diceCount}D / 回避)`;
		target = "単体";
		range = "至近";
		effect = `対象に[${damage}+2D]の物理ダメージを与える。`;
		rollcommand = isMob ? `c${hit + diceCount * 3} [固定]` : `${diceCount}LH+${hit}`;
		command = `${rollcommand} 基本攻撃手段 命中/回避\n2D+${damage} 基本攻撃手段 ダメージ/物理 ヘイト倍率x${hate}`;
	} else if (type === "archer") {
		hit = Math.max(str, dex, pow, int);
		diceCount = 3;
		damage = 19 + Math.floor(rank * 6);
		tag = "射撃攻撃";
		roll = isMob ? `対決 (${hit + diceCount * 3}[固定] / 回避)` : `対決 (${hit}+${diceCount}D / 回避)`;
		target = "単体";
		range = "3Sq";
		effect = `対象に[${damage}+2D]の物理ダメージを与える。`;
		rollcommand = isMob ? `c${hit + diceCount * 3} [固定]` : `${diceCount}LH+${hit}`;
		command = `${rollcommand} 基本攻撃手段 命中/回避\n2D+${damage} 基本攻撃手段 ダメージ/物理 ヘイト倍率x${hate}`;
	} else if (type === "shooter") {
		hit = Math.max(str, dex, pow, int);
		diceCount = 3;
		damage = 11 + Math.floor(rank * 6);
		tag = "魔法攻撃";
		roll = isMob ? `対決 (${hit + diceCount * 3}[固定] / 抵抗)` : `対決 (${hit}+${diceCount}D / 抵抗)`;
		target = "単体";
		range = "4Sq";
		effect = `対象に[${damage}+2D]の魔法ダメージを与える。`;
		rollcommand = isMob ? `c${hit + diceCount * 3} [固定]` : `${diceCount}LH+${hit}`;
		command = `${rollcommand} 基本攻撃手段 命中/抵抗\n2D+${damage} 基本攻撃手段 ダメージ/魔法 ヘイト倍率x${hate}`;
	} else if (type === "bomber") {
		hit = Math.max(str, dex, pow, int);
		diceCount = 3;
		damage = 11 + Math.floor(rank * 6);
		tag = "魔法攻撃";
		roll = isMob ? `対決 (${hit + diceCount * 3}[固定] / 抵抗)` : `対決 (${hit}+${diceCount}D / 抵抗)`;
		target = "範囲(選択)";
		range = "4Sq";
		effect = `対象に[${damage}+2D]の魔法ダメージを与える。`;
		rollcommand = isMob ? `c${hit + diceCount * 3} [固定]` : `${diceCount}LH+${hit}`;
		command = `${rollcommand} 基本攻撃手段 命中/抵抗\n2D+${damage} 基本攻撃手段 ダメージ/魔法 ヘイト倍率x${hate}`;
	}

	// 最初の特技スロットに基本攻撃手段を設定
	if (document.getElementById("skill-name-0")) {
		document.getElementById("skill-name-0").value = "基本攻撃手段";
		document.getElementById("skill-timing-0").value = "メジャー";
		document.getElementById("skill-roll-0").value = roll;
		document.getElementById("skill-target-0").value = target;
		document.getElementById("skill-range-0").value = range;
		document.getElementById("skill-cost-0").value = "なし";
		document.getElementById("skill-limit-0").value = "なし";
		// タグを最初のフィールドに設定
		document.getElementById("skill-tag-0-0").value = tag;
		for (let i = 1; i < 6; i++) {
			document.getElementById(`skill-tag-0-${i}`).value = "";
		}
		document.getElementById("skill-effect-0").value = effect;
		document.getElementById("skill-command-0").value = command;
		updateSkillDisplay(0);
	}
}

// データ保存
function saveData() {
	const data = collectFormData();
	const json = JSON.stringify(data, null, 2);
	const blob = new Blob([json], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `enemy_${data.name || "data"}.json`;
	a.click();
	URL.revokeObjectURL(url);
}

// データ読み込み
function loadData() {
	const input = document.createElement("input");
	input.type = "file";
	input.accept = "application/json";
	input.onchange = (e) => {
		const file = e.target.files[0];
		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const data = JSON.parse(event.target.result);
				populateFormData(data);
				showAlert("データを読み込みました", "green");
			} catch (error) {
				showAlert("データの読み込みに失敗しました", "red");
			}
		};
		reader.readAsText(file);
	};
	input.click();
}

// フォームデータ収集
function collectFormData() {
	const data = {
		name: document.getElementById("enemy-name").value,
		ruby: document.getElementById("enemy-ruby").value,
		rank: document.getElementById("enemy-rank").value,
		race: document.getElementById("enemy-race").value,
		tribe: document.getElementById("enemy-tribe").value,
		popularity: document.getElementById("enemy-popularity").value,
		identification: document.getElementById("enemy-identification").value,
		type: document.getElementById("enemy-type").value,
		throne: document.getElementById("enemy-throne").value,
		tags: [],
		str: document.getElementById("enemy-str").value,
		dex: document.getElementById("enemy-dex").value,
		pow: document.getElementById("enemy-pow").value,
		int: document.getElementById("enemy-int").value,
		avoid: document.getElementById("enemy-avoid").value,
		resist: document.getElementById("enemy-resist").value,
		physicalDefense: document.getElementById("enemy-physical-defense").value,
		magicalDefense: document.getElementById("enemy-magical-defense").value,
		hitpoint: document.getElementById("enemy-hitpoint").value,
		hate: document.getElementById("enemy-hate").value,
		initiative: document.getElementById("enemy-initiative").value,
		move: document.getElementById("enemy-move").value,
		fate: document.getElementById("enemy-fate").value,
		skills: [],
		drop: document.getElementById("enemy-drop").value,
		explain: document.getElementById("enemy-explain").value,
		guide: document.getElementById("enemy-guide").value,
		author: document.getElementById("enemy-author").value,
	};

	for (let i = 0; i < 10; i++) {
		const tag = document.getElementById(`enemy-tag-${i}`).value;
		if (tag) data.tags.push(tag);
	}

	const skillItems = document.querySelectorAll(".skill-item");
	skillItems.forEach((item) => {
		const id = item.id.replace("skill-", "");
		const skillTags = [];
		for (let i = 0; i < 6; i++) {
			const tag = document.getElementById(`skill-tag-${id}-${i}`)?.value;
			if (tag) skillTags.push(tag);
		}
		const skillData = {
			name: document.getElementById(`skill-name-${id}`)?.value || "",
			timing: document.getElementById(`skill-timing-${id}`)?.value || "",
			roll: document.getElementById(`skill-roll-${id}`)?.value || "",
			target: document.getElementById(`skill-target-${id}`)?.value || "",
			range: document.getElementById(`skill-range-${id}`)?.value || "",
			cost: document.getElementById(`skill-cost-${id}`)?.value || "",
			limit: document.getElementById(`skill-limit-${id}`)?.value || "",
			tags: skillTags,
			effect: document.getElementById(`skill-effect-${id}`)?.value || "",
			command: document.getElementById(`skill-command-${id}`)?.value || "",
		};
		if (skillData.name) data.skills.push(skillData);
	});

	return data;
}

// フォームデータを設定
function populateFormData(data) {
	document.getElementById("enemy-name").value = data.name || "";
	document.getElementById("enemy-ruby").value = data.ruby || "";
	document.getElementById("enemy-rank").value = data.rank || "";
	document.getElementById("enemy-race").value = data.race || "";
	document.getElementById("enemy-tribe").value = data.tribe || "";
	document.getElementById("enemy-popularity").value = data.popularity || "";
	document.getElementById("enemy-type").value = data.type || "";
	document.getElementById("enemy-throne").value = data.throne || "";

	if (data.tags) {
		data.tags.forEach((tag, i) => {
			if (i < 10) document.getElementById(`enemy-tag-${i}`).value = tag;
		});
	}

	document.getElementById("enemy-str").value = data.str || 10;
	document.getElementById("enemy-dex").value = data.dex || 10;
	document.getElementById("enemy-pow").value = data.pow || 10;
	document.getElementById("enemy-int").value = data.int || 10;
	document.getElementById("enemy-avoid").value = data.avoid || 10;
	document.getElementById("enemy-resist").value = data.resist || 10;
	document.getElementById("enemy-physical-defense").value = data.physicalDefense || 0;
	document.getElementById("enemy-magical-defense").value = data.magicalDefense || 0;
	document.getElementById("enemy-hitpoint").value = data.hitpoint || 50;
	document.getElementById("enemy-hate").value = data.hate || 1;
	document.getElementById("enemy-initiative").value = data.initiative || 10;
	document.getElementById("enemy-move").value = data.move || 5;
	document.getElementById("enemy-fate").value = data.fate || 1;
	document.getElementById("enemy-drop").value = data.drop || "";
	document.getElementById("enemy-explain").value = data.explain || "";
	document.getElementById("enemy-guide").value = data.guide || "";
	document.getElementById("enemy-author").value = data.author || "";

	data.skills = data.skills.filter((skill) => {
		return skill.name || skill.effect || skill.command;
	});
	if (data.skills) {
		initializeSkills(data.skills.length);
		data.skills.forEach((skill, i) => {
			if (document.getElementById(`skill-name-${i}`)) {
				document.getElementById(`skill-name-${i}`).value = skill.name || "";
				document.getElementById(`skill-timing-${i}`).value = skill.timing || "";
				document.getElementById(`skill-roll-${i}`).value = skill.roll || "";
				document.getElementById(`skill-target-${i}`).value = skill.target || "";
				document.getElementById(`skill-range-${i}`).value = skill.range || "";
				document.getElementById(`skill-cost-${i}`).value = skill.cost || "";
				document.getElementById(`skill-limit-${i}`).value = skill.limit || "";
				// タグを個別フィールドに設定
				const skillTags = Array.isArray(skill.tags) ? skill.tags : skill.tags ? skill.tags.split(",").map((t) => t.trim()) : [];
				for (let j = 0; j < 6; j++) {
					document.getElementById(`skill-tag-${i}-${j}`).value = skillTags[j] || "";
				}
				document.getElementById(`skill-effect-${i}`).value = skill.effect || "";
				document.getElementById(`skill-command-${i}`).value = skill.command || "";
				updateSkillDisplay(i);
			}
		});
	}
	const dropExpected = getDropExpected(parseInt(data.rank));
	if (dropExpected > 0) {
		document.getElementById("drop-expected-value").innerText = `${dropExpected}`;
	}

	updateIdentificationDifficulty();
	updateRollList();
}

// データ公開
function publishData() {
	const password = document.getElementById("enemy-password").value;
	if (!password) {
		showAlert("パスワードを入力してください", "red");
		return;
	}

	const data = collectFormData();

	if (!data.name || !data.rank || !data.race || !data.type || !data.throne) {
		showAlert("必須項目をすべて入力してください", "red");
		return;
	}

	console.log("公開データ:", data);
	showAlert("公開機能は実装中です", "blue");
}

// 特技をプレーンテキスト化
function toSkillPlainText(skill) {
	if (skill.name.length == 0) {
		return "";
	}
	let result = `《${skill.name}》`;
	if (skill.tag && skill.tags.filter((t) => t.length > 0).length > 0) {
		result +=
			"_" +
			skill.tags
				.filter((t) => t.length > 0)
				.map((t) => `[${t}]`)
				.join("");
	}
	if (skill.timing.length > 0) {
		result += "_" + skill.timing;
	}
	if (skill.roll.length > 0) {
		result += "_" + skill.roll;
	}
	if (skill.target.length > 0) {
		result += "_" + skill.target;
	}
	if (skill.range.length > 0) {
		result += "_" + skill.range;
	}
	if (skill.limit.length > 0) {
		result += "_" + skill.limit;
	}
	if (skill.effect.length > 0) {
		result += "_" + skill.effect;
	}
	return result;
}

// ココフォリア出力
function exportCcfolia() {
	const data = collectFormData();

	if (!data.name) {
		showAlert("エネミー名を入力してください", "red");
		return;
	}

	const ccforia = new Ccforia();
	ccforia.setName(data.name);

	// タグ生成
	let tags = "";
	if (data.throne === "single-raid-boss" || data.throne === "multi-raid-boss") {
		tags = "[レイド]";
	} else if (data.throne === "single-boss" || data.throne === "multi-boss") {
		tags = "[ボス]";
	} else if (data.throne === "mob") {
		tags = "[モブ]";
	}

	races = Object.fromEntries(Array.from(document.getElementById("enemy-race").children).map((item) => [item.value, item.text]));
	if (data.race) tags += `[${races[data.race] || data.race}]`;

	if (data.tags && data.tags.length > 0) {
		tags += data.tags
			.filter((t) => t.length > 0)
			.map((t) => `[${t}]`)
			.join("");
	}

	ccforia.setMemo(`${data.name}${data.ruby ? "〈" + data.ruby + "〉" : ""} ランク:${data.rank || "?"}\nタグ:${tags}\n識別難易度:${data.identification || "?"} 【行動力】${data.initiative || "?"}`);
	ccforia.setInitiative(parseInt(data.initiative) || 0);

	ccforia.appendStatus("HP", parseInt(data.hitpoint) || 0, parseInt(data.hitpoint) || 0);
	ccforia.appendStatus("因果力", parseInt(data.fate) || 0, parseInt(data.fate) || 0);

	const physDef = parseInt(data.physicalDefense) || 0;
	const magDef = parseInt(data.magicalDefense) || 0;
	const defense = physDef > magDef ? "物理＞魔法" : physDef < magDef ? "物理＜魔法" : "物理＝魔法";

	let identifyData = `${data.name}${data.ruby ? "〈" + data.ruby + "〉" : ""} ランク:${data.rank || "?"}\nタグ:${tags} 防御:${defense} ヘイト倍率:×${data.hate || "?"} 識別難易度:${data.identification || "?"} \n【行動力】${data.initiative || "?"}【移動力】${data.move || "?"}\n`;
	identifyData += `[特技]\n${data.skills
		.filter((skill) => skill.name && skill.name.length > 0)
		.map((skill) => toSkillPlainText(skill))
		.join("\n")}`;
	ccforia.appendParams("識別後データ", identifyData);
	ccforia.appendParams("解説", data.explain || "");

	let command = "";
	command += "▼判定";

	const avoidStr = String(data.avoid || "");
	if (avoidStr.includes("D")) {
		const result = avoidStr.match(/^(\d+).*?(\d+)D/);
		if (result) {
			command += `\n${result[2]}LH+${result[1]} 回避値`;
		}
	} else {
		command += `\nc${parseInt(data.avoid) || 0} [固定] 回避値`;
	}

	const resistStr = String(data.resist || "");
	if (resistStr.includes("D")) {
		const result = resistStr.match(/^(\d+).*?(\d+)D/);
		if (result) {
			command += `\n${result[2]}LH+${result[1]} 抵抗値`;
		}
	} else {
		command += `\nc${parseInt(data.resist) || 0} [固定] 抵抗値`;
	}

	if (data.throne !== "mob") {
		command += `\n2LH+${data.str || 0} 運動値`;
	} else {
		command += `\nc${(parseInt(data.str) || 0) + 6} [固定] 運動値`;
	}

	command += `\n\n▼特技`;
	data.skills
		.filter((skill) => skill.name && skill.name.length > 0)
		.forEach((skill) => {
			command += `\n${toSkillPlainText(skill)}`;
			if (skill.command && skill.command.length > 0) {
				command += `\n${skill.command}`;
			}
		});

	command += `\n\n▼ドロップ品`;
	if (data.drop && data.drop.length > 0) {
		command += `\n${data.drop}`;
	}

	command += `\n\n▼ステータス`;
	command += `\n【STR】${data.str || "?"} 【DEX】${data.dex || "?"} 【POW】${data.pow || "?"} 【INT】${data.int || "?"}`;
	command += `\n【回避】${data.avoid || "?"} 【抵抗】${data.resist || "?"} 【物理防御力】${data.physicalDefense || "?"} 【魔法防御力】${data.magicalDefense || "?"}`;
	command += `\n【最大HP】${data.hitpoint || "?"} 【ヘイト倍率】×${data.hate || "?"} 【行動力】${data.initiative || "?"} 【移動力】${data.move || "?"} 【因果力】${data.fate || "?"}`;

	command += `\n\n▼その他\n{識別後データ}\n{解説}`;

	ccforia.setCommands(command);

	if (navigator.clipboard) {
		try {
			navigator.clipboard.writeText(ccforia.getJson());
			showAlert("クリップボードにコピーしました。<br>ココフォリアにペーストすることでデータを取り込めます。", "green");
		} catch (err) {
			console.log(err);
			showAlert("クリップボードのコピーに失敗しました。", "red");
		}
	}
}

// 印刷
function printSheet() {
	const data = collectFormData();

	// タグを整形
	const tagsText = data.tags.filter((t) => t).join(" / ");

	// 印刷用HTMLを生成
	let printHTML = `
<!DOCTYPE html>
<html lang="ja">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${data.name || "エネミーデータ"}</title>
	<style>
		@page {
			size: B5;
			margin: 10mm 15mm;
		}
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}
		body {
			font-family: 'Yu Gothic', 'YuGothic', 'Meiryo', sans-serif;
			font-size: 10.5px;
			line-height: 1.7;
			color: #000;
		}
		.container {
			max-width: 100%;
		}
		h1 {
			font-size: 16px;
			font-weight: bold;
			margin-bottom: 3mm;
			padding-bottom: 2mm;
			border-bottom: 2px solid #000;
		}
		h2 {
			font-size: 12px;
			font-weight: bold;
			margin: 4mm 0 2mm 0;
			padding-left: 2mm;
			border-left: 3px solid #333;
		}
		.info-grid {
			display: grid;
			grid-template-columns: auto 1fr auto 1fr;
			gap: 1mm 3mm;
			margin-bottom: 3mm;
			font-size: 10px;
			line-height: 1.6;
		}
		.info-label {
			font-weight: bold;
			white-space: nowrap;
		}
		.info-value {
			
		}
		.tags {
			color: #555;
			font-size: 9.5px;
			margin-bottom: 3mm;
		}
		.skill-item {
			margin-bottom: 3mm;
			page-break-inside: avoid;
		}
		.skill-name {
			font-weight: bold;
			font-size: 11px;
		}
		.skill-tags {
			color: #666;
			font-size: 9px;
			margin-left: 2mm;
		}
		.skill-params {
			font-size: 10px;
			margin: 0.5mm 0;
		}
		.skill-effect {
			font-size: 10px;
			line-height: 1.7;
			text-indent: 1em;
		}
		.description {
			font-size: 10px;
			line-height: 1.7;
			text-indent: 1em;
			white-space: pre-wrap;
		}
		.drop-list {
			font-size: 10px;
			line-height: 1.6;
			white-space: pre-wrap;
		}
	</style>
</head>
<body>
	<div class="container">
		<h1>${data.name || ""}${data.ruby ? " 《" + data.ruby + "》" : ""}</h1>
		
		${tagsText ? '<div class="tags">' + tagsText + "</div>" : ""}
		
		<div class="info-grid">
			<div class="info-label">ランク：</div>
			<div class="info-value">${data.rank || ""}</div>
			<div class="info-label">識別難易度：</div>
			<div class="info-value">${data.identification || ""}</div>
		</div>
		
		<div class="info-grid" style="margin-top: 2mm">
			<div class="info-label">ＳＴＲ：</div>
			<div class="info-value">${data.str || ""}</div>
			<div class="info-label">ＤＥＸ：</div>
			<div class="info-value">${data.dex || ""}</div>
			<div class="info-label">ＰＯＷ：</div>
			<div class="info-value">${data.pow || ""}</div>
			<div class="info-label">ＩＮＴ：</div>
			<div class="info-value">${data.int || ""}</div>
			<div class="info-label">回避：</div>
			<div class="info-value">${data.avoid || ""}</div>
			<div class="info-label">抵抗：</div>
			<div class="info-value">${data.resist || ""}</div>
		</div>
		
		<div class="info-grid" style="margin-top: 2mm">
			<div class="info-label">物理防御力：</div>
			<div class="info-value">${data.physicalDefense || ""}</div>
			<div class="info-label">魔法防御力：</div>
			<div class="info-value">${data.magicalDefense || ""}</div>
			<div class="info-label">最大ＨＰ：</div>
			<div class="info-value">${data.hitpoint || ""}</div>
			<div class="info-label">ヘイト倍率：</div>
			<div class="info-value">×${data.hate || ""}</div>
			<div class="info-label">行動力：</div>
			<div class="info-value">${data.initiative || ""}</div>
			<div class="info-label">移動力：</div>
			<div class="info-value">${data.move || ""}</div>
		</div>
		
		<h2>▼特技</h2>
`;

	// 特技データを追加（公式サイトスタイル）
	data.skills.forEach((skill, index) => {
		if (!skill.name) return;

		const skillTagsText = skill.tags && skill.tags.length > 0 ? "［" + skill.tags.join("］［") + "］＿" : "";

		const paramsText = [skill.timing || "", skill.roll ? `対決（${skill.roll}）` : "", skill.target || "", skill.range || ""].filter((p) => p).join("＿");

		printHTML += `
		<div class="skill-item">
			<div class="skill-name">《${skill.name}》＿${skillTagsText}${paramsText ? paramsText + "＿" : ""}${skill.effect || ""}</div>
		</div>
`;
	});

	printHTML += `
		<h2>▼ドロップ品</h2>
		<div class="drop-list">${data.drop || "なし"}</div>
		
		<h2>▼解説</h2>
		<div class="description">${data.explain || ""}</div>
		
		${data.guide ? '<h2>▼ＧＭ情報</h2><div class="description">' + data.guide + "</div>" : ""}
		
	</div>
	<script>
		window.onload = function() {
			window.print();
			// 印刷ダイアログが閉じられた後にウィンドウを閉じる
			window.onafterprint = function() {
				window.close();
			};
		};
	</script>
</body>
</html>
`;

	// 新しいウィンドウで印刷用HTMLを開く
	const printWindow = window.open("", "_blank");
	if (printWindow) {
		printWindow.document.write(printHTML);
		printWindow.document.close();
	} else {
		showAlert("ポップアップがブロックされました。ポップアップを許可してください。", "red");
	}
}

// リセット
async function resetForm() {
	if (await showConfirm("すべての入力内容をリセットしますか?")) {
		location.reload();
	}
}
// ========================================
// ドロップ生成ヘルパー関数
// ========================================
// ランクに基づく推奨ドロップ期待値を計算
function getRecommendedDropValue() {
	const rank = parseInt(document.getElementById("enemy-rank").value) || 1;
	const throne = document.getElementById("enemy-throne").value;

	let baseValue = rank * CONSTANTS.BASE_DROP_VALUE;

	// ランク種別による補正
	if (throne === "mob") {
		baseValue = Math.round(baseValue * CONSTANTS.DROP_MULTIPLIER.MOB);
	} else if (throne.includes("boss") && !throne.includes("raid")) {
		baseValue = Math.round(baseValue * CONSTANTS.DROP_MULTIPLIER.BOSS);
	} else if (throne.includes("raid")) {
		baseValue = Math.round(baseValue * CONSTANTS.DROP_MULTIPLIER.RAID);
	}

	return baseValue;
}
// 出目範囲を解析して確率を計算
function parseDiceRange(line) {
	// 固定アイテム
	if (line.includes("固定")) {
		return { probability: 1.0, diceCount: 0 };
	}

	// 範囲指定: "1～3：" または "1~3："
	const rangeMatch = line.match(/^(\d+)[～~](\d+)[:：]/);
	if (rangeMatch) {
		const start = parseInt(rangeMatch[1]);
		const end = parseInt(rangeMatch[2]);
		const diceCount = end - start + 1;
		return { probability: diceCount / 6, diceCount: diceCount };
	}

	// 単一の出目: "1：" または "1:"
	const singleMatch = line.match(/^(\d+)[:：]/);
	if (singleMatch) {
		return { probability: 1 / 6, diceCount: 1 };
	}

	// デフォルト（形式不明の場合）
	return { probability: 0, diceCount: 0 };
}

// ドロップ品期待値計算
function calculateDropExpectedValue() {
	// 推奨値を更新
	const recommendedValue = getRecommendedDropValue();
	document.getElementById("drop-recommended-value").textContent = recommendedValue;

	// 現在値を計算
	const dropText = document.getElementById("enemy-drop").value;
	if (!dropText) {
		document.getElementById("drop-expected-value").textContent = "0";
		return;
	}

	let expectedValue = 0;
	const lines = dropText.split("\n").filter((line) => line.trim());

	for (const line of lines) {
		// 金額を抽出 (10G, 15G×2 など)
		const goldMatch = line.match(/（(\d+)G）(?:×(\d+))?/);
		if (!goldMatch) continue;

		const gold = parseInt(goldMatch[1]);
		const count = goldMatch[2] ? parseInt(goldMatch[2]) : 1;
		const totalGold = gold * count;

		// 出目の確率を取得
		const { probability } = parseDiceRange(line);

		// 期待値に加算
		expectedValue += totalGold * probability;
	}

	document.getElementById("drop-expected-value").textContent = Math.round(expectedValue);
}

// ランダムアイテム選択（使用済みアイテムを除外）
function selectRandomItem(diceDrops, usedItems, rankDrops, dice) {
	if (diceDrops.length === 0) {
		const fallbackDrop = findFallbackDrop(rankDrops, dice);
		return fallbackDrop ? fallbackDrop.item : null;
	}

	const availableDrops = diceDrops.filter((d) => !usedItems.has(d.item));
	if (availableDrops.length > 0) {
		return availableDrops[Math.floor(Math.random() * availableDrops.length)].item;
	}

	// 使用可能なアイテムがない場合は全体から選択
	return diceDrops[Math.floor(Math.random() * diceDrops.length)].item;
}

// ========================================
// ドロップ生成メイン関数
// ========================================

// ドロップ品ランダム生成
function generateRandomDrops() {
	if (!dropsDatabase) {
		showAlert("ドロップ品データが読み込まれていません", "red");
		return;
	}

	const enemyRank = parseInt(document.getElementById("enemy-rank").value) || 1;
	const enemyThrone = document.getElementById("enemy-throne").value;

	// ランク別のドロップデータを取得
	const rankDrops = dropsDatabase.drops[enemyRank.toString()];
	if (!rankDrops) {
		showAlert(`ランク${enemyRank}のドロップデータが見つかりません`, "red");
		return;
	}

	const drops = [];

	// ランク種別によって生成方法を変える
	if (enemyThrone === "mob") {
		// モブ: 固定のみ1つ
		const fixedDrops = rankDrops["fixed"] || [];
		if (fixedDrops.length > 0) {
			const randomDrop = fixedDrops[Math.floor(Math.random() * fixedDrops.length)];
			drops.push(`固定：${randomDrop.item}`);
		}
	} else {
		const selectedDrops = {};
		const usedItems = new Set();
		const diceCount = enemyThrone.includes("raid") ? 10 : 6;
		let continueCount = 0;

		for (let dice = 1; dice <= diceCount; dice++) {
			let item;

			if (dice > 1 && selectedDrops[dice - 1] && Math.random() < Math.pow(0.7, continueCount)) {
				item = selectedDrops[dice - 1];
				continueCount++;
			} else {
				// 新規アイテムを選択（既に使用されたものを除く）
				const diceDrops = rankDrops[dice.toString()] || [];
				if (diceDrops.length > 0) {
					// 使用済みでないアイテムをフィルタ
					const availableDrops = diceDrops.filter((d) => !usedItems.has(d.item));
					if (availableDrops.length > 0) {
						item = availableDrops[Math.floor(Math.random() * availableDrops.length)].item;
					} else {
						// 使用可能なアイテムがない場合は全体から選択
						item = diceDrops[Math.floor(Math.random() * diceDrops.length)].item;
					}
				} else {
					const fallbackDrop = findFallbackDrop(rankDrops, dice);
					if (fallbackDrop) {
						item = fallbackDrop.item;
					}
				}
				continueCount = 0;
			}

			if (item) {
				selectedDrops[dice] = item;
				drops.push(`${dice}：${item}`);
				// 前の出目と異なる場合は使用済みリストに追加
				if (dice === 1 || selectedDrops[dice - 1] !== item) {
					usedItems.add(item);
				}
			}
		}

		// 固定があれば追加
		const fixedDrops = rankDrops["fixed"] || [];
		if (fixedDrops.length > 0) {
			const randomDrop = fixedDrops[Math.floor(Math.random() * fixedDrops.length)];
			drops.push(`固定：${randomDrop.item}`);
		}
	}

	// 連続する同じアイテムをまとめる
	const mergedDrops = mergeConsecutiveDrops(drops);

	// テキストエリアに設定
	document.getElementById("enemy-drop").value = mergedDrops.join("\n");
	calculateDropExpectedValue();
	showAlert("ドロップ品を生成しました", "green");
}

// 連続する同じアイテムをまとめる
function mergeConsecutiveDrops(drops) {
	if (drops.length === 0) return drops;

	const merged = [];
	let currentRange = null;

	for (let i = 0; i < drops.length; i++) {
		const match = drops[i].match(/^(\d+|固定)：(.+)$/);
		if (!match) {
			merged.push(drops[i]);
			continue;
		}

		const [, diceStr, item] = match;

		// 固定の場合はそのまま追加
		if (diceStr === "固定") {
			if (currentRange) {
				merged.push(formatRange(currentRange));
				currentRange = null;
			}
			merged.push(drops[i]);
			continue;
		}

		const dice = parseInt(diceStr);

		if (!currentRange) {
			// 新しい範囲を開始
			currentRange = { start: dice, end: dice, item: item };
		} else if (currentRange.item === item && dice === currentRange.end + 1) {
			// 範囲を拡張
			currentRange.end = dice;
		} else {
			// 前の範囲を確定して新しい範囲を開始
			merged.push(formatRange(currentRange));
			currentRange = { start: dice, end: dice, item: item };
		}
	}

	// 最後の範囲を追加
	if (currentRange) {
		merged.push(formatRange(currentRange));
	}

	return merged;
}

// 範囲をフォーマット
function formatRange(range) {
	if (range.start === range.end) {
		return `${range.start}：${range.item}`;
	} else {
		return `${range.start}～${range.end}：${range.item}`;
	}
}

// フォールバックドロップを探す
function findFallbackDrop(rankDrops, targetDice) {
	// 近い出目のドロップを探す
	for (let offset = 1; offset <= 3; offset++) {
		const lowerDice = (targetDice - offset).toString();
		const upperDice = (targetDice + offset).toString();

		if (rankDrops[lowerDice] && rankDrops[lowerDice].length > 0) {
			return rankDrops[lowerDice][Math.floor(Math.random() * rankDrops[lowerDice].length)];
		}
		if (rankDrops[upperDice] && rankDrops[upperDice].length > 0) {
			return rankDrops[upperDice][Math.floor(Math.random() * rankDrops[upperDice].length)];
		}
	}
	return null;
}

// マスターデータ読み込み
async function loadMasterSkills() {
	try {
		const response = await fetch("json/enemy_skills_optimized.json");
		if (response.ok) {
			const data = await response.json();
			masterSkills = data.skills || [];
			console.log(`マスターデータ読み込み成功: ${masterSkills.length}件 (v${data.version})`);
			if (data.meta) {
				console.log(`検索メタデータ: タイミング${data.meta.timings?.length || 0}種, 対象${data.meta.targets?.length || 0}種, 射程${data.meta.ranges?.length || 0}種`);
			}
		} else {
			// フォールバック: サンプルデータ
			console.warn("マスターデータが見つかりません。サンプルデータを使用します。");
			masterSkills = [
				{
					name: "サンプル特技1",
					timing: "メジャー",
					roll: "対決 (10+2D / 回避)",
					target: "単体",
					range: "至近",
					cost: "なし",
					limit: "なし",
					tags: ["白兵攻撃"],
					effect: "サンプルの特技効果です。",
					command: "2LH+10 サンプル特技1\n2D+20 ダメージ",
				},
			];
		}
	} catch (error) {
		console.error("マスターデータ読み込みエラー:", error);
		masterSkills = [];
	}
}

// ドロップ品データベース読み込み
async function loadDropsDatabase() {
	try {
		const response = await fetch("json/drops_database.json");
		if (response.ok) {
			dropsDatabase = await response.json();
			console.log(`ドロップ品データ読み込み成功: ${dropsDatabase.statistics.total_drop_entries}エントリ`);
		} else {
			console.warn("ドロップ品データが見つかりません。");
			dropsDatabase = null;
		}
	} catch (error) {
		console.error("ドロップ品データ読み込みエラー:", error);
		dropsDatabase = null;
	}
}

// 特技カタログを開く
function openSkillCatalog() {
	const modal = document.getElementById("skill-catalog-modal");
	modal.style.display = "flex";
	populateFilterOptions();
	renderSkillCatalog(masterSkills);
}

// 特技カタログを閉じる
function closeSkillCatalog() {
	const modal = document.getElementById("skill-catalog-modal");
	modal.style.display = "none";
	// フィルター情報は維持する
}

// 特技カタログを描画
function renderSkillCatalog(skills) {
	const list = document.getElementById("skill-catalog-list");
	const countEl = document.getElementById("skill-result-count");
	list.innerHTML = "";
	if (countEl) countEl.textContent = skills.length;

	if (skills.length === 0) {
		list.innerHTML = '<div class="catalog-no-result">特技が見つかりませんでした</div>';
		return;
	}

	skills.forEach((skill, index) => {
		const item = document.createElement("div");
		item.className = "catalog-skill-item";
		item.onclick = () => importSkillFromCatalog(skill);

		// 出典情報を右上に配置
		if (skill.from) {
			const fromInfo = document.createElement("div");
			fromInfo.className = "catalog-from-info";

			const crText = skill.from.cr ? `CR${skill.from.cr}` : "CR?";
			fromInfo.innerHTML = `${skill.from.name}<br>${crText} ${skill.from.throne}`;

			if (skill.from.url) {
				fromInfo.classList.add("clickable");
				fromInfo.title = `クリックで公式データを開く\n${skill.from.url}`;
				fromInfo.onclick = (e) => {
					e.stopPropagation();
					window.open(skill.from.url, "_blank");
				};
			}

			item.appendChild(fromInfo);
		}

		// 特技名、タグ、情報を横並びに
		const headerRow = document.createElement("div");
		headerRow.className = "catalog-header-row";

		// 特技名
		const titleSpan = document.createElement("span");
		titleSpan.className = "catalog-title";
		titleSpan.textContent = skill.name;
		headerRow.appendChild(titleSpan);

		// タグ
		const tagsText = Array.isArray(skill.tags) ? skill.tags.map((tag) => `[${tag}]`).join(" ") : skill.tags || "";
		if (tagsText) {
			const tagsSpan = document.createElement("span");
			tagsSpan.className = "catalog-tags";
			tagsSpan.textContent = `${tagsText}`;
			headerRow.appendChild(tagsSpan);
		}

		// タイミング/対象/射程/制限
		const infoItems = [];
		if (skill.timing) infoItems.push(skill.timing);
		if (skill.target) infoItems.push(skill.target);
		if (skill.range) infoItems.push(skill.range);
		if (skill.limit) infoItems.push(skill.limit);

		if (infoItems.length > 0) {
			const infoSpan = document.createElement("span");
			infoSpan.className = "catalog-info";
			infoSpan.textContent = infoItems.join(" / ");
			headerRow.appendChild(infoSpan);
		}

		item.appendChild(headerRow);

		// 効果
		if (skill.effect) {
			const effect = document.createElement("div");
			effect.className = "catalog-effect";
			effect.textContent = skill.effect;
			item.appendChild(effect);
		}

		list.appendChild(item);
	});
}

// フィルターオプションを初期化
function populateFilterOptions() {
	const timings = new Set();
	const targets = new Set();
	const ranges = new Set();

	masterSkills.forEach((skill) => {
		if (skill.timing) timings.add(skill.timing);
		if (skill.target) targets.add(skill.target);
		if (skill.range) ranges.add(skill.range);
	});

	const timingSelect = document.getElementById("filter-timing");
	const tagSelect = document.getElementById("filter-tag");

	// タイミング
	timingSelect.innerHTML = '<option value="">タイミング: すべて</option>';
	Array.from(timings)
		.sort()
		.forEach((timing) => {
			const option = document.createElement("option");
			option.value = timing;
			option.textContent = timing;
			timingSelect.appendChild(option);
		});

	// タグ（特技のタグとボスのタグを合わせる）
	const allTags = new Set();
	masterSkills.forEach((skill) => {
		// 特技のタグ
		if (skill.tags) {
			if (Array.isArray(skill.tags)) {
				skill.tags.forEach((tag) => allTags.add(tag));
			} else {
				allTags.add(skill.tags);
			}
		}
		// ボスのタグ
		if (skill.from && skill.from.tags) {
			if (Array.isArray(skill.from.tags)) {
				skill.from.tags.forEach((tag) => allTags.add(tag));
			} else {
				allTags.add(skill.from.tags);
			}
		}
	});

	// タグの分類定義
	const tagCategories = {
		大種族: ["人型", "自然", "精霊", "幻獣", "不死", "人造", "人間", "ギミック"],
		小種族: ["オーガ", "オーク", "クロックワーク", "コボルド", "ゴブリン", "サファギン", "スパルトイ", "ネイリティー", "ヤカー", "ラットマン", "リザードマン", "冒険者", "吸血鬼", "天狗", "巨人", "恐竜", "植物", "狼", "竜"],
		出自: ["機械", "物品", "天然", "魔法", "典災"],
		ダメージ属性: ["火炎", "冷気", "電撃", "光輝", "邪毒", "精神"],
		武器: ["白兵攻撃", "射撃攻撃", "魔法攻撃", "特殊攻撃", "剣", "槌斧", "槍", "弓"],
		ルール: ["移動", "暗視", "水棲", "封印", "準備", "高位保護", "EXパワー"],
	};

	tagSelect.innerHTML = '<option value="">タグ: すべて</option>';

	// 分類ごとにoptgroupを作成
	Object.keys(tagCategories).forEach((category) => {
		const categoryTags = tagCategories[category].filter((tag) => allTags.has(tag));
		if (categoryTags.length > 0) {
			const optgroup = document.createElement("optgroup");
			optgroup.label = category;
			categoryTags.forEach((tag) => {
				const option = document.createElement("option");
				option.value = tag;
				option.textContent = tag;
				optgroup.appendChild(option);
			});
			tagSelect.appendChild(optgroup);
		}
	});
}

// 詳細フィルター表示切り替え
function toggleDetailFilters() {
	const detailFilters = document.getElementById("detail-filters");
	const toggleBtn = document.querySelector(".detail-filters-toggle-title");
	const isHidden = detailFilters.classList.contains("hidden");

	if (isHidden) {
		detailFilters.classList.remove("hidden");
		toggleBtn.textContent = "詳細フィルター ▲";
	} else {
		detailFilters.classList.add("hidden");
		toggleBtn.textContent = "詳細フィルター ▼";
	}
}

// 対象フィルターの詳細を更新
function updateTargetFilters() {
	const targetType = document.getElementById("filter-target-type").value;
	const countSelect = document.getElementById("filter-target-count");
	const areaSelect = document.getElementById("filter-area-size");
	const selectionSelect = document.getElementById("filter-target-selection");

	// すべて無効化
	countSelect.disabled = true;
	areaSelect.disabled = true;
	selectionSelect.disabled = true;

	// 対象タイプに応じて有効化
	if (targetType === "multiple") {
		countSelect.disabled = false;
	} else if (targetType === "area") {
		areaSelect.disabled = false;
		selectionSelect.disabled = false;
	} else if (targetType === "line") {
		selectionSelect.disabled = false;
	}
}

// 射程フィルターの詳細を更新
function updateRangeFilters() {
	const rangeType = document.getElementById("filter-range-type").value;
	const rangeInput = document.getElementById("filter-range-value");

	if (rangeType === "ranged") {
		rangeInput.disabled = false;
	} else {
		rangeInput.disabled = true;
	}
}

// フィルタークリア
function clearSkillFilters() {
	document.getElementById("filter-timing").value = "";
	document.getElementById("filter-target-type").value = "";
	document.getElementById("filter-range-type").value = "";
	document.getElementById("filter-tag").value = "";
	document.getElementById("filter-effect").value = "";
	document.getElementById("filter-target-count").value = "";
	document.getElementById("filter-area-size").value = "";
	document.getElementById("filter-target-selection").value = "";
	document.getElementById("filter-range-value").value = "";
	document.getElementById("filter-etype").value = "";
	document.getElementById("filter-enemy-name").value = "";
	document.getElementById("filter-throne").value = "";
	document.getElementById("filter-cr-min").value = "";
	document.getElementById("filter-cr-max").value = "";

	updateTargetFilters();
	updateRangeFilters();
	filterSkillCatalog();
}

// 特技カタログをフィルタリング
function filterSkillCatalog() {
	// 基本フィルター
	const timing = document.getElementById("filter-timing").value;
	const targetType = document.getElementById("filter-target-type").value;
	const rangeType = document.getElementById("filter-range-type").value;
	const tag = document.getElementById("filter-tag").value;
	const name = document.getElementById("filter-name").value.toLowerCase();
	const effect = document.getElementById("filter-effect").value.toLowerCase();

	// 詳細フィルター
	const targetCount = document.getElementById("filter-target-count").value;
	const areaSize = document.getElementById("filter-area-size").value;
	const targetSelection = document.getElementById("filter-target-selection").value;
	const rangeValue = document.getElementById("filter-range-value").value.toLowerCase();
	const etype = document.getElementById("filter-etype").value;
	const enemyName = document.getElementById("filter-enemy-name").value.toLowerCase();
	const throne = document.getElementById("filter-throne").value;
	const crMin = parseInt(document.getElementById("filter-cr-min").value) || 0;
	const crMax = parseInt(document.getElementById("filter-cr-max").value) || 999;

	const filtered = masterSkills.filter((skill) => {
		// タイミングフィルター
		if (timing && skill.timing !== timing) {
			return false;
		}

		// 対象タイプフィルター
		if (targetType) {
			const target = skill.target || "";
			if (targetType === "single" && target !== "自身" && target !== "単体") {
				return false;
			}
			if (targetType === "multiple" && !target.match(/\d+体/)) {
				return false;
			}
			if (targetType === "area" && !target.includes("範囲")) {
				return false;
			}
			if (targetType === "line" && !target.includes("直線")) {
				return false;
			}
			if (targetType === "other" && (target === "自身" || target === "単体" || target.match(/\d+体/) || target.includes("範囲") || target.includes("直線"))) {
				return false;
			}
		}

		// 複数体の数フィルター
		if (targetCount) {
			const match = (skill.target || "").match(/(\d+)体/);
			if (!match || match[1] !== targetCount) {
				return false;
			}
		}

		// 範囲の広さフィルター
		if (areaSize && !(skill.target || "").includes(areaSize)) {
			return false;
		}

		// 選択方法フィルター
		if (targetSelection && !(skill.target || "").includes(targetSelection)) {
			return false;
		}

		// 射程タイプフィルター
		if (rangeType) {
			const range = skill.range || "";
			if (rangeType === "close" && range !== "至近") {
				return false;
			}
			if (rangeType === "ranged" && range === "至近") {
				return false;
			}
			if (rangeType === "other" && (range === "至近" || range.match(/\d+sq/))) {
				return false;
			}
		}

		// 射程の値フィルター
		if (rangeValue && !(skill.range || "").toLowerCase().includes(rangeValue)) {
			return false;
		}

		// Eタイプフィルター
		if (etype && (!skill.from || !skill.from.type || skill.from.type !== etype)) {
			return false;
		}

		// タグフィルター（特技のタグとボスのタグの両方を検索）
		if (tag) {
			let tagMatch = false;
			// 特技のタグをチェック
			if (skill.tags) {
				if (Array.isArray(skill.tags)) {
					tagMatch = skill.tags.includes(tag);
				} else {
					tagMatch = skill.tags === tag;
				}
			}
			// ボスのタグをチェック
			if (!tagMatch && skill.from && skill.from.tags) {
				if (Array.isArray(skill.from.tags)) {
					tagMatch = skill.from.tags.includes(tag);
				} else {
					tagMatch = skill.from.tags === tag;
				}
			}
			if (!tagMatch) return false;
		}

		// フィルター
		if (name && (!skill.name || !skill.name.toLowerCase().includes(name))) {
			return false;
		}

		// 効果フィルター
		if (effect && (!skill.effect || !skill.effect.toLowerCase().includes(effect))) {
			return false;
		}

		// エネミー名フィルター（rubyタグ内のふりがなも検索、ひらがなをカタカナとして扱う）
		if (enemyName) {
			if (!skill.from || !skill.from.name || !skill.from.ruby) {
				return false;
			}
			const searchKey = hiraganaToKatakana(enemyName.toLowerCase());
			const enemyNameText = hiraganaToKatakana(skill.from.name.toLowerCase());
			const rubyText = hiraganaToKatakana(skill.from.ruby.toLowerCase());

			if (!enemyNameText.includes(searchKey) && !rubyText.includes(searchKey)) {
				return false;
			}
		}

		// ランクフィルター
		const throneName = throne === "raid-boss" ? "レイド" : throne === "boss" ? "ボス" : throne === "normal" ? "ノーマル" : throne === "mob" ? "モブ" : "";
		if (throneName && (!skill.from || skill.from.throne !== throneName)) {
			return false;
		}

		// CRフィルター
		if (skill.from && skill.from.cr) {
			const skillCr = parseInt(skill.from.cr);
			if (skillCr < crMin || skillCr > crMax) {
				return false;
			}
		}

		return true;
	});
	renderSkillCatalog(filtered);
}

// 特技カタログから特技をインポート
function importSkillFromCatalog(skill) {
	addSkill();
	const newSkillId = skillCounter - 1;

	// トグル設定を取得
	const autoReplaceRoll = document.getElementById("auto-replace-roll")?.checked ?? true;
	const autoReplaceHate = document.getElementById("auto-replace-hate")?.checked ?? true;
	const optimizeDamage = document.getElementById("optimize-damage")?.checked ?? false;
	console.log(`特技「${skill.name}」をインポートします。命中ロール自動置き換え: ${autoReplaceRoll ? "ON" : "OFF"}, ヘイト倍率自動置き換え: ${autoReplaceHate ? "ON" : "OFF"}, ダメージ最適化: ${optimizeDamage ? "ON" : "OFF"}`);

	// 現在のエネミーデータを取得
	const enemyType = document.getElementById("enemy-type").value;
	const enemyThrone = document.getElementById("enemy-throne").value;
	const enemyRank = parseInt(document.getElementById("enemy-rank").value) || 1;
	const enemyStr = parseInt(document.getElementById("enemy-str").value) || 0;
	const enemyDex = parseInt(document.getElementById("enemy-dex").value) || 0;
	const enemyPow = parseInt(document.getElementById("enemy-pow").value) || 0;
	const enemyInt = parseInt(document.getElementById("enemy-int").value) || 0;
	const enemyHate = parseFloat(document.getElementById("enemy-hate").value) || 1;

	// 命中値を計算
	const hitDice = ["spear", "archer", "shooter", "bomber"].includes(enemyType) ? 3 : 2;
	const hitMod = Math.max(enemyStr, enemyDex, enemyPow, enemyInt) + (["archer", "shooter", "bomber"].includes(enemyType) ? 0 : ["spear"].includes(enemyType) ? 1 : 2);

	// 全角文字を半角に正規化（前処理）
	const normalizeText = (text) => {
		if (!text) return text;
		return text.replace(/［/g, "[").replace(/］/g, "]").replace(/（/g, "(").replace(/）/g, ")").replace(/／/g, " / ").replace(/＋/g, "+").replace(/－/g, "-");
	};

	// ダメージ最適化関数
	const optimizeDamageValue = (damageBase, fromRank) => {
		if (!optimizeDamage) return damageBase;

		// 特技元のtype（推定されたtype）を使用
		const sourceType = skill.from?.type || enemyType;

		// 基本攻撃手段のダメージ計算式に基づいて適切なダメージ値を計算
		let calculatedDamage;
		let fromBaseCalculatedDamage;
		if (sourceType === "armorer" || sourceType === "fencer" || sourceType === "grappler" || sourceType === "healer") {
			// 2D物理系: 9 + rank * 3.5
			calculatedDamage = 9 + Math.floor(enemyRank * 3.5);
			fromBaseCalculatedDamage = 9 + Math.floor(fromRank * 3.5);
		} else if (sourceType === "supporter") {
			// 2D魔法系: 1 + rank * 3.5
			calculatedDamage = 1 + Math.floor(enemyRank * 3.5);
			fromBaseCalculatedDamage = 1 + Math.floor(fromRank * 3.5);
		} else if (sourceType === "spear" || sourceType === "archer") {
			// 3D物理系: 19 + rank * 6
			calculatedDamage = 19 + Math.floor(enemyRank * 6);
			fromBaseCalculatedDamage = 19 + Math.floor(fromRank * 6);
		} else if (sourceType === "shooter" || sourceType === "bomber") {
			// 3D魔法系: 11 + rank * 6
			calculatedDamage = 11 + Math.floor(enemyRank * 6);
			fromBaseCalculatedDamage = 11 + Math.floor(fromRank * 6);
		} else {
			// デフォルト（変更なし）
			return damageBase;
		}
		const baseDamageRatio = damageBase / fromBaseCalculatedDamage;
		const optimizedDamage = Math.min(19 + Math.floor(enemyRank * 6), Math.floor(calculatedDamage * baseDamageRatio));

		console.log(`ダメージ最適化: ${damageBase} -> ${optimizedDamage} (type: ${sourceType}, rank: ${enemyRank})`);
		return optimizedDamage;
	};

	// rollとeffectを正規化
	let normalizedRoll = normalizeText(skill.roll || "");
	let normalizedEffect = normalizeText(skill.effect || "");

	// 特技データを設定
	if (document.getElementById(`skill-name-${newSkillId}`)) {
		document.getElementById(`skill-name-${newSkillId}`).value = skill.name;
		document.getElementById(`skill-timing-${newSkillId}`).value = skill.timing || "";

		if (autoReplaceRoll) {
			if (normalizedRoll.match(/対決\s*\(.*?\+.*?D.*?\//)) {
				normalizedRoll = normalizedRoll.replace(/対決\s*\((\d+)\+(\d+)D \/ (.+?)\)/g, (match, mod, dice, target) => {
					if (enemyThrone !== "mob") return `対決 (${hitMod}+${hitDice}D / ${target})`;
					else return `対決 (${hitMod + hitDice * 3}[固定] / ${target})`;
				});
			}
			if (normalizedRoll.match(/対決\s*\(.*?\[固定\].*?\//)) {
				normalizedRoll = normalizedRoll.replace(/対決\s*\((\d+)\[固定\] \/ (.+?)\)/g, (match, mod, target) => {
					if (enemyThrone !== "mob") return `対決 (${hitMod}+${hitDice}D / ${target})`;
					else return `対決 (${hitMod + hitDice * 3}[固定] / ${target})`;
				});
			}
		}
		document.getElementById(`skill-roll-${newSkillId}`).value = normalizedRoll || "";

		document.getElementById(`skill-target-${newSkillId}`).value = skill.target || "";
		document.getElementById(`skill-range-${newSkillId}`).value = skill.range || "";
		document.getElementById(`skill-cost-${newSkillId}`).value = skill.cost || "";
		document.getElementById(`skill-limit-${newSkillId}`).value = skill.limit || "";

		// タグを個別フィールドに設定
		const skillTags = Array.isArray(skill.tags) ? skill.tags : skill.tags ? skill.tags.split(",").map((t) => t.trim()) : [];
		for (let i = 0; i < 6; i++) {
			if (document.getElementById(`skill-tag-${newSkillId}-${i}`)) {
				document.getElementById(`skill-tag-${newSkillId}-${i}`).value = skillTags[i] || "";
			}
		}

		// ダメージ最適化処理
		if (optimizeDamage && normalizedEffect) {
			normalizedEffect = normalizedEffect.replace(/\[(\d+?)\+(\d+?)D\]の(.+?)ダメージ/g, (match, base, dice, type) => {
				const optimizedBase = optimizeDamageValue(parseInt(base), skill.from?.cr || enemyRank);
				return `[${optimizedBase}+${dice}D]の${type}ダメージ`;
			});
		}
		document.getElementById(`skill-effect-${newSkillId}`).value = normalizedEffect || "";

		// コマンド生成
		const commandTexts = [];
		if (normalizedRoll.match(/.*?対決.*?/)) {
			const confrontation = normalizedRoll.match(/.*?対決.*?\((\d+?)\+(.+?)D ?\/ ?(.+?)\)/);
			if (confrontation != null) {
				commandTexts.push(`${confrontation[2]}LH+${confrontation[1]} ${skill.name} 命中/${confrontation[3]}`);
			} else {
				const confrontation2 = normalizedRoll.match(/.*?対決.*?\((.+?)\/(.+?)\)/);
				if (confrontation2 != null) {
					commandTexts.push(`c${confrontation2[1]} ${skill.name} 命中/${confrontation2[2]}`);
				}
			}
			const damageMatch = normalizedEffect.match(/\[(\d+?)\+(\d+?)D\]の(.+?)ダメージを与/);
			if (damageMatch != null) {
				// ヘイト倍率の自動置き換え
				const hateValue = autoReplaceHate ? enemyHate : 1;
				commandTexts.push(`${damageMatch[2]}D+${damageMatch[1]} ${skill.name} ダメージ/${damageMatch[3]} ヘイト倍率:×${hateValue}`);
			}
		}

		let commandValue = commandTexts.join("\n") || "";

		// ヘイト倍率の自動置き換え（既存のコマンドテキストに対しても適用）
		if (autoReplaceHate && commandValue.includes("ヘイト倍率:×")) {
			commandValue = commandValue.replace(/ヘイト倍率:×[\d.]+/g, `ヘイト倍率:×${enemyHate}`);
		}

		document.getElementById(`skill-command-${newSkillId}`).value = commandValue;

		updateSkillDisplay(newSkillId);
	}

	closeSkillCatalog();
	showAlert(`特技「${skill.name}」を追加しました`, "green");
}
