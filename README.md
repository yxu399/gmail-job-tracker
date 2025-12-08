# 📧 Gmail Job Application Tracker

> Automatically track job applications and rejections from your Gmail inbox using AI-powered email classification.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Google Apps Script](https://img.shields.io/badge/Google%20Apps%20Script-4285F4?logo=google&logoColor=white)](https://developers.google.com/apps-script)
[![Gemini API](https://img.shields.io/badge/Gemini%20API-8E75B2?logo=google&logoColor=white)](https://ai.google.dev/)

**Stop manually tracking job applications.** This Google Apps Script automatically scans your Gmail inbox, classifies job-related emails using Gemini AI, and organizes everything into a Google Sheet—including automatic rejection matching.

[Features](#-features) • [Quick Start](#-quick-start) • [Setup Guide](#-setup-guide) • [How It Works](#-how-it-works) • [FAQ](#-faq)

---

## 🎯 Features

### Core Automation
- ✅ **AI-Powered Classification** - Gemini distinguishes confirmations from rejections automatically
- ✅ **Smart Data Extraction** - Captures company, position, job ID, location from any email format
- ✅ **Automatic Rejection Matching** - Matches rejections to applications by Job ID or Position+Company
- ✅ **Multi-ATS Support** - Works with Greenhouse, Lever, Workday, Ashby, and more
- ✅ **Daily Automation** - Runs automatically every morning at 7 AM
- ✅ **Duplicate Prevention** - Never creates the same record twice

---

## 📸 Demo

### Applications Dashboard
Track all applications with status, dates, and direct email links:
- Position, Job ID, Company, Location
- Application date and status tracking
- Direct links back to Gmail threads
- Automatic status updates from rejections

### Automated Rejection Matching
When a rejection email arrives, the script:
1. Extracts company, position, and job ID
2. Searches Applications tab for a match
3. Updates status to "Rejected" automatically
4. Records rejection date in "Last Updated"
5. Replaces email link with rejection email

---

## 🚀 Quick Start

**Requirements:** Gmail account, Google account

### 1️⃣ Get a Gemini API Key (Free)

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Click **"Create API Key"**
3. Copy your key (starts with `AIza...`)

**Cost:** Free tier includes 1,500 requests/day (~45,000 emails/month) — plenty for job searching!

### 2️⃣ Create Google Sheet

1. Create a [new Google Sheet](https://sheets.new)
2. Name it "Job Application Tracker" (or whatever you prefer)
3. Copy the URL from your browser

### 3️⃣ Install the Script

1. In your Google Sheet, click **Extensions** > **Apps Script**
2. Delete any existing code
3. Copy the entire script from [`Code.js`](./src/Code.js)
4. Paste it into the Apps Script editor
5. **Update line 10:** Replace `YOUR_GOOGLE_SHEET_URL_HERE` with your sheet URL
6. Click **Save** (💾 icon)

### 4️⃣ Configure API Key

1. In Apps Script editor, find the `setupApiKey()` function
2. Replace `PASTE_YOUR_GEMINI_API_KEY_HERE` with your actual API key
3. Click **Run** > Select `setupApiKey`
4. Authorize when prompted (see [Authorization Help](#authorization))
5. **Important:** After running, delete your API key from the script for security

### 5️⃣ Test It

Run `testProcessing()` to process 1 email:
1. Click **Run** > Select `testProcessing`
2. Check execution logs (bottom of screen)
3. Verify data appears in your sheet

### 6️⃣ Schedule Daily Runs

1. Click **Triggers** ⏰ (clock icon, left sidebar)
2. Click **+ Add Trigger**
3. Configure:
   - **Function:** `dailyJobTracking`
   - **Event source:** `Time-driven`
   - **Type:** `Day timer`
   - **Time:** `7am to 8am`
4. Click **Save**

**Done!** 🎉 Your tracker will run automatically every morning.

---

## 📚 Setup Guide

### Authorization

When you first run the script, Google will ask for permissions:

1. Click **Review permissions**
2. Select your Google account
3. You'll see "Google hasn't verified this app" ⚠️
   - This is normal for personal scripts
   - Click **Advanced**
   - Click **Go to [Your Project] (unsafe)**
4. Click **Allow**

**What permissions are needed:**
- ✅ Read Gmail emails
- ✅ Edit your Google Sheets
- ✅ Make external API calls (to Gemini)

### Sheet Structure

The script creates two tabs automatically:

#### **Applications Tab**
| Column | Description |
|--------|-------------|
| Position | Job title extracted from email |
| Job ID | Reference number (if present) |
| Company | Hiring company name |
| Location | Job location (if mentioned) |
| Date | Date email was received |
| Salary Range | (blank - for manual entry) |
| Email Link | Direct link to Gmail thread |
| Notes | (blank - for your notes) |
| Status | "Applied" or "Rejected" |
| Last Updated | Date of latest status change |

#### **Rejections Tab**
| Column | Description |
|--------|-------------|
| Date Received | When rejection was received |
| Company | Company that sent rejection |
| Position | Position that was rejected |
| Job ID | Reference number (if present) |
| Email Link | Link to rejection email |
| Notes | Match status (auto-populated) |

---

## 🔧 How It Works

### Email Classification

The script uses a sophisticated multi-step process:

```
1. Gmail Search
   ↓
   Finds emails matching criteria (subject keywords, known ATS platforms)
   
2. Gemini AI Analysis
   ↓
   Classifies: Confirmation / Rejection / Other
   Extracts: Company, Position, Job ID, Location
   
3. Smart Routing
   ↓
   Confirmations → Applications tab
   Rejections → Rejections tab
   Other (assessments, etc.) → Skipped
   
4. Rejection Matching
   ↓
   Attempts to match rejections to applications:
   - By Job ID (most reliable)
   - By Company + Position name
   
5. Status Update
   ↓
   Matched rejections update status to "Rejected"
   Updates "Last Updated" date
   Replaces email link with rejection link
```

### Supported ATS Platforms

The script automatically detects emails from:
- ✅ Greenhouse (`greenhouse.io`)
- ✅ Lever (`lever.co`)
- ✅ Workday (`myworkdayjobs.com`, `myworkday.com`, `workday.com`)
- ✅ Ashby (`ashbyhq.com`)
- ✅ Workable (`workable.com`)

**Want to add more?** Edit the `SEARCH_QUERY` variable and submit a PR!

---

## 🛠️ Configuration

### Change Processing Schedule

Edit the trigger time in the **Triggers** panel.

### Adjust Search Query

Want to catch different types of emails? Modify `SEARCH_QUERY` (line 14):

```javascript
// Example: Add more subject keywords
const SEARCH_QUERY = `
  (subject:("application" OR "interview" OR "coding challenge") 
   OR from:(greenhouse.io OR lever.co OR myworkdayjobs.com)) 
  -label:Auto/Job-Tracked 
  newer_than:7d
`;
```

### Process Old Emails

By default, the script only processes emails from the last 7 days. To process all historical emails:

1. Remove `newer_than:7d` from `SEARCH_QUERY`
2. Run `processJobApplications()` manually
3. Restore `newer_than:7d` after initial processing

### Change Email Limit

Modify `MAX_EMAILS_PER_RUN` (line 23):

```javascript
const MAX_EMAILS_PER_RUN = 50; // Process up to 50 emails per run
```

---

## 🐛 Troubleshooting

### "No new emails found"

**Possible causes:**
1. All emails already have "Auto/Job-Tracked" label
2. Emails are older than 7 days (if using `newer_than:7d`)
3. Search query doesn't match your emails

**Solutions:**
- Check if your emails have the label
- Try running `removeAllJobTrackedLabels()` to reprocess
- Test search in Gmail directly: Copy `SEARCH_QUERY` and paste into Gmail search

### "API key not found"

**Solution:** Run `setupApiKey()` function with your Gemini API key

### "Gemini API error: 429"

**Cause:** Exceeded free tier quota (1,500 requests/day)

**Solutions:**
- Wait 24 hours for quota reset
- Reduce `MAX_EMAILS_PER_RUN`
- Upgrade to paid Gemini tier (if needed)

### Emails Not Matching

**Symptoms:** Rejections appear in Rejections tab but don't update Applications

**Causes:**
1. Position names differ between confirmation and rejection
2. No Job ID to match on
3. Company names extracted differently

**Solutions:**
- Check the rejection email to see exact position/company text
- Manually match using the email links provided
- Report patterns you notice (open an issue!)

### Script Timeout (>6 minutes)

**Cause:** Processing too many emails at once

**Solutions:**
- Reduce `MAX_EMAILS_PER_RUN` to 20-30
- Run script multiple times
- Process historical emails in batches

---

## 🔒 Privacy & Security

### Your Data Stays Private

- ✅ **Script runs in YOUR Google account** - no data leaves Google
- ✅ **API calls go directly to Google (Gemini)** - no third parties
- ✅ **No external servers** - everything happens in your account
- ✅ **You control the data** - delete anytime

### API Key Security

**Do:**
- ✅ Store API key in Script Properties (using `setupApiKey()`)
- ✅ Delete key from script after running setup
- ✅ Use a free-tier API key for testing

**Don't:**
- ❌ Share your API key publicly
- ❌ Commit API key to GitHub
- ❌ Leave API key in the script code

### Permissions Explained

The script needs these permissions:
- **Gmail:** Read emails to extract application data
- **Sheets:** Write extracted data to your spreadsheet
- **External requests:** Call Gemini API for classification

**The script never:**
- ❌ Sends emails on your behalf
- ❌ Deletes emails
- ❌ Shares data with third parties
- ❌ Modifies email content

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Add New ATS Platforms

Know an ATS platform the script doesn't support? Add it to `SEARCH_QUERY`:

```javascript
// Add to line 14
OR from:(newplatform.com)
```

Then submit a PR with the platform name and example email.

### Improve Classification

Found emails that Gemini misclassifies? Share examples in an issue (remove personal info first).

### Report Bugs

Open an issue with:
- What you expected
- What actually happened
- Relevant logs (from Execution log)

### Suggest Features

Have an idea? Open an issue with the `enhancement` label.

---

## 📝 Roadmap

Planned features:

- [ ] **Weekly Digest Email** - Summary of applications/rejections
- [ ] **Analytics Dashboard** - Response rates, time-to-rejection stats
- [ ] **Export Options** - CSV, JSON export
- [ ] **Interview Tracking** - Detect and track interview invitations

**Want to contribute to these?** Comment on the relevant issue!

---

## ❓ FAQ

### Can I use this with multiple Gmail accounts?

Not currently. The script runs in one Google account. You could:
- Forward job emails to one account
- Set up separate trackers for each account

### Will this slow down my Gmail?

No. The script only runs once per day and processes a maximum of 50 emails per run.

### Can I customize the sheet columns?

Yes, but you'll need to modify:
1. `ensureHeaders()` function (to add/remove columns)
2. `addToApplicationsSheet()` function (to populate new columns)
3. `matchRejectionsToApplications()` function (to update correct columns)

### What if Gemini misclassifies an email?

You can:
- Manually fix it in the sheet
- Report the misclassification (open an issue)
- Remove the label and reprocess after updating the prompt

### How much does the Gemini API cost?

**Free tier:** 1,500 requests/day (~45,000 emails/month)  
**Paid tier:** $0.00025 per email (~$0.075/month for 10 emails/day)

For job searching, you'll stay well within the free tier.

### Can I run this less frequently than daily?

Yes. Change the trigger from "Day timer" to "Week timer" or "Hour timer" in the Triggers panel.

### What happens if the script fails?

You'll receive an email alert. Check the **Executions** log in Apps Script to see what went wrong. Most issues are transient (API timeouts) and will self-resolve on the next run.

---

## 🙏 Acknowledgments

- **Gemini API** - Google's AI for email classification
- **Google Apps Script** - Makes this possible without server setup
- Inspired by similar projects from the job-seeking community


## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

**TL;DR:** You can use, modify, and distribute this freely. Just keep the license notice.

---

## 💬 Support

- **Issues:** [GitHub Issues](../../issues)
- **Discussions:** [GitHub Discussions](../../discussions)

---

<div align="center">

**Built with ☕ and 🤖 by job seekers, for job seekers**

[⬆ Back to top](#-gmail-job-application-tracker)

</div>