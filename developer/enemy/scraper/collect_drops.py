"""
エネミーマスターデータからドロップ品を集計し、ランク・出目別に分類
"""

import json
import re
from pathlib import Path
from typing import List, Dict
from collections import defaultdict

INPUT_DIR = Path("../json")
OUTPUT_DIR = Path("../json")
ENEMY_MASTER_FILE = INPUT_DIR / "enemy_master.json"
OUTPUT_FILE = OUTPUT_DIR / "drops_database.json"

def load_json(filepath: Path) -> any:
    """JSONファイルを読み込む"""
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(data: any, filepath: Path):
    """JSONファイルを保存"""
    with open(filepath, "w", encoding="utf-8-sig") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✓ 保存完了: {filepath}")

def parse_dice_value(dice_str: str) -> List[int]:
    """
    出目の文字列を解析してリストに変換
    例: "１" -> [1], "２～６" -> [2,3,4,5,6], "固定" -> [0], "1-3" -> [1,2,3]
    """
    if not dice_str or dice_str == "固定":
        return [0]  # 固定は0として扱う
    
    # 全角数字を半角に変換
    dice_str = dice_str.replace("１", "1").replace("２", "2").replace("３", "3") \
                       .replace("４", "4").replace("５", "5").replace("６", "6") \
                       .replace("７", "7").replace("８", "8").replace("９", "9") \
                       .replace("０", "0").replace("～", "-")
    
    # 範囲指定のパターン (2～6, 2-6など)
    range_match = re.match(r'(\d+)[-～〜](\d+)', dice_str)
    if range_match:
        start = int(range_match.group(1))
        end = int(range_match.group(2))
        return list(range(start, end + 1))
    
    # 単一の数字
    single_match = re.match(r'(\d+)', dice_str)
    if single_match:
        return [int(single_match.group(1))]
    
    return [0]  # パースできない場合は固定扱い

def extract_gold_value(item_str: str) -> int:
    """
    アイテム名から金額を抽出
    例: "しなやかな蔓［換金］（10G）" -> 10
    """
    match = re.search(r'（(\d+)G）', item_str)
    if match:
        return int(match.group(1))
    return 0

def collect_drops(enemies: List[Dict]) -> Dict:
    """
    ドロップ品を集計
    ランク（CR）と出目（dice）で分類
    """
    # ランク別、出目別にドロップ品を集計
    drops_by_rank_dice = defaultdict(lambda: defaultdict(list))
    
    # 統計情報
    total_enemies = 0
    enemies_with_drops = 0
    total_drop_entries = 0
    
    for enemy in enemies:
        total_enemies += 1
        items = enemy.get("items", [])
        
        if not items:
            continue
        
        enemies_with_drops += 1
        rank = enemy.get("character_rank", 1)
        enemy_name = enemy.get("name", "不明")
        enemy_id = enemy.get("id", "")
        enemy_rank_type = enemy.get("rank", "ノーマル")
        
        for item_entry in items:
            total_drop_entries += 1
            dice_str = item_entry.get("dice", "")
            item_name = item_entry.get("item", "")
            
            # 出目を解析
            dice_values = parse_dice_value(dice_str)
            gold_value = extract_gold_value(item_name)
            
            # 各出目に対してドロップ品を登録
            for dice in dice_values:
                drop_info = {
                    "item": item_name,
                    "gold": gold_value,
                    "from_enemy": enemy_name,
                    "enemy_id": enemy_id,
                    "enemy_rank_type": enemy_rank_type,
                    "original_dice": dice_str
                }
                drops_by_rank_dice[rank][dice].append(drop_info)
    
    # 辞書をソート可能な形式に変換
    result = {}
    for rank in sorted(drops_by_rank_dice.keys()):
        result[str(rank)] = {}
        for dice in sorted(drops_by_rank_dice[rank].keys()):
            dice_key = "fixed" if dice == 0 else str(dice)
            result[str(rank)][dice_key] = drops_by_rank_dice[rank][dice]
    
    return {
        "statistics": {
            "total_enemies": total_enemies,
            "enemies_with_drops": enemies_with_drops,
            "total_drop_entries": total_drop_entries,
            "ranks_covered": len(result)
        },
        "drops": result
    }

def main():
    print("=" * 60)
    print("エネミードロップ品集計ツール")
    print("=" * 60)
    print()
    
    # データ読み込み
    print("マスターデータを読み込み中...")
    enemies = load_json(ENEMY_MASTER_FILE)
    print(f"  エネミー: {len(enemies)}件")
    print()
    
    # ドロップ品集計
    print("ドロップ品を集計中...")
    drops_data = collect_drops(enemies)
    
    stats = drops_data["statistics"]
    print(f"  総エネミー数: {stats['total_enemies']}件")
    print(f"  ドロップ品を持つエネミー: {stats['enemies_with_drops']}件")
    print(f"  総ドロップエントリ数: {stats['total_drop_entries']}件")
    print(f"  カバーするランク数: {stats['ranks_covered']}種類")
    print()
    
    # サンプル表示
    print("サンプルデータ (ランク1):")
    if "1" in drops_data["drops"]:
        rank1_drops = drops_data["drops"]["1"]
        for dice_key in sorted(rank1_drops.keys(), key=lambda x: 0 if x == "fixed" else int(x)):
            items = rank1_drops[dice_key]
            dice_label = "固定" if dice_key == "fixed" else f"出目{dice_key}"
            print(f"  {dice_label}: {len(items)}種類")
            if items:
                sample = items[0]
                print(f"    例: {sample['item']} ({sample['gold']}G) - {sample['from_enemy']}")
    print()
    
    # 保存
    save_json(drops_data, OUTPUT_FILE)
    
    # ファイルサイズ
    import os
    output_size = os.path.getsize(OUTPUT_FILE)
    print()
    print("ファイルサイズ:")
    print(f"  出力データ: {output_size:,} bytes")
    
    print()
    print("=" * 60)
    print("完了!")
    print("=" * 60)

if __name__ == "__main__":
    main()
