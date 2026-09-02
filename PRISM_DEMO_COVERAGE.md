# Prism demo, item by item, against the prototype

Source: Uday Kumar Pabbathi's walkthrough on 1 Sep 2026, the recording reviewed screen by screen, plus the transcript and three screenshots Ritwik supplied. Target: Eval_Journey_V7.html. This ledger is refreshed per version. If an item is not built, the reason is here, so scope is a decision and not a discovery.

Status key: built, partial, not built.

## Agents page

| Prism showed | In V7 | Status |
|---|---|---|
| Agents typed Prompt, Agentic, Deterministic, REST API, with counts | The evaluation card shows the agent as a typed REST API object with its endpoint | partial: the agent arrives from the Submit agent step, so there is no agents list here by design |
| Add Agent, Import, Bulk upload, Collections, Specs, Export | none | not built: agent management lives in step 1 of the journey, outside Evaluate |

## Create Evaluation

| Prism showed | In V7 | Status |
|---|---|---|
| Name (required) | Step 3, Name field; the results screen carries it as the evaluation title | built |
| Agent (REST API or Prompt) | Step 3, typed agent line | built |
| Dataset | Step 1 dataset card and step 3 summary | built |
| Description, not read by any model | Step 3, Description field, labelled as saved with the run and not read | built |
| Number of Runs, 1 to 5 | Step 3, select 1 to 5; estimate multiplies | built |
| Parallel Datapoints toggle | Step 3, checkbox; estimate and job duration respond | built |
| Global Metrics tabbed Prompt, Agentic, Deterministic, REST API with counts | Step 2 library tabs with live counts | built |
| Metric search | Step 2 search box | built |
| "N metric(s) selected" | "4 of 4 on" badge and the step 3 metrics line | built |
| Metric calibration tab | Its own card under step 3: every judge metric, version, agreement with your verdicts or "not yet checked against a human, 0 of 20" | built as a card, not a tab |
| Import tab | none | not built: no decision hinges on it |

## Evaluations list

| Prism showed | In V7 | Status |
|---|---|---|
| Evaluations grouped as lineages with versions (v2, v3) | Results screen, lineage line: v3, 2 earlier versions kept | built |
| Jobs under an evaluation with status, JOB id, DATAPOINTS x/y, DURATION, SCORE, LATEST | Results screen, jobs table | built |
| A failed job at 0/3, 0s, no score | A failed job at 0/380, 0s, no score, kept in the list and left out of the trend | built |
| Duplicate, Run actions | Duplicate and Run again on the evaluation card | built |
| Compare across evaluations | Screen 6 compares this job to the previous job only | partial: comparing two different evaluations is the next thing worth building |
| Filters All, Prompt, Agent; Tags and Collections | none | not built: one agent, one evaluation lineage in this flow |

## Job results

| Prism showed | In V7 | Status |
|---|---|---|
| Performance strip: datapoints, avg, P50, P95, P99, total | Results screen performance strip | built |
| Tokens in and out | Tiles and strip; cost derives from tokens, no invented price | built |
| AI generated Evaluation Summary with model picker, opt in | Results screen card, Generate summary, written from the job's own numbers | built |
| Detailed Results tab: per datapoint scores | Metric scores toggle on the results table, one column per metric, sharing a generator with the grid so they reconcile | built |
| Evaluation Metrics with aggregation dropdown (Sum) | Score board dropdown Average or Sum, driving the board, the evidence pack and the columns | built |
| Scale toggle percent, 0 to 10, 0 to 1 | Score board toggle | built |
| Metrics Overview radar | none | not built: a radar over four metrics adds no decision the board does not already give |
| Datapoint x Metric Scores heatmap with under 40, 40 to 60, 60 plus | Datapoint by metric grid, with grey for could not read | built |
| Filter | Attention filters on the results table | partial |

## Dataset

| Prism showed | In V7 | Status |
|---|---|---|
| Upload in any shape: documents, CSV, JSON, drive links | Sources: CSV, Documents or JSON, Drive link, warehouse, bucket, production traffic | built |
| Free form JSON, fields named later when pointed at an agent | Step 1 mapping table, a role dropdown per key: Input, Expected output, Metadata, Ignore | built |
| Media as links that map to the input | attachment_url mapped to Input; caption says the agent fetches it | built |
| Every row in a run shares a shape | Summary line: all 380 of 380 rows share this shape | built |
| JSON preview of a row | View raw row 3 | built |
| Save as Dataset, Copy, Download, left hand filters | none | not built |

## Deterministic metric playground

| Prism showed | In V7 | Status |
|---|---|---|
| Python, with JavaScript, Java, Go pending, Live runtime | Language tabs, same states | built, inert tabs |
| evaluate(input, expected_output, agent_response) contract returning float, bool or dict | Prefilled source with the exact contract | built |
| Data Input: Manual or Dataset | Toggle; Dataset fills the JSON from any case | built |
| Run Metric and Result | Run metric, sandbox result that changes when the body changes | built |
| Tags, Manage tags, Saved state | Tags line, Unsaved badge | built, static |

## Prompt playground

| Prism showed | In V7 | Status |
|---|---|---|
| Versioned prompt, v1.0.0, major, Current | Saves as v1.0.0; built in judge prompts carry versions | built |
| Model picker | Model select | built |
| System prompt with {input} highlighted | Prompt with variable chips detected as you type | built |
| Variables with a value field each | Variables block with a test value per variable | built |
| Response panel | Run once, response with verdict and one line of reasoning | built |
| Est. tokens and cost | Est. tokens per case; cost derives from tokens elsewhere | built |
| Attached documents: Upload; Metrics: + Add on the agent | none | not built: those attach to an agent, which is step 1 of the journey |

## Transcript points

| Uday said | In V7 | Status |
|---|---|---|
| No schema file; you name the fields | Mapping table | built |
| Three metric kinds plus agentic; a metric reads what the agent returned | Four kinds in the library; the steps metric says the trace must be returned | built |
| Aggregation is average or sum per metric | Aggregation dropdown | built |
| No pass or fail; Prism has no domain knowledge for thresholds | No pass mark anywhere; submit available after one run | built |
| AI suggested metrics and thresholds deferred past V1 | Absent by decision; the AI summary reads numbers and suggests nothing | built as an absence |

## Still open after V7

Compare across two evaluations. Batching (Chandra). Judge agreement against a human not run, so calibration reads 0 of 20 for the built in judges. Metric calibration tab unexplored in Prism itself.
