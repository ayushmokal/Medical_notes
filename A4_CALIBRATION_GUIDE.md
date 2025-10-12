# 📄 A4 Paper Calibration Guide

## Setup for Perfect A4 Alignment

Your Medical Notes System is now configured for **A4 paper (210mm × 297mm)** - the standard medical paper size.

---

## ✅ What's Configured

### Canvas Size: A4 (Fixed)
- **Width**: 210mm (8.27 inches)
- **Height**: 297mm (11.69 inches)
- **Standard**: ISO 216 A4 paper size
- **Always fixed** - rotation doesn't change dimensions

### Calibration: 1:1 Mapping
- Pen touch position → Screen cursor position
- No scaling, no offset
- Exact coordinate mapping

---

## 🎯 How to Set Up

### Step 1: Physical Setup (1 minute)

1. **Place A4 paper** on your iScribe digitizer pad
2. **Align paper edges** with the digitizer's borders
3. **Ensure paper is flat** and not wrinkled
4. **Paper orientation**: Portrait (tall, not wide)

```
┌─────────────┐
│             │ ← 210mm wide
│   A4 Paper  │
│             │
│             │ ← 297mm tall
│             │
└─────────────┘
```

### Step 2: Screen Calibration (10 seconds)

1. **Open your note session** (you're already there!)
2. **Click "🎯 Calibrate" button** (green button in header)
3. **Wait for confirmation** message
4. **Done!** Canvas is now calibrated

### Step 3: Alignment Test (30 seconds)

**4-Corner Test**:
1. Touch **top-left corner** of your A4 paper with pen
2. **Check screen** - dot should appear at top-left of canvas
3. Touch **top-right corner** - dot at top-right?
4. Touch **bottom-right corner** - dot at bottom-right?
5. Touch **bottom-left corner** - dot at bottom-left?

**Perfect?** ✅ You're ready!  
**Not aligned?** See troubleshooting below ↓

---

## 📐 Why A4 Size?

### Medical Standard
- **Most prescriptions**: Written on A4 paper
- **Medical forms**: A4 is standard worldwide
- **Easy filing**: Standard folder/binder size
- **Patient records**: Compatible with existing systems

### Perfect for OCR
- **Gemini AI trained** on document-sized images
- **Better accuracy** with standard paper size
- **Consistent results** across all notes

---

## 🔧 Troubleshooting

### Issue: Pen touch doesn't match cursor

**Quick Fixes** (try in order):

1. **Click "🎯 Calibrate"** - Resets zoom to 1:1
2. **Press `Cmd+0`** - Resets browser zoom to 100%
3. **Check digitizer** - Is A4 paper properly placed?
4. **Run device calibration** - In iScribe software settings

---

### Issue: Canvas appears too small or large

**Cause**: Browser zoom or display scaling

**Solution**:
```
1. Browser zoom: Press Cmd+0 (should be 100%)
2. Display scaling: System Settings > Displays > Scale > Default
3. Click 🎯 Calibrate again
```

---

### Issue: Corners don't align perfectly

**Cause**: Device needs calibration

**Solution**:
1. Open **iScribe software** (device driver)
2. Find **"Calibration"** or **"Settings"**
3. Run **calibration wizard**:
   - Touch screen corners when prompted
   - Follow on-screen instructions
4. **Save** calibration
5. **Test again** with 4-corner test

---

### Issue: Pen works but pressure doesn't

**Cause**: Pressure sensitivity not enabled

**Solution**:
1. Check **iScribe settings** for pressure sensitivity
2. Ensure **pressure levels** are set (should be 1024+ levels)
3. In tldraw, check if using **pen tool** (not mouse tool)

---

## 📏 Exact Measurements

### A4 Paper Dimensions:
```
Width:  210mm = 21.0cm = 8.27 inches
Height: 297mm = 29.7cm = 11.69 inches
Area:   623.7 cm² = 96.7 in²
Ratio:  1:√2 (ISO 216 standard)
```

### Screen Canvas Dimensions:
```
Exactly matches physical A4 paper
CSS: width: 210mm, height: 297mm
Pixels: Depends on screen DPI (typically ~794 × 1123 at 96 DPI)
```

### Perfect Alignment Means:
```
Physical paper (0,0) → Screen canvas (0,0)
Physical paper (210mm,297mm) → Screen canvas (210mm,297mm)
Any point (x,y) on paper → Same point (x,y) on screen
```

---

## 🎨 Usage Workflow

### Daily Usage:

1. **Login** to your Medical Notes System
2. **Select patient** from list
3. **Click "Start Note Session"**
4. **Click "🎯 Calibrate"** (once per session)
5. **Place A4 paper** on digitizer
6. **Start writing** - pen position matches cursor!
7. **Write prescriptions**, vitals, notes naturally
8. **Click "Extract Text via OCR"** when done
9. **Gemini AI** extracts structured medical data
10. **Click "Save Note & Extract Data"**

### No need to recalibrate unless:
- You zoom in/out manually
- Browser window resizes
- You switch displays
- Alignment feels off

---

## 💡 Pro Tips

### For Best Results:

✅ **Use consistent paper**
- Always use A4 size
- Same paper thickness
- Same pen pressure

✅ **Proper lighting**
- Good lighting helps see cursor
- Reduces eye strain
- Better for long sessions

✅ **Clean pen tip**
- Dirt affects accuracy
- Clean weekly with soft cloth
- Check for wear

✅ **Stable surface**
- Digitizer on stable desk
- No wobbling or movement
- Comfortable writing height

✅ **Calibrate once per session**
- Click 🎯 Calibrate at start
- No need to recalibrate during session
- Quick reset if alignment feels off

---

## 🔍 Verification

### How to Know It's Working:

**Visual Check**:
- [ ] Cursor appears exactly under pen tip
- [ ] No lag between pen movement and cursor
- [ ] Lines drawn match pen path
- [ ] Corners of paper align with canvas corners

**Functional Check**:
- [ ] Can write smoothly without offset
- [ ] Pressure sensitivity works (if supported)
- [ ] Can draw precise shapes
- [ ] Text is legible and accurate

**OCR Check**:
- [ ] Gemini AI extracts text correctly
- [ ] Handwriting recognized accurately
- [ ] Medical terms identified properly
- [ ] Structured data extracted well

---

## 📊 Comparison: Before vs After

### Before Calibration:
```
Your Pen:           Screen Shows:
  Touch here ●      ← Dot appears here ●
                    (offset by 2 inches)
❌ Misaligned
```

### After Calibration:
```
Your Pen:           Screen Shows:
  Touch here ●      ← Dot appears here ●
                    (exact same spot)
✅ Perfect alignment
```

---

## 🎯 Quick Reference

| Action | Command |
|--------|---------|
| **Calibrate canvas** | Click 🎯 Calibrate button |
| **Reset browser zoom** | Press `Cmd+0` |
| **Rotate canvas** | Click 🔄 Rotate button |
| **Toggle panel** | Click "Hide/Show Panel" |
| **Extract OCR** | Click "Extract Text via OCR" |
| **Save notes** | Click "Save Note & Extract Data" |

---

## 🆘 Still Not Working?

### Last Resort Steps:

1. **Full reset sequence**:
   ```
   1. Click 🎯 Calibrate
   2. Press Cmd+0 (reset zoom)
   3. Refresh browser (Cmd+R)
   4. Click 🎯 Calibrate again
   ```

2. **Device reset**:
   ```
   1. Unplug iScribe digitizer
   2. Wait 10 seconds
   3. Plug back in
   4. Restart browser
   ```

3. **Software reset**:
   ```
   1. Quit browser completely
   2. Restart iScribe software
   3. Re-open Medical Notes System
   4. Start new session
   ```

4. **System check**:
   ```
   1. Update iScribe drivers
   2. Update macOS (if available)
   3. Check for firmware updates
   4. Contact iScribe support
   ```

---

## ✨ What You Get

With proper A4 calibration:

🎯 **Perfect alignment** - Pen matches cursor exactly  
📄 **Standard size** - Works with all A4 paper  
🤖 **Better OCR** - Gemini optimized for document size  
⚡ **Fast workflow** - No manual adjustments needed  
💾 **Consistent results** - Same quality every time  
📊 **Professional output** - Clean, precise medical notes  

---

**Status**: ✅ A4 size is now default and fixed  
**Calibration**: Click 🎯 Calibrate button anytime  
**Paper**: Standard A4 (210mm × 297mm)  
**Ready**: Place your A4 paper and start writing!
