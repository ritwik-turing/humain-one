# Handoff: Humain ONE eval workstream

Read this first if you are a fresh session, cloud or local. It carries everything a session on this machine knew that a clone of this repo would not.

Owner: Ritwik Chakradhar, PM at Turing, ritwik.c@turing.com. Atlassian account 6123eb593fe26c0069357e16, site turingservices.atlassian.net, cloudId d2de1b28-d027-49bb-ba65-320a8970cf8c. JIRA project HUMAIN.

## Where things are, 4 Sep 2026

All live on GitHub Pages from this repo.

- Prototype, current: https://ritwik-turing.github.io/humain-one/Eval_Journey_V17.html (file Eval_Journey_V17.html). V17 applies the 3 Sep final-review feedback: Prompt is the recommended metric path; Code, REST API, and Evaluation agent use clear names and progressive disclosure; traces use OpenTelemetry language; and the primary loop is inspect, edit agent, deploy a new version, rerun, and compare. Prism note review and regression-metric creation remain as optional advanced analysis.
- Final sendable artifact, with the six-box source-of-truth flow, phased scope, clickable V17 screenshots, beginner run-through, and industry defenses: https://ritwik-turing.github.io/humain-one/Eval_Platform_Final_Yasser.html
- The main flowchart is now the complete presentation source material. It starts with the four product objects (agent, case, metric definition, evaluation versus job), retains six clickable decisions with an industry pattern and spoken defense in every box, and adds the full operational checklist, trust contract, and honest prototype/production boundaries inside the chart itself. A visible beginner-friendly presenter mode adds the exact 10-minute run-through: preparation, five terms, timed clicks, lines to say, five-minute fallback, claims to avoid, and closing sentence. A collapsed source appendix covers Braintrust, Arize Phoenix, LangSmith, W&B Weave, DeepEval, Promptfoo, and OpenAI trace grading using primary documentation. The appendix is citation backup; the claim is market convergence, not feature parity.
- Historical V9 presenter playbook: https://ritwik-turing.github.io/humain-one/Eval_Cheat_Sheet.html. Do not use its generic metric-palette talk track for V10; the current six-box explainer above replaces it.
- Earlier versions, frozen at their own links: Eval_Journey_V13.html through V1 (V2 is what Ritesh reviewed on 28 Aug).
- Coverage ledger, the Prism demo item by item against the current prototype: PRISM_DEMO_COVERAGE.md. Refresh it per version before calling a version done.
- State-of-the-art benchmark and V16 release bar: EVAL_STATE_OF_THE_ART_AUDIT.md.
- Notes: MOM_Eval_Discussion_2_28Aug.md, Eval_Generic_Research.md, Eval_V3_Plan.md (has the build log per version at the bottom).

Version rule: never edit a version someone has been sent. Copy to the next number, leave the old file untouched.

## What the product is, in one paragraph

The Evaluate step (6 of 9) of the developer journey. A case is input, output, an optional expected answer, an OpenTelemetry trace, and metadata. A dataset can be uploaded or connected; the Snowflake walkthrough proves that warehouse objects appear only after connection succeeds, then requires preview, import, mapping review, and confirmation. Prism does not choose a universal metric set: a developer creates or deliberately reuses a Prompt, Code, REST API, or Evaluation agent definition, checks compatibility, and attaches it. Prompt is the recommended default; Code launches for strict rules; REST API and Evaluation agent are visible but phased. Library provenance is Yours, Team metric, or HUMAIN template. Every job freezes the agent version, data, metrics, and settings. From a result, the developer inspects a case, edits the agent, deploys a new version, reruns, and compares. Prism-drafted notes and regression metrics support optional deeper analysis with human review. No pass mark. The evidence pack lists what ran, what did not, and why.

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

Run `tools/selftest.sh Eval_Journey_V17.html` (or the current version). It drives the prototype headlessly and now covers 93 contracts, including Prompt-first phasing, constrained judge output, model-gateway credentials, developer-versus-benchmark dataset size, OpenTelemetry trace fields, and the agent edit-deploy-version-rerun loop, in addition to the V16 coverage. Then run `tools/check_final_artifact.py` for the presenter entry point. V17's baseline is 93/93; frozen V16 remains 87/87. Refresh PRISM_DEMO_COVERAGE.md before shipping.

## Verification habits that caught real bugs here

Grep for the replacement text after every edit, not just the search text. Parse the JS after every change. Read every screen as plain text after rendering: a screen can render perfectly and still say something false. Re-query the DOM after every re-render. Reconcile every number against the one it should agree with (grid cells against coverage counts, compare screen against the results table). Never trust a screenshot pane that returns a blank frame; measure the DOM.
