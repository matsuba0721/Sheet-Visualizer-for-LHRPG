$(function () {
	var li = document.createElement("li");
	li.setAttribute("class", "tag");
	var a = document.createElement("a");
	a.setAttribute("href", "javascript:void(0);");
	a.textContent = "CCFOLIA";
	a.addEventListener("click", function (event) {
		var src = document.getElementsByClassName("tags")[1].children[0].children[0].getAttribute("href");
		getJson(src, function (data) {
			var enemy = JSON.parse(data.slice(6, data.length - 2));
			var cp_data = enemy_cp(enemy);
			var cenemy = new Object();
			cenemy.kind = "character";
			cenemy.data = new Object();
			cenemy.data.name = `${enemy.name}〈${enemy.ruby}〉`;
			cenemy.data.memo = enemy_identify(enemy);
			cenemy.data.initiative = enemy.action - 0.1;
			cenemy.data.externalUrl = location.href;
			cenemy.data.status = [
				{ label: "HP", value: enemy.hit_point, max: enemy.hit_point },
				{ label: "移動力", value: enemy.move, max: 0 },
				{ label: "因果力", value: enemy.fate, max: enemy.fate },
				{ label: "障壁", value: 0, max: 0 },
			];
			cenemy.data.params = [
				{ label: "識別後データ", value: enemy_identified(enemy, cp_data[1]) },
				{ label: "解説", value: enemy.contents },
			];
			cenemy.data.secret = true;
			cenemy.data.invisible = true;
			cenemy.data.hideStatus = false;
			cenemy.data.commands = cp_data[0];

			if (navigator.clipboard) {
				try {
					navigator.clipboard.writeText(JSON.stringify(cenemy));
					alert("クリップボードにコピーしました。ココフォリアにペーストすることでデータを取り込めます。");
				} catch (err) {
					console.log(err);
					alert("クリップボードのコピーに失敗しました。");
				}
			}
		});
	});

	var tags = document.getElementsByClassName("tags");
	tags[1].appendChild(li);
	li.appendChild(a);
});

function getJson(url, func) {
	try {
		var request = new XMLHttpRequest();
		request.ontimeout = function () {
			alert("JSONデータの取得に失敗しました。");
		};
		request.onload = function () {
			var data = this.response;
			func(data);
		};

		request.open("GET", url, true);
		request.send();
	} catch (err) {
		console.log(err);
		alert("JSONデータの取得に失敗しました。");
	}
}

function jsonp(data) {
	var cp_data = enemy_cp(data);
	console.log(cp_data);
	return cp_data[0] + enemy_identify(data, cp_data[1]) + "\n[-------エネミーテキスト-------]\n" + data.contents;
}
function enemy_cp(enemy) {
	var timi = ["常時", "セットアップ", "ムーブ", "マイナー", "メジャー", "メインプロセス", "インスタント", "行動", "本文", "ダメージロール", "ダメージ適用直前", "ダメージ適用直後", "イニシアチブ", "クリンナップ", "判定直前", "判定直後"];
	var avoid;
	var resist;
	var strength;
	var base_data = "";
	var ef_list = "";
	//判定
	if (enemy.avoid_dice == 0) {
		avoid = enemy.avoid + "[固定]";
		strength = 6 + enemy.strength + "[固定]";
	} else {
		avoid = enemy.avoid_dice + "LH+" + enemy.avoid;
		strength = "2LH+" + enemy.strength;
	}
	enemy.resist_dice == 0 ? (resist = enemy.resist + "[固定]") : (resist = enemy.resist_dice + "LH+" + enemy.resist);

	base_data = "▼判定\n" + avoid + " 回避値\n" + resist + " 抵抗値\n" + strength + " 運動値\n\n";
	base_data += `▼ダメージ計算\n:HP-0\n:HP+0\n:HP+${enemy.physical_defense} 物防調整\n:HP+${enemy.magic_defense} 魔防調整\n\n▼特技\n`;
	//特技
	for (var k = 0; k < timi.length; k++) {
		for (var i = 0; i < enemy.skills.length; i++) {
			//《再行動》＿本文＿ラウンド１回＿このエネミーが［行動済］になった時に使用する。即座に［未行動］となり、その後ラウンド終了時まで【行動力】が０となる。
			//《徹甲弾》＿［射撃攻撃］＿メジャー＿対決（４＋３Ｄ／回避）＿単体＿４Ｓｑ＿対象に［２０＋２Ｄ］の貫通ダメージを与える。〔達成値：１８〕対象に［弱点（射撃攻撃）：１０］を与える。この［弱点］はＢＳとして扱う。

			if (enemy.skills[i].timing == timi[k]) {
				enemy.skills[i].function = enemy.skills[i].function.replace(/\s/g, "");
				var tags = "";
				var dice_roll = "";
				for (var j = 0; j < enemy.skills[i].tags.length; j++) {
					tags += "[" + enemy.skills[i].tags[j] + "]";
				}
				if (tags != "") tags += "_";
				var efec = "《" + enemy.skills[i].name + "》_" + tags + enemy.skills[i].timing + "_";
				if (enemy.skills[i].role) {
					enemy.skills[i].role = enemy.skills[i].role.replace(/\s/g, "");
					efec += enemy.skills[i].role + "_";
					//対決(4+3D/回避)
					//対決（12［固定］／抵抗）
					//対決（4＋2D／回避）
					if (enemy.skills[i].role.match(/.*?対決.*?/)) {
						var hantei = enemy.skills[i].role.match(/.*?対決.*?\（(\d+?)\＋(.+?)D\／(.+?)\）/);
						if (hantei != null) {
							dice_roll = hantei[2] + "LH+" + hantei[1] + " " + enemy.skills[i].name + " 命中/" + hantei[3] + "\n";
						} else {
							hantei = enemy.skills[i].role.match(/.*?対決.*?\（(.+?)\／(.+?)\）/);
							//document.box.strbox.value=enemy.skills[i].role;
							dice_roll = hantei[1] + " " + enemy.skills[i].name + " 命中/" + hantei[2] + "\n";
						}
						//[120+2D]の物理ダメージ
						hantei = enemy.skills[i].function.match(/\［(\d+?)\＋(\d+?)D\］の(.+?)ダメージを与/);
						if (hantei != null) {
							dice_roll += hantei[2] + "D+" + hantei[1] + " " + enemy.skills[i].name + " ダメージ/" + hantei[3] + " ヘイト倍率:×" + enemy.hate + "\n";
						}
					}
				}
				if (enemy.skills[i].target) efec += enemy.skills[i].target + "_";
				if (enemy.skills[i].range) efec += enemy.skills[i].range + "_";
				if (enemy.skills[i].limit != null) efec += enemy.skills[i].limit + "_";
				efec += enemy.skills[i].function + "\n";
				ef_list += efec;
				efec += dice_roll;
				base_data += efec;
			}
		}
	}
	//ドロップ品
	var drop = "\n▼ドロップ品\n";
	for (var i = 0; i < enemy.items.length; i++) {
		drop += enemy.items[i].dice + ":" + enemy.items[i].item + "\n";
	}
	base_data += drop;
	//ステータス
	//　【ＳＴＲ】１　【ＤＥＸ】１　【ＰＯＷ】２　【ＩＮＴ】２\n　【回避】１＋２Ｄ　【抵抗】２＋２Ｄ　【物理防御力】４　【魔法防御力】６\n　【最大ＨＰ】２７　【ヘイト倍率】×１　【行動力】４　【移動力】２
	var status =
		"\n▼ステータス\n【STR】" +
		enemy.strength +
		" 【DEX】" +
		enemy.dexterity +
		" 【POW】" +
		enemy.power +
		" 【INT】" +
		enemy.intelligence +
		"\n【回避】" +
		enemy.avoid +
		"+" +
		enemy.avoid_dice +
		"D 【抵抗】" +
		enemy.resist +
		"+" +
		enemy.resist_dice +
		"D 【物理防御力】" +
		enemy.physical_defense +
		" 【魔法防御力】" +
		enemy.magic_defense +
		"\n【最大HP】" +
		enemy.hit_point +
		" 【ヘイト倍率】×" +
		enemy.hate +
		" 【行動力】" +
		enemy.action +
		" 【移動力】" +
		enemy.move +
		" 【因果力】" +
		enemy.fate +
		"\n";
	base_data += status;

	var other = "\n▼その他\n{識別後データ}\n{解説}\n";
	base_data += other;

	return [base_data, ef_list];
}

function enemy_identify(enemy) {
	var pre_data;
	var tags = "";
	for (var i = 0; i < enemy.tags.length; i++) {
		tags += "[" + enemy.tags[i] + "]";
	}
	pre_data = enemy.name + "〈" + enemy.ruby + "〉 ランク:" + enemy.character_rank + "\nタグ:" + tags;
	if (enemy.identification == 0) enemy.identification = "自動";
	pre_data += "\n識別難易度:" + enemy.identification + " 【行動力】" + enemy.action + "\n";
	return pre_data;
}

function enemy_identified(enemy, list) {
	var aft_data;
	var tags = "";
	for (var i = 0; i < enemy.tags.length; i++) {
		tags += "[" + enemy.tags[i] + "]";
	}
	aft_data = enemy.name + "〈" + enemy.ruby + "〉 ランク:" + enemy.character_rank + "\nタグ:" + tags;
	if (enemy.identification == 0) enemy.identification = "自動";
	var num = 6;
	var msg = num < 10 ? "10未満" : "10以上";
	var def = "";
	enemy.physical_defense > enemy.magic_defense ? (def = "＞") : (def = "＜");

	aft_data += " 防御:物理" + def + "魔法 ヘイト倍率:×" + enemy.hate + " 識別難易度:" + enemy.identification + "\n【行動力】" + enemy.action + " 【移動力】" + enemy.move + "\n[特技]\n" + list;
	return aft_data;
}
