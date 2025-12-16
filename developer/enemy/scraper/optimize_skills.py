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
    with open(filepath, "w", encoding="utf-8-sig") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✓ 保存完了: {filepath}")

def estimate_enemy_type(enemy: Dict) -> str:
    """
    エネミーのステータスからtypeを推定
    
    判定基準:
    - armorer/fencer/grappler: 物理防御が高い、回避系、2D
    - supporter: 魔法攻撃、抵抗が高い、2D
    - healer: 回復系、抵抗が高い、2D
    - spear: 白兵攻撃、高火力、3D相当(avoid_dice判定)
    - archer: 射撃攻撃、回避系、3D相当
    - shooter: 魔法攻撃、抵抗系、3D相当
    - bomber: 魔法攻撃、範囲、抵抗系、3D相当
    """
    str_val = enemy.get("strength", 0) or 0
    dex_val = enemy.get("dexterity", 0) or 0
    pow_val = enemy.get("power", 0) or 0
    int_val = enemy.get("intelligence", 0) or 0
    avoid = enemy.get("avoid", 0) or 0
    avoid_dice = enemy.get("avoid_dice", 0) or 0
    resist = enemy.get("resist", 0) or 0
    resist_dice = enemy.get("resist_dice", 0) or 0
    physical_def = enemy.get("physical_defense", 0) or 0
    magic_def = enemy.get("magic_defense", 0) or 0
    
    # 最大能力値
    max_stat = max(str_val, dex_val, pow_val, int_val)
    
    # 回避と抵抗の比較（ダイス含む平均値）
    avoid_total = avoid + (avoid_dice * 3.5)
    resist_total = resist + (resist_dice * 3.5)
    
    # 物理と魔法の防御比較
    is_physical_oriented = physical_def >= magic_def
    is_magical_oriented = magic_def > physical_def
    
    # 回避型か抵抗型か
    is_avoid_type = avoid_total >= resist_total
    is_resist_type = resist_total > avoid_total
    
    # 3D相当の判定（avoid_dice >= 2 または resist_dice >= 2）
    is_3d_type = avoid_dice >= 2 or resist_dice >= 2
    
    # 高火力型の判定（能力値が高い）
    is_high_power = max_stat >= 5
    
    # タイプ推定ロジック
    if is_3d_type:
        # 3D系（spear, archer, shooter, bomber）
        if is_avoid_type:
            if is_physical_oriented:
                # 物理防御寄り → spear or archer
                if str_val >= dex_val:
                    return "spear"  # 筋力が高い → 槍使い
                else:
                    return "archer"  # 器用が高い → 弓使い
            else:
                return "archer"  # 魔法防御寄りでも回避型なら弓
        else:
            # 抵抗型
            if is_high_power:
                return "bomber"  # 高能力値 → 範囲攻撃型
            else:
                return "shooter"  # 通常 → 単体魔法型
    else:
        # 2D系（armorer, fencer, grappler, supporter, healer）
        if is_resist_type:
            # 抵抗型 → supporter or healer
            if int_val >= pow_val:
                return "supporter"  # 知力が高い → サポート型
            else:
                return "healer"  # 魔力が高い → ヒーラー型
        else:
            # 回避型 → armorer, fencer, grappler
            if physical_def >= 8:
                return "armorer"  # 物理防御が非常に高い → 重装甲
            elif dex_val >= max_stat:
                return "fencer"  # 器用が最高 → フェンサー
            else:
                return "grappler"  # その他 → グラップラー
    
    # デフォルト
    return "fencer"

def create_enemy_index(enemies: List[Dict]) -> Dict[str, Dict]:
    """エネミーIDでインデックスを作成"""
    index = {}
    for enemy in enemies:
        enemy_id = str(enemy.get("id", ""))
        if enemy_id:
            estimated_type = estimate_enemy_type(enemy)
            index[enemy_id] = {
                "name": enemy.get("name", ""),
                "cr": enemy.get("character_rank", 0),
                "type": estimated_type,
                "throne": enemy.get("rank", ""),
                "tags": enemy.get("tags", []) if isinstance(enemy.get("tags"), list) else [],
                "url": f"https://lhrpg.com/lhz/i?id={enemy_id}"
            }
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
