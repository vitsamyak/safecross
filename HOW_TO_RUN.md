# 🚀 How to Run the SafeCross Website

Your website is **static** (HTML + CSS + JavaScript). It's very easy to run!

## ⚡ Method 1: QUICKEST - Double-Click (Recommended)

1. Open your file manager (Finder on Mac, File Explorer on Windows)
2. Navigate to your project folder
3. **Double-click `index.html`**
4. Browser opens automatically ✓
5. Website loads instantly! 🎉

**That's it! No installation needed!**

---

## Method 2: Drag & Drop

1. Open your browser
2. Drag `index.html` into the browser window
3. Drop it
4. Website loads ✓

---

## Method 3: Open with Right-Click

### Windows:
```
Right-click index.html → Open with → Choose Chrome/Firefox/Edge
```

### Mac:
```
Right-click index.html → Open With → Choose browser
```

### Linux:
```
Right-click index.html → Open With → Choose browser
```

---

## Method 4: Using File Path

1. Open browser (Chrome, Firefox, Safari, Edge)
2. Press **Ctrl+O** (Windows/Linux) or **Cmd+O** (Mac)
3. Select `index.html`
4. Click Open

---

## Method 5: Use Local Server (Optional)

If you want to run on a local server:

### Python (Easiest if installed):
```bash
cd "/Users/samyakvikasgedam/Library/Mobile Documents/com~apple~CloudDocs/COLLEGE/FY/Sem-2/ASEP"
python3 -m http.server 8000
```
Then open: `http://localhost:8000`

### Node.js:
```bash
npx http-server
```
Then open: `http://localhost:8080`

### VS Code Live Server:
1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

---

## 📱 Test Responsiveness

1. Open website in browser
2. Press **F12** to open DevTools
3. Click 📱 icon (device mode toggle)
4. Test different sizes:
   - 375px (iPhone)
   - 412px (Android)
   - 768px (iPad)
   - 1024px (iPad Pro)
   - 1366px (Desktop)

5. Verify:
   - ✓ Burger menu appears on mobile
   - ✓ Full nav on desktop
   - ✓ No horizontal scroll
   - ✓ Text readable

---

## 🌐 Access from Phone (Same WiFi)

1. Get your computer's IP:
   - Windows: Run `ipconfig` in Command Prompt
   - Mac: Run `ifconfig` in Terminal
   - Look for IPv4 address (e.g., 192.168.1.100)

2. Run Python server:
   ```bash
   python3 -m http.server 8000
   ```

3. On your phone (same WiFi):
   - Open browser
   - Type: `http://YOUR_IP:8000`
   - Example: `http://192.168.1.100:8000`

---

## 🎯 Quick Start Summary

| What You Want | Do This |
|---|---|
| Run quickly | Double-click `index.html` |
| Test on phone | Use Python server + phone on same WiFi |
| Live reload | Use VS Code + Live Server |
| Mobile testing | Press F12 → Toggle device mode |

---

## ✅ Verify It Works

After opening the website, you should see:

**Desktop:**
- Full navigation bar (Dashboard, Status, Log, Analytics, System)
- Logo with status indicator (●LIVE)
- Large hero section with title
- Dashboard with stats
- Charts and content sections

**Mobile (< 768px):**
- Hamburger menu (☰) button
- Logo only in header
- Click burger → menu opens
- Content in single column
- All buttons full width

---

## 🚀 You're Ready!

Pick any method above and your website is running! 

**Recommended: Just double-click `index.html`** 👍

No servers, no commands, no installation needed!

