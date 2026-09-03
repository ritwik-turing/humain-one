# Eval prototype: state-of-the-art audit

Date: 2 Sep 2026

Current prototype: `Eval_Journey_V16.html`

## Verdict

V16 is ready for the product conversation. It covers the full Prism flow shown by Uday and retains V15's input lifecycle, metric provenance, immutable receipts, and causal improvement loop. It also makes the new failure-note contract explicit: Prism drafts from the actual run evidence, a developer accepts or edits before grouping, and evidence-insufficient cases rise first for human review rather than receiving fabricated certainty. Nothing is learned from earlier agent uploads, selected by a hidden LLM, or attached automatically.

This benchmark does not turn unconfirmed competitor behavior into a Prism claim. Prism-confirmed behavior remains in `PRISM_DEMO_COVERAGE.md`. The additions below are explicitly Humain ONE product safeguards around the Prism execution layer.

## Release bar

| Product requirement | V16 behavior | Why it matters |
|---|---|---|
| Data connection has explicit states | Snowflake moves through provider, credential contract, connection validation, object browser, preview, import, suggested mapping, and confirmation. The unknown dataset does not exist in the UI before the connection succeeds. | The demo explains where data came from and prevents a warehouse object from appearing magically. |
| No universal metric scorecard | A new evaluation starts with zero attached. The developer creates or reuses a Prompt, Deterministic, REST API, or Agentic definition for the agent. | A metric that is meaningful for one agent may be meaningless for another. |
| Governed metric library | Definitions show provenance as Yours, Team metric, or HUMAIN template, with owner, version, and usage history. Templates are reviewed starting points and still require compatibility review and explicit attachment. | Reuse and governance remain visible without implying universal applicability or automatic selection. |
| Coverage is explicit | Every definition declares what it needs; the UI shows how many mapped datapoints it can and cannot read. | A headline score without its denominator is misleading. |
| Evaluators are inspectable | A score drilldown shows definition ID and version, mechanism, owner, frozen execution detail, and run snapshot. | A reviewer can identify the thing that produced the score. |
| Runs are reproducible | The run snapshot pins agent, dataset, definitions, run count, parallel setting, runtime, and creation time. Draft edits are labelled not evaluated, and submission is unavailable until the draft runs. | A later edit cannot silently rewrite what an old score means or borrow an older receipt. |
| Comparisons are valid | Case IDs are matched. Only identical metric definition versions are eligible for score deltas. Dataset, metric-set, and version differences stay visible outside the delta. | Evaluator drift cannot be mistaken for an agent regression. |
| Human judgment stays central | Prism drafts a failure note from run evidence; developers accept or edit it before it can be grouped, and calibrate judge metrics against their verdicts. Evidence-insufficient cases rise for human review instead of receiving fabricated certainty. | AI output remains a reviewable proposal, not unquestioned truth. |
| Verification is honest | The pack includes the receipt, coverage, checks not run, open issues, and human-review count. No platform score blocks submission. | The verifier sees omissions and limitations, not a cleaned-up headline. |

## V16 overall release review

| Review dimension | Result | Evidence |
|---|---|---|
| Prism fidelity | Pass | Every visible walkthrough capability is accounted for in `PRISM_DEMO_COVERAGE.md`; Humain ONE additions are labelled as such. |
| Input lifecycle | Pass | The Snowflake walkthrough includes pre-connection absence, failed-validation recovery with no leaked objects, post-connection discovery, preview, import, mapping review, compatibility recalculation, and an explicit confirmation gate. |
| End-to-end causality | Pass | Failure grouping now leads to regression-metric creation before the agent-change rerun action appears. |
| Failure-note integrity | Pass | Nine Prism drafts are visibly separated from six reviewed notes; three remain pending, and one evidence-insufficient case is placed first as high priority. Only accepted or edited notes enter group counts. |
| Metric semantics | Pass | Personal-library membership, current-dataset compatibility, and evaluation attachment are distinct. Prompt, Deterministic, REST API, and Agentic definitions remain explicit. |
| State integrity | Pass | Saving, deduplication, attach/detach, calibration, evidence, and deletion use the same regression-metric identity. Dataset, mapping, metrics, run count, and parallel changes dirty only the draft; the last job receipt stays frozen. |
| Reproducibility and comparison | Pass | Run receipts remain immutable, and deltas require shared case IDs plus identical metric versions. |
| Interaction and markup | Pass | Incompatible attached metrics remain removable; generated metric controls no longer contain nested buttons. |
| Regression suite | Pass | V16 passes 87/87 headless interaction and content checks. Frozen V15 remains 77/77, V14 remains 63/63, V13 remains 53/53, and V12 remains 44/44. |

## External framework defenses

Official product documentation was rechecked on 2 Sep 2026. These are
corroborating market patterns, not claims of exact feature parity and not claims
that Humain ONE additions already exist in Prism.

| Design defense | Current primary-source evidence | Why V16 holds up |
|---|---|---|
| Success criteria are application-specific | LangSmith says teams should first identify what matters for their application and critical components. DeepEval recommends a mix that includes custom, use-case-specific metrics rather than relying entirely on generic predefined metrics. | Starting a new evaluation with zero attached metrics is a defensible default. The developer decides what good means for this agent. |
| Evaluators need multiple mechanisms | Braintrust supports prebuilt, LLM-as-judge, and custom-code scorers. Phoenix supports deterministic and LLM evaluators. Promptfoo supports deterministic, model-graded, code, and webhook assertions. | Prism's Prompt, Deterministic, REST API, and Agentic definitions match a well-established multi-mechanism pattern without implying universal applicability. |
| Reuse and attachment are different states | LangSmith describes evaluators as reusable resources that are attached to projects or datasets. Phoenix lets users configure evaluators and attach them to datasets. | Personal, team, and governed-template definitions can preserve prior work while each evaluation still starts with zero attached. No hidden system has to infer intent. |
| Comparable runs need stable records | Braintrust describes experiments as immutable, comparable records and aligns test cases when presenting deltas. | The Humain ONE run receipt plus same-case and same-metric-version gating prevents dataset or evaluator drift from being misread as agent improvement. |
| Agent and evaluator traces need inspection | Phoenix traces evaluator inputs, prompts, model behavior, scores, and timing. OpenAI trace grading applies structured scores or labels to an agent's end-to-end trace to diagnose behavior. | A judge score remains inspectable evidence rather than an unquestioned truth. The result can be traced to both agent behavior and evaluator execution. |
| Human findings should become regression coverage | LangSmith connects human annotation, production findings, offline datasets, and regression testing. Braintrust feeds interesting production traces back into datasets. | Step 5 closes the accepted improvement loop: reviewed failure -> calibrated metric -> external agent change -> comparable rerun. |
| Custom scorer objects should carry evidence | W&B Weave supports function- and class-based custom scorers that can return multiple metrics and non-numeric explanations. | Versioned metric definitions and evidence-level explanations are consistent with modern evaluator-as-code patterns. |

Primary sources:

- Braintrust: https://www.braintrust.dev/docs/evaluate, https://www.braintrust.dev/docs/evaluate/write-scorers, and https://www.braintrust.dev/docs/evaluate/compare-experiments
- Arize Phoenix: https://arize.com/docs/phoenix/evaluation/llm-evals
- LangSmith: https://docs.langchain.com/langsmith/evaluation-concepts
- W&B Weave: https://docs.wandb.ai/weave/guides/evaluation/scorers
- DeepEval: https://deepeval.com/docs/metrics-introduction
- Promptfoo: https://www.promptfoo.dev/docs/configuration/expected-outputs/
- OpenAI trace grading: https://developers.openai.com/api/docs/guides/trace-grading

The strongest defensible claim is convergence, not uniqueness: leading systems
use explicit data, configurable evaluators, traces, human review, stable
experiments, and regression comparison. Humain ONE's clearest product additions
are the visible coverage denominator, strict metric-version comparison rule, and
verification receipt.

The presenter flowchart now carries the full narrative directly. It defines the
four core objects, then shows the six product decisions with a current-framework
pattern and spoken defense in every box. Its end-to-end checklist includes the
important inputs, state transitions, controls, and outputs for every step; the
bottom strips state the trust contract and separate production delivery surfaces
from actual product-flow gaps. The flowchart alone is sufficient study material.
The detailed source table remains citation backup rather than required study.

## Deliberate non-goals for this prototype

- Statistical confidence intervals are not fabricated from the mock data. A production comparison service should calculate paired uncertainty when the sample and metric support it.
- CI/CD controls, online monitoring administration, reviewer assignment, and evaluator permissions are delivery surfaces, not additional steps in this developer story.
- The prototype does not invent Prism calibration fields or internal retry and batching controls that were not shown in the source walkthrough.
- The immutable identifiers and hashes are illustrative prototype values. Production must use identifiers and digests returned by the real execution and registry services.

## Presenter explanation

Use this sentence:

> The developer decides what good means for this agent, implements that definition as a prompt, function, endpoint, or evaluator agent, and attaches it. When the job starts we freeze the exact agent, data, metrics, and settings, so every result can be explained, compared fairly, and submitted with an honest evidence trail.

Then study and show the complete flowchart in `Eval_Platform_How_It_Works.html`:

1. Map the data.
2. Create and attach agent-specific metrics.
3. Freeze the exact configuration and run every datapoint.
4. Read scores with their coverage and provenance.
5. Select a reviewed failure, calibrate and attach a regression metric, then change the agent outside the screen.
6. Compare like for like, then submit the full evidence pack.
