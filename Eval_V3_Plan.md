# Eval V3 plan: making the prototype generic

Written after the 28 Aug review. Purpose is to turn Ritesh's point into a build list.

## The starting position

The scoring engine in V2 is already abstract. Metrics are layered by what input they need, not by what the agent does:

- needs only the trace (did it finish, did it loop, how long)
- needs only the output (safety, language, tone)
- needs input and output together (relevance, groundedness)
- needs a label (accuracy)
- needs repeat runs (consistency)

That layering holds for an image agent and a pipeline agent without changing. What is Q and A typed is the surface: the sample data, the table columns, and the words on the screens. So this is a surface rewrite plus one data model change, not a rebuild.

## The one change everything else follows from

Today a case is a question, an expected answer, a reply, and a trace.

It becomes: input, output, label (optional), trace, metadata. Input and output are lists of typed parts (text, file, image, structured fields, steps). Label is optional and typed, and can be absent. Each metric declares which parts it requires.

Two consequences fall straight out of that. A metric with a requirement the dataset cannot supply is shown as unavailable with the reason, instead of quietly not running. And accuracy stops being special. It is just the metric that requires a label, which is why it cannot run on live traffic.

## Screen by screen

| Screen | Change | Size |
|---|---|---|
| s1 Set up a run | Agent type selector at the top. Connector copy stops saying "questions with the answers you expect" and becomes input, output, label mapping. | Medium |
| s2 Results | Columns come from the case shape rather than being hardcoded to Question and Reply. Q and A shows question and reply, an extraction agent shows source file and extracted fields, a pipeline agent shows trigger and end state. | Medium, the real work |
| s3 What the agent did | Almost no change. A trace of steps is already shape neutral. | Small |
| s4 What went wrong | Wording only. Grouping by failure mode does not care what the input was. | Small |
| s5 Turn notes into checks | A check declares what it needs, same as a metric. Checks that need a label are marked as such. | Small |
| s6 What broke since last time | No change. Comparing runs is shape neutral. | None |
| s7 Evidence | Coverage statement gains a line naming the agent type and which metrics could not run for that type. | Small |
| s8 Submit for verification | No change. | None |
| Metric board | Group by requirement, grey out what the dataset cannot supply, show the reason on hover. | Medium |

## Build now, unblocked

1. Write the data model down as one page before touching code. Input, output, label, metric, requirement. Share it with Chandrasen so both sides build against the same four things.
2. Add a second dataset of a non Q and A agent and an agent type switch at the top of the prototype.
3. Make the results columns shape driven.
4. Make metric availability derive from requirements.

None of this needs anything from Prism or from Humain.

## Blocked, and on what

Batching, aggregation, and partial failure behaviour need the Prism walkthrough. There is a screen missing here: a run that scores 380 cases in batches should show batch progress and what happens when one batch fails, and I cannot draw that until I know what Prism returns. Blocked on Udak.

Which agent types ship in Phase 1 needs a written list from Humain. Until then I build two types, not five.

## The cheapest thing that proves the point

One switch at the top of the existing prototype that flips the whole product between a Q and A agent and a document extraction agent. Same screens, same metrics, different shapes rendered. That demonstrates the abstraction in ten seconds of clicking, which is faster than any document, and it is the thing to show at the next review.

## What I am not building

Not building generic support for five agent types before anyone has committed to five. Building the model to hold any number and shipping two. If the abstraction is right, the third type is configuration rather than code, and that is the claim worth testing at the next review.

---

## Built, 30 Aug

Everything in "Build now, unblocked" is in `Eval_Journey_V3.html`. V2 is untouched at its own link.

- **Agent switch in the top bar.** Flips the whole prototype between the Citizen Support Agent (question in, reply out) and a Document Intake Agent (document in, extracted fields out). Same nine screens, same metric layers, different shapes.
- **Profile-driven case model.** A profile declares its parts (input, output, label), what they are called, and how a case renders. The screens read the profile. Adding a third agent type is a data block, not new screens.
- **Metrics declare what they need.** Helpfulness needs a written answer, so it shows as not available on the document agent with the reason on screen. Bias needs text to vary, same. Accuracy needs a label, which is why it still cannot run on live traffic. Nothing is silently dropped.
- **Second dataset.** 212 documents, 12 curated attention cases with real traces, 25 document types, Arabic and English. Its own failure groups, its own safety findings, its own run history and regression story.
- **Per-agent state.** Notes, checks and history are stored per agent, so nothing crosses between them.

Verified: no console errors, both profiles walked across all eight screens, no leftover question-and-answer wording in document mode, results and regression screens agree with each other, no layout overflow.

Still blocked: the batching screen needs the Prism walkthrough, and the Phase 1 agent-type list needs Humain.

---

## Rebuilt, 31 Aug: modality moved onto the case

Ritwik's point in review: the input can be an image, a video, a database file, unstructured data, anything, and the output likewise. Treating that as a property of the agent is still a type system with two boxes in it. `Eval_Journey_V4.html`.

**Agent type no longer exists in the product.** A case is an input, an output, an optional expected answer and a trace. Input and output are lists of parts, and every part carries its own type: text, image, video, audio, document, table, structured payload, raw file. The switch in the top bar is gone because there is nothing to switch between.

**One dataset, 380 cases, all eight types together.** 14 worked cases spanning image to fields, video to fields, audio to text, document to fields, table to fields, table to text, structured to structured, file to text, and image to image. The rest generated so every count on screen is real.

**The results table shows both sides.** What went in and what came out, each rendered as itself. A thumbnail and dimensions for an image, a play frame and duration for a clip, a waveform and sample rate for audio, page count for a document, rows and columns for a table.

**Coverage became a count.** Every metric names the one part it cannot work without, and whether it runs is answered per case. In this run: accuracy 349 of 380, skipping 31 with no expected answer. Trustworthiness 347, skipping 33 that returned nothing. Helpfulness 161, skipping 219 where the output is not prose. Steps taken 271, skipping 109 with no reference steps. The evidence pack carries the same numbers, so a metric that quietly covered a third of the run can no longer read like one that covered all of it.

**Trajectory scoring is in** as a fourth category metric, scored against the reference steps on the case rather than against the answer. Trace steps carry OpenInference span kinds.

**Prism does the content scoring**, whatever the modality, marked on each metric. Per Ritwik, 30 Aug: assume Prism covers video and audio. That assumption lives in one field per metric, so the Prism meeting notes change data, not screens.

Verified: no console errors, all eight screens, a full 380 case run end to end, every part type rendering, no page overflow, structure reparses clean.
