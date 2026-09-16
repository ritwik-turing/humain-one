# Eval: what I don't know, and what I think

Ritwik, 27 Aug 2026

I rebuilt the eval prototype last night after Tuesday's feedback. Doing that made it pretty obvious what we still haven't figured out.

Two lists. First is stuff I can't answer and want help with. Second is stuff I said was open, then went and read up on, and now have an opinion about. Opinions, not decisions. Tell me if I've got any of them wrong.

---

# Part one: I need help

## 1. How does a developer know what to test?

We give everyone the same basic checks: did it answer, did it get stuck, did it leak data. Those work on any agent because they don't care what the agent does.

They also can't tell you if a permit agent quoted the wrong permit rule. Only the developer knows that. So they write their own checks on top of ours.

Problem is nothing tells them when they're done. We hand them an empty box.

Couple of things worth trying. Give them a starter list per category, built from failures we've already seen there. Or use the grouping we already do: if a run throws up five kinds of failure and they've only got checks for two, just tell them about the other three.

There's also decades of work in normal software on "are my tests good enough". Some of that should transfer. Worth someone spending a day on it.

We also need to decide whether the verifier ever sees a developer's checks or whether they stay private. That changes whether they need to be any good.

## 2. How do we judge an agent once it's live?

Before launch it's easy. We ask questions we already know the answer to, then compare. That's the accuracy score.

Live, there's no answer written down. Someone asks something, the agent replies, and nobody ever recorded what it should have said. So accuracy just doesn't work on real traffic. The prototype says this out loud now, which beats pretending, but it doesn't fix anything.

Four options:

1. Stick to checks that don't need an answer key. "Did it leak a phone number" doesn't need one. Works today, catches less.
2. Check what it said against the citizen's actual file. Strong, but we'd need read access to their records. Big ask.
3. Use what already happened. Did they ask the same thing again, give up, or end up phoning a human. Nobody has to grade anything and the tenant already has all of it. I think we're sleeping on this one.
4. Pay people to write answer keys for a sample of live conversations. Best quality, obvious cost.

1 and 3 need nobody's permission. 2 and 4 need HUMAIN to say yes first.

Someone please look at 3 properly. Cheapest real win on the list.

## 3. Saudi rules and compliance. Us or Certify?

Split it.

Eval takes whatever a computer can check on every run. Stays inside the data rules, refuses to give legal advice, quotes the right regulation, answers in Arabic when asked in Arabic.

Certify takes the human call. Is this thing fit for government use at all, plus anything that needs a lawyer to read it.

What settles it for me is that rules change. If compliance sits only in Certify, then the day a rule changes, every agent we already approved is quietly wrong and nobody finds out. Put the checkable part in Eval and we change the rule, rerun everything, and know that afternoon who's broken.

What's missing is a person. Someone has to turn Saudi policy into actual checks and keep them current as it moves. That's legal work as much as engineering, and I think it's HUMAIN's rather than ours. Until someone's name is on it, compliance is a slide, not something we do.

## 4. Conversations, not single questions

Every test case we've got is one question and one answer. Real people have conversations. Forgetting what was said three messages ago, contradicting itself later on. Those only show up across a conversation and we haven't thought about what a test case even looks like there.

Needs research before we design anything.

---

# Part two: what I think we should do

## 5. What about the fiftieth category?

The demo works because we've got 380 government questions with reviewed answers behind them. A brand new category has none of that.

Simplest way to think about it: an agent either has an accuracy score or it doesn't. Two states, nothing in between, and the screen just says which.

Day one in a new category there's no answer set, so no accuracy score. The agent still runs and still gets everything that doesn't need an answer key: did it finish, did it get stuck, did it leak data, did it reply in the right language. The screen says accuracy isn't scored in this category yet and why.

A developer can bring their own questions with the answers they expect, and get a score against those. Useful for fixing their own agent. Doesn't help anyone compare two agents though, because each developer wrote their own exam.

Then at some point someone builds the answer set for the category properly. Write 40 to 60 questions by hand off the tenant's real traffic, generate a few hundred more from those, get someone who knows the area to check a sample. That's the standard way to do it and it's well documented. Once it exists, everyone in that category is scored on the same questions.

Thing to be upfront about: comparing two agents only means anything when both were scored against the same answer set. Before that we can say an agent behaves well. We can't say it's better than the other one.

What I can't answer is who actually does the work of building an answer set per category, and how long each one takes. That's a resourcing question.

## 6. Who pays?

If developers pay per run, they'll run less. Running less breaks the whole thing.

Rule I'd use is that whoever the check protects pays for it.

Safety checks free, unlimited, we eat the cost. They're there to protect citizens and the marketplace, not the developer. Charge for them and eventually someone runs fewer times to save money, which is exactly when we need them most. I'd treat that one as non-negotiable.

Category scores free within something like a run a day per version. We want people running often, so we shouldn't price it like it's scarce.

The expensive extras stay on the developer. Bias, robustness and reliability rerun every case two to ten times, that's real compute for their benefit, and the prototype already shows the price before they commit.

Production monitoring goes on the tenant's bill, since it's protecting their citizens.

This is roughly where everyone else landed anyway. Eval tools have moved to usage pricing with a proper free tier, because charging for the basics kills adoption.

## 7. Who keeps the AI grader honest?

We only trust it because we checked it against human grades once. That check goes stale and nobody would spot it.

Owner should be whoever owns the answer set. They're the only ones who can produce human grades to compare against.

More useful than assigning it to someone is making the rot visible. Every judge shows when it was last checked against a human. Miss the window and the product itself labels it not recently checked and stops presenting it as a number worth trusting. Recheck at launch, monthly, and any time the model or the wording changes.

## 8. Who checks the thing that strips out personal data?

We copy real conversations into the test set after stripping names and numbers. If it misses one, we've just moved citizen data into an eval dataset. That's the exact thing our safety checks exist to catch, happening inside our own pipeline.

Treat it like any other agent and evaluate it with our own product.

Keep a set of real conversations tagged by hand and measure what it actually catches, by type. Two bars: 99% or better on national IDs and bank details because those are catastrophic, 95% on everything else which is the normal target. Feed it fake personal data all the time as a smoke test so problems turn up in minutes instead of in an audit. Log every strip, what type and how confident and which version of the rules, because auditors will ask and this stuff usually surfaces in audits rather than testing. And if it drops below the bar, the sampling pipeline stops by itself.

We're asking developers to prove their agents are safe. Bit rich to hold ourselves to less.

## 9. What do we do when a live agent gets worse?

Automatic action only where it's unambiguous, and never on a judge score.

New safety problem: pull it from new installs immediately, tell the developer and the tenant within the hour, leave existing installs running so nobody loses service halfway through something. Back as soon as a clean run passes.

Basics slipping, stopped finishing cases or got much slower: tell the developer, give them seven days, then mark it on the listing.

Judge score drops: show it in the history and do nothing.

That last one keeps us honest. We tell everybody judge scores are a signal and not a measurement. Suspending someone's agent over a signal would make us look silly.

---

# What I need from you

Help on the four in part one. Especially 2 and 3, because those decide what we build next.

And tell me if any of the five proposals are wrong. I feel strongest about free safety checks. Least sure about the seven day window in 9, which I picked because it sounded about right rather than because I found anything to back it up.
