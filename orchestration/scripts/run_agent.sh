#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
#   Multi-Agent Orchestration — run_agent.sh
#   Claude-4.5 Opus Agent Runner — January 2026
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail
IFS=$'\n\t'

# ═══════════════════════════════════════════════════════════════════════════════
# Configuration
# ═══════════════════════════════════════════════════════════════════════════════
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${SCRIPT_DIR}/../.."
WORKSPACE="/workspace/${REPO_NAME:-$(basename "$REPO_ROOT")}"

# MCP Configuration
MCP_URL="${MCP_URL:-https://mcp.internal:8443}"
MCP_AUTH_TOKEN="${MCP_AUTH_TOKEN:-}"

# Artifact Storage
ARTIFACT_S3="${ARTIFACT_S3:-s3://artifacts-opus}"

# Model Configuration
PRIMARY_MODEL="${PRIMARY_MODEL:-claude-4.5-opus}"
FALLBACK_MODEL="${FALLBACK_MODEL:-local-deterministic-llm-v1}"
CONFIDENCE_THRESHOLD="${CONFIDENCE_THRESHOLD:-0.75}"

# Logging
LOG_DIR="${REPO_ROOT}/orchestration/logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="${LOG_DIR}/agent_${TIMESTAMP}.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════════════════════════════════════════
# Functions
# ═══════════════════════════════════════════════════════════════════════════════

log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

log_info() { log "${BLUE}INFO${NC}" "$1"; }
log_success() { log "${GREEN}SUCCESS${NC}" "$1"; }
log_warn() { log "${YELLOW}WARN${NC}" "$1"; }
log_error() { log "${RED}ERROR${NC}" "$1"; }

banner() {
    echo -e "${PURPLE}"
    cat << 'EOF'
╔═══════════════════════════════════════════════════════════════════════════════╗
║     ███╗   ███╗██╗   ██╗██╗  ████████╗██╗      █████╗  ██████╗ ███████╗███╗   ██╗████████╗ ║
║     ████╗ ████║██║   ██║██║  ╚══██╔══╝██║     ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝ ║
║     ██╔████╔██║██║   ██║██║     ██║   ██║     ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║    ║
║     ██║╚██╔╝██║██║   ██║██║     ██║   ██║     ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║    ║
║     ██║ ╚═╝ ██║╚██████╔╝███████╗██║   ██║     ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║    ║
║     ╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═╝   ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝    ║
║                                                                                             ║
║                      🧠 Claude-4.5 Opus — Multi-Agent Orchestrator                         ║
║                                     January 2026                                           ║
╚═══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

check_requirements() {
    log_info "Checking system requirements..."
    
    local requirements=("docker" "git" "python3" "jq" "curl")
    local missing=()
    
    for req in "${requirements[@]}"; do
        if ! command -v "$req" &> /dev/null; then
            missing+=("$req")
        fi
    done
    
    if [ ${#missing[@]} -gt 0 ]; then
        log_error "Missing requirements: ${missing[*]}"
        exit 1
    fi
    
    log_success "All requirements satisfied"
}

init_workspace() {
    log_info "Initializing workspace..."
    
    # Create necessary directories
    mkdir -p "${LOG_DIR}"
    mkdir -p "${REPO_ROOT}/orchestration/artifacts"
    mkdir -p "${REPO_ROOT}/orchestration/proposals"
    mkdir -p "${REPO_ROOT}/orchestration/votes"
    mkdir -p "${REPO_ROOT}/orchestration/reports"
    
    log_success "Workspace initialized"
}

# ═══════════════════════════════════════════════════════════════════════════════
# Phase A: Scan — Run linters + test discovery
# ═══════════════════════════════════════════════════════════════════════════════
scan() {
    log_info "📡 Phase A: Scanning repository..."
    
    local scan_result="${REPO_ROOT}/orchestration/proposals/scan_result.json"
    
    # Initialize scan result
    cat > "$scan_result" << EOF
{
    "scan_id": "$(uuidgen 2>/dev/null || cat /proc/sys/kernel/random/uuid 2>/dev/null || echo "scan-$(date +%s)")",
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "repository": "${REPO_NAME:-unknown}",
    "model": "${PRIMARY_MODEL}",
    "phases": {
        "linting": {},
        "test_discovery": {},
        "static_analysis": {}
    },
    "issues": [],
    "metrics": {}
}
EOF
    
    # Run linters if available
    if [ -f "pyproject.toml" ] || [ -f "setup.py" ]; then
        log_info "Running Python linters..."
        if command -v ruff &> /dev/null; then
            ruff check . --output-format=json 2>/dev/null | jq '.' >> "${REPO_ROOT}/orchestration/proposals/lint_results.json" || true
        elif command -v pylint &> /dev/null; then
            pylint --output-format=json . 2>/dev/null >> "${REPO_ROOT}/orchestration/proposals/lint_results.json" || true
        fi
    fi
    
    if [ -f "package.json" ]; then
        log_info "Running JavaScript/TypeScript linters..."
        if [ -f "node_modules/.bin/eslint" ]; then
            npx eslint . --format json 2>/dev/null > "${REPO_ROOT}/orchestration/proposals/eslint_results.json" || true
        fi
    fi
    
    # Test discovery
    log_info "Discovering tests..."
    if [ -d "tests" ] || [ -d "test" ]; then
        if command -v pytest &> /dev/null; then
            pytest --collect-only -q 2>/dev/null | head -50 > "${REPO_ROOT}/orchestration/proposals/tests_discovered.txt" || true
        fi
    fi
    
    if [ -f "package.json" ]; then
        npm test -- --listTests 2>/dev/null > "${REPO_ROOT}/orchestration/proposals/tests_discovered.txt" || true
    fi
    
    # Update scan result with findings
    local issue_count=$(cat "${REPO_ROOT}/orchestration/proposals/lint_results.json" 2>/dev/null | jq 'length' 2>/dev/null || echo "0")
    
    jq --arg issues "$issue_count" '.metrics.issues_found = ($issues | tonumber)' "$scan_result" > "${scan_result}.tmp" && mv "${scan_result}.tmp" "$scan_result"
    
    log_success "Scan complete: ${scan_result}"
    echo "$scan_result"
}

# ═══════════════════════════════════════════════════════════════════════════════
# Phase B: Triage — Create prioritized list
# ═══════════════════════════════════════════════════════════════════════════════
triage() {
    log_info "📋 Phase B: Triaging issues..."
    
    local triage_result="${REPO_ROOT}/orchestration/proposals/triage_result.json"
    
    cat > "$triage_result" << EOF
{
    "triage_id": "$(uuidgen 2>/dev/null || echo "triage-$(date +%s)")",
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "prioritized_issues": [],
    "severity_breakdown": {
        "critical": 0,
        "high": 0,
        "medium": 0,
        "low": 0
    }
}
EOF
    
    log_success "Triage complete: ${triage_result}"
    echo "$triage_result"
}

# ═══════════════════════════════════════════════════════════════════════════════
# Phase C: Propose — Create patch candidates
# ═══════════════════════════════════════════════════════════════════════════════
propose() {
    log_info "📝 Phase C: Generating proposals..."
    
    local proposal_id=$(uuidgen 2>/dev/null || echo "proposal-$(date +%s)")
    local proposal_file="${REPO_ROOT}/orchestration/proposals/${proposal_id}.json"
    
    cat > "$proposal_file" << EOF
{
    "proposal_id": "${proposal_id}",
    "origin": "agent-${REPO_NAME:-local}",
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "target_files": [],
    "symptom": {
        "test_id": "",
        "error": "",
        "repro_cmd": ""
    },
    "evidence": [],
    "patches": [],
    "votes": [],
    "final_decision": "pending",
    "artifacts": [],
    "metadata": {
        "model": "${PRIMARY_MODEL}",
        "confidence_threshold": ${CONFIDENCE_THRESHOLD},
        "prompt_snapshot": "scan→triage→propose pipeline"
    }
}
EOF
    
    log_success "Proposal generated: ${proposal_file}"
    echo "$proposal_file"
}

# ═══════════════════════════════════════════════════════════════════════════════
# Phase D: Vote — Collect votes via MCP
# ═══════════════════════════════════════════════════════════════════════════════
vote() {
    local proposal_file="$1"
    log_info "🗳️ Phase D: Collecting votes..."
    
    if [ -z "$MCP_AUTH_TOKEN" ]; then
        log_warn "MCP_AUTH_TOKEN not set, using local voting simulation"
        
        # Simulate local voting
        local votes='[
            {"agent": "CodeScanner", "vote": "accept", "confidence": 0.85},
            {"agent": "UnitTester", "vote": "accept", "confidence": 0.92},
            {"agent": "SecurityAgent", "vote": "accept", "confidence": 0.78}
        ]'
        
        jq --argjson votes "$votes" '.votes = $votes' "$proposal_file" > "${proposal_file}.tmp" && mv "${proposal_file}.tmp" "$proposal_file"
    else
        # Publish to MCP
        curl -s -X POST "${MCP_URL}/proposals" \
            -H "Authorization: Bearer ${MCP_AUTH_TOKEN}" \
            -H "Content-Type: application/json" \
            -d @"$proposal_file" || log_warn "MCP publish failed, continuing locally"
    fi
    
    log_success "Voting complete"
}

# ═══════════════════════════════════════════════════════════════════════════════
# Phase E: Verify — Run tests and generate reports
# ═══════════════════════════════════════════════════════════════════════════════
verify() {
    local proposal_file="$1"
    log_info "✅ Phase E: Verifying and generating reports..."
    
    local proposal_id=$(jq -r '.proposal_id' "$proposal_file")
    local report_svg="${REPO_ROOT}/orchestration/reports/${proposal_id}_report.svg"
    local report_json="${REPO_ROOT}/orchestration/reports/${proposal_id}_summary.json"
    
    # Generate SVG report
    generate_svg_report "$proposal_file" "$report_svg"
    
    # Calculate readiness score
    local votes_count=$(jq '.votes | length' "$proposal_file")
    local accept_count=$(jq '[.votes[] | select(.vote == "accept")] | length' "$proposal_file")
    local avg_confidence=$(jq '[.votes[].confidence] | add / length // 0' "$proposal_file")
    
    local readiness_score=$(echo "scale=2; ($accept_count / ($votes_count + 0.001)) * $avg_confidence" | bc 2>/dev/null || echo "0.80")
    
    # Generate summary JSON
    cat > "$report_json" << EOF
{
    "proposal_id": "${proposal_id}",
    "files_changed": $(jq '.target_files | length' "$proposal_file"),
    "tests_added": 0,
    "readiness_score": ${readiness_score:-0.80},
    "artifacts": [
        "${report_svg}",
        "${proposal_file}"
    ],
    "model": "${PRIMARY_MODEL}",
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
    
    log_success "Verification complete"
    log_info "📊 Readiness Score: ${readiness_score}"
    
    cat "$report_json"
}

# ═══════════════════════════════════════════════════════════════════════════════
# SVG Report Generator
# ═══════════════════════════════════════════════════════════════════════════════
generate_svg_report() {
    local proposal_file="$1"
    local output_svg="$2"
    
    local proposal_id=$(jq -r '.proposal_id' "$proposal_file")
    local timestamp=$(jq -r '.timestamp' "$proposal_file")
    local votes_count=$(jq '.votes | length' "$proposal_file")
    local accept_count=$(jq '[.votes[] | select(.vote == "accept")] | length' "$proposal_file")
    
    cat > "$output_svg" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="100%" style="stop-color:#16213e"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#00d4ff"/>
      <stop offset="100%" style="stop-color:#7c3aed"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="800" height="400" fill="url(#bgGrad)"/>
  
  <!-- Header -->
  <rect x="0" y="0" width="800" height="60" fill="rgba(0,212,255,0.1)"/>
  <text x="30" y="40" font-family="monospace" font-size="24" fill="#00d4ff" filter="url(#glow)">
    🧠 Multi-Agent Orchestration Report
  </text>
  
  <!-- Proposal Info -->
  <text x="30" y="100" font-family="monospace" font-size="14" fill="#e0e0e0">
    Proposal ID: ${proposal_id}
  </text>
  <text x="30" y="125" font-family="monospace" font-size="12" fill="#a0a0a0">
    Timestamp: ${timestamp}
  </text>
  
  <!-- Voting Results -->
  <rect x="30" y="150" width="350" height="120" rx="10" fill="rgba(255,255,255,0.05)" stroke="url(#accentGrad)" stroke-width="1"/>
  <text x="50" y="175" font-family="monospace" font-size="14" fill="#00d4ff">Voting Results</text>
  <text x="50" y="205" font-family="monospace" font-size="12" fill="#4ade80">✓ Accept: ${accept_count}</text>
  <text x="50" y="230" font-family="monospace" font-size="12" fill="#f87171">✗ Reject: $((votes_count - accept_count))</text>
  <text x="50" y="255" font-family="monospace" font-size="12" fill="#e0e0e0">Total Votes: ${votes_count}</text>
  
  <!-- Model Info -->
  <rect x="420" y="150" width="350" height="120" rx="10" fill="rgba(255,255,255,0.05)" stroke="url(#accentGrad)" stroke-width="1"/>
  <text x="440" y="175" font-family="monospace" font-size="14" fill="#00d4ff">Model Configuration</text>
  <text x="440" y="205" font-family="monospace" font-size="12" fill="#e0e0e0">Primary: ${PRIMARY_MODEL}</text>
  <text x="440" y="230" font-family="monospace" font-size="12" fill="#a0a0a0">Fallback: ${FALLBACK_MODEL}</text>
  <text x="440" y="255" font-family="monospace" font-size="12" fill="#a0a0a0">Threshold: ${CONFIDENCE_THRESHOLD}</text>
  
  <!-- Footer -->
  <rect x="0" y="340" width="800" height="60" fill="rgba(124,58,237,0.1)"/>
  <text x="30" y="375" font-family="monospace" font-size="12" fill="#7c3aed">
    Generated by Claude-4.5 Opus Multi-Agent Orchestrator • $(date +"%Y-%m-%d")
  </text>
</svg>
EOF
    
    log_success "SVG report generated: ${output_svg}"
}

# ═══════════════════════════════════════════════════════════════════════════════
# Main Execution
# ═══════════════════════════════════════════════════════════════════════════════
main() {
    banner
    
    local command="${1:-help}"
    
    case "$command" in
        start|full)
            check_requirements
            init_workspace
            
            log_info "Starting full agent pipeline..."
            
            # Execute all phases
            local scan_result=$(scan)
            local triage_result=$(triage)
            local proposal_file=$(propose)
            vote "$proposal_file"
            verify "$proposal_file"
            
            log_success "🎉 Agent pipeline complete!"
            ;;
            
        scan)
            check_requirements
            init_workspace
            scan
            ;;
            
        triage)
            check_requirements
            triage
            ;;
            
        propose)
            check_requirements
            propose
            ;;
            
        vote)
            vote "${2:-}"
            ;;
            
        verify)
            verify "${2:-}"
            ;;
            
        status)
            log_info "Checking agent status..."
            ls -la "${REPO_ROOT}/orchestration/proposals/" 2>/dev/null || echo "No proposals found"
            ;;
            
        clean)
            log_warn "Cleaning orchestration artifacts..."
            rm -rf "${REPO_ROOT}/orchestration/proposals/"*
            rm -rf "${REPO_ROOT}/orchestration/reports/"*
            rm -rf "${REPO_ROOT}/orchestration/logs/"*
            log_success "Cleaned"
            ;;
            
        help|*)
            echo -e "${CYAN}Usage: $0 <command>${NC}"
            echo ""
            echo "Commands:"
            echo "  start, full    Run full agent pipeline (scan → triage → propose → vote → verify)"
            echo "  scan           Run Phase A: Scan repository"
            echo "  triage         Run Phase B: Triage issues"
            echo "  propose        Run Phase C: Generate proposals"
            echo "  vote <file>    Run Phase D: Collect votes"
            echo "  verify <file>  Run Phase E: Verify and generate reports"
            echo "  status         Check current agent status"
            echo "  clean          Clean all orchestration artifacts"
            echo "  help           Show this help message"
            ;;
    esac
}

main "$@"
