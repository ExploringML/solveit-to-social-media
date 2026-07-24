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

Add these four values to SolveIt Secrets:

- `X_API_KEY`
- `X_API_SECRET`
- `X_ACCESS_TOKEN`
- `X_ACCESS_TOKEN_SECRET`

The setup checker reports missing secret names but never displays their values.

### 3. Run the CRAFT notebook

Run the `CRAFT.ipynb` cells from top to bottom. The final installation cell
should make these calls in this order:

```python
install_social_files(rt, public_domain, app=app)
install_social_publish(rt, public_domain, app=app)
```

| Call | What it does |
|---|---|
| `install_social_files(...)` | Installs the read-only folder-media route and gives `CRAFT.js` its URL. |
| `install_social_publish(...)` | Installs the capability-protected X publishing route and gives `CRAFT.js` its URL and browser capability token. |

Both installers replace their own existing route, so rerunning the final cell
does not create duplicate routes.

### 4. Check the setup

After the notebook and CRAFT assets have loaded, run these utilities in order:

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

To return a report without displaying it:

```python
report = check_social_setup("x", display=False)
```

To display only problems and warnings:

```python
report = check_social_setup("x", include_ok=False)
```

### 5. Check the browser integration

Open the browser console in the SolveIt dialog and run:

```javascript
await solveitSocial.checkSetup()
await solveitSocial.checkSetup({ probeRoutes: true })
```

| Call | What it does |
|---|---|
| `solveitSocial.checkSetup()` | Checks the loaded sidebar, matching CSS, browser APIs, character counter, and configured endpoint URLs. It does not make a network request. |
| `solveitSocial.checkSetup({ probeRoutes: true })` | Also makes a read-only request to the folder-media route to confirm that the browser can reach the FastHTML app. |

The browser route probe does not test X credentials or publishing. Use
`check_social_setup("x", probe=True)` for the safe X account check.

Pass `{ includeOk: false }` to log only issues, or `{ log: false }` to receive
the structured report without writing it to the console:

```javascript
const report = await solveitSocial.checkSetup({
  probeRoutes: true,
  includeOk: false,
  log: false,
})
```

## Usage

1. Open the megaphone button in the SolveIt toolbar.
2. Write a post, or press **Shift+Enter** to add another post to the thread.
3. Add emoji, a generated code image, or up to four media items per post.
4. Reorder posts with the arrows and reorder media by dragging its thumbnails.
5. Open **Preview & Post to X**.
6. Review every post, attachment, character count, and warning.
7. Confirm only when the preview is correct.

## Browser utilities

The sidebar UI is the normal way to use the project. These browser-console
utilities are available for development and testing:

| Call | What it does |
|---|---|
| `solveitSocial.countText(text)` | Returns X character-count metrics, including `weightedLength`, `valid`, and whether the result is approximate. |
| `solveitSocial.serializeThread()` | Returns the current thread as a structured payload. |
| `solveitSocial.validateThread()` | Validates the current thread and returns its errors, warnings, and per-post metrics. |
| `solveitSocial.saveDraft()` | Immediately saves the current draft to browser storage. |
| `solveitSocial.preview()` | Opens the sidebar directly in preview mode. |
| `await solveitSocial.publish()` | Opens preview and starts the publishing flow; the user must still confirm the live, paid API request. |
