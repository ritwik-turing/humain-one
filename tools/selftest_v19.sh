#!/bin/bash
# V19 acceptance gate.
#
# 1. Runs the complete V17 behavioral regression suite against V19.
# 2. Exercises the V19-only interaction contract: progressive disclosure,
#    connector breadth, non-warehouse imports, advanced evaluator execution,
#    REST authentication/error handling, and obvious dead CTAs.
#
# Usage:
#   tools/selftest_v19.sh [path/to/Eval_Journey_V19.html]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="${1:-$SCRIPT_DIR/../Eval_Journey_V19.html}"
BASELINE="$SCRIPT_DIR/selftest.sh"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

if [[ ! -f "$TARGET" ]]; then
  echo "V19 SELFTEST: target not found: $TARGET" >&2
  exit 2
fi
if [[ ! -x "$BASELINE" ]]; then
  echo "V19 SELFTEST: baseline suite is not executable: $BASELINE" >&2
  exit 2
fi
if [[ ! -x "$CHROME" ]]; then
  echo "V19 SELFTEST: Chrome not found at $CHROME" >&2
  exit 2
fi

TMP_DIR="$(mktemp -d /private/tmp/prism-v19-extra.XXXXXX)"
TMP_HTML="$TMP_DIR/test.html"
TMP_DOM="$TMP_DIR/dom.html"
TMP_ERR="$TMP_DIR/chrome.err"
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

echo "V19 SELFTEST: running V17 capability regression suite"
set +e
"$BASELINE" "$TARGET"
BASELINE_RC=$?
set -e

python3 - "$TARGET" "$TMP_HTML" <<'PY'
import sys

src, dst = sys.argv[1], sys.argv[2]
page = open(src, encoding="utf-8").read()

harness = r'''
<script>
(function () {
  var results = [];
  var runtimeErrors = [];
  var nativeSetTimeout = window.setTimeout;
  // Product simulations use short timers for progress. Execute them immediately
  // so the DOM dump observes the settled state deterministically.
  window.setTimeout = function (callback) {
    var args = Array.prototype.slice.call(arguments, 2);
    if (typeof callback === 'function') callback.apply(window, args);
    return 0;
  };
  window.addEventListener('error', function (event) {
    runtimeErrors.push(String(event.message || event.error || 'unknown runtime error'));
  });

  function test(name, fn) {
    try {
      var value = fn();
      var ok = !!value;
      results.push({name: name, ok: ok, detail: ok ? '' : String(value || 'assertion returned false')});
    } catch (error) {
      results.push({name: name, ok: false, detail: 'THROW ' + error.message});
    }
  }
  function shown(node) {
    if (!node || node.hidden) return false;
    var parent = node.parentElement;
    while (parent) {
      if (parent.hidden) return false;
      parent = parent.parentElement;
    }
    var style = getComputedStyle(node);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }
  function buttons(scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll('button'));
  }
  function buttonMatching(scope, pattern) {
    return buttons(scope).filter(function (button) {
      return shown(button) && pattern.test(button.textContent.trim());
    })[0] || null;
  }
  function click(node) {
    if (!node) throw new Error('control not found');
    node.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
  }
  function change(node, value) {
    if (!node) throw new Error('field not found');
    node.value = value;
    node.dispatchEvent(new Event('input', {bubbles: true}));
    node.dispatchEvent(new Event('change', {bubbles: true}));
  }
  function fieldFromLabel(scope, pattern) {
    var labels = Array.prototype.slice.call((scope || document).querySelectorAll('label'));
    var label = labels.filter(function (candidate) { return pattern.test(candidate.textContent); })[0];
    return label ? label.querySelector('input,select,textarea') : null;
  }
  function actionResult(scope) {
    var root = scope || document;
    var candidates = [
      root.querySelector('#mbOut'),
      root.querySelector('#mbRes'),
      root.querySelector('[data-test-result]'),
      root.querySelector('[role="alert"]'),
      root.querySelector('[aria-live="polite"]')
    ].filter(Boolean);
    return candidates.map(function (node) { return node.textContent.trim(); }).join(' ');
  }
  function openWarehouseProviders() {
    if (typeof show === 'function') show('s1');
    if (typeof WAREHOUSE !== 'undefined' && typeof renderWarehouse === 'function') {
      WAREHOUSE.open = true;
      WAREHOUSE.step = 'providers';
      renderWarehouse();
    } else {
      click(document.getElementById('connectWarehouse') || buttonMatching(document, /connect to data warehouse/i));
    }
    return document.getElementById('warehouseFlow') || document;
  }
  function providerButton(name) {
    var flow = document.getElementById('warehouseFlow') || document;
    return flow.querySelector('[data-wh-provider="' + name.toLowerCase() + '"]') ||
      buttonMatching(flow, new RegExp('^' + name + '\\b', 'i'));
  }
  function providerIsReachable(name) {
    openWarehouseProviders();
    var button = providerButton(name);
    return !!button && !button.disabled && button.getAttribute('aria-disabled') !== 'true' && shown(button);
  }
  function providerIsConfigurable(name) {
    openWarehouseProviders();
    click(providerButton(name));
    var flow = document.getElementById('warehouseFlow') || document;
    var text = flow.textContent;
    var controls = flow.querySelectorAll('input,select,textarea').length;
    var connectionAction = buttonMatching(flow, /test connection|verify connection|connect/i);
    return new RegExp(name, 'i').test(text) && controls >= 2 && !!connectionAction;
  }
  function completeProvider(name) {
    openWarehouseProviders();
    click(providerButton(name));
    var flow = document.getElementById('warehouseFlow') || document;
    var testConnection = document.getElementById('whTest') || buttonMatching(flow, /test connection|verify connection/i);
    if (!testConnection) return false;
    click(testConnection);
    flow = document.getElementById('warehouseFlow') || document;
    var object = flow.querySelector('[data-wh-asset="unknown"]') || buttonMatching(flow, /unknown_dataset/i);
    if (!object) return false;
    click(object);
    var add = document.getElementById('whUse') || buttonMatching(flow, /add dataset and review mapping|use dataset/i);
    if (!add) return false;
    click(add);
    var sourceText = typeof CFG !== 'undefined' ? String(CFG.source || '') : document.body.textContent;
    return new RegExp(name, 'i').test(sourceText) &&
      (typeof MAP_CONFIRMED === 'undefined' || MAP_CONFIRMED === false) &&
      !!(document.getElementById('confirmMapping') || buttonMatching(document, /confirm field mapping|confirm mapping/i));
  }

  test('progressive-disclosure affordances protect the primary path', function () {
    if (typeof show === 'function') show('s1');
    var affordances = document.querySelectorAll('details > summary, button[aria-expanded], [data-disclosure], [data-drawer]');
    var closedDisclosure = Array.prototype.slice.call(document.querySelectorAll('details')).some(function (node) {
      return !node.open;
    });
    var advancedBuilderStartsHidden = !document.getElementById('mbuild') || document.getElementById('mbuild').hidden;
    return affordances.length >= 3 && closedDisclosure && advancedBuilderStartsHidden;
  });

  test('Show more sources reveals real secondary source actions', function () {
    if (typeof show === 'function') show('s1');
    var summaries = Array.prototype.slice.call(document.querySelectorAll('details > summary'));
    var summary = summaries.filter(function (node) { return /show more sources/i.test(node.textContent); })[0];
    if (!summary) return false;
    var details = summary.parentElement;
    var startedClosed = !details.open;
    click(summary);
    var sourceActions = details.querySelectorAll('[data-source-type], [data-open-provider], [data-source], [data-import-source]');
    return startedClosed && details.open && sourceActions.length >= 4 &&
      /documents/i.test(details.textContent) && /production traffic/i.test(details.textContent);
  });

  test('BigQuery is reachable from the warehouse provider chooser', function () {
    return providerIsReachable('BigQuery');
  });
  test('BigQuery exposes a real configurable connection form', function () {
    return providerIsConfigurable('BigQuery');
  });
  test('BigQuery can complete into a mapped draft dataset', function () {
    return completeProvider('BigQuery');
  });
  test('Databricks is reachable from the warehouse provider chooser', function () {
    return providerIsReachable('Databricks');
  });
  test('Databricks exposes a real configurable connection form', function () {
    return providerIsConfigurable('Databricks');
  });
  test('Databricks can complete into a mapped draft dataset', function () {
    return completeProvider('Databricks');
  });

  test('a non-warehouse source executes add then mapping-review state', function () {
    if (typeof show === 'function') show('s1');
    if (typeof renderSetup === 'function') renderSetup();
    var beforeName = typeof CFG !== 'undefined' ? CFG.dsName : '';
    var beforeCount = typeof totalCases === 'function' ? totalCases() : -1;
    var source = document.querySelector('[data-source-type="csv"], [data-source="csv"], [data-import-source="csv"], [data-dataset-source="csv"]') ||
      buttonMatching(document.getElementById('dataSetup') || document, /^csv upload|upload csv|csv$/i) ||
      document.querySelector('[data-source="json"], [data-import-source="json"]');
    click(source);

    var flow = document.getElementById('warehouseFlow') || document;
    var validate = document.getElementById('srcValidate') || buttonMatching(flow, /validate source|preview file|continue/i);
    if (!validate) return false;
    click(validate);
    var add = document.getElementById('srcAdd') || buttonMatching(flow, /add cases and review mapping|add dataset|import cases/i);
    if (!add) return false;
    click(add);

    var afterName = typeof CFG !== 'undefined' ? CFG.dsName : '';
    var afterCount = typeof totalCases === 'function' ? totalCases() : -1;
    var changedDataset = afterName !== beforeName || afterCount !== beforeCount;
    var mappingPending = typeof MAP_CONFIRMED !== 'undefined'
      ? MAP_CONFIRMED === false
      : /suggested mapping|review mapping|confirm field mapping/i.test(document.body.textContent);
    var mappingAction = document.getElementById('confirmMapping') ||
      buttonMatching(document, /confirm field mapping|confirm mapping/i);
    var runLocked = !document.getElementById('runBtn') || document.getElementById('runBtn').disabled;
    return changedDataset && mappingPending && !!mappingAction && runLocked;
  });

  test('Evaluation agent exposes configuration and an executable test', function () {
    if (typeof show === 'function') show('s1');
    var newMetric = document.getElementById('newMetric') || buttonMatching(document, /create metric|new metric/i);
    click(newMetric);
    var agentType = document.querySelector('[data-mtype="agentic"], [data-metric-type="agentic"], [data-metric-type="evaluation-agent"]') ||
      buttonMatching(document.getElementById('mbuild') || document, /evaluation agent/i);
    click(agentType);
    var builder = document.getElementById('mbuild') || document.querySelector('[data-metric-builder]') || document;
    var controls = builder.querySelectorAll('input,select,textarea').length;
    var configText = builder.textContent;
    var testButton = buttonMatching(builder, /test (agent|configuration|on cases)|run once|try (agent|once)|execute test/i);
    if (!testButton) return false;
    var instruction = fieldFromLabel(builder, /instruction|what the agent should look for|task/i);
    if (instruction) change(instruction, 'Check whether the answer preserves the exact resident next action and return a score with evidence.');
    click(testButton);
    var output = actionResult(builder);
    return controls >= 4 && /evaluator|model/i.test(configText) && /access|credential|subscription|key/i.test(configText) &&
      /pass|score|reason|evidence|completed|result|tool/i.test(output);
  });

  test('REST evaluator exposes authentication and rejects invalid configuration', function () {
    var builder = document.getElementById('mbuild') || document;
    var endpointType = document.querySelector('[data-mtype="endpoint"], [data-metric-type="rest"], [data-metric-type="endpoint"]') ||
      buttonMatching(builder, /rest api/i);
    click(endpointType);
    builder = document.getElementById('mbuild') || document;
    var auth = fieldFromLabel(builder, /authentication|credential|api key|bearer|token|secret/i) ||
      builder.querySelector('[id*="Auth" i], [name*="auth" i], [id*="Token" i], [name*="token" i]');
    var credential = fieldFromLabel(builder, /credential reference|secret reference|api key value|bearer token/i) ||
      builder.querySelector('#mbSecret, [name*="secret" i], [name*="credential" i]');
    var endpoint = fieldFromLabel(builder, /^endpoint|url/i) || builder.querySelector('#mbUrl, [name="url"], [type="url"]');
    var testButton = buttonMatching(builder, /test endpoint|verify endpoint|send test/i);
    if (!auth || !credential || !endpoint || !testButton) return false;
    change(endpoint, 'https://checks.humain.local/v1/score');
    change(credential, '');
    click(testButton);
    var output = actionResult(builder);
    return /error|required|failed|invalid|401|unauthorized|could not/i.test(output) && !/200\s*ok/i.test(output);
  });

  test('REST evaluator succeeds after valid endpoint and authentication', function () {
    var builder = document.getElementById('mbuild') || document;
    var endpoint = fieldFromLabel(builder, /^endpoint|url/i) || builder.querySelector('#mbUrl, [name="url"], [type="url"]');
    var auth = fieldFromLabel(builder, /authentication|credential|api key|bearer|token|secret/i) ||
      builder.querySelector('[id*="Auth" i], [name*="auth" i], [id*="Token" i], [name*="token" i]');
    var credential = fieldFromLabel(builder, /credential reference|secret reference|api key value|bearer token/i) ||
      builder.querySelector('#mbSecret, [name*="secret" i], [name*="credential" i]');
    var testButton = buttonMatching(builder, /test endpoint|verify endpoint|send test/i);
    if (!auth || !credential || !endpoint || !testButton) return false;
    change(endpoint, 'https://checks.humain.local/v1/score');
    change(credential, 'secrets/eval/v19-selftest');
    if (auth.tagName === 'INPUT' || auth.tagName === 'TEXTAREA') change(auth, 'test-secret-reference');
    else if (auth.options.length > 1) change(auth, auth.options[auth.options.length - 1].value);
    click(testButton);
    var output = actionResult(builder);
    return /200\s*ok|success|connected/i.test(output) && /score|result|reason|response/i.test(output);
  });

  test('Improve edits a real agent surface, previews the diff, and deploys a new version', function () {
    if (typeof show === 'function') show('s4');
    if (typeof AGENT_VERSION !== 'undefined') AGENT_VERSION = 'v1.4.0';
    if (typeof AGENT_DEPLOYED !== 'undefined') AGENT_DEPLOYED = false;
    if (typeof AGENT_CHANGE !== 'undefined') AGENT_CHANGE = '';
    if (typeof renderImprove === 'function') renderImprove();
    var editor = document.getElementById('agentChange');
    var preview = document.getElementById('previewAgentChange') || buttonMatching(document, /review exact change|preview change/i);
    var deploy = document.getElementById('deployAgent') || buttonMatching(document, /deploy v1\.5\.0/i);
    if (!editor || !preview || !deploy) return false;
    change(editor, 'Always preserve the exact next action from the retrieved record.');
    click(preview);
    var diff = document.getElementById('agentDiff') || document.querySelector('[data-agent-diff]');
    var diffWorked = !!diff && !diff.hidden && /preserve the exact next action/i.test(diff.textContent);
    click(deploy);
    var status = document.getElementById('deployStatus');
    return diffWorked && typeof AGENT_VERSION !== 'undefined' && AGENT_VERSION === 'v1.5.0' &&
      typeof AGENT_DEPLOYED !== 'undefined' && AGENT_DEPLOYED === true && status && /deployed/i.test(status.textContent);
  });

  test('Presenter guide opens, advances, and routes into the real product', function () {
    var trigger = document.getElementById('presenterBtn') || buttonMatching(document, /demo guide|presenter/i);
    if (!trigger) return false;
    if (typeof GUIDE_INDEX !== 'undefined') GUIDE_INDEX = 0;
    click(trigger);
    var modal = document.getElementById('presenter');
    var opened = !!modal && modal.classList.contains('on');
    var before = (document.getElementById('presenterCount') || {}).textContent || '';
    click(document.getElementById('presenterNext'));
    var after = (document.getElementById('presenterCount') || {}).textContent || '';
    var advanced = before !== after;
    click(document.getElementById('presenterOpen'));
    var routed = !modal.classList.contains('on') && !!document.querySelector('.screen.on');
    return opened && advanced && routed;
  });

  test('Evidence receipt action produces a real JSON download', function () {
    if (typeof show === 'function') show('s7');
    if (typeof renderEvidence === 'function') renderEvidence();
    var clickedName = '';
    var originalCreate = URL.createObjectURL;
    var originalRevoke = URL.revokeObjectURL;
    var originalAnchorClick = HTMLAnchorElement.prototype.click;
    URL.createObjectURL = function () { return 'blob:v19-selftest'; };
    URL.revokeObjectURL = function () {};
    HTMLAnchorElement.prototype.click = function () { clickedName = this.download || ''; };
    try {
      click(document.getElementById('downloadReceipt') || buttonMatching(document, /download run receipt/i));
    } finally {
      URL.createObjectURL = originalCreate;
      URL.revokeObjectURL = originalRevoke;
      HTMLAnchorElement.prototype.click = originalAnchorClick;
    }
    return /receipt\.json$/i.test(clickedName);
  });

  test('Evidence link action writes the selected run to the clipboard', function () {
    if (typeof show === 'function') show('s7');
    var copied = '';
    try {
      Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {
        writeText: function (value) { copied = value; return Promise.resolve(); }
      }});
    } catch (error) {
      document.execCommand = function () { return true; };
    }
    click(document.getElementById('copyEvidenceLink') || buttonMatching(document, /copy evidence link/i));
    return /[?&]screen=s7\b/.test(copied) && /[?&]run=/.test(copied);
  });

  test('visible product CTAs have an action contract', function () {
    if (typeof show === 'function') show('s1');
    if (typeof renderSetup === 'function') renderSetup();
    var actionableData = /^(data-go|data-setup-target|data-wh-|data-source|data-open-provider|data-import|data-dataset|data-metric|data-mtype|data-map|data-case|data-filter|data-dsf|data-dsx|data-board|data-scale|data-calib|data-dmode|data-lib|data-tag|data-toggle|data-rm|data-ren|data-mrg|data-into)/;
    var dead = buttons(document).filter(function (button) {
      if (!shown(button) || button.disabled || button.getAttribute('aria-disabled') === 'true') return false;
      if (!button.matches('.btn, .topbtn, .provider, .asset, [data-cta]')) return false;
      if (button.classList.contains('why') || button.type === 'submit') return false;
      if (button.id) return false;
      return !Array.prototype.slice.call(button.attributes).some(function (attribute) {
        return actionableData.test(attribute.name);
      });
    }).map(function (button) { return button.textContent.trim().replace(/\s+/g, ' ').slice(0, 80); });
    window.__v19DeadCtas = dead;
    return dead.length === 0;
  });

  test('V19 extension flows raise no runtime errors', function () {
    return runtimeErrors.length === 0;
  });

  var pre = document.createElement('pre');
  pre.id = '__v19selftest';
  pre.textContent = JSON.stringify({results: results, deadCtas: window.__v19DeadCtas || [], runtimeErrors: runtimeErrors});
  document.body.appendChild(pre);
  window.setTimeout = nativeSetTimeout;
})();
</script>
'''

if "</body>" not in page:
    raise SystemExit("V19 SELFTEST: target has no </body> tag")
open(dst, "w", encoding="utf-8").write(page.replace("</body>", harness + "\n</body>", 1))
PY

"$CHROME" \
  --headless=new \
  --disable-gpu \
  --virtual-time-budget=12000 \
  --dump-dom \
  "file://$TMP_HTML" > "$TMP_DOM" 2>"$TMP_ERR"

set +e
python3 - "$TMP_DOM" "$TMP_ERR" <<'PY'
import html
import json
import re
import sys

dom = open(sys.argv[1], encoding="utf-8").read()
match = re.search(r'<pre id="__v19selftest">([\s\S]*?)</pre>', dom)
if not match:
    print("V19 EXTENDED SELFTEST: no result block; page threw or timed out", file=sys.stderr)
    errors = open(sys.argv[2], encoding="utf-8", errors="replace").read().strip().splitlines()
    if errors:
        print("Chrome diagnostics:", file=sys.stderr)
        for line in errors[-20:]:
            print(line, file=sys.stderr)
    sys.exit(1)

payload = json.loads(html.unescape(match.group(1)))
results = payload["results"]
failures = [result for result in results if not result["ok"]]
for result in results:
    line = ("PASS " if result["ok"] else "FAIL ") + result["name"]
    if not result["ok"] and result.get("detail"):
        line += "  ->  " + result["detail"]
    print(line)

if payload.get("deadCtas"):
    print("Dead CTA candidates: " + " | ".join(payload["deadCtas"]))
if payload.get("runtimeErrors"):
    print("Runtime errors: " + " | ".join(payload["runtimeErrors"]))

print("Eval_Journey_V19.html extended: {} of {} passed".format(len(results) - len(failures), len(results)))
sys.exit(1 if failures else 0)
PY
EXTRA_RC=$?
set -e

if [[ "$BASELINE_RC" -ne 0 || "$EXTRA_RC" -ne 0 ]]; then
  echo "V19 SELFTEST: FAIL (baseline=$BASELINE_RC extended=$EXTRA_RC)" >&2
  exit 1
fi

echo "V19 SELFTEST: PASS"
