import test from "node:test";
import assert from "node:assert/strict";

import {
  basicCorrections,
  buildCustomRules,
  MAX_TEXT_LENGTH,
  spellcheckText,
} from "../src/lib/spellcheck";

const rules = [...buildCustomRules([]), ...basicCorrections];

test("spellcheck replaces common mistakes", () => {
  const result = spellcheckText("됬어", rules);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.corrected, "됐어");
  }
});

test("spellcheck fixes 되요", () => {
  const result = spellcheckText("되요", rules);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.corrected, "돼요");
  }
});

test("spellcheck returns empty input error", () => {
  const result = spellcheckText("   ", rules);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error.code, "EMPTY_TEXT");
  }
});

test("spellcheck leaves english-only text unchanged", () => {
  const input = "Hello world 123";
  const result = spellcheckText(input, rules);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.corrected, input);
    assert.equal(result.changes.length, 0);
  }
});

test("spellcheck flags truncated when text is long", () => {
  const input = "가".repeat(MAX_TEXT_LENGTH + 10);
  const result = spellcheckText(input, rules);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.truncated, true);
    assert.equal(result.corrected.length, input.length);
  }
});
