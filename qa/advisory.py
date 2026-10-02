"""Request an advisory-only review from the local fleet; never execute actions."""
import json
import argparse
import time
import urllib.request
from pathlib import Path

BASE = "http://127.0.0.1:8767/api/missions"
TOKEN = Path("/Users/yacinebenhamou/.copilot/session-state/61293098-351b-443d-bdca-73ee5f81682d/files/qa-avatar-interactive/local-fleet/api-token")
GOAL = """Advisory only. Review semantic honesty and UX for the local Yace19ai
portfolio. Do not execute commands or change production. The repository currently
boots only a coming-soon placeholder with invented ONLINE/SYNCHRONIZED/H200/94%
metrics. Dormant portfolio components claim LIVE VERIFIED ALL NODES GREEN, 125
functional UIs, simulate microphone capture and real-time web search without
capturing audio or searching, embed external games despite locally available games,
and sell source for 1 euro without a verified local payment backend. Kids hub links
all nine cards to an external commercial site rather than its own included games.
Plan: restore navigable home/fleet/games/philosophy/media routes, label archive
descriptions and recordings as historical/unverified instead of live evidence,
disable transactions and remote execution, link local browser games directly,
provide EN/FR navigation and honest locale boundaries for English-only archive
games, make keyboard/mobile controls reachable, remove remote analytics/fonts,
keep standalone command matrix as a clearly labelled offline illustrative demo
with no API execution, and expose measured media quality warnings.
Check this plan for gaps. Return prioritized actionable advisory findings; no
execute calls. Production DNS resolves to Netlify but custom TLS mismatches and
configured Netlify subdomain returns site-not-found. Need account owner to restore
the correct site/domain binding; no production actions permitted in this task."""

def request(url, data=None):
    payload = None if data is None else json.dumps(data).encode()
    req = urllib.request.Request(
        url, data=payload,
        headers={"Authorization": "Bearer " + TOKEN.read_text().strip(),
                 "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.load(response)

out = Path("qa-evidence")
out.mkdir(exist_ok=True)
parser = argparse.ArgumentParser()
parser.add_argument("--mission")
args = parser.parse_args()
try:
    mission = {} if args.mission else request(BASE, {"goal": GOAL})
    mission = mission.get("data", mission)
    mission_id = args.mission or mission.get("id") or mission.get("mission_id") or mission.get("mission", {}).get("id")
    if not mission_id:
        raise RuntimeError("Fleet creation response has no mission ID")
    deadline = time.monotonic() + 300
    history = []
    while time.monotonic() < deadline:
        result = request(BASE + "/" + str(mission_id))
        result = result.get("data", result)
        status = result.get("status") or result.get("mission", {}).get("status")
        history.append({"status": status, "elapsed_seconds": round(300 - (deadline - time.monotonic()), 1)})
        if status in ("completed", "done", "failed", "cancelled", "awaiting_approval", "planned", "ready"):
            break
        time.sleep(5)
    else:
        status = "timeout"
    evidence = {"mission_id": mission_id, "status": status, "advisory_only": True,
                "execute_called": False, "history": history, "result": result}
except (OSError, ValueError, RuntimeError) as error:
    evidence = {"status": "blocked", "advisory_only": True, "execute_called": False,
                "error": str(error)}
(out / "advisory.json").write_text(json.dumps(evidence, indent=2) + "\n")
print(json.dumps({"status": evidence["status"], "mission_id": evidence.get("mission_id")}))
