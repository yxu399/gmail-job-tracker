# Troubleshooting Guide

Quick solutions to common issues.

---

## 🔍 No Emails Found

**Error:** `No new job application emails found.`

### Causes & Solutions

**1. Emails already processed**
- Check if emails have "Auto/Job-Tracked" label
- Solution: Run `removeAllJobTrackedLabels()` to reprocess

**2. Search query doesn't match**
- Your emails don't match the search criteria
- Solution: Test search in Gmail directly
  ```
  (subject:"application" OR from:greenhouse.io) -label:Auto/Job-Tracked
  ```

**3. Emails too old**
- Default searches last 7 days only
- Solution: Remove `newer_than:7d` from `SEARCH_QUERY`

**4. Wrong Gmail account**
- Script runs in account where it's installed
- Solution: Ensure script is in correct Google account

---

## 🔑 API Key Issues

### "API key not found"

**Cause:** `setupApiKey()` not run or failed

**Solution:**
1. Run `setupApiKey()` function
2. Check logs for success message
3. Verify key starts with `AIza`

### "Invalid API key"

**Cause:** Key copied incorrectly or expired

**Solution:**
1. Generate new key at [Google AI Studio](https://aistudio.google.com/apikey)
2. Copy full key (no spaces)
3. Run `setupApiKey()` again

### "Quota exceeded" (Error 429)

**Cause:** Hit 1,500 requests/day limit

**Solution:**
- Wait 24 hours for reset
- Reduce `MAX_EMAILS_PER_RUN`
- Upgrade to paid tier (if needed)

---

## 📧 Email Classification Issues

### Confirmations marked as "Other"

**Cause:** Email format doesn't match Gemini prompt

**Solution:**
1. Share email example (sanitized) in GitHub issue
2. Update Gemini prompt to include your keywords
3. Adjust classification rules

### Rejections not detected

**Cause:** Email uses different rejection language

**Solution:**
1. Check if email has "unfortunately", "not moving forward", etc.
2. Add custom keywords to Gemini prompt
3. Manually add to Rejections tab

---

## 🔗 Rejection Matching Issues

### Rejections not matching applications

**Symptoms:** Status stays "Applied" even after rejection

**Causes:**

**1. Position names differ**
- Confirmation: "Software Engineer II - Backend"
- Rejection: "Software Engineer, Backend"
- Check: Compare exact position names in both tabs

**2. No Job ID**
- Matching by position name only
- Minor differences prevent match

**3. Company names differ**
- Confirmation: "Google"
- Rejection: "Google LLC"

**Solutions:**
- Manually match using email links
- Report pattern in GitHub issue
- Job IDs are most reliable - include in applications

---

## ⏱️ Script Timeout

**Error:** `Exceeded maximum execution time`

**Cause:** Processing too many emails (>6 minutes)

**Solution:**
```javascript
const MAX_EMAILS_PER_RUN = 20; // Reduce from 50
```

Or process in batches:
1. Run script manually multiple times
2. Already-processed emails are skipped

---

## 📝 Sheet Issues

### Missing tabs

**Cause:** Tabs not created automatically

**Solution:**
- Run `processJobApplications()` once
- Script creates tabs automatically
- Or create manually with exact names

### Wrong column order

**Cause:** Headers created in wrong order

**Solution:**
1. Delete both tabs
2. Run script again
3. Headers will be created correctly

### Duplicate entries

**Cause:** Label not applied or duplicate detection failed

**Solution:**
1. Check email links in both tabs
2. Remove duplicates manually
3. Ensure `getExistingThreadIds()` is working

---

## 🚫 Permission Errors

### "You do not have permission to call..."

**Cause:** Script not authorized

**Solution:**
1. Run any function manually
2. Click "Review permissions"
3. Authorize the script
4. See [SETUP.md](./SETUP.md) for details

### "Script has insufficient permissions"

**Cause:** Missing Gmail/Sheets access

**Solution:**
- Re-authorize script
- Check account has Gmail and Sheets enabled

---

## 🐛 Gemini API Errors

### JSON parse error

**Symptom:** `Expected property name or '}' in JSON`

**Cause:** Gemini response truncated

**Solution:**
- Script has automatic recovery
- If persists, increase `maxOutputTokens`
- Or shorten email body truncation

### "No candidates in response"

**Cause:** Content blocked by safety filters

**Solution:**
- Check execution logs for reason
- Email might contain flagged content
- Process manually

---

## 🔧 Debug Mode

Enable detailed logging:

1. In `analyzeEmailWithGemini()`, uncomment:
   ```javascript
   console.log('Raw Gemini response:', textResponse);
   console.log('Parsed data:', JSON.stringify(extractedData));
   ```

2. Run script
3. Check **Executions** log for details

---

## 📊 Common Error Codes

| Error | Meaning | Solution |
|-------|---------|----------|
| 400 | Bad request | Check API key format |
| 403 | Forbidden | Enable Gemini API |
| 404 | Not found | Wrong API endpoint |
| 429 | Quota exceeded | Wait 24hrs or upgrade |
| 500 | Server error | Retry later |

---

## 🔄 Reset Everything

Start fresh:

1. **Remove all labels:**
   ```javascript
   removeAllJobTrackedLabels()
   ```

2. **Delete sheet tabs:**
   - Manually delete "Applications" and "Rejections"

3. **Clear script properties:**
   - Apps Script → Project Settings → Script Properties
   - Delete `GEMINI_API_KEY`
   - Run `setupApiKey()` again

4. **Re-run:**
   ```javascript
   processJobApplications()
   ```

---

## 📞 Still Stuck?

1. **Check logs:**
   - Apps Script → Executions
   - Look for specific error messages

2. **Test components:**
   ```javascript
   testGeminiApiKey()      // Is API working?
   testProcessing()        // Can it process 1 email?
   ```

3. **Search issues:**
   - GitHub Issues tab
   - Someone might have same problem

4. **Open issue:**
   - Include error message
   - Share relevant logs (remove personal info)
   - Describe what you tried

---

## 💡 Pro Tips

- **Save time:** Use `testProcessing()` to test 1 email before full run
- **Avoid duplicates:** Never remove labels manually
- **Monitor quota:** Check [AI Studio](https://aistudio.google.com/app/apikey) usage
- **Test searches:** Use Gmail search bar to verify query
- **Keep updated:** Check for script updates periodically

---

## Quick Fixes Checklist

When something breaks, try in order:

- [ ] Check execution logs for errors
- [ ] Verify API key is set (`testGeminiApiKey()`)
- [ ] Test with 1 email (`testProcessing()`)
- [ ] Check Gmail search matches emails
- [ ] Verify sheet URL is correct
- [ ] Re-authorize if permission error
- [ ] Reduce `MAX_EMAILS_PER_RUN` if timeout
- [ ] Remove labels and reprocess
- [ ] Check GitHub issues for similar problems

---

Need more help? [Open an issue](../../issues) on GitHub!