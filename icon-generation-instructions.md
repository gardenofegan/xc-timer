# PWA Icon Generation Instructions

Since we can't generate actual PNG/ICO files in this environment, you'll need to create the following icons using the SVG template provided:

## Required Icons:

### 1. favicon.ico
- **Sizes**: 16x16, 32x32, 48x48 (multi-size ICO file)
- **Use**: Browser tab icon
- **Tool**: Use an online ICO converter or Photoshop/GIMP

### 2. icon-192.png
- **Size**: 192x192 pixels
- **Use**: Android home screen, PWA install prompt
- **Format**: PNG with transparent background

### 3. icon-512.png
- **Size**: 512x512 pixels
- **Use**: Android splash screen, high-res displays
- **Format**: PNG with transparent background

### 4. apple-touch-icon.png
- **Size**: 180x180 pixels
- **Use**: iOS home screen icon
- **Format**: PNG (iOS will automatically round corners)

## How to Create Icons:

### Option 1: Using the SVG Template
1. Open `public/icon-template.svg` in a vector graphics editor (Inkscape, Adobe Illustrator, or Figma)
2. Export at the required sizes listed above
3. Save each file with the exact names listed above in the `public/` folder

### Option 2: Using Your Noun Project Icons
1. Download the timer and runners icons from Noun Project
2. Create a composition combining both icons:
   - Timer as the main element (larger, centered)
   - Runners as smaller elements at the bottom
   - Use the green color scheme (#22c55e background)
3. Export at all required sizes

### Option 3: Online Icon Generators
1. Use tools like:
   - https://realfavicongenerator.net/
   - https://www.favicon-generator.org/
   - https://favicon.io/
2. Upload your base design and generate all required formats

## Design Guidelines:

- **Colors**: Use the app's green theme (#22c55e)
- **Style**: Clean, modern, recognizable at small sizes
- **Content**: Timer + runners combination
- **Background**: Can be transparent or solid color
- **Safe area**: Keep important elements away from edges (iOS rounds corners)

## File Placement:
All icon files should be placed in the `public/` folder:
```
public/
├── favicon.ico
├── icon-192.png
├── icon-512.png
├── apple-touch-icon.png
└── manifest.json
```

## Testing:
After creating the icons:
1. Run `npm run build`
2. Test the PWA installation on mobile devices
3. Check that icons appear correctly in browser tabs and home screens