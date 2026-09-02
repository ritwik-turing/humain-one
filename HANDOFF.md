# Handoff: Humain ONE eval workstream

Read this first if you are a fresh session, cloud or local. It carries everything a session on this machine knew that a clone of this repo would not.

Owner: Ritwik Chakradhar, PM at Turing, ritwik.c@turing.com. Atlassian account 6123eb593fe26c0069357e16, site turingservices.atlassian.net, cloudId d2de1b28-d027-49bb-ba65-320a8970cf8c. JIRA project HUMAIN.

## Where things are, 1 Sep 2026

All live on GitHub Pages from this repo.

- Prototype, current: https://ritwik-turing.github.io/humain-one/Eval_Journey_V5.html  (V5.1, file Eval_Journey_V5.html)
- Explainer for the team, five diagrams, fifteen embedded prototype screenshots, every box in the flow chart clickable: https://ritwik-turing.github.io/humain-one/Eval_Platform_How_It_Works.html
- Presenter playbook: https://ritwik-turing.github.io/humain-one/Eval_Cheat_Sheet.html
- Earlier versions, frozen at their own links: Eval_Journey_V4.html, V3, V2 (V2 is what Ritesh reviewed on 28 Aug), V1.
- Notes: MOM_Eval_Discussion_2_28Aug.md, Eval_Generic_Research.md, Eval_V3_Plan.md (has the build log per version at the bottom).

Version rule: never edit a version someone has been sent. Copy to the next number, leave the old file untouched.

## What the product is, in one paragraph

The Evaluate step (6 of 9) of the developer journey. A case is input, output, an optional expected answer, a trace, metadata. Input and output are lists of typed parts: text, image, video, audio, document, table, structured, raw file. There is no agent type anywhere. Every metric declares the one part it cannot work without, so whether it runs is answered per case, and coverage is a count shown on screen (accuracy 349 of 380, helpfulness 161 of 380, and so on). Developer writes what went wrong in a sentence; notes are grouped and counted; a group becomes a saved check that runs on every later job. No pass mark. The evidence pack lists every check with what happened to it, including the ones that did not run.

## What Prism actually does (Uday Kumar Pabbathi walkthrough, 1 Sep, recording reviewed)

- A metric is one of four kinds: Prompt, Deterministic, REST API, Agentic. Agents are typed by the same four. Nothing is scored by modality; a metric can only read what the agent returned, so a trace must come back in the response to be scoreable.
- No schema file. Datasets keep whatever shape they arrive in; input, expected output and metadata keys are named by hand, once per agent and dataset pairing. Every row in a run shares a shape because every row goes to the same agent.
- Media never enters the dataset. The row carries a link in metadata; the agent fetches it.
- Per job Prism reports datapoints x of y, avg and P50/P95/P99 latency, tokens in and out. Cost derives from tokens. Never show an invented per-case price.
- Evaluation = saved pairing of agent, dataset, metrics, versioned in lineages. Job = one execution. Number of runs is a native field capped at 5; Parallel Datapoints is a native toggle.
- Aggregation per metric across datapoints (average or sum) with a scale toggle. Opt-in AI Evaluation Summary per job with a model picker.
- No pass mark; AI-suggested metrics or thresholds deferred past V1 by joint decision (Ritwik + Uday).
- A Metric calibration tab exists in Create Evaluation. Not explored. Worth asking Uday.

## Open items

- Batching: batch size, how per batch results aggregate, partial batch failure. Owner Chandrasen Bireddy (Chandra). Not answered by the Uday call.
- Judge agreement against a human not run; every judge score carries that caveat.
- Two known prototype inconsistencies in V5, not fixed: (1) the checks screen "Does this check agree with you" table lists three question and answer cases from the old dataset; (2) the run comparison calls all three safety flags new since run 4 because SAFE_PREV was not updated for the mixed dataset, while the trend strip says safety was 1 last run. Both are one-line data fixes; re-capture the checks and compare screenshots in the explainer after fixing.

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

## Verification habits that caught real bugs here

Grep for the replacement text after every edit, not just the search text. Parse the JS after every change. Read every screen as plain text after rendering: a screen can render perfectly and still say something false. Re-query the DOM after every re-render. Reconcile every number against the one it should agree with (grid cells against coverage counts, compare screen against the results table). Never trust a screenshot pane that returns a blank frame; measure the DOM.
