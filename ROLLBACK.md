# Rollback guide

The approved portfolio before the interactive experience upgrade is permanently marked by:

- Stable branch: `stable/pre-interactive-upgrade-2026-10-16`
- Stable commit: `faf21d756804f047c219a02761c15a888b72a973`
- Feature branch: `feature/interactive-experience-upgrade`

## Before production approval

The feature branch is deployed only as a Vercel preview. The production branch (`main`) and its deployment remain unchanged, so rollback is simply a matter of continuing to use production.

## After a future production merge

Prefer a normal Git revert of the interactive-upgrade merge commit. This preserves history and triggers a clean Vercel deployment. If an exact historical restoration is required, deploy the stable commit above or promote its retained Vercel deployment.

The interaction upgrade is intentionally isolated in `experience-upgrade.js` and `experience-upgrade.css`, with small integration hooks in `app.js`, so it can also be removed cleanly without disturbing the underlying portfolio data or design files.
