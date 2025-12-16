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

print(f"=== マジックアイテム総数: {len(magic_items)} ===\n")

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

# 効果パターンの分析
effect_patterns = {
    '攻撃力固定値増加': [],
    '魔力固定値増加': [],
    '防御力固定値増加': [],
    'ダメージロール修正': [],
    '起動型効果': [],
    '状態異常付与': [],
    '状態異常解除': [],
    'タグ追加': [],
    '判定修正': [],
    '移動/行動力修正': [],
    'ヘイト操作': [],
    '軽減効果': [],
    '障壁付与': [],
    '再生付与': [],
    '特定種族特効': [],
    '射程延長': [],
    '回復力増加': [],
    'その他': []
}

# 既存の接頭辞効果を取得
existing_effects = set()
for effect in prefixed_data['prefixed_effects']:
    existing_effects.add(effect['function'])

# マジックアイテムの効果を分類
for item in magic_items:
    func = item.get('function', '')
    rank = item.get('item_rank', 0)
    name = item.get('name', '')
    tags = item.get('tags', [])
    
    item_info = {
        'name': name,
        'rank': rank,
        'function': func,
        'tags': tags,
        'type': item.get('type', '')
    }
    
    # 攻撃力固定値増加
    if '【攻撃力】' in func and ('＋' in func or '+' in func) and '起動' not in func:
        effect_patterns['攻撃力固定値増加'].append(item_info)
    # 魔力固定値増加
    elif '【魔力】' in func and ('＋' in func or '+' in func) and '起動' not in func:
        effect_patterns['魔力固定値増加'].append(item_info)
    # 防御力固定値増加
    elif ('【物理防御力】' in func or '【魔法防御力】' in func) and ('＋' in func or '+' in func) and '起動' not in func:
        effect_patterns['防御力固定値増加'].append(item_info)
    # ダメージロール修正
    elif 'ダメージロール' in func and ('＋' in func or '+' in func):
        effect_patterns['ダメージロール修正'].append(item_info)
    # 状態異常付与
    elif any(bs in func for bs in ['［放心］', '［硬直］', '［束縛］', '［萎縮］', '［衰弱］', '［炎上］', '［凍結］', '［麻痺］', '［猛毒］', '［盲目］', '［混乱］']):
        effect_patterns['状態異常付与'].append(item_info)
    # 状態異常解除
    elif 'ＢＳ' in func and ('解除' in func or '無効' in func):
        effect_patterns['状態異常解除'].append(item_info)
    # タグ追加
    elif 'タグを追加' in func:
        effect_patterns['タグ追加'].append(item_info)
    # 軽減効果
    elif '［軽減' in func:
        effect_patterns['軽減効果'].append(item_info)
    # 障壁付与
    elif '［障壁' in func:
        effect_patterns['障壁付与'].append(item_info)
    # 再生付与
    elif '［再生］' in func:
        effect_patterns['再生付与'].append(item_info)
    # 特定種族特効
    elif any(race in func for race in ['［人型］', '［自然］', '［精霊］', '［幻獣］', '［不死］', '［人造］', '［人間］']):
        effect_patterns['特定種族特効'].append(item_info)
    # 射程延長
    elif '射程' in func and ('＋' in func or '+' in func or '延長' in func):
        effect_patterns['射程延長'].append(item_info)
    # 判定修正
    elif '判定' in func and ('＋' in func or '+' in func or 'クリティカル' in func):
        effect_patterns['判定修正'].append(item_info)
    # 移動/行動力修正
    elif ('移動' in func or '【行動力】' in func or '《ラン》' in func or '《ダッシュ》' in func) and ('＋' in func or '+' in func):
        effect_patterns['移動/行動力修正'].append(item_info)
    # ヘイト操作
    elif '【ヘイト】' in func:
        effect_patterns['ヘイト操作'].append(item_info)
    # 回復力増加
    elif '【回復力】' in func and ('＋' in func or '+' in func):
        effect_patterns['回復力増加'].append(item_info)
    # 起動型効果
    elif '〔起動' in func:
        effect_patterns['起動型効果'].append(item_info)
    # その他
    else:
        effect_patterns['その他'].append(item_info)

print("=== 効果パターンの分類 ===")
for category, items in effect_patterns.items():
    if items:
        print(f"\n【{category}】: {len(items)}個")
        for item in items[:5]:  # 最初の5個だけ表示
            print(f"  - {item['name']} (M{item['rank']}): {item['function'][:50]}...")

# 既存効果にない新しいパターンを特定
print("\n\n=== 新しい接頭辞効果の候補 ===")
new_effect_candidates = []

for item in magic_items:
    func = item.get('function', '')
    if func not in existing_effects and len(func) > 10:  # 説明文以外
        rank = item.get('item_rank', 0)
        tags = item.get('tags', [])
        
        # M1～M6タグを除外
        weapon_armor_tags = [t for t in tags if not re.match(r'^M[1-6]$', str(t))]
        
        candidate = {
            'name': item.get('name', ''),
            'rank': rank,
            'function': func,
            'tags': weapon_armor_tags,
            'type': item.get('type', '')
        }
        new_effect_candidates.append(candidate)

# ユニークな効果のみを抽出（同じ効果説明のものは除外）
unique_effects = {}
for candidate in new_effect_candidates:
    func = candidate['function']
    if func not in unique_effects:
        unique_effects[func] = candidate

print(f"ユニークな新規効果パターン: {len(unique_effects)}個\n")

# Rank別に分散させて30個以上を選出
selected_candidates = []
rank_distribution = {1: [], 2: [], 3: [], 4: [], 5: [], 6: []}

for func, candidate in unique_effects.items():
    rank = candidate['rank']
    if 1 <= rank <= 6:
        rank_distribution[rank].append(candidate)

# 各Rankから均等に選出
target_per_rank = 6  # 各Rankから6個ずつで36個
for rank in range(1, 7):
    candidates = rank_distribution[rank]
    selected = candidates[:target_per_rank]
    selected_candidates.extend(selected)

print(f"=== 選出された接頭辞効果候補: {len(selected_candidates)}個 ===\n")

for i, candidate in enumerate(selected_candidates, 1):
    print(f"\n{i}. 【{candidate['name']}】")
    print(f"   Rank: M{candidate['rank']}")
    print(f"   Type: {candidate['type']}")
    print(f"   Tags: {', '.join(map(str, candidate['tags']))}")
    print(f"   Function: {candidate['function']}")

# JSON形式で出力
output_data = {
    'summary': {
        'total_magic_items': len(magic_items),
        'rank_distribution': dict(rank_count),
        'effect_categories': {cat: len(items) for cat, items in effect_patterns.items() if items},
        'new_effect_patterns': len(unique_effects),
        'selected_candidates': len(selected_candidates)
    },
    'candidates': []
}

for candidate in selected_candidates:
    # タグを分類
    weapon_tags = ['片手', '両手', '剣', '刀', '槍', '槌斧', '鞭', '格闘', '杖', '弓', '投擲', '軽量', '固定砲', '魔石', '楽器']
    armor_tags = ['盾', '重鎧', '中鎧', '軽鎧', '頭部', '腕部', '脚部', '外套']
    other_tags = ['補助装備', '鞄', '消耗品']
    
    tags = candidate['tags']
    allow_tags = []
    required_tag = ""
    
    # allow_tagsを決定
    for tag in tags:
        if tag in weapon_tags or tag in armor_tags:
            allow_tags.append(tag)
    
    # 元の名前から接頭辞名を生成（簡易版）
    original_name = candidate['name']
    prefix_name = original_name + "の"
    
    output_candidate = {
        'rank': candidate['rank'],
        'name': prefix_name,
        'required_tag': required_tag,
        'allow_tags': allow_tags if allow_tags else ['補助装備', '鞄'],
        'function': candidate['function'],
        'original_item': original_name
    }
    output_data['candidates'].append(output_candidate)

# JSONファイルとして保存
with open('magic_items_analysis.json', 'w', encoding='utf-8') as f:
    json.dump(output_data, f, ensure_ascii=False, indent=2)

print("\n\n=== 分析結果をmagic_items_analysis.jsonに保存しました ===")
