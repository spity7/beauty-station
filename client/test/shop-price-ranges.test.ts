import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildDynamicPriceFilterMeta,
  formatPriceInputDisplay,
  parsePriceInput,
  presetToServerPrices,
  serverPricesMatchPreset,
} from "../lib/shop-price-ranges.js";

describe("shop-price-ranges", () => {
  it("strips leading zeros when parsing price input", () => {
    assert.equal(parsePriceInput("01"), 1);
    assert.equal(parsePriceInput("030"), 30);
    assert.equal(formatPriceInputDisplay(30), "30");
  });

  it("builds dynamic presets from catalog bounds", () => {
    const meta = buildDynamicPriceFilterMeta(18, 72);
    assert.ok(meta.presets.length >= 2);
    assert.equal(meta.catalogMin, 18);
    assert.equal(meta.catalogMax, 72);
    assert.ok(meta.sliderMax >= 72);
    assert.equal(meta.presets[0].min, 0);
    assert.ok(meta.presets.at(-1)?.max === null);
  });

  it("maps under preset to API params", () => {
    const meta = buildDynamicPriceFilterMeta(18, 72);
    const under = meta.presets[0];
    assert.deepEqual(presetToServerPrices(under), {
      minPrice: undefined,
      maxPrice: under.max ?? undefined,
    });
    assert.equal(
      serverPricesMatchPreset(under, undefined, under.max ?? undefined),
      true
    );
  });

  it("maps upper open preset to min-only API params", () => {
    const meta = buildDynamicPriceFilterMeta(18, 72);
    const top = meta.presets.at(-1);
    assert.ok(top);
    assert.equal(top.max, null);
    assert.deepEqual(presetToServerPrices(top), {
      minPrice: top.min,
      maxPrice: undefined,
    });
    assert.equal(serverPricesMatchPreset(top, top.min, undefined), true);
  });
});
