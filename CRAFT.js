/* SolveIt to Social Media — CRAFT.js
   Sections: 1.0 setup · 2.0 dialog media/state · 3.0 model/validation/storage
             4.0 emoji · 5.0 media picker · 5.2 media lightbox · 5.5 code images
             6.0 composer · 7.0 preview/publish
             8.0 rendering/events/bootstrap
   Loaded by SolveIt as a module. Keep section numbers stable. */

(() => {
  /* ===== JS 1.0 — Module constants, icons, and lifecycle ===== */
  const PANEL = 'dialog-attachment-panel', BUTTON = 'dialog-attachment-panel-btn';
  const LIMIT = 280, LINKEDIN_LIMIT = 3000;
  const EMOJI_MODULE = 'https://esm.sh/emoji-picker-element@1.29.1?bundle&target=es2020';
  const EMOJI_DATA = 'https://cdn.jsdelivr.net/npm/emoji-picker-element-data@1.8.0/en/emojibase/data.json';
  const AVATAR = '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="16" fill="#e2e8f0"/><circle cx="16" cy="12" r="5" fill="#94a3b8"/><path d="M7 28c1-7 5-10 9-10s8 3 9 10" fill="#94a3b8"/></svg>';
  const MEDIA_ICON = '<svg viewBox="0 0 24 24" class="social-icon" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="m21 15-5-5L5 19"/></svg>';
  const EMOJI_ICON = '<svg viewBox="0 0 24 24" class="social-icon" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 14.5c1 1.4 2.3 2 4 2s3-.6 4-2"/><path d="M9 9.5h.01M15 9.5h.01" stroke-width="2.5"/></svg>';
  const CODE_ICON = '<svg viewBox="0 0 24 24" class="social-icon" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 5l-4 14"/></svg>';
  const MOVE_UP_ICON = '<svg viewBox="0 0 20 20" class="social-move-icon" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 16V4M5.5 8.5 10 4l4.5 4.5"/></svg>';
  const MOVE_DOWN_ICON = '<svg viewBox="0 0 20 20" class="social-move-icon" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 4v12m-4.5-4.5L10 16l4.5-4.5"/></svg>';
  const ADD_ICON = '<svg viewBox="0 0 16 16" class="social-add-icon" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M8 4v8M4 8h8"/></svg>';
  const X_ICON = '<svg class="social-x-icon" viewBox="0 0 1200 1227" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="currentColor" d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"/></svg>';
  const LINKEDIN_ICON = '<svg class="social-linkedin-icon" width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><rect width="24" height="24" rx="2.5" fill="#0A66C2"/><path fill="#fff" d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V8.98h3.42v1.57h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.29ZM5.32 7.41a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.04H3.54V8.98H7.1v11.47Z"/></svg>';
  const PLAY_ICON = '<svg viewBox="0 0 24 24" class="social-icon" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="#0f172a" fill-opacity=".72" stroke="white"/><path d="m10 8.5 5.5 3.5-5.5 3.5Z" fill="white"/></svg>';
  const FOLDER_ICON = '<svg viewBox="0 0 24 24" class="social-folder-icon" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M3.5 7.5h6l2-2h9v13h-17Z"/><path d="M3.5 9.5h17"/></svg>';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const DIALOG_NAME = new URLSearchParams(location.search).get('name') || $('#dlg_name')?.value || location.pathname;
  const STORAGE_KEY = `solveit-social:v1:${DIALOG_NAME}`;
  const LINKEDIN_STORAGE_KEY = `solveit-social:linkedin:v1:${DIALOG_NAME}`;
  const PLATFORM_STORAGE_KEY = `solveit-social:platform:v1:${DIALOG_NAME}`;
  const CODE_SETTINGS_KEY = 'solveit-social:code-settings:v1';
  const uid = () => crypto.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  const newPost = () => ({ clientId: uid(), text: '', media: [] });
  const signature = value => `${value.length}:${value.slice(0, 64)}:${value.slice(-64)}`;
  const hashRef = value => {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
    return (hash >>> 0).toString(36);
  };

  window.__solveitSocialAbort?.abort();
  const lifecycle = new AbortController();
  window.__solveitSocialAbort = lifecycle;
  document.getElementById(PANEL)?.remove();
  document.getElementById(BUTTON)?.remove();
  document.getElementById('linkedin-post-panel-btn')?.remove();

  /* ===== JS 2.0 — Dialog media discovery and runtime state ===== */
  function collectDialogMedia() {
    const media = [], seen = new Set();
    const add = (src, name, kind, msgId = '', suppliedRef = '') => {
      if (!src || !/^(data:(image|video)\/|blob:|https?:\/\/)/.test(src)) return;
      const ref = suppliedRef || (/^https?:\/\//.test(src) ? `url:${src}` :
        `${msgId ? `message:${msgId}` : 'temporary'}:${hashRef(signature(src))}`);
      const id = `dialog:${ref}`;
      if (seen.has(id)) return;
      if (kind === 'image' && /(?:^data:image\/gif|\.gif(?:[?#]|$))/i.test(src)) kind = 'gif';
      seen.add(id);
      media.push({ id, ref, src, name: name || `${kind} ${media.length + 1}`, kind,
        source: 'dialog', msgId, altText: '', temporary: ref.startsWith('temporary:') });
    };
    for (const item of posts.flatMap(post => post.media).filter(item => item.source === 'generated')) {
      if (seen.has(item.id)) continue;
      seen.add(item.id); media.push(item);
    }
    const attachments = (items, prefix) => {
      for (const [name, value] of Object.entries(items || {}))
        for (const [mime, data] of Object.entries(value?.data || value || {}))
          if (/^(image|video)\//.test(mime) && typeof data === 'string')
            add(`data:${mime};base64,${data}`, `${prefix}: ${name}`, mime.split('/')[0], '',
              `attachment:${prefix}:${name}:${hashRef(`${mime}:${signature(data)}`)}`);
    };
    window.Jupyter?.notebook?.get_cells?.().forEach((cell, index) => {
      attachments(cell.attachments, `Cell ${index + 1}`);
      attachments(cell.model?.get?.('attachments'), `Cell ${index + 1}`);
    });
    $$('main img, main video').forEach((element, index) => {
      const kind = element.tagName === 'VIDEO' ? 'video' : 'image';
      if (element.closest(`#${PANEL}`) || (kind === 'image' &&
          (element.naturalWidth || element.width) < 24 && (element.naturalHeight || element.height) < 24)) return;
      const card = element.closest('[data-sm]'), owner = card || element.closest('[id^="_"]');
      const src = element.currentSrc || element.src || element.getAttribute('src');
      add(src,
          element.alt || element.title || element.dataset.filename || `Rendered ${kind} ${index + 1}`,
          kind, card?.id || owner?.id?.replace(/-(?:i|o)$/, ''), owner ? '' :
            (/^https?:\/\//.test(src || '') ? `url:${src}` : `temporary:${hashRef(signature(src || ''))}`));
    });
    return media;
  }

  let platform = (() => {
    try { return localStorage.getItem(PLATFORM_STORAGE_KEY) === 'linkedin' ? 'linkedin' : 'x'; }
    catch (_) { return 'x'; }
  })(), panel, ui, areaSizer, posts = [newPost()], activePost = 0, viewMode = 'edit';
  let mediaOpen = false, mediaTab = 'dialog', mediaStatus = '', emojiOpen = false, codeOpen = false;
  let lightboxState = null, suppressMediaClickUntil = 0;
  let folderPath = '', folderParent = null, folderMedia = [], folderLoading = false, folderRequest = 0;
  let emojiPickerCtor = customElements.get('emoji-picker'), emojiPickerPromise, emojiLoading = false, emojiError = '', emojiSelection = [0, 0];
  let parseTweet = typeof window.SOLVEIT_TWITTER_TEXT === 'function' ? window.SOLVEIT_TWITTER_TEXT : window.SOLVEIT_TWITTER_TEXT?.parseTweet;
  let hydrated = false, saveTimer, storageStatus = '', storageListeners = false;
  let publishState = { status: 'idle' }, publishing = false;
  const platformState = new Map();
  let counterStatus = parseTweet ? '' : 'X character counts are approximate while the official counter loads.';
  let codeDraft = { code: '', title: '', language: 'python', theme: 'dark', fontSize: 'auto', columns: 'auto', imageSize: '1200x675',
    lineNumbers: true, wrapLines: false, snippets: [], sourceIndex: -1, sourceKey: '', sourceBacked: false,
    selectionKeys: [], fit: null };
  const closeTools = () => { mediaOpen = emojiOpen = codeOpen = false; };

  const isLinkedIn = () => platform === 'linkedin';
  const currentLimit = () => isLinkedIn() ? LINKEDIN_LIMIT : LIMIT;
  const currentStorageKey = () => isLinkedIn() ? LINKEDIN_STORAGE_KEY : STORAGE_KEY;
  const platformSnapshot = () => ({ posts, activePost, viewMode, publishState, hydrated, storageStatus });
  function applyPlatform(next, state = {}) {
    platform = next;
    posts = state.posts || [newPost()];
    activePost = state.activePost || 0;
    viewMode = state.viewMode || 'edit';
    publishState = state.publishState || { status: 'idle' };
    hydrated = state.hydrated || false;
    storageStatus = state.storageStatus || '';
  }
  function stashPlatform() {
    platformState.set(platform, platformSnapshot());
  }
  function loadPlatform(next) {
    applyPlatform(next, platformState.get(next));
  }
  function ensureHydrated() {
    if (!hydrated) { restoreDraft(); hydrated = true; }
  }
  function withPlatform(next, action) {
    if (platform === next) { ensureHydrated(); return action(); }
    const previous = platform, previousState = platformSnapshot();
    platformState.set(previous, previousState);
    loadPlatform(next);
    ensureHydrated();
    try { return action(); }
    finally {
      platformState.set(next, platformSnapshot());
      applyPlatform(previous, previousState);
    }
  }
  function savePlatformDraft(next) {
    if (platform === next) { ensureHydrated(); return writeDraft(); }
    const pending = saveTimer;
    saveTimer = undefined;
    try { return withPlatform(next, writeDraft); }
    finally { saveTimer = pending; }
  }

  /* ===== JS 3.0 — Post models, validation, and draft persistence ===== */
  function countText(text) {
    const normalized = String(text ?? '').normalize('NFC');
    try {
      const result = parseTweet?.(normalized);
      if (Number.isFinite(result?.weightedLength)) {
        let correction = 0;
        if (Intl.Segmenter && /\p{Extended_Pictographic}/u.test(normalized)) {
          const urls = [...normalized.matchAll(/(?:https?:\/\/|www\.)\S+/giu)].map(match => [match.index, match.index + match[0].length]);
          for (const part of new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(normalized)) {
            if (!/\p{Extended_Pictographic}/u.test(part.segment) || urls.some(([start, end]) => part.index >= start && part.index < end)) continue;
            correction += 2 - parseTweet(part.segment).weightedLength;
          }
        }
        const weightedLength = result.weightedLength + correction;
        return { ...result, weightedLength, valid: result.valid || correction < 0 && result.weightedLength > LIMIT && weightedLength <= LIMIT, approximate: false };
      }
    } catch (_) {}
    return { weightedLength: [...normalized].length, valid: true, approximate: true };
  }

  function countLinkedInText(text) {
    return { weightedLength: [...String(text ?? '').normalize('NFC')].length, valid: true, approximate: false };
  }
  const countCurrentText = text => isLinkedIn() ? countLinkedInText(text) : countText(text);

  function serializeMedia(item, persist = false) {
    const value = {
      ref: item.ref, source: item.source, kind: item.kind, name: item.name,
      path: item.path || '', msgId: item.msgId || '', altText: item.altText || ''
    };
    if (/^(?:https?:\/\/|\/)/.test(item.src || '')) value.previewUrl = item.src;
    if (persist && item.generator) value.generator = item.generator;
    if (item.temporary) value.temporary = true;
    if (item.missing) value.missing = true;
    return value;
  }

  function serializeThread({ persist = false } = {}) {
    return {
      schemaVersion: 1, platform: 'x', postType: posts.length === 1 ? 'single' : 'thread',
      charLimit: LIMIT, characterCounting: parseTweet ? 'twitter-text@3.1.0+emoji-correction' : 'approximate', dialogName: DIALOG_NAME,
      posts: posts.map(post => ({ clientId: post.clientId, text: post.text,
        media: post.media.map(item => serializeMedia(item, persist)) }))
    };
  }

  function serializeLinkedInPost({ persist = false } = {}) {
    const post = posts[0] || newPost();
    return {
      schemaVersion: 1, platform: 'linkedin', postType: 'single',
      charLimit: LINKEDIN_LIMIT, characterCounting: 'unicode-code-points', dialogName: DIALOG_NAME,
      posts: [{ clientId: post.clientId, text: post.text,
        media: post.media.map(item => serializeMedia(item, persist)) }]
    };
  }
  const serializeCurrent = options => isLinkedIn() ? serializeLinkedInPost(options) : serializeThread(options);

  function validateThread(payload = serializeThread()) {
    const errors = [], warnings = [], results = payload.posts.map((post, postIndex) => {
      const metrics = countText(post.text || ''), media = post.media || [], number = postIndex + 1;
      const add = (list, code, message, mediaIndex) => list.push({ code, postIndex, ...(mediaIndex === undefined ? {} : { mediaIndex }), message });
      if (!(post.text || '').trim() && !media.length) add(errors, 'EMPTY_POST', `Post ${number} is empty.`);
      if (metrics.weightedLength > payload.charLimit)
        add(errors, 'POST_TOO_LONG', `Post ${number} is ${metrics.weightedLength - payload.charLimit} characters over.`);
      if (!metrics.approximate && !metrics.valid && metrics.weightedLength <= payload.charLimit && post.text)
        add(errors, 'INVALID_TEXT', `Post ${number} contains text X cannot accept.`);
      if (media.length > 4) add(errors, 'TOO_MANY_MEDIA', `Post ${number} has more than four media items.`);
      const refs = new Set();
      media.forEach((item, mediaIndex) => {
        if (!item.ref || item.missing) add(errors, 'MISSING_MEDIA', `Post ${number} has media that is no longer available.`, mediaIndex);
        else if (refs.has(item.ref)) add(errors, 'DUPLICATE_MEDIA', `Post ${number} contains the same media twice.`, mediaIndex);
        else refs.add(item.ref);
      });
      const temporary = media.filter(item => item.temporary).length;
      if (temporary) add(warnings, 'TEMPORARY_MEDIA', `Post ${number} contains ${temporary} temporary media item${temporary === 1 ? '' : 's'} that may not survive a reload.`);
      return { weightedLength: metrics.weightedLength, remaining: payload.charLimit - metrics.weightedLength, approximate: metrics.approximate };
    });
    if (counterStatus) warnings.push({ code: 'APPROXIMATE_COUNT', message: counterStatus });
    if (storageStatus) warnings.push({ code: 'DRAFT_STORAGE', message: storageStatus });
    return { valid: !errors.length, posts: results, errors, warnings };
  }

  function validateLinkedInPost(payload = serializeLinkedInPost()) {
    const errors = [], warnings = [], post = payload.posts?.[0] || { text: '', media: [] };
    const metrics = countLinkedInText(post.text), media = post.media || [];
    const add = (list, code, message, mediaIndex) =>
      list.push({ code, postIndex: 0, ...(mediaIndex === undefined ? {} : { mediaIndex }), message });
    if (!Array.isArray(payload.posts) || payload.posts.length !== 1)
      add(errors, 'SINGLE_POST_REQUIRED', 'LinkedIn publishing requires exactly one post.');
    if (!(post.text || '').trim() && !media.length) add(errors, 'EMPTY_POST', 'Post is empty.');
    if (metrics.weightedLength > LINKEDIN_LIMIT)
      add(errors, 'POST_TOO_LONG', `Post is ${metrics.weightedLength - LINKEDIN_LIMIT} characters over.`);
    if (media.length > 4) add(errors, 'TOO_MANY_MEDIA', 'This composer supports up to four images or one video for LinkedIn.');
    const videos = media.filter(item => item.kind === 'video');
    if (videos.length > 1 || videos.length && media.length > 1)
      add(errors, 'MIXED_MEDIA', 'LinkedIn posts can contain images or one video, not a mixture.');
    const refs = new Set();
    media.forEach((item, mediaIndex) => {
      if (!['image', 'gif', 'video'].includes(item.kind) || linkedInMediaFormatIssue(item))
        add(errors, 'UNSUPPORTED_MEDIA', 'LinkedIn supports images, GIFs, or one MP4 video.', mediaIndex);
      if (!item.ref || item.missing) add(errors, 'MISSING_MEDIA', 'The post has media that is no longer available.', mediaIndex);
      else if (refs.has(item.ref)) add(errors, 'DUPLICATE_MEDIA', 'The post contains the same media twice.', mediaIndex);
      else refs.add(item.ref);
      if ([...String(item.altText || '')].length > 4086)
        add(errors, 'ALT_TEXT_TOO_LONG', 'LinkedIn image alt text must be 4,086 characters or fewer.', mediaIndex);
    });
    const temporary = media.filter(item => item.temporary).length;
    if (temporary) add(warnings, 'TEMPORARY_MEDIA',
      `The post contains ${temporary} temporary media item${temporary === 1 ? '' : 's'} that may not survive a reload.`);
    if (storageStatus) warnings.push({ code: 'DRAFT_STORAGE', message: storageStatus });
    return { valid: !errors.length,
      posts: [{ weightedLength: metrics.weightedLength, remaining: LINKEDIN_LIMIT - metrics.weightedLength, approximate: false }],
      errors, warnings };
  }
  const validateCurrent = payload => isLinkedIn() ? validateLinkedInPost(payload) : validateThread(payload);

  function resolveSavedMedia(saved, catalogue) {
    if (saved.generator?.type === 'code-image') return makeCodeMedia(saved.generator, saved.ref);
    const current = catalogue.get(saved.ref);
    if (current) return { ...current, altText: saved.altText || '' };
    const src = /^(?:https?:\/\/|\/)/.test(saved.previewUrl || '') ? saved.previewUrl : '';
    const prefix = `${saved.source || 'saved'}:`;
    return { ...saved, id: saved.ref?.startsWith(prefix) ? saved.ref : `${prefix}${saved.ref}`, src, missing: !src };
  }

  function restoreDraft() {
    try {
      const saved = JSON.parse(localStorage.getItem(currentStorageKey()) || 'null');
      if (!saved || saved.schemaVersion !== 1 || saved.platform !== platform ||
          saved.dialogName !== DIALOG_NAME || !Array.isArray(saved.posts)) return;
      const catalogue = new Map(collectDialogMedia().map(item => [item.ref, item]));
      const restored = saved.posts.map(post => ({ clientId: post.clientId || uid(), text: String(post.text || ''),
        media: Array.isArray(post.media) ? post.media.map(item => resolveSavedMedia(item, catalogue)) : [] }));
      if (restored.length) posts = isLinkedIn() ? [restored[0]] : restored;
      activePost = Math.max(0, Math.min(Number(saved.ui?.activePost) || 0, posts.length - 1));
    } catch (_) {
      storageStatus = 'The saved draft could not be restored.';
    }
  }

  function writeDraft() {
    if (!hydrated) return;
    clearTimeout(saveTimer);
    try {
      localStorage.setItem(currentStorageKey(), JSON.stringify({ ...serializeCurrent({ persist: true }), savedAt: Date.now(), ui: { activePost } }));
      if (storageStatus.startsWith('Draft changes')) storageStatus = '';
    } catch (_) {
      storageStatus = 'Draft changes could not be saved in this browser.';
    }
  }
  function queueSave() { clearTimeout(saveTimer); saveTimer = setTimeout(writeDraft, 300); }

  function refreshCounters() {
    if (!ui) return;
    if (viewMode === 'preview') return renderPreview();
    $$('[data-post]', ui.posts).forEach((row, index) => {
      if (index === activePost) updatePost(row, posts[index].text);
      else {
        const over = countCurrentText(posts[index].text).weightedLength - currentLimit();
        $('[data-activate-post]', row).ariaLabel = `Edit post ${index + 1}${over > 0 ? `, ${over} characters over limit` : ''}`;
      }
    });
  }

  function loadCounter() {
    if (parseTweet) return refreshCounters();
    import('https://esm.sh/twitter-text@3.1.0/dist/esm/parseTweet.js?bundle&target=es2020').then(module => {
      const parser = module.default || module.parseTweet;
      if (typeof parser !== 'function') throw new Error('parseTweet export missing');
      if (!lifecycle.signal.aborted) { parseTweet = parser; counterStatus = ''; refreshCounters(); }
    }).catch(() => {
      counterStatus = 'X character counts are approximate; validate again before posting.';
      refreshCounters();
    });
  }

  /* ===== JS 4.0 — Emoji picker ===== */
  async function loadEmojiPicker() {
    if (emojiPickerCtor) return renderEmojiPicker();
    if (emojiPickerPromise) return emojiPickerPromise;
    emojiLoading = true;
    emojiError = '';
    renderEmojiPicker();
    const loader = window.SOLVEIT_EMOJI_PICKER_LOADER || (() => import(EMOJI_MODULE));
    emojiPickerPromise = Promise.resolve().then(loader).then(module => {
      emojiPickerCtor = module?.Picker || module?.default || (typeof module === 'function' ? module : customElements.get('emoji-picker'));
      if (typeof emojiPickerCtor !== 'function') throw new Error('Emoji picker export missing');
    }).catch(() => {
      emojiError = 'Emoji picker could not be loaded.';
      emojiPickerPromise = null;
    }).finally(() => {
      emojiLoading = false;
      if (emojiOpen && !lifecycle.signal.aborted) renderEmojiPicker();
    });
    return emojiPickerPromise;
  }

  function insertEmoji(unicode) {
    if (!unicode) return;
    const row = $(`[data-post="${activePost}"]`, ui.posts), area = $('textarea', row);
    area.setSelectionRange(...emojiSelection);
    area.setRangeText(unicode, ...emojiSelection, 'end');
    emojiSelection = [area.selectionStart, area.selectionEnd];
    area.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: unicode }));
    area.focus({ preventScroll: true });
  }

  function closeEmojiPicker(focus = false) {
    emojiOpen = false;
    const host = $('[data-emoji-panel]', ui.posts), button = $('[data-toggle-emoji]', ui.posts);
    if (host) host.hidden = true;
    button?.setAttribute('aria-expanded', 'false');
    if (!focus) return;
    const area = $(`[data-post="${activePost}"] .social-post-editor`, ui.posts);
    area?.focus({ preventScroll: true });
    area?.setSelectionRange(...emojiSelection);
  }

  function renderEmojiPicker() {
    const host = $('[data-emoji-panel]', ui.posts), body = $('[data-emoji-body]', host);
    if (!emojiOpen || !host || host.hidden || !body) return;
    if (emojiLoading) return body.innerHTML = '<p class="social-emoji-state">Loading emoji…</p>';
    if (emojiError) return body.innerHTML = `<p class="social-emoji-state">${emojiError}<button type="button" class="social-emoji-retry" data-retry-emoji>Retry</button></p>`;
    if (!emojiPickerCtor) return loadEmojiPicker();
    if ($('[data-emoji-picker]', body)) return;
    const picker = new emojiPickerCtor({ dataSource: EMOJI_DATA });
    picker.dataset.emojiPicker = '';
    picker.classList.add('light');
    picker.addEventListener('emoji-click', event => insertEmoji(event.detail?.unicode));
    picker.addEventListener('keydown', event => {
      event.stopPropagation();
      if (event.key === 'Escape') closeEmojiPicker(true);
    });
    picker.addEventListener('keyup', event => event.stopPropagation());
    body.replaceChildren(picker);
  }

  /* ===== JS 5.0 — Media rendering, selection, and folder browsing ===== */
  function mediaElement(item, classes) {
    if (!item.src) {
      const missing = document.createElement('span');
      missing.className = `${classes} social-missing-media`;
      missing.textContent = '!';
      missing.title = 'Media unavailable';
      return missing;
    }
    const element = document.createElement(item.kind === 'video' ? 'video' : 'img');
    element.className = classes;
    element.src = item.src;
    element.draggable = false;
    if (item.kind === 'video') {
      element.muted = true;
      element.playsInline = true;
      element.preload = 'metadata';
    } else {
      element.alt = '';
      element.loading = 'lazy';
    }
    return element;
  }

  function renderPostMedia(row, post, active) {
    const host = $('[data-post-media]', row);
    if (!post.media.length) return host.remove();
    host.className = 'social-post-media';
    for (const [index, item] of post.media.entries()) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `social-post-thumb${active ? '' : ' social-dim'}`;
      card.dataset.previewMedia = index;
      card.dataset.previewPost = post.clientId;
      card.ariaLabel = `Preview ${item.name || `media ${index + 1}`}`;
      card.title = active ? 'Preview media · drag to reorder' : 'Preview media';
      card.appendChild(mediaElement(item, 'social-cover'));
      if (item.kind === 'video') card.insertAdjacentHTML('beforeend', `<span class="social-overlay">${PLAY_ICON}</span>`);
      if (active) {
        card.draggable = true;
        card.dataset.mediaIndex = index;
      }
      host.appendChild(card);
    }
  }

  function renderMediaPicker() {
    const picker = $('[data-media-picker]', ui.posts);
    if (!picker) return;
    picker.setAttribute('aria-busy', String(folderLoading));
    const selected = new Set(posts[activePost].media.map(item => item.id));
    $('[data-media-count]', picker).textContent = `${selected.size} selected`;
    $$('[data-media-tab]', picker).forEach(tab => {
      const active = tab.dataset.mediaTab === mediaTab;
      tab.setAttribute('aria-pressed', String(active));
    });

    const folderMode = mediaTab === 'folder';
    $('[data-folder-path]', picker).textContent = folderMode ? folderPath || 'Dialog folder' : 'Media in this dialog';
    const folderUp = $('[data-folder-up]', picker);
    folderUp.disabled = !folderMode || folderParent === null;
    folderUp.classList.toggle('social-invisible', folderUp.disabled);
    const folderRefresh = $('[data-folder-refresh]', picker);
    folderRefresh.disabled = !folderMode || folderLoading;
    folderRefresh.classList.toggle('social-invisible', !folderMode);
    folderRefresh.classList.toggle('social-spin', folderLoading);

    const items = mediaTab === 'dialog' ? collectDialogMedia() : folderMedia;
    const grid = $('[data-media-grid]', picker);
    const cards = items.map(item => {
      if (item.kind === 'folder') {
        const folder = document.createElement('button');
        folder.type = 'button';
        folder.dataset.folderPath = '';
        folder._path = item.path;
        folder.className = 'social-media-choice is-folder';
        folder.innerHTML = `<span class="social-folder-symbol">${FOLDER_ICON}</span><span class="social-file-name"></span>`;
        $('span:last-child', folder).textContent = item.name;
        folder.ariaLabel = `Open folder ${item.name}`;
        folder.title = item.name;
        return folder;
      }
      const folderView = mediaTab === 'folder', isSelected = selected.has(item.id);
      const choice = document.createElement('button');
      choice.type = 'button';
      choice.dataset.mediaChoice = '';
      choice._media = item;
      choice.className = `social-media-choice${folderView ? ' is-folder' : ''}`;
      choice.setAttribute('aria-pressed', String(isSelected));
      choice.ariaLabel = `${isSelected ? 'Remove' : 'Add'} ${item.name}`;
      choice.title = isSelected ? 'Remove' : 'Add';
      const thumb = document.createElement('span');
      thumb.className = 'social-media-thumb';
      thumb.appendChild(mediaElement(item, 'social-cover'));
      if (item.kind === 'video') thumb.insertAdjacentHTML('beforeend', `<span class="social-overlay">${PLAY_ICON}</span>`);
      if (isSelected) thumb.insertAdjacentHTML('beforeend', '<span class="social-media-check">✓</span>');
      choice.append(thumb);
      if (folderView) {
        const label = document.createElement('span');
        label.className = 'social-file-name';
        label.textContent = item.name;
        label.title = item.name;
        choice.append(label);
      }
      return choice;
    });
    grid.replaceChildren(...cards);

    const empty = $('[data-media-empty]', picker), status = $('[data-media-status]', picker);
    empty.textContent = folderLoading ? 'Loading folder…' : items.length ? '' : mediaStatus ||
      (mediaTab === 'dialog' ? 'No images or videos found in this dialog.' : 'No media found in this folder.');
    empty.hidden = !empty.textContent;
    status.textContent = items.length ? mediaStatus : '';
    status.hidden = !status.textContent;
  }

  function linkedInMediaFormatIssue(item) {
    const hint = `${item.name || ''} ${item.path || ''} ${item.src || ''}`.toLowerCase();
    return item.kind === 'video' && (/\.(?:mov|m4v|webm)(?:[?#\s]|$)/.test(hint) || hint.includes('data:video/webm')) ||
      item.kind === 'image' && (/(?:\.webp(?:[?#\s]|$)|data:image\/webp)/.test(hint));
  }

  function mediaAddIssue(media, item) {
    if (!isLinkedIn()) return media.length >= 4 ? 'A post can contain up to four media items.' : '';
    if (linkedInMediaFormatIssue(item)) return 'LinkedIn supports JPEG, PNG, GIF, or MP4 media.';
    if (media.length >= 4) return 'This composer supports up to four images or one video for LinkedIn.';
    const video = item.kind === 'video', hasVideo = media.some(value => value.kind === 'video');
    if (video && media.length || !video && hasVideo)
      return 'LinkedIn posts can contain images or one video, not a mixture.';
    return '';
  }

  function toggleMedia(item) {
    const media = posts[activePost].media, scroll = $('[data-media-grid]', ui.posts)?.scrollTop || 0;
    const index = media.findIndex(value => value.id === item.id);
    let changed = false;
    mediaStatus = '';
    if (index >= 0) { media.splice(index, 1); changed = true; }
    else if ((mediaStatus = mediaAddIssue(media, item))) {}
    else { media.push({ ...item, altText: item.altText || '' }); changed = true; }
    if (!changed) return renderMediaPicker();
    queueSave();
    renderPosts();
    const grid = $('[data-media-grid]', ui.posts);
    if (grid) grid.scrollTop = scroll;
  }

  async function loadFolder(path = '') {
    const request = ++folderRequest;
    const base = window.SOLVEIT_MEDIA_API_URL || '/social-media/files';
    folderLoading = true;
    mediaStatus = '';
    renderMediaPicker();
    try {
      const url = new URL(base, location.origin);
      url.searchParams.set('path', path);
      const response = await fetch(url);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || (response.status === 404 ?
        'Run the companion media-folder route to browse files.' : `Folder request failed (${response.status}).`));
      if (request !== folderRequest) return;
      folderPath = data.path || '';
      folderParent = data.parent ?? null;
      folderMedia = (data.items || []).map(item => item.kind === 'folder' ? item : {
        ...item, id: `folder:${item.path}`, ref: `folder:${item.path}`, source: 'folder', altText: '',
        src: new URL(item.url, url.origin).href
      });
    } catch (error) {
      if (request !== folderRequest) return;
      folderMedia = [];
      mediaStatus = error.message || String(error);
    } finally {
      if (request === folderRequest) {
        folderLoading = false;
        renderMediaPicker();
      }
    }
  }

  /* ===== JS 5.2 — Attached-media lightbox ===== */
  const LIGHTBOX_PREV_ICON = '<svg viewBox="0 0 24 24" class="social-lightbox-arrow" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
  const LIGHTBOX_NEXT_ICON = '<svg viewBox="0 0 24 24" class="social-lightbox-arrow" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';

  function mediaLightboxMarkup() {
    return `<dialog class="social-lightbox" data-ui="lightbox" aria-modal="true" aria-label="Media preview"><div class="social-lightbox-shell"><button type="button" class="social-lightbox-close" data-lightbox-close aria-label="Close media preview">×</button><div class="social-lightbox-stage"><button type="button" class="social-lightbox-nav" data-lightbox-prev aria-label="Previous media">${LIGHTBOX_PREV_ICON}</button><div class="social-lightbox-frame" data-lightbox-frame></div><button type="button" class="social-lightbox-nav" data-lightbox-next aria-label="Next media">${LIGHTBOX_NEXT_ICON}</button></div><p class="social-sr-only" data-lightbox-status aria-live="polite" aria-atomic="true"></p></div></dialog>`;
  }

  const lightboxPost = () => posts.find(post => post.clientId === lightboxState?.postId);
  const pauseLightboxMedia = () => $$('video', ui?.lightbox).forEach(video => video.pause?.());

  function renderMediaLightbox() {
    const dialog = ui?.lightbox, post = lightboxPost(), media = post?.media || [];
    if (!dialog || !media.length) return closeMediaLightbox(false);
    pauseLightboxMedia();
    lightboxState.index = (lightboxState.index % media.length + media.length) % media.length;
    const item = media[lightboxState.index], element = mediaElement(item, 'social-lightbox-media');
    if (element.tagName === 'IMG') element.alt = item.altText || 'Post media';
    else if (element.tagName === 'VIDEO') { element.controls = true; element.muted = true; }
    else { element.setAttribute('role', 'img'); element.setAttribute('aria-label', 'Media unavailable'); }
    $('[data-lightbox-frame]', dialog).replaceChildren(element);
    $('[data-lightbox-status]', dialog).textContent = `${item.kind === 'video' ? 'Video' : 'Image'} ${lightboxState.index + 1} of ${media.length}`;
    $$('[data-lightbox-prev], [data-lightbox-next]', dialog).forEach(button => { button.disabled = media.length < 2; });
  }

  function openMediaLightbox(postId, index, trigger) {
    const post = posts.find(value => value.clientId === postId);
    if (!post?.media[index] || !ui?.lightbox) return;
    lightboxState = { postId, index, trigger, restoreFocus: true };
    renderMediaLightbox();
    if (ui.lightbox.open) return;
    try { ui.lightbox.showModal(); }
    catch (_) { ui.lightbox.setAttribute('open', ''); }
  }

  function moveMediaLightbox(delta) {
    if (!lightboxState) return;
    lightboxState.index += delta;
    renderMediaLightbox();
  }

  function finishMediaLightboxClose() {
    pauseLightboxMedia();
    const state = lightboxState;
    lightboxState = null;
    if (state?.restoreFocus && state.trigger?.isConnected)
      requestAnimationFrame(() => state.trigger.isConnected && state.trigger.focus({ preventScroll: true }));
  }

  function closeMediaLightbox(restoreFocus = true) {
    const dialog = ui?.lightbox;
    if (!dialog) return;
    if (lightboxState) lightboxState.restoreFocus = restoreFocus;
    if (dialog.open) {
      try { if (typeof dialog.close === 'function') return dialog.close(); }
      catch (_) {}
      dialog.removeAttribute('open');
    }
    finishMediaLightboxClose();
  }

  function wireMediaLightbox() {
    const dialog = ui.lightbox;
    dialog.addEventListener('click', event => {
      const control = event.target.closest('button');
      if (control?.hasAttribute('data-lightbox-close')) return closeMediaLightbox();
      if (control?.hasAttribute('data-lightbox-prev')) return moveMediaLightbox(-1);
      if (control?.hasAttribute('data-lightbox-next')) return moveMediaLightbox(1);
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) closeMediaLightbox();
    });
    dialog.addEventListener('keydown', event => {
      event.stopPropagation();
      const moves = { ArrowLeft: -1, ArrowRight: 1, Home: -Infinity, End: Infinity };
      if (event.key === 'Escape') { event.preventDefault(); return closeMediaLightbox(); }
      if (event.target.closest('video, input, textarea, select')) return;
      if (!(event.key in moves) || !lightboxState) return;
      event.preventDefault();
      const media = lightboxPost()?.media || [];
      if (event.key === 'Home') lightboxState.index = 0;
      else if (event.key === 'End') lightboxState.index = Math.max(0, media.length - 1);
      else lightboxState.index += moves[event.key];
      renderMediaLightbox();
    }, true);
    dialog.addEventListener('cancel', event => { event.preventDefault(); closeMediaLightbox(); });
    dialog.addEventListener('close', finishMediaLightboxClose);
    lifecycle.signal.addEventListener('abort', () => {
      pauseLightboxMedia(); lightboxState = null; dialog.remove();
    }, { once: true });
  }

  /* ===== JS 5.5 — Code image composer ===== */
  const CODE_SIZE = [1200, 675], CODE_SIZES = {
    '640x360': [640, 360], '800x450': [800, 450], '960x540': [960, 540],
    '1200x675': CODE_SIZE, '1600x900': [1600, 900]
  }, CODE_FONTS = [34, 32, 30, 28, 26, 24, 22, 20, 18, 16, 14, 12];
  const CODE_THEMES = {
    dark: { outer: ['#0f172a', '#1e293b'], card: '#111827', text: '#e2e8f0', muted: '#94a3b8', rule: '#334155', alert: '#ef4444',
      syntax: { keyword: '#c084fc', string: '#86efac', number: '#fbbf24', comment: '#64748b', type: '#67e8f9', function: '#93c5fd', tag: '#f472b6' } },
    light: { outer: ['#e2e8f0', '#f8fafc'], card: '#ffffff', text: '#0f172a', muted: '#64748b', rule: '#cbd5e1', alert: '#dc2626',
      syntax: { keyword: '#7c3aed', string: '#15803d', number: '#b45309', comment: '#64748b', type: '#0891b2', function: '#2563eb', tag: '#be185d' } }
  };
  const CODE_LANGUAGES = ['python', 'javascript', 'typescript', 'html', 'css', 'shell', 'sql', 'json', 'markdown', 'text'];
  function codeLanguage(value) {
    const language = String(value || '').trim().toLowerCase();
    if (!language) return 'python';
    return ({ py: 'python', js: 'javascript', ts: 'typescript', sh: 'shell', bash: 'shell',
      zsh: 'shell', md: 'markdown', plaintext: 'text', txt: 'text' }[language] ||
      (CODE_LANGUAGES.includes(language) ? language : 'text'));
  }
  const CODE_COLUMN_OPTIONS = Array.from({ length: 7 }, (_, index) => 40 + index * 10);
  const CODE_FONT_OPTIONS = ['auto', '34', '30', '26', '22', '18', '16'];
  const CODE_SEGMENTER = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;
  function codeSegments(value) {
    const text = String(value);
    if (CODE_SEGMENTER) return [...CODE_SEGMENTER.segment(text)].map(part =>
      ({ text: part.segment, start: part.index, end: part.index + part.segment.length }));
    let offset = 0;
    return [...text].map(part => {
      const segment = { text: part, start: offset, end: offset + part.length };
      offset = segment.end;
      return segment;
    });
  }
  const codeGraphemeCount = value => codeSegments(value).length;
  const codeColumns = value => CODE_COLUMN_OPTIONS.includes(Number(value)) ? Number(value) : 'auto';
  const codeFontSize = value => CODE_FONT_OPTIONS.includes(String(value)) ? String(value) : 'auto';
  const codeImageSize = value => Object.hasOwn(CODE_SIZES, value) ? value : '1200x675';

  function codeSettings(value = codeDraft) {
    return { theme: value.theme === 'light' ? 'light' : 'dark', fontSize: codeFontSize(value.fontSize),
      columns: codeColumns(value.columns), imageSize: codeImageSize(value.imageSize),
      lineNumbers: value.lineNumbers !== false, wrapLines: !!value.wrapLines };
  }

  function restoreCodeSettings() {
    try { Object.assign(codeDraft, codeSettings(JSON.parse(localStorage.getItem(CODE_SETTINGS_KEY) || 'null') || codeDraft)); }
    catch (_) {}
  }

  function saveCodeSettings() {
    try { localStorage.setItem(CODE_SETTINGS_KEY, JSON.stringify(codeSettings())); }
    catch (_) {}
  }

  function fencedCode(source) {
    const lines = String(source || '').replace(/\r\n?/g, '\n').split('\n'), blocks = [];
    for (let i = 0; i < lines.length; i++) {
      const open = lines[i].match(/^\s{0,3}(`{3,}|~{3,})\s*([^\s`~]*)[^\r\n]*$/);
      if (!open) continue;
      const marker = open[1][0], close = new RegExp(`^\\s{0,3}${marker}{${open[1].length},}\\s*$`), body = [];
      let end = i + 1;
      while (end < lines.length && !close.test(lines[end])) body.push(lines[end++]);
      if (end < lines.length) {
        const code = body.join('\n');
        if (code.trim()) blocks.push({ code, language: codeLanguage(open[2]) });
        i = end;
      }
    }
    return blocks;
  }

  function selectedCodeSnippets() {
    const rows = $$('#dialog-container > .editable[data-sm="primary"], #dialog-container > .editable[data-sm="secondary"]')
      .filter(row => !row.classList.contains('filter-hidden'));
    const snippets = [], seen = new Set();
    const add = (code, language, row, role, number = 1) => {
      code = String(code || '').replace(/\r\n?/g, '\n');
      if (!code.trim()) return;
      const dedupe = `${row.id}:${role}:${codeLanguage(language)}:${code}`;
      if (seen.has(dedupe)) return;
      seen.add(dedupe);
      const type = String(row._socialType || 'code').toLowerCase();
      const name = role === 'response' ? 'Prompt response block' : type === 'code' ? 'Code message' :
        `${type[0]?.toUpperCase() || ''}${type.slice(1)} code block`;
      snippets.push({ key: `${row.id}:${role}:${number}`, code, language: codeLanguage(language), msgId: row.id,
        label: `${name}${type === 'code' && role !== 'response' ? '' : ` ${number}`} · ${row.id}` });
    };
    for (const row of rows) {
      const card = row.querySelector(':scope > .msg-card.card-in[data-mtype]'), form = card?.querySelector('form[id^="form-"]');
      let type = form?.elements.namedItem('msg_type')?.value || card?.dataset.mtype || '';
      let content = form?.elements.namedItem('content')?.value || '';
      if ($('#id_')?.value === row.id && window.editor?.getValue) {
        content = window.editor.getValue();
        type = $('#msg_type')?.value || type;
      }
      row._socialType = type;
      if (type === 'code') add(content || card?.querySelector('.msg-content pre > code')?.textContent, 'python', row, 'input');
      else fencedCode(content).forEach((block, index) => add(block.code, block.language, row, 'input', index + 1));
      if (type === 'prompt') row.querySelectorAll(':scope > .msg-card.card-out .msg-content pre > code').forEach((block, index) => {
        const language = block.dataset.language || [...block.classList].find(name => /^(?:language|lang)-/.test(name))?.replace(/^(?:language|lang)-/, '');
        add(block.textContent, language, row, 'response', index + 1);
      });
    }
    return snippets;
  }

  function loadCodeSnippet(index) {
    const snippet = codeDraft.snippets[index];
    codeDraft.sourceIndex = snippet ? index : -1;
    codeDraft.sourceKey = snippet?.key || '';
    codeDraft.sourceBacked = !!snippet;
    if (snippet) {
      codeDraft.code = snippet.code;
      codeDraft.language = snippet.language;
    }
  }

  function clearSelectionBackedCode() {
    codeDraft.code = ''; codeDraft.language = 'python'; codeDraft.sourceIndex = -1;
    codeDraft.sourceKey = ''; codeDraft.sourceBacked = false; codeDraft.fit = null;
  }

  function refreshCodeSources(force = false) {
    const snippets = selectedCodeSnippets();
    const previous = new Set(codeDraft.selectionKeys), keys = snippets.map(snippet => snippet.key);
    const changed = keys.length !== codeDraft.selectionKeys.length || keys.some((key, index) => key !== codeDraft.selectionKeys[index]);
    const added = snippets.find(snippet => !previous.has(snippet.key));
    codeDraft.snippets = snippets;
    codeDraft.selectionKeys = keys;
    if (force) {
      if (codeDraft.sourceBacked) {
        const same = snippets.findIndex(snippet => snippet.key === codeDraft.sourceKey);
        if (same >= 0) loadCodeSnippet(same);
        else if (snippets.length) loadCodeSnippet(0);
        else clearSelectionBackedCode();
      } else if (!codeDraft.code.trim() && snippets.length) loadCodeSnippet(0);
      return;
    }
    if (changed) {
      if (snippets.length) loadCodeSnippet(added ? snippets.indexOf(added) : 0);
      else if (codeDraft.sourceBacked) clearSelectionBackedCode();
      return;
    }
    if (codeDraft.sourceBacked) {
      const same = snippets.findIndex(snippet => snippet.key === codeDraft.sourceKey);
      if (same >= 0) loadCodeSnippet(same);
      else clearSelectionBackedCode();
    } else if (!codeDraft.code.trim() && snippets.length) loadCodeSnippet(0);
  }

  function codeRecipe() {
    const snippet = codeDraft.snippets[codeDraft.sourceIndex];
    return { type: 'code-image', version: 5, code: codeDraft.code, title: codeDraft.title,
      language: codeLanguage(codeDraft.language), theme: codeDraft.theme === 'light' ? 'light' : 'dark',
      fontSize: codeFontSize(codeDraft.fontSize), columns: codeColumns(codeDraft.columns), imageSize: codeImageSize(codeDraft.imageSize),
      lineNumbers: !!codeDraft.lineNumbers, wrapLines: !!codeDraft.wrapLines,
      sourceMessageIds: snippet?.msgId ? [snippet.msgId] : [] };
  }

  function wrapCodeLine(line, limit) {
    const source = codeSegments(line);
    if (source.length <= limit) return [{ text: line, sourceStart: 0, sourceEnd: line.length, prefixLength: 0 }];
    const leadingLength = codeGraphemeCount(line.match(/^\s*/u)?.[0] || '');
    const indentColumns = Math.max(0, Math.min(leadingLength, limit - 8));
    const indent = source.slice(0, indentColumns).map(part => part.text).join('');
    const rows = [];
    let start = 0, continuation = false;
    while (source.length - start + (continuation ? indentColumns : 0) > limit) {
      const prefix = continuation ? indent : '', available = Math.max(1, limit - (continuation ? indentColumns : 0));
      const hardEnd = Math.min(source.length, start + available);
      const earliestBreak = continuation ? start : Math.min(hardEnd, leadingLength);
      let end = hardEnd;
      for (let index = hardEnd - 1; index >= earliestBreak; index--) {
        if (/\s/u.test(source[index].text)) { end = index + 1; break; }
      }
      if (end <= start) end = hardEnd;
      const sourceStart = source[start]?.start ?? line.length, sourceEnd = source[end - 1]?.end ?? sourceStart;
      rows.push({ text: prefix + line.slice(sourceStart, sourceEnd), sourceStart, sourceEnd, prefixLength: prefix.length });
      start = end;
      continuation = true;
    }
    const prefix = continuation ? indent : '', sourceStart = source[start]?.start ?? line.length;
    rows.push({ text: prefix + line.slice(sourceStart), sourceStart, sourceEnd: line.length, prefixLength: prefix.length });
    return rows;
  }

  function measureCode(ctx, recipe, fontSize) {
    const sourceLines = String(recipe.code || '').replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n');
    ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
    const lineHeight = Math.ceil(fontSize * 1.45), digits = String(sourceLines.length).length;
    const numberWidth = recipe.lineNumbers ? ctx.measureText('0'.repeat(digits)).width + 30 : 0;
    const width = 1040 - numberWidth, height = 500, columnLimit = codeColumns(recipe.columns);
    const wrapLimit = columnLimit === 'auto' ? Math.max(10, Math.floor(width / Math.max(1, ctx.measureText('0').width))) : columnLimit;
    const rows = sourceLines.flatMap((line, index) => {
      const parts = recipe.wrapLines ? wrapCodeLine(line, wrapLimit) :
        [{ text: line, sourceStart: 0, sourceEnd: line.length, prefixLength: 0 }];
      return parts.map((row, part) => ({ ...row, sourceIndex: index, sourceLine: part ? null : index + 1 }));
    });
    const lines = rows.map(row => row.text), sourceNumbers = rows.map(row => row.sourceLine);
    const columnOverflowLine = columnLimit === 'auto' || recipe.wrapLines ? 0 :
      sourceLines.findIndex(line => codeGraphemeCount(line) > columnLimit) + 1;
    const verticalFit = lines.length * lineHeight <= height;
    const capacityFit = recipe.fontSize !== 'auto' || columnLimit === 'auto' ||
      ctx.measureText('0'.repeat(columnLimit)).width <= width;
    let widest = verticalFit && capacityFit && !columnOverflowLine ? 0 : Infinity;
    if (Number.isFinite(widest)) {
      for (const line of lines) {
        if (line.length > 4096) { widest = Infinity; break; }
        widest = Math.max(widest, ctx.measureText(line).width);
        if (widest > width) break;
      }
    }
    return { lines, rows, sourceLines, sourceNumbers, sourceLineCount: sourceLines.length, wrappedRows: lines.length - sourceLines.length,
      fontSize, lineHeight, numberWidth, width, height, columnLimit, wrapLimit, columnOverflowLine,
      wrappedHeightOverflow: !!recipe.wrapLines && lines.length > sourceLines.length && !verticalFit,
      rowCapacity: Math.floor(height / lineHeight), ok: verticalFit && capacityFit && !columnOverflowLine && widest <= width };
  }

  const CODE_KEYWORDS = Object.fromEntries(Object.entries({
    python: 'and as assert async await break class continue def del elif else except False finally for from global if import in is lambda None nonlocal not or pass raise return True try while with yield',
    javascript: 'async await break case catch class const continue debugger default delete do else export extends false finally for from function get if import in instanceof let new null of return set static super switch this throw true try typeof var void while with yield',
    typescript: 'abstract any as asserts async await boolean break case catch class const constructor continue declare default delete do else enum export extends false finally for from function get if implements import in infer instanceof interface keyof let module namespace never new null number object of private protected public readonly require return set static string super switch symbol this throw true try type typeof undefined unique unknown var void while with yield',
    shell: 'case do done elif else esac fi for function if in select then time until while',
    sql: 'all alter and as asc between by case create delete desc distinct drop else end exists from full group having in inner insert into is join left like limit not null on or order outer right select set table then union unique update values when where with',
    json: 'false null true',
    css: 'important media supports',
    html: 'doctype'
  }).map(([language, words]) => [language, new Set(words.toLowerCase().split(' '))]));

  function fallbackCodeTokenLines(lines, language) {
    const comment = language === 'python' || language === 'shell' ? '#.*$' :
      language === 'sql' ? '--.*$' : ['javascript', 'typescript'].includes(language) ? '\\/\\/.*$|\\/\\*.*?\\*\\/' :
      language === 'css' ? '\\/\\*.*?\\*\\/' : '';
    const pattern = new RegExp([comment, '<!--.*?-->', '<\\/?[A-Za-z][^>]*?>',
      '`(?:\\\\.|[^`\\\\])*`', "'(?:\\\\.|[^'\\\\])*'", '"(?:\\\\.|[^"\\\\])*"',
      '\\b(?:0[xob][0-9a-f]+|\\d+(?:\\.\\d+)?)\\b', '\\b[A-Za-z_$][\\w$]*\\b']
      .filter(Boolean).join('|'), 'gi');
    const keywords = CODE_KEYWORDS[language] || new Set();
    return lines.map(line => {
      const tokens = []; let cursor = 0, match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(line))) {
        const text = match[0], lower = text.toLowerCase(), end = match.index + text.length;
        const type = /^(?:#|\/\/|\/\*|<!--|--)/.test(text) ? 'comment' :
          /^<\/?/.test(text) ? 'tag' : /^["'`]/.test(text) ? 'string' :
          /^(?:0[xob][0-9a-f]+|\d)/i.test(text) ? 'number' : keywords.has(lower) ? 'keyword' :
          /^[A-Z]/.test(text) ? 'type' : /^\s*\(/.test(line.slice(end)) ? 'function' : '';
        if (!type) continue;
        if (match.index > cursor) tokens.push({ offset: cursor, type: '' });
        tokens.push({ offset: match.index, type }); cursor = end;
      }
      if (cursor < line.length || !tokens.length) tokens.push({ offset: cursor, type: '' });
      return tokens;
    });
  }

  function codeTokenLines(lines, language) {
    if (language === 'text') return [];
    try {
      const tokens = window.monaco?.editor?.tokenize?.(lines.join('\n'), language);
      if (Array.isArray(tokens) && tokens.some(line => line.some(token => token.type))) return tokens;
    } catch (_) {}
    return fallbackCodeTokenLines(lines, language);
  }

  function codeTokenRows(layout, rows, language) {
    const sourceTokens = codeTokenLines(layout.sourceLines, language);
    return rows.map(row => {
      const tokens = (sourceTokens[row.sourceIndex] || []).filter(token => Number.isInteger(token?.offset) &&
        token.offset >= 0 && token.offset <= layout.sourceLines[row.sourceIndex].length).sort((a, b) => a.offset - b.offset);
      const mapped = [], add = (offset, type) => {
        if (mapped.at(-1)?.offset === offset) mapped[mapped.length - 1].type = type;
        else mapped.push({ offset, type });
      };
      if (row.prefixLength) add(0, '');
      tokens.forEach((token, index) => {
        const start = token.offset, end = tokens[index + 1]?.offset ?? layout.sourceLines[row.sourceIndex].length;
        const visibleStart = Math.max(start, row.sourceStart), visibleEnd = Math.min(end, row.sourceEnd);
        if (visibleEnd > visibleStart) add(row.prefixLength + visibleStart - row.sourceStart, token.type);
      });
      return mapped;
    });
  }

  function codeTokenColor(type, palette) {
    type = String(type || '').toLowerCase();
    const category = /comment/.test(type) ? 'comment' : /string|regexp|attribute\.value/.test(type) ? 'string' :
      /number/.test(type) ? 'number' : /keyword/.test(type) ? 'keyword' : /type|class/.test(type) ? 'type' :
      /function|method/.test(type) ? 'function' : /tag|attribute/.test(type) ? 'tag' : '';
    return palette.syntax?.[category] || palette.text;
  }

  function drawCodeLine(ctx, line, tokens, x, y, palette) {
    const safe = (Array.isArray(tokens) ? tokens : []).filter(token => Number.isInteger(token?.offset) &&
      token.offset >= 0 && token.offset <= line.length).sort((a, b) => a.offset - b.offset);
    const paint = (text, color) => {
      if (!text) return;
      ctx.fillStyle = color; ctx.fillText(text, x, y); x += ctx.measureText(text).width;
    };
    if (!safe.length) return paint(line, palette.text);
    let cursor = 0;
    safe.forEach((token, index) => {
      const start = Math.max(cursor, token.offset), end = Math.max(start, Math.min(line.length, safe[index + 1]?.offset ?? line.length));
      if (start > cursor) paint(line.slice(cursor, start), palette.text);
      if (end > start) paint(line.slice(start, end), codeTokenColor(token.type, palette));
      cursor = Math.max(cursor, end);
    });
    if (cursor < line.length) paint(line.slice(cursor), palette.text);
  }

  function drawCodeImage(canvas, recipe) {
    if (!canvas) return { ok: false, message: 'Code preview is unavailable in this browser.' };
    const imageSize = codeImageSize(recipe.imageSize), [outputWidth, outputHeight] = CODE_SIZES[imageSize];
    canvas.width = outputWidth; canvas.height = outputHeight;
    const ctx = canvas.getContext?.('2d');
    if (!ctx) return { ok: false, message: 'Code preview is unavailable in this browser.' };
    ctx.scale?.(outputWidth / CODE_SIZE[0], outputHeight / CODE_SIZE[1]);
    const palette = CODE_THEMES[recipe.theme] || CODE_THEMES.dark;
    const requested = recipe.fontSize === 'auto' ? CODE_FONTS : [Math.max(16, Math.min(40, Number(recipe.fontSize) || 28))];
    let layout;
    for (const size of requested) {
      layout = measureCode(ctx, recipe, size);
      if (layout.ok || layout.columnOverflowLine) break;
    }
    const gradient = ctx.createLinearGradient(0, 0, CODE_SIZE[0], CODE_SIZE[1]);
    gradient.addColorStop(0, palette.outer[0]); gradient.addColorStop(1, palette.outer[1]);
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, CODE_SIZE[0], CODE_SIZE[1]);
    ctx.fillStyle = palette.card; ctx.beginPath(); ctx.roundRect(32, 32, 1136, 611, 24); ctx.fill();
    ['#fb7185', '#fbbf24', '#4ade80'].forEach((color, index) => {
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(66 + index * 28, 66, 8, 0, Math.PI * 2); ctx.fill();
    });
    ctx.font = '600 20px ui-sans-serif, system-ui, sans-serif'; ctx.fillStyle = palette.muted;
    ctx.textBaseline = 'middle'; ctx.fillText(recipe.title || recipe.language || 'code', 170, 66);
    ctx.fillStyle = palette.rule; ctx.fillRect(64, 98, 1072, 1);
    ctx.save(); ctx.beginPath(); ctx.rect(64, 112, 1072, 500); ctx.clip();
    ctx.font = `${layout.fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
    ctx.textBaseline = 'top';
    const visibleCount = Math.ceil(layout.height / layout.lineHeight);
    const renderRows = layout.rows.slice(0, visibleCount).map(row =>
      ({ ...row, text: layout.ok ? row.text : row.text.slice(0, 512) }));
    const renderLines = renderRows.map(row => row.text);
    const tokenLines = Number(recipe.version || 1) >= 2 ? codeTokenRows(layout, renderRows, recipe.language) : [];
    renderLines.forEach((line, index) => {
      const y = 112 + index * layout.lineHeight;
      if (recipe.lineNumbers && layout.sourceNumbers[index] !== null) {
        ctx.fillStyle = palette.muted; ctx.textAlign = 'right';
        ctx.fillText(String(layout.sourceNumbers[index]), 64 + layout.numberWidth - 16, y);
      }
      ctx.textAlign = 'left';
      drawCodeLine(ctx, line, tokenLines[index], 64 + layout.numberWidth, y, palette);
    });
    ctx.restore();
    if (!layout.ok) {
      const warning = layout.columnOverflowLine ? `Line ${layout.columnOverflowLine} exceeds ${layout.columnLimit} columns — shorten it or choose a wider setting` :
        layout.wrappedHeightOverflow ? `Wrapping creates ${layout.lines.length} rows — only ${layout.rowCapacity} fit` :
        'Code does not fit — shorten it or use a smaller font';
      ctx.fillStyle = palette.alert; ctx.fillRect(32, 599, 1136, 44);
      ctx.fillStyle = '#fff'; ctx.font = '600 18px ui-sans-serif, system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(warning, 600, 621);
    }
    return { ...layout, imageSize, outputWidth, outputHeight,
      message: layout.ok ? `${layout.sourceLineCount} line${layout.sourceLineCount === 1 ? '' : 's'}${layout.wrappedRows ? ` · ${layout.lines.length} rendered` : ''} · ${layout.fontSize}px · ${outputWidth}×${outputHeight}` :
      layout.columnOverflowLine ? `Line ${layout.columnOverflowLine} exceeds the ${layout.columnLimit}-column limit. Shorten it or choose a wider setting.` :
      layout.wrappedHeightOverflow ? `Wrapping creates ${layout.lines.length} rows; only ${layout.rowCapacity} fit. Shorten the code, choose wider columns, or use a smaller font.` :
      'The code is too large for this image. Shorten it or choose a smaller font.' };
  }

  function makeCodeMedia(recipe, ref = `generated:code:${uid()}`, saved = {}) {
    const canvas = document.createElement('canvas'), fit = drawCodeImage(canvas, recipe);
    if (!fit.ok) return { ...saved, id: ref, ref, src: '', source: 'generated', kind: 'image',
      name: saved.name || 'code-snippet.png', generator: recipe, missing: true };
    const stem = String(recipe.title || 'code-snippet').replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 72) || 'code-snippet';
    return { ...saved, id: ref, ref, src: canvas.toDataURL('image/png'), source: 'generated', kind: 'image',
      name: saved.name || `${stem}.png`, altText: saved.altText || (recipe.title ? `Code snippet: ${recipe.title}` : 'Code snippet'),
      generator: recipe, temporary: false, missing: false };
  }

  function codeComposerMarkup() {
    const languageOptions = CODE_LANGUAGES.map(value => `<option value="${value}">${value}</option>`).join('');
    const columnOptions = ['auto', ...CODE_COLUMN_OPTIONS].map(value =>
      `<option value="${value}">${value === 'auto' ? 'Auto' : value}</option>`).join('');
    const sizeOptions = Object.entries(CODE_SIZES).map(([value, [width, height]]) =>
      `<option value="${value}">${width} × ${height}${value === '1200x675' ? ' (default)' : ''}</option>`).join('');
    return `<section id="social-code-panel" class="social-code-panel" data-code-panel aria-labelledby="social-code-title"><div class="social-code-head"><h4 id="social-code-title" class="social-code-title">Code image</h4><div class="social-code-head-actions"><button type="button" class="social-tool" data-refresh-code aria-label="Refresh sources from selected messages" title="Refresh sources from selected messages">↻</button><button type="button" class="social-tool" data-close-code aria-label="Close code image composer">×</button></div></div><div class="social-code-body"><label class="social-code-field social-code-source" data-code-source-field hidden><span>Source</span><select data-code-source></select></label><label class="social-code-field">Code<textarea class="social-code-input" data-code-input spellcheck="false" placeholder="Paste code or choose a selected snippet"></textarea></label><figure class="social-code-preview" data-code-preview><canvas width="1200" height="675" role="img" aria-label="Code image preview"></canvas></figure><details class="social-code-settings"><summary>Image settings</summary><div class="social-code-fields"><label class="social-code-field is-wide">Title (optional)<input type="text" data-code-title maxlength="80" placeholder="Code snippet"></label><label class="social-code-field">Language<select data-code-language>${languageOptions}</select></label><label class="social-code-field">Theme<select data-code-theme><option value="dark">Dark</option><option value="light">Light</option></select></label><label class="social-code-field">Font size<select data-code-font><option value="auto">Auto fit</option><option value="34">34 px</option><option value="30">30 px</option><option value="26">26 px</option><option value="22">22 px</option><option value="18">18 px</option><option value="16">16 px</option></select></label><label class="social-code-field">Output size<select data-code-size>${sizeOptions}</select></label><label class="social-code-field">Columns<select data-code-columns title="Maximum characters per rendered line">${columnOptions}</select></label><div class="social-code-checks"><label class="social-code-check"><input type="checkbox" data-code-wrap>Wrap long lines</label><label class="social-code-check"><input type="checkbox" data-code-lines>Line numbers</label></div></div></details><div class="social-code-footer"><p class="social-code-status" data-code-status aria-live="polite"></p><button type="button" class="social-code-add" data-add-code-image>Add to post</button></div></div></section>`;
  }

  function renderCodeComposer() {
    const host = $('[data-code-panel]', ui.posts);
    if (!codeOpen || !host) return;
    const sourceField = $('[data-code-source-field]', host), source = $('[data-code-source]', host);
    sourceField.hidden = !codeDraft.snippets.length;
    source.replaceChildren(new Option('Paste or edit manually', '-1'), ...codeDraft.snippets.map((snippet, index) => new Option(snippet.label, String(index))));
    source.value = String(codeDraft.sourceIndex);
    $('[data-code-input]', host).value = codeDraft.code;
    $('[data-code-title]', host).value = codeDraft.title;
    $('[data-code-language]', host).value = codeLanguage(codeDraft.language);
    $('[data-code-theme]', host).value = codeDraft.theme;
    $('[data-code-font]', host).value = codeFontSize(codeDraft.fontSize);
    $('[data-code-size]', host).value = codeImageSize(codeDraft.imageSize);
    $('[data-code-columns]', host).value = String(codeColumns(codeDraft.columns));
    $('[data-code-wrap]', host).checked = codeDraft.wrapLines;
    $('[data-code-lines]', host).checked = codeDraft.lineNumbers;
    drawCodePreview();
  }

  function drawCodePreview() {
    const host = $('[data-code-panel]', ui.posts), canvas = $('canvas', host);
    if (!host || !canvas) return;
    const fit = drawCodeImage(canvas, codeRecipe()), mediaIssue = mediaAddIssue(posts[activePost].media, { kind: 'image' });
    codeDraft.fit = fit;
    const fullMessage = !isLinkedIn() && mediaIssue ? 'Remove a media item before adding another.' : mediaIssue;
    const empty = !codeDraft.code.trim(), message = fullMessage ||
      (empty ? 'Paste code or choose a selected snippet.' : fit.message);
    const status = $('[data-code-status]', host), add = $('[data-add-code-image]', host), preview = $('[data-code-preview]', host);
    status.textContent = message; status.classList.toggle('is-error', !!mediaIssue || !empty && !fit.ok);
    preview.classList.toggle('is-overflow', !empty && !fit.ok);
    add.disabled = !!mediaIssue || empty || !fit.ok;
  }

  function attachCodeImage() {
    const post = posts[activePost];
    if (!post || mediaAddIssue(post.media, { kind: 'image' }) || !codeDraft.code.trim()) return drawCodePreview();
    const media = makeCodeMedia(codeRecipe());
    if (media.missing) return drawCodePreview();
    post.media.push(media);
    codeOpen = false;
    queueSave();
    renderPosts();
  }

  /* ===== JS 6.0 — Composer layout and thread operations ===== */
  function fitPostArea(area) {
    const css = getComputedStyle(area), line = parseFloat(css.lineHeight) || 20;
    const max = parseFloat(css.maxHeight), start = area.selectionStart, end = area.selectionEnd;
    area.rows = 1;
    const base = area.clientHeight;
    const needed = 1 + Math.max(0, Math.ceil((area.scrollHeight - base) / line));
    const cap = Number.isFinite(max) ? Math.max(1, 1 + Math.floor((max - base) / line)) : 9;
    area.rows = Math.min(needed, cap);
    if (document.activeElement === area && start !== null) area.setSelectionRange(start, end);
    if (needed <= cap) area.scrollTop = 0;
  }

  function updatePost(card, text) {
    const remaining = currentLimit() - countCurrentText(text).weightedLength, over = remaining < 0;
    const counter = $('[data-post-count]', card);
    counter.textContent = over ? `${-remaining} over` : remaining;
    counter.title = over ? `${-remaining} characters over limit` : `${remaining} characters remaining`;
    counter.setAttribute('aria-label', counter.title);
    counter.classList.toggle('is-over', over);
  }

  function addPost(index) {
    if (isLinkedIn()) return;
    posts.splice(index + 1, 0, newPost());
    activePost = index + 1;
    closeTools();
    queueSave();
    renderPosts(true);
  }

  function syncHeader() {
    const preview = viewMode === 'preview';
    ui.platformToggle.setAttribute('aria-busy', String(publishing));
    ui.platformToggle.disabled = publishing;
    ui.platformToggle.setAttribute('aria-disabled', String(publishing));
    ui.viewToggle.classList.toggle('is-edit', preview);
    if (isLinkedIn()) {
      ui.threadMeta.textContent = '1 post';
      ui.viewToggle.innerHTML = preview ? 'Edit' : LINKEDIN_ICON;
      ui.viewToggle.setAttribute('aria-label', preview ? 'Edit post' : 'Preview and post to LinkedIn');
      ui.viewToggle.setAttribute('uk-tooltip', preview ? 'Edit post' : 'Preview and post');
      ui.viewToggle.setAttribute('aria-pressed', String(preview));
      ui.viewToggle.disabled = publishing;
      ui.clearThread.disabled = publishing;
      return;
    }
    ui.threadMeta.textContent = `${posts.length} post${posts.length === 1 ? '' : 's'}`;
    ui.viewToggle.innerHTML = preview ? 'Edit' : X_ICON;
    ui.viewToggle.setAttribute('aria-label', preview ? 'Edit thread' : 'Preview and post to X');
    ui.viewToggle.setAttribute('uk-tooltip', preview ? 'Edit thread' : 'Preview and post');
    ui.viewToggle.setAttribute('aria-pressed', String(preview));
    ui.viewToggle.disabled = publishing;
    ui.clearThread.disabled = publishing;
  }

  /* ===== JS 7.0 — Preview and provider publishing ===== */
  function renderPreviewMedia(host, post) {
    const media = post.media;
    if (!media.length) return;
    const mosaic = document.createElement('div');
    mosaic.className = 'social-preview-media';
    mosaic.dataset.count = Math.min(media.length, 4);
    for (const [index, item] of media.entries()) {
      const frame = document.createElement('button');
      frame.type = 'button';
      frame.className = 'social-preview-item';
      frame.dataset.previewMedia = index;
      frame.dataset.previewPost = post.clientId;
      frame.ariaLabel = `Preview ${item.name || `media ${index + 1}`}`;
      const element = mediaElement(item, 'social-cover');
      if (element.tagName === 'IMG') element.alt = item.altText || '';
      frame.append(element);
      if (item.kind === 'video') frame.insertAdjacentHTML('beforeend', `<span class="social-overlay">${PLAY_ICON}</span>`);
      mosaic.append(frame);
    }
    host.append(mosaic);
  }

  function resetPublish() { publishState = { status: 'idle' }; }

  function liveBlockReason(validation) {
    if (!window.SOLVEIT_SOCIAL_PUBLISH_URL || !window.SOLVEIT_SOCIAL_PUBLISH_TOKEN) return 'Live endpoint unavailable.';
    if (!validation.valid) return 'Fix the preview issues first.';
    const missing = posts.findIndex(post => post.media.some(item => !item.src));
    if (missing >= 0) return `Post ${missing + 1} contains media that is no longer available.`;
    return '';
  }

  function renderPublish(validation) {
    const host = document.createElement('div'), publishButton = document.createElement('button'), publishStatus = document.createElement('p');
    const blocked = liveBlockReason(validation);
    host.className = 'social-publish'; publishButton.type = 'button'; publishButton.className = 'social-publish-button';
    publishButton.dataset.publish = '';
    if (publishing) publishButton.textContent = 'Posting…';
    else if (publishState.status === 'success') publishButton.textContent = 'Posted';
    else publishButton.innerHTML = `<span>Post to</span>${X_ICON}`;
    publishButton.setAttribute('aria-label', posts.length > 1 ? 'Post thread to X' : 'Post to X');
    publishButton.disabled = publishing || publishState.locked || !!blocked;
    publishButton.setAttribute('aria-busy', String(publishing)); publishButton.onclick = runPublish;
    publishStatus.className = `social-publish-status${publishState.status === 'error' ? ' is-error' : ''}`;
    publishStatus.dataset.publishStatus = ''; publishStatus.setAttribute('role', publishState.status === 'error' ? 'alert' : 'status');
    if (publishState.status === 'success' && publishState.data?.posts?.[0]?.url) {
      publishStatus.textContent = `${publishState.data.posts.length > 1 ? `Published ${publishState.data.posts.length} posts` : 'Published'} · `;
      const link = document.createElement('a'); link.className = 'social-publish-link'; link.href = publishState.data.posts[0].url;
      link.target = '_blank'; link.rel = 'noopener'; link.textContent = publishState.data.posts.length > 1 ? 'View thread' : 'View on X'; publishStatus.append(link);
    } else {
      publishStatus.textContent = publishState.message || blocked || '';
      if (publishState.data?.posts?.[0]?.url) {
        publishStatus.append(' ');
        const link = document.createElement('a'); link.className = 'social-publish-link'; link.href = publishState.data.posts[0].url;
        link.target = '_blank'; link.rel = 'noopener'; link.textContent = 'View published posts'; publishStatus.append(link);
      }
    }
    host.append(publishButton); if (publishStatus.textContent) host.append(publishStatus);
    return host;
  }

  function linkedInBlockReason(validation) {
    if (!window.SOLVEIT_LINKEDIN_PUBLISH_URL || !window.SOLVEIT_LINKEDIN_PUBLISH_TOKEN) return 'Live endpoint unavailable.';
    if (!validation.valid) return 'Fix the preview issues first.';
    if (posts[0]?.media.some(item => !item.src)) return 'The post contains media that is no longer available.';
    return '';
  }

  function renderLinkedInPublish(validation) {
    const host = document.createElement('div'), button = document.createElement('button'), status = document.createElement('p');
    const blocked = linkedInBlockReason(validation);
    host.className = 'social-publish'; button.type = 'button'; button.className = 'social-publish-button';
    button.dataset.publish = '';
    if (publishing) button.textContent = 'Posting…';
    else if (publishState.status === 'success')
      button.textContent = publishState.data?.complete === false ? 'Submitted' : 'Posted';
    else button.innerHTML = `<span>Post to</span>${LINKEDIN_ICON}`;
    button.setAttribute('aria-label', 'Post to LinkedIn');
    button.setAttribute('uk-tooltip', 'Post to LinkedIn');
    button.disabled = publishing || publishState.locked || !!blocked;
    button.setAttribute('aria-busy', String(publishing)); button.onclick = runLinkedInPublish;
    status.className = `social-publish-status${publishState.status === 'error' ? ' is-error' : ''}`;
    status.setAttribute('role', publishState.status === 'error' ? 'alert' : 'status');
    if (publishState.status === 'success' && publishState.data?.posts?.[0]?.url) {
      status.textContent = publishState.data.complete === false ?
        'Accepted by LinkedIn; media processing was not verified · ' : 'Published · ';
      const link = document.createElement('a'); link.className = 'social-publish-link';
      link.href = publishState.data.posts[0].url; link.target = '_blank'; link.rel = 'noopener';
      link.textContent = 'View on LinkedIn'; status.append(link);
    } else {
      status.textContent = publishState.message || blocked || '';
      if (publishState.data?.posts?.[0]?.url) {
        status.append(' ');
        const link = document.createElement('a'); link.className = 'social-publish-link';
        link.href = publishState.data.posts[0].url; link.target = '_blank'; link.rel = 'noopener';
        link.textContent = 'View on LinkedIn'; status.append(link);
      }
    }
    host.append(button); if (status.textContent) host.append(status);
    return host;
  }

  async function linkedInBlobKind(blob) {
    const bytes = new Uint8Array(await blob.slice(0, 16).arrayBuffer());
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image';
    if ([137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value)) return 'image';
    if (String.fromCharCode(...bytes.slice(0, 6)).match(/^GIF8[79]a$/)) return 'gif';
    const brand = String.fromCharCode(...bytes.slice(8, 12));
    if (String.fromCharCode(...bytes.slice(4, 8)) === 'ftyp' &&
        brand !== 'qt  ' && !brand.startsWith('M4V')) return 'video';
    return '';
  }

  async function publishBody(payload, token, caps) {
    const post = posts[0], totalMedia = post.media.length;
    payload.publishToken = token;
    if (!totalMedia) return { body: JSON.stringify(payload), totalMedia };
    const body = new FormData(); body.append('payload', JSON.stringify(payload));
    for (let mediaIndex = 0; mediaIndex < post.media.length; mediaIndex++) {
      const item = post.media[mediaIndex];
      let source;
      try { source = await fetch(item.src); } catch (_) {}
      if (!source?.ok) throw new Error(`Media ${mediaIndex + 1} could not be read.`);
      const blob = await source.blob(), limit = caps[item.kind] * 1024 * 1024;
      if (!blob.size) throw new Error(`Media ${mediaIndex + 1} is empty.`);
      if (await linkedInBlobKind(blob) !== item.kind)
        throw new Error(`Media ${mediaIndex + 1} must be a JPEG, PNG, GIF, or MP4 file.`);
      if (item.kind === 'video' && blob.size < 75 * 1024)
        throw new Error(`Media ${mediaIndex + 1} must be an MP4 of at least 75 KB.`);
      if (blob.size > limit) throw new Error(`Media ${mediaIndex + 1} is larger than ${caps[item.kind]} MB.`);
      let name = String(item.name || `${item.kind}-${mediaIndex + 1}`).replace(/[^A-Za-z0-9._-]+/g, '_').slice(0, 96) || item.kind;
      if (item.kind === 'video' && !/\.mp4$/i.test(name))
        name = `${name.replace(/\.[^.]*$/, '').slice(0, 91) || 'video'}.mp4`;
      const upload = item.kind === 'video' && blob.type !== 'video/mp4' ?
        new Blob([blob], { type: 'video/mp4' }) : blob;
      body.append(`media_0_${mediaIndex}`, upload, name);
    }
    return { body, totalMedia };
  }

  async function runLinkedInPublish() {
    const thread = serializeLinkedInPost(), validation = validateLinkedInPost(thread), blocked = linkedInBlockReason(validation);
    if (publishing || publishState.locked || blocked) return;
    const totalMedia = posts[0].media.length;
    if (!window.confirm(`Publish this post${totalMedia ? ` with ${totalMedia} media item${totalMedia === 1 ? '' : 's'}` : ''} publicly to LinkedIn now?\n\nThis cannot be undone here.`)) return;
    publishing = true; publishState = { status: 'loading', message: 'Publishing to LinkedIn…' }; renderPreview();
    let requestSent = false;
    try {
      const payload = { thread, validation, requestId: uid(),
        confirmation: { action: 'publish_to_linkedin', postCount: 1 } };
      const { body } = await publishBody(payload, window.SOLVEIT_LINKEDIN_PUBLISH_TOKEN,
        { image: 512, gif: 512, video: 500 });
      requestSent = true;
      const response = await fetch(window.SOLVEIT_LINKEDIN_PUBLISH_URL, { method: 'POST', body });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        const error = new Error(data?.error || `Publishing failed (${response.status}).`); error.data = data; throw error;
      }
      publishState = { status: 'success', data, locked: true,
        message: data.complete === false ? 'Accepted by LinkedIn; processing was not verified.' : 'Published.' };
    } catch (error) {
      const data = error.data, partial = !!data?.posts?.length;
      const unknown = requestSent && (!data || data.resultUnknown);
      publishState = { status: 'error', data, locked: partial || unknown || data?.safeToRetry === false,
        message: partial ? 'A post was created before publishing failed. Check LinkedIn before trying again.' :
          unknown ? 'Result unknown. Check LinkedIn before trying again.' : error.message || 'Publishing failed.' };
    } finally {
      publishing = false;
      if (viewMode === 'preview' && !lifecycle.signal.aborted && isLinkedIn()) renderPreview();
    }
  }

  async function runPublish() {
    const thread = serializeThread(), validation = validateThread(thread), blocked = liveBlockReason(validation);
    if (publishing || publishState.locked || blocked) return;
    const totalMedia = posts.reduce((sum, post) => sum + post.media.length, 0);
    const label = posts.length === 1 ? 'this post' : `this ${posts.length}-post thread`;
    if (!window.confirm(`Publish ${label}${totalMedia ? ` with ${totalMedia} media item${totalMedia === 1 ? '' : 's'}` : ''} publicly to X now?\n\nThis uses paid API requests and cannot be undone here.`)) return;
    publishing = true; publishState = { status: 'loading', message: 'Publishing to X…' }; renderPreview();
    let requestSent = false;
    try {
      const payload = {
        thread, validation, requestId: uid(), publishToken: window.SOLVEIT_SOCIAL_PUBLISH_TOKEN,
        confirmation: { action: 'publish_to_x', postCount: posts.length }
      };
      let body = JSON.stringify(payload);
      if (totalMedia) {
        const caps = { image: 5, gif: 15, video: 512 };
        body = new FormData(); body.append('payload', JSON.stringify(payload));
        for (let postIndex = 0; postIndex < posts.length; postIndex++) {
          for (let mediaIndex = 0; mediaIndex < posts[postIndex].media.length; mediaIndex++) {
            const item = posts[postIndex].media[mediaIndex];
            let source;
            try { source = await fetch(item.src); } catch (_) {}
            if (!source?.ok) throw new Error(`Post ${postIndex + 1}, media ${mediaIndex + 1} could not be read.`);
            const blob = await source.blob(), limit = caps[item.kind] * 1024 * 1024;
            if (!blob.size) throw new Error(`Post ${postIndex + 1}, media ${mediaIndex + 1} is empty.`);
            if (blob.size > limit) throw new Error(`Post ${postIndex + 1}, media ${mediaIndex + 1} is larger than ${caps[item.kind]} MB.`);
            const name = String(item.name || `${item.kind}-${mediaIndex + 1}`).replace(/[^A-Za-z0-9._-]+/g, '_').slice(0, 96) || item.kind;
            body.append(`media_${postIndex}_${mediaIndex}`, blob, name);
          }
        }
      }
      requestSent = true;
      const response = await fetch(window.SOLVEIT_SOCIAL_PUBLISH_URL, { method: 'POST', body });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        const error = new Error(data?.error || `Publishing failed (${response.status}).`); error.data = data; throw error;
      }
      publishState = { status: 'success', data, locked: true, message: 'Published.' };
    } catch (error) {
      const data = error.data, partial = data?.posts?.length || 0, unknown = requestSent && (!data || data.resultUnknown);
      publishState = { status: 'error', data, locked: unknown || !!partial || data?.safeToRetry === false,
        message: unknown ? 'Result unknown. Check X before trying again.' : partial ?
          `Published ${partial} of ${posts.length} posts; stopped at post ${data.failedStep}. ${error.message}` :
          error.message || 'Publishing failed.' };
    } finally {
      publishing = false;
      if (viewMode === 'preview' && !lifecycle.signal.aborted) renderPreview();
    }
  }

  function renderPreview() {
    closeMediaLightbox(false);
    areaSizer?.disconnect();
    closeTools();
    const validation = validateCurrent(), list = document.createElement('ol');
    list.className = 'social-preview-list';
    const content = [];
    if (validation.errors.length || validation.warnings.length) {
      const summary = document.createElement('p'), count = validation.errors.length + validation.warnings.length;
      summary.className = 'social-preview-summary';
      summary.setAttribute('role', validation.errors.length ? 'alert' : 'status');
      summary.textContent = validation.errors.length ? `${count} issue${count === 1 ? '' : 's'} need attention before posting.` :
        `${count} warning${count === 1 ? '' : 's'} to review.`;
      content.push(summary);
    }
    posts.forEach((post, index) => {
      const row = document.createElement('li');
      row.className = 'social-post social-preview-post';
      const avatar = document.createElement('div');
      avatar.className = 'social-avatar-wrap';
      avatar.innerHTML = `<span class="social-avatar">${AVATAR}</span>${index < posts.length - 1 ? '<span class="social-thread-line"></span>' : ''}`;
      const article = document.createElement('article');
      article.className = 'social-post-body';
      article.ariaLabel = `Post ${index + 1} of ${posts.length}`;
      const text = document.createElement('p');
      text.className = `social-preview-text${post.text ? '' : ' social-empty'}`;
      text.textContent = post.text || (post.media.length ? 'Media post' : 'Empty post');
      article.append(text);
      renderPreviewMedia(article, post);
      for (const issue of [...validation.errors, ...validation.warnings].filter(value => value.postIndex === index)) {
        const message = document.createElement('p');
        message.className = 'social-preview-issue';
        message.textContent = issue.message;
        article.append(message);
      }
      row.append(avatar, article);
      list.append(row);
    });
    ui.posts.replaceChildren(...content, list, isLinkedIn() ? renderLinkedInPublish(validation) : renderPublish(validation));
    ui.viewStatus.textContent = validation.valid ?
      (isLinkedIn() ? 'Post preview ready.' : 'Thread preview ready.') :
      (isLinkedIn() ? 'Post preview has validation issues.' : 'Thread preview has validation issues.');
    syncHeader();
  }

  /* ===== JS 8.0 — UI rendering, events, and bootstrap ===== */
  function renderPosts(focus = false) {
    closeMediaLightbox(false);
    activePost = Math.max(0, Math.min(activePost, posts.length - 1));
    areaSizer?.disconnect();
    ui.posts.replaceChildren(...posts.map((post, index) => {
      const { text, media } = post;
      const row = document.createElement('div'), active = index === activePost;
      row.className = 'social-post';
      row.dataset.post = index;
      const avatar = `<div class="social-avatar-wrap"><span class="social-avatar${active ? '' : ' social-dim'}">${AVATAR}</span>${index < posts.length - 1 ? '<span class="social-thread-line"></span>' : ''}</div>`;
      if (!active) {
        row.innerHTML = `${avatar}<div class="social-post-body"><textarea readonly rows="1" cols="32" wrap="soft" class="social-post-editor" aria-keyshortcuts="Enter Space" data-activate-post></textarea><div data-post-media></div></div>`;
        const preview = $('[data-activate-post]', row);
        preview.value = text;
        preview.placeholder = media.length ? `${media.length} media attachment${media.length === 1 ? '' : 's'}` : 'Write a post…';
        preview.classList.toggle('social-empty', !text && !media.length);
        const over = countCurrentText(text).weightedLength - currentLimit();
        preview.ariaLabel = `Edit post ${index + 1}${over > 0 ? `, ${over} characters over limit` : ''}`;
        return row;
      }
      const picker = mediaOpen ? `<div class="social-media-picker" data-media-picker><div class="social-picker-head"><div class="social-tabs"><button type="button" class="social-tab" data-media-tab="dialog">Dialog</button><button type="button" class="social-tab" data-media-tab="folder">Folder</button></div><div class="social-picker-meta"><span data-media-count></span><button type="button" class="social-tool" data-close-media aria-label="Close media picker">×</button></div></div><div class="social-picker-body"><div class="social-folder-bar" data-folder-bar><button type="button" class="social-tool" data-folder-up aria-label="Parent folder">←</button><span class="social-folder-path" data-folder-path></span><button type="button" class="social-tool" data-folder-refresh aria-label="Refresh folder">↻</button></div><div class="social-media-grid" data-media-grid></div><p class="social-media-empty" aria-live="polite" data-media-empty hidden></p><p class="social-media-status" aria-live="polite" data-media-status hidden></p></div></div>` : '';
      const emoji = `<div class="social-emoji-panel" data-emoji-panel${emojiOpen ? '' : ' hidden'}><div class="social-emoji-head"><span>Emoji</span><button type="button" class="social-tool" data-close-emoji aria-label="Close emoji picker">×</button></div><div class="social-emoji-body" data-emoji-body></div></div>`;
      const code = codeOpen ? codeComposerMarkup() : '';
      const mediaButtonClass = `social-tool social-media-button${media.length ? ' has-media' : ''}`;
      const threadTools = isLinkedIn() ? '' :
        `<button type="button" class="social-tool" data-move="-1" aria-label="Move post ${index + 1} up">${MOVE_UP_ICON}</button><button type="button" class="social-tool" data-move="1" aria-label="Move post ${index + 1} down">${MOVE_DOWN_ICON}</button>`;
      const addAndMenu = isLinkedIn() ? '' :
        `<button type="button" class="social-tool social-add" data-add-post aria-label="Add post after post ${index + 1}" title="Add post (Shift+Enter)">${ADD_ICON}</button><details class="social-menu"><summary aria-label="Post ${index + 1} options">⚙</summary><div class="social-menu-pop"><button type="button" data-remove-post>Delete post</button></div></details>`;
      row.innerHTML = `${avatar}<div class="social-post-body"><textarea rows="1" cols="32" wrap="soft" class="social-post-editor" aria-label="Post ${index + 1}"${isLinkedIn() ? '' : ' aria-keyshortcuts="Shift+Enter"'} placeholder="Write a post…"></textarea><div data-post-media></div><div class="social-post-toolbar"><span class="social-count" data-post-count></span><div class="social-tools">${threadTools}<button type="button" class="social-tool" data-toggle-emoji aria-label="Add emoji to post ${index + 1}" aria-expanded="${emojiOpen}">${EMOJI_ICON}</button><button type="button" class="social-tool" data-toggle-code aria-label="Create code image for post ${index + 1}" aria-controls="social-code-panel" aria-expanded="${codeOpen}">${CODE_ICON}</button><button type="button" class="${mediaButtonClass}" data-toggle-media aria-label="Add media to post ${index + 1}" aria-expanded="${mediaOpen}">${MEDIA_ICON}${media.length ? `<span class="social-badge">${media.length}</span>` : ''}</button>${addAndMenu}</div></div>${picker}${emoji}${code}</div>`;
      const area = $('textarea', row), moves = $$('[data-move]', row);
      area.value = text;
      moves.forEach((move, i) => {
        move.disabled = i ? index === posts.length - 1 : index === 0;
      });
      updatePost(row, text);
      return row;
    }));
    $$('[data-post]', ui.posts).forEach((row, index) => renderPostMedia(row, posts[index], index === activePost));
    const areas = $$('.social-post-editor', ui.posts);
    areas.forEach(fitPostArea);
    areas.forEach(area => areaSizer?.observe(area));
    renderMediaPicker();
    renderEmojiPicker();
    renderCodeComposer();
    syncHeader();
    if (focus) {
      const area = $(`[data-post="${activePost}"] .social-post-editor`, ui.posts);
      area.focus({ preventScroll: true });
      area.setSelectionRange(area.value.length, area.value.length);
      const row = area.closest('[data-post]'), bounds = row.getBoundingClientRect(), frame = panel.getBoundingClientRect();
      if (bounds.top < frame.top) panel.scrollTop -= frame.top - bounds.top;
      else if (bounds.bottom > frame.bottom) panel.scrollTop += bounds.bottom - frame.bottom;
    }
  }

  function buildPanel() {
    const main = $('main');
    if (!main) throw new Error('Cannot mount social post panel: <main> was not found.');
    ensureHydrated();
    const cardTitle = isLinkedIn() ? 'LinkedIn builder' : 'Thread builder';
    const clearLabel = isLinkedIn() ? 'Clear post' : 'Delete all posts';
    const previewLabel = 'Preview and post';
    const previewAria = isLinkedIn() ? 'Preview and post to LinkedIn' : 'Preview and post to X';
    const previewIcon = isLinkedIn() ? LINKEDIN_ICON : X_ICON;
    panel = document.createElement('div');
    panel.id = PANEL;
    panel.setAttribute('role', 'complementary');
    panel.setAttribute('aria-labelledby', 'social-panel-title');
    panel.innerHTML = `
      <div class="social-panel-head">
        <h2 id="social-panel-title" class="social-title">SolveIt to Social Media</h2>
        <div class="social-platform-control">
          <span class="social-platform-mark" aria-hidden="true">${isLinkedIn() ? LINKEDIN_ICON : X_ICON}</span>
          <button type="button" class="social-platform-toggle" data-ui="platformToggle"
            role="switch" aria-checked="${isLinkedIn()}" aria-label="Switch post mode"
            uk-tooltip="Switch post mode"><span aria-hidden="true"></span></button>
        </div>
      </div>
      <div class="social-card">
        <div class="social-card-head">
          <h3 class="social-card-title">${cardTitle}</h3>
          <div class="social-card-actions"><span class="social-thread-meta" data-ui="threadMeta">1 post</span><button type="button" class="social-tool" data-ui="clearThread" uk-tooltip="${clearLabel}" aria-label="${clearLabel}"><svg viewBox="0 0 24 24" class="social-icon" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6M14 11v6"/></svg></button><button type="button" class="social-view-toggle" data-ui="viewToggle" uk-tooltip="${previewLabel}" aria-label="${previewAria}" aria-controls="social-thread-content" aria-pressed="false">${previewIcon}</button></div>
        </div>
        <div id="social-thread-content" data-ui="posts"></div>
        <p class="social-sr-only" data-ui="viewStatus" aria-live="polite"></p>
      </div>${mediaLightboxMarkup()}`;
    main.appendChild(panel);
    ui = Object.fromEntries($$('[data-ui]', panel).map(el => [el.dataset.ui, el]));
    wireMediaLightbox();
    ui.platformToggle.onclick = () => {
      const next = isLinkedIn() ? 'x' : 'linkedin';
      if (activatePlatform(next, false))
        requestAnimationFrame(() => ui?.platformToggle?.focus({ preventScroll: true }));
    };

    ui.posts.oninput = event => {
      if (event.target.matches('[data-code-input]')) {
        codeDraft.code = event.target.value; codeDraft.sourceIndex = -1;
        codeDraft.sourceKey = ''; codeDraft.sourceBacked = false;
        const source = $('[data-code-source]', ui.posts); if (source) source.value = '-1';
        return drawCodePreview();
      }
      if (event.target.matches('[data-code-title]')) { codeDraft.title = event.target.value; return drawCodePreview(); }
      if (!event.target.matches('.social-post-editor')) return;
      const card = event.target.closest('[data-post]');
      posts[Number(card.dataset.post)].text = event.target.value;
      emojiSelection = [event.target.selectionStart, event.target.selectionEnd];
      fitPostArea(event.target);
      updatePost(card, event.target.value);
      queueSave();
    };
    ui.posts.onchange = event => {
      if (event.target.matches('[data-code-source]')) {
        const index = Number(event.target.value);
        if (index >= 0) loadCodeSnippet(index);
        else { codeDraft.sourceIndex = -1; codeDraft.sourceKey = ''; codeDraft.sourceBacked = false; }
        return renderCodeComposer();
      }
      if (event.target.matches('[data-code-language]')) codeDraft.language = event.target.value;
      else if (event.target.matches('[data-code-theme]')) codeDraft.theme = event.target.value;
      else if (event.target.matches('[data-code-font]')) codeDraft.fontSize = event.target.value;
      else if (event.target.matches('[data-code-size]')) codeDraft.imageSize = codeImageSize(event.target.value);
      else if (event.target.matches('[data-code-columns]')) codeDraft.columns = codeColumns(event.target.value);
      else if (event.target.matches('[data-code-wrap]')) codeDraft.wrapLines = event.target.checked;
      else if (event.target.matches('[data-code-lines]')) codeDraft.lineNumbers = event.target.checked;
      else return;
      saveCodeSettings();
      drawCodePreview();
    };
    ui.posts.onselect = event => {
      if (event.target.matches(`[data-post="${activePost}"] .social-post-editor`))
        emojiSelection = [event.target.selectionStart, event.target.selectionEnd];
    };
    ui.posts.onkeydown = event => {
      if (event.target.closest('[data-code-panel]')) {
        event.stopPropagation();
        if (event.key === 'Escape') {
          event.preventDefault(); codeOpen = false; renderPosts();
          $('[data-toggle-code]', ui.posts)?.focus({ preventScroll: true });
        }
        return;
      }
      if (event.target.matches('textarea[readonly][data-activate-post]') &&
          (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        event.stopPropagation();
        activePost = Number(event.target.closest('[data-post]').dataset.post);
        closeTools();
        queueSave();
        renderPosts(true);
        return;
      }
      if (isLinkedIn() || event.key !== 'Enter' || event.repeat || event.isComposing || !event.shiftKey ||
          event.altKey || event.ctrlKey || event.metaKey || event.target.readOnly || !event.target.matches('.social-post-editor')) return;
      event.preventDefault();
      event.stopPropagation();
      addPost(Number(event.target.closest('[data-post]').dataset.post));
    };
    const areaWidths = new WeakMap();
    areaSizer = new ResizeObserver(entries => entries.forEach(({ target, contentRect }) => {
      const width = Math.round(contentRect.width);
      if (width === areaWidths.get(target)) return;
      areaWidths.set(target, width);
      requestAnimationFrame(() => target.isConnected && fitPostArea(target));
    }));
    lifecycle.signal.addEventListener('abort', () => areaSizer.disconnect(), { once: true });
    ui.posts.ondragstart = event => {
      const item = event.target.closest('[data-media-index]');
      if (!item || !event.dataTransfer) return;
      suppressMediaClickUntil = performance.now() + 350;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', item.dataset.mediaIndex);
      item.classList.add('social-dragging');
    };
    ui.posts.ondragover = event => {
      if (!event.target.closest('[data-media-index]')) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    };
    ui.posts.ondrop = event => {
      const target = event.target.closest('[data-media-index]');
      if (!target) return;
      event.preventDefault();
      suppressMediaClickUntil = performance.now() + 350;
      const from = Number(event.dataTransfer?.getData('text/plain')), to = Number(target.dataset.mediaIndex);
      if (!Number.isInteger(from) || from === to) return;
      const media = posts[activePost].media, [item] = media.splice(from, 1);
      if (!item) return;
      media.splice(to, 0, item);
      queueSave();
      renderPosts();
    };
    ui.posts.ondragend = event => {
      suppressMediaClickUntil = performance.now() + 350;
      event.target.closest('[data-media-index]')?.classList.remove('social-dragging');
    };
    ui.posts.onclick = async event => {
      const thumb = event.target.closest('[data-preview-media]');
      if (thumb) {
        if (event.detail && performance.now() < suppressMediaClickUntil) return;
        openMediaLightbox(thumb.dataset.previewPost, Number(thumb.dataset.previewMedia), thumb);
        return;
      }
      const control = event.target.closest('button'), card = event.target.closest('[data-post]');
      if (!card) return;
      const index = Number(card.dataset.post);
      if (!control) {
        if (index !== activePost) {
          activePost = index;
          closeTools();
          queueSave();
          renderPosts(true);
        }
        return;
      }
      if (control.hasAttribute('data-toggle-emoji')) {
        const area = $('.social-post-editor', card);
        if (!emojiOpen) {
          emojiSelection = [area.selectionStart, area.selectionEnd];
          emojiOpen = true;
          emojiError = '';
          if (mediaOpen || codeOpen) { mediaOpen = codeOpen = false; renderPosts(); }
          else {
            $('[data-emoji-panel]', card).hidden = false;
            control.setAttribute('aria-expanded', 'true');
          }
          loadEmojiPicker();
        } else closeEmojiPicker(true);
        return;
      } else if (control.hasAttribute('data-close-emoji')) {
        closeEmojiPicker(true);
        return;
      } else if (control.hasAttribute('data-retry-emoji')) {
        emojiError = '';
        return loadEmojiPicker();
      } else if (control.hasAttribute('data-toggle-code')) {
        const opening = !codeOpen;
        closeTools(); codeOpen = opening;
        if (opening) refreshCodeSources();
        renderPosts();
        if (opening) requestAnimationFrame(() => $('[data-code-input]', ui.posts)?.focus({ preventScroll: true }));
        return;
      } else if (control.hasAttribute('data-close-code')) {
        codeOpen = false; renderPosts();
        $('[data-toggle-code]', ui.posts)?.focus({ preventScroll: true });
        return;
      } else if (control.hasAttribute('data-refresh-code')) {
        refreshCodeSources(true); return renderCodeComposer();
      } else if (control.hasAttribute('data-add-code-image')) {
        return attachCodeImage();
      } else if (control.hasAttribute('data-toggle-media')) {
        mediaOpen = !mediaOpen;
        emojiOpen = codeOpen = false;
        mediaTab = 'dialog';
        mediaStatus = '';
        return renderPosts();
      } else if (control.hasAttribute('data-close-media')) {
        mediaOpen = false;
        return renderPosts(true);
      } else if (control.hasAttribute('data-media-tab')) {
        mediaTab = control.dataset.mediaTab;
        mediaStatus = '';
        if (mediaTab === 'folder') await loadFolder(folderPath);
        else {
          folderRequest++;
          folderLoading = false;
          renderMediaPicker();
        }
        return;
      } else if (control.hasAttribute('data-folder-up')) {
        if (folderParent !== null) await loadFolder(folderParent);
        return;
      } else if (control.hasAttribute('data-folder-refresh')) {
        await loadFolder(folderPath);
        return;
      } else if (control.hasAttribute('data-folder-path')) {
        await loadFolder(control._path);
        return;
      } else if (control.hasAttribute('data-media-choice')) {
        toggleMedia(control._media);
        return;
      } else if (control.hasAttribute('data-add-post')) {
        return addPost(index);
      } else if ('move' in control.dataset) {
        const target = index + Number(control.dataset.move);
        if (target < 0 || target >= posts.length) return;
        [posts[index], posts[target]] = [posts[target], posts[index]];
        activePost = target;
        closeTools();
        queueSave();
      } else if (control.hasAttribute('data-remove-post')) {
        if (!window.confirm(`Delete post ${index + 1}? This cannot be undone.`)) return;
        posts.splice(index, 1);
        if (!posts.length) posts.push(newPost());
        activePost = Math.min(index, posts.length - 1);
        closeTools();
        queueSave();
      }
      renderPosts(true);
    };
    ui.clearThread.onclick = () => {
      const count = posts.length;
      const message = isLinkedIn() ? 'Clear this LinkedIn post? This cannot be undone.' :
        `Delete all ${count} post${count === 1 ? '' : 's'}? This cannot be undone.`;
      if (!window.confirm(message)) return;
      posts = [newPost()];
      activePost = 0;
      closeTools();
      viewMode = 'edit';
      resetPublish();
      queueSave();
      renderPosts(true);
      panel.scrollTop = 0;
    };
    ui.viewToggle.onclick = () => {
      viewMode = viewMode === 'edit' ? 'preview' : 'edit';
      closeTools();
      if (viewMode === 'edit') resetPublish();
      viewMode === 'preview' ? renderPreview() : renderPosts();
      if (viewMode === 'preview') panel.scrollTop = 0;
      ui.viewToggle.focus({ preventScroll: true });
    };
    if (!storageListeners) {
      storageListeners = true;
      addEventListener('pagehide', writeDraft, { signal: lifecycle.signal });
      lifecycle.signal.addEventListener('abort', writeDraft, { once: true });
    }
    viewMode === 'preview' ? renderPreview() : renderPosts();
    loadCounter();
    return panel;
  }

  function activatePlatform(next, toggle = true) {
    if (publishing && platform !== next) return false;
    if (platform !== next) {
      clearTimeout(saveTimer);
      if (hydrated) writeDraft();
      stashPlatform();
      areaSizer?.disconnect();
      panel?.remove();
      panel = ui = areaSizer = null;
      closeTools();
      loadPlatform(next);
      try { localStorage.setItem(PLATFORM_STORAGE_KEY, next); } catch (_) {}
    } else if (panel && toggle) {
      panel.hidden = !panel.hidden;
      document.getElementById(BUTTON)?.setAttribute('aria-expanded', String(!panel.hidden));
      return true;
    }
    if (!panel) panel = buildPanel();
    panel.hidden = false;
    document.getElementById(BUTTON)?.setAttribute('aria-expanded', 'true');
    return true;
  }

  function installLauncher() {
    if (document.getElementById(BUTTON)) return true;
    const toolbar = document.getElementById('terminal')?.parentElement;
    if (!toolbar) return false;
    toolbar.insertAdjacentHTML('afterbegin',
      `<button id="${BUTTON}" type="button" class="uk-btn uk-btn-icon uk-btn-sm text-lg uk-btn-default cursor-pointer" uk-tooltip="Open social post sidepanel" aria-label="Open social post sidepanel" aria-controls="${PANEL}" aria-expanded="false"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="16px" width="16px" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon" aria-hidden="true"><path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/><path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14"/><path d="M8 6v8"/></svg></button>`);
    document.getElementById(BUTTON).onclick = event => { event.stopPropagation(); activatePlatform(platform); };
    return true;
  }

  restoreCodeSettings();
  if (!installLauncher()) {
    const observer = new MutationObserver(() => {
      if (installLauncher()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    lifecycle.signal.addEventListener('abort', () => observer.disconnect(), { once: true });
  }

  function showPanel(next = 'x') {
    return activatePlatform(next, false);
  }

  const publicApi = {
    serializeThread: options => withPlatform('x', () => serializeThread(options)),
    validateThread: payload => withPlatform('x', () => validateThread(payload)),
    countText,
    saveDraft: () => savePlatformDraft('x'),
    preview: () => { if (!showPanel('x')) return; viewMode = 'preview'; renderPreview(); panel.scrollTop = 0; },
    publish: async () => { if (!showPanel('x')) return; viewMode = 'preview'; renderPreview(); return runPublish(); },
    linkedin: {
      serializePost: options => withPlatform('linkedin', () => serializeLinkedInPost(options)),
      validatePost: payload => withPlatform('linkedin', () => validateLinkedInPost(payload)),
      preview: () => { if (!showPanel('linkedin')) return; viewMode = 'preview'; renderPreview(); panel.scrollTop = 0; },
      publish: async () => { if (!showPanel('linkedin')) return; viewMode = 'preview'; renderPreview(); return runLinkedInPublish(); }
    } };
  window.solveitSocial = publicApi;
  lifecycle.signal.addEventListener('abort', () => {
    if (window.solveitSocial === publicApi) delete window.solveitSocial;
  }, { once: true });

  const refresh = () => {
    installLauncher();
    if (panel && !panel.hidden && mediaOpen && mediaTab === 'dialog') requestAnimationFrame(renderMediaPicker);
  };
  for (const eventName of ['htmx:afterSettle', 'htmx:wsAfterMessage'])
    document.addEventListener(eventName, refresh, { signal: lifecycle.signal });
})();
