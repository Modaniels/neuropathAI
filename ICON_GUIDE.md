# Icon Creation Guide

Your extension needs icons in the following sizes for Firefox Add-ons submission:

## Required Icon Sizes

- **16x16** - Toolbar icon (standard)
- **32x32** - Toolbar icon (retina/high-DPI)
- **48x48** - Add-ons Manager
- **96x96** - Add-ons Manager (retina/high-DPI)
- **128x128** - AMO listing page (recommended)

## Current Status

You have: `icons/mental-state.png` (size unknown)

## Options to Create Icons

### Option 1: Using Online Tools (Easiest)

1. **Go to a free icon resizer:**
   - https://www.iloveimg.com/resize-image
   - https://www.resizepixel.com/
   - https://bulkresizephotos.com/

2. **Upload your current icon** (`mental-state.png`)

3. **Resize to each required size:**
   - 16x16 → save as `icon-16.png`
   - 32x32 → save as `icon-32.png`
   - 48x48 → save as `icon-48.png`
   - 96x96 → save as `icon-96.png`
   - 128x128 → save as `icon-128.png`

4. **Save all files** to `icons/` folder

### Option 2: Using Paint.NET (Free Windows App)

1. Download Paint.NET: https://www.getpaint.net/
2. Open `mental-state.png`
3. Image → Resize → enter size (keep aspect ratio)
4. Save as PNG with new filename
5. Repeat for each size

### Option 3: Using Photoshop/GIMP

1. Open image in Photoshop/GIMP
2. Image → Image Size
3. Set width and height (maintain proportions)
4. Export as PNG
5. Repeat for each size

### Option 4: Using PowerShell Script

Create a file `resize-icons.ps1`:

```powershell
# Requires ImageMagick installed
$sizes = @(16, 32, 48, 96, 128)
$source = "icons/mental-state.png"

foreach ($size in $sizes) {
    $output = "icons/icon-$size.png"
    magick convert $source -resize ${size}x${size} $output
    Write-Host "Created $output"
}
```

Run: `powershell .\resize-icons.ps1`

### Option 5: Use a Design Tool

If you want to create a new professional icon:

**Free Tools:**
- **Figma** (free, online): https://figma.com
- **Canva** (free tier): https://canva.com
- **Inkscape** (free, vector): https://inkscape.org/

**Design Tips:**
- Use simple, recognizable shape
- High contrast colors
- Works well at small sizes
- Represents "brain/neural/learning"
- Professional look

**Current icon theme:** Brain/mental state/neural paths
**Brand colors:** Teal (#64ffda) and Purple (#c792ea) from your app

## Icon Checklist

After creating icons:

- [ ] icon-16.png (16x16 pixels)
- [ ] icon-32.png (32x32 pixels)
- [ ] icon-48.png (48x48 pixels)
- [ ] icon-96.png (96x96 pixels)
- [ ] icon-128.png (128x128 pixels)
- [ ] All icons are PNG format
- [ ] All icons have transparent backgrounds
- [ ] All icons look clear and crisp
- [ ] Test in Firefox to ensure they look good

## Quick Test

After creating icons, test them:

1. Install extension in Firefox
2. Check toolbar icon looks good
3. Go to `about:addons` and check if icon looks good
4. Try on both regular and high-DPI screens if possible

## Fallback Option

If you're having trouble creating icons, you can:
1. Keep using your current icon temporarily
2. Submit to AMO with a note that you'll update icons soon
3. Or commission a designer on Fiverr ($5-20 for a simple icon set)

---

**Recommended:** Use Option 1 (online tool) - fastest and easiest!
