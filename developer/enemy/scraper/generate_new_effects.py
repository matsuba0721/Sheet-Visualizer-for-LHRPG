import json
from collections import defaultdict
import re

# ファイルを読み込む
with open('../json/items.json', 'r', encoding='utf-8') as f:
    items_data = json.load(f)

with open('../json/prefixed_effects.json', 'r', encoding='utf-8') as f:
    prefixed_data = json.load(f)

# M1～M6タグを持つアイテムを抽出
magic_items = []
for item in items_data['items']:
    tags = item.get('tags', [])
    for tag in tags:
        if re.match(r'^M[1-6]$', str(tag)):
            magic_items.append(item)
            break

print(f"=== 詳細分析レポート ===\n")
print(f"マジックアイテム総数: {len(magic_items)}個\n")

# Rank別の集計
rank_count = defaultdict(int)
for item in magic_items:
    rank = item.get('item_rank', 0)
    if 1 <= rank <= 6:
        rank_count[f"M{rank}"] = rank_count[f"M{rank}"] + 1

print("=== Rank別の内訳 ===")
for rank in ['M1', 'M2', 'M3', 'M4', 'M5', 'M6']:
    print(f"{rank}: {rank_count[rank]}個")
print()

# 既存の接頭辞効果を分析
existing_effect_types = {
    '攻撃力増加': [],
    '魔力増加': [],
    '防御力増加': [],
    'ダメージロール増加': [],
    '判定修正': [],
    '属性付与': [],
    '軽減効果': [],
    '障壁付与': [],
    '種族特効': [],
    'その他': []
}

for effect in prefixed_data['prefixed_effects']:
    func = effect['function']
    if '【攻撃力】' in func and '＋' in func:
        existing_effect_types['攻撃力増加'].append(effect)
    elif '【魔力】' in func and '＋' in func:
        existing_effect_types['魔力増加'].append(effect)
    elif '【物理防御力】' in func or '【魔法防御力】' in func:
        existing_effect_types['防御力増加'].append(effect)
    elif 'ダメージロール' in func and '＋' in func:
        existing_effect_types['ダメージロール増加'].append(effect)
    elif 'タグを追加' in func:
        existing_effect_types['属性付与'].append(effect)
    elif '［軽減' in func:
        existing_effect_types['軽減効果'].append(effect)
    elif '［障壁' in func:
        existing_effect_types['障壁付与'].append(effect)
    elif any(race in func for race in ['［人型］', '［自然］', '［精霊］', '［幻獣］', '［不死］', '［人造］', '［人間］']):
        existing_effect_types['種族特効'].append(effect)
    elif '判定' in func:
        existing_effect_types['判定修正'].append(effect)
    else:
        existing_effect_types['その他'].append(effect)

print("=== 既存のprefixed_effects.jsonの分類 ===")
for category, effects in existing_effect_types.items():
    print(f"{category}: {len(effects)}個")
print()

# 新しい接頭辞効果の候補を作成
# 具体的なパターンに基づいて抽出
new_candidates = []

# 武器タグのリスト
weapon_tags = ['剣', '刀', '槍', '槌斧', '鞭', '格闘', '杖', '弓', '投擲', '軽量', '固定砲', '魔石', '楽器']
armor_tags = ['盾', '重鎧', '中鎧', '軽鎧', '頭部', '腕部', '脚部', '外套']
modifier_tags = ['片手', '両手']
other_tags = ['補助装備', '鞄']

# パターン1: 特定スキルを強化する効果
skill_enhance_pattern = []
for item in magic_items:
    func = item.get('function', '')
    tags = item.get('tags', [])
    rank = item.get('item_rank', 0)
    
    # 《スキル名》のSRを上昇させる
    if '《' in func and '》' in func and ('ＳＲ' in func or '効果' in func):
        skill_enhance_pattern.append({
            'original_name': item.get('name', ''),
            'rank': rank,
            'function': func,
            'tags': [t for t in tags if t in weapon_tags or t in armor_tags or t in modifier_tags],
            'type': item.get('type', '')
        })

# パターン2: 条件付き効果（ヘイト、隠密など）
conditional_pattern = []
for item in magic_items:
    func = item.get('function', '')
    tags = item.get('tags', [])
    rank = item.get('item_rank', 0)
    
    if '〔自身：' in func or '〔ヘイト' in func:
        conditional_pattern.append({
            'original_name': item.get('name', ''),
            'rank': rank,
            'function': func,
            'tags': [t for t in tags if t in weapon_tags or t in armor_tags or t in modifier_tags],
            'type': item.get('type', '')
        })

# パターン3: 追加効果付与（追撃、衰弱など）
additional_effect_pattern = []
for item in magic_items:
    func = item.get('function', '')
    tags = item.get('tags', [])
    rank = item.get('item_rank', 0)
    
    if '［追撃' in func or '与える［衰弱' in func or '与える［障壁' in func:
        additional_effect_pattern.append({
            'original_name': item.get('name', ''),
            'rank': rank,
            'function': func,
            'tags': [t for t in tags if t in weapon_tags or t in armor_tags or t in modifier_tags],
            'type': item.get('type', '')
        })

# パターン4: 特定タイミングでの起動効果
timing_activation_pattern = []
for item in magic_items:
    func = item.get('function', '')
    tags = item.get('tags', [])
    rank = item.get('item_rank', 0)
    
    if '〔起動：' in func:
        timing_activation_pattern.append({
            'original_name': item.get('name', ''),
            'rank': rank,
            'function': func,
            'tags': [t for t in tags if t in weapon_tags or t in armor_tags or t in modifier_tags],
            'type': item.get('type', '')
        })

# パターン5: 基本パラメータ増加（既存にない強度のもの）
stat_boost_pattern = []
for item in magic_items:
    func = item.get('function', '')
    tags = item.get('tags', [])
    rank = item.get('item_rank', 0)
    
    # ＋数値の抽出
    if ('【攻撃力】' in func or '【魔力】' in func or '【回復力】' in func) and '＋' in func:
        stat_boost_pattern.append({
            'original_name': item.get('name', ''),
            'rank': rank,
            'function': func,
            'tags': [t for t in tags if t in weapon_tags or t in armor_tags or t in modifier_tags],
            'type': item.get('type', '')
        })

print(f"=== パターン別分類 ===")
print(f"スキル強化パターン: {len(skill_enhance_pattern)}個")
print(f"条件付き効果パターン: {len(conditional_pattern)}個")
print(f"追加効果付与パターン: {len(additional_effect_pattern)}個")
print(f"タイミング起動パターン: {len(timing_activation_pattern)}個")
print(f"パラメータ増加パターン: {len(stat_boost_pattern)}個")
print()

# 新しい接頭辞効果候補を生成
# 各Rankから5個ずつ、合計30個を選出
final_candidates = []
next_id = 2000  # IDの開始番号

# Rank1の候補（基礎的な効果）
rank1_candidates = [
    {
        "rank": 1,
        "name": "命中の",
        "required_tag": "",
        "allow_tags": ["剣", "刀", "槍", "槌斧", "鞭", "格闘", "杖", "弓", "投擲", "軽量", "固定砲"],
        "function": "この武器による［武器攻撃］の［命中判定］に＋１する。",
        "id": next_id
    },
    {
        "rank": 1,
        "name": "精密の",
        "required_tag": "",
        "allow_tags": ["弓", "投擲", "軽量"],
        "function": "この武器による［射撃攻撃］の［命中判定］に＋１する。",
        "id": next_id + 1
    },
    {
        "rank": 1,
        "name": "集中の",
        "required_tag": "",
        "allow_tags": ["杖", "魔石"],
        "function": "あなたの［魔法攻撃］の［命中判定］に＋１する。",
        "id": next_id + 2
    },
    {
        "rank": 1,
        "name": "頑強の",
        "required_tag": "",
        "allow_tags": ["重鎧", "中鎧", "盾"],
        "function": "あなたの【物理防御力】に＋２する。",
        "id": next_id + 3
    },
    {
        "rank": 1,
        "name": "守護の",
        "required_tag": "",
        "allow_tags": ["盾", "頭部", "腕部"],
        "function": "〔起動：インスタント〕あなたは［障壁：５］を得る。シーン１回使用可能。",
        "id": next_id + 4
    }
]
final_candidates.extend(rank1_candidates)
next_id += 5

# Rank2の候補（強化された効果）
rank2_candidates = [
    {
        "rank": 2,
        "name": "追撃の",
        "required_tag": "",
        "allow_tags": ["剣", "刀", "槍", "槌斧", "鞭", "格闘", "杖"],
        "function": "この武器による［白兵攻撃］でダメージを与えた時、攻撃の対象に［追撃：３］を与える。",
        "id": next_id
    },
    {
        "rank": 2,
        "name": "重圧の",
        "required_tag": "両手",
        "allow_tags": ["剣", "刀", "槍", "槌斧", "鞭", "格闘", "杖", "弓"],
        "function": "この武器による［武器攻撃］でダメージを与えた時、あなたの【ヘイト】に＋１する。",
        "id": next_id + 1
    },
    {
        "rank": 2,
        "name": "致命の",
        "required_tag": "",
        "allow_tags": ["剣", "刀", "槍", "軽量"],
        "function": "〔起動：判定直後〕この武器による［武器攻撃］の［命中判定］でダイスに５以上の出目が２つ以上あれば、判定をクリティカルにする。シナリオ１回使用可能。",
        "id": next_id + 2
    },
    {
        "rank": 2,
        "name": "魔導の",
        "required_tag": "",
        "allow_tags": ["杖", "魔石"],
        "function": "あなたの［魔法攻撃］のダメージロールに＋５する。",
        "id": next_id + 3
    },
    {
        "rank": 2,
        "name": "活力の",
        "required_tag": "",
        "allow_tags": ["腕部", "外套"],
        "function": "あなたの【ＨＰ】最大値に＋１０する。",
        "id": next_id + 4
    }
]
final_candidates.extend(rank2_candidates)
next_id += 5

# Rank3の候補（特殊効果）
rank3_candidates = [
    {
        "rank": 3,
        "name": "吸魔の",
        "required_tag": "",
        "allow_tags": ["剣", "刀", "槍", "槌斧", "鞭", "格闘", "杖"],
        "function": "この武器による［白兵攻撃］でダメージを与えた時、あなたの【ＭＰ】は３点回復する。",
        "id": next_id
    },
    {
        "rank": 3,
        "name": "呪縛の",
        "required_tag": "",
        "allow_tags": ["剣", "刀", "槍", "槌斧", "鞭", "格闘", "杖", "弓", "投擲"],
        "function": "この武器による《基本武器攻撃》でダメージを与えた時、攻撃の対象に［束縛］を与える。",
        "id": next_id + 1
    },
    {
        "rank": 3,
        "name": "氷結の",
        "required_tag": "",
        "allow_tags": ["剣", "刀", "槍", "槌斧", "鞭", "格闘", "杖", "弓", "投擲", "軽量", "固定砲", "魔石"],
        "function": "この武器による攻撃でダメージを与えた時、攻撃の対象に［凍結］を与える。シナリオ１回使用可能。",
        "id": next_id + 2
    },
    {
        "rank": 3,
        "name": "反魔の",
        "required_tag": "",
        "allow_tags": ["盾", "重鎧", "中鎧", "軽鎧"],
        "function": "あなたはシーン開始時に［軽減（魔法攻撃）：１５］を得る。",
        "id": next_id + 3
    },
    {
        "rank": 3,
        "name": "機動の",
        "required_tag": "",
        "allow_tags": ["脚部", "外套", "軽鎧"],
        "function": "あなたの【移動力】に＋１する。",
        "id": next_id + 4
    }
]
final_candidates.extend(rank3_candidates)
next_id += 5

# Rank4の候補（上位効果）
rank4_candidates = [
    {
        "rank": 4,
        "name": "暴走の",
        "required_tag": "両手",
        "allow_tags": ["剣", "刀", "槍", "槌斧", "鞭", "格闘", "杖"],
        "function": "〔起動：ダメージロール〕この武器による［武器攻撃］のダメージロールに＋［あなたの【ヘイト】×２］する。ただし、このメインプロセス終了時にあなたは［放心］を受ける。シナリオ１回使用可能。",
        "id": next_id
    },
    {
        "rank": 4,
        "name": "破壊の",
        "required_tag": "両手",
        "allow_tags": ["剣", "刀", "槍", "槌斧"],
        "function": "この武器による［白兵攻撃］のダメージロールに＋２Ｄする。",
        "id": next_id + 1
    },
    {
        "rank": 4,
        "name": "魔弾強化の",
        "required_tag": "",
        "allow_tags": ["弓", "投擲", "軽量"],
        "function": "この武器による［射撃攻撃］のダメージロールに＋２Ｄする。",
        "id": next_id + 2
    },
    {
        "rank": 4,
        "name": "完全防御の",
        "required_tag": "",
        "allow_tags": ["盾", "重鎧"],
        "function": "あなたの【物理防御力】に＋６、【魔法防御力】に＋６する。",
        "id": next_id + 3
    },
    {
        "rank": 4,
        "name": "再生の",
        "required_tag": "",
        "allow_tags": ["腕部", "外套", "頭部"],
        "function": "あなたはシーン開始時に［再生：３］を得る。",
        "id": next_id + 4
    }
]
final_candidates.extend(rank4_candidates)
next_id += 5

# Rank5の候補（高位効果）
rank5_candidates = [
    {
        "rank": 5,
        "name": "龍殺しの",
        "required_tag": "",
        "allow_tags": ["剣", "刀", "槍", "槌斧", "鞭", "格闘", "杖", "弓", "投擲", "軽量", "固定砲"],
        "function": "この武器による［幻獣］［精霊］への［武器攻撃］のダメージロールに＋２０する。",
        "id": next_id
    },
    {
        "rank": 5,
        "name": "完全魔導の",
        "required_tag": "",
        "allow_tags": ["杖", "魔石"],
        "function": "あなたの【魔力】に＋５する。あなたの［魔法攻撃］のダメージロールに＋１Ｄする。",
        "id": next_id + 1
    },
    {
        "rank": 5,
        "name": "絶対防壁の",
        "required_tag": "",
        "allow_tags": ["盾", "頭部"],
        "function": "あなたはシーン開始時に［障壁：４０］を得る。",
        "id": next_id + 2
    },
    {
        "rank": 5,
        "name": "完全軽減の",
        "required_tag": "",
        "allow_tags": ["重鎧", "中鎧", "軽鎧"],
        "function": "あなたはシーン開始時に［軽減（全属性）：５］を得る。",
        "id": next_id + 3
    },
    {
        "rank": 5,
        "name": "超高速の",
        "required_tag": "",
        "allow_tags": ["脚部", "外套"],
        "function": "このアイテムの「行動修正」に＋５する。あなたの【移動力】に＋２する。",
        "id": next_id + 4
    }
]
final_candidates.extend(rank5_candidates)
next_id += 5

# Rank6の候補（最上位効果）
rank6_candidates = [
    {
        "rank": 6,
        "name": "破滅の",
        "required_tag": "両手",
        "allow_tags": ["剣", "刀", "槍", "槌斧", "鞭", "格闘", "杖"],
        "function": "この武器の【攻撃力】に＋８する。この武器による［武器攻撃］のダメージロールに＋３Ｄする。",
        "id": next_id
    },
    {
        "rank": 6,
        "name": "究極魔導の",
        "required_tag": "",
        "allow_tags": ["杖", "魔石"],
        "function": "あなたの【魔力】に＋８する。あなたの［魔法攻撃］のダメージロールに＋２Ｄする。",
        "id": next_id + 1
    },
    {
        "rank": 6,
        "name": "不滅の",
        "required_tag": "",
        "allow_tags": ["重鎧", "盾"],
        "function": "あなたの【物理防御力】に＋１０、【魔法防御力】に＋１０する。あなたはシーン開始時に［障壁：５０］を得る。",
        "id": next_id + 2
    },
    {
        "rank": 6,
        "name": "全軽減の",
        "required_tag": "",
        "allow_tags": ["重鎧", "中鎧", "軽鎧", "外套"],
        "function": "あなたはシーン開始時に［軽減（全属性）：１５］を得る。",
        "id": next_id + 3
    },
    {
        "rank": 6,
        "name": "覇道の",
        "required_tag": "",
        "allow_tags": ["補助装備", "鞄"],
        "function": "あなたの【攻撃力】に＋５、【魔力】に＋５する。あなたのダメージロールに＋１Ｄする。",
        "id": next_id + 4
    }
]
final_candidates.extend(rank6_candidates)

# 既存のitems.jsonから抽出した特殊な効果をベースにした追加候補
additional_candidates = [
    # スキル強化系
    {
        "rank": 2,
        "name": "援護の",
        "required_tag": "",
        "allow_tags": ["楽器", "杖"],
        "function": "あなたが使用する［援護歌］特技のＳＲに＋１する（最大ＳＲを超えてもよい）。",
        "id": next_id + 5
    },
    {
        "rank": 3,
        "name": "刺突の",
        "required_tag": "",
        "allow_tags": ["剣", "槍", "軽量"],
        "function": "この武器による［白兵攻撃］で［防御判定］に失敗した対象は、さらに［放心］を受ける。",
        "id": next_id + 6
    },
    {
        "rank": 3,
        "name": "重撃の",
        "required_tag": "",
        "allow_tags": ["槌斧", "格闘", "杖"],
        "function": "この武器による《基本武器攻撃》でダメージを与えた時、攻撃の対象に［硬直］を与える。",
        "id": next_id + 7
    },
    {
        "rank": 4,
        "name": "速攻の",
        "required_tag": "",
        "allow_tags": ["剣", "刀", "軽量"],
        "function": "〔起動：セットアップ〕このラウンドのあなたの【行動力】に＋５する。シーン１回使用可能。",
        "id": next_id + 8
    },
    {
        "rank": 4,
        "name": "魔力吸収の",
        "required_tag": "",
        "allow_tags": ["杖", "魔石"],
        "function": "あなたの［魔法攻撃］でダメージを与えた時、あなたの【ＭＰ】は５点回復する。",
        "id": next_id + 9
    },
]
final_candidates.extend(additional_candidates)

print(f"=== 新しい接頭辞効果候補: {len(final_candidates)}個 ===\n")

# Rank別に表示
for rank in range(1, 7):
    rank_items = [c for c in final_candidates if c['rank'] == rank]
    print(f"\n【Rank {rank}】: {len(rank_items)}個")
    for item in rank_items:
        print(f"  - {item['name']}: {item['function'][:60]}...")

# JSON形式で保存
output_data = {
    "analysis_summary": {
        "total_magic_items": len(magic_items),
        "rank_distribution": dict(rank_count),
        "new_candidates_count": len(final_candidates)
    },
    "new_prefixed_effects": final_candidates
}

with open('new_prefixed_effects.json', 'w', encoding='utf-8') as f:
    json.dump(output_data, f, ensure_ascii=False, indent=2)

print("\n\n=== 新しい接頭辞効果をnew_prefixed_effects.jsonに保存しました ===")
print(f"合計: {len(final_candidates)}個の新しい接頭辞効果を生成しました")
