/**
 * 基本攻撃手段の攻撃種別
 * Javaのenumのように使用することを想定
 * @class AttackType
 */
var AttackType = /** @class */ (function () {
	/**
	 * コンストラクタ
	 * @param {string} label 付加されるタグ
	 * @param {string} role 対抗手段
	 * @memberof AttackType
	 */
	function AttackType(label, role) {
		this.label = label;
		this.role = role;
	}
	AttackType.MELEE = new AttackType("白兵攻撃", "回避");
	AttackType.SHOOTING = new AttackType("射撃攻撃", "回避");
	AttackType.MAGICAL = new AttackType("魔法攻撃", "抵抗");
	return AttackType;
})();
var Enemy = /** @class */ (function () {
	function Enemy() {
		this._cr = 1;
		this._template = EnemyType.ARMOROR.getTemplate();
		this._rank = EnemyRank.NORMAL;
		this._race = EnemyRace.DEMI_HUMAN;
		this._popularity = Popularity.R3;
	}
	Enemy.prototype.setCharacterRank = function (cr) {
		this._cr = cr;
	};
	Enemy.prototype.setType = function (type) {
		this._template = type.getTemplate();
	};
	Enemy.prototype.setRank = function (rank) {
		this._rank = rank;
	};
	Enemy.prototype.setRace = function (race) {
		this._race = race;
	};
	Enemy.prototype.setPopularity = function (popularity) {
		this._popularity = popularity;
	};
	Enemy.prototype.getType = function () {
		return this._template.getType();
	};
	Enemy.prototype.getCr = function () {
		return this._cr;
	};
	Enemy.prototype.getRank = function () {
		return this._rank;
	};
	Enemy.prototype.getRace = function () {
		return this._race;
	};
	Enemy.prototype.getPopularity = function () {
		return this._popularity;
	};
	Enemy.prototype.getIdentificationDifficulty = function () {
		return this.getPopularity().getDifficulty(this.getCr());
	};
	Enemy.prototype.getTags = function () {
		var tags = new Array();
		if (this.getRank().tag != null) {
			tags.push(this.getRank().tag);
		}
		tags.push(this._race.label);
		if (this._race === EnemyRace.GIMIC) {
			tags.push("物品");
		}
		return tags;
	};
	Enemy.prototype.checkError = function () {
		var messages = new Array();
		if (this.getRace() === EnemyRace.GIMIC && this.getRank() !== EnemyRank.NORMAL) {
			messages.push("大種族を「ギミック」にする場合、エネミーランクは「ノーマル」を選択してください。");
		}
		return messages;
	};
	Enemy.prototype.getStr = function () {
		if (this._race === EnemyRace.GIMIC) {
			return 0;
		}
		return this._template.getStr(this._cr);
	};
	Enemy.prototype.getDex = function () {
		if (this._race === EnemyRace.GIMIC) {
			return 0;
		}
		return this._template.getDex(this._cr);
	};
	Enemy.prototype.getPow = function () {
		return this._template.getPow(this._cr);
	};
	Enemy.prototype.getInt = function () {
		return this._template.getInt(this._cr);
	};
	Enemy.prototype.getAvoid = function () {
		if (this._rank === EnemyRank.MOB || this._race === EnemyRace.GIMIC) {
			return format("{0}［固定］", this.getAvoidFix());
		} else {
			return format("{0}+{1}D", this.getAvoidFix(), this.getAvoidDice());
		}
	};
	Enemy.prototype.getAvoidFix = function () {
		var coef = this._template.getAvoid(this._cr) + this.getRank().defenseCorrect;
		if (this._rank === EnemyRank.MOB || this._race === EnemyRace.GIMIC) {
			var dice = this._template.getAvoidDice();
			return coef + dice * 3;
		} else {
			return coef;
		}
	};
	Enemy.prototype.getAvoidDice = function () {
		return this._template.getAvoidDice();
	};
	Enemy.prototype.getResist = function () {
		var coef = this._template.getResist(this._cr) + this.getRank().defenseCorrect;
		var dice = this._template.getResistDice();
		if (this._rank === EnemyRank.MOB || this._race === EnemyRace.GIMIC) {
			return format("{0}［固定］", this.getResistFix());
		} else {
			return format("{0}+{1}D", this.getResistFix(), this.getResistDice());
		}
	};
	Enemy.prototype.getResistFix = function () {
		var coef = this._template.getResist(this._cr) + this.getRank().defenseCorrect;
		if (this._rank === EnemyRank.MOB || this._race === EnemyRace.GIMIC) {
			var dice = this._template.getResistDice();
			return coef + dice * 3;
		} else {
			return coef;
		}
	};
	Enemy.prototype.getResistDice = function () {
		return this._template.getResistDice();
	};
	Enemy.prototype.getPhysicalDefense = function () {
		return this._template.getPhysicalDefense(this._cr);
	};
	Enemy.prototype.getMagicDefense = function () {
		return this._template.getMagicDefense(this._cr);
	};
	Enemy.prototype.getHitPoint = function () {
		var hp = this._template.getHitPoint(this._cr);
		if (this._race === EnemyRace.GIMIC) {
			return Math.floor(hp / 2);
		}
		return Math.floor(hp * this.getRank().hpCoef);
	};
	Enemy.prototype.getHate = function () {
		var hate = 0;
		if (this.getRace() !== EnemyRace.GIMIC) {
			if (this._rank === EnemyRank.MOB || this._rank === EnemyRank.NORMAL) {
				hate = this._template.getHate(this._cr);
			} else {
				hate = this._template.getBossHate(this._cr);
			}
		}
		if (hate === 0) {
			return "なし";
		} else {
			return "×" + hate.toString();
		}
	};
	Enemy.prototype.getForceHate = function () {
		var hate = 0;
		if (this.getRace() !== EnemyRace.GIMIC) {
			if (this._rank === EnemyRank.MOB || this._rank === EnemyRank.NORMAL) {
				hate = this._template.getHate(this.getCr());
			} else {
				hate = this._template.getBossHate(this.getCr());
			}
			hate += this._template.getForceHate(this.getCr());
		}
		if (hate === 0) {
			return "なし";
		} else {
			return "×" + hate.toString();
		}
	};
	Enemy.prototype.getAction = function () {
		if (this._race === EnemyRace.GIMIC) {
			return 0;
		}
		return this._template.getAction(this._cr);
	};
	Enemy.prototype.getMove = function () {
		if (this._race === EnemyRace.GIMIC) {
			return 0;
		}
		return this._template.getMove();
	};
	Enemy.prototype.getFate = function () {
		return this.getRank().fate;
	};
	Enemy.prototype.getGold = function () {
		var gold = this._template.getGold(this._cr);
		if (this._race === EnemyRace.GIMIC) {
			return Math.floor(gold / 2);
		}
		return Math.floor(gold * this.getRank().goldCoef);
	};
	Enemy.prototype.getStubborn = function (rate) {
		if (rate === void 0) {
			rate = 1;
		}
		return Math.floor(this._template.getStubborn(this._rank, this._cr) * rate);
	};
	Enemy.prototype.getAggression = function (rate) {
		if (rate === void 0) {
			rate = 1;
		}
		return Math.floor(this._template.getAggression(this._cr) * rate);
	};
	/**
	 * 達成値（弱）の値を取得
	 * @returns {number} 達成値
	 * @memberof Enemy
	 */
	Enemy.prototype.getAchieved1 = function () {
		return this._template.getAchieved(this._cr) + this._rank.attackCorrect;
	};
	/**
	 * 達成値（中）の値を取得
	 * @returns {number} 達成値
	 * @memberof Enemy
	 */
	Enemy.prototype.getAchieved2 = function () {
		return this.getAchieved1() + 1;
	};
	/**
	 * 達成値（強）の値を取得
	 * @returns {number} 達成値
	 * @memberof Enemy
	 */
	Enemy.prototype.getAchieved3 = function () {
		return this.getAchieved1() + 2;
	};
	Enemy.prototype.getA1 = function () {
		return this._template.getA1(this._cr);
	};
	Enemy.prototype.getA2 = function () {
		return this._template.getA2(this._cr);
	};
	Enemy.prototype.getA3 = function () {
		return this._template.getA3(this._cr);
	};
	Enemy.prototype.getB1 = function () {
		return this._template.getB1(this._cr);
	};
	Enemy.prototype.getB2 = function () {
		return this._template.getB2(this._cr);
	};
	Enemy.prototype.getB3 = function () {
		return this._template.getB3(this._cr);
	};
	Enemy.prototype.getC1 = function () {
		return this._template.getC1(this._cr);
	};
	Enemy.prototype.getC2 = function () {
		return this._template.getC2(this._cr);
	};
	Enemy.prototype.getC3 = function () {
		return this._template.getC3(this._cr);
	};
	Enemy.prototype.getD1 = function () {
		return this._template.getD1(this._cr);
	};
	Enemy.prototype.getD2 = function () {
		return this._template.getD2(this._cr);
	};
	Enemy.prototype.getD3 = function () {
		return this._template.getD3(this._cr);
	};
	Enemy.prototype.getE1 = function () {
		return this._template.getE1(this._cr);
	};
	Enemy.prototype.getE = function () {
		return this._template.getE(this._cr);
	};
	/**
	 * コア素材の価格を取得
	 * @param {number} [adjust=0] IRの増減
	 * @returns {number}
	 * @memberof Enemy
	 */
	Enemy.prototype.getCorePrice = function (adjust) {
		if (adjust === void 0) {
			adjust = 0;
		}
		return this._template.getCorePrice(this._cr + adjust);
	};
	/**
	 * 魔触媒の価格を取得
	 * @param {number} [adjust=0] IRの増減
	 * @returns {number}
	 * @memberof Enemy
	 */
	Enemy.prototype.getCatalystPrice = function (adjust) {
		if (adjust === void 0) {
			adjust = 0;
		}
		return this._template.getCatalystPrice(this._cr + adjust);
	};
	Enemy.prototype.getAttackRole = function () {
		var role = this._template.getRole(this._cr);
		return role + this.getRank().attackCorrect;
	};
	Enemy.prototype.getAttackDice = function () {
		return this._template.getRoleDice();
	};
	Enemy.prototype.getDamage = function (rate) {
		return this._template.getDamage(this._cr, rate);
	};
	Enemy.prototype.getDamageFix = function (rate) {
		return this._template.getDamageFix(this._cr, rate);
	};
	Enemy.prototype.getSkills = function () {
		var skills = new Array();
		Array.prototype.push.apply(skills, this.getRace().getSkills(this));
		skills.push(this.createBasicSkill());
		return skills;
	};
	Enemy.prototype.getRankSkills = function () {
		var skills = new Array();
		Array.prototype.push.apply(skills, this.getRank().getSkills1(this));
		Array.prototype.push.apply(skills, this.getRank().getSkills2(this));
		return skills;
	};
	Enemy.prototype.getTypeSkills = function () {
		var skills = new Array();
		Array.prototype.push.apply(skills, this.getType().getSkills1(this));
		Array.prototype.push.apply(skills, this.getType().getSkills2(this));
		return skills;
	};
	Enemy.prototype.getDesignAdvice = function () {
		var messages = new Array();
		Array.prototype.push.apply(messages, this.getType().getDesignAdvice(this));
		Array.prototype.push.apply(messages, this.getRank().getDesignAdvice(this));
		return messages;
	};
	Enemy.prototype.createBasicSkill = function () {
		var skill = new EnemySkill("基本攻撃手段", "メジャー");
		skill.addTag(this._template.getBasicAttackType().label);
		skill.setRole(this.createBasicRoleLabel());
		skill.setTarget(this._template.getBasicTarget());
		skill.setRange(this._template.getBasicRange());
		skill.setFunction(this.createBasicFunction());
		return skill;
	};
	Enemy.prototype.createBasicRoleLabel = function () {
		var role = this.getAttackRole();
		var dice = this.getAttackDice();
		var type = this._template.getBasicAttackType();
		if (this._rank === EnemyRank.MOB) {
			return "対決 (" + (role + dice * 3) + " [固定] / " + type.role + ")";
		} else {
			return "対決 (" + role + "+" + dice + "D / " + type.role + ")";
		}
	};
	Enemy.prototype.createBasicFunction = function () {
		var damage = this.getDamageFix();
		var dice = this._template.getDamageDice();
		var type = this._template.getBasicAttackType();
		if (type === AttackType.MELEE || type === AttackType.SHOOTING) {
			return "対象に［" + damage + "+" + dice + "D］の物理ダメージを与える。 ";
		} else {
			return "対象に［" + damage + "+" + dice + "D］の魔法ダメージを与える。 ";
		}
	};
	Enemy.prototype.getBasicAttackRole = function () {
		var role = this.getAttackRole();
		var dice = this.getAttackDice();
		if (this._rank === EnemyRank.MOB) {
			return role + dice * 3 + " [固定]";
		} else {
			return role + "+" + dice + "D";
		}
	};
	Enemy.prototype.getBasicAttackDamage = function (rate) {
		var damage = this.getDamageFix(rate);
		var dice = this._template.getDamageDice();
		return damage + "+" + dice + "D";
	};
	return Enemy;
})();
var EnemyBase = /** @class */ (function () {
	function EnemyBase() {
		this._cr = 1;
		this._template = EnemyType.ARMOROR.getTemplate();
		this._rank = EnemyRank.NORMAL;
		this._race = EnemyRace.DEMI_HUMAN;
		this._popularity = Popularity.R3;
	}
	EnemyBase.prototype.setCharacterRank = function (cr) {
		this._cr = cr;
	};
	EnemyBase.prototype.setType = function (type) {
		this._template = type.getTemplate();
	};
	EnemyBase.prototype.setRank = function (rank) {
		this._rank = rank;
	};
	EnemyBase.prototype.setRace = function (race) {
		this._race = race;
	};
	EnemyBase.prototype.setPopularity = function (popularity) {
		this._popularity = popularity;
	};
	EnemyBase.prototype.getType = function () {
		return this._template.getType();
	};
	EnemyBase.prototype.getCr = function () {
		return this._cr;
	};
	EnemyBase.prototype.getRank = function () {
		return this._rank;
	};
	EnemyBase.prototype.getRace = function () {
		return this._race;
	};
	EnemyBase.prototype.getPopularity = function () {
		return this._popularity;
	};
	EnemyBase.prototype.getIdentificationDifficulty = function () {
		return this.getPopularity().getDifficulty(this.getCr());
	};
	EnemyBase.prototype.getStr = function () {
		if (this._race === EnemyRace.GIMIC) {
			return 0;
		}
		return this._template.getStr(this._cr);
	};
	EnemyBase.prototype.getDex = function () {
		if (this._race === EnemyRace.GIMIC) {
			return 0;
		}
		return this._template.getDex(this._cr);
	};
	EnemyBase.prototype.getPow = function () {
		return this._template.getPow(this._cr);
	};
	EnemyBase.prototype.getInt = function () {
		return this._template.getInt(this._cr);
	};
	EnemyBase.prototype.getAvoid = function () {
		var coef = this._template.getAvoid(this._cr) + this.getRank().defenseCorrect;
		var dice = this._template.getAvoidDice();
		if (this._rank === EnemyRank.MOB || this._race === EnemyRace.GIMIC) {
			return format("{0}［固定］", coef + dice * 3);
		} else {
			return format("{0}+{1}D", coef, dice);
		}
	};
	EnemyBase.prototype.getResist = function () {
		var coef = this._template.getResist(this._cr) + this.getRank().defenseCorrect;
		var dice = this._template.getResistDice();
		if (this._rank === EnemyRank.MOB || this._race === EnemyRace.GIMIC) {
			return format("{0}［固定］", coef + dice * 3);
		} else {
			return format("{0}+{1}D", coef, dice);
		}
	};
	EnemyBase.prototype.getPhysicalDefense = function () {
		return this._template.getPhysicalDefense(this._cr);
	};
	EnemyBase.prototype.getMagicDefense = function () {
		return this._template.getMagicDefense(this._cr);
	};
	EnemyBase.prototype.getHitPoint = function () {
		var hp = this._template.getHitPoint(this._cr);
		if (this._race === EnemyRace.GIMIC) {
			return Math.floor(hp / 2);
		}
		return Math.floor(hp * this.getRank().hpCoef);
	};
	EnemyBase.prototype.getHate = function () {
		var hate = 0;
		if (this.getRace() !== EnemyRace.GIMIC) {
			if (this._rank === EnemyRank.BOSS1 || this._rank === EnemyRank.BOSS2) {
				hate = this._template.getBossHate(this._cr);
			} else {
				hate = this._template.getHate(this._cr);
			}
		}
		if (hate === 0) {
			return "なし";
		} else {
			return "×" + hate.toString();
		}
	};
	EnemyBase.prototype.getForceHate = function () {
		var hate = 0;
		if (this.getRace() !== EnemyRace.GIMIC) {
			if (this._rank === EnemyRank.BOSS1 || this._rank === EnemyRank.BOSS2) {
				hate = this._template.getBossHate(this.getCr());
			} else {
				hate = this._template.getHate(this.getCr());
			}
			hate += this._template.getForceHate(this.getCr());
		}
		if (hate === 0) {
			return "なし";
		} else {
			return "×" + hate.toString();
		}
	};
	EnemyBase.prototype.getAction = function () {
		if (this._race === EnemyRace.GIMIC) {
			return 0;
		}
		return this._template.getAction(this._cr);
	};
	EnemyBase.prototype.getMove = function () {
		if (this._race === EnemyRace.GIMIC) {
			return 0;
		}
		return this._template.getMove();
	};
	EnemyBase.prototype.getFate = function () {
		return this.getRank().fate;
	};
	EnemyBase.prototype.getGold = function () {
		var gold = this._template.getGold(this._cr);
		if (this._race === EnemyRace.GIMIC) {
			return Math.floor(gold / 2);
		}
		return Math.floor(gold * this.getRank().goldCoef);
	};
	EnemyBase.prototype.getStubborn = function () {
		return this._template.getStubborn(this._rank, this._cr);
	};
	EnemyBase.prototype.getAggression = function () {
		return this._template.getAggression(this._cr);
	};
	/**
	 * 達成値（弱）の値を取得
	 * @returns {number} 達成値
	 * @memberof Enemy
	 */
	EnemyBase.prototype.getAchieved1 = function () {
		return this._template.getAchieved(this._cr) + this._rank.attackCorrect;
	};
	/**
	 * 達成値（中）の値を取得
	 * @returns {number} 達成値
	 * @memberof Enemy
	 */
	EnemyBase.prototype.getAchieved2 = function () {
		return this.getAchieved1() + 1;
	};
	/**
	 * 達成値（強）の値を取得
	 * @returns {number} 達成値
	 * @memberof Enemy
	 */
	EnemyBase.prototype.getAchieved3 = function () {
		return this.getAchieved1() + 2;
	};
	EnemyBase.prototype.getA1 = function () {
		return this._template.getA1(this._cr);
	};
	EnemyBase.prototype.getA2 = function () {
		return this._template.getA2(this._cr);
	};
	EnemyBase.prototype.getA3 = function () {
		return this._template.getA3(this._cr);
	};
	EnemyBase.prototype.getB1 = function () {
		return this._template.getB1(this._cr);
	};
	EnemyBase.prototype.getB2 = function () {
		return this._template.getB2(this._cr);
	};
	EnemyBase.prototype.getB3 = function () {
		return this._template.getB3(this._cr);
	};
	EnemyBase.prototype.getC1 = function () {
		return this._template.getC1(this._cr);
	};
	EnemyBase.prototype.getC2 = function () {
		return this._template.getC2(this._cr);
	};
	EnemyBase.prototype.getC3 = function () {
		return this._template.getC3(this._cr);
	};
	EnemyBase.prototype.getD1 = function () {
		return this._template.getD1(this._cr);
	};
	EnemyBase.prototype.getD2 = function () {
		return this._template.getD2(this._cr);
	};
	EnemyBase.prototype.getD3 = function () {
		return this._template.getD3(this._cr);
	};
	EnemyBase.prototype.getE = function () {
		return this._template.getE(this._cr);
	};
	EnemyBase.prototype.getAttackRole = function () {
		var role = this._template.getRole(this._cr);
		return role + this.getRank().attackCorrect;
	};
	EnemyBase.prototype.getAttackDice = function () {
		return this._template.getRoleDice();
	};
	EnemyBase.prototype.getDamage = function () {
		return this._template.getDamage(this._cr);
	};
	EnemyBase.prototype.getDamageFix = function () {
		return this._template.getDamageFix(this._cr);
	};
	EnemyBase.prototype.getBasicAttackRole = function () {
		var role = this.getAttackRole();
		var dice = this.getAttackDice();
		if (this._rank === EnemyRank.MOB) {
			return role + dice * 3 + " [固定]";
		} else {
			return role + "+" + dice + "D";
		}
	};
	EnemyBase.prototype.getBasicAttackDamage = function () {
		var damage = this._template.getDamageFix(this._cr);
		var dice = this._template.getDamageDice();
		return damage + "+" + dice + "D";
	};
	return EnemyBase;
})();
/**
 * 大種族
 * Javaのenumのように使用することを想定
 * @class AttackType
 */
var EnemyRace = /** @class */ (function () {
	/**
	 * コンストラクタ
	 * @param {string} label 表示名
	 * @memberof EnemyRace
	 */
	function EnemyRace(label) {
		this.label = label;
		EnemyRace._values.push(this);
	}
	/**
	 * 大種族一覧を取得
	 * @static
	 * @returns {Array<EnemyRace>} 大種族一覧
	 * @memberof EnemyRace
	 */
	EnemyRace.values = function () {
		return EnemyRace._values;
	};
	/**
	 * 自動取得特技の一覧を取得
	 * @param {Enemy} enemy 対象エネミー
	 * @returns {Array<EnemySkill>} 特技一覧
	 * @memberof EnemyRace
	 */
	EnemyRace.prototype.getSkills = function (enemy) {
		var skills = new Array();
		if (this === EnemyRace.GIMIC) {
			var s = new EnemySkill("意志なき機構", "常時");
			s.createFunction(
				"このエネミーの攻撃ではヘイトダメージが発生せず［ヘイトアンダー］の防御ボーナスも得られない。また、このエネミーを対象として「解除難易度：{0}」の《プロップ解除》に成功すると、このエネミーは［戦闘不能］となる。さらにこのエネミーはムーブアクションを持たない。",
				enemy.getE(),
			);
			skills.push(s);
		}
		return skills;
	};
	EnemyRace._values = new Array();
	EnemyRace.DEMI_HUMAN = new EnemyRace("人型");
	EnemyRace.NATURE = new EnemyRace("自然");
	EnemyRace.SPILIT = new EnemyRace("精霊");
	EnemyRace.CRYPTID = new EnemyRace("幻獣");
	EnemyRace.UNDEAD = new EnemyRace("不死");
	EnemyRace.ARTIFICIAL = new EnemyRace("人造");
	EnemyRace.HUMAN = new EnemyRace("人間");
	EnemyRace.GIMIC = new EnemyRace("ギミック");
	return EnemyRace;
})();
/**
 * エネミーランク
 * Javaのenumのように使用することを想定
 * @class EnemyRank
 */
var EnemyRank = /** @class */ (function () {
	/**
	 * コンストラクタ
	 * @param {string} label 表示名
	 * @param {string} tag 付加されるタグ
	 * @param {number} hpCoef HP係数
	 * @param {number} stubbornCoef しぶとさ係数
	 * @param {number} goldCoef Gold係数
	 * @param {number} fate 取得因果力
	 * @param {number} attackCorrect 攻撃力加算固定値
	 * @param {number} defenseCorrect 防御力加算固定値
	 * @param {number} aggressionCoef 攻撃性係数
	 * @memberof EnemyRank
	 */
	function EnemyRank(label, tag, hpCoef, stubbornCoef, goldCoef, fate, attackCorrect, defenseCorrect, aggressionCoef) {
		this.label = label;
		this.tag = tag;
		this.hpCoef = hpCoef;
		this.stubbornCoef = stubbornCoef;
		this.goldCoef = goldCoef;
		this.fate = fate;
		this.attackCorrect = attackCorrect;
		this.defenseCorrect = defenseCorrect;
		this.aggressionCoef = aggressionCoef == null ? 1 : aggressionCoef;
		EnemyRank._values.push(this);
	}
	/**
	 * エネミーランク一覧を取得
	 * @static
	 * @returns {Array<EnemyRank>} エネミーランク一覧
	 * @memberof EnemyRank
	 */
	EnemyRank.values = function () {
		return EnemyRank._values;
	};
	/**
	 * 特技（実装例）一覧を取得
	 * @param {Enemy} enemy 対象エネミー
	 * @returns {Array<EnemySkill>} 特技一覧
	 * @memberof EnemyRank
	 */
	EnemyRank.prototype.getSkills1 = function (enemy) {
		var skills = new Array();
		if (this === EnemyRank.BOSS1) {
			var s1 = new EnemySkill("再行動", "本文");
			s1.setLimit("ラウンド1回");
			s1.setFunction("このエネミーが［行動済］になった時に使用する。即座に［未行動］となり、その後ラウンド終了時まで【行動力】が0となる。");
			skills.push(s1);
			var s2 = new EnemySkill("孤高の一撃", "クリンナップ");
			s2.setRole("自動成功");
			s2.setTarget(Target.MULTI1);
			s2.setRange(0);
			s2.createFunction("{0}点の直接ダメージを与える。このエネミーは自身のBSを1つ解除しても良い。", enemy.getA2());
			s2.setRemarks("タイミングをセットアップに変更してもよい（弱い推奨）。");
			skills.push(s2);
		}
		if (this === EnemyRank.BOSS2) {
			var s1 = new EnemySkill("再行動Ⅰ", "本文");
			s1.setLimit("ラウンド1回");
			s1.setFunction("このエネミーが［行動済］になった時に使用する。即座に［未行動］となり、その後ラウンド終了時まで【行動力】が0となる。");
			skills.push(s1);
			var s2 = new EnemySkill("再行動Ⅱ", "本文");
			s2.setTarget(Target.SINGLE);
			s2.setLimit("ラウンド1回");
			s2.setFunction("対象が［行動済］になった時に使用する。対象は即座に［未行動］となり、その後ラウンド終了時まで【行動力】が0となる。");
			s2.setRemarks("《再行動》はいずれかひとつを選択して取得すること。");
			skills.push(s2);
			var s3 = new EnemySkill("近衛兵配置", "常時");
			s3.setFunction("このエネミーはシーン登場時に、〈通常エネミー名〉（配下エネミーと呼ぶ）2体を任意の位置に配置できる。配下エネミーからはドロップ品を入手できない。");
			s3.setRemarks("配下エネミー1体は〈モブエネミー名〉2体に置き換えても良い。");
			skills.push(s3);
		}
		if (this === EnemyRank.RAID1) {
			var s1 = new EnemySkill("レイドボスの多段階行動", "本文");
			s1.setLimit("ラウンド2回");
			s1.setFunction("このエネミーが［行動済］になった時に使用する。このエネミーは即座に［未行動］となる。この行動を使うのがラウンド初めてなら【行動力】が5となる。2回目なら【行動力】が0となる。【行動力】の変更はラウンド終了時まで持続する。");
			skills.push(s1);
			var s2 = new EnemySkill("孤高の一撃", "クリンナップ");
			s2.setRole("自動成功");
			s2.setTarget(Target.MULTI1);
			s2.setRange(0);
			s2.createFunction("{0}点の直接ダメージを与える。このエネミーは自身のBSを2つ解除しても良い。", enemy.getA2());
			s2.setRemarks("タイミングをセットアップに変更してもよい（弱い推奨）。");
			skills.push(s2);
		}
		if (this === EnemyRank.RAID2) {
			var s1 = new EnemySkill("再行動", "本文");
			s1.setLimit("ラウンド1回");
			s1.setFunction("このエネミーが［行動済］になった時に使用する。即座に［未行動］となり、その後ラウンド終了時まで【行動力】が0となる。");
			skills.push(s1);
		}
		if (this === EnemyRank.RAID3) {
			var s1 = new EnemySkill("王と二騎士", "常時");
			s1.setFunction("このエネミーはシーン登場時に、〈通常エネミー名〉2体（配下エネミーと呼ぶ）を任意の位置に配置できる。この配下エネミーは【最大HP】が+100されている。また配下エネミーからはドロップ品を入手できない。");
			skills.push(s1);
			var s2 = new EnemySkill("再行動", "本文");
			s2.setLimit("ラウンド1回");
			s2.setFunction("このエネミーが［行動済］になった時に使用する。即座に［未行動］となり、その後ラウンド終了時まで【行動力】が0となる。");
			skills.push(s2);
			var s3 = new EnemySkill("孤高の一撃", "クリンナップ");
			s3.setRole("自動成功");
			s3.setTarget(Target.MULTI1);
			s3.setRange(0);
			s3.createFunction("{0}点の直接ダメージを与える。このエネミーは自身のBSを2つ解除しても良い。", enemy.getA2());
			s3.setRemarks("タイミングをセットアップに変更してもよい（弱い推奨）。");
			skills.push(s3);
		}
		if (this === EnemyRank.RAID4) {
			var s1 = new EnemySkill("わんさか配下", "常時");
			s1.setFunction("このエネミーはシーン登場時に、〈通常エネミー名〉3体（配下エネミーと呼ぶ）を任意の位置に配置できる。配下エネミーからはドロップ品を入手できない。このエネミーが［戦闘不能］になったとき配下エネミーは同時にすべて［戦闘不能］になる。");
			s1.setRemarks("配下エネミー1体は〈モブエネミー名〉2体に置き換えても良い。");
			skills.push(s1);
			var s2 = new EnemySkill("再行動", "本文");
			s2.setLimit("ラウンド1回");
			s2.setFunction("このエネミーが［行動済］になった時に使用する。即座に［未行動］となり、その後ラウンド終了時まで【行動力】が0となる。");
			skills.push(s2);
			var s3 = new EnemySkill("統率行動", "メインプロセス");
			s3.setRole("判定無し");
			s3.setTarget(Target.TARGET4);
			s3.setRange(20);
			s3.setLimit("ラウンド1回");
			s3.setFunction("〈通常エネミー名〉および〈モブエネミー名〉を対象として選択する。対象は即座にメインプロセスを1回ずつ行う。ただし対象はこのメインプロセスで【因果力】を使用できない。");
			skills.push(s3);
			var s4 = new EnemySkill("お供召喚", "クリンナップ");
			s4.setFunction("このエネミーは自身のBS2つを解除してもよい。またこのエネミーから4Sq以上離れた任意のSqに〈モブエネミー名〉2体までを［行動済み］で配置できる。〈モブエネミー名〉はシーン中合計6体までしか存在できず、《わんさか配下》の効果で配置されたかのように扱う。");
			skills.push(s4);
		}
		return skills;
	};
	/**
	 * 特技（デザイン時処理の候補）一覧を取得
	 * @param {Enemy} enemy 対象エネミー
	 * @returns {Array<EnemySkill>} 特技一覧
	 * @memberof EnemyRank
	 */
	EnemyRank.prototype.getSkills2 = function (enemy) {
		var skills = new Array();
		if (this !== EnemyRank.MOB && this !== EnemyRank.NORMAL) {
			var s = new EnemySkill("一騎当千", "デザイン時処理");
			s.setFunction("〔因果力１〕この攻撃を「対象：範囲（選択）」に変更する。");
			s.setRemarks("メジャーアクションの特技に適用すること。");
			skills.push(s);
		}
		return skills;
	};
	/**
	 * デザインアドバイスを取得
	 * @param {Enemy} enemy 対象エネミー
	 * @returns {Array<string>} メッセージ一覧
	 * @memberof EnemyRank
	 */
	EnemyRank.prototype.getDesignAdvice = function (enemy) {
		var messages = new Array();
		if (this === EnemyRank.BOSS1) {
			messages.push("ボス（ソロ）は単体で登場するボスエネミーを表す。エネミータイプ1～5に適用する場合、火力不足に注意すること。また、ボスはユニークな存在なので、他のTypeのデザイン時処理や特技を1つ程度持ち込んでも良いだろう。");
		}
		if (this === EnemyRank.BOSS2) {
			messages.push("ボス（群れ）は配下を引き連れて体で登場するボスエネミーを表す。ボスのタイプとマッチするように配下を設定することが望ましい。また、ボスはユニークな存在なので、他のTypeのデザイン時処理や特技を1つ程度持ち込んでも良いだろう。");
		}
		if (this === EnemyRank.RAID1) {
			messages.push(
				"ボス（ソロ）は、単体で登場するレイドボスを表す。エネミータイプ1～5に適用する場合、火力不足に注意すること。メジャーの行動は最低3種もつ。典型的にはAはシーン攻撃：Bは広範囲1：Cは単体。［部隊］タグに直接影響する攻撃を1つ以上もつ。高い確率で流れを変える行動をもつ。典型的にはHPが1/3時点で追加行動や凶暴化。また、ボスはユニークな存在なので、他のTypeのデザイン時処理や特技を1つ程度持ち込んでも良いだろう。",
			);
		}
		if (this === EnemyRank.RAID2) {
			messages.push(
				"ボス（双子）は、2体1組で登場するレイドボスを表す。メジャーの行動は最低3種もつ。典型的にはAはシーン攻撃：Bは広範囲1：Cは単体。［部隊］タグに直接影響する攻撃を1つ以上もつ。　高い確率で互いを回復、あるいは援護する特技をもつ。また、ボスはユニークな存在なので、他のTypeのデザイン時処理や特技を1つ程度持ち込んでも良いだろう。",
			);
		}
		if (this === EnemyRank.RAID3) {
			messages.push(
				"ボス（王と2騎士）は、2体のノーマルエネミーを引き連れて登場するレイドボスを表す。メジャーの行動は最低3種もつ。典型的にはAはシーン攻撃：Bは広範囲1：Cは単体。［部隊］タグに直接影響する攻撃を1つ以上もつ。　高い確率で2騎士を回復したり動かしたり援護する能力を持つ。また、ボスはユニークな存在なので、他のTypeのデザイン時処理や特技を1つ程度持ち込んでも良いだろう。",
			);
		}
		if (this === EnemyRank.RAID3) {
			messages.push(
				"ボス（統率者と軍勢）は、6体のモブもしくは3体のノーマルエネミーを引き連れて登場するレイドボスを表す。メジャーの行動は最低2種もつ。典型的にはAはシーン攻撃：Bは広範囲1：Cは単体。［部隊］タグに直接影響する攻撃を1つ以上もつ。また、ボスはユニークな存在なので、他のTypeのデザイン時処理や特技を1つ程度持ち込んでも良いだろう。",
			);
		}
		return messages;
	};
	EnemyRank._values = new Array();
	EnemyRank.MOB = new EnemyRank("モブ", "モブ", 0.5, 4, 0.5, 0, 0, 0, 1);
	EnemyRank.NORMAL = new EnemyRank("ノーマル", null, 1, 8, 1, 0, 0, 0, 1);
	EnemyRank.BOSS1 = new EnemyRank("ボス（ソロ）", "ボス", 4, 40, 4, 4, 0, 0, 1);
	EnemyRank.BOSS2 = new EnemyRank("ボス（群れ）", "ボス", 2, 20, 4, 4, 0, 0, 1);
	EnemyRank.RAID1 = new EnemyRank("レイド（ソロ）", "レイド", 10, 80, 4, 4, 2, 2, 1);
	EnemyRank.RAID2 = new EnemyRank("レイド（双子）", "レイド", 5, 40, 4, 4, 2, 2, 1);
	EnemyRank.RAID3 = new EnemyRank("レイド（王と2騎士）", "レイド", 8, 60, 4, 4, 2, 2, 1);
	EnemyRank.RAID4 = new EnemyRank("レイド（統率者と軍勢）", "レイド", 7, 56, 4, 4, 2, 2, 1);
	return EnemyRank;
})();
/**
 * エネミー特技
 * @class EnemySkill
 */
var EnemySkill = /** @class */ (function () {
	/**
	 * コンストラクタ
	 * @param {string} name 特技名称
	 * @param {string} timing タイミング
	 * @memberof EnemySkill
	 */
	function EnemySkill(name, timing) {
		this._name = name;
		this._timing = timing;
		this._tags = new Array();
	}
	/**
	 * 効果、解説のテキストを変数を用いて生成
	 * @param {string} f
	 * @param {...any[]} args
	 * @memberof EnemySkill
	 */
	EnemySkill.prototype.createFunction = function (f) {
		var args = [];
		for (var _i = 1; _i < arguments.length; _i++) {
			args[_i - 1] = arguments[_i];
		}
		this.setFunction(format.apply(void 0, [f].concat(args)));
	};
	EnemySkill.prototype.getName = function () {
		return this._name;
	};
	EnemySkill.prototype.setName = function (name) {
		this._name = name;
	};
	EnemySkill.prototype.getTiming = function () {
		return this._timing;
	};
	EnemySkill.prototype.setTiming = function (timing) {
		this._timing = timing;
	};
	EnemySkill.prototype.getRole = function () {
		return this._role;
	};
	EnemySkill.prototype.setRole = function (role) {
		this._role = role;
	};
	EnemySkill.prototype.getTarget = function () {
		return this._target;
	};
	EnemySkill.prototype.setTarget = function (target) {
		this._target = target;
	};
	EnemySkill.prototype.getRange = function () {
		return this._range;
	};
	EnemySkill.prototype.setRange = function (range) {
		this._range = range;
	};
	EnemySkill.prototype.getRangeLabel = function () {
		return this._range === 0 ? "至近" : this._range + "Sq";
	};
	EnemySkill.prototype.getLimit = function () {
		return this._limit;
	};
	EnemySkill.prototype.setLimit = function (limit) {
		this._limit = limit;
	};
	EnemySkill.prototype.getFunction = function () {
		return this._function;
	};
	EnemySkill.prototype.setFunction = function (func) {
		this._function = func;
	};
	EnemySkill.prototype.getRemarks = function () {
		return this._remarks;
	};
	EnemySkill.prototype.setRemarks = function (remarks) {
		this._remarks = remarks;
	};
	EnemySkill.prototype.getTags = function () {
		return this._tags;
	};
	EnemySkill.prototype.setTags = function (tags) {
		this._tags = tags;
	};
	EnemySkill.prototype.addTag = function () {
		var tags = [];
		for (var _i = 0; _i < arguments.length; _i++) {
			tags[_i] = arguments[_i];
		}
		Array.prototype.push.apply(this._tags, tags);
	};
	/**
	 * 表示用の文字列を取得
	 * @returns {string} 表示用の文字列
	 * @memberof EnemySkill
	 */
	EnemySkill.prototype.toString = function () {
		var str = "《" + this.getName() + "》";
		if (this._tags.length > 0) {
			str += "＿";
			for (var _i = 0, _a = this._tags; _i < _a.length; _i++) {
				var tag = _a[_i];
				str += "［" + tag + "］";
			}
		}
		if (this.getTiming() != null) {
			str += "＿" + this.getTiming();
		}
		if (this.getRole() != null) {
			str += "＿" + this.getRole();
		}
		if (this.getTarget() != null) {
			str += "＿" + this.getTarget().label;
		}
		if (this.getRange() != null) {
			str += "＿" + this.getRangeLabel();
		}
		if (this.getLimit() != null) {
			str += "＿" + this.getLimit();
		}
		str += "＿";
		str += this.getFunction();
		return str;
	};
	return EnemySkill;
})();
/**
 * エネミータイプ
 * Javaのenumのように使用することを想定
 * @class AttackType
 */
var EnemyType = /** @class */ (function () {
	/**
	 * コンストラクタ
	 * @param {string} label 表示名
	 * @memberof EnemyType
	 */
	function EnemyType(str, num) {
		this.typeNumber = num;
		this.typeName = "Type-" + num;
		this.label = this.typeName + " " + str;
		EnemyType._values.push(this);
	}
	/**
	 * タイプに該当するテンプレートデータを取得
	 * @returns {TemplateData} テンプレートデータ
	 * @memberof EnemyType
	 */
	EnemyType.prototype.getTemplate = function () {
		if (this.template == null) {
			this.template = new TemplateData(this);
		}
		return this.template;
	};
	/**
	 * エネミータイプ一覧を取得
	 * @static
	 * @returns {Array < EnemyType >} エネミータイプ一覧
	 * @memberof EnemyType
	 */
	EnemyType.values = function () {
		return EnemyType._values;
	};
	/**
	 * 特技（実装例）一覧を取得
	 * @param {Enemy} enemy 対象エネミー
	 * @returns {Array<EnemySkill>} 特技一覧
	 * @memberof EnemyType
	 */
	EnemyType.prototype.getSkills1 = function (enemy) {
		var skills = new Array();
		if (this === EnemyType.ARMOROR) {
			var s1 = new EnemySkill("みんな固いよ", "セットアップ");
			s1.setTarget(Target.MULTI20);
			s1.setRange(0);
			s1.createFunction("対象は［軽減：{0}］を得る。この［軽減］は、このエネミーが［死亡］か［戦闘不能］になると解除される。", enemy.getD3());
			skills.push(s1);
			var s2 = new EnemySkill("近くを守るよ", "セットアップ");
			s2.setTarget(Target.MULTI);
			s2.setRange(0);
			s2.createFunction("対象は［軽減：{0}］を得る。この［軽減］は、対象がこのエネミーと別のSqに離れるか、もしくはラウンド終了時まで持続する。", enemy.getA2());
			s2.setRemarks("この特技を取得させる場合、【物理防御力】を［軽減］の5割程度、【魔法防御力】を［軽減］の7割程度低下させておくこと。");
			skills.push(s2);
			var s3 = new EnemySkill("移動させないよ", "本文");
			s3.setRole("自動成功");
			s3.setTarget(Target.SINGLE);
			s3.setRange(0);
			s3.setLimit("シーン1回");
			s3.setFunction("対象が［移動］タグをもつ行動を実行しようとした時に使用する。その行動は失敗する。");
			skills.push(s3);
		}
		if (this === EnemyType.FENCER) {
			var s1 = new EnemySkill("仲間を殴るなよ", "ダメージ適用直後");
			s1.setRole("自動成功");
			s1.setTarget(Target.SINGLE);
			s1.setRange(2);
			s1.createFunction("自分以外の味方が攻撃を受けた直後に使用する。その攻撃を行ったキャラクターを対象として{0}点の直接ダメージを与える。", enemy.getB2());
			skills.push(s1);
			var s2 = new EnemySkill("ただでは死なない", "本文");
			s2.setTarget(Target.SINGLE);
			s2.setRange(2);
			s2.setLimit("シーン1回");
			s2.createFunction("このエネミーが［戦闘不能］になった時に使用できる。このエネミーを［戦闘不能］にしたキャラクターを対象として、{0}点の直接ダメージを与える。", enemy.getC3());
			skills.push(s2);
			var s3 = new EnemySkill("こっちにこいよ", "マイナー");
			s3.setRole("自動成功");
			s3.setTarget(Target.MULTI1);
			s3.setRange(0);
			s3.setLimit("シーン1回");
			s3.setFunction("対象をこのエネミーのいるSqに［即時移動（強制）］させる。");
			skills.push(s3);
		}
		if (this === EnemyType.GRAPPLER) {
			var s1 = new EnemySkill("仲間をかばうよ", "ダメージ適用直前");
			s1.setTarget(Target.SINGLE);
			s1.setRange(2);
			s1.setLimit("ラウンド1回");
			s1.createFunction("このエネミーは［ダメージ適用ステップ］でこのエネミー以外の対象が受ける予定のダメージをかわりに受ける。対象はダメージを受けることはない。また、この効果で身代わりとなって受けるHPダメージを-{0}点する。", enemy.getA2());
			skills.push(s1);
			var s2 = new EnemySkill("移動したら殴るよ", "本文");
			s2.setRole("自動成功");
			s2.setTarget(Target.SINGLE);
			s2.setRange(2);
			s2.createFunction("対象が［移動］タグをもつ行動を実行しようとした時に使用する。対象に{0}点の直接ダメージを与える。", enemy.getA2());
			skills.push(s2);
			var s3 = new EnemySkill("引きずり回すよ", "ムーブ");
			s3.addTag("移動");
			s3.setRole("自動成功");
			s3.setTarget(Target.SINGLE);
			s3.setRange(0);
			s3.setLimit("シーン1回");
			s3.setFunction("このエネミーは2Sqまで［即時移動］をしてもよい。このエネミーの移動と同時に、対象をこのエネミーが移動したSqに［即時移動（強制）］させる。");
			skills.push(s3);
		}
		if (this === EnemyType.SUPPORTER) {
			var s1 = new EnemySkill("こいつはおまけだ", "ダメージ適用直前");
			s1.setRole("自動成功");
			s1.setTarget(Target.SINGLE);
			s1.setRange(4);
			s1.setLimit("シーン1回");
			s1.createFunction("ここのエネミー以外の攻撃によるＨＰダメージの適用直前に使用できる。対象が受ける予定のHPダメージに+{0}点する。", enemy.getA3());
			skills.push(s1);
			var s2 = new EnemySkill("あいつを狙えⅠ", "セットアップ");
			s2.setRole("自動成功");
			s2.setTarget(Target.SINGLE);
			s2.setRange(4);
			s2.createFunction("［ヘイトトップ］のキャラクターのみ対象にできる。対象に［追撃：{0}］を与える。", enemy.getB2());
			skills.push(s2);
			var s3 = new EnemySkill("あいつを狙えⅡ", "セットアップ");
			s3.setRole("自動成功");
			s3.setTarget(Target.MULTI20);
			s3.setRange(0);
			s3.setLimit("シーン1回");
			s3.setFunction("対象の【ヘイト】を+1する。");
			skills.push(s3);
			var s4 = new EnemySkill("もっと動け", "ムーブ");
			s4.setRole("判定なし");
			s4.setTarget(Target.SINGLE);
			s4.setRange(4);
			s4.setFunction("対象は2Sqまで［即時移動］をしてもよい。");
			skills.push(s4);
			var s5 = new EnemySkill("チャージするよ", "セットアップ");
			s5.setRole("判定なし");
			s5.setTarget(Target.SINGLE);
			s5.setRange(4);
			s5.setLimit("シーン1回");
			s5.setFunction("対象は「使用回数：シーンn回」の特技をひとつ選び、その使用回数を1回復してもよい。");
			skills.push(s5);
			var s6 = new EnemySkill("BSを解除するよ", "セットアップ");
			s6.setRole("判定なし");
			s6.setTarget(Target.SINGLE);
			s6.setRange(4);
			s6.setFunction("対象が受けているBSひとつを解除する。");
			skills.push(s6);
		}
		if (this === EnemyType.HEALER) {
			var s1 = new EnemySkill("立ち上がれもういちど", "本文");
			s1.setRole("判定なし");
			s1.setTarget(Target.SINGLE);
			s1.setRange(4);
			s1.setLimit("シーン1回");
			s1.createFunction("自身を除く対象が［戦闘不能］になったときに使用する。対象の［戦闘不能］状態を解除し、【HP】を{0}点まで回復する。", enemy.getA2());
			skills.push(s1);
			var s2 = new EnemySkill("障壁を配るよ", "セットアップ");
			s2.setRole("判定なし");
			s2.setTarget(Target.MULTI20);
			s2.setRange(0);
			s2.setLimit("シーン1回");
			s2.createFunction("対象に［障壁：{0}］を与える。", enemy.getA3());
			skills.push(s2);
			var s3 = new EnemySkill("君はモブじゃない", "セットアップ");
			s3.setRole("判定なし");
			s3.setTarget(Target.SINGLE);
			s3.setRange(4);
			s3.setFunction("対象から［モブ］タグを除去する。この効果はラウンド終了時まで持続する。");
			skills.push(s3);
			var s4 = new EnemySkill("そんなBSはなかった", "本文");
			s4.setRole("判定なし");
			s4.setTarget(Target.SINGLE);
			s4.setRange(4);
			s4.setLimit("ラウンド1回");
			s4.setFunction("対象がBSを受けた直後に使用する。対象が直前に受けたBSから1つを選んで解除する。");
			skills.push(s4);
		}
		if (this === EnemyType.SPEAR) {
			var s1 = new EnemySkill("抉って穿つぜ", "ダメージロール");
			s1.setLimit("シーン1回");
			s1.createFunction("このエネミーの［白兵攻撃］のダメージロールに+{0}点する。", enemy.getA3());
			skills.push(s1);
			var s2 = new EnemySkill("逃げられると思うなよ", "ムーブ");
			s2.addTag("移動");
			s2.createFunction("このエネミーは{0}Sqまで［即時移動］をしてもよい。〔マイナー〕移動距離は+1Sqされる。", enemy.getMove());
			skills.push(s2);
			var s3 = new EnemySkill("飛び跳ねるぜ", "ムーブ");
			s3.addTag("移動");
			s3.setLimit("シーン1回");
			s3.createFunction("このエネミーは［飛行］状態となり、{0}Sqまで［即時移動］をしてもよい。移動終了後に［飛行］状態は解除される。〔マイナー〕移動距離は+1Sqされる。", enemy.getMove() + 1);
			s3.setRemarks("基本的な移動手段が飛行となるエネミーには適用しないこと。");
			skills.push(s3);
		}
		if (this === EnemyType.ARCHER) {
			var s1 = new EnemySkill("急所を狙おうか", "ダメージロール");
			s1.setLimit("シーン1回");
			s1.createFunction("このエネミーの［射撃攻撃］のダメージロールに+{0}点する。", enemy.getA3());
			skills.push(s1);
			var s2 = new EnemySkill("ふっ飛びな", "ダメージ適用直後");
			s2.setTarget(Target.SINGLE);
			s2.setRange(4);
			s2.setLimit("シーン1回");
			s2.setFunction("このエネミーがダメージを与えた直後に使用する。ダメージを与えたキャラクターを対象として2Sqまで［即時移動（強制）］してもよい。");
			skills.push(s2);
			var s3 = new EnemySkill("距離は取らせてもらう", "ムーブ");
			s3.addTag("移動");
			s3.setLimit("シーン1回");
			s3.setRange(4);
			s3.createFunction("このエネミーは［飛行］状態となり、{0}Sqまで［即時移動］をしてもよい。移動終了後に［飛行］状態は解除される。〔マイナー〕移動距離は+1Sqされる。", enemy.getMove() + 1);
			s3.setRemarks("基本的な移動手段が飛行となるエネミーには適用しないこと。");
			skills.push(s3);
			var s4 = new EnemySkill("そこも射程圏内だ", "マイナー");
			s4.setLimit("シーン1回");
			s4.setFunction("このエネミーがこのメインプロセスで行なう［射撃攻撃］の射程は+2Sqされる。");
			skills.push(s4);
		}
		if (this === EnemyType.SHOOTER) {
			var s1 = new EnemySkill("魔力を注ぎ込む", "ダメージロール");
			s1.setLimit("シーン1回");
			s1.createFunction("このエネミーの［魔法攻撃］のダメージロールに+{0}点する。", enemy.getA3());
			skills.push(s1);
		}
		if (this === EnemyType.BOMMER) {
			var s1 = new EnemySkill("もっと強く爆ぜろ", "ダメージロール");
			s1.setLimit("シーン1回");
			s1.createFunction("このエネミーの［魔法攻撃］のダメージロールに+{0}点する。", enemy.getA3());
			skills.push(s1);
			var s2 = new EnemySkill("もっと広く爆ぜろ", "マイナー");
			s2.setLimit("シーン1回");
			s2.setFunction("このメインプロセスで行なう［魔法攻撃］は「対象：広範囲1（選択）」に変更される。");
			s2.setRemarks("強く推奨");
			skills.push(s2);
		}
		return skills;
	};
	/**
	 * 特技（デザイン時処理の候補）一覧を取得
	 * @param {Enemy} enemy 対象エネミー
	 * @returns {Array<EnemySkill>} 特技一覧
	 * @memberof EnemyType
	 */
	EnemyType.prototype.getSkills2 = function (enemy) {
		var skills = new Array();
		if (this === EnemyType.SHOOTER) {
			var s2 = new EnemySkill("ダメージ種別付与Ⅰ", "デザイン時処理");
			s2.setFunction("メジャーで行なう攻撃手段に［火炎］［冷気］［電撃］［光輝］［邪毒］［精神］のうちいずれかのタグを付け加えてもよい。");
			s2.setRemarks("強く推奨");
			skills.push(s2);
			var s3 = new EnemySkill("ダメージ種別付与Ⅱ", "デザイン時処理");
			s3.setFunction("メジャーで行なう攻撃手段によって与えるダメージを物理ダメージにしてもよい。その場合、ダメージに+8すること。");
			s3.setRemarks("できるだけ避けること");
			skills.push(s3);
		}
		if (this === EnemyType.BOMMER) {
			var s3 = new EnemySkill("ダメージ種別付与Ⅰ", "デザイン時処理");
			s3.setFunction("メジャーで行なう攻撃手段に［火炎］［冷気］［電撃］［光輝］［邪毒］［精神］のうちいずれかのタグを付け加えてもよい。");
			s3.setRemarks("強く推奨");
			skills.push(s3);
			var s4 = new EnemySkill("ダメージ種別付与Ⅱ", "デザイン時処理");
			s4.setFunction("メジャーで行なう攻撃手段によって与えるダメージを物理ダメージにしてもよい。その場合、ダメージに+8すること。");
			s4.setRemarks("できるだけ避けること");
			skills.push(s4);
		}
		if (contains(this, EnemyType.SPEAR, EnemyType.ARCHER, EnemyType.SHOOTER, EnemyType.BOMMER)) {
			var s = new EnemySkill("追加効果（マイナー：弱）", "デザイン時処理");
			var func = "〔マイナー〕対象に［放心］、［硬直］、［萎縮］、";
			if (enemy.getB1() > 0) {
				func += format("［追撃：{0}］、", enemy.getB1());
			}
			if (enemy.getA1() > 0) {
				func += format("［衰弱：{0}］、", enemy.getA1());
			}
			func += format("追加ダメージ+{0}（のいずれかひとつ）を与える。", enemy.getC1());
			s.setFunction(func);
			skills.push(s);
		}
		if (contains(this, EnemyType.SPEAR, EnemyType.ARCHER, EnemyType.SHOOTER, EnemyType.BOMMER)) {
			var s = new EnemySkill("追加効果（マイナー：中）", "デザイン時処理");
			var func = "〔マイナー〕対象に［放心］、［硬直］、［萎縮］、";
			s.createFunction("〔マイナー〕対象に［惑乱］、［追撃：{0}］ 、［衰弱：{1}］ 、追加ダメージ+{2}（のいずれかひとつ）を与える。", enemy.getB2(), enemy.getA2(), enemy.getC2());
			s.setRemarks("《基本攻撃手段》のダメージを9割程度に抑えること。また単体攻撃のみとすること。");
			skills.push(s);
		}
		if (contains(this, EnemyType.FENCER, EnemyType.SPEAR, EnemyType.ARCHER, EnemyType.SHOOTER, EnemyType.BOMMER)) {
			var s = new EnemySkill("追加効果（達成値：中）", "デザイン時処理");
			s.createFunction("〔達成値{0}〕対象に［惑乱］、［追撃：{1}］、［衰弱：{2}］、追加ダメージ+{3}（のいずれかひとつ）を与える。", enemy.getAchieved2(), enemy.getB2(), enemy.getA2(), enemy.getC2());
			skills.push(s);
		}
		if (contains(this, EnemyType.SPEAR, EnemyType.ARCHER, EnemyType.SHOOTER, EnemyType.BOMMER)) {
			var s = new EnemySkill("追加効果（達成値：強）", "デザイン時処理");
			s.createFunction("〔達成値{0}〕対象に［放心］［重篤］、もしくは［追撃：{1}］、［衰弱：{2}］、追加ダメージ+{3}（のいずれかひとつ）を与える。", enemy.getAchieved3(), enemy.getB3(), enemy.getA3(), enemy.getC3());
			skills.push(s);
		}
		if (contains(this, EnemyType.ARMOROR, EnemyType.FENCER, EnemyType.GRAPPLER, EnemyType.SUPPORTER, EnemyType.HEALER)) {
			var s = new EnemySkill("精密攻撃", "デザイン時処理");
			s.setFunction("〔マイナー〕この特技の［攻撃判定］に+2。");
			skills.push(s);
		}
		if (contains(this, EnemyType.SPEAR, EnemyType.ARCHER, EnemyType.SHOOTER, EnemyType.BOMMER)) {
			var s = new EnemySkill("威嚇攻撃", "デザイン時処理");
			s.setFunction("〔マイナー〕対象を1Sqまで［即時移動（強制）］してもよい。");
			s.setRemarks("この能力は単体攻撃のみに付けること。");
			skills.push(s);
		}
		if (contains(this, EnemyType.ARMOROR, EnemyType.FENCER, EnemyType.GRAPPLER)) {
			var s = new EnemySkill("ベアハッグ", "デザイン時処理");
			s.setFunction("〔マイナー〕対象に［硬直］を与える。この［硬直］は通常の方法では解除されず、対象とこのエネミーが別のSqに離れた時のみ解除される。");
			s.setRemarks("単体、至近の白兵攻撃にのみ適用すること。");
			skills.push(s);
		}
		if (enemy.getRace() !== EnemyRace.GIMIC && contains(this, EnemyType.ARMOROR, EnemyType.FENCER, EnemyType.GRAPPLER)) {
			var s = new EnemySkill("激怒", "デザイン時処理");
			s.createFunction("〔マイナー〕このメインプロセス終了時まで、このエネミーのヘイト倍率を「{0}」として扱う。", enemy.getForceHate());
			skills.push(s);
		}
		return skills;
	};
	/**
	 * デザインアドバイスを取得
	 * @param {Enemy} enemy 対象エネミー
	 * @returns {Array<string>} メッセージ一覧
	 * @memberof EnemyType
	 */
	EnemyType.prototype.getDesignAdvice = function (enemy) {
		var messages = new Array();
		if (this === EnemyType.ARMOROR) {
			messages.push("アーマラーは【物理防御力】と【最大HP】に秀でる反面、【行動力】は低い。エネミーたちに［軽減］を与え、PCたちの移動を阻害する。ボス（単体）にする場合は火力不足や移動能力不足に注意すること。");
		}
		if (this === EnemyType.FENCER) {
			messages.push("フェンサーは【最大HP】に秀で、【行動力】は低い。PCたちの攻撃に反応して反撃を加える一方、PCを強制的に移動させる能力を持つ。ボス（単体）に仕立てるには一工夫が必要だろう。");
		}
		if (this === EnemyType.GRAPPLER) {
			messages.push("グラップラーは【最大HP】と［防御判定］に秀でる一方、【防御力】は低い。PCたちの移動に反応し、制御する能力を持つ。また仲間のエネミーのダメージを肩代わりできる。ボス（単体）に仕立てるには一工夫が必要だろう。");
		}
		if (this === EnemyType.SUPPORTER) {
			messages.push("サポーターは【抵抗】の値が高い反面、物理的には打たれ弱い。【行動力】が高く、先手を取ることが多いだろう。他のエネミーの強化、連携に向いた能力が多く、ボス（単体）には向かない。");
		}
		if (this === EnemyType.HEALER) {
			messages.push("ヒーラーは【抵抗】の値が高く【防御力】もやや高めだが、過信はできない。他のエネミーの強化、回復に特化しているため、ボス（単体）には向かない。");
		}
		if (this === EnemyType.SPEAR) {
			messages.push("スピアは【回避】の値が高く、もっとも高い物理ダメージを与えることができる。ボス（単体）、ボス（統率）ともに十分活躍できるだろうが、ボス（単体）では特に移動関係の能力を強化しておくのが望ましい。");
		}
		if (this === EnemyType.ARCHER) {
			messages.push(
				"アーチャーは［射撃攻撃］を用い、物理ダメージを与えてくる。【魔法防御力】も高めで遠距離での戦いに強いが、同一Sqを対象とした攻撃は苦手なため、位置取りに注意が必要。ボス（単体）、ボス（統率）ともに十分活躍できるだろう。ボス（単体）では移動関係の能力を強化しておくのが望ましい。",
			);
		}
		if (this === EnemyType.SHOOTER) {
			messages.push("シューターは［魔法攻撃］を用い、魔法ダメージを単体に与えてくる。【行動力】【魔法防御力】が高めで遠距離での戦いに強いが、【最大HP】が低く打たれ弱い。ボス（単体）、ボス（統率）ともに十分活躍できるだろう。ボス（単体）は移動を意識したデザインにするとよい。");
		}
		if (this === EnemyType.BOMMER) {
			messages.push(
				"ボマーは［魔法攻撃］を用い、魔法ダメージを範囲に与えてくる。【魔法防御力】が高めで遠距離での戦いに強いが、【最大HP】が低く打たれ弱い。また【行動力】が低いため、先手を取られやすい。ボス（単体）、ボス（統率）ともに十分活躍できるだろう。ボス（単体）は移動およびＢＳ対策を意識したデザインにするとよい。",
			);
		}
		return messages;
	};
	EnemyType._values = new Array();
	EnemyType.ARMOROR = new EnemyType("アーマラー", 1);
	EnemyType.FENCER = new EnemyType("フェンサー", 2);
	EnemyType.GRAPPLER = new EnemyType("グラップラー", 3);
	EnemyType.SUPPORTER = new EnemyType("サポーター", 4);
	EnemyType.HEALER = new EnemyType("ヒーラー", 5);
	EnemyType.SPEAR = new EnemyType("スピア", 6);
	EnemyType.ARCHER = new EnemyType("アーチャー", 7);
	EnemyType.SHOOTER = new EnemyType("シューター", 8);
	EnemyType.BOMMER = new EnemyType("ボマー", 9);
	return EnemyType;
})();
/**
 * 知名度
 * Javaのenumのように使用することを想定
 * @class AttackType
 */
var Popularity = /** @class */ (function () {
	/**
	 * コンストラクタ
	 * @param {string} label 表示名
	 * @param {string} value 識別難易度の基本値
	 * @memberof AttackType
	 */
	function Popularity(label, value) {
		this.label = label;
		this.value = value;
		Popularity._values.push(this);
	}
	/**
	 * 識別難易度を取得
	 * @param {number} cr 対象エネミーのCR
	 * @returns {string} 識別難易度
	 * @memberof Popularity
	 */
	Popularity.prototype.getDifficulty = function (cr) {
		if (this === Popularity.R1) {
			return "自動";
		} else {
			return Math.floor(this.value + (cr - 1) / 3 + 1).toString();
		}
	};
	/**
	 * 知名度一覧を取得
	 * @static
	 * @returns {Array < Popularity >} 知名度一覧
	 * @memberof Popularity
	 */
	Popularity.values = function () {
		return Popularity._values;
	};
	Popularity._values = new Array();
	Popularity.R1 = new Popularity("超有名", 0);
	Popularity.R2 = new Popularity("有名", 2);
	Popularity.R3 = new Popularity("一般的", 4);
	Popularity.R4 = new Popularity("普通", 6);
	Popularity.R5 = new Popularity("珍しい", 7);
	Popularity.R6 = new Popularity("無名", 9);
	Popularity.R7 = new Popularity("秘密", 12);
	return Popularity;
})();
/**
 * 攻撃対象
 * Javaのenumのように使用することを想定
 * @class AttackType
 */
var Target = /** @class */ (function () {
	/**
	 * コンストラクタ
	 * @param {string} label 表示名
	 * @memberof Target
	 */
	function Target(label) {
		this.label = label;
	}
	Target.SINGLE = new Target("単体");
	Target.TARGET2 = new Target("2体");
	Target.TARGET3 = new Target("3体");
	Target.TARGET4 = new Target("4体");
	Target.MULTI = new Target("範囲（選択）");
	Target.MULTI1 = new Target("広範囲1（選択）");
	Target.MULTI20 = new Target("広範囲20（選択）");
	return Target;
})();
/**
 * エネミーテンプレート
 * @class TemplateData
 */
var TemplateData = /** @class */ (function () {
	/**
	 * コンストラクタ
	 * @param {EnemyType} type エネミー種別
	 * @memberof TemplateData
	 */
	function TemplateData(type) {
		this._type = type;
		switch (this._type) {
			case EnemyType.ARMOROR:
				this._str = 7;
				this._dex = 3;
				this._pow = 4;
				this._int = 2;
				this._avoidCoef = 1.2;
				this._avoidFix = 4;
				this._resistCoef = 1.1;
				this._resistFix = 2;
				this._pdCoef = 2.2;
				this._pdFix = 8;
				this._mdCoef = 1.7;
				this._mdFix = 2;
				this._hpCoef = 8.5;
				this._hpFix = 48;
				this._actionFix = -2;
				this._hateCr = 0;
				this._hateFix = 1;
				this._damageAllCoef = 1;
				this._aggressionCoef = 0.55;
				this._basicAttackType = AttackType.MELEE;
				this._basicAttackRoleFix = 2;
				this._basicAttackRoleDice = 2;
				this._basicTarget = Target.SINGLE;
				this._basicRange = 0;
				break;
			case EnemyType.FENCER:
				this._str = 7;
				this._dex = 4;
				this._pow = 2;
				this._int = 3;
				this._avoidCoef = 1.1;
				this._avoidFix = 4;
				this._resistCoef = 1.1;
				this._resistFix = 2;
				this._pdCoef = 1.7;
				this._pdFix = 5;
				this._mdCoef = 1.7;
				this._mdFix = 1;
				this._hpCoef = 8.4;
				this._hpFix = 45;
				this._actionFix = -2;
				this._hateCr = 2;
				this._hateFix = 1;
				this._damageAllCoef = 1;
				this._aggressionCoef = 0.55;
				this._basicAttackType = AttackType.MELEE;
				this._basicAttackRoleFix = 2;
				this._basicAttackRoleDice = 2;
				this._basicTarget = Target.SINGLE;
				this._basicRange = 0;
				break;
			case EnemyType.GRAPPLER:
				this._str = 7;
				this._dex = 4;
				this._pow = 2;
				this._int = 3;
				this._avoidCoef = 1.1;
				this._avoidFix = 2;
				this._resistCoef = 1.1;
				this._resistFix = 4;
				this._pdCoef = 0.9;
				this._pdFix = 2;
				this._mdCoef = 1.3;
				this._mdFix = 3;
				this._hpCoef = 7.5;
				this._hpFix = 45;
				this._actionFix = 0;
				this._hateCr = 0;
				this._hateFix = 1;
				this._damageAllCoef = 1;
				this._aggressionCoef = 0.55;
				this._basicAttackType = AttackType.MELEE;
				this._basicAttackRoleFix = 2;
				this._basicAttackRoleDice = 2;
				this._basicTarget = Target.SINGLE;
				this._basicRange = 0;
				break;
			case EnemyType.SUPPORTER:
				this._str = 4;
				this._dex = 2;
				this._pow = 7;
				this._int = 3;
				this._avoidCoef = 1.2;
				this._avoidFix = 2;
				this._resistCoef = 1.1;
				this._resistFix = 7;
				this._pdCoef = 1.5;
				this._pdFix = 3;
				this._mdCoef = 1.8;
				this._mdFix = 5;
				this._hpCoef = 5.0;
				this._hpFix = 35;
				this._actionFix = 2;
				this._hateCr = 0;
				this._hateFix = 1;
				this._damageAllCoef = 1;
				this._aggressionCoef = 0.55;
				this._basicAttackType = AttackType.MAGICAL;
				this._basicAttackRoleFix = 2;
				this._basicAttackRoleDice = 2;
				this._basicTarget = Target.SINGLE;
				this._basicRange = 4;
				break;
			case EnemyType.HEALER:
				this._str = 3;
				this._dex = 2;
				this._pow = 7;
				this._int = 4;
				this._avoidCoef = 1.2;
				this._avoidFix = 2;
				this._resistCoef = 1.1;
				this._resistFix = 7;
				this._pdCoef = 1.8;
				this._pdFix = 8;
				this._mdCoef = 1.7;
				this._mdFix = 1;
				this._hpCoef = 6.0;
				this._hpFix = 30;
				this._actionFix = -2;
				this._hateCr = 0;
				this._hateFix = 1;
				this._damageAllCoef = 1;
				this._aggressionCoef = 0.55;
				this._basicAttackType = AttackType.MELEE;
				this._basicAttackRoleFix = 2;
				this._basicAttackRoleDice = 2;
				this._basicTarget = Target.SINGLE;
				this._basicRange = 2;
				break;
			case EnemyType.SPEAR:
				this._str = 4;
				this._dex = 7;
				this._pow = 2;
				this._int = 3;
				this._avoidCoef = 1.2;
				this._avoidFix = 7;
				this._resistCoef = 1.1;
				this._resistFix = 2;
				this._pdCoef = 1.7;
				this._pdFix = 5;
				this._mdCoef = 1.5;
				this._mdFix = 3;
				this._hpCoef = 6.0;
				this._hpFix = 30;
				this._actionFix = 0;
				this._hateCr = 0;
				this._hateFix = 2;
				this._damageAllCoef = 1;
				this._aggressionCoef = 0.85;
				this._basicAttackType = AttackType.MELEE;
				this._basicAttackRoleFix = 1;
				this._basicAttackRoleDice = 3;
				this._basicTarget = Target.SINGLE;
				this._basicRange = 0;
				break;
			case EnemyType.ARCHER:
				this._str = 3;
				this._dex = 4;
				this._pow = 2;
				this._int = 7;
				this._avoidCoef = 1.1;
				this._avoidFix = 4;
				this._resistCoef = 1.1;
				this._resistFix = 2;
				this._pdCoef = 1.6;
				this._pdFix = 6;
				this._mdCoef = 1.9;
				this._mdFix = 5;
				this._hpCoef = 5.0;
				this._hpFix = 26;
				this._actionFix = 0;
				this._hateCr = 2;
				this._hateFix = 2;
				this._damageAllCoef = 0.9;
				this._aggressionCoef = 0.85;
				this._basicAttackType = AttackType.SHOOTING;
				this._basicAttackRoleFix = 0;
				this._basicAttackRoleDice = 3;
				this._basicTarget = Target.SINGLE;
				this._basicRange = 3;
				break;
			case EnemyType.SHOOTER:
				this._str = 3;
				this._dex = 2;
				this._pow = 5;
				this._int = 7;
				this._avoidCoef = 1.2;
				this._avoidFix = 2;
				this._resistCoef = 1.1;
				this._resistFix = 5;
				this._pdCoef = 1.3;
				this._pdFix = 3;
				this._mdCoef = 1.9;
				this._mdFix = 5;
				this._hpCoef = 4.0;
				this._hpFix = 26;
				this._actionFix = 1;
				this._hateCr = 2;
				this._hateFix = 2;
				this._damageAllCoef = 1;
				this._aggressionCoef = 0.85;
				this._basicAttackType = AttackType.MAGICAL;
				this._basicAttackRoleFix = 0;
				this._basicAttackRoleDice = 3;
				this._basicTarget = Target.SINGLE;
				this._basicRange = 4;
				break;
			case EnemyType.BOMMER:
				this._str = 3;
				this._dex = 2;
				this._pow = 5;
				this._int = 7;
				this._avoidCoef = 1.2;
				this._avoidFix = 2;
				this._resistCoef = 1.1;
				this._resistFix = 5;
				this._pdCoef = 1.3;
				this._pdFix = 3;
				this._mdCoef = 1.9;
				this._mdFix = 5;
				this._hpCoef = 4.0;
				this._hpFix = 26;
				this._actionFix = -2;
				this._hateCr = 2;
				this._hateFix = 2;
				this._damageAllCoef = 0.85;
				this._aggressionCoef = 0.85;
				this._basicAttackType = AttackType.MAGICAL;
				this._basicAttackRoleFix = 0;
				this._basicAttackRoleDice = 3;
				this._basicTarget = Target.MULTI;
				this._basicRange = 4;
				break;
			default:
				break;
		}
	}
	/**
	 * エネミー種別を取得
	 * @returns {EnemyType} エネミー種別
	 * @memberof TemplateData
	 */
	TemplateData.prototype.getType = function () {
		return this._type;
	};
	/**
	 * STRを取得
	 * ( STR * 1.1 + CR ) / 3
	 * @param {number} cr キャラクターランク
	 * @returns {number}
	 * @memberof TemplateData
	 */
	TemplateData.prototype.getStr = function (cr) {
		return Math.floor((cr * 1.1 + this._str) / 3);
	};
	/**
	 * DEXを取得
	 * ( DEX * 1.1 + CR ) / 3
	 * @param {number} cr キャラクターランク
	 * @returns {number} DEX
	 * @memberof TemplateData
	 */
	TemplateData.prototype.getDex = function (cr) {
		return Math.floor((cr * 1.1 + this._dex) / 3);
	};
	/**
	 * POWを取得
	 * ( POW * 1.1 + CR ) / 3
	 * @param {number} cr キャラクターランク
	 * @returns {number} POW
	 * @memberof TemplateData
	 */
	TemplateData.prototype.getPow = function (cr) {
		return Math.floor((cr * 1.1 + this._pow) / 3);
	};
	/**
	 * INTを取得
	 * ( INT * 1.1 + CR ) / 3
	 * @param {number} cr キャラクターランク
	 * @returns {number} INT
	 * @memberof TemplateData
	 */
	TemplateData.prototype.getInt = function (cr) {
		return Math.floor((cr * 1.1 + this._int) / 3);
	};
	/**
	 * 回避固定値
	 * ( CR * 回避係数 + 回避固定値 ) / 3
	 */
	TemplateData.prototype.getAvoid = function (cr) {
		return Math.floor((cr * this._avoidCoef + this._avoidFix) / 3);
	};
	/**
	 * 回避ダイス数
	 * グラップラーのみ3 他は2
	 */
	TemplateData.prototype.getAvoidDice = function () {
		return this._type === EnemyType.GRAPPLER ? 3 : 2;
	};
	/**
	 * 抵抗固定値
	 * ( CR * 抵抗係数 + 抵抗固定値 ) / 3
	 */
	TemplateData.prototype.getResist = function (cr) {
		return Math.floor((cr * this._resistCoef + this._resistFix) / 3);
	};
	/**
	 * 抵抗ダイス数
	 * グラップラーのみ3 他は2
	 */
	TemplateData.prototype.getResistDice = function () {
		return this._type === EnemyType.GRAPPLER ? 3 : 2;
	};
	/**
	 * 物理防御
	 * CR * 物防係数 + 物防固定値
	 */
	TemplateData.prototype.getPhysicalDefense = function (cr) {
		return Math.floor(cr * this._pdCoef + this._pdFix);
	};
	/**
	 * 魔法防御
	 * CR * 魔防係数 + 魔防固定値
	 */
	TemplateData.prototype.getMagicDefense = function (cr) {
		return Math.floor(cr * this._mdCoef + this._mdFix);
	};
	/**
	 * ヒットポイント
	 * CR * HP係数 + HP固定値
	 */
	TemplateData.prototype.getHitPoint = function (cr) {
		return Math.floor(cr * this._hpCoef + this._hpFix);
	};
	/**
	 * ヘイト倍率
	 * ( CR + ヘイトCR修正) / 6 + ヘイト固定値
	 */
	TemplateData.prototype.getHate = function (cr) {
		return Math.floor((cr + this._hateCr) / 6 + this._hateFix);
	};
	/**
	 * ヘイト倍率強化
	 */
	TemplateData.prototype.getForceHate = function (cr) {
		return Math.floor(cr / 5) + 1;
	};
	/**
	 * ボスのヘイト倍率を取得
	 * @param {number} cr キャラクターランク
	 * @returns {number} ボスのヘイト倍率
	 * @memberof TemplateData
	 */
	TemplateData.prototype.getBossHate = function (cr) {
		return Math.floor(cr / 2.4 + 4);
	};
	/**
	 * 行動力を取得
	 * ( CR * 1.1 + 7) / 3 + ( CR * 1.1 + 3) / 3 + 行動力固定値
	 * @param {number} cr キャラクターランク
	 * @returns {number} 行動力
	 * @memberof TemplateData
	 */
	TemplateData.prototype.getAction = function (cr) {
		var value1 = Math.floor((cr * 1.1 + 7) / 3);
		var value2 = Math.floor((cr * 1.1 + 3) / 3);
		return value1 + value2 + this._actionFix;
	};
	/**
	 * 移動力を取得
	 * @returns {number} 移動力
	 * @memberof TemplateData
	 */
	TemplateData.prototype.getMove = function () {
		return 2;
	};
	/**
	 * 基本攻撃手段の種別を取得
	 * @returns {AttackType} 基本攻撃手段の種別
	 * @memberof TemplateData
	 */
	TemplateData.prototype.getBasicAttackType = function () {
		return this._basicAttackType;
	};
	/**
	 * 基本攻撃手段の範囲を取得
	 * @returns {Target} 基本攻撃手段の射程
	 * @memberof TemplateData
	 */
	TemplateData.prototype.getBasicTarget = function () {
		return this._basicTarget;
	};
	/**
	 * 基本攻撃手段の射程を取得
	 * @returns {number} 基本攻撃手段の射程
	 * @memberof TemplateData
	 */
	TemplateData.prototype.getBasicRange = function () {
		return this._basicRange;
	};
	/**
	 * 判定固定値を取得
	 * ( CR * 1.1 + 7) / 3 + タイプによる補正
	 * @param {number} cr キャラクターランク
	 * @returns {number} 判定固定値
	 * @memberof TemplateData
	 */
	TemplateData.prototype.getRole = function (cr) {
		return Math.floor((cr * 1.1 + 7) / 3) + this._basicAttackRoleFix;
	};
	/**
	 * 判定ダイス数を取得
	 * @returns {number} 判定ダイス数
	 * @memberof TemplateData
	 */
	TemplateData.prototype.getRoleDice = function () {
		return this._basicAttackRoleDice;
	};
	/**
	 * タイプ別巡航ダメージを取得
	 * @param {number} cr キャラクターランク
	 * @param {rate} cr 倍率
	 * @returns {number} タイプ別巡航ダメージ
	 * @memberof TemplateData
	 */
	TemplateData.prototype.getDamage = function (cr, rate) {
		if (rate === void 0) {
			rate = 1;
		}
		var result = 0;
		switch (this._type) {
			case EnemyType.ARMOROR:
			case EnemyType.FENCER:
			case EnemyType.GRAPPLER:
			case EnemyType.HEALER:
				result = this.getPhysicalDamage1(cr);
				break;
			case EnemyType.SUPPORTER:
				result = this.getMagicDamage1(cr);
				break;
			case EnemyType.SPEAR:
			case EnemyType.ARCHER:
				result = this.getPhysicalDamage2(cr);
				break;
			case EnemyType.SHOOTER:
			case EnemyType.BOMMER:
				result = this.getMagicDamage2(cr);
				break;
		}
		return Math.floor(result * rate);
	};
	/**
	 * ダメージ固定値を取得
	 * @param {number} cr キャラクターランク
	 * @returns {number} ダメージ固定値
	 * @memberof TemplateData
	 */
	TemplateData.prototype.getDamageFix = function (cr, rate) {
		return this.getDamage(cr, rate) - 7;
	};
	/**
	 * ダメージダイス数を取得
	 * @returns {number} ダメージダイス数
	 * @memberof TemplateData
	 */
	TemplateData.prototype.getDamageDice = function () {
		return 2;
	};
	/**
	 * 巡航ダメージ(物理・小)を取得
	 * @param {number} cr キャラクターランク
	 * @returns {number} 巡航ダメージ(物理・小)
	 * @memberof TemplateData
	 */
	TemplateData.prototype.getPhysicalDamage1 = function (cr) {
		return this.getMagicDamage1(cr) + 8;
	};
	/**
	 * 巡航ダメージ(物理・大)を取得
	 * @param {number} cr キャラクターランク
	 * @returns {number} 巡航ダメージ(物理・大)
	 * @memberof TemplateData
	 */
	TemplateData.prototype.getPhysicalDamage2 = function (cr) {
		return this.getMagicDamage2(cr) + 8;
	};
	/**
	 * 巡航ダメージ(魔法・小)を取得
	 * @param {number} cr キャラクターランク
	 * @returns {number} 巡航ダメージ(魔法・小)
	 * @memberof TemplateData
	 */
	TemplateData.prototype.getMagicDamage1 = function (cr) {
		return Math.floor(cr * 3.5) + 8;
	};
	/**
	 * 巡航ダメージ(魔法・大)を取得
	 * @param {number} cr キャラクターランク
	 * @returns {number} 巡航ダメージ(魔法・大)
	 * @memberof TemplateData
	 */
	TemplateData.prototype.getMagicDamage2 = function (cr) {
		return cr * 6 + 18;
	};
	/**
	 * ドロップ期待値を取得
	 * @param {number} cr キャラクターランク
	 * @returns {number} ドロップ期待値
	 * @memberof TemplateData
	 */
	TemplateData.prototype.getGold = function (cr) {
		return Math.floor((cr + 2) * (cr + 2) * 0.72 + 17);
	};
	/**
	 * しぶとさを取得
	 * @param {EnemyRank} rank エネミーランク
	 * @param {number} cr キャラクターランク
	 * @returns {number} しぶとさ
	 * @memberof TemplateData
	 */
	TemplateData.prototype.getStubborn = function (rank, cr) {
		return cr * rank.stubbornCoef;
	};
	/**
	 * 攻撃性を取得
	 * @param {number} cr キャラクターランク
	 * @returns {number} 攻撃性
	 * @memberof TemplateData
	 */
	TemplateData.prototype.getAggression = function (cr) {
		return Math.floor(this.getDamage(cr) * this._aggressionCoef);
	};
	/**
	 * 達成値を取得
	 * @param {EnemyRank} rank エネミーランク
	 * @param {number} cr キャラクターランク
	 * @returns {number} 達成値
	 * @memberof TemplateData
	 */
	TemplateData.prototype.getAchieved = function (cr) {
		return this.getRole(cr) + this._basicAttackRoleDice * 4;
	};
	/* エネミー諸数値  */
	TemplateData.prototype.getA1 = function (cr) {
		return Math.floor(((cr * 2.2 + 10) * 0.3 * 0.75) / 5) * 5;
	};
	TemplateData.prototype.getA2 = function (cr) {
		return Math.floor(((cr * 2.2 + 10) * 0.7 * 0.75) / 5) * 5;
	};
	TemplateData.prototype.getA3 = function (cr) {
		return Math.floor(((cr * 2.2 + 10) * 1.1 * 0.75) / 5) * 5;
	};
	TemplateData.prototype.getB1 = function (cr) {
		return Math.floor(((cr * 2.2 + 10) * 0.3) / 5) * 5;
	};
	TemplateData.prototype.getB2 = function (cr) {
		return Math.floor(((cr * 2.2 + 10) * 0.7) / 5) * 5;
	};
	TemplateData.prototype.getB3 = function (cr) {
		return Math.floor(((cr * 2.2 + 10) * 1.1) / 5) * 5;
	};
	TemplateData.prototype.getC1 = function (cr) {
		return Math.floor((cr * 2.2 + 10) * 0.3);
	};
	TemplateData.prototype.getC2 = function (cr) {
		return Math.floor((cr * 2.2 + 10) * 0.6);
	};
	TemplateData.prototype.getC3 = function (cr) {
		return Math.floor(cr * 2.2 + 10);
	};
	TemplateData.prototype.getD1 = function (cr) {
		return cr + 3;
	};
	TemplateData.prototype.getD2 = function (cr) {
		return Math.floor((cr * 2.2 + 10) * 0.12) + 2;
	};
	TemplateData.prototype.getD3 = function (cr) {
		return Math.floor((cr + 3) / 2);
	};
	TemplateData.prototype.getE1 = function (cr) {
		return Math.floor((cr / 2) * 0.9) + 10;
	};
	/**
	 * ギミック解除値（難易度：困難）
	 * @param cr
	 */
	TemplateData.prototype.getE = function (cr) {
		// return Math.floor(cr * 0.4) + 9;
		return difficulty.hard[cr];
	};
	TemplateData.prototype.getCorePrice = function (cr) {
		return core_price[cr - 1];
	};
	TemplateData.prototype.getCatalystPrice = function (cr) {
		return catalyst_price[cr - 1];
	};
	return TemplateData;
})();
var difficulty = {
	normal: [0, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 10, 12, 12, 12, 13, 13, 13, 14, 14, 14, 15, 15, 15, 16, 16, 17],
	hard: [0, 9, 9, 10, 10, 10, 12, 12, 12, 13, 13, 13, 14, 15, 15, 16, 16, 16, 17, 17, 18, 19, 19, 19, 20, 20, 21, 22, 22, 23, 23],
	very_hard: [0, 11, 11, 13, 13, 13, 14, 15, 16, 16, 17, 18, 18, 19, 20, 20, 21, 22, 22, 23, 23, 25, 25, 25, 26, 27, 28, 28, 29, 30, 30],
};
var core_price = [30, 40, 50, 60, 80, 100, 120, 140, 180, 220, 240, 300, 340, 380, 440, 500, 560, 620, 680, 740, 820, 900, 980, 1060, 1160, 1240, 1340, 1440, 1540, 1640, 1760];
var catalyst_price = [15, 20, 25, 30, 40, 50, 60, 70, 90, 110, 120, 150, 170, 190, 220, 250, 280, 310, 340, 370, 410, 450, 490, 530, 580, 620, 670, 720, 770, 820, 880];
function format(msg) {
	var args = [];
	for (var _i = 1; _i < arguments.length; _i++) {
		args[_i - 1] = arguments[_i];
	}
	return msg.replace(/\{(\d+)\}/g, function (m, k) {
		return args[k];
	});
}
function contains(target) {
	var checks = [];
	for (var _i = 1; _i < arguments.length; _i++) {
		checks[_i - 1] = arguments[_i];
	}
	for (var _a = 0, checks_1 = checks; _a < checks_1.length; _a++) {
		var check = checks_1[_a];
		if (target === check) {
			return true;
		}
	}
	return false;
}
if (typeof window !== "undefined") {
	window.OfficialEnemyModel = {
		AttackType: AttackType,
		Enemy: Enemy,
		EnemyBase: EnemyBase,
		EnemyRace: EnemyRace,
		EnemyRank: EnemyRank,
		EnemySkill: EnemySkill,
		EnemyType: EnemyType,
		Popularity: Popularity,
		Target: Target,
		TemplateData: TemplateData,
		format: format,
		contains: contains,
	};
}
//# sourceMappingURL=enemy.js.map
