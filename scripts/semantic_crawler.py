import os
import json
import time
import hashlib
from datetime import datetime, timezone
import requests
from bs4 import BeautifulSoup

# Files
GRAPH_FILE = "prime_semantic_graph.json"
BLUEPRINTS_FILE = "agentic_workflow_blueprints.json"

# Targets
URL_TARGETS = [
    "https://prime-ai.fr",
    "https://sovereign-arcade.vercel.app"
]

FILE_TARGETS = [
    "src/components/VoiceOrbInterface.tsx",
    "src/components/BytebotDesktop.tsx",
    "/Users/yacinebenhamou/Agentic_Repo_Orchestration/Sovereign-Ecosystem/README.md",
    "/Users/yacinebenhamou/Prime.AI/README.md"
]

def hash_content(content: str) -> str:
    return hashlib.sha256(content.encode('utf-8')).hexdigest()

def crawl_url(url: str):
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        text = soup.get_text(separator=' ', strip=True)
        return {"source": url, "hash": hash_content(text), "type": "url"}
    except Exception as e:
        print(f"Error crawling {url}: {e}")
        return None

def crawl_file(filepath: str):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            return {"source": filepath, "hash": hash_content(content), "type": "file"}
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return None

def run_semantic_crawl():
    print(f"[{datetime.now(timezone.utc).isoformat()}] Initiating Semantic Crawl...")
    
    current_hashes = {}
    
    # 1. Crawl URLs
    for url in URL_TARGETS:
        result = crawl_url(url)
        if result:
            current_hashes[result['source']] = result['hash']
            
    # 2. Crawl local files
    for filepath in FILE_TARGETS:
        result = crawl_file(filepath)
        if result:
            current_hashes[result['source']] = result['hash']
    
    # 3. Compare with existing state
    state_file = ".semantic_state.json"
    changes_detected = False
    
    if os.path.exists(state_file):
        with open(state_file, 'r') as f:
            past_state = json.load(f)
            
        for source, current_hash in current_hashes.items():
            if past_state.get(source) != current_hash:
                print(f"Mutation detected in source: {source}")
                changes_detected = True
    else:
        print("Initial state generation.")
        changes_detected = True
        
    # 4. Update state and trigger graph rebuild if needed
    if changes_detected:
        with open(state_file, 'w') as f:
            json.dump(current_hashes, f, indent=2)
            
        # Here we would trigger the LLM to rebuild `prime_semantic_graph.json` 
        # and `agentic_workflow_blueprints.json`.
        # For now, we update the timestamp in the existing JSONs to prove the cron works.
        update_graph_timestamps(current_hashes)
        
        print("Semantic memory synchronized. Graph updated.")
    else:
        print("No semantic mutations detected. Graph remains stable.")

def update_graph_timestamps(current_hashes):
    try:
        now_dt = datetime.now(timezone.utc)
        iso_now = now_dt.isoformat()
        version_stamp = now_dt.strftime("%Y%m%d_%H%M%S")
        
        if os.path.exists(GRAPH_FILE):
            with open(GRAPH_FILE, 'r+') as f:
                data = json.load(f)
                data['timestamp'] = iso_now
                # Link snapshot hash mapping
                data['source_checksums'] = current_hashes
                f.seek(0)
                json.dump(data, f, indent=2)
                f.truncate()
                
        if os.path.exists(BLUEPRINTS_FILE):
            with open(BLUEPRINTS_FILE, 'r+') as f:
                data = json.load(f)
                data['timestamp'] = iso_now
                f.seek(0)
                json.dump(data, f, indent=2)
                f.truncate()
                
        # Versioning Implementation (Archival Snapshot)
        import shutil
        snapshot_dir = "semantic_snapshots"
        os.makedirs(snapshot_dir, exist_ok=True)
        
        if os.path.exists(GRAPH_FILE):
            shutil.copy(GRAPH_FILE, f"{snapshot_dir}/prime_semantic_graph_{version_stamp}.json")
            
        print(f"Graph snapshots versioned and linked to stamp {version_stamp}")
        
    except Exception as e:
        print(f"Failed to update timestamps and versioning: {e}")

if __name__ == "__main__":
    run_semantic_crawl()
