#!/usr/bin/env python3
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
artifact = root / "Eval_Platform_Final_Yasser.html"
text = artifact.read_text()

required = {
    "V17 prototype entry point": "Eval_Journey_V17.html",
    "Prompt-first path": "Prompt metrics by default",
    "phased capability": "Advanced and phased",
    "OpenTelemetry evidence": "OpenTelemetry trace",
    "agent version loop": "edit, deploy, evaluate, compare",
    "no universal metrics defense": "it does not give every agent the same metrics",
    "always-on observations defense": "always-on operational and integrity observations",
    "healthy controls defense": "Some are healthy controls",
    "human-controlled Prism notes": "A draft is not treated as reviewed truth",
}

errors = []
for name, needle in required.items():
    if needle not in text:
        errors.append(f"missing {name}: {needle}")

if "Eval_Journey_V16.html" in text:
    errors.append("legacy V16 prototype link remains")

main_shots = re.findall(r'<rect class="hot" data-shot="([^"]+)"[^>]+simpleArrow|<rect class="hot" data-shot="([^"]+)"', text)
flat_shots = [a or b for a, b in main_shots]
for key in ("mapping", "library", "perf", "scores", "improve", "proof"):
    if key not in flat_shots:
        errors.append(f"main flow box is not clickable: {key}")

for rel in re.findall(r"(?:sources|mapping|library|cases|note|groups|trace|improve):'([^']+)'", text):
    if not (root / rel).exists():
        errors.append(f"missing screenshot asset: {rel}")

if errors:
    print("FINAL ARTIFACT CHECK: FAIL")
    for error in errors:
        print(f"- {error}")
    raise SystemExit(1)

print("FINAL ARTIFACT CHECK: PASS")
print(f"- {len(required)} narrative contracts present")
print("- six primary flow boxes are clickable")
print("- all current screenshot assets resolve")
print("- V17 is the only prototype entry point")
