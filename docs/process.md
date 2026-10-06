# How I work on this

## Sprints

Each sprint is a week, Monday to Friday, except Sprint 1, which is only Wednesday to Friday. They line up with the milestones in [spec 10.4](../spec.md#104-milestones).

At the start of a sprint I check that every card in it is ready (see below), and anything that won't fit moves to the next sprint. At the end I write a review and retro in [docs/sprints](sprints/) using [the template](sprints/_template.md).

## Board

- Todo: ready to start
- In progress: I've made a branch
- Review: the PR is open
- Done: merged

I only keep one card in progress at a time. The exception is when one is stuck waiting on someone else.

## Points

I estimate in 1, 2, 3 or 5 points. If something feels bigger than a 5, I split it. I track points completed per sprint in the README and use that to plan the next sprint.

## Ready

A card is ready to start when:

- it has acceptance criteria I can check off
- it's 5 points or less
- it links to the part of the spec it implements
- whatever it depends on is done, or comes earlier in the same sprint
- if it needs someone else (the Italian reviewer, a playtester), I've already asked them

## Done

A card is done when:

- every acceptance criterion is checked
- there are tests for it and CI passes
- it's merged to `main` through a PR that says `Closes #N`
- if it changed how something works, the spec is updated too

The checklist for the whole launch is [spec 10.3](../spec.md#103-definition-of-done).

## Branches and PRs

Branches are named `chi-<issue number>-<short name>`, like `chi-036-agreement-slips`. Each one gets a PR using the template, and merging closes the issue.

## When the plan changes

- A new idea goes in [future work](../spec.md#111-future-work) in the spec, not into the current sprint.
- If MVP scope changes, I update the issue and the spec, and note why in that sprint's review.
- A real decision goes in the [decision log](../spec.md#112-decision-log).
- If a card doesn't get finished, it carries over, and I note why in the review.
