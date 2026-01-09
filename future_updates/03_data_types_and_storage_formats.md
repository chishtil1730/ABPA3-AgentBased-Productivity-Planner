# Data Types & Storage Formats

## Core Data Structures
The system standardizes on JSON arrays for structured data:

- **Flowcharts** → JSON Array
- **Kanban Boards** → JSON Array
- **Voice Notes** → JSON Array + raw `.wav` audio
- **Summaries** → `.wav` audio file

## Additional Supported Media
- Images stored in **AVIF** format for efficiency and quality.

## Rationale
- JSON arrays enable easy diffing, syncing, and version control.
- Raw WAV files preserve audio fidelity for processing and archival.
