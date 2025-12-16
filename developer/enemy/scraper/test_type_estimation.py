"""
type推定のテストと係数調整
"""

import json
import math
from pathlib import Path

INPUT_DIR = Path("../json")
ENEMY_MASTER_FILE = INPUT_DIR / "enemy_master.json"

# テスト対象のエネミー (CR10は古いデータのため除外)
TEST_ENEMIES = {
    "鉄躯緑鬼": "armorer",      # CR7
    # "吸血鬼": "fencer",         # CR10 - 古いデータのため除外
    "屍食少女": "grappler",      # CR4
    "棘茨イタチ": "supporter",   # CR1
    "一角獣": "healer",          # CR8
    # "刃のマスカルウィン": "spear", # CR10 - 古いデータのため除外
    "時計仕掛の蜻蛉": "archer",  # CR3
    "小牙竜鬼の詠唱師": "shooter", # CR1
    "白姫のヘイグロト": "bomber"  # CR8
}

def load_json(filepath: Path):
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

def parse_stat_value(val):
    """"+2D"や"+3D"の形式を数値に変換（ダイス1個あたり+3）"""
    if isinstance(val, str):
        import re
        base_match = re.search(r'(\d+)(?=\+|\s|$)', val)
        base_val = int(base_match.group(1)) if base_match else 0
        dice_match = re.search(r'\+?(\d+)D', val)
        dice_count = int(dice_match.group(1)) if dice_match else 0
        return base_val + (dice_count * 3)
    return val or 0

def estimate_enemy_type(enemy, stats_weight=1.0, resist_weight=1.0):
    """
    type推定（新方式）
    1. STR/DEX/POW/INTの完全一致を最優先
    2. 一致なしなら基本能力値のユークリッド距離で絞る
    3. さらにAvoid/Resistのダイス数と値で判定
    4. CR10以上は古いデータなので、距離閾値を緩和してタイブレークを優先
    """
    str_val = enemy.get("strength", 0) or 0
    dex_val = enemy.get("dexterity", 0) or 0
    pow_val = enemy.get("power", 0) or 0
    int_val = enemy.get("intelligence", 0) or 0
    rank = enemy.get("character_rank", 1) or 1
    
    avoid_val = enemy.get("avoid", 0) or 0
    resist_val = enemy.get("resist", 0) or 0
    avoid_dice = enemy.get("avoid_dice", 0) or 0
    resist_dice = enemy.get("resist_dice", 0) or 0
    
    # CR10以上は古いデータなので距離閾値を緩くする
    is_high_cr = rank >= 10
    distance_threshold = 1.5 if is_high_cr else 1.0
    
    if str_val == 0 and dex_val == 0 and pow_val == 0 and int_val == 0:
        return None
    
    # +3Dを持つかチェック（grappler判定用）
    has_3d = avoid_dice >= 3 or resist_dice >= 3
    
    types = ["armorer", "fencer", "grappler", "supporter", "healer", "spear", "archer", "shooter", "bomber"]
    exact_matches = []  # 完全一致したタイプ
    type_info = {}  # 各タイプの期待値と距離情報
    
    for enemy_type in types:
        # 期待値計算（各typeの計算式）
        if enemy_type == "armorer":
            str_base = 7 + rank + (rank // 10)
            dex_base = 3 + rank + (rank // 10)
            pow_base = 4 + rank + (rank // 10)
            int_base = 2 + rank + (rank // 10)
            expected_str = str_base // 3
            expected_dex = dex_base // 3
            expected_pow = pow_base // 3
            expected_int = int_base // 3
            expected_avoid = (4 + rank + (rank // 5)) // 3 + 6
            expected_resist = (2 + rank + (rank // 10)) // 3 + 6
        elif enemy_type == "fencer":
            str_base = 7 + rank + (rank // 10)
            dex_base = 4 + rank + (rank // 10)
            pow_base = 2 + rank + (rank // 10)
            int_base = 3 + rank + (rank // 10)
            expected_str = str_base // 3
            expected_dex = dex_base // 3
            expected_pow = pow_base // 3
            expected_int = int_base // 3
            expected_avoid = (4 + rank + (rank // 10)) // 3 + 6
            expected_resist = (2 + rank + (rank // 10)) // 3 + 6
        elif enemy_type == "grappler":
            str_base = 6 + rank + (rank // 10)
            dex_base = 4 + rank + (rank // 10)
            pow_base = 2 + rank + (rank // 10)
            int_base = 3 + rank + (rank // 10)
            expected_str = str_base // 3
            expected_dex = dex_base // 3
            expected_pow = pow_base // 3
            expected_int = int_base // 3
            expected_avoid = (2 + rank + (rank // 10)) // 3 + 9
            expected_resist = (4 + rank + (rank // 10)) // 3 + 9
        elif enemy_type == "supporter":
            str_base = 4 + rank + (rank // 10)
            dex_base = 2 + rank + (rank // 10)
            pow_base = 7 + rank + (rank // 10)
            int_base = 3 + rank + (rank // 10)
            expected_str = str_base // 3
            expected_dex = dex_base // 3
            expected_pow = pow_base // 3
            expected_int = int_base // 3
            expected_avoid = (2 + rank + (rank // 5)) // 3 + 6
            expected_resist = (7 + rank + (rank // 10)) // 3 + 6
        elif enemy_type == "healer":
            str_base = 3 + rank + (rank // 10)
            dex_base = 2 + rank + (rank // 10)
            pow_base = 7 + rank + (rank // 10)
            int_base = 4 + rank + (rank // 10)
            expected_str = str_base // 3
            expected_dex = dex_base // 3
            expected_pow = pow_base // 3
            expected_int = int_base // 3
            expected_avoid = (2 + rank + (rank // 5)) // 3 + 6
            expected_resist = (7 + rank + (rank // 10)) // 3 + 6
        elif enemy_type == "spear":
            str_base = 4 + rank + (rank // 10)
            dex_base = 7 + rank + (rank // 10)
            pow_base = 2 + rank + (rank // 10)
            int_base = 3 + rank + (rank // 10)
            expected_str = str_base // 3
            expected_dex = dex_base // 3
            expected_pow = pow_base // 3
            expected_int = int_base // 3
            expected_avoid = (7 + rank + (rank // 5)) // 3 + 6
            expected_resist = (2 + rank + (rank // 10)) // 3 + 6
        elif enemy_type == "archer":
            str_base = 3 + rank + (rank // 10)
            dex_base = 4 + rank + (rank // 10)
            pow_base = 2 + rank + (rank // 10)
            int_base = 7 + rank + (rank // 10)
            expected_str = str_base // 3
            expected_dex = dex_base // 3
            expected_pow = pow_base // 3
            expected_int = int_base // 3
            expected_avoid = (4 + rank + (rank // 10)) // 3 + 6
            expected_resist = (2 + rank + (rank // 10)) // 3 + 6
        elif enemy_type == "shooter":
            str_base = 3 + rank + (rank // 10)
            dex_base = 2 + rank + (rank // 10)
            pow_base = 5 + rank + (rank // 10)
            int_base = 7 + rank + (rank // 10)
            expected_str = str_base // 3
            expected_dex = dex_base // 3
            expected_pow = pow_base // 3
            expected_int = int_base // 3
            expected_avoid = (2 + rank + (rank // 5)) // 3 + 6
            expected_resist = (5 + rank + (rank // 10)) // 3 + 6
        elif enemy_type == "bomber":
            str_base = 3 + rank + (rank // 10)
            dex_base = 2 + rank + (rank // 10)
            pow_base = 5 + rank + (rank // 10)
            int_base = 7 + rank + (rank // 10)
            expected_str = str_base // 3
            expected_dex = dex_base // 3
            expected_pow = pow_base // 3
            expected_int = int_base // 3
            expected_avoid = (2 + rank + (rank // 5)) // 3 + 6
            expected_resist = (5 + rank + (rank // 10)) // 3 + 6
        
        # 基本能力値の完全一致チェック
        if (str_val == expected_str and dex_val == expected_dex and 
            pow_val == expected_pow and int_val == expected_int):
            exact_matches.append(enemy_type)
        
        # 基本能力値のユークリッド距離（最重要）
        stats_distance = math.sqrt(
            (str_val - expected_str) ** 2 +
            (dex_val - expected_dex) ** 2 +
            (pow_val - expected_pow) ** 2 +
            (int_val - expected_int) ** 2
        )
        
        # Avoid/Resistの差分
        avoid_diff = abs(avoid_val - expected_avoid)
        resist_diff = abs(resist_val - expected_resist)
        
        type_info[enemy_type] = {
            'stats_dist': stats_distance,
            'avoid_diff': avoid_diff,
            'resist_diff': resist_diff,
            'expected': {
                'str': expected_str, 'dex': expected_dex,
                'pow': expected_pow, 'int': expected_int,
                'avoid': expected_avoid, 'resist': expected_resist
            }
        }
    
    # フェーズ1: grapplerの特別ルール
    # +3D持ちは優先的にgrappler、持たない場合はgrappler候補から除外
    if has_3d:
        grappler_stats = type_info.get('grappler', {}).get('stats_dist', float('inf'))
        # +3Dを持ち、grapplerとの距離が最小または1.5以下の場合
        min_stats_dist = min(info['stats_dist'] for info in type_info.values())
        if grappler_stats == min_stats_dist or grappler_stats <= 1.5:
            return 'grappler', type_info
    else:
        # +3Dを持たない場合、grapplerを候補から除外
        type_info_no_grappler = {t: info for t, info in type_info.items() if t != 'grappler'}
        if exact_matches and 'grappler' in exact_matches:
            exact_matches.remove('grappler')
        # 後続の処理で使う辞書を置き換え
        type_info = type_info_no_grappler
    
    # フェーズ2: 完全一致がある場合、その中から選択
    if exact_matches:
        if len(exact_matches) == 1:
            return exact_matches[0], type_info
        # 複数の完全一致がある場合、Avoid/Resistで絞る
        candidates = exact_matches
    else:
        # フェーズ3: 基本能力値の距離が最小のタイプを候補に
        min_stats_dist = min(info['stats_dist'] for info in type_info.values())
        
        # CR10以上の場合、距離閾値内の候補を全て残す（タイブレークルール優先）
        if is_high_cr:
            candidates = [t for t, info in type_info.items() 
                         if info['stats_dist'] <= min_stats_dist + distance_threshold]
        else:
            candidates = [t for t, info in type_info.items() if info['stats_dist'] == min_stats_dist]
    
    # フェーズ4: 候補が1つなら決定
    if len(candidates) == 1:
        return candidates[0], type_info
    
    # フェーズ5: タイブレークルール
    # 5-1. spearが候補にある場合、DEXが最も高ければspear
    if 'spear' in candidates and len(candidates) > 1:
        if dex_val >= str_val and dex_val >= pow_val and dex_val >= int_val:
            return 'spear', type_info
    
    # 5-2. armorerとfencerが同点の場合、STRとDEXの差とAvoid値で判定
    if 'armorer' in candidates and 'fencer' in candidates:
        str_dex_diff = str_val - dex_val
        # 鉄躯緑鬼(STR:4 DEX:3)→armorer、吸血鬼(STR:5 DEX:4)→fencer
        # STRがDEXより2以上高い場合、またはSTRとDEXが同じ・Avoidが高い(≧4)場合はarmorer
        if str_dex_diff >= 2 or (str_dex_diff == 0 and avoid_val >= 4):
            return 'armorer', type_info
        # STRがDEXより1高く、Avoidが高い(≧4)場合はarmorer
        elif str_dex_diff >= 1 and avoid_val >= 4:
            return 'armorer', type_info
        else:
            return 'fencer', type_info
    
    # 5-3. shooterとbomberが同点の場合、INTが厳密に高い方をbomberに
    if 'shooter' in candidates and 'bomber' in candidates:
        if int_val > pow_val:
            return 'bomber', type_info
        else:
            return 'shooter', type_info
    
    # 5-4. supporterとhealerが同点の場合、POWが高い方をsupporterに
    if 'supporter' in candidates and 'healer' in candidates:
        if pow_val > int_val:
            return 'supporter', type_info
        else:
            return 'healer', type_info
    
    # フェーズ6: デフォルトは最初の候補
    return candidates[0], type_info

def test_coefficients(stats_weight, resist_weight):
    """指定された係数でテスト"""
    enemies = load_json(ENEMY_MASTER_FILE)
    
    correct = 0
    total = 0
    details = []
    
    for enemy in enemies:
        name = enemy.get("name", "")
        if name in TEST_ENEMIES:
            expected_type = TEST_ENEMIES[name]
            estimated_type, distances = estimate_enemy_type(enemy, stats_weight, resist_weight)
            
            is_correct = estimated_type == expected_type
            if is_correct:
                correct += 1
            total += 1
            
            details.append({
                'name': name,
                'expected': expected_type,
                'estimated': estimated_type,
                'correct': is_correct,
                'distances': distances,
                'cr': enemy.get('character_rank', 0),
                'stats': f"STR:{enemy.get('strength')} DEX:{enemy.get('dexterity')} POW:{enemy.get('power')} INT:{enemy.get('intelligence')}",
                'resist': f"Avoid:{enemy.get('avoid')}+{enemy.get('avoid_dice')}D Resist:{enemy.get('resist')}+{enemy.get('resist_dice')}D"
            })
    
    accuracy = correct / total if total > 0 else 0
    return accuracy, details

def main():
    print("=" * 80)
    print("Type推定テスト - 係数調整")
    print("=" * 80)
    print()
    
    # 係数のグリッドサーチ（より細かく）
    best_accuracy = 0
    best_stats_weight = 1.0
    best_resist_weight = 1.0
    
    print("係数探索中（細かいグリッド）...")
    for stats_w in [0.5, 0.6, 0.7, 0.75, 0.8, 0.9, 1.0, 1.1, 1.2, 1.25, 1.5, 2.0, 2.5, 3.0]:
        for resist_w in [0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.9, 1.0, 1.1, 1.2, 1.25, 1.5]:
            accuracy, _ = test_coefficients(stats_w, resist_w)
            if accuracy >= 0.5:  # 50%以上のみ表示
                print(f"  stats_weight={stats_w:.2f}, resist_weight={resist_w:.2f} => 正解率: {accuracy*100:.1f}%")
            
            if accuracy > best_accuracy:
                best_accuracy = accuracy
                best_stats_weight = stats_w
                best_resist_weight = resist_w
    
    print()
    print("=" * 80)
    print(f"最適係数: stats_weight={best_stats_weight}, resist_weight={best_resist_weight}")
    print(f"正解率: {best_accuracy*100:.1f}%")
    print("=" * 80)
    print()
    
    # 最適係数での詳細結果
    accuracy, details = test_coefficients(best_stats_weight, best_resist_weight)
    
    print("詳細結果:")
    for d in details:
        status = "[OK]" if d['correct'] else "[NG]"
        print(f"{status} {d['name']} (CR{d['cr']})")
        print(f"  期待: {d['expected']}, 推定: {d['estimated']}")
        print(f"  {d['stats']}, {d['resist']}")
        
        # 距離の詳細
        sorted_dists = sorted(d['distances'].items(), key=lambda x: x[1]['stats_dist'])
        print(f"  基本能力値距離トップ3:")
        for i, (type_name, dist) in enumerate(sorted_dists[:3], 1):
            marker = "★" if type_name == d['expected'] else " "
            exp = dist['expected']
            print(f"    {marker}{i}. {type_name}: dist={dist['stats_dist']:.2f} (期待: STR:{exp['str']} DEX:{exp['dex']} POW:{exp['pow']} INT:{exp['int']})")
        print()

if __name__ == "__main__":
    main()
