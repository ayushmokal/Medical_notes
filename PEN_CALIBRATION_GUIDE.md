# 🎯 Digital Pen Calibration & Alignment Guide

## Problem: Pen Position Doesn't Match Screen Position

When using a digital pen/stylus (iScribe digitizer), the cursor/ink must appear **exactly** where the pen touches. Any offset means misalignment.

---

## ✅ Solutions Implemented

### 1. **Precise Pointer Event Handling**
```css
touchAction: 'none'           // Prevents browser interference
cursor: 'crosshair'            // Shows exact cursor position
user-select: none              // Prevents text selection during drawing
```

### 2. **1:1 Coordinate Mapping**
```javascript
camera: { x: 0, y: 0, z: 1 }  // z=1 means 100% zoom (no scaling)
transform: none                // No CSS transforms on canvas itself
```

### 3. **Calibration Button**
**New "🎯 Calibrate" button** in header:
- Resets camera to perfect 1:1 mapping
- Removes any zoom/pan that might cause offset
- Ensures pixel-perfect alignment

---

## 🎯 How to Calibrate Your Setup

### Step 1: Initial Test (30 seconds)
1. **Start a note session**
2. **Touch one corner** of your iScribe pad with the pen
3. **Observe** where the dot appears on screen
4. **Does it match?**
   - ✅ Yes → You're good to go!
   - ❌ No → Continue to Step 2

### Step 2: Click Calibrate (5 seconds)
1. **Click "🎯 Calibrate" button** in top header
2. **Wait for "Canvas calibrated!" message**
3. **Test again** - touch a corner
4. **Check alignment** - should be better now

### Step 3: Check Browser Zoom (if still off)
1. **Press `Cmd+0`** to reset browser zoom to 100%
2. **Check browser zoom indicator** (should show "100%")
3. **Test pen again**

### Step 4: Check Display Scaling (macOS)
1. **System Settings** > **Displays**
2. **Check "Scale"** setting
3. **Recommended**: Use "Default" or "More Space"
4. **Avoid**: "Larger Text" (causes scaling issues)

### Step 5: iScribe Device Calibration
If still misaligned, your digitizer needs calibration:
1. **Open iScribe software/driver settings**
2. **Look for "Calibration" option**
3. **Follow calibration wizard**:
   - Touch multiple points on screen
   - Software maps physical to screen coordinates
4. **Save calibration**

---

## 🔍 Troubleshooting Alignment Issues

### Issue 1: Cursor is offset by a fixed amount (e.g., 2 inches to the right)

**Cause**: Device calibration is off or wrong display is targeted

**Solutions**:
1. **Run iScribe calibration** (in device software)
2. **Check if digitizer is mapped to correct display**:
   - If you have multiple monitors, pen might be mapped to wrong one
   - In iScribe settings, select the display you're using
3. **Try different USB port** (sometimes helps with coordinate detection)

---

### Issue 2: Cursor alignment is good in one area, bad in another

**Cause**: Non-linear coordinate mapping or display scaling

**Solutions**:
1. **Disable display scaling**:
   - System Settings > Displays > Scale > Default
2. **Set browser to 100% zoom**: `Cmd+0`
3. **Re-calibrate iScribe** with 4-point or 9-point calibration
4. **Check for display rotation** (should be 0° in system settings)

---

### Issue 3: Cursor lags behind pen movement

**Cause**: Performance issue or wireless latency

**Solutions**:
1. **Use wired connection** if possible (not Bluetooth)
2. **Close other applications** to free up CPU
3. **Reduce canvas complexity**: Start fresh note session
4. **Check pen battery** (if wireless)

---

### Issue 4: Cursor jumps or jitters

**Cause**: Driver issues or interference

**Solutions**:
1. **Update iScribe drivers** to latest version
2. **Restart computer** (resets USB/driver state)
3. **Remove interference**:
   - Move away from magnets, phones
   - Check for loose USB connections
4. **Try different drawing tool** in tldraw (maybe pressure sensitivity issue)

---

### Issue 5: No cursor shows at all

**Cause**: Device not recognized or wrong input mode

**Solutions**:
1. **Check device connection**: LED on digitizer should be lit
2. **Check device manager/settings**: Is iScribe recognized?
3. **Try mouse first**: Does mouse work on canvas?
4. **Check tldraw tool selection**: Ensure pen/draw tool is selected
5. **Restart browser**: Sometimes fixes WebGL/canvas issues

---

## 🛠️ Technical Details

### What "🎯 Calibrate" Button Does:

```javascript
// Resets camera to exact 1:1 mapping
camera: { x: 0, y: 0, z: 1 }
// x, y = 0: Canvas centered at origin
// z = 1: 100% zoom (no scaling)

// Then fits canvas to view
zoomToFit({ duration: 0 })
// Ensures entire A4 canvas is visible
// No animation (duration: 0) for instant calibration
```

### Critical CSS for Alignment:

```css
/* Prevents browser from interfering with pen input */
touch-action: none !important;

/* Disables any transforms that might offset coordinates */
transform: none !important;
transform-origin: 0 0 !important;

/* Ensures 1:1 pixel mapping */
image-rendering: crisp-edges;

/* Shows exact cursor position */
cursor: crosshair !important;
```

---

## 📐 Coordinate System Explanation

### Physical Digitizer (iScribe):
```
(0,0) ───────────── (width,0)
  │                      │
  │     Writing Area     │
  │                      │
(0,height) ─────── (width,height)
```

### Browser Canvas (tldraw):
```
(0,0) ───────────── (210mm,0)
  │                      │
  │    A4 Canvas         │
  │    297mm tall        │
(0,297mm) ─────── (210mm,297mm)
```

### Perfect Alignment:
**Physical point (x, y)** → **Screen point (x, y)**

This requires:
1. ✅ Device properly calibrated
2. ✅ Browser zoom at 100%
3. ✅ Display scaling at 100%
4. ✅ No CSS transforms on canvas
5. ✅ Camera zoom at 1:1 (z=1)

---

## 🎨 Testing Alignment

### Quick Alignment Test:

**Draw a 4-corner test**:
1. Touch **top-left corner** of iScribe
2. Lift pen, touch **top-right corner**
3. Lift pen, touch **bottom-right corner**
4. Lift pen, touch **bottom-left corner**
5. **Connect back to top-left**

**Expected Result**: Perfect rectangle matching canvas edges

**If not perfect**:
- Corners don't align → Device calibration needed
- Rectangle is tilted → Rotation issue (use Rotate button)
- Rectangle is scaled → Zoom issue (click Calibrate button)

---

## ⚙️ Advanced Calibration

### For Maximum Precision:

1. **Set exact display resolution**:
   - System Settings > Displays
   - Use native resolution (best for pixel mapping)

2. **Disable Retina/HiDPI scaling**:
   - Some Macs have 2x pixel density
   - This can cause coordinate doubling
   - Check: `window.devicePixelRatio` in browser console
   - Should be 1 for perfect mapping (2 is common on Retina)

3. **Force 1:1 coordinate mapping**:
   ```javascript
   // Browser console command
   document.querySelector('.canvas-container').style.zoom = '100%';
   ```

4. **Check pointer event details**:
   ```javascript
   // Debug pen coordinates (browser console)
   document.addEventListener('pointermove', (e) => {
     console.log('Pen:', e.clientX, e.clientY, 'Pressure:', e.pressure);
   });
   ```

---

## 📱 Device-Specific Notes

### iScribe Digital Notepad:

**Common Settings**:
- **Pressure Sensitivity**: Enable for better writing feel
- **Palm Rejection**: Enable to prevent accidental touches
- **Hover Distance**: Adjust how close pen needs to be
- **Calibration**: Run 9-point calibration for best accuracy

**Mapping Mode**:
- **Pen Mode** ✅ Recommended: Absolute positioning
- **Mouse Mode** ❌ Avoid: Relative positioning (like trackpad)

**Display Mapping**:
- Map to **primary display** only
- If using multiple monitors, disable "Extend Desktop" during use

---

## ✅ Verification Checklist

Before starting medical notes, verify:

- [ ] Browser zoom is 100% (`Cmd+0`)
- [ ] Display scaling is default/native
- [ ] iScribe is connected and recognized
- [ ] LED on digitizer is lit
- [ ] Clicked "🎯 Calibrate" button
- [ ] Tested 4-corner alignment
- [ ] Cursor follows pen precisely
- [ ] No lag or jitter
- [ ] Pressure sensitivity works (if applicable)
- [ ] Can draw smooth curves

**All checked?** → You're ready for precise medical note-taking! ✍️

---

## 🚨 Emergency Fixes

### Nothing works? Try this sequence:

1. **Refresh browser** (`Cmd+R`)
2. **Click "🎯 Calibrate"**
3. **Press `Cmd+0`** (reset zoom)
4. **Restart iScribe device** (unplug/replug)
5. **Restart browser completely**
6. **Restart computer** (last resort)

### Still broken? Check:

1. **iScribe drivers installed?**
   - Visit manufacturer website
   - Download latest drivers for macOS 13.7
   
2. **Device permissions?**
   - System Settings > Privacy & Security > Input Monitoring
   - Ensure browser has permission

3. **USB connection?**
   - Try different USB port
   - Avoid USB hubs (use direct connection)
   - Check cable for damage

---

## 📊 Expected Performance

With proper calibration:

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| **Alignment Accuracy** | ±1mm | ±3mm | >5mm |
| **Input Latency** | <20ms | <50ms | >100ms |
| **Pressure Levels** | 2048+ | 1024+ | 256 |
| **Jitter** | None | Minimal | Noticeable |
| **Cursor Lag** | None | Slight | Obvious |

If you're in "Poor" column → Recalibrate or check device/drivers

---

## 💡 Pro Tips

1. **Calibrate at startup**: Click 🎯 Calibrate at start of each session
2. **Don't zoom manually**: Let tldraw handle zoom (or use Calibrate)
3. **Keep browser at 100%**: Never zoom browser while using pen
4. **Clean screen/pen tip**: Dirt can affect accuracy
5. **Proper lighting**: Helps you see cursor precisely
6. **Take breaks**: Pen fatigue affects accuracy

---

**Last Updated**: October 13, 2025  
**Status**: ✅ Calibration system implemented  
**Next**: Test with your iScribe and click 🎯 Calibrate button!
