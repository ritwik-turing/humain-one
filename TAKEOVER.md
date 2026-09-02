# Humain ONE eval workstream: takeover handoff

Written 2 Sep 2026, meeting records added the same day, reviewed and corrected for handoff at the end of 2 Sep (this is v2 of the document), for whoever picks this up next, including a system with no access to the previous sessions. Everything load bearing is written out here. Every file is linked by its full local path, and live copies are linked where they exist. If you can read files, read the ones marked CANONICAL and CURRENT first. If you cannot, this document is enough to work from.

## Start here, in order

0. If you are a Claude Code session on Ritwik's Mac, his global rules send you to `~/SecondBrain/Humain/CLAUDE.md` first. That file points back here. Its STATE.md was last verified 13 Jul 2026 and predates this workstream; use it for the wider engagement, not for eval.
1. Read this whole document once.
2. Open the current shipped prototype and click through all nine screens: [Eval_Journey_V14.html](file:///Users/ritwikmac/Documents/GitHub/humain-one/Eval_Journey_V14.html) , live at https://ritwik-turing.github.io/humain-one/Eval_Journey_V14.html
3. Open the explainer, which is the product explained to the team with the real screens embedded: [Eval_Platform_How_It_Works.html](file:///Users/ritwikmac/Documents/GitHub/humain-one/Eval_Platform_How_It_Works.html) , live at https://ritwik-turing.github.io/humain-one/Eval_Platform_How_It_Works.html
4. Read the coverage ledger, which is the Prism demo checked item by item against V14: [PRISM_DEMO_COVERAGE.md](file:///Users/ritwikmac/Documents/GitHub/humain-one/PRISM_DEMO_COVERAGE.md) , and the release bar next to it: [EVAL_STATE_OF_THE_ART_AUDIT.md](file:///Users/ritwikmac/Documents/GitHub/humain-one/EVAL_STATE_OF_THE_ART_AUDIT.md)
5. Read the working rules under "Working rules learned from Ritwik" below. He rejected three versions in a row before they existed. They are not optional.
6. Before you change anything, run the self test so you know the baseline is green: `bash "/Users/ritwikmac/Documents/GitHub/humain-one/tools/selftest.sh" "/Users/ritwikmac/Documents/GitHub/humain-one/Eval_Journey_V14.html"`

## Meeting records

Read these before you form a view on Prism or on why the prototype looks the way it does. They are the sources; everything else here was written from them.

- [2026-09-01_humain-eval_transcript-prism-walkthrough-uday_v1.md](file:///Users/ritwikmac/Documents/Claude/Projects/Humain%20AI%20agent%20marketplace%20project%20by%20Turing/2026-09-01_humain-eval_transcript-prism-walkthrough-uday_v1.md) : the complete verbatim transcript of the 1 Sep Prism walkthrough, 273 speaker turns with timestamps, Gemini's summary and decisions, and a frame by frame account of what was on screen in the recording, with video times. The primary source for every Prism fact in this document.
- [2026-08-28_humain-eval_meeting-notes-discussion-2_v1.md](file:///Users/ritwikmac/Documents/Claude/Projects/Humain%20AI%20agent%20marketplace%20project%20by%20Turing/2026-08-28_humain-eval_meeting-notes-discussion-2_v1.md) : the 28 Aug review with Ritesh, Sandip, Tirthankar and Chandrasen. Gemini's summary in full, the next steps and what became of them, and a link to the Google Doc that holds the transcript tab. A verbatim transcript of this meeting was never shared into the working sessions and is not on this machine; do not present the summary as speech.
- [2026-09-01_humain-eval_recording-prism-walkthrough-uday_v1.mp4](file:///Users/ritwikmac/Documents/Claude/Projects/Humain%20AI%20agent%20marketplace%20project%20by%20Turing/2026-09-01_humain-eval_recording-prism-walkthrough-uday_v1.mp4) : the 1 Sep recording itself, 21 min 47 s, local copy. Not in the public repo on purpose: it shows a colleague on camera walking through an internal platform. The transcript file states the offset between transcript timestamps and video time.

## Who and what

**Ritwik Chakradhar**, program manager at Turing, ritwik.c@turing.com. Atlassian account 6123eb593fe26c0069357e16, site turingservices.atlassian.net, cloudId d2de1b28-d027-49bb-ba65-320a8970cf8c, JIRA project HUMAIN.

**The engagement.** Turing is building the Humain ONE enterprise AI agent marketplace for HUMAIN, a PIF company in Saudi Arabia. The developer journey has nine steps; this workstream owns step 6, Evaluate. On 24 Aug 2026 Yasir, the Humain side point of command, pivoted the journey to be evaluation first. Sandip's line: the whole reason this project exists is evaluation.

**Prism** is Turing's evaluation engine, owned by Ritesh Sinha, at prism.turing.com. Every capability is a REST endpoint. SpecVision is another product built on it. Our Evaluate step is a front end over Prism plus the judgement layer Prism does not have. Uday Kumar Pabbathi is the Prism point of contact and walked us through it on 1 Sep.

**People**

- Tirthankar Talukdar, tech architect, tirthankar.t@turing.com. Escalates when timesheets slip; JIRA and Jibble are filled through 31 Aug.
- Ritesh Sinha, owns Prism, stakeholder on evaluation. Rejected V1 as dense and not exhaustive, said V2 was too question and answer shaped. Both fixed since.
- Sandip Parekh, stakeholder.
- Chandrasen Bireddy, called Chandra, engineering lead. Owns the technical how, including batching.
- Uday Kumar Pabbathi, Prism POC. His 1 Sep walkthrough is the source of truth for the V10 metric-model correction.
- Yasir, Humain decision maker. Mockups route through him.
- Nikhil, reviewer; Kartik Pardeshi and Siddharth Keshar, engineering; Madan Shah, DevOps; Andrew Mavliev, external on the H2O-O substrate integration.

## The product in one page

A case is one row of the dataset: an input, an output, an optional expected answer, a trace, and metadata. Input and output are lists of typed parts: text, image, video, audio, document, table, structured payload, raw file. There is no agent type anywhere in the product; one dataset holds a citizen question, a pothole photo, a CCTV clip, an Arabic call recording, a scanned deed and a query result side by side. The demo dataset is 380 cases, alnoor-mixed-eval, for a fictional Al Noor Municipality services agent.

Prism does not supply a universal scorecard. The developer creates a Prompt, Deterministic, REST API or Agentic metric for the use case, or deliberately reuses one from their personal library, then attaches it to an evaluation. A new evaluation starts with 0 attached. Only after attachment does the definition's input contract determine coverage per case. This authored-definition model, followed by visible coverage, is the idea everything else hangs off.

The nine screens, in order:

1. Set up an evaluation, in three steps mirroring Prism's Create Evaluation. Dataset from CSV, documents or JSON, a Drive link, a warehouse, a bucket, or sampled production traffic; then name the fields with a role dropdown per key, Input, Expected output, Metadata, Ignore, because Prism has no schema file. Then create a use-case-specific metric definition or deliberately reuse one from the user's personal library, tabbed by Prism's four mechanisms, Prompt, Deterministic, REST API, Agentic. A new evaluation starts at 0 attached; the saved Al Noor example has one of each. Unmap the expected output and the Al Noor expected-output definition becomes unavailable with the reason and drops out of the count. Builders cover a prompt with variables, a Python function with Prism's evaluate(input, expected_output, agent_response) contract, an endpoint with the posted payload and score field, and an agentic call. Then the evaluation: name, description, typed agent and endpoint, number of runs 1 to 5, parallel datapoints, and a functional metric calibration tab showing each judge definition's agreement with the developer's verdicts or "not yet checked against a human".
2. Results. The named evaluation with every job under it: datapoints attempted, duration, score, LATEST, and a job that failed before its first datapoint at 0 of 380 with no score, kept visible. Edit, Duplicate and Run again work from the evaluation header. Where to look first. The safety band, three cases green in every column that still raised a flag. Tokens, average, P50, P95, P99, min-to-max range, total and completion from Prism; cost derives from tokens, never an invented price. The score board with Average or Sum and a percent, 0 to 10, 0 to 1 scale. An opt in AI summary written from the job's numbers. The datapoint by metric grid, grey where a metric could not read a case. The complete results table with an attention filter, never a smaller table, and a metric scores toggle whose values reconcile with the grid.
3. What the agent did: one case, every step with timing, what went in, what was expected, what came back, each rendered as its type.
4. What went wrong: the developer's one sentence notes grouped, biggest group first.
5. Make the fix measurable: select a reviewed failure, define a yes or no Prompt regression metric over Input, Output, and Trace, compare it with twenty human verdicts, then save it to the personal library and attach it to this evaluation. The developer changes the agent outside the screen and reruns.
6. Compare runs and evaluations: compare two jobs inside one evaluation or two saved evaluations, match shared case IDs first, then show fixed, worse, unmatched, and new safety flags even when every other column stayed green.
7. Evidence: every check with what happened to it, including the ones that did not run and why, with coverage counts.
8. Submit for verification: available after one run, no pass mark, open issues sent as they are.
9. Verification status lives in the parent journey.

## What Prism actually does, settled on 1 Sep

- A metric is one of four kinds: Prompt, Deterministic, REST API, Agentic. Prism types agents by the same four. Nothing is scored by modality; a metric can only read what the agent returned, so a trace must come back in the response to be scoreable.
- Metrics are separate from the dataset and arbitrary by use case. "Global Metrics" names Prism's library, not a universal default set. The developer explicitly creates or reuses definitions and attaches them to an evaluation.
- No schema file. Datasets keep whatever shape they arrive in; input, expected output and metadata keys are named by hand once per agent and dataset pairing. Every row in a run shares a shape because every row goes to the same agent.
- Media never enters the dataset. The row carries a link and the agent fetches it; a link field mapped to Input is the mechanism.
- Per job Prism reports datapoints attempted x of y, average and P50, P95, P99 latency, min-to-max range, total, completion, and tokens in and out. Cost derives from tokens.
- An evaluation is the saved pairing of agent, dataset and metrics, versioned as a lineage; a job is one execution under it. Number of runs is a native field capped at 5; Parallel datapoints is a native toggle. There is a Metric calibration tab in Create Evaluation, not yet explored on the Prism side.
- Aggregation is per metric across datapoints, average or sum, with a percent, 0 to 10, 0 to 1 scale. An opt in AI evaluation summary exists per job with a model picker.
- No pass mark. Prism has no domain knowledge to set thresholds, and AI suggested metrics or thresholds were deferred past V1 by joint decision between Ritwik and Uday, because an unvalidated suggestion is a second thing to check rather than an answer.
- The prompt playground versions prompts (v1.0.0, major, Current), binds fields to variables, shows a response and a token estimate. The deterministic playground has Python live and JavaScript, Java, Go pending, a Manual or Dataset data input, and a sandbox result.

## Decisions made, and why, so you do not reopen them

- **Evaluation does not gate publishing.** No pass bar. Submit is available after one run whatever the result. Joint with Uday.
- **The developer's sentence is the ground truth.** They write what went wrong in their words; we group and count; a group becomes a saved check. Judge scores are labelled as a signal until calibrated against a human.
- **Coverage is a count, never a switch.** Every screen that shows a score shows how many datapoints it stood on.
- **No universal metric shortlist.** A new evaluation starts with 0 attached. Humain ONE platform observations are separate evidence and never enter the Prism metric aggregate.
- **No agent type.** Modality lives on the part, not the agent. Adding an input type is data, not screens.
- **Data leads every client facing screen; rationale goes to the talk track.** V1 was rejected for arguing in prose on screen.
- **Never edit a version someone has been sent.** Copy to the next number, leave the old file at its link.
- **Costs derive from tokens.** The invented SAR per case was removed on 1 Sep and must not return.
- **Not built, on purpose** (from the ledger): Collections and global list filters, the Metrics Overview radar, dataset storage utilities, and attaching documents or metrics at the agent-administration level. Those belong outside this Evaluate journey or add no decision the current view lacks.

## External follow-ups, not prototype omissions

- Judge agreement against a human has not been run, so calibration reads 0 of 20 for the saved Prompt judge definitions and every model-judge score carries the signal caveat. This is missing evidence, not missing product capability.
- Uday did not open Prism's Metric calibration tab in the recording. V10 shows the tab and the agreed human-verdict workflow without inventing hidden fields.
- Internal transport batch size and retry policy remain Chandra's engineering implementation detail. V10 settles the product behavior: each datapoint is evaluated independently, independent datapoints can be delivered in parallel, and each mapped input is checked against the agent limit before the run.
- Uday's review of the mockup, and a written Phase 1 agent type list from Humain, are still awaited.

## Working rules learned from Ritwik

These were each learned by being told, sometimes sharply. Follow them.

**Completion gate.** Before saying anything derived from a source is done, write the ledger: every item the source showed, where it lives, or not built with the reason. Show it with the deliverable. Absence is a defect even when every sentence is true. Verify by driving the product and reconciling the same number across every screen that shows it, not by rendering it. Run `tools/selftest.sh` and refresh `PRISM_DEMO_COVERAGE.md` before any version is called done.

**Delivery.** Every deliverable comes with its full absolute local path and its full live URL, both as clickable links, every time. Never a claude.ai artifact link, never a relative path, never a bare URL in a code block. When several artifacts are in play, list all of them. He said "always give me the full links, no BS".

**Explainers.** The approved shape: the answer as a claim above the fold, a tinted box with the one thing to say, three claim cards; one diagram with labels inside the picture and a caption that carries the implication; claim headings, never labels; risks visible, never collapsed; a three column glossary, plain word, what the tool calls it, what it means; screenshots of the real product captured from the prototype, embedded as base64 so the file stays standalone, next to the diagram each one grounds; every box in a flow chart clickable to its screen; box labels that show the act with a concrete example, never a slogan. Roughly 1,200 words before images. Examples anyone can picture, never client jargon.

**Client facing mockups.** Breadth visible, prose hidden. Real scale datasets, full metric palettes, history. Rationale in the presenter's notes.

**Writing, in his voice.** ASCII only: no em dashes, no en dashes, no curly quotes. No filler verbs: leveraged, ensured, drove, spearheaded, streamlined, utilized, orchestrated, championed, fostered, facilitated. No "Let me" preambles, no "Happy to" closers. No italic example phrases mid paragraph, no bold labels inside sentences, no rhetorical X. Y. Z. triplets, no "It's not X, it's Y". First person as him, "we" for the team. Contractions are fine and he notices when they are absent. Specific: ticket IDs, dates, numbers. Honest about misses, stated plainly, no self flagellation. Working group comments are neutral observations, "can we confirm", not asks to a named person; two to three sentences citing the row or story, ending in an action or question. Slack drafts paste ready with no preamble; when pushing back, acknowledge the other side first. Sound like a smart, slightly tired colleague who cares about the outcome.

**Timesheets.** JIRA worklogs go on tickets assigned to him; Sprint 8 buckets are HUMAIN-2413 (planning, standup) and HUMAIN-2424 (stakeholder, doc review), 4h each per weekday. If no ticket fits, create a task under HUMAIN-198 (Delivery Ops) with him as reporter and assignee at creation. Jibble is 8h per weekday as a manual hour entry, activity Project Delivery Work, project KSA - HUMAIN ONE - HUMAIN MARKETPLACE; it has no API and was filled through his logged in Chrome.

**Confidential.** Jabil client engineering drawing data is confidential and under legal review: read for structure only, never in mockups; aggregate scores are fine to quote.

**File names.** From 2 Sep 2026 new deliverables are named `YYYY-MM-DD_project-slug_asset-type_vN.ext`, lowercase, hyphens inside fields, underscores between. Files whose links were already in circulation keep their old names; that is why the prototypes and the explainer do not follow the rule and the meeting records and this document do.

**Sending and secrets.** Nothing goes to Slack, JIRA, email, a Google Doc, or anyone outside this chat without his explicit yes in the chat. Pushing prototype and document revisions to the humain-one repo was routine through 2 Sep and needs no separate yes. Secrets are read inline from the macOS Keychain with `security find-generic-password`; never accept or store a pasted key.

## How the prototypes are built and verified

Single standalone HTML files, no build step, no external dependencies, inline SVG thumbnails, deterministic seeded data so every number on screen is derived and stable. Screens are sections toggled by `data-go`. State persists to localStorage; Reset demo clears it.

To screenshot a screen for a document: copy the prototype, append a small script that reads query params (`s` for screen, `case` for a case index, `only` for a selector to isolate its card, `exact=1` to isolate the element itself, `open` for a button id to click first, `wide=1` to hide the sidebar), serve it or open it over file://, capture with headless Chrome at device scale 2, then embed as base64 JPEG. The recipe is in `Eval_V3_Plan.md` and in the 1 Sep decision record.

To verify: `tools/selftest.sh` drives the prototype headlessly and checks consequences, not rendering. Grep for the replacement text after every edit; a counter that returns 0 means the edit matched nothing. Parse the JavaScript after every change. Read every screen as text after rendering; a screen can render perfectly and still say something false. Reconcile every number against the one it should agree with.

## What a takeover session cannot do from here

This section is for a session without this Mac: ChatGPT, a claude.ai web session, or a cloud routine. A Claude Code session on this Mac has all of it: the files, headless Chrome at /Applications/Google Chrome.app for screenshots and the self test, git push (pushes from this machine worked all day on 2 Sep), and his logged in Chrome through the Claude in Chrome extension when he has it open.

- Drive Ritwik's Chrome, so no Jibble, no anything that needs his logged in browser.
- Read his laptop's files unless you have been given file access. Everything decision relevant from them is in this document; the links are for when you do.
- Take screenshots of the prototype without a browser. The headless recipe above needs Chrome on a machine with the file.
- Push to GitHub without his credentials. Ask him to push, or hand him the file.

## Full inventory, every file linked

### The repo, ritwik-turing/humain-one, served by GitHub Pages

Local root: [/Users/ritwikmac/Documents/GitHub/humain-one](file:///Users/ritwikmac/Documents/GitHub/humain-one) . Live root: https://ritwik-turing.github.io/humain-one/ . Everything here is pushed; `git log` is the history.

| File | What it is | Live |
|---|---|---|
| [Eval_Journey_V14.html](file:///Users/ritwikmac/Documents/GitHub/humain-one/Eval_Journey_V14.html) | CURRENT prototype. Completes the failure-to-fix loop and keeps regression-metric library, attachment, calibration, and evidence state synchronized. | [https://ritwik-turing.github.io/humain-one/Eval_Journey_V14.html](https://ritwik-turing.github.io/humain-one/Eval_Journey_V14.html) |
| [Eval_Journey_V13.html](file:///Users/ritwikmac/Documents/GitHub/humain-one/Eval_Journey_V13.html) | Previous prototype. Separated personal-library membership, compatibility, and attachment; clarified Step 5. | [https://ritwik-turing.github.io/humain-one/Eval_Journey_V13.html](https://ritwik-turing.github.io/humain-one/Eval_Journey_V13.html) |
| [Eval_Journey_V12.html](file:///Users/ritwikmac/Documents/GitHub/humain-one/Eval_Journey_V12.html) | Previous prototype. Added the signed-in user's personal metric library for definitions they previously created or used. | [https://ritwik-turing.github.io/humain-one/Eval_Journey_V12.html](https://ritwik-turing.github.io/humain-one/Eval_Journey_V12.html) |
| [Eval_Journey_V11.html](file:///Users/ritwikmac/Documents/GitHub/humain-one/Eval_Journey_V11.html) | Previous: immutable run receipts, definition/runtime provenance, and metric-version-safe comparison. Preserved because it was already sent. | [https://ritwik-turing.github.io/humain-one/Eval_Journey_V11.html](https://ritwik-turing.github.io/humain-one/Eval_Journey_V11.html) |
| [Eval_Journey_V10.html](file:///Users/ritwikmac/Documents/GitHub/humain-one/Eval_Journey_V10.html) | Previous: corrected the metric model to agent-specific Prompt, Deterministic, REST API, and Agentic definitions with zero attached for a new evaluation. Preserved because it was already sent. | [https://ritwik-turing.github.io/humain-one/Eval_Journey_V10.html](https://ritwik-turing.github.io/humain-one/Eval_Journey_V10.html) |
| [Eval_Journey_V9.html](file:///Users/ritwikmac/Documents/GitHub/humain-one/Eval_Journey_V9.html) | Previous: comparison, performance and navigation audit closure. Preserved because it was already sent; its universal-looking metric shortlist is corrected in V10. | [https://ritwik-turing.github.io/humain-one/Eval_Journey_V9.html](https://ritwik-turing.github.io/humain-one/Eval_Journey_V9.html) |
| [Eval_Journey_V8.html](file:///Users/ritwikmac/Documents/GitHub/humain-one/Eval_Journey_V8.html) | Previous: first Prism-complete reconciliation and six-box explainer pass; preserved because it was already sent. | [https://ritwik-turing.github.io/humain-one/Eval_Journey_V8.html](https://ritwik-turing.github.io/humain-one/Eval_Journey_V8.html) |
| [Eval_Journey_V7.html](file:///Users/ritwikmac/Documents/GitHub/humain-one/Eval_Journey_V7.html) | Previous: full three-step setup, jobs, calibration, aggregation controls, and job-to-job comparison. | [https://ritwik-turing.github.io/humain-one/Eval_Journey_V7.html](https://ritwik-turing.github.io/humain-one/Eval_Journey_V7.html) |
| [Eval_Journey_V6.html](file:///Users/ritwikmac/Documents/GitHub/humain-one/Eval_Journey_V6.html) | Previous: three step setup without jobs, calibration, aggregation controls. | [https://ritwik-turing.github.io/humain-one/Eval_Journey_V6.html](https://ritwik-turing.github.io/humain-one/Eval_Journey_V6.html) |
| [Eval_Journey_V5.html](file:///Users/ritwikmac/Documents/GitHub/humain-one/Eval_Journey_V5.html) | Vocabulary reconciled with Prism, tokens instead of invented cost, datapoint grid. No real mapping or builder. | [https://ritwik-turing.github.io/humain-one/Eval_Journey_V5.html](https://ritwik-turing.github.io/humain-one/Eval_Journey_V5.html) |
| [Eval_Journey_V4.html](file:///Users/ritwikmac/Documents/GitHub/humain-one/Eval_Journey_V4.html) | Modality moved onto the case; eight input types in one dataset; coverage as a count. | [https://ritwik-turing.github.io/humain-one/Eval_Journey_V4.html](https://ritwik-turing.github.io/humain-one/Eval_Journey_V4.html) |
| [Eval_Journey_V3.html](file:///Users/ritwikmac/Documents/GitHub/humain-one/Eval_Journey_V3.html) | Two agent profiles with a switch. Superseded by V4's typed parts. | [https://ritwik-turing.github.io/humain-one/Eval_Journey_V3.html](https://ritwik-turing.github.io/humain-one/Eval_Journey_V3.html) |
| [Eval_Journey_V2.html](file:///Users/ritwikmac/Documents/GitHub/humain-one/Eval_Journey_V2.html) | The version Ritesh reviewed on 28 Aug and called too question and answer shaped. Frozen. | [https://ritwik-turing.github.io/humain-one/Eval_Journey_V2.html](https://ritwik-turing.github.io/humain-one/Eval_Journey_V2.html) |
| [Eval_Journey_V1.html](file:///Users/ritwikmac/Documents/GitHub/humain-one/Eval_Journey_V1.html) | Rejected 27 Aug as dense and not exhaustive. Frozen. | [https://ritwik-turing.github.io/humain-one/Eval_Journey_V1.html](https://ritwik-turing.github.io/humain-one/Eval_Journey_V1.html) |
| [Eval_Platform_How_It_Works.html](file:///Users/ritwikmac/Documents/GitHub/humain-one/Eval_Platform_How_It_Works.html) | The explainer for the team: a six-box presenter flow first, the detailed screen map behind a disclosure, nine embedded prototype screenshots, and clickable boxes. This repo copy is canonical; it was refreshed at 14:08 on 2 Sep and the project folder copy was synced from it in the handoff review. | [https://ritwik-turing.github.io/humain-one/Eval_Platform_How_It_Works.html](https://ritwik-turing.github.io/humain-one/Eval_Platform_How_It_Works.html) |
| [Eval_Cheat_Sheet.html](file:///Users/ritwikmac/Documents/GitHub/humain-one/Eval_Cheat_Sheet.html) | Historical V9 playbook. Its generic metric palette is superseded and visibly labelled; use the current six-box explainer for V10. | [https://ritwik-turing.github.io/humain-one/Eval_Cheat_Sheet.html](https://ritwik-turing.github.io/humain-one/Eval_Cheat_Sheet.html) |
| [Eval_Session_Runbook.html](file:///Users/ritwikmac/Documents/GitHub/humain-one/Eval_Session_Runbook.html) | Redirect stub to the playbook. Keep, old links point here. | [https://ritwik-turing.github.io/humain-one/Eval_Session_Runbook.html](https://ritwik-turing.github.io/humain-one/Eval_Session_Runbook.html) |
| [Agent_Lifecycle_V12.html](file:///Users/ritwikmac/Documents/GitHub/humain-one/Agent_Lifecycle_V12.html) | The parent developer journey, nine steps. Evaluate is step 6 and links here from the rail. | [https://ritwik-turing.github.io/humain-one/Agent_Lifecycle_V12.html](https://ritwik-turing.github.io/humain-one/Agent_Lifecycle_V12.html) |
| [PRISM_DEMO_COVERAGE.md](file:///Users/ritwikmac/Documents/GitHub/humain-one/PRISM_DEMO_COVERAGE.md) | The ledger: every item from Uday's Prism demo against V10, built, covered at the journey boundary, or excluded by decision. No walkthrough item is unaccounted for. | [https://github.com/ritwik-turing/humain-one/blob/main/PRISM_DEMO_COVERAGE.md](https://github.com/ritwik-turing/humain-one/blob/main/PRISM_DEMO_COVERAGE.md) |
| [EVAL_STATE_OF_THE_ART_AUDIT.md](file:///Users/ritwikmac/Documents/GitHub/humain-one/EVAL_STATE_OF_THE_ART_AUDIT.md) | The release bar for V14: product requirements, overall review result, and evidence. Read with the ledger. | [https://github.com/ritwik-turing/humain-one/blob/main/EVAL_STATE_OF_THE_ART_AUDIT.md](https://github.com/ritwik-turing/humain-one/blob/main/EVAL_STATE_OF_THE_ART_AUDIT.md) |
| [HANDOFF.md](file:///Users/ritwikmac/Documents/GitHub/humain-one/HANDOFF.md) | Repo level handoff for a fresh Claude session with the repo cloned. Shorter than this document. | [https://github.com/ritwik-turing/humain-one/blob/main/HANDOFF.md](https://github.com/ritwik-turing/humain-one/blob/main/HANDOFF.md) |
| [selftest.sh](file:///Users/ritwikmac/Documents/GitHub/humain-one/tools/selftest.sh) | Headless self test: drives a prototype from disk in Chrome, 30 checks that reconcile numbers and interactions across screens, exit 1 on failure. Run before calling a version done. | [https://github.com/ritwik-turing/humain-one/blob/main/tools/selftest.sh](https://github.com/ritwik-turing/humain-one/blob/main/tools/selftest.sh) |
| [MOM_Eval_Discussion_2_28Aug.md](file:///Users/ritwikmac/Documents/GitHub/humain-one/MOM_Eval_Discussion_2_28Aug.md) | Minutes of the 28 Aug review with Ritesh, Sandip, Tirthankar, Chandrasen, in Ritwik's voice, including the defence of the current state. | [https://github.com/ritwik-turing/humain-one/blob/main/MOM_Eval_Discussion_2_28Aug.md](https://github.com/ritwik-turing/humain-one/blob/main/MOM_Eval_Discussion_2_28Aug.md) |
| [Eval_Generic_Research.md](file:///Users/ritwikmac/Documents/GitHub/humain-one/Eval_Generic_Research.md) | Research note: Braintrust, LangSmith, DeepEval, Vertex converge on input, output, optional label, trace, metadata; the five gaps that set up V4. | [https://github.com/ritwik-turing/humain-one/blob/main/Eval_Generic_Research.md](https://github.com/ritwik-turing/humain-one/blob/main/Eval_Generic_Research.md) |
| [Eval_V3_Plan.md](file:///Users/ritwikmac/Documents/GitHub/humain-one/Eval_V3_Plan.md) | Plan and per version build log from V3 to V4 at the bottom. | [https://github.com/ritwik-turing/humain-one/blob/main/Eval_V3_Plan.md](https://github.com/ritwik-turing/humain-one/blob/main/Eval_V3_Plan.md) |
| [Eval_Open_Questions.md](file:///Users/ritwikmac/Documents/GitHub/humain-one/Eval_Open_Questions.md) | Open questions and proposed answers for the team, in Ritwik's voice. He attaches this to Slack. | [https://github.com/ritwik-turing/humain-one/blob/main/Eval_Open_Questions.md](https://github.com/ritwik-turing/humain-one/blob/main/Eval_Open_Questions.md) |

### The project folder, the meeting records, a copy of the explainer and all earlier research

Root: [/Users/ritwikmac/Documents/Claude/Projects/Humain AI agent marketplace project by Turing](file:///Users/ritwikmac/Documents/Claude/Projects/Humain%20AI%20agent%20marketplace%20project%20by%20Turing)

| File | What it is |
|---|---|
| [2026-09-01_humain-eval_transcript-prism-walkthrough-uday_v1.md](file:///Users/ritwikmac/Documents/Claude/Projects/Humain%20AI%20agent%20marketplace%20project%20by%20Turing/2026-09-01_humain-eval_transcript-prism-walkthrough-uday_v1.md) | Full verbatim transcript of the 1 Sep Prism walkthrough with timestamps, summary, decisions, and what was on screen. |
| [2026-08-28_humain-eval_meeting-notes-discussion-2_v1.md](file:///Users/ritwikmac/Documents/Claude/Projects/Humain%20AI%20agent%20marketplace%20project%20by%20Turing/2026-08-28_humain-eval_meeting-notes-discussion-2_v1.md) | The 28 Aug review: Gemini summary in full, next steps, link to the Google Doc with the transcript tab. |
| [2026-09-01_humain-eval_recording-prism-walkthrough-uday_v1.mp4](file:///Users/ritwikmac/Documents/Claude/Projects/Humain%20AI%20agent%20marketplace%20project%20by%20Turing/2026-09-01_humain-eval_recording-prism-walkthrough-uday_v1.mp4) | Local copy of the 1 Sep recording, 90 MB. Not pushed. Same bytes as the Downloads original listed under The source recording. |
| [Eval platform - how it works.html](file:///Users/ritwikmac/Documents/Claude/Projects/Humain%20AI%20agent%20marketplace%20project%20by%20Turing/Eval%20platform%20-%20how%20it%20works.html) | Copy of the repo explainer, synced on 2 Sep evening. The repo copy is canonical; if they ever differ, the repo wins. Standalone with images embedded, opens from disk. | |
| [HANDOFF - Eval Product Workstream.md](file:///Users/ritwikmac/Documents/Claude/Projects/Humain%20AI%20agent%20marketplace%20project%20by%20Turing/HANDOFF%20-%20Eval%20Product%20Workstream.md) | The 24 Aug handoff that started the eval workstream: the Yasir pivot, Prism as Ritesh's REST first engine, the 26 Aug mockup deadline. Historical context. | |
| [eval-scope-alignment-note.md](file:///Users/ritwikmac/Documents/Claude/Projects/Humain%20AI%20agent%20marketplace%20project%20by%20Turing/eval-scope-alignment-note.md) | Note to Ritesh and Sandip after the 24 Aug scope call. The agent abstraction is deliberately loose: a prompt, code, or a REST API can be an agent. | |
| [prism-hands-on.md](file:///Users/ritwikmac/Documents/Claude/Projects/Humain%20AI%20agent%20marketplace%20project%20by%20Turing/prism-hands-on.md) | Observed walkthrough of prism.turing.com on 25 Aug, workspace Jabil: scale, navigation, object model from the OpenAPI spec. | |
| [prism-platform-depth.md](file:///Users/ritwikmac/Documents/Claude/Projects/Humain%20AI%20agent%20marketplace%20project%20by%20Turing/prism-platform-depth.md) | Second pass on Prism as a multi tenant substrate with an LLM gateway and a governed marketplace. SpecVision is one consumer of it. | |
| [prism-what-i-found.html](file:///Users/ritwikmac/Documents/Claude/Projects/Humain%20AI%20agent%20marketplace%20project%20by%20Turing/prism-what-i-found.html) | Visual version of the Prism findings. | |
| [Eval Tooling Research - Synthesis.md](file:///Users/ritwikmac/Documents/Claude/Projects/Humain%20AI%20agent%20marketplace%20project%20by%20Turing/Eval%20Tooling%20Research%20-%20Synthesis.md) | What Phoenix, Arize AX and LangSmith teach: the convergent object model mapped to Prism. Per tool reports in research/. | |
| [Evaluations and Prism - from zero.html](file:///Users/ritwikmac/Documents/Claude/Projects/Humain%20AI%20agent%20marketplace%20project%20by%20Turing/Evaluations%20and%20Prism%20-%20from%20zero.html) | Plain English primer on evaluations and Prism. The explainer format Ritwik approved on 26 Aug; reuse its shape. | |
| [Phoenix and LangSmith - what to copy.html](file:///Users/ritwikmac/Documents/Claude/Projects/Humain%20AI%20agent%20marketplace%20project%20by%20Turing/Phoenix%20and%20LangSmith%20-%20what%20to%20copy.html) | Second approved explainer, same shape. | |
| [evals-explained.html](file:///Users/ritwikmac/Documents/Claude/Projects/Humain%20AI%20agent%20marketplace%20project%20by%20Turing/evals-explained.html) | Evals explained from scratch. | |
| [evals-visual.html](file:///Users/ritwikmac/Documents/Claude/Projects/Humain%20AI%20agent%20marketplace%20project%20by%20Turing/evals-visual.html) | Evals in pictures. | |
| [evals-capabilities-visual.html](file:///Users/ritwikmac/Documents/Claude/Projects/Humain%20AI%20agent%20marketplace%20project%20by%20Turing/evals-capabilities-visual.html) | Evals capability by capability. | |
| [eval-platforms-cheatsheet.html](file:///Users/ritwikmac/Documents/Claude/Projects/Humain%20AI%20agent%20marketplace%20project%20by%20Turing/eval-platforms-cheatsheet.html) | Eval platforms cheat sheet. | |
| [Developer Journey - product flow.html](file:///Users/ritwikmac/Documents/Claude/Projects/Humain%20AI%20agent%20marketplace%20project%20by%20Turing/Developer%20Journey%20-%20product%20flow.html) | The eval flow, what and why, earlier framing. | |
| [Developer Journey - current vs modified.html](file:///Users/ritwikmac/Documents/Claude/Projects/Humain%20AI%20agent%20marketplace%20project%20by%20Turing/Developer%20Journey%20-%20current%20vs%20modified.html) | Developer journey current versus modified. | |
| [Multi-Agent Evaluation - JIRA pack.md](file:///Users/ritwikmac/Documents/Claude/Projects/Humain%20AI%20agent%20marketplace%20project%20by%20Turing/Multi-Agent%20Evaluation%20-%20JIRA%20pack.md) | Epic plus six stories for multi agent evaluation, approved by Tirthankar 6 Aug, with dedupe notes against existing tickets. | |
| [HUMAIN - Eval Workstream Brief.pptx](file:///Users/ritwikmac/Documents/Claude/Projects/Humain%20AI%20agent%20marketplace%20project%20by%20Turing/HUMAIN%20-%20Eval%20Workstream%20Brief.pptx) | Slide brief for the workstream. | |

### Decision records, Obsidian vault

Root: [/Users/ritwikmac/SecondBrain/decisions](file:///Users/ritwikmac/SecondBrain/decisions) . These are the durable decisions; a nightly job imports them into a knowledge graph.

| File | What it is |
|---|---|
| [2026-08-24-humain-eval-first-mockups-yasir.md](file:///Users/ritwikmac/SecondBrain/decisions/2026-08-24-humain-eval-first-mockups-yasir.md) | Yasir pivots the developer journey to eval first; mockups route through him. | |
| [2026-08-24-eval-tooling-research-synthesis.md](file:///Users/ritwikmac/SecondBrain/decisions/2026-08-24-eval-tooling-research-synthesis.md) | Phoenix, LangSmith, Arize AX synthesis. | |
| [2026-08-25-prism-specvision-architecture-and-eval-journey.md](file:///Users/ritwikmac/SecondBrain/decisions/2026-08-25-prism-specvision-architecture-and-eval-journey.md) | Prism and SpecVision architecture and the eval journey it implies. | |
| [2026-08-26-eval-journey-v1-mockup-decisions.md](file:///Users/ritwikmac/SecondBrain/decisions/2026-08-26-eval-journey-v1-mockup-decisions.md) | V1 mockup decisions locked. | |
| [2026-08-27-eval-v2-rebuild-after-rejection.md](file:///Users/ritwikmac/SecondBrain/decisions/2026-08-27-eval-v2-rebuild-after-rejection.md) | V2 rebuild after the client rejection: breadth visible, prose hidden. | |
| [2026-08-30-eval-generic-agent-profiles.md](file:///Users/ritwikmac/SecondBrain/decisions/2026-08-30-eval-generic-agent-profiles.md) | A case is input, output, optional label, trace; no agent type. | |
| [2026-09-01-eval-prism-walkthrough-reconciliation.md](file:///Users/ritwikmac/SecondBrain/decisions/2026-09-01-eval-prism-walkthrough-reconciliation.md) | What Uday's walkthrough settled, what is ours versus Prism's, the reusable screenshot technique. | |
| [2026-09-02-eval-personal-metric-library.md](file:///Users/ritwikmac/SecondBrain/decisions/2026-09-02-eval-personal-metric-library.md) | V1 metric library is scoped to the signed-in user; zero attached on a new evaluation; no hidden LLM picks metrics; regression metrics start from a reviewed failure. Implemented through V14. | |

### Working rules learned from Ritwik, saved as memory

Root: [/Users/ritwikmac/.claude/projects/-Users-ritwikmac-Documents-Claude-Projects-Humain-AI-agent-marketplace-project-by-Turing/memory](file:///Users/ritwikmac/.claude/projects/-Users-ritwikmac-Documents-Claude-Projects-Humain-AI-agent-marketplace-project-by-Turing/memory) . Each file is one rule with the why and how. Read all six before producing anything.

| File | What it is |
|---|---|
| [MEMORY.md](file:///Users/ritwikmac/.claude/projects/-Users-ritwikmac-Documents-Claude-Projects-Humain-AI-agent-marketplace-project-by-Turing/memory/MEMORY.md) | Index of the rules below. | |
| [completion-gate-source-checklist.md](file:///Users/ritwikmac/.claude/projects/-Users-ritwikmac-Documents-Claude-Projects-Humain-AI-agent-marketplace-project-by-Turing/memory/completion-gate-source-checklist.md) | Write the source to built ledger before saying done; verify by driving, not rendering; headless over flaky panes. | |
| [deliver-local-files-not-artifact-links.md](file:///Users/ritwikmac/.claude/projects/-Users-ritwikmac-Documents-Claude-Projects-Humain-AI-agent-marketplace-project-by-Turing/memory/deliver-local-files-not-artifact-links.md) | Full absolute local path plus full live URL as clickable links, every time. No artifact links, no relative paths, no bare URLs. | |
| [explainer-format-that-works.md](file:///Users/ritwikmac/.claude/projects/-Users-ritwikmac-Documents-Claude-Projects-Humain-AI-agent-marketplace-project-by-Turing/memory/explainer-format-that-works.md) | The approved explainer shape: answer first, claims as headings, diagram with labels inside, risks visible, three column glossary, screenshots next to diagrams, clickable boxes, box labels show the act. | |
| [client-mockups-breadth-visible-prose-hidden.md](file:///Users/ritwikmac/.claude/projects/-Users-ritwikmac-Documents-Claude-Projects-Humain-AI-agent-marketplace-project-by-Turing/memory/client-mockups-breadth-visible-prose-hidden.md) | For client facing mockups, data leads every screen and rationale goes to the talk track. | |
| [yasir-humain-decision-maker.md](file:///Users/ritwikmac/.claude/projects/-Users-ritwikmac-Documents-Claude-Projects-Humain-AI-agent-marketplace-project-by-Turing/memory/yasir-humain-decision-maker.md) | Yasir is the Humain side point of command. | |

### Style and identity

| File | What it is |
|---|---|
| [writing-style.md](file:///Users/ritwikmac/Documents/Claude/writing-style.md) | Ritwik's writing style, the full version. Condensed below, but read it. | |
| [CLAUDE.md](file:///Users/ritwikmac/Documents/Claude/CLAUDE.md) | Who he is, people, terms, preferences for JIRA, Slack and doc comments. | |

### The source recording

| File | What it is |
|---|---|
| [PRISM Evaluation Platform Overview - 2026_09_01 23_30 IST - Recording.mp4](file:///Users/ritwikmac/Downloads/PRISM%20Evaluation%20Platform%20Overview%20-%202026_09_01%2023_30%20IST%20-%20Recording.mp4) | Uday Kumar Pabbathi's Prism walkthrough, 21 min 47 s, 1 Sep 2026. The transcript timestamps run about 4 min 34 s ahead of the video. Frames were sampled with ffmpeg; the screen share starts around 6 minutes in. | |

## The first message to send a takeover assistant

Paste this verbatim as the opening message:

> You are taking over the Humain ONE eval workstream from a previous assistant. Read the takeover document in full before doing anything: [2026-09-02_humain-eval_takeover-handoff_v2.md](file:///Users/ritwikmac/Documents/Claude/Projects/Humain%20AI%20agent%20marketplace%20project%20by%20Turing/2026-09-02_humain-eval_takeover-handoff_v2.md) (also at https://github.com/ritwik-turing/humain-one/blob/main/TAKEOVER.md). Follow its working rules exactly, especially the completion gate, the delivery rule, and the writing rules. The current shipped prototype is V14. Never edit a version that has been sent; copy to the next number. When I give you a task, produce the deliverable with full local and live links, and the ledger of what you built against what was asked. Confirm you have read it by telling me, in one line each, why the personal metric library is not a universal scorecard, what coverage means, why immutable run receipts matter, and why there is no pass mark.
