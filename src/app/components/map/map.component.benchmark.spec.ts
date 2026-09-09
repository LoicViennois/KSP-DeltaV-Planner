import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import * as d3 from 'd3-selection';

describe('MapComponent DOM benchmark', () => {
  it('benchmarks loop vs batch svg select', () => {
    const dom = new JSDOM(`<!DOCTYPE html><html><body><svg id="svg"></svg></body></html>`);
    const document = dom.window.document;
    const svgElem = document.querySelector('svg')!;

    const ids: string[] = [];
    for (let i = 0; i < 50; i++) {
      const id = `node-${i}`;
      ids.push(id);
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('id', id);
      rect.setAttribute('class', 'dv-map map-fade fade-soft');
      svgElem.appendChild(rect);
    }

    const svg = d3.select<SVGSVGElement, unknown>(svgElem as unknown as SVGSVGElement);

    const iterations = 1000;

    // Loop
    const startLoop = performance.now();
    for (let it = 0; it < iterations; it++) {
      ids.forEach((id) => {
        svg.select(`#${id}`).classed('map-fade', false);
      });
      if (it % 2 === 0) {
        ids.forEach((id) => {
          svg.select(`#${id}`).classed('fade-soft', true);
        });
      }
    }
    const endLoop = performance.now();
    const loopTime = endLoop - startLoop;

    // Batch
    const startBatch = performance.now();
    for (let it = 0; it < iterations; it++) {
      if (ids.length > 0) {
        svg.selectAll(ids.map((id) => `#${id}`).join(', ')).classed('map-fade', false);
      }
      if (it % 2 === 0 && ids.length > 0) {
        svg.selectAll(ids.map((id) => `#${id}`).join(', ')).classed('fade-soft', true);
      }
    }
    const endBatch = performance.now();
    const batchTime = endBatch - startBatch;

    console.log(`Benchmark Results (${iterations} iterations, 50 elements):`);
    console.log(`- Baseline (loop svg.select): ${loopTime.toFixed(2)} ms`);
    console.log(`- Optimized (batch svg.selectAll): ${batchTime.toFixed(2)} ms`);
    console.log(`- Speedup: ${(loopTime / batchTime).toFixed(2)}x (${(((loopTime - batchTime) / loopTime) * 100).toFixed(2)}% faster)`);

    expect(batchTime).toBeLessThan(loopTime);
  });
});
