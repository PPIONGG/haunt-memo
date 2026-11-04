# Gemini runs outside the app; drafts come back as pasted JSON

The Curator uses Gemini directly, not through an API integration, to watch each clip and draft the Synopsis, Display Title, Storytellers, Province/Place, and Tags. The repo provides a prompt template and a JSON schema, and the admin form has a "paste Gemini JSON" box that prefills the form so the Curator can review it before saving. This avoids API keys, quotas, and server-side video processing for a single-curator, low-volume workflow.

## Consequences

- The JSON schema in the repo is the contract between Gemini and the admin form, so a change to one means changing the other.
- Gemini picks Tags from the existing Tag list that the prompt includes. When a pasted Tag doesn't exist yet, the form highlights it so the Curator can confirm it before it's created.
- Scare Level and Broadcast Date are always set by the Curator, never by Gemini.
