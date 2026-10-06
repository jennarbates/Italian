# Sprint 0: Planning

Oct 6

The goal was to get the spec and backlog detailed enough that I could build without guessing, and to get the backlog into GitHub. Both are done. The spec is at v0.4 and becomes v1 once the Italian reviewer and a developer have looked at it in Sprint 1 (CHI-001, CHI-002).

## What got done

- The [spec](../../spec.md) went through five drafts, v0 to v0.4.
- The [decision log](../../spec.md#112-decision-log) has 36 decisions so far.
- The [backlog](../../backlog.md) has 85 cards and 179 points across 4 sprints.
- Everything is set up in GitHub: labels, a milestone per sprint, epics with their cards as sub-issues, blocked-by links, and the project board. A script in [github-setup](../../github-setup/) does the setup, so I can rerun it if something breaks.

## How the spec changed

- **v0.1:** Picked the name. Settled that a wrong guess loses (the official rule) and that the CPU plays smart. Chose placeholder art and Cloudflare hosting.
- **v0.2:** Cut audio and offline play. Picked the email provider, environments, stack and CI. First real calendar.
- **v0.3:** Checked every word against the *Profilo della lingua italiana* to make sure it's actually A1. Made adjective agreement mistakes soft instead of rejecting the question.
- **v0.4:** Went through the whole spec looking for holes. Switched sign-in from magic links to a 6-digit code, because on phones the link often opens in a different browser. Added a staging environment, a privacy note, a quit button, and a list of every feedback message.

After v0.4 I found three more gaps. Level 1 questions weren't excluded from ratings. The spec didn't say what happens when a question has a grammar error and an agreement error at the same time. And the privacy note left out Supabase and Cloudflare. All three are fixed in the spec and backlog.

## Scope changes

- I moved launch from Oct 22 to Oct 29. The first schedule had playtests almost on launch day, with no time to fix anything they turned up.
- Cut from the MVP: audio, offline play, Google sign-in, an in-app delete account button, and a daily limit on new words. They're all in [future work](../../spec.md#111-future-work).

## Things that went wrong

The setup script failed the first time. GitHub doesn't allow commas in label names, and two of my epic labels had them. I renamed them and reran the script, and it picked up where it stopped.

## Retro

**Went well:**

**Didn't go well:**

**Trying in Sprint 1:**
