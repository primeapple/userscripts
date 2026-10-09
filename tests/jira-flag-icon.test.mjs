import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const script = readFileSync(
  new URL("../jira-flag-icon.user.js", import.meta.url),
  "utf8",
);

test("flag emoji defaults to beer, updates immediately, and persists", () => {
  const values = new Map();
  /** @type {() => void} */
  let menuAction = () => assert.fail("Menu action not registered");
  /** @type {string | null} */
  let selectedEmoji = " 🎉 ";
  let cssValue;
  const context = {
    /** @param {string} key @param {string} fallback */
    GM_getValue: (key, fallback) => values.get(key) ?? fallback,
    /** @param {string} key @param {string} value */
    GM_setValue: (key, value) => values.set(key, value),
    /** @param {string} _label @param {() => void} action */
    GM_registerMenuCommand: (_label, action) => {
      menuAction = action;
    },
    window: { prompt: () => selectedEmoji },
    // These inputs need no escaping; browser supplies CSS.escape in production.
    CSS: {
      /** @param {string} value */
      escape: (value) => value,
    },
    document: {
      documentElement: {
        style: {
          /** @param {string} _name @param {string} value */
          setProperty: (_name, value) => {
            cssValue = value;
          },
        },
      },
      createElement: () => ({ textContent: "" }),
      head: { append: () => {} },
    },
  };

  runInNewContext(script, context);
  assert.equal(cssValue, '"🍺"');
  menuAction();
  assert.equal(cssValue, '"🎉"');

  selectedEmoji = null;
  menuAction();
  assert.equal(cssValue, '"🎉"');

  runInNewContext(script, context);
  assert.equal(cssValue, '"🎉"');
});
