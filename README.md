# Project Linguist

Project Linguist is a teacher-reviewed multilingual learning assistant built for the OpenAI Education hackathon track. A teacher can paste a lesson or upload a text-readable PDF, select up to three target languages, review an AI-generated learning package, approve it, and print a student-ready handout.

## What works

- Pasted text and text-readable PDF input (up to 5 MB).
- One to three target languages and a reading-level setting.
- Server-side OpenAI Responses API integration using `gpt-5.6`, Structured Outputs, `reasoning.effort: "medium"`, and `store: false`.
- Explicit deterministic fixture demo when live generation is not configured or unavailable.
- Side-by-side source review, language tabs, section editing/regeneration, approval gate, and print-to-PDF export.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

To enable live generation, set `OPENAI_API_KEY` in `.env.local`. The key is used only by the server route. Without a key, select **Load sample lesson**, choose **Generate packages**, then select **Use fixture demo** if prompted.

## Quality checks

```bash
npm test
npm run lint
npm run build -- --no-lint
```

## Demo script

1. Open the app and choose **Load sample lesson**.
2. Point out the target-language choices and the teacher privacy reminder.
3. Generate the Spanish and Bahasa Indonesia packages; use the labeled fixture demo if live generation is not configured.
4. Open Spanish, compare its draft to the source, adjust a phrase, and approve it.
5. Print or save the approved package as a PDF.
6. Close on the outcome: a teacher retains control while a student gains access to the same lesson.

## Guardrails and known limitations

- AI output is a reviewable draft, not certified translation, curriculum alignment, or autonomous instruction.
- Do not upload student-identifying information.
- Image-only, scanned, password-protected, and unreadable PDFs are intentionally rejected with recovery guidance.
- The fixture demo is clearly labeled and always uses its own sample source lesson; it is never presented as live generation.

## Project documents

- [Design specification](design.md)
- [Build plan](plan.md)
- [Task breakdown](tasks.md)
