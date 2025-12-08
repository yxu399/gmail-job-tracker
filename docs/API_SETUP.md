# Gemini API Setup Guide

Get your free Gemini API key in 3 steps.

## Step 1: Get API Key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Choose **"Create API key in new project"** (or select existing)
5. Copy the key (starts with `AIza...`)

**Save it somewhere safe** - you'll need it in the next step.

## Step 2: Add to Script

1. Open your Google Sheet
2. Go to **Extensions** > **Apps Script**
3. Find the `setupApiKey()` function
4. Replace `PASTE_YOUR_GEMINI_API_KEY_HERE` with your key:
   ```javascript
   const apiKey = 'AIzaSyD-your-actual-key-here';
   ```
5. Click **Run** > Select `setupApiKey`
6. Authorize when prompted

## Step 3: Secure It

**Important:** After running `setupApiKey()`, delete the API key from the script:

```javascript
const apiKey = 'PASTE_YOUR_GEMINI_API_KEY_HERE'; // ← Change back to this
```

The key is now safely stored in Script Properties.

---

## Verify It Works

Run `testGeminiApiKey()` to verify:
- Should see: `✓ API key works!`
- If error, check you copied the full key

---

## Pricing

**Free Tier:**
- 1,500 requests/day
- ~45,000 emails/month
- More than enough for job searching

**Paid Tier:**
- $0.00025 per request
- Only needed if processing 1,500+ emails/day

---

## Troubleshooting

**"API key not found"**
- Run `setupApiKey()` again
- Make sure you clicked "Run"

**"Invalid API key"**
- Check for extra spaces when copying
- Generate a new key and try again

**"Quota exceeded"**
- Wait 24 hours for reset
- Or upgrade to paid tier

---

## Security

✅ **Do:**
- Store in Script Properties
- Delete from script after setup
- Use free tier for testing

❌ **Don't:**
- Share your API key
- Commit to GitHub
- Leave in script code