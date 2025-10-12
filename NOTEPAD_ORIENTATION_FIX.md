# 🔄 Digital Notepad Orientation Fix

## Problem: Vertical strokes appearing horizontal

Your iScribe digital notepad and the screen canvas have different orientations, causing coordinate mismatches.

---

## ✅ Solution Implemented: Canvas Rotation Button

I've added a **"🔄 Rotate"** button in the session header that allows you to rotate the canvas to match your physical notepad orientation.

### How to Use:

1. **Start a note session** with any patient
2. **Draw a test line** on your iScribe notepad (vertically)
3. **Observe** how it appears on screen
4. **Click the "🔄 Rotate" button** to rotate the canvas by 90°
5. **Draw another test line** to verify orientation
6. **Keep clicking** until vertical strokes on your pad appear vertical on screen
7. **Start taking notes** once orientation is correct

### Rotation Options:
- **0°** - Default portrait orientation
- **90°** - Rotated clockwise (landscape right)
- **180°** - Upside down portrait
- **270°** - Rotated counter-clockwise (landscape left)

---

## 🎯 Finding the Right Orientation

### Test Method:
1. Draw a **vertical line** from top to bottom on your iScribe
2. It should appear as a **vertical line** on screen
3. If it appears horizontal, rotate the canvas

### Common Scenarios:

#### Scenario 1: Line appears horizontal instead of vertical
**Solution**: Click "Rotate" once (90°) or three times (270°)

#### Scenario 2: Line is vertical but upside down
**Solution**: Click "Rotate" twice (180°)

#### Scenario 3: Everything is mirrored
**Solution**: This is a different issue - check your iScribe notepad settings/calibration

---

## 🔧 Technical Details

### What Was Changed:

1. **Added rotation state** to NoteSession component
2. **Added rotation button** in header with current angle display
3. **Applied CSS transform** to rotate canvas container
4. **Swapped width/height** when rotated 90° or 270°
5. **Added smooth transition** (0.3s ease) for visual feedback

### Files Modified:
- `src/components/NoteSession.jsx` - Added rotation logic
- `src/styles/NoteSession.css` - Added rotation button styles

---

## 🖊️ iScribe Notepad Configuration

### Physical Orientation:
Your iScribe notepad may be:
- **Portrait**: Short edge at bottom (like a notebook)
- **Landscape**: Long edge at bottom (like a tablet)

### To Match Screen:
1. **Identify your preferred physical orientation** for writing
2. **Use the Rotate button** to match screen to your physical setup
3. **The rotation persists** during your session (resets when you end session)

---

## 📱 Alternative Solutions

### Option 1: Rotate Physical Notepad
Instead of rotating the screen canvas, you can:
- Physically rotate your iScribe notepad 90°
- Keep screen at 0° rotation
- This is the simplest solution if you're comfortable with it

### Option 2: Configure iScribe Device Settings
Some digital notepads have orientation settings:
1. Check your iScribe notepad software/app
2. Look for orientation or rotation settings
3. Set to match browser canvas (portrait mode)

### Option 3: Browser Window Rotation (macOS)
You can rotate the entire browser window:
1. System Settings > Displays
2. Rotation dropdown
3. This affects everything, not just the canvas

---

## 🐛 Troubleshooting

### Issue: Rotation button doesn't work
**Check**: Make sure you're in an active note session
**Solution**: Reload the page and try again

### Issue: Drawing is still misaligned after rotation
**Possible causes**:
1. iScribe notepad calibration needed
2. Browser zoom level (should be 100%)
3. Display scaling settings in macOS

**Solutions**:
1. **Calibrate your iScribe**: Check device manual for calibration process
2. **Reset browser zoom**: Press `Cmd+0` to reset to 100%
3. **Check display scaling**: System Settings > Displays > Scale

### Issue: Canvas is too small/large
**Solution**: The canvas is A4 size (210mm × 297mm). If it appears wrong:
1. Check browser zoom (should be 100%)
2. Check display settings (resolution, scaling)
3. Adjust `maxHeight` in NoteSession.jsx if needed

---

## 📊 Coordinate System Mapping

### Understanding the Problem:

```
Physical iScribe Notepad:        Browser Canvas:
┌─────────────┐                 ┌───────┐
│             │                 │       │
│             │                 │       │
│             │  ≠              │       │
│             │                 │       │
└─────────────┘                 │       │
  (Landscape?)                  │       │
                                └───────┘
                                (Portrait)
```

### After Rotation:

```
Physical iScribe Notepad:        Browser Canvas (Rotated):
┌─────────────┐                 ┌─────────────┐
│             │                 │             │
│             │                 │             │
│             │  =              │             │
│             │                 │             │
└─────────────┘                 └─────────────┘
  (Landscape)                     (Rotated to Landscape)
```

---

## 💡 Best Practices

### For Medical Note-Taking:

1. **Set orientation once** at the start of your session
2. **Keep it consistent** for all your notes
3. **Test with sample text** before writing important notes
4. **Use the same rotation** for all patients (muscle memory)

### Recommended Setup:

**If you prefer landscape writing:**
- Physical notepad: Landscape orientation
- Screen rotation: 90° or 270° (whichever matches)

**If you prefer portrait writing:**
- Physical notepad: Portrait orientation  
- Screen rotation: 0° (default)

---

## 🎓 Quick Start Guide

### First-Time Setup (1 minute):

1. Start a note session with test patient
2. Write "TEST" vertically on your iScribe
3. Observe how it appears on screen
4. Click "🔄 Rotate" until it matches
5. Remember this rotation for future sessions
6. Start taking real medical notes!

### Session Workflow:

```
Login → Add Patient → Start Session → Rotate Canvas (if needed) → Take Notes → Extract OCR → Save
```

---

## 🔍 Visual Indicators

The rotation button shows:
- **🔄 Rotate (0°)** - Default portrait
- **🔄 Rotate (90°)** - Rotated clockwise
- **🔄 Rotate (180°)** - Upside down
- **🔄 Rotate (270°)** - Rotated counter-clockwise

Current rotation is always displayed so you know your canvas orientation.

---

## 📞 Still Having Issues?

### Debug Steps:

1. **Verify pen input**:
   - Draw directly with mouse - does it work correctly?
   - If yes, issue is with iScribe coordinate mapping
   - If no, issue is with canvas itself

2. **Check iScribe connection**:
   - Is the device properly connected?
   - Are drivers/software up to date?
   - Is it recognized by your Mac?

3. **Test in different browser**:
   - Try Safari, Chrome, or Firefox
   - Some browsers handle touch/pen events differently

4. **Calibration**:
   - Most digital pens require calibration
   - Check iScribe documentation for calibration process

---

## ✅ Success Criteria

You know orientation is correct when:
- ✅ Vertical strokes on pad appear vertical on screen
- ✅ Horizontal strokes on pad appear horizontal on screen
- ✅ Text written normally is readable on screen
- ✅ Drawings match your hand movements

---

**Created**: October 13, 2025  
**Status**: ✅ Rotation feature implemented and ready to use  
**Next**: Test with your iScribe and find the right rotation angle
