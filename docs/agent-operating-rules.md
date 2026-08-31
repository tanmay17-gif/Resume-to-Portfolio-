# Agent Operating Rules

This defines HOW you (the coding agent) should behave while building this product. Read this before starting, and follow it for the entire build — not just phase 1.

## Core behavior

1. **Work in phases, in order.** Follow the phase list in the build prompt exactly. Never jump ahead to a later phase because it seems easy or related.
2. **Stop at every checkpoint.** After finishing a phase, report: (a) what you built, (b) what I should test, (c) wait for my explicit confirmation before continuing. Do not assume "it should work" is the same as confirmed working.
3. **Never fake or skip an integration.** If Supabase, Gemini, Vercel, or PostHog isn't actually connected and working, say so plainly. Do not mock data and present it as if the real integration works, unless you explicitly label it as a temporary mock and tell me it still needs to be wired up.
4. **Ask before assuming credentials.** The moment you need any account, API key, or dashboard action from me, stop mid-task and tell me exactly:
   - what to go create/sign up for
   - what value to copy
   - where it goes (which env variable)
   Then wait. Don't continue building around a missing key with a placeholder and move on silently.
5. **Report errors honestly.** If something fails (bad API key, rate limit, deployment error, schema mismatch), tell me the exact error message and what you think is causing it. Don't paper over it with a workaround that hides the real problem or silently swallow the error.
6. **Don't over-scope.** Build exactly what's specified in the build prompt, style-preset spec, and API contract files — don't add extra features, extra libraries, or "nice to haves" without asking first, even if you think they'd help.
7. **One job per agent/function.** When implementing the extraction/structuring/generation pipeline, keep each step doing only its one job and returning the exact JSON shape defined in the API contract file. Don't let steps make decisions that belong to the orchestrator.
8. **No silent schema drift.** If you find you need a field that isn't in the schema data shape (api-data-contract.md), stop and propose the addition to me before implementing it — don't just add it and continue.
9. **Test on the live deployment, not just localhost**, for anything involving auth, public links, or environment variables — these often behave differently once deployed. Confirm the live URL before marking a phase done.
10. **Keep the token/style system extensible.** Never hardcode one-off styling directly into a component for a specific style preset — it must come from the `stylePresets` config so adding style #9 later doesn't require touching component code.

## Communication style while working

- Be direct and concise in your status updates — what changed, what to test, what you need from me. No filler.
- If you're unsure whether something meets the spec, ask rather than guess and move on.
- If you think part of the plan is wrong or will cause a problem later, say so before implementing it — don't build it as-is and mention the concern afterward.

## Definition of "done" for any phase

A phase is only done when:
- The feature works on the live deployed URL (not just locally)
- I have explicitly confirmed it works
- No known integration is mocked/faked without my knowledge
- No error is being silently swallowed
