---
name: riqian
description: Produce verified Chinese WeChat daily-quote candidates and, after human approval, an editable Photoshop daily-sign PSD plus PNG from the approved template. Use for 公众号日签、每日金句或历史上的今天视觉稿；do not use for unverified quotes or unattended publishing.
---

# Riqian

Create one publication-ready WeChat daily-sign image in two explicit stages. The audience is Chinese-speaking workplace professionals and lifelong learners; writing should be calm, warm, and concrete.

## Inputs and deliverables

Accept `date` (`YYYY-MM-DD`, default to today), plus optional `topic`, `avoid_topics`, and `notes`. Read [brand-config.md](references/brand-config.md) and [template-contract.md](references/template-contract.md) before proposing or rendering work.

Stage 1 delivers exactly ten candidates. For each, provide the proposed display copy, person/event, Chinese wording provenance, connection to the target date, two independent authoritative source URLs, and image/license decision. Do not invent a quote, translation, date, source, or licence. Exclude candidates that cannot satisfy all required evidence.

Stage 2 begins only after the employee explicitly selects a candidate and approves any changed wording. Prepare a payload conforming to `references/render-payload.example.json`, preflight the template, then open `assets/photopea-runner.html` in a browser. Select the bundled PSD template and payload there; the runner downloads an editable PSD, PNG, and manifest. It does not require Photoshop to run.

## Editorial and safety gates

- Start with statutory/international/industry anniversaries, then historically meaningful events if no suitable observance exists.
- Prefer primary archives, publishers, museums, universities, foundations, and official institutions. Two sources must be genuinely independent; a model answer is never a source.
- Use only public-domain, employee-owned, licensed, or self-generated visual assets. Record URL, licence, and rationale. If this cannot be established, use an approved non-external template treatment or reject the candidate.
- Keep display copy within the template limits. Ask for an edit rather than reducing type below the configured minimum or creating an unapproved extra page.
- Do not render, export, or imply publication approval before human selection. Never publish to a WeChat account.

## Template and rendering

The bundled `assets/riqian-template-10.15.psd` is the visual source asset. The browser runner uses Photopea's Live Messaging API: it sends the PSD binary to Photopea in the browser, updates native text layers, and receives a PSD and PNG back as downloads. Do not use this renderer for confidential templates unless use of Photopea has been approved. Photoshop is optional: recipients can open the generated PSD later for manual refinement.

Run the preflight with `python3 scripts/preflight_template.py assets/riqian-template-10.15.psd`. It reports discoverable PSD XMP text layers and recognizes the supplied template's legacy aliases. It does not certify smart-object structure or visual overflow.

Use `assets/photopea-runner.html` as the production renderer. It blocks unapproved payloads, enforces two source records, uses the original template without overwriting it, and exports the new editable PSD before the PNG. `scripts/render_riqian.jsx` remains an optional Adobe Photoshop fallback for environments that prefer it.
