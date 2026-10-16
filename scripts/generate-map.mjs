// Optimises the KSPedia Δv map (svg/DvMap_KSPedia.svg) into the SVG the app
// highlights (src/assets/dv-map.svg). Its element ids are kept, as the
// highlighting looks them up (src/lib/map-highlight.ts).
// Usage: pnpm map
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { optimize } from 'svgo';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = resolve(ROOT, 'svg/DvMap_KSPedia.svg');
const outputPath = resolve(ROOT, 'src/assets/dv-map.svg');

function findElementById(node, id) {
  if (node.type === 'element' && node.attributes.id === id) {
    return node;
  }

  for (const child of node.children ?? []) {
    const match = findElementById(child, id);
    if (match != null) {
      return match;
    }
  }

  return null;
}

function textContent(node) {
  return node.children
    .filter((child) => child.type === 'text')
    .map((child) => child.value)
    .join('');
}

function setTextContent(node, value) {
  node.children = [{ type: 'text', value }];
}

function prepareStyle(style) {
  return style
    .replaceAll('font-family:Aller', 'font-family:Lato,sans-serif')
    .replace(/-inkscape-font-specification:(?:"[^"]*"|'[^']*'|[^;]*);?/g, '')
    .replace(/:0(?:px|%)(?=;|$)/g, ':0');
}

const prepareForApplication = {
  name: 'prepareForApplication',
  fn: () => ({
    element: {
      enter: (node) => {
        const style = node.attributes.style;
        if (style != null) {
          node.attributes.style = prepareStyle(style);
        }
      },
    },
    root: {
      exit: (root) => {
        const outerDuration = findElementById(root, 'tspan3933');
        const innerDuration = findElementById(root, 'tspan3937');

        if (outerDuration == null || innerDuration == null) {
          throw new Error(
            'Expected duration labels were not found in the source SVG.',
          );
        }

        const duration = textContent(innerDuration).trim();
        outerDuration.attributes.x = '1963';
        innerDuration.attributes.x = '1152';
        setTextContent(outerDuration, duration);
        setTextContent(innerDuration, duration);
      },
    },
  }),
};

const source = await readFile(sourcePath, 'utf8');
const result = optimize(source, {
  path: sourcePath,
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          cleanupIds: false,
        },
      },
    },
    'removeDimensions',
    prepareForApplication,
  ],
});

await writeFile(outputPath, `${result.data}\n`, 'utf8');
console.log(`wrote ${relative(ROOT, outputPath)}`);
