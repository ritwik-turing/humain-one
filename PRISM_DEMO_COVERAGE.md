# Prism demo, item by item, against the prototype

Source: Uday Kumar Pabbathi's walkthrough on 1 Sep 2026, the recording reviewed screen by screen, plus the transcript and three screenshots Ritwik supplied. Target: Eval_Journey_V17.html. This ledger is refreshed per version. If an item is not built inside Evaluate, the product boundary and destination are stated here, so scope is a decision and not a discovery.

V17 preserves every Prism capability while applying the 3 Sep product review. Prompt is the recommended default metric path; Code is the user-facing name for Prism's Deterministic mechanism; REST API and Evaluation agent are advanced, phased paths. Results integrate per-datapoint OpenTelemetry traces, and the primary improvement loop is now inspect, edit the agent, deploy a new version, rerun, and compare. Failure-note grouping and regression metrics remain as optional advanced analysis.

Status key: built, covered at journey boundary, excluded by decision. V17 has no unaccounted walkthrough item; each is implemented, represented at its real journey boundary, or deliberately excluded.

## Agents page

| Prism showed | In V17 | Status |
|---|---|---|
| Agents typed Prompt, Agentic, Deterministic, REST API, with counts | The evaluation card shows the selected agent as a typed REST API object with its endpoint; the metric library exposes all four Prism execution kinds | covered at journey boundary: agent selection and management live in Submit agent, step 1 |
| Add Agent, Import, Bulk upload, Collections, Specs, Export | The rail links back to Submit agent | covered at journey boundary: these manage agents before Evaluate and are not duplicated in step 6 |

## Create Evaluation

| Prism showed | In V17 | Status |
|---|---|---|
| Name (required) | Step 3, Name field; the results screen carries it as the evaluation title | built |
| Agent (REST API or Prompt) | Step 3, typed agent line | built |
| Dataset | Step 1 dataset card and step 3 summary | built |
| Description, not read by any model | Step 3, Description field, labelled as saved with the run and not read | built |
| Number of Runs, 1 to 5 | Step 3 calls these repetitions per datapoint and explains that inconsistent answers reveal nondeterminism; the estimate multiplies | built with clarified semantics |
| Parallel Datapoints toggle | Step 3, checkbox; estimate and job duration respond | built |
| Global Metrics tabbed Prompt, Agentic, Deterministic, REST API with counts | Step 2 presents these as Prompt, Evaluation agent, Code, and REST API. Prompt is recommended; Code is available for strict rules; REST and Evaluation agent are labelled advanced and phased. Saved, compatible, and attached remain separate states | built with progressive disclosure |
| Metric search | Step 2 search box | built |
| "N metric(s) selected" | "N of N attached" badge and the step 3 metrics line. "Show new evaluation state" proves a new evaluation starts at 0, and the results board shows no fabricated score | built |
| Metric calibration tab | The Prism tab sequence is functional under step 3; Metric calibration opens the Humain ONE human-verdict workflow, where each judge metric shows version and agreement or "not yet checked against a human, 0 of 20" | built without inventing the hidden Prism tab fields that were not shown |
| Import tab | The functional tab takes the developer to CSV, documents, JSON, Drive, warehouse, bucket and production-traffic sources in step 1. The Snowflake path is interactive from provider selection through import and mapping confirmation | built at the shared dataset boundary: one import path, not a duplicate form |

## Evaluations list

| Prism showed | In V17 | Status |
|---|---|---|
| Evaluations grouped as lineages with versions (v2, v3) | Results screen, lineage line: v3, 2 earlier versions kept | built |
| Jobs under an evaluation with status, JOB id, DATAPOINTS x/y, DURATION, SCORE, LATEST | Results screen, jobs table | built |
| A failed job at 0/3, 0s, no score | A failed job at 0/380, 0s, no score, kept in the list and left out of the trend | built |
| Edit, Duplicate, Run actions | Edit, Duplicate and Run again on the evaluation card; Edit returns to the saved pairing | built |
| Compare across evaluations | Screen 6 switches between jobs and evaluations. The source selector changes results; shared cases and shared metrics define the delta; cases and metrics present on only one side remain explicit and outside the comparison | built |
| Filters All, Prompt, Agent; Tags and Collections | Compare selectors expose the evaluations relevant to this agent | excluded by decision: global list organization belongs to Prism administration, while this journey is already scoped to one submitted agent |

## Job results

| Prism showed | In V17 | Status |
|---|---|---|
| Performance strip: datapoints, avg, P50, P95, P99, min-to-max range, total, completion | Results screen performance strip with all fields visible | built |
| Tokens in and out | Tiles and strip; cost derives from tokens, no invented price | built |
| AI generated Evaluation Summary with model picker, opt in | Results screen card, Generate summary, written from the job's own numbers | built |
| Detailed Results tab: per datapoint scores | Metric scores toggle on the results table, one column per metric, sharing a generator with the grid so they reconcile | built |
| Evaluation Metrics with aggregation dropdown (Sum) | Score board dropdown Average or Sum, driving the board, the evidence pack and the columns | built |
| Scale toggle percent, 0 to 10, 0 to 1 | Score board toggle | built |
| Metrics Overview radar | The score board exposes every metric, aggregation, scale, coverage and drill-down without compressing values into radar axes | excluded by decision: the radar adds no decision the board does not already support |
| Datapoint x Metric Scores heatmap with under 40, 40 to 60, 60 plus | Datapoint by metric grid, with grey for could not read | built |
| Filter | Needs attention, All cases, Failing, Not yet reviewed, and metric-score columns on the complete results table | built |
| Failure notes and prioritization | Prism-generated drafts are visibly distinct from accepted and edited notes. Only reviewed notes enter groups; an evidence-insufficient case is labelled note unavailable and sorted first for human review | built as a Humain ONE review safeguard |
| Per-datapoint trace inspection | Results open a case drilldown with Next and Previous navigation, typed input/output, and OpenTelemetry trace_id, spans, status, duration, and attributes | built using the industry-standard trace vocabulary requested in the final review |
| Agent improvement loop | Improve and deploy shows inspect, edit agent, deploy version, and evaluate again. The demo moves v1.4.0 to v1.5.0 before the next run, and each receipt keeps the exact agent version | built; this is the primary loop, while failure grouping is optional |

## Dataset

| Prism showed | In V17 | Status |
|---|---|---|
| Upload in any shape: documents, CSV, JSON, drive links | Sources: CSV, Documents or JSON, Drive link, warehouse, bucket, production traffic. Snowflake proves provider choice, read-only connection validation, object browse after success, preview, import, mapping review, and confirmation | built |
| Free form JSON, fields named later when pointed at an agent | Step 1 mapping table, a role dropdown per key: Input, Expected output, Metadata, Ignore | built |
| Media as links that map to the input | attachment_url mapped to Input; caption says the agent fetches it | built |
| Every row in a run shares a shape | Summary line: all 380 of 380 rows share this shape | built |
| JSON preview of a row | View raw row 3 | built |
| Save as Dataset, Copy, Download, left hand filters | Dataset sources, mapping, raw-row preview, browse and case editing are present | excluded by decision: storage utilities belong to dataset administration, outside Evaluate |

## Deterministic metric playground

| Prism showed | In V17 | Status |
|---|---|---|
| Python, with JavaScript, Java, Go pending, Live runtime | Language tabs, same states | built, inert tabs |
| evaluate(input, expected_output, agent_response) contract returning float, bool or dict | Prefilled source with the exact contract | built |
| Data Input: Manual or Dataset | Toggle; Dataset fills the JSON from any case | built |
| Run Metric and Result | Run metric, sandbox result that changes when the body changes | built |
| Tags, Manage tags, Saved state | Tags line, Unsaved badge | built, static |

## Prompt playground

| Prism showed | In V17 | Status |
|---|---|---|
| Versioned prompt, v1.0.0, major, Current | Saves as v1.0.0; saved Prompt judge definitions carry versions | built |
| Model picker | Model select | built |
| System prompt with {input} highlighted | Prompt with variable chips detected as you type | built |
| Variables with a value field each | Variables block with a test value per variable | built |
| Response panel | Run once, response with verdict and one line of reasoning | built |
| Est. tokens and cost | Est. tokens per case; cost derives from tokens elsewhere | built |
| Attached documents: Upload; Metrics: + Add on the agent | The selected agent is shown as coming from Submit agent | covered at journey boundary: those change the agent definition in step 1, not an evaluation in step 6 |

## Transcript points

| Uday said | In V17 | Status |
|---|---|---|
| No schema file; you name the fields | Mapping table | built |
| Three metric kinds plus agentic; a metric reads what the agent returned | Four kinds in the library; the steps metric says the trace must be returned | built |
| Metrics are separate from the dataset and arbitrary by use case; there is no universal default metric set | New evaluation state starts with 0 attached. The saved Al Noor evaluation contains four explicitly agent-specific definitions, and Humain ONE platform observations are visually separated from Prism metrics and excluded from metric aggregates | built |
| Aggregation is average or sum per metric | Aggregation dropdown | built |
| No pass or fail; Prism has no domain knowledge for thresholds | No pass mark anywhere; submit available after one run | built |
| AI suggested metrics and thresholds deferred past V1 | Absent by decision; the AI summary reads numbers and suggests nothing | built as an absence |

## Completeness statement for V17

No visible capability from the 1 Sep Prism walkthrough is unaccounted for in the V17 product flow. "Accounted for" does not mean every Prism administration screen is cloned. V17 also incorporates the 3 Sep review: a simpler default path, Prompt-first metric creation, clearer Code and Evaluation agent labels, explicit phasing, OpenTelemetry traces inside results, and a versioned edit-deploy-evaluate loop.

Three facts remain external to the prototype, but none is a missing product capability:

- Judge agreement is correctly shown as 0 of 20 until a human labels the cases. The calibration workflow exists; the evidence does not yet.
- Uday did not open the Metric calibration tab in the recording, so V10 does not claim its hidden fields are Prism behavior. It reflects the visible tab and clearly presents the human-verdict contract as the Humain ONE workflow.
- Prism evaluates each datapoint independently and can deliver independent datapoints in parallel. V17 states that explicitly and preflights each mapped input against the agent limit. Internal transport batch size and retry policy remain Chandra's engineering implementation detail; they do not change the product flow or score semantics.
