"""
ログホライゾンTRPG エネミーデータスクレイピングツール
公式サイトからエネミーデータを取得し、特技のマスターデータを生成します。
"""

import json
import time
import requests
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm

# 設定
BASE_URL = "https://lhrpg.com/lhz/ij/{}.json"
START_ID = 0
END_ID = 5000
MAX_WORKERS = 10  # 並列リクエスト数
REQUEST_TIMEOUT = 5  # タイムアウト（秒）
RETRY_COUNT = 3  # リトライ回数
OUTPUT_DIR = Path("../json")

def fetch_json(url: str) -> Optional[Dict]:
    """URLからJSONデータを取得"""
    for attempt in range(RETRY_COUNT):
        try:
            response = requests.get(url, timeout=REQUEST_TIMEOUT)
            if response.status_code == 200:
                # レスポンスが空でないか確認
                if response.text.strip():
                    try:
                        return response.json()
                    except json.JSONDecodeError:
                        # JSONとしてパースできない場合はNoneを返す
                        return None
                return None
            elif response.status_code == 404:
                return None
        except requests.exceptions.RequestException as e:
            if attempt == RETRY_COUNT - 1:
                # エラーログは詳細すぎるため省略
                pass
            time.sleep(0.5)
    return None

def is_enemy_data(data: Dict) -> bool:
    """エネミーデータかどうかを判定"""
    return data.get("index_type") == "エネミー"

def extract_skills_from_enemy(enemy_data: Dict) -> List[Dict]:
    """エネミーデータから特技情報を抽出（すべてのフィールドを保持）"""
    skills = []
    
    # 特技は enemy_data["skills"] に配列で格納されている想定
    if "skills" in enemy_data and isinstance(enemy_data["skills"], list):
        for skill in enemy_data["skills"]:
            if isinstance(skill, dict) and skill.get("name"):
                # 元のskillデータをすべてコピー
                skill_info = dict(skill)
                
                # rollとeffectの空白文字を削除
                if skill_info.get("roll"):
                    skill_info["roll"] = skill_info["roll"].replace(" ", "").replace("　", "")
                if skill_info.get("effect"):
                    skill_info["effect"] = skill_info["effect"].replace(" ", "").replace("　", "")
                
                # source情報を追加
                skill_info["source_enemy"] = enemy_data.get("name", "")
                skill_info["source_id"] = enemy_data.get("id", "")
                
                skills.append(skill_info)
    
    return skills

def fetch_enemy_data(enemy_id: int) -> Optional[Dict]:
    """指定IDのエネミーデータを取得"""
    url = BASE_URL.format(enemy_id)
    data = fetch_json(url)
    
    if data and is_enemy_data(data):
        return data
    return None

def scrape_all_enemies() -> Tuple[List[Dict], List[Dict]]:
    """全エネミーデータをスクレイピング"""
    print(f"エネミーデータを取得中... (ID: {START_ID} - {END_ID})")
    
    all_enemies = []
    all_skills = []
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(fetch_enemy_data, i): i for i in range(START_ID, END_ID + 1)}
        
        with tqdm(total=len(futures), desc="取得中") as pbar:
            for future in as_completed(futures):
                enemy_data = future.result()
                if enemy_data:
                    all_enemies.append(enemy_data)
                    skills = extract_skills_from_enemy(enemy_data)
                    all_skills.extend(skills)
                pbar.update(1)
    
    return all_enemies, all_skills

def remove_duplicate_skills(skills: List[Dict]) -> List[Dict]:
    """重複する特技を削除（特技名でユニーク化）"""
    seen = set()
    unique_skills = []
    
    for skill in skills:
        skill_name = skill["name"]
        if skill_name and skill_name not in seen:
            seen.add(skill_name)
            unique_skills.append(skill)
    
    return unique_skills

def save_json(data: any, filename: str):
    """JSONファイルとして保存"""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    filepath = OUTPUT_DIR / filename
    
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"✓ 保存完了: {filepath}")

def main():
    print("=" * 60)
    print("ログホライゾンTRPG エネミーデータスクレイピングツール")
    print("=" * 60)
    print()
    
    # データ取得
    enemies, skills = scrape_all_enemies()
    
    print()
    print(f"取得結果:")
    print(f"  エネミー数: {len(enemies)}")
    print(f"  特技数（重複含む）: {len(skills)}")
    
    # 重複削除
    unique_skills = remove_duplicate_skills(skills)
    print(f"  ユニーク特技数: {len(unique_skills)}")
    print()
    
    # 保存
    save_json(enemies, "enemy_master.json")
    save_json(unique_skills, "enemy_skills.json")
    
    # 統計情報
    print()
    print("統計情報:")
    print(f"  平均特技数/エネミー: {len(skills) / len(enemies):.2f}" if enemies else "  エネミーデータなし")
    
    # サンプル表示
    if unique_skills:
        print()
        print("サンプル特技:")
        for i, skill in enumerate(unique_skills[:5], 1):
            print(f"  {i}. {skill['name']} ({skill.get('source_enemy', '不明')})")
    
    print()
    print("=" * 60)
    print("完了!")
    print("=" * 60)

if __name__ == "__main__":
    main()
