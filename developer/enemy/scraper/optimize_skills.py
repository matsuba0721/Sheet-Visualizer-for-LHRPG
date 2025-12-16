"""
エネミーマスターデータと特技データを統合し、検索用に最適化したデータを生成
"""

import json
from pathlib import Path
from typing import List, Dict, Set

INPUT_DIR = Path("../json")
OUTPUT_DIR = Path("../json")
ENEMY_MASTER_FILE = INPUT_DIR / "enemy_master.json"
ENEMY_SKILLS_FILE = INPUT_DIR / "enemy_skills.json"
OUTPUT_FILE = OUTPUT_DIR / "enemy_skills_optimized.json"

def load_json(filepath: Path) -> any:
    """JSONファイルを読み込む"""
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(data: any, filepath: Path):
    """JSONファイルを保存"""
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
    print(f"✓ 保存完了: {filepath}")

def estimate_enemy_type(enemy: Dict) -> str:
    """
    エネミーのステータスからtypeを推定
    基本能力値(STR/DEX/POW/INT)の一致を最優先し、
    それで絞り込めない場合はAvoid/Resistのダイス数で判定
    """
    import math
    
    # ステータスを取得
    str_val = enemy.get("strength", 0) or 0
    dex_val = enemy.get("dexterity", 0) or 0
    pow_val = enemy.get("power", 0) or 0
    int_val = enemy.get("intelligence", 0) or 0
    rank = enemy.get("character_rank", 1) or 1
    
    # Avoid/Resistのダイス数
    avoid_dice = enemy.get("avoid_dice", 0) or 0
    resist_dice = enemy.get("resist_dice", 0) or 0
    has_3d = (avoid_dice >= 3 or resist_dice >= 3)
    
    # 必要なステータスが揃っていない場合はNoneを返す
    if str_val == 0 and dex_val == 0 and pow_val == 0 and int_val == 0:
        return None
    
    # フェーズ1: grapplerの特別判定（+3Dを持つ場合は優先）
    if has_3d:
        return "grappler"
    
    # フェーズ2: 基本能力値(STR/DEX/POW/INT)の完全一致チェック
    types = ["armorer", "fencer", "supporter", "healer", "spear", "archer", "shooter", "bomber"]
    
    for enemy_type in types:
        # 各タイプの基本値を計算
        if enemy_type == "armorer":
            str_base = 7 + rank + (rank // 10)
            dex_base = 3 + rank + (rank // 10)
            pow_base = 4 + rank + (rank // 10)
            int_base = 2 + rank + (rank // 10)
            expected_str = str_base // 3
            expected_dex = dex_base // 3
            expected_pow = pow_base // 3
            expected_int = int_base // 3
            expected_avoid = (4 + rank + (rank // 5)) // 3 + 6  # +2D = +6
            expected_resist = (2 + rank + (rank // 10)) // 3 + 6  # +2D = +6
        elif enemy_type == "fencer":
            str_base = 7 + rank + (rank // 10)
            dex_base = 4 + rank + (rank // 10)
            pow_base = 2 + rank + (rank // 10)
            int_base = 3 + rank + (rank // 10)
            expected_str = str_base // 3
            expected_dex = dex_base // 3
            expected_pow = pow_base // 3
            expected_int = int_base // 3
            expected_avoid = (4 + rank + (rank // 10)) // 3 + 6  # +2D = +6
            expected_resist = (2 + rank + (rank // 10)) // 3 + 6  # +2D = +6
        elif enemy_type == "grappler":
            str_base = 6 + rank + (rank // 10)
            dex_base = 4 + rank + (rank // 10)
            pow_base = 2 + rank + (rank // 10)
            int_base = 3 + rank + (rank // 10)
            expected_str = str_base // 3
            expected_dex = dex_base // 3
            expected_pow = pow_base // 3
            expected_int = int_base // 3
            expected_avoid = (2 + rank + (rank // 10)) // 3 + 9  # +3D = +9
            expected_resist = (4 + rank + (rank // 10)) // 3 + 9  # +3D = +9
        elif enemy_type == "supporter":
            str_base = 4 + rank + (rank // 10)
            dex_base = 2 + rank + (rank // 10)
            pow_base = 7 + rank + (rank // 10)
            int_base = 3 + rank + (rank // 10)
            expected_str = str_base // 3
            expected_dex = dex_base // 3
            expected_pow = pow_base // 3
            expected_int = int_base // 3
            expected_avoid = (2 + rank + (rank // 5)) // 3 + 6  # +2D = +6
            expected_resist = (7 + rank + (rank // 10)) // 3 + 6  # +2D = +6
        elif enemy_type == "healer":
            str_base = 3 + rank + (rank // 10)
            dex_base = 2 + rank + (rank // 10)
            pow_base = 7 + rank + (rank // 10)
            int_base = 4 + rank + (rank // 10)
            expected_str = str_base // 3
            expected_dex = dex_base // 3
            expected_pow = pow_base // 3
            expected_int = int_base // 3
            expected_avoid = (2 + rank + (rank // 5)) // 3 + 6  # +2D = +6
            expected_resist = (7 + rank + (rank // 10)) // 3 + 6  # +2D = +6
        elif enemy_type == "spear":
            str_base = 4 + rank + (rank // 10)
            dex_base = 7 + rank + (rank // 10)
            pow_base = 2 + rank + (rank // 10)
            int_base = 3 + rank + (rank // 10)
            expected_str = str_base // 3
            expected_dex = dex_base // 3
            expected_pow = pow_base // 3
            expected_int = int_base // 3
            expected_avoid = (7 + rank + (rank // 5)) // 3 + 6  # +2D = +6
            expected_resist = (2 + rank + (rank // 10)) // 3 + 6  # +2D = +6
        elif enemy_type == "archer":
            str_base = 3 + rank + (rank // 10)
            dex_base = 4 + rank + (rank // 10)
            pow_base = 2 + rank + (rank // 10)
            int_base = 7 + rank + (rank // 10)
            expected_str = str_base // 3
            expected_dex = dex_base // 3
            expected_pow = pow_base // 3
            expected_int = int_base // 3
            expected_avoid = (4 + rank + (rank // 10)) // 3 + 6  # +2D = +6
            expected_resist = (2 + rank + (rank // 10)) // 3 + 6  # +2D = +6
        elif enemy_type == "shooter":
            str_base = 3 + rank + (rank // 10)
            dex_base = 2 + rank + (rank // 10)
            pow_base = 5 + rank + (rank // 10)
            int_base = 7 + rank + (rank // 10)
            expected_str = str_base // 3
            expected_dex = dex_base // 3
            expected_pow = pow_base // 3
            expected_int = int_base // 3
            expected_avoid = (2 + rank + (rank // 5)) // 3 + 6  # +2D = +6
            expected_resist = (5 + rank + (rank // 10)) // 3 + 6  # +2D = +6
        elif enemy_type == "bomber":
            str_base = 3 + rank + (rank // 10)
            dex_base = 2 + rank + (rank // 10)
            pow_base = 5 + rank + (rank // 10)
            int_base = 7 + rank + (rank // 10)
            expected_str = str_base // 3
            expected_dex = dex_base // 3
            expected_pow = pow_base // 3
            expected_int = int_base // 3
            expected_avoid = (2 + rank + (rank // 5)) // 3 + 6  # +2D = +6
            expected_resist = (5 + rank + (rank // 10)) // 3 + 6  # +2D = +6
        
        # 基本能力値が完全一致するかチェック
        if (str_val == expected_str and dex_val == expected_dex and 
            pow_val == expected_pow and int_val == expected_int):
            return enemy_type
    
    # フェーズ3: 完全一致なし→距離で評価
    best_match = None
    min_distance = float('inf')
    
    for enemy_type in types:
        # 各タイプの基本値を再計算
        if enemy_type == "armorer":
            str_base = 7 + rank + (rank // 10)
            dex_base = 3 + rank + (rank // 10)
            pow_base = 4 + rank + (rank // 10)
            int_base = 2 + rank + (rank // 10)
        elif enemy_type == "fencer":
            str_base = 7 + rank + (rank // 10)
            dex_base = 4 + rank + (rank // 10)
            pow_base = 2 + rank + (rank // 10)
            int_base = 3 + rank + (rank // 10)
        elif enemy_type == "supporter":
            str_base = 4 + rank + (rank // 10)
            dex_base = 2 + rank + (rank // 10)
            pow_base = 7 + rank + (rank // 10)
            int_base = 3 + rank + (rank // 10)
        elif enemy_type == "healer":
            str_base = 3 + rank + (rank // 10)
            dex_base = 2 + rank + (rank // 10)
            pow_base = 7 + rank + (rank // 10)
            int_base = 4 + rank + (rank // 10)
        elif enemy_type == "spear":
            str_base = 4 + rank + (rank // 10)
            dex_base = 7 + rank + (rank // 10)
            pow_base = 2 + rank + (rank // 10)
            int_base = 3 + rank + (rank // 10)
        elif enemy_type == "archer":
            str_base = 3 + rank + (rank // 10)
            dex_base = 4 + rank + (rank // 10)
            pow_base = 2 + rank + (rank // 10)
            int_base = 7 + rank + (rank // 10)
        elif enemy_type == "shooter":
            str_base = 3 + rank + (rank // 10)
            dex_base = 2 + rank + (rank // 10)
            pow_base = 5 + rank + (rank // 10)
            int_base = 7 + rank + (rank // 10)
        elif enemy_type == "bomber":
            str_base = 3 + rank + (rank // 10)
            dex_base = 2 + rank + (rank // 10)
            pow_base = 5 + rank + (rank // 10)
            int_base = 7 + rank + (rank // 10)
        
        expected_str = str_base // 3
        expected_dex = dex_base // 3
        expected_pow = pow_base // 3
        expected_int = int_base // 3
        
        # 距離計算
        distance = math.sqrt(
            (str_val - expected_str) ** 2 +
            (dex_val - expected_dex) ** 2 +
            (pow_val - expected_pow) ** 2 +
            (int_val - expected_int) ** 2
        )
        
        if distance < min_distance:
            min_distance = distance
            best_match = enemy_type
    
    # フェーズ4: 同距離の場合のタイブレーク
    candidates = []
    for enemy_type in types:
        # 期待値再計算（簡略化のため再度計算）
        if enemy_type == "armorer":
            str_base, dex_base, pow_base, int_base = 7 + rank + (rank // 10), 3 + rank + (rank // 10), 4 + rank + (rank // 10), 2 + rank + (rank // 10)
        elif enemy_type == "fencer":
            str_base, dex_base, pow_base, int_base = 7 + rank + (rank // 10), 4 + rank + (rank // 10), 2 + rank + (rank // 10), 3 + rank + (rank // 10)
        elif enemy_type == "supporter":
            str_base, dex_base, pow_base, int_base = 4 + rank + (rank // 10), 2 + rank + (rank // 10), 7 + rank + (rank // 10), 3 + rank + (rank // 10)
        elif enemy_type == "healer":
            str_base, dex_base, pow_base, int_base = 3 + rank + (rank // 10), 2 + rank + (rank // 10), 7 + rank + (rank // 10), 4 + rank + (rank // 10)
        elif enemy_type == "spear":
            str_base, dex_base, pow_base, int_base = 4 + rank + (rank // 10), 7 + rank + (rank // 10), 2 + rank + (rank // 10), 3 + rank + (rank // 10)
        elif enemy_type == "archer":
            str_base, dex_base, pow_base, int_base = 3 + rank + (rank // 10), 4 + rank + (rank // 10), 2 + rank + (rank // 10), 7 + rank + (rank // 10)
        elif enemy_type == "shooter":
            str_base, dex_base, pow_base, int_base = 3 + rank + (rank // 10), 2 + rank + (rank // 10), 5 + rank + (rank // 10), 7 + rank + (rank // 10)
        elif enemy_type == "bomber":
            str_base, dex_base, pow_base, int_base = 3 + rank + (rank // 10), 2 + rank + (rank // 10), 5 + rank + (rank // 10), 7 + rank + (rank // 10)
        else:
            continue
        
        expected_str = str_base // 3
        expected_dex = dex_base // 3
        expected_pow = pow_base // 3
        expected_int = int_base // 3
        
        distance = math.sqrt(
            (str_val - expected_str) ** 2 +
            (dex_val - expected_dex) ** 2 +
            (pow_val - expected_pow) ** 2 +
            (int_val - expected_int) ** 2
        )
        
        if abs(distance - min_distance) < 0.01:
            candidates.append(enemy_type)
    
    # タイブレークルール
    if len(candidates) > 1:
        # shooter vs bomber: INTが厳密に高い方をbomber
        if "shooter" in candidates and "bomber" in candidates:
            if int_val > pow_val:
                return "bomber"
            else:
                return "shooter"
        # supporter vs healer: POWが厳密に高い方をsupporter
        elif "supporter" in candidates and "healer" in candidates:
            if pow_val > int_val:
                return "supporter"
            else:
                return "healer"
        # armorer vs fencer: STRとDEXの差が2以上ならarmorer
        elif "armorer" in candidates and "fencer" in candidates:
            if (str_val - dex_val) >= 2:
                return "armorer"
            else:
                return "fencer"
    
    return best_match

def create_enemy_index(enemies: List[Dict]) -> Dict[str, Dict]:
    """エネミーIDでインデックスを作成（type推定を含む）"""
    index = {}
    estimated_count = 0
    missing_stats_count = 0
    
    for enemy in enemies:
        enemy_id = str(enemy.get("id", ""))
        if enemy_id:
            estimated_type = estimate_enemy_type(enemy)
            
            if estimated_type:
                estimated_count += 1
            else:
                missing_stats_count += 1
            
            index[enemy_id] = {
                "name": enemy.get("name", ""),
                "ruby": enemy.get("ruby", ""),
                "cr": enemy.get("character_rank", 0),
                "type": estimated_type,  # Noneの場合もあり
                "throne": enemy.get("rank", ""),
                "tags": enemy.get("tags", []) if isinstance(enemy.get("tags"), list) else [],
                "url": f"https://lhrpg.com/lhz/i?id={enemy_id}",
                # デバッグ用に元のステータスも保存
                "str": enemy.get("strength", enemy.get("str")),
                "dex": enemy.get("dexterity", enemy.get("dex")),
                "pow": enemy.get("power", enemy.get("pow")),
                "int": enemy.get("intelligence", enemy.get("int")),
                "avoid": enemy.get("avoid"),
                "resist": enemy.get("resist")
            }
    
    print(f"  Type推定成功: {estimated_count}件")
    print(f"  ステータス不足: {missing_stats_count}件")
    
    return index

def optimize_skill_data(skills: List[Dict], enemy_index: Dict[str, Dict]) -> List[Dict]:
    """特技データを最適化（すべてのフィールドを保持）"""
    optimized = []
    
    for skill in skills:
        source_id = str(skill.get("source_id", ""))
        enemy_info = enemy_index.get(source_id, {})
        
        # すべてのフィールドを保持
        optimized_skill = {
            "name": skill.get("name", ""),
            "timing": skill.get("timing", ""),
            "roll": skill.get("role", ""),
            "target": skill.get("target", ""),
            "range": skill.get("range", ""),
            "cost": skill.get("cost", ""),
            "limit": skill.get("limit", ""),
            "tags": skill.get("tags", []),
            "effect": skill.get("effect", ""),
            "command": skill.get("command", ""),
            "effect": skill.get("function", "")
        }
        
        # エネミー情報（from に名前変更してフロントエンドと一致させる）
        if enemy_info:
            optimized_skill["from"] = {
                "name": enemy_info.get("name", ""),
                "ruby": enemy_info.get("ruby", ""),
                "id": source_id,
                "cr": enemy_info.get("cr", ""),
                "type": enemy_info.get("type", ""),
                "throne": enemy_info.get("throne", ""),
                "tags": enemy_info.get("tags", []),
                "url": enemy_info.get("url", "")
            }
        
        optimized.append(optimized_skill)
    
    return optimized

def create_search_index(skills: List[Dict]) -> Dict:
    """検索用のメタデータを作成"""
    # ユニークな値を収集
    timings = set()
    targets = set()
    ranges = set()
    costs = set()
    limits = set()
    tags = set()
    thrones = set()
    
    for skill in skills:
        if skill.get("timing"):
            timings.add(skill["timing"])
        if skill.get("target"):
            targets.add(skill["target"])
        if skill.get("range"):
            ranges.add(skill["range"])
        if skill.get("cost"):
            costs.add(skill["cost"])
        if skill.get("limit"):
            limits.add(skill["limit"])
        if skill.get("tags"):
            skill_tags = skill["tags"]
            if isinstance(skill_tags, str):
                for tag in skill_tags.split(","):
                    tags.add(tag.strip())
            elif isinstance(skill_tags, list):
                for tag in skill_tags:
                    if tag:
                        tags.add(str(tag).strip())
        if skill.get("from", {}).get("throne"):
            thrones.add(skill["from"]["throne"])
    
    return {
        "timings": sorted(list(timings)),
        "targets": sorted(list(targets)),
        "ranges": sorted(list(ranges)),
        "costs": sorted(list(costs)),
        "limits": sorted(list(limits)),
        "tags": sorted(list(tags)),
        "thrones": sorted(list(thrones))
    }

def main():
    print("=" * 60)
    print("エネミー特技データ最適化ツール")
    print("=" * 60)
    print()
    
    # データ読み込み
    print("マスターデータを読み込み中...")
    enemies = load_json(ENEMY_MASTER_FILE)
    skills = load_json(ENEMY_SKILLS_FILE)
    print(f"  エネミー: {len(enemies)}件")
    print(f"  特技: {len(skills)}件")
    print()
    
    # エネミーインデックス作成
    print("エネミーインデックスを作成中...")
    enemy_index = create_enemy_index(enemies)
    print(f"  インデックス: {len(enemy_index)}件")
    print()
    
    # 特技データ最適化
    print("特技データを最適化中...")
    optimized_skills = optimize_skill_data(skills, enemy_index)
    print(f"  最適化済み特技: {len(optimized_skills)}件")
    print()
    
    # 検索用メタデータ作成
    print("検索用メタデータを作成中...")
    search_meta = create_search_index(optimized_skills)
    print(f"  タイミング: {len(search_meta['timings'])}種類")
    print(f"  対象: {len(search_meta['targets'])}種類")
    print(f"  射程: {len(search_meta['ranges'])}種類")
    print(f"  タグ: {len(search_meta['tags'])}種類")
    print()
    
    # 最終データ構造
    output_data = {
        "version": "1.0",
        "generated": "2025-12-12",
        "meta": search_meta,
        "skills": optimized_skills
    }
    
    # 保存
    save_json(output_data, OUTPUT_FILE)
    
    # ファイルサイズ比較
    import os
    original_size = os.path.getsize(ENEMY_SKILLS_FILE)
    optimized_size = os.path.getsize(OUTPUT_FILE)
    reduction = (1 - optimized_size / original_size) * 100
    
    print()
    print("ファイルサイズ:")
    print(f"  元データ: {original_size:,} bytes")
    print(f"  最適化後: {optimized_size:,} bytes")
    print(f"  削減率: {reduction:.1f}%")
    
    # サンプル表示
    print()
    print("サンプルデータ:")
    for i, skill in enumerate(optimized_skills[:3], 1):
        print(f"  {i}. {skill['name']}")
        if skill.get("from"):
            enemy = skill["from"]
            print(f"     出典: {enemy.get('name', '不明')} (CR{enemy.get('cr', '?')})")
            print(f"     URL: {enemy.get('url', '')}")
    
    print()
    print("=" * 60)
    print("完了!")
    print("=" * 60)

if __name__ == "__main__":
    main()
