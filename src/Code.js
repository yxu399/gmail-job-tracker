// ============================================================================
// JOB APPLICATION EMAIL TRACKER
// ============================================================================
// Automatically tracks job application confirmations and rejections from Gmail
// Uses Gemini AI to classify emails and extract structured data
// ============================================================================

// ============================================================================
// CONFIGURATION
// ============================================================================

const LABEL_NAME = 'Auto/Job-Tracked';
const APPLICATIONS_TAB = 'Applications';
const REJECTIONS_TAB = 'Rejections';

// TODO: Replace with your Google Sheet URL
const SHEET_URL = 'YOUR_GOOGLE_SHEET_URL_HERE';

// Gmail search query to find job application emails
const SEARCH_QUERY = `
  (subject:("application" OR "applying" OR "submission" OR "thank you for applying" 
           OR "thank you for your interest" OR "follow up" OR "thanks for applying") 
   OR from:(greenhouse.io OR lever.co OR myworkdayjobs.com OR myworkday.com 
           OR workday.com OR ashbyhq.com OR workable.com)) 
  -subject:"Script Failed" 
  -from:apps-scripts-notifications@google.com 
  -label:Auto/Job-Tracked 
  newer_than:7d
`.replace(/\s+/g, ' ').trim();

const MAX_EMAILS_PER_RUN = 50;

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Daily automation function - processes emails AND matches rejections
 * Set up a time-based trigger to run this function daily at 7 AM
 */
function dailyJobTracking() {
  processJobApplications();
  matchRejectionsToApplications();
}

/**
 * Main processing function - analyzes emails and populates sheets
 */
function processJobApplications() {
  try {
    console.log('Starting job application processing...');
    
    // Get Gemini API key from Script Properties
    const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in Script Properties. Please run setupApiKey() first.');
    }
    
    // Search for unprocessed emails
    const threads = GmailApp.search(SEARCH_QUERY, 0, MAX_EMAILS_PER_RUN);
    
    if (threads.length === 0) {
      console.log('No new job application emails found.');
      return;
    }
    
    console.log(`Found ${threads.length} emails to process.`);
    
    // Get or create sheets
    const spreadsheet = SpreadsheetApp.openByUrl(SHEET_URL);
    const applicationsSheet = getOrCreateSheet(spreadsheet, APPLICATIONS_TAB);
    const rejectionsSheet = getOrCreateSheet(spreadsheet, REJECTIONS_TAB);
    
    // Ensure headers exist
    ensureHeaders(applicationsSheet, APPLICATIONS_TAB);
    ensureHeaders(rejectionsSheet, REJECTIONS_TAB);
    
    // Get or create label
    let label = GmailApp.getUserLabelByName(LABEL_NAME);
    if (!label) {
      label = GmailApp.createLabel(LABEL_NAME);
    }
    
    // Get existing thread IDs to prevent duplicates
    const existingThreadIds = getExistingThreadIds(applicationsSheet, rejectionsSheet);
    
    // Process each email
    let processedCount = 0;
    let errorCount = 0;
    
    threads.forEach((thread, index) => {
      try {
        const threadId = thread.getId();
        
        // Skip if already processed
        if (existingThreadIds.has(threadId)) {
          console.log(`Skipping duplicate thread: ${threadId}`);
          thread.addLabel(label);
          return;
        }
        
        // Get email content
        const messages = thread.getMessages();
        const firstMessage = messages[0];
        const subject = firstMessage.getSubject();
        const body = firstMessage.getPlainBody();
        const date = firstMessage.getDate();
        const permalink = `https://mail.google.com/mail/u/0/#inbox/${threadId}`;
        
        // Send to Gemini for analysis
        console.log(`Processing email ${index + 1}/${threads.length}: ${subject}`);
        const extractedData = analyzeEmailWithGemini(apiKey, subject, body);
        
        if (!extractedData) {
          console.log(`Gemini returned no data for thread ${threadId}`);
          return;
        }
        
        // Route based on email type
        if (extractedData.email_type === 'confirmation') {
          addToApplicationsSheet(applicationsSheet, extractedData, date, permalink);
          console.log(`✓ Added confirmation: ${extractedData.company} - ${extractedData.position}`);
          processedCount++;
          thread.addLabel(label);
        } else if (extractedData.email_type === 'rejection') {
          addToRejectionsSheet(rejectionsSheet, extractedData, date, permalink);
          console.log(`✓ Added rejection: ${extractedData.company} - ${extractedData.position}`);
          processedCount++;
          thread.addLabel(label);
        } else {
          console.log(`Skipped 'other' type email: ${subject}`);
          // Don't label 'other' emails so they can be reprocessed if needed
        }
        
      } catch (error) {
        console.error(`Error processing thread: ${error.message}`);
        errorCount++;
      }
    });
    
    console.log(`\n=== Processing Complete ===`);
    console.log(`Processed: ${processedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Total emails: ${threads.length}`);
    
  } catch (error) {
    console.error(`Script failed: ${error.message}`);
    
    // Send alert email on critical failure
    GmailApp.sendEmail(
      Session.getActiveUser().getEmail(),
      'Job Application Tracker - Script Failed',
      `The job application tracker script encountered an error:\n\n${error.message}\n\nPlease check the logs.`
    );
    
    throw error;
  }
}

/**
 * Match rejections to applications and update status
 * Automatically runs after processJobApplications() in dailyJobTracking()
 */
function matchRejectionsToApplications() {
  try {
    console.log('Starting rejection matching...');
    
    const spreadsheet = SpreadsheetApp.openByUrl(SHEET_URL);
    const applicationsSheet = spreadsheet.getSheetByName(APPLICATIONS_TAB);
    const rejectionsSheet = spreadsheet.getSheetByName(REJECTIONS_TAB);
    
    if (!applicationsSheet || !rejectionsSheet) {
      console.log('One or both sheets not found.');
      return;
    }
    
    // Get all data from both sheets
    const appLastRow = applicationsSheet.getLastRow();
    const rejLastRow = rejectionsSheet.getLastRow();
    
    if (appLastRow <= 1) {
      console.log('No applications to match.');
      return;
    }
    
    if (rejLastRow <= 1) {
      console.log('No rejections to match.');
      return;
    }
    
    // Applications: Position | Job ID | Company | Location | Date | Salary Range | Email Link | Notes | Status | Last Updated
    const applicationsData = applicationsSheet.getRange(2, 1, appLastRow - 1, 10).getValues();
    
    // Rejections: Date Received | Company | Position | Job ID | Email Link | Notes
    const rejectionsData = rejectionsSheet.getRange(2, 1, rejLastRow - 1, 6).getValues();
    
    console.log(`Found ${applicationsData.length} applications and ${rejectionsData.length} rejections to check.`);
    
    let matchCount = 0;
    
    // For each rejection, try to find a matching application
    rejectionsData.forEach((rejRow, rejIndex) => {
      const rejDate = rejRow[0];
      const rejCompany = rejRow[1];
      const rejPosition = rejRow[2];
      const rejJobId = rejRow[3];
      const rejEmailLink = rejRow[4];
      const rejNotes = rejRow[5];
      
      // Skip if already marked as matched
      if (rejNotes && rejNotes.toString().includes('✓ Matched')) {
        return;
      }
      
      let matchedAppRow = null;
      let matchType = '';
      
      // Try to find matching application
      applicationsData.forEach((appRow, appIndex) => {
        const appPosition = appRow[0];
        const appJobId = appRow[1];
        const appCompany = appRow[2];
        const appStatus = appRow[8];
        
        // Skip if already rejected or already matched
        if (appStatus === 'Rejected' || matchedAppRow !== null) {
          return;
        }
        
        let isMatch = false;
        
        // PRIORITY 1: Match by Job ID (most reliable)
        if (rejJobId && appJobId) {
          const rejIdClean = rejJobId.toString().trim();
          const appIdClean = appJobId.toString().trim();
          
          if (rejIdClean === appIdClean) {
            isMatch = true;
            matchType = 'Job ID';
          }
        }
        
        // PRIORITY 2: Match by Company + Position name (exact match)
        if (!isMatch && rejCompany && appCompany && rejPosition && appPosition) {
          const rejCompanyClean = rejCompany.toString().trim().toLowerCase();
          const appCompanyClean = appCompany.toString().trim().toLowerCase();
          const rejPositionClean = rejPosition.toString().trim().toLowerCase();
          const appPositionClean = appPosition.toString().trim().toLowerCase();
          
          if (rejCompanyClean === appCompanyClean && rejPositionClean === appPositionClean) {
            isMatch = true;
            matchType = 'Company+Position';
          }
        }
        
        if (isMatch) {
          matchedAppRow = appIndex;
        }
      });
      
      // If match found, update both sheets
      if (matchedAppRow !== null) {
        const appRowNumber = matchedAppRow + 2;
        const rejRowNumber = rejIndex + 2;
        
        // Convert rejection date to date only (no timestamp)
        const rejDateOnly = new Date(rejDate.getFullYear(), rejDate.getMonth(), rejDate.getDate());
        
        // Update Application sheet
        applicationsSheet.getRange(appRowNumber, 9).setValue('Rejected'); // Status
        applicationsSheet.getRange(appRowNumber, 10).setValue(rejDateOnly); // Last Updated
        
        if (rejEmailLink) {
          applicationsSheet.getRange(appRowNumber, 7).setValue(rejEmailLink); // Email Link
        }
        
        // Mark rejection as matched in Notes column
        const matchNote = `✓ Matched (${matchType})`;
        rejectionsSheet.getRange(rejRowNumber, 6).setValue(matchNote);
        
        console.log(`✓ Updated: ${rejCompany} - ${rejPosition} → Rejected`);
        matchCount++;
      }
    });
    
    console.log(`\n=== Matching Complete ===`);
    console.log(`Matched ${matchCount} rejections to applications.`);
    
  } catch (error) {
    console.error(`Rejection matching failed: ${error.message}`);
    throw error;
  }
}

// ============================================================================
// GEMINI AI INTEGRATION
// ============================================================================

/**
 * Call Gemini API to analyze email and extract structured data
 * @param {string} apiKey - Gemini API key
 * @param {string} subject - Email subject line
 * @param {string} body - Email body text
 * @returns {Object|null} Extracted data or null if failed
 */
function analyzeEmailWithGemini(apiKey, subject, body) {
  // Truncate very long email bodies to avoid token limits
  const maxBodyLength = 3000;
  const truncatedBody = body.length > maxBodyLength 
    ? body.substring(0, maxBodyLength) + '... [truncated]' 
    : body;
  
  const prompt = `You are analyzing a job application email. Extract the following information and classify the email type.

Subject: ${subject}

Email content:
${truncatedBody}

Return ONLY valid JSON with this exact structure. Use null for missing values (no markdown, no backticks):
{
  "email_type": "confirmation",
  "company": "company name",
  "position": "job title",
  "location": null,
  "job_id": null
}

Classification Rules (follow strictly):

email_type = "confirmation" if email says:
- "thank you for applying"
- "we received your application" 
- "application submitted"
- "thanks for your interest"
- "we will review your application"
EVEN IF it mentions they may not respond to everyone

email_type = "rejection" if email explicitly says:
- "decided to pursue other candidates"
- "unfortunately"
- "will not be moving forward"
- "not selected"
- "position has been filled"
- "we won't be able to proceed"
- "after reviewing your application... unfortunately"

email_type = "other" for:
- Assessment/coding challenge invitations
- Interview scheduling
- Requests for more information

Key distinction: 
- "Thanks for applying, we may not respond to everyone" = CONFIRMATION (not a rejection yet)
- "Unfortunately, we won't be able to invite you" = REJECTION (explicit rejection)

Other fields:
- company: Extract the actual hiring company name (e.g., "Whatnot", "Cloudflare"), NOT the email platform (e.g., not "Ashby" or "Greenhouse")
- position: Extract the exact job title as mentioned in the email
- location: Extract location if clearly mentioned, otherwise null
- job_id: Extract reference/requisition number if present, otherwise null

IMPORTANT: Return complete, valid JSON. If unsure about a field, use null.`;

  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.0,
      maxOutputTokens: 1500
    }
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode !== 200) {
      console.error(`Gemini API error: ${responseCode} - ${response.getContentText()}`);
      return null;
    }
    
    const result = JSON.parse(response.getContentText());
    
    // Check if response has candidates
    if (!result.candidates || result.candidates.length === 0) {
      console.error('No candidates in Gemini response');
      if (result.promptFeedback && result.promptFeedback.blockReason) {
        console.error('Content was blocked. Reason: ' + result.promptFeedback.blockReason);
      }
      return null;
    }
    
    // Check if candidate was blocked
    const candidate = result.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      console.error('Candidate content is empty or blocked');
      if (candidate.finishReason) {
        console.error('Finish reason: ' + candidate.finishReason);
      }
      return null;
    }
    
    const textResponse = candidate.content.parts[0].text;
    
    // Clean up response (remove markdown code blocks if present)
    let cleanedResponse = textResponse.trim()
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    // Try to parse JSON
    let extractedData;
    try {
      extractedData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('JSON parse error. Raw response:', textResponse);
      
      // Try to fix truncated JSON
      if (cleanedResponse.includes('"email_type"') && !cleanedResponse.endsWith('}')) {
        extractedData = attemptJsonRecovery(cleanedResponse);
        if (!extractedData) return null;
      } else {
        return null;
      }
    }
    
    // Validate required fields
    if (!extractedData.email_type) {
      console.error('Missing email_type in Gemini response');
      return null;
    }
    
    if (!extractedData.company && !extractedData.position) {
      console.error('Missing both company and position in Gemini response');
      return null;
    }
    
    // Set defaults for missing fields
    extractedData.company = extractedData.company || 'Unknown';
    extractedData.position = extractedData.position || 'Unknown';
    extractedData.location = extractedData.location || null;
    extractedData.job_id = extractedData.job_id || null;
    
    return extractedData;
    
  } catch (error) {
    console.error(`Error calling Gemini API: ${error.message}`);
    return null;
  }
}

/**
 * Attempt to recover truncated JSON response
 * @param {string} truncatedJson - Incomplete JSON string
 * @returns {Object|null} Parsed object or null if recovery failed
 */
function attemptJsonRecovery(truncatedJson) {
  try {
    console.log('Attempting to fix truncated JSON...');
    
    let fixed = truncatedJson.replace(/,\s*$/, ''); // Remove trailing comma
    
    // Add missing fields with defaults
    if (!fixed.includes('"location"')) {
      fixed += ', "location": null';
    }
    if (!fixed.includes('"job_id"')) {
      fixed += ', "job_id": null';
    }
    
    // Close unterminated strings
    const lastQuoteIndex = fixed.lastIndexOf('"');
    const textAfterLastQuote = fixed.substring(lastQuoteIndex + 1);
    if (!textAfterLastQuote.includes('"') && textAfterLastQuote.includes(':')) {
      fixed += '"';
    }
    
    // Add closing brace
    if (!fixed.endsWith('}')) {
      fixed += ' }';
    }
    
    const recovered = JSON.parse(fixed);
    console.log('✓ Successfully recovered truncated JSON');
    return recovered;
    
  } catch (fixError) {
    console.error('Could not fix truncated JSON:', fixError.message);
    return null;
  }
}

// ============================================================================
// SHEET MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Get or create a sheet by name
 */
function getOrCreateSheet(spreadsheet, sheetName) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    console.log(`Created new sheet: ${sheetName}`);
  }
  
  return sheet;
}

/**
 * Ensure headers exist in sheets
 */
function ensureHeaders(sheet, sheetName) {
  if (sheet.getLastRow() === 0) {
    if (sheetName === APPLICATIONS_TAB) {
      const headers = ['Position', 'Job ID', 'Company', 'Location', 'Date', 
                       'Salary Range', 'Email Link', 'Notes', 'Status', 'Last Updated'];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      console.log(`Added headers to ${sheetName}`);
    } else if (sheetName === REJECTIONS_TAB) {
      const headers = ['Date Received', 'Company', 'Position', 'Job ID', 'Email Link', 'Notes'];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      console.log(`Added headers to ${sheetName}`);
    }
  }
}

/**
 * Add confirmation email data to Applications sheet
 */
function addToApplicationsSheet(sheet, data, date, permalink) {
  // Convert timestamp to date only (no time)
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const row = [
    data.position || '',
    data.job_id || '',
    data.company || '',
    data.location || '',
    dateOnly,
    '',                    // Salary Range (blank)
    permalink,
    '',                    // Notes (blank)
    'Applied',
    dateOnly               // Last Updated
  ];
  
  sheet.appendRow(row);
}

/**
 * Add rejection email data to Rejections sheet
 */
function addToRejectionsSheet(sheet, data, date, permalink) {
  // Convert timestamp to date only (no time)
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const row = [
    dateOnly,
    data.company || '',
    data.position || '',
    data.job_id || '',
    permalink,
    'Match to main sheet manually'
  ];
  
  sheet.appendRow(row);
}

/**
 * Get existing thread IDs from both sheets to prevent duplicates
 */
function getExistingThreadIds(applicationsSheet, rejectionsSheet) {
  const threadIds = new Set();
  
  // Check Applications sheet for email links (column 7)
  if (applicationsSheet.getLastRow() > 1) {
    const applicationsData = applicationsSheet.getRange(2, 7, applicationsSheet.getLastRow() - 1, 1).getValues();
    applicationsData.forEach(row => {
      const link = row[0];
      if (link) {
        const match = link.toString().match(/inbox\/([a-zA-Z0-9]+)/);
        if (match) {
          threadIds.add(match[1]);
        }
      }
    });
  }
  
  // Check Rejections sheet for email links (column 5)
  if (rejectionsSheet.getLastRow() > 1) {
    const rejectionsData = rejectionsSheet.getRange(2, 5, rejectionsSheet.getLastRow() - 1, 1).getValues();
    rejectionsData.forEach(row => {
      const link = row[0];
      if (link) {
        const match = link.toString().match(/inbox\/([a-zA-Z0-9]+)/);
        if (match) {
          threadIds.add(match[1]);
        }
      }
    });
  }
  
  return threadIds;
}

// ============================================================================
// SETUP & UTILITY FUNCTIONS
// ============================================================================

/**
 * Setup function - Run this ONCE to store your Gemini API key
 * After running, remove your API key from this function for security
 */
function setupApiKey() {
  const apiKey = 'PASTE_YOUR_GEMINI_API_KEY_HERE';
  
  if (apiKey === 'PASTE_YOUR_GEMINI_API_KEY_HERE') {
    throw new Error('Please paste your actual Gemini API key in the setupApiKey() function');
  }
  
  PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', apiKey);
  console.log('✓ API key stored successfully!');
  console.log('Remember to remove the key from this script for security.');
}

/**
 * Test function - Process just 1 email to verify setup
 */
function testProcessing() {
  const testThreads = GmailApp.search(SEARCH_QUERY, 0, 1);
  
  if (testThreads.length === 0) {
    console.log('No test emails found. Try adjusting the search query or removing the newer_than:7d filter.');
    return;
  }
  
  console.log(`Testing with 1 email: ${testThreads[0].getFirstMessageSubject()}`);
  processJobApplications();
}

/**
 * Remove all Auto/Job-Tracked labels - useful for reprocessing emails
 * USE WITH CAUTION: This will cause all emails to be reprocessed
 */
function removeAllJobTrackedLabels() {
  const label = GmailApp.getUserLabelByName(LABEL_NAME);
  if (!label) {
    console.log('Label not found');
    return;
  }
  
  const threads = label.getThreads();
  console.log(`Removing label from ${threads.length} emails...`);
  
  threads.forEach(thread => {
    thread.removeLabel(label);
  });
  
  console.log('✓ Done! All labels removed.');
}

/**
 * Authorization helper - Run this to grant necessary permissions
 */
function authorizeScript() {
  UrlFetchApp.fetch('https://www.google.com');
  GmailApp.search('test');
  SpreadsheetApp.openByUrl(SHEET_URL);
  
  console.log('✓ Script authorized successfully!');
}

// ============================================================================
// TESTING FUNCTIONS (Optional - for development/debugging)
// ============================================================================

/**
 * Test Gemini API key
 */
function testGeminiApiKey() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  
  if (!apiKey) {
    console.log('ERROR: No API key found. Run setupApiKey() first.');
    return;
  }
  
  console.log('Testing API key...');
  console.log('API key starts with: ' + apiKey.substring(0, 10) + '...');
  
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{
      parts: [{
        text: "Say 'Hello' if you can read this."
      }]
    }]
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    
    if (responseCode === 200) {
      console.log('✓ API key works!');
      const result = JSON.parse(response.getContentText());
      console.log('Gemini said: ' + result.candidates[0].content.parts[0].text);
    } else {
      console.log('✗ API key error. Response code:', responseCode);
      console.log('Response:', response.getContentText());
    }
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

/**
 * List available Gemini models
 */
function listGeminiModels() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  
  if (!apiKey) {
    console.log('ERROR: No API key found.');
    return;
  }
  
  const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
  
  try {
    const response = UrlFetchApp.fetch(url, { method: 'get', muteHttpExceptions: true });
    const result = JSON.parse(response.getContentText());
    
    if (response.getResponseCode() === 200 && result.models) {
      console.log('Available models:');
      result.models.forEach(model => {
        console.log(`- ${model.name}`);
        if (model.supportedGenerationMethods) {
          console.log(`  Methods: ${model.supportedGenerationMethods.join(', ')}`);
        }
      });
    }
  } catch (error) {
    console.error('Error listing models:', error.message);
  }
}