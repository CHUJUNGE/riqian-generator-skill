---
name: riqian
description: Produce verified Chinese WeChat daily-quote candidates and, after human approval, generate an editable PowerPoint daily-sign file. Use for 公众号日签、每日金句或历史上的今天视觉稿；do not use for unverified quotes or unattended publishing.
---

# Riqian

Create one editable PowerPoint WeChat daily-sign file in two explicit stages. The audience is Chinese-speaking workplace professionals and lifelong learners; writing should be calm, warm, and concrete.

## Inputs and deliverables

Accept `date` (`YYYY-MM-DD`, default to today), plus optional `topic`, `avoid_topics`, and `notes`. Read [brand-config.md](references/brand-config.md), [editorial-policy.md](references/editorial-policy.md), [typography.md](references/typography.md), and [layout-grid.md](references/layout-grid.md) before proposing or rendering work.

Stage 1 delivers exactly ten candidates in the structured fields defined by `references/editorial-policy.md`. For each, provide the proposed display copy, person/event, Chinese wording provenance, connection to the target date, two independent authoritative source URLs, and image/license decision. Do not invent a quote, translation, date, source, or licence. Exclude candidates that cannot satisfy all required evidence.

Stage 2 begins only after the employee explicitly selects a candidate and approves any changed wording. Use `assets/riqian-template-10.15.psd` as the visual reference and `references/layout-grid.md` as the exact coordinate contract. Build the editable text and image objects directly in PowerPoint. Keep the brand artwork, QR code, layout, fixed guides, and fixed footer intact. Save a new `.pptx` file named `{date}-riqian.pptx`.

## Editorial and safety gates

- Start with statutory/international/industry anniversaries, then historically meaningful events if no suitable observance exists.
- Prefer primary archives, publishers, museums, universities, foundations, and official institutions. Two sources must be genuinely independent; a model answer is never a source.
- Treat search engines and encyclopedias as discovery aids only; verify every retained claim against the documentary evidence required in `references/editorial-policy.md`.
- Use only public-domain, employee-owned, licensed, or self-generated visual assets. Record URL, licence, and rationale. If this cannot be established, use an approved non-external template treatment or reject the candidate.
- Keep display copy within the template limits and the fixed point sizes in `references/typography.md`. Ask for an edit rather than reducing type or creating an unapproved extra page.
- The production fields must use `宜{宜语}` (no colon and no space), a real verified historical-on-this-day event related to the quote, and manually prepared quote lines with semantic breaks, no terminal punctuation, and no one- or two-character line. The verified original wording always takes priority over layout: never edit, omit, reorder, or splice its words for fit. Suppressing only terminal punctuation is the approved visual convention; preserve all other original punctuation. Reject the candidate if compliant line breaks are impossible.
- Do not render, export, or imply publication approval before human selection. Never publish to a WeChat account.

## PowerPoint delivery

Generate a single editable `.pptx` directly; do not create or convert a Keynote file. Before exporting, verify the required fonts in `references/typography.md` are installed. On macOS, when any is missing and the employee has authorized it, run `scripts/install_fonts_macos.sh` to install the bundled company fonts into the employee's `~/Library/Fonts`, then verify again. The script never replaces an existing file. Otherwise stop and report the exact missing font. Never accept font substitution.

Release only after the mandatory package-level check in `references/typography.md` passes. It must verify every run's font family, bold flag, exact point size, tracking and leading where specified, plus all six unrounded source guides. A preview alone is not evidence of compliance.

Run `scripts/verify_pptx_contract.py <file.pptx>` as the final type-and-spacing gate. It fails closed if any editable text run differs from the approved font family, size, bold flag, quote tracking, metadata leading, footer tracking, or footer leading.

Do not invoke Photopea, Photoshop scripting, browser renderers, or image-generation services. A `.pptx` file is the production deliverable; export a PNG only when an employee separately requests it.
