# SolveIt to Social Media

A SolveIt project for drafting and publishing social media posts. X/Twitter is
currently supported; LinkedIn support is planned.

## Setup

Clone this repo into a SolveIt folder:

```bash
git clone git@github.com:ExploringML/solveit-to-social-media.git
```

Open the cloned folder in SolveIt, then create a new dialog in that folder.

The project behavior is provided by the included `CRAFT` dialog plus
`CRAFT.js` and `CRAFT.css`.

### 1. Install the publishing dependencies

Run once in the SolveIt environment:

```bash
pip install "tweepy>=4.14,<5" "python-multipart>=0.0.9"
```

### 2. Add the X app secrets

Set up a Twitter app via the developer console, then add these four values to SolveIt Secrets:

- `X_API_KEY`
- `X_API_SECRET`
- `X_ACCESS_TOKEN`
- `X_ACCESS_TOKEN_SECRET`

The setup checker (details below) reports missing secret names but never displays their values.

### 3. Create a Dialog

Create a new SolveIt dialog in the current folder or sub-folder and click the 'megaphone` icon in the toolbar to display the solveIt to social media sidebar UI.

### 4. Check the setup

After the notebook and CRAFT assets have loaded, run these utilities in order in the dialog just created:

```python
social_installation_help("x")
check_social_setup("x")
check_social_setup("x", probe=True)
social_usage_help()
```

| Call | What it does |
|---|---|
| `social_installation_help("x")` | Displays the current X installation requirements. It changes nothing. |
| `check_social_setup("x")` | Checks the local Python runtime, routes, packages, public URL, capability token, and presence of the required secret names. It does not contact X. |
| `check_social_setup("x", probe=True)` | Repeats the setup checks and makes one read-only request to verify the connected X account. It does not upload media or publish. |
| `social_usage_help()` | Displays the compact end-user workflow for composing, previewing, and publishing. |

The checks are manual and never run automatically.

## Usage

1. Click the 'megaphone' button in the SolveIt toolbar.
2. Write a post. You can press **Shift+Enter** to add another post to the thread.
3. Optionally add emoji, a generated code image, or up to four media items per post.
4. Reorder posts with the arrows and reorder media by dragging its thumbnails.
5. Open **Preview & Post to X**.
6. Review every post, attachment, character count, and warning.
7. Confirm and post the thread only when the preview is correct.
