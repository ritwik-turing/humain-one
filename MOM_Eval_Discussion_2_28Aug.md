# Eval prototype, discussion 2. Notes from 28 Aug

Attendees: Chandrasen Bireddy, Tirthankar Talukdar, Ritesh Sinha, Sandip Parekh, Ritwik Chakradhar

Two things on the table. How Prism and Humain ALM talk to each other for evaluation, and whether the eval prototype I showed is general enough to be the product.

## 1. The Prism and Humain ALM contract

I walked through a contract based flow. Humain ALM hands Prism a dataset plus the metrics to score against, Prism runs the scoring, Prism hands results back. The metrics I used as the example were universal ones, clarity and relevance, the kind that apply to any agent output without needing a domain specific rubric written first.

Ritesh flagged the failure mode. If we submit an unbounded dataset against a fixed, abstract prompt set, we blow the context window. The prompt set is a constant. The dataset is not. So the thing that breaks first is scale, not design.

Chandrasen's answer was to batch it. Score in subsets instead of pushing the whole set through in one call. Nobody disagreed with that, but we did not settle batch size, how per batch results aggregate back into one score, or what happens when a batch fails halfway through a run.

Ownership landed here: Ritesh and I define what gets evaluated and why, Chandrasen owns how it runs.

## 2. The prototype, and the criticism of it

I showed the eval flow. Ingest from a CSV, a data warehouse, or a cloud bucket, then run metrics, then review what failed.

Ritesh's pushback was the useful part of the meeting. The prototype is too strongly typed to question and answer. Every screen assumes a question came in, an answer went out, and there is an expected answer sitting somewhere to score against. That covers a citizen support agent. It does not cover an agent that processes an image, and it does not cover a pipeline agent where the output is a sequence of steps rather than a reply.

His second point is the one that matters structurally. Prism does not know what a question is. It treats data, labels, and quality metrics as abstract entities. If Prism is abstract and our product is Q and A shaped, then our product is narrower than the platform underneath it, and every new agent type needs new screens built for it.

I am taking that one. The next version has to be generic first and Q and A second. Practically that means ingest accepts any input and output shape, metrics are declared rather than baked in, and the review screen renders whatever the trace actually contains instead of assuming there is a question field and an expected answer field.

## 3. Why the current version looks the way it does

Ritesh is right about where this has to end up. Worth recording why it is not there yet, because the reasons are constraints, not oversight.

We are building against Humain systems that are still moving. Deploy Now and Humain Code are the surfaces the eval flow has to sit next to, and their contracts are not frozen. Any abstraction I build now against an interface that changes next month is an abstraction I rewrite next month. The Q and A shape was the one case we could show end to end and get real feedback on, which is exactly what happened in this meeting.

Our understanding of Prism is second hand. We have not had a walkthrough of what it accepts, what it returns, or how it represents labels and metrics internally. Designing an abstract ingest layer without that is guessing at the shape of the other half of the contract. That is why the Udak conversation is on the list, and I would rather have it before I redraw the data model than after.

We also do not have a constant set of expectations from Humain. The agent types in scope have moved across conversations, and there is no written list saying Phase 1 has to support image agents and pipeline agents alongside Q and A. Building generic support for agent types nobody has committed to is the more expensive version of the same mistake.

So the current version is a working reference implementation of one case, not a claim that one case is all there is. Two things unblock the generic version: a proper Prism walkthrough, and a written list from Humain of which agent types Phase 1 must cover. With those, the abstract model follows quickly. Without them we are designing against a spec that has not been written yet.

## Open, not decided

- Batch size, result aggregation, and behaviour on partial batch failure.
- Which metrics are genuinely universal across agent types, and which have to be declared per agent.
- What the abstract data model is. If it is input, output, label, metric, then we should write that down and build both sides against it.
- What Prism can actually do today versus what we are assuming it can do. This is the gap I am closing with Udak.

## Next steps

- Tirthankar: engineering feasibility and expected quality outcomes for the proposed Prism and Humain ALM contract.
- Chandrasen: data plan for managing dataset quality inside context window limits.
- Ritwik: talk to Udak Kumar to get the real picture on Prism technical capabilities.
- Ritwik: roadmap for the eval flow showing how the platform handles abstract use cases, not just Q and A.
