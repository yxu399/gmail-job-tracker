# Setup Guide

Complete installation in 10 minutes.

## Prerequisites

- Gmail account
- Google account
- 10 minutes

---

## Step 1: Get Gemini API Key (2 min)

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Click **"Create API Key"**
3. Copy the key

**Detailed guide:** [API-SETUP.md](./API-SETUP.md)

---

## Step 2: Create Google Sheet (1 min)

1. Open [Google Sheets](https://sheets.new)
2. Name it: "Job Application Tracker"
3. Copy the URL from browser

**Example URL:**
```
https://docs.google.com/spreadsheets/d/1abc123.../edit
```

---

## Step 3: Install Script (3 min)

1. In your sheet: **Extensions** > **Apps Script**
2. Delete existing code
3. Copy all code from [`src/Code.js`](../src/Code.js)
4. Paste into editor
5. Click **Save** 💾

---

## Step 4: Configure (2 min)

**Update line 10:**
```javascript
const SHEET_URL = 'YOUR_GOOGLE_SHEET_URL_HERE';
```
Replace with your actual sheet URL.

**Update API key:**

Find `setupApiKey()` function:
```javascript
const apiKey = 'PASTE_YOUR_GEMINI_API_KEY_HERE';
```
Replace with your Gemini key.

---

## Step 5: Authorize (1 min)

1. Click **Run** > Select `setupApiKey`
2. Click **Review permissions**
3. Select your account
4. Click **Advanced** → **Go to [Project] (unsafe)**
5. Click **Allow**

**After success:**
- Delete API key from script (security)
- Change back to: `PASTE_YOUR_GEMINI_API_KEY_HERE`

---

## Step 6: Test (1 min)

1. Click **Run** > Select `testProcessing`
2. Check logs (bottom of screen)
3. Should see: `✓ Added confirmation: ...`
4. Verify data in your sheet

**No emails found?**
- Check you have job emails in last 7 days
- Try running `removeAllJobTrackedLabels()` first

---

## Step 7: Automate (1 min)

1. Click **Triggers** ⏰ (left sidebar)
2. Click **+ Add Trigger**
3. Configure:
   - Function: `dailyJobTracking`
   - Event: `Time-driven`
   - Type: `Day timer`
   - Time: `7am to 8am`
4. Click **Save**

---

## ✅ Done!

Your tracker is now running automatically every morning.

**What happens next:**
- Script runs daily at 7 AM
- New emails get processed
- Rejections auto-match to applications
- You get organized data in Google Sheets

---

## Verify Setup

Check these items:

- [ ] Sheet has "Applications" and "Rejections" tabs
- [ ] Headers are in both tabs
- [ ] At least 1 test email was processed
- [ ] Trigger is scheduled for 7 AM
- [ ] API key deleted from script

---

## Next Steps

**Customize:**
- [CONFIGURATION.md](./CONFIGURATION.md) - Adjust settings
- Add more ATS platforms to search query
- Change processing schedule

**Maintain:**
- Check sheet weekly
- Review unmatched rejections
- Update configurations as needed

---

## Troubleshooting

**Permission denied:**
- Make sure you authorized the script
- Check Apps Script has sheet access

**API key not found:**
- Run `setupApiKey()` again
- Verify key was copied correctly

**No emails processed:**
- Check Gmail search query matches your emails
- Remove `newer_than:7d` to process all emails
- Run `removeAllJobTrackedLabels()` to reprocess

**More help:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## Quick Reference

**Test functions:**
```javascript
testProcessing()           // Process 1 email
testGeminiApiKey()        // Verify API key
removeAllJobTrackedLabels() // Reprocess all emails
```

**Main functions:**
```javascript
dailyJobTracking()         // Full automation (trigger runs this)
processJobApplications()   // Process emails only
matchRejectionsToApplications() // Match rejections only
```

---

## Need Help?

- Review [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Check execution logs in Apps Script
- Open an issue on GitHub