# Security

## What this application is

Horoscode is a static site. `pnpm build` produces HTML, CSS, JavaScript, fonts, and
metadata files, and that directory is the whole deployable artifact. There is no
server, no database, no API route, no authentication, and no session.

It also collects nothing. There is no analytics vendor, no cookie, no local storage,
no session storage, and no IndexedDB — the five picks live in the URL and nowhere
else. The assertion harness greps the sources for each of those on every run, and a
second harness checks the built output. So there is no user data here to breach.

That leaves a genuinely small surface, and it is worth being concrete about what is
still worth reporting:

- Anything that causes the built artifact to execute injected content — a cross-site
  scripting vector through the five URL parameters, or through the JSON-LD the page
  embeds.
- A supply-chain problem in a dependency or a pinned GitHub Action that reaches the
  published artifact.
- A workflow permission or Pages configuration issue that would let someone publish
  to the site.

## Reporting

Please report privately rather than in a public issue:

**[Open a private security advisory](https://github.com/VGTechConsulting/horoscode/security/advisories/new)**

That form is the only reporting channel, and it is visible to the maintainers only.

Include what you did, what happened, and what you expected. A link with the five
parameters set is usually the fastest reproduction.

Expect an acknowledgement within a week. This is a side project rather than a funded
product, so please size your expectations to that — but a real finding will be fixed
and credited.

## Supported versions

Only the currently deployed site at <https://horoscode.vgtc.io> and the tip of `main`.
There are no release branches and nothing older is maintained.
