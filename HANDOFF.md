# Handoff: Humain ONE eval workstream

Read this first if you are a fresh session, cloud or local. It carries everything a session on this machine knew that a clone of this repo would not.

Owner: Ritwik Chakradhar, PM at Turing, ritwik.c@turing.com. Atlassian account 6123eb593fe26c0069357e16, site turingservices.atlassian.net, cloudId d2de1b28-d027-49bb-ba65-320a8970cf8c. JIRA project HUMAIN.

## Where things are, 2 Sep 2026

All live on GitHub Pages from this repo.

- Prototype, current: https://ritwik-turing.github.io/humain-one/Eval_Journey_V14.html (file Eval_Journey_V14.html). V14 preserves V13's three-state metric model and closes the full improvement loop: grouped failure, calibrated regression metric, explicit attachment, external agent change, rerun, and comparison. Regression metrics now share one source of truth across the personal library, calibration, attachment, and evidence.
- Explainer for the team, a six-box presenter flow first, the detailed screen map behind a disclosure, refreshed V10 metric-library and results imagery, and every box clickable. The last box opens compare, evidence and submit together: https://ritwik-turing.github.io/humain-one/Eval_Platform_How_It_Works.html
- Historical V9 presenter playbook: https://ritwik-turing.github.io/humain-one/Eval_Cheat_Sheet.html. Do not use its generic metric-palette talk track for V10; the current six-box explainer above replaces it.
- Earlier versions, frozen at their own links: Eval_Journey_V8.html, V7, V6, V5, V4, V3, V2 (V2 is what Ritesh reviewed on 28 Aug), V1.
- A V14 draft (Eval_Journey_V14.html) sits on Ritwik's Mac uncommitted and unshipped as of the 2 Sep evening handoff review; TAKEOVER.md step 3 says how to treat it. It is not in this repo's history until someone commits it.
- Coverage ledger, the Prism demo item by item against the current prototype: PRISM_DEMO_COVERAGE.md. Refresh it per version before calling a version done.
- State-of-the-art benchmark and V14 release bar: EVAL_STATE_OF_THE_ART_AUDIT.md.
- Notes: MOM_Eval_Discussion_2_28Aug.md, Eval_Generic_Research.md, Eval_V3_Plan.md (has the build log per version at the bottom).

Version rule: never edit a version someone has been sent. Copy to the next number, leave the old file untouched.

## What the product is, in one paragraph

The Evaluate step (6 of 9) of the developer journey. A case is input, output, an optional expected answer, a trace, metadata. Input and output are lists of typed parts: text, image, video, audio, document, table, structured, raw file. There is no agent type anywhere. Prism does not choose a universal metric set: a developer creates a Prompt, Deterministic, REST API or Agentic definition for the use case, then attaches it to an evaluation. A new evaluation starts with 0. Every attached definition declares what it needs, so coverage is a count shown on screen. The developer writes what went wrong in a sentence; notes are grouped and counted; a group becomes a saved check that runs on every later job. No pass mark. The evidence pack lists every check with what happened to it, including the ones that did not run.

## What Prism actually does (Uday Kumar Pabbathi walkthrough, 1 Sep, recording reviewed)

- A metric is one of four kinds: Prompt, Deterministic, REST API, Agentic. Agents are typed by the same four. Nothing is scored by modality; a metric can only read what the agent returned, so a trace must come back in the response to be scoreable.
- Metrics are separate from the dataset and arbitrary by use case. Prism's "Global Metrics" screen is a library of definitions, not a universal default scorecard. The developer explicitly creates or reuses definitions and attaches them to an evaluation.
- No schema file. Datasets keep whatever shape they arrive in; input, expected output and metadata keys are named by hand, once per agent and dataset pairing. Every row in a run shares a shape because every row goes to the same agent.
- Media never enters the dataset. The row carries a link in metadata; the agent fetches it.
- Per job Prism reports datapoints x of y, avg and P50/P95/P99 latency, min-to-max range, total, completion, and tokens in and out. Cost derives from tokens. Never show an invented per-case price.
- Evaluation = saved pairing of agent, dataset, metrics, versioned in lineages. Job = one execution. Number of runs is a native field capped at 5; Parallel Datapoints is a native toggle.
- Aggregation per metric across datapoints (average or sum) with a scale toggle. Opt-in AI Evaluation Summary per job with a model picker.
- No pass mark; AI-suggested metrics or thresholds deferred past V1 by joint decision (Ritwik + Uday).
- A Metric calibration tab exists in Create Evaluation. Not explored. Worth asking Uday.

## External follow-ups, not prototype omissions

- Batching: batch size, how per batch results aggregate, partial batch failure. Owner Chandrasen Bireddy (Chandra). Not answered by the Uday call.
- Judge agreement against a human not run; every judge score carries that caveat.
- V5 had two inconsistencies (agreement table showed old question and answer cases; comparison counted three new safety flags against a trend strip saying one). Both fixed in V6.

## People

- Tirthankar Talukdar, tech architect. tirthankar.t@turing.com. Escalated the timesheet gap on 1 Sep; JIRA and Jibble are now filled through 31 Aug.
- Ritesh Sinha, stakeholder on Prism and evaluation. Rejected V1 as dense and not exhaustive; said the prototype was too strongly typed to question and answer. Both fixed.
- Sandip Parekh, stakeholder.
- Chandrasen Bireddy (Chandra), eng lead, owns the technical how and batching.
- Uday Kumar Pabbathi, Prism POC. Reviewing the updated mockup; was sent a five-question pre-read that V5 has since answered.
- Yasir, Humain decision maker; eval mockups route through him.

## How Ritwik wants writing done

ASCII only: no em dashes, no en dashes, no curly quotes. No filler verbs (leveraged, ensured, drove, spearheaded, streamlined, utilized). No "Let me" preambles, no "Happy to" closers. No italic example phrases mid paragraph, no bold labels inside sentences, no rhetorical X. Y. Z. triplets. First person as him, "we" for the team. Specific: ticket IDs, dates, numbers. Honest about misses. Contractions are fine and he notices when they are absent. Working group comments are neutral observations ("can we confirm"), not asks to a named person. Slack drafts paste-ready, no preamble. Doc comments two to three sentences citing the row or story, ending in an action or question.

Deliverables: always the full absolute local path plus the full live URL, both as clickable links. Never claude.ai artifact links, never relative paths, never bare URLs in code blocks.

Explainer shape he approved: answer above the fold as a claim, one diagram with labels inside it, claim headings, risks visible not collapsed, three column glossary (plain word, what Prism calls it, what it means). Screenshots of the real product next to each diagram, captured from the prototype, embedded as base64 so the file stays standalone. Every flow chart box clickable to its screen. Box labels show the act with a concrete example, not a slogan.

Client facing mockups: data leads every screen, rationale goes to the talk track, never prose that argues on screen.

## Timesheets

JIRA worklogs go on tickets assigned to him; Sprint 8 buckets are HUMAIN-2413 (planning, standup) and HUMAIN-2424 (stakeholder, doc review), 4h each per day. If no ticket fits, create a task under HUMAIN-198 (Delivery Ops) with him as reporter and assignee. Jibble is 8h per weekday as a manual hour entry, activity Project Delivery Work, project KSA - HUMAIN ONE - HUMAIN MARKETPLACE. Jibble has no API integration here; it was filled through his logged in Chrome.

## What a cloud session cannot do

- Drive his Chrome (Jibble, anything needing his logged in browser).
- Read his local folders: ~/Documents/Claude/Projects (the canonical copy of the explainer also lives there), ~/SecondBrain (decision records), this machine's Claude memory directory. Everything decision-relevant from those is summarised above.
- Take screenshots of the prototype without a browser. Locally this was done with headless Chrome against a copy of the prototype with a small query param harness (screen, case, only=selector, wide=1). The technique is described in Eval_V3_Plan.md.

## Before calling a version done

Run `tools/selftest.sh Eval_Journey_V14.html` (or the current version). It drives the prototype headlessly, no preview pane, no server, and reconciles numbers across screens: personal-library versus attachment state, usage history, zero-metric new evaluations, all four Prism definition types, mapping against coverage, removable incompatible attachments, board against evidence pack, immutable run receipts, metric provenance, failure-to-regression causality, calibration scope, deduplicated save, attach/detach/evidence synchronization, valid metric controls, setup-tab actions, performance, cross-evaluation selection, version-drift exclusion, and unmatched-case visibility. V14's current baseline is 61/61; V13 remains 53/53 and V12 remains 44/44. Then refresh PRISM_DEMO_COVERAGE.md against the source. Ship only when both are clean.

## Verification habits that caught real bugs here

Grep for the replacement text after every edit, not just the search text. Parse the JS after every change. Read every screen as plain text after rendering: a screen can render perfectly and still say something false. Re-query the DOM after every re-render. Reconcile every number against the one it should agree with (grid cells against coverage counts, compare screen against the results table). Never trust a screenshot pane that returns a blank frame; measure the DOM.
