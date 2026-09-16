# Making the eval product generic: what the field already settled

Research note, 31 Aug 2026. Written after Ritesh's point on 28 Aug that the prototype is too strongly typed to question and answer.

## The short answer

We do not have to invent the abstract data model. Four independent platforms converged on the same one, and none of them has a concept of agent type at all.

Braintrust: every dataset entry is `input`, an optional `expected`, and `metadata`. A scorer receives input, output, expected, metadata and the trace, and returns a number.

LangSmith: an example is `inputs` and `outputs`, both arbitrary dictionaries. The dataset itself can carry an `inputs_schema` and an `outputs_schema`. An evaluator reads `run.inputs[key]` and `example.outputs[key]` by name.

DeepEval: a test case has `input` and `actual_output` as the only mandatory fields, with `expected_output`, `context`, `tools_called` and `expected_tools` optional. Each metric declares which of those it needs through `evaluation_params`. Images are objects placed inside the input or output lists, and a multimodal case is detected by their presence rather than by a type flag on the agent.

Vertex AI and LangSmith both ship trajectory metrics that score the sequence of tool calls against a reference sequence.

So the shape is input, output, optional label, trace, metadata, with each metric declaring what it requires. That is the model to build against, and it is the same one I put into V3 last week. The useful finding is not that we were right, it is that this is standard rather than a bet, which matters when Chandrasen builds the other half of the contract.

## What we are missing

Five gaps between V3 and what the field does. Ranked by how much each one costs us with Ritesh.

**1. Agent type is still an enum in our code.** V3 has two profiles, each declaring which parts exist. No platform above has this. The dataset declares a schema, metrics declare requirements against that schema, and a new agent type needs no code at all. Ours needs a new profile block. This is the difference between two agent types and any number, and it is the exact criticism, one level deeper than I fixed it.

**2. No trajectory metrics.** This is the pipeline agent case Ritesh raised and the biggest real coverage hole. We score trace mechanics: did it finish, did it repeat a step, how long. We do not score whether the sequence of steps was the right sequence. Vertex AI and LangSmith both ship three: exact match, in-order match, and any-order match against a reference trajectory. In-order allows extra calls, any-order ignores sequence. These are label-based metrics over the trace rather than over the output, which is a category our metric layering does not currently have.

**3. Trace steps are free text.** Our steps are strings we wrote. OpenInference defines ten span kinds: LLM, EMBEDDING, CHAIN, RETRIEVER, RERANKER, TOOL, AGENT, GUARDRAIL, EVALUATOR, PROMPT. It is Apache 2.0, maintained by Arize, natively supported by Phoenix, and consumable by any OpenTelemetry backend. Adopting it costs nothing and means our trace is readable by tooling we did not write.

**4. No multi-turn shape.** DeepEval keeps single-turn and conversational cases separate, and conversational metrics cannot run on a single-turn case. Our model has one shape. A citizen conversation across five messages is a real case for this product and does not fit today.

**5. Modality sits on the agent, not on the part.** V3 says this agent takes a document. DeepEval puts the image object inside the input list and infers the rest. Theirs is right: an agent can take a document in one case and text in the next, and ours cannot express that.

## What I would change, in order

1. Replace the profile `has` flags with a dataset schema. The connector's column mapping already produces exactly this: it says which field is input, which is label, and what type each is. Make that the schema, store it with the dataset, and have `metricAvailable` check requirements against it. Two agent types become a demo of the mechanism rather than the mechanism itself.
2. Add the three trajectory metrics as a fourth metric layer: needs a reference trajectory. They sit next to accuracy, which needs a reference answer. Same rule, different part.
3. Relabel trace steps with OpenInference span kinds.
4. Add a conversational case shape and mark which metrics are conversation-only.
5. Move modality onto the part.

One and two are the ones worth doing before the next review. One answers the criticism structurally. Two closes the coverage hole he named.

## What this means for the Prism contract

If Prism treats data, labels and metrics as abstract entities, and we adopt input, output, label, trace, metadata with metric requirements declared against a schema, both sides are describing the same four things. That is what to put in front of Chandrasen before he designs batching, because the batch envelope has to carry the schema, not just the rows.

Worth flagging: the OpenTelemetry GenAI conventions are still marked Development as of July 2026, with nothing stable and no versioned release to pin to. So OpenInference now, and watch OTel rather than wait for it.

## What I did not check

Whether Prism can accept a schema at all. That is the Udak conversation, and it decides whether point one is a week or a quarter.

## Sources

- Braintrust, writing scorers: https://www.braintrust.dev/docs/evaluate/write-scorers
- LangSmith example and dataset schema: https://docs.smith.langchain.com/reference/python/schemas/langsmith.schemas.Example
- LangSmith trajectory evaluations: https://docs.langchain.com/langsmith/trajectory-evals
- DeepEval single-turn test cases: https://deepeval.com/docs/evaluation-test-cases
- DeepEval multi-turn test cases: https://deepeval.com/docs/evaluation-multiturn-test-cases
- Vertex AI agent evaluation: https://cloud.google.com/vertex-ai/generative-ai/docs/agent-engine/evaluate
- OpenInference semantic conventions: https://github.com/Arize-ai/openinference/blob/main/spec/semantic_conventions.md
- State of the OpenTelemetry GenAI conventions, July 2026: https://john-hodge.com/blog/opentelemetry-genai-semantic-conventions/
