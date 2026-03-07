---
name: stitch-sync
description: Fetches all updated screen designs and HTML code from the Stitch project (Owe) and saves them to the artifacts directory.
---

# Stitch Sync Skill

This skill allows the agent to synchronize the latest screen designs from the user's Stitch project into the local repository. 
It securely connects to the Stitch MCP server, downloads the full list of screens as a JSON file, and then executes a local Node.js script to download all images and HTML directly into the designated artifacts folder.

## Prerequisites

1. The project must have a `.agent/scripts/fetch_stitch_screens.mjs` script (already present).
2. The agent must have the `StitchMCP` integration enabled.

## How to execute this skill

When the user asks to "fetch all screens from Stitch", "sync Stitch", or similar:

1. Use the `mcp_StitchMCP_list_screens` tool with the `projectId` set to `11301907081262369590`.
2. The tool output will be saved by the system to a local temporary file (e.g., `.system_generated/steps/X/output.txt`). Note its absolute path.
3. Execute the `fetch_stitch_screens.mjs` Node script, passing the absolute path of the JSON file generated in Step 2 as an argument.

**Example Command:**
```bash
node .agent/scripts/fetch_stitch_screens.mjs "C:\Users\username\.gemini\antigravity\brain\...\.system_generated\steps\17\output.txt"
```

### Result
The script will download all `.html` and `.png` screen files into `artifacts/stitch_owe_design/`, organized by screen name.

## Other Stitch Capabilities

You can also use this skill to directly interact with the Stitch project and generate or edit screens on the fly using the available `StitchMCP` tools:

### 1. Generating New Screens
If the user asks to "create a new screen in Stitch for X":
- Use the `mcp_StitchMCP_generate_screen_from_text` tool.
- Provide the `projectId` (`11301907081262369590`) and a detailed `prompt` describing the screen design.
- The tool will generate the screen directly in the project. Afterwards, you can run the sync step above to pull it down.

### 2. Editing Existing Screens
If the user asks to "edit the login screen in Stitch to have a blue button":
- First, get the screen ID (you can find this from the list of screens or by inspecting the JSON).
- Use the `mcp_StitchMCP_edit_screens` tool.
- Provide the `projectId`, `selectedScreenIds`, and a `prompt` with the requested changes.

### 3. Generating Variants
If the user wants to see different options for a screen:
- Use the `mcp_StitchMCP_generate_variants` tool.
- Provide the `projectId`, `selectedScreenIds`, `prompt`, and `variantOptions`.

**Note:** Always remember to re-run the `fetch_stitch_screens.mjs` script after making any modifications or generating new screens so that the local `artifacts/stitch_owe_design` folder remains completely up-to-date!
