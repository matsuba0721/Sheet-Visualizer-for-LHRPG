$(document).foundation();
let url = new URL(window.location.href);
let uid = url.searchParams.get("uid");
console.log(uid);
get("enemies/data", uid).then((res) => create(res));

function get(strage, uid) {
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

			request.open("GET", "https://lhz-supporter-api-default-rtdb.firebaseio.com/" + strage + "/" + uid + ".json", true);
			request.send();
		} catch (err) {
			console.log(err);
			reject();
		}
	});
}
function create(enemy) {
	const panel = document.getElementById("data");

	const editLink = document.createElement("a");
	editLink.textContent = "編集する";
	editLink.href = "index.html?uid=" + uid;
	editLink.style.float = "right";
	panel.appendChild(editLink);

	const indexDiv = document.createElement("div");
	indexDiv.classList.add("index");
	indexDiv.style.margin = 0;
	indexDiv.style.padding = 0;
	panel.appendChild(indexDiv);

	const nameSpan = document.createElement("span");
	nameSpan.classList.add("indexTitle");
	nameSpan.textContent = enemy.name;
	indexDiv.appendChild(nameSpan);

	const rubySpan = document.createElement("span");
	rubySpan.classList.add("indexRuby");
	rubySpan.textContent = `《${enemy.ruby}》`;
	indexDiv.appendChild(rubySpan);

	const taglist = document.createElement("ul");
	taglist.classList.add("tags");
	indexDiv.appendChild(taglist);

	const tagTypeItem = document.createElement("li");
	tagTypeItem.classList.add("type");
	tagTypeItem.textContent = enemy.typeName;
	taglist.appendChild(tagTypeItem);

	const tags = enemy.throne.includes("raid") > 0 ? ["レイド"] : enemy.throne.includes("boss") > 0 ? ["ボス"] : enemy.throne.includes("mob") > 0 ? ["モブ"] : [];
	tags.push(enemy.raceName);
	tags.push(enemy.tribe);
	tags.concat(enemy.tags)
		.filter((x) => x.length > 0)
		.forEach((tag) => {
			const tagItem = document.createElement("li");
			tagItem.textContent = tag;
			tagItem.classList.add("tag");
			taglist.appendChild(tagItem);
		});

	const propList1 = document.createElement("ul");
	propList1.classList.add("abilities");
	propList1.style.marginBottom = "2px";
	propList1.style.marginTop = "10px";
	propList1.style.marginLeft = "0";
	indexDiv.appendChild(propList1);
	const rankItem = document.createElement("li");
	rankItem.textContent = `ランク：${enemy.rank}`;
	propList1.appendChild(rankItem);
	const popularityItem = document.createElement("li");
	popularityItem.textContent = `識別難易度：${enemy.popularity == 0 ? "自動" : enemy.popularity}`;
	propList1.appendChild(popularityItem);

	const propList2 = document.createElement("ul");
	propList2.classList.add("abilities");
	propList2.style.marginBottom = "2px";
	propList2.style.marginLeft = "0";
	indexDiv.appendChild(propList2);
	const strItem = document.createElement("li");
	strItem.textContent = `ＳＴＲ：${enemy.str}`;
	propList2.appendChild(strItem);
	const dexItem = document.createElement("li");
	dexItem.textContent = `ＤＥＸ：${enemy.dex}`;
	propList2.appendChild(dexItem);
	const powItem = document.createElement("li");
	powItem.textContent = `ＰＯＷ：${enemy.pow}`;
	propList2.appendChild(powItem);
	const intItem = document.createElement("li");
	intItem.textContent = `ＩＮＴ：${enemy.int}`;
	propList2.appendChild(intItem);

	const propList3 = document.createElement("ul");
	propList3.classList.add("abilities");
	propList3.style.marginLeft = "0";
	indexDiv.appendChild(propList3);
	const physicalDefenseItem = document.createElement("li");
	physicalDefenseItem.textContent = `物理防御力：${enemy.physicalDefense}`;
	propList3.appendChild(physicalDefenseItem);
	const magicalDefenseItem = document.createElement("li");
	magicalDefenseItem.textContent = `魔法防御力：${enemy.magicalDefense}`;
	propList3.appendChild(magicalDefenseItem);
	const hitpointItem = document.createElement("li");
	hitpointItem.textContent = `最大ＨＰ：${enemy.hitpoint}`;
	propList3.appendChild(hitpointItem);
	const hateItem = document.createElement("li");
	hateItem.textContent = `ヘイト倍率：×${enemy.hate}`;
	propList3.appendChild(hateItem);
	const initiativeItem = document.createElement("li");
	initiativeItem.textContent = `行動力：${enemy.initiative}`;
	propList3.appendChild(initiativeItem);
	const moveItem = document.createElement("li");
	moveItem.textContent = `移動力：${enemy.str}`;
	propList3.appendChild(moveItem);
	if (enemy.fate > 0) {
		const fateItem = document.createElement("li");
		fateItem.textContent = `因果力：${enemy.fate}`;
		propList3.appendChild(fateItem);
	}

	const skillHeader = document.createElement("h3");
	skillHeader.textContent = "▼特技";
	skillHeader.style.marginTop = "10px";
	skillHeader.style.fontSize = "1.17em";
	skillHeader.style.fontWeight = "bold";
	indexDiv.appendChild(skillHeader);

	const skillDiv = document.createElement("div");
	skillDiv.style.marginTop = "10px";
	indexDiv.appendChild(skillDiv);
	enemy.skills
		.filter((x) => x.name.length > 0)
		.forEach((skill) => {
			const skillPara = document.createElement("p");
			skillPara.style.marginBottom = "2px";
			skillPara.style.marginTop = "0";
			skillPara.innerHTML = toSkillPlainText(skill);
			skillDiv.appendChild(skillPara);
		});

	const dropHeader = document.createElement("h3");
	dropHeader.textContent = "▼ドロップ品";
	dropHeader.style.marginTop = "10px";
	dropHeader.style.fontSize = "1.17em";
	dropHeader.style.fontWeight = "bold";
	indexDiv.appendChild(dropHeader);
	const dropDiv = document.createElement("div");
	dropDiv.style.marginTop = "10px";
	indexDiv.appendChild(dropDiv);
	enemy.drop.split("\n").forEach((x) => {
		const dropPara = document.createElement("p");
		dropPara.style.marginBottom = "2px";
		dropPara.style.marginTop = "0";
		dropPara.innerHTML = x;
		dropDiv.appendChild(dropPara);
	});

	const explainHeader = document.createElement("h3");
	explainHeader.textContent = "▼解説";
	explainHeader.style.marginTop = "10px";
	explainHeader.style.fontSize = "1.17em";
	explainHeader.style.fontWeight = "bold";
	indexDiv.appendChild(explainHeader);
	const explainDiv = document.createElement("div");
	explainDiv.style.marginTop = "10px";
	indexDiv.appendChild(explainDiv);
	explainDiv.innerHTML = enemy.explain;

	const creattionPara = document.createElement("p");
	creattionPara.innerHTML = `作成：${enemy.createDate}　更新：${enemy.updateDate}　製作者：${enemy.author}`;
	creattionPara.style.marginBottom = "0";
	creattionPara.style.fontSize = "0.9em";
	creattionPara.style.textAlign = "right";
	indexDiv.appendChild(creattionPara);
}
function toSkillPlainText(skill) {
	if (skill.name.length == 0) {
		return "";
	}
	let result = `<b>《${skill.name}》</b>`;
	if (skill.tags.filter((t) => t.length > 0).length > 0) {
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
