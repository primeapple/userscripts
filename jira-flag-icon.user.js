// ==UserScript==
// @name         Jira Flag Icon
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Replace Jira's flagged issue icon with a configurable emoji
// @match        https://*.atlassian.net/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @run-at       document-end
// ==/UserScript==

(() => {
  "use strict";

  const EMOJI_KEY = "flagEmoji";
  const DEFAULT_EMOJI = "🍺";

  function applyEmoji() {
    const emoji = GM_getValue(EMOJI_KEY, DEFAULT_EMOJI);
    document.documentElement.style.setProperty(
      "--jira-flag-emoji",
      `"${CSS.escape(emoji)}"`,
    );
  }

  GM_registerMenuCommand("Change flag emoji…", () => {
    const emoji = window
      .prompt("Flag emoji:", GM_getValue(EMOJI_KEY, DEFAULT_EMOJI))
      ?.trim();
    if (!emoji) return;
    GM_setValue(EMOJI_KEY, emoji);
    applyEmoji();
  });

  applyEmoji();
  const style = document.createElement("style");
  style.textContent = `
    [role="img"][aria-label="Flagged"] > [aria-hidden="true"] {
      display: none !important;
    }
    [role="img"][aria-label="Flagged"]::after {
      content: var(--jira-flag-emoji);
      font-size: 16px;
      line-height: 1;
    }
    [data-vc="issue-view-status-field-flagged"] [aria-hidden="true"] {
      position: relative;
    }
    [data-vc="issue-view-status-field-flagged"] [aria-hidden="true"] > svg {
      visibility: hidden !important;
    }
    [data-vc="issue-view-status-field-flagged"] [aria-hidden="true"]::after {
      content: var(--jira-flag-emoji);
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      line-height: 1;
      pointer-events: none;
    }
  `;
  document.head.append(style);
})();
