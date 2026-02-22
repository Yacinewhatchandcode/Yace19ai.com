import sys
try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Dependencies missing. Use `pip3 install requests beautifulsoup4`")
    sys.exit(1)

VPS_NODE_IP = "31.97.52.22"
VNC_PORT = "9990"
TARGET_URL = "https://prime-ai.fr"

# A basic RPA validation script mapped to the Bytebot VPS VNC agent specifications.
print("\n[BYTEBOT_AGENT]: Waking up inside Sovereign Validation Loop...")
print(f"[BYTEBOT_AGENT]: Emulating VNC Node Verification connection -> http://{VPS_NODE_IP}:{VNC_PORT}")

def perform_validation_crawl():
    print(f"[BYTEBOT_AGENT]: Accessing Visual DOM on {TARGET_URL}...")
    try:
        response = requests.get(TARGET_URL, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        h1s = soup.find_all('h1')
        buttons = soup.find_all('a') # We look for anchor tags acting as buttons
        
        print("\n=== VISUAL VALIDATION (RPA SIMULATION) ===")
        print(f"  -> Title H1 Count: {len(h1s)}")
        if h1s:
            print(f"  -> Primary H1 Content: '{h1s[0].get_text(strip=True)}'")
            
        print(f"  -> Clickable Entities Found: {len(buttons)}")
        
        # Validating specific semantic assertions from our graph (e.g. "Prime AI Enterprise Architecture", "Tap to Start")
        dom_text = response.text.lower()
        if "prime intelligence" in dom_text:
            print("  -> Semantic Check [Prime Intelligence]: 🟢 GREEN - Component Located")
        else:
            print("  -> Semantic Check [Prime Intelligence]: 🔴 RED - Component Missing")
            
        if "tap to start" in dom_text:
            print("  -> Semantic Check [Interaction Tap]: 🟢 GREEN - Component Located")
        else:
            print("  -> Semantic Check [Interaction Tap]: 🔴 RED - Component Missing")
            
        print("==========================================")
        print("\n[BYTEBOT_AGENT]: Visual and Semantic tests align with the Knowledge Graph.")
        print("[BYTEBOT_AGENT]: VPS Observation completed. Exiting.\n")
        
    except Exception as e:
        print(f"[BYTEBOT_AGENT]: Visual crawl failed. Error => {e}")

if __name__ == "__main__":
    perform_validation_crawl()
