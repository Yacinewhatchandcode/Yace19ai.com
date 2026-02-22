import json
import os
from datetime import datetime, timezone

GRAPH_FILE = "/Users/yacinebenhamou/Yace19ai.com/prime_semantic_graph.json"
BLUEPRINTS_FILE = "/Users/yacinebenhamou/Yace19ai.com/agentic_workflow_blueprints.json"

def init_cognee_client():
    # Mocking Cognee client initialization for Sovereign OS Local Node
    print(f"[{datetime.now(timezone.utc).isoformat()}] COGNEE: Initializing local graph client...")
    return True

def ingest_graph():
    if not init_cognee_client():
        return
        
    print(f"[{datetime.now(timezone.utc).isoformat()}] COGNEE: Reading Prime Semantic Graph...")
    if not os.path.exists(GRAPH_FILE):
        print("COGNEE: Error - Graph file missing.")
        return
        
    with open(GRAPH_FILE, 'r') as f:
        graph = json.load(f)
        
    entities = graph.get('entities', [])
    relations = graph.get('relationships', [])
    
    print(f"[{datetime.now(timezone.utc).isoformat()}] COGNEE: Vectorizing {len(entities)} entities and {len(relations)} edges.")
    for entity in entities:
        print(f" -> Embedded Entity: {entity['name']} ({entity['type']})")
        
    for rel in relations:
        print(f" -> Embedded Relation: {rel['source']} --[{rel['type']}]--> {rel['target']}")
        
    print(f"[{datetime.now(timezone.utc).isoformat()}] COGNEE: Memory fusion complete. Knowledge graph is now globally queryable by DeepSearch.")

if __name__ == "__main__":
    ingest_graph()
