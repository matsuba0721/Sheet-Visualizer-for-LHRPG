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

def create_enemy_index(enemies: List[Dict]) -> Dict[str, Dict]:
    """エネミーIDでインデックスを作成"""
    index = {}
    for enemy in enemies:
        enemy_id = str(enemy.get("id", ""))
        if enemy_id:
            index[enemy_id] = {
                "name": enemy.get("name", ""),
                "cr": enemy.get("character_rank", 0),
                "type": enemy.get("type", ""),
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
