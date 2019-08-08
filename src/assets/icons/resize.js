const sharp = require('sharp')

for (let size of [384, 192, 152, 144, 128, 96, 72]) {
  sharp('icon-512x512.png')
    .resize(size)
    .toFile(`icon-${size}x${size}.png`)
    .then(() => console.log(`Converted to ${size}`))
}

