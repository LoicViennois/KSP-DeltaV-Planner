const fs = require('fs')
const path = require('path')
const jsdom = require('jsdom')
const replace = require('replace-in-file')

const svgPath = path.join(__dirname, 'DvMap_KSPedia.svg')
const htmlPath = path.join(__dirname, 'map.component.html')
const file = fs.readFileSync(svgPath).toString()
const dom = new jsdom.JSDOM(file)

const { document } = dom.window


function removeTag(name) {
  let elements = document.getElementsByTagName(name)
  for (let index = elements.length - 1; index >= 0; index--) {
    elements[index].parentNode.removeChild(elements[index])
  }
}

function removeAttribute (tag, name) {
  let elements = document.getElementsByTagName(tag)
  for (let index = elements.length - 1; index >= 0; index--) {
    elements[index].removeAttribute(name)
  }
}

removeTag('inkscape:path-effect')
removeTag('rdf:rdf')
removeTag('sodipodi:namedview')
removeTag('flowroot')
removeAttribute('svg', 'width')
removeAttribute('svg', 'height')
removeAttribute('svg', 'xmlns:osb')
removeAttribute('svg', 'xmlns:dc')
removeAttribute('svg', 'xmlns:cc')
removeAttribute('svg', 'xmlns:rdf')
removeAttribute('svg', 'xmlns:svg')
removeAttribute('svg', 'xmlns:sodipodi')
removeAttribute('svg', 'xmlns:inkscape')
removeAttribute('svg', 'inkscape:version')
removeAttribute('svg', 'sodipodi:docname')
removeAttribute('svg', 'inkscape:export-filename')
removeAttribute('svg', 'inkscape:export-xdpi')
removeAttribute('svg', 'inkscape:export-ydpi')
removeAttribute('radialGradient','inkscape:collect')
removeAttribute('linearGradient','inkscape:collect')
removeAttribute('linearGradient','osb:paint')
removeAttribute('rect', 'sodipodi:insensitive')
removeAttribute('path', 'sodipodi:nodetypes')
removeAttribute('path', 'inkscape:connector-curvature')
removeAttribute('path', 'inkscape:original-d')
removeAttribute('path', 'inkscape:path-effect')
removeAttribute('path', 'inkscape:transform-center-x')
removeAttribute('path', 'inkscape:transform-center-y')
removeAttribute('text', 'inkscape:transform-center-x')
removeAttribute('text', 'inkscape:transform-center-y')
removeAttribute('text', 'sodipodi:role')
removeAttribute('tspan', 'sodipodi:role')
removeAttribute('use', 'inkscape:transform-center-x')
removeAttribute('use', 'inkscape:transform-center-y')
removeAttribute('g', 'inkscape:label')
removeAttribute('g', 'inkscape:export-filename')
removeAttribute('g', 'inkscape:export-xdpi')
removeAttribute('g', 'inkscape:export-ydpi')

const tspan3937 = document.getElementById('tspan3937')
tspan3937.setAttribute('x', '1152')
tspan3937.innerHTML = tspan3937.innerHTML.trim()

const tspan3933 = document.getElementById('tspan3933')
tspan3933.setAttribute('x', '1963')
tspan3933.innerHTML = tspan3937.innerHTML.trim()

fs.writeFileSync(htmlPath, dom.serialize())

const ignore = '<!--suppress CssFloatPxLength, HtmlUnknownAttribute, CssUnknownProperty, SpellCheckingInspection -->'

const options = {
  files: htmlPath,
  from: [
    /:0%;/g,
    /:0px;/g,
    /font-family:Aller;/g,
    /-inkscape-font-specification:Aller;/g,
    /-inkscape-font-specification:'Aller, Bold';/g,
    /-inkscape-font-specification:'Aller, Normal';/g,
    /.*<svg/g,
    /<\/body><\/html>/g,
    /^\s*\n/gm
  ],
  to: [
    ':0;',
    ':0;',
    'font-family:Lato,sans-serif;',
    ';',
    ';',
    ';',
    `${ignore}\n<svg`,
    '',
    '',
  ],
}
const results = replace.sync(options);
console.log(results)
