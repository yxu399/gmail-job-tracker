# Configuration Guide

Customize the tracker to match your needs.

## Basic Configuration

All configuration is at the top of `Code.js`:

```javascript
// Lines 8-23
const LABEL_NAME = 'Auto/Job-Tracked';
const APPLICATIONS_TAB = 'Applications';
const REJECTIONS_TAB = 'Rejections';
const SHEET_URL = 'YOUR_GOOGLE_SHEET_URL_HERE';
const SEARCH_QUERY = '...';
const MAX_EMAILS_PER_RUN = 50;
```

---

## Change Gmail Label

**Default:** `Auto/Job-Tracked`

```javascript
const LABEL_NAME = 'Job-Apps-Processed';
```

This label marks emails as processed to avoid duplicates.

---

## Rename Sheet Tabs

**Defaults:** `Applications`, `Rejections`

```javascript
const APPLICATIONS_TAB = 'My Applications';
const REJECTIONS_TAB = 'My Rejections';
```

---

## Adjust Email Search

Add more keywords or email domains:

```javascript
const SEARCH_QUERY = `
  (subject:("application" OR "applied" OR "interview" OR "coding challenge") 
   OR from:(greenhouse.io OR lever.co OR myworkday.com OR newplatform.com)) 
  -label:Auto/Job-Tracked 
  newer_than:7d
`;
```

**Common additions:**
- Keywords: `"interview"`, `"coding challenge"`, `"assessment"`
- Domains: Add your company-specific ATS platforms

---

## Change Processing Window

**Default:** Last 7 days

```javascript
// Process last 30 days
newer_than:30d

// Process last 1 day
newer_than:1d

// Process ALL emails (remove entirely)
// Just delete: newer_than:7d
```

---

## Change Email Limit

**Default:** 50 emails per run

```javascript
const MAX_EMAILS_PER_RUN = 100;  // Process more
const MAX_EMAILS_PER_RUN = 20;   // Process fewer (if timeouts occur)
```

Google Apps Script has a 6-minute timeout. Reduce if hitting limits.

---

## Advanced: Customize Gemini Prompt

Edit the prompt in `analyzeEmailWithGemini()` function (line ~280):

```javascript
const prompt = `You are analyzing a job application email...

[Modify classification rules here]

email_type = "confirmation" if email says:
- Add your custom keywords here
`;
```

**Use cases:**
- Add non-English keywords
- Handle company-specific formats
- Adjust classification rules

---

## Schedule Changes

Change when the script runs:

1. Apps Script → **Triggers** ⏰
2. Edit existing trigger
3. Change time (e.g., 6am, 8am, hourly)

---

## Multiple Triggers

Want to run multiple times per day?

1. Create additional triggers
2. All pointing to `dailyJobTracking`
3. Different times (e.g., 7am, 7pm)

---

## Disable Features

**Skip rejection matching:**

Comment out in `dailyJobTracking()`:

```javascript
function dailyJobTracking() {
  processJobApplications();
  // matchRejectionsToApplications();  // ← Disable
}
```

**Skip certain email types:**

Modify routing in `processJobApplications()` (line ~190).

---

## Debug Mode

Enable verbose logging:

Uncomment console.log lines in the script, or add your own:

```javascript
console.log('Processing email:', subject);
console.log('Extracted data:', JSON.stringify(extractedData));
```

View logs: Apps Script → **Executions**

---

## Common Configurations

### Process Only Recent Emails
```javascript
newer_than:1d
MAX_EMAILS_PER_RUN = 10
```

### Aggressive Processing (Catch Everything)
```javascript
// Remove newer_than:7d
MAX_EMAILS_PER_RUN = 100
```

### Specific Companies Only
```javascript
const SEARCH_QUERY = `
  from:(jobs@google.com OR careers@meta.com)
  -label:Auto/Job-Tracked
`;
```

---

## Need Help?

- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Open an issue on GitHub
- Review execution logs for errors