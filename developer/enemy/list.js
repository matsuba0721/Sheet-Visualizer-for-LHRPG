$(document).foundation();

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
class Cash {
	constructor() {
		this.loadedDate = 0;
		this.data = {};
	}
}

const ui = new Object();
ui.name = document.getElementById("enemy-name");
ui.rank = document.getElementById("enemy-rank");
ui.race = document.getElementById("enemy-race");
ui.type = document.getElementById("enemy-type");
ui.throne = document.getElementById("enemy-throne");
ui.author = document.getElementById("enemy-author");
ui.search = document.getElementById("search");
ui.table = document.getElementById("enemies");
ui.next = document.getElementById("load-next");

const _raceNames = new Object();
_raceNames.humanoid = "人型";
_raceNames.nature = "自然";
_raceNames.elemental = "精霊";
_raceNames.beast = "幻獣";
_raceNames.undead = "不死";
_raceNames.construct = "人造";
_raceNames.human = "人間";
_raceNames.gimmick = "ギミック";
const _typeNames = new Object();
_typeNames.armorer = "アーマラー";
_typeNames.fencer = "フェンサー";
_typeNames.grappler = "グラップラー";
_typeNames.supporter = "サポーター";
_typeNames.healer = "ヒーラー";
_typeNames.spear = "スピア";
_typeNames.archer = "アーチャー";
_typeNames.shooter = "シューター";
_typeNames.bomber = "ボマー";
const _throneNames = new Object();
_throneNames.normal = "ノーマル";
_throneNames.mob = "モブ";
_throneNames["single-boss"] = "ソロボス";
_throneNames["multi-boss"] = "群れボス";
_throneNames["single-raid-boss"] = "ソロレイドボス";
_throneNames["multi-raid-boss"] = "群れレイドボス";

const _localStorage = new LocalStorage();

let _enemies = [];
let _currrentEnemies = [];
let _currentIndex = 0;

init();

function init() {
	const cash = _localStorage.Read("cashedEnemies", new Cash());
	const date = new Date();
	date.setMinutes(date.getMinutes() - 1);
	ui.search.disabled = true;
	if (cash.loadedDate > date.getTime()) {
		_enemies = cash.data;
		_currrentEnemies = _enemies;
		_currentIndex = 100;
		display(_currrentEnemies.slice(0, _currentIndex));
		console.log("load from cash!");
		ui.search.disabled = false;
	} else {
		get("enemies/profiles")
			.then((res) => {
				_enemies = Object.values(res).sort((a, b) => (a.createDate > b.createDate ? -1 : 1));
				cash.loadedDate = Date.now();
				cash.data = _enemies;
				_localStorage.Write("cashedEnemies", cash);

				_currrentEnemies = _enemies;
				_currentIndex = 100;
				display(_currrentEnemies.slice(0, _currentIndex));
				console.log("load from server!");
			})
			.finally(() => (ui.search.disabled = false));
	}
}

function get(strage) {
	return new Promise((resolve, reject) => {
		try {
			var request = new XMLHttpRequest();
			request.responseType = "json";
			request.ontimeout = function () {
				reject();
			};
			request.onload = function () {
				resolve(this.response);
			};

			request.open("GET", "https://lhz-supporter-api-default-rtdb.firebaseio.com/" + strage + ".json", true);
			request.send();
		} catch (err) {
			console.log(err);
			reject();
		}
	});
}
function display(enemies) {
	for (let index = 0; index < enemies.length; index++) {
		const enemy = enemies[index];
		const tr = document.createElement("tr");
		tr.id = enemy.uid;

		const nameTd = document.createElement("td");
		const namelink = document.createElement("a");
		namelink.href = "view.html?uid=" + enemy.uid;
		namelink.innerHTML = `<b>${enemy.name}</b>《${enemy.ruby}》`;

		const rankTd = document.createElement("td");
		rankTd.innerText = enemy.rank;

		const raceTd = document.createElement("td");
		raceTd.innerText = _raceNames[enemy.race];

		const typeTd = document.createElement("td");
		typeTd.innerText = _typeNames[enemy.type];

		const throneTd = document.createElement("td");
		throneTd.innerText = _throneNames[enemy.throne];

		const tagsTd = document.createElement("td");
		tagsTd.innerText = [enemy.tribe]
			.concat(enemy.tags)
			.filter((x) => x.length > 0)
			.join();

		const authorTd = document.createElement("td");
		authorTd.innerText = enemy.author;

		nameTd.appendChild(namelink);
		tr.appendChild(nameTd);
		tr.appendChild(rankTd);
		tr.appendChild(raceTd);
		tr.appendChild(typeTd);
		tr.appendChild(throneTd);
		tr.appendChild(tagsTd);
		tr.appendChild(authorTd);
		ui.table.appendChild(tr);
	}
}

function search() {
	ui.search.disabled = true;
	while (ui.table.firstChild) {
		ui.table.removeChild(ui.table.firstChild);
	}
	_currrentEnemies = _enemies;
	const nameKey = ui.name.value;
	if (nameKey.length > 0) {
		_currrentEnemies = _currrentEnemies.filter((enemy) => {
			return `${enemy.name}_${enemy.ruby}`.includes(nameKey) > 0;
		});
	}
	const rankKey = ui.rank.value;
	if (rankKey != "none") {
		_currrentEnemies = _currrentEnemies.filter((enemy) => {
			return `${enemy.rank}` == rankKey;
		});
	}
	const raceKey = ui.race.value;
	if (raceKey != "none") {
		_currrentEnemies = _currrentEnemies.filter((enemy) => {
			return enemy.race == raceKey;
		});
	}
	const typeKey = ui.type.value;
	if (typeKey != "none") {
		_currrentEnemies = _currrentEnemies.filter((enemy) => {
			return enemy.type == typeKey;
		});
	}
	const throneKey = ui.throne.value;
	if (throneKey != "none") {
		_currrentEnemies = _currrentEnemies.filter((enemy) => {
			return enemy.throne == throneKey;
		});
	}
	const authorKey = ui.author.value;
	if (authorKey.length > 0) {
		_currrentEnemies = _currrentEnemies.filter((enemy) => {
			return enemy.author.includes(authorKey) > 0;
		});
	}

	_currentIndex = 100;
	display(_currrentEnemies.slice(0, 100));

	ui.search.disabled = false;
}
function next() {
	const n = Math.min(_currentIndex + 100, _currrentEnemies.length);
	display(_currrentEnemies.slice(_currentIndex, n));
	_currentIndex = n;
}
