# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2024-12-09

### Added
- Initial release of Gmail Job Application Tracker
- AI-powered email classification using Gemini API
- Automatic rejection matching by Job ID and Position+Company
- Support for major ATS platforms (Greenhouse, Lever, Workday, Ashby, Workable)
- Daily automation with configurable triggers
- Duplicate prevention across both sheets
- Comprehensive error handling and JSON recovery
- Two-tab structure (Applications and Rejections)
- Date-only formatting (no timestamps)
- Email linking back to Gmail threads
- Status tracking (Applied/Rejected)
- Last updated timestamps

### Security
- API key storage in Script Properties
- No external data sharing
- All processing in user's Google account

