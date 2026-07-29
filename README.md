# SolveIt to Social Media

A SolveIt project for drafting and publishing social media posts *directly*
from a dialog. X/Twitter threads and LinkedIn posts are supported.

## Setup

Clone this repository into a SolveIt folder:

```bash
git clone git@github.com:ExploringML/solveit-to-social-media.git
````

Open the cloned folder in SolveIt, then create a new dialog inside that folder
or one of its subfolders.

The project behaviour is provided by the included `CRAFT` dialog plus
`CRAFT.js` and `CRAFT.css`.

### 1. Install the publishing dependencies

Run this once in the SolveIt environment:

```bash
pip install "tweepy>=4.14,<5" "python-multipart>=0.0.9" "httpx>=0.27,<1" "Pillow>=10"
```

### 2. Configure X/Twitter

Create an app in the [X Developer Portal](https://developer.x.com/en/portal/dashboard)
and ensure it has permission to create posts.

Add these four values to SolveIt Secrets:

* `X_API_KEY`
* `X_API_SECRET`
* `X_ACCESS_TOKEN`
* `X_ACCESS_TOKEN_SECRET`

Keep these values private and do not commit them to the repository.

### 3. Configure LinkedIn

Create an app in the [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps).

Under the app's **Products** section, enable:

* **Share on LinkedIn**
* **Sign in with LinkedIn using OpenID Connect**

Generate an access token containing these permissions:

* `w_member_social`
* `openid`
* `profile`

Add the resulting token to SolveIt Secrets as:

* `LINKEDIN_ACCESS_TOKEN`

The access token allows the app to identify your LinkedIn account and publish
posts on your behalf. LinkedIn access tokens expire, so you will need to replace
the secret when the token expires or is revoked.

For normal personal posting, no other LinkedIn secrets are required.

Keep the token private and do not commit it to the repository.

### 4. Create a SolveIt dialog

Create a new SolveIt dialog in the project folder or one of its subfolders.

Click the **megaphone** icon in the SolveIt toolbar to open the
**SolveIt to Social Media** sidebar.

Use the switch beside the sidebar heading to change between X and LinkedIn.
Drafts for each platform are stored separately, so switching modes does not
discard either draft.

## Usage

### Posting to X/Twitter

1. Open the sidebar using the **megaphone** toolbar button.
2. Select **X mode** using the switch beside the sidebar heading.
3. Write the first post.
4. Press **Shift+Enter** or use the **+** button to add another post to the thread.
5. Optionally add emoji, a generated code image, or up to four media items to each post.
6. Reorder posts using the arrows and reorder attached media by dragging its thumbnails.
7. Select **Preview and post**.
8. Review every post, attachment, character count, error, and warning.
9. Confirm the live request only when the preview is correct.

### Posting to LinkedIn

1. Open the sidebar and switch to **LinkedIn mode**.
2. Write a single LinkedIn post of up to 3,000 characters.
3. Optionally attach:

   * Up to four images or GIFs; or
   * One MP4 video.
4. Select **Preview and post**.
5. Review the text and media.
6. Confirm the live request only when the preview is correct.

LinkedIn posts cannot mix images and video in the same post.

### Copying an X thread to LinkedIn

1. Build the thread in **X mode**.
2. Select the **Copy thread to LinkedIn** button beside the trash icon.
3. The thread posts are combined into one LinkedIn text block, with a blank line between each post.
4. The first four images or GIFs from the thread are copied in thread order.
5. Videos are ignored when images or GIFs are available. If the thread contains only video media, the first video is copied.
6. If the LinkedIn draft already contains text or media, confirm whether it should be replaced.
7. The sidebar switches to LinkedIn mode so you can review and edit the resulting post.
8. Select **Preview and post** when it is ready.

Copying to LinkedIn does not modify or delete the original X thread.
