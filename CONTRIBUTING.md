# Contributing to Gmail Job Application Tracker

First off, thank you for considering contributing to this project! 🎉

Job seekers around the world benefit from improvements to this tool, and your contribution makes a real difference.

## Ways to Contribute

### 🐛 Report Bugs

Found a bug? Please open an issue with:

- **Clear title** - "Rejection matching fails for Company X"
- **Steps to reproduce** - What did you do?
- **Expected behavior** - What should have happened?
- **Actual behavior** - What actually happened?
- **Logs** - Copy relevant logs from Execution log (remove personal info!)
- **Email example** - Share a sanitized version of the problematic email

### 💡 Suggest Features

Have an idea for improvement? Open an issue with:

- **Use case** - Why is this feature needed?
- **Proposed solution** - How would it work?
- **Alternatives considered** - Other approaches you thought about

### 🔧 Add ATS Platform Support

Know an ATS platform we're missing? Add it!

1. Identify the email domain (e.g., `platform.com`)
2. Fork the repo
3. Add to `SEARCH_QUERY` in `Code.js`:
   ```javascript
   OR from:(newplatform.com)
   ```
4. Test with your own emails
5. Submit PR with:
   - Platform name
   - Example email (sanitized)
   - Test results

### 📝 Improve Documentation

Documentation improvements are always welcome:

- Fix typos
- Clarify confusing sections
- Add examples
- Translate to other languages

### 💻 Code Contributions

#### Before You Start

1. **Check existing issues** - Someone might already be working on it
2. **Open an issue first** - Discuss major changes before coding
3. **Keep it simple** - This is meant to be accessible to job seekers, not just developers

#### Development Setup

1. Fork the repository
2. Create a test Google Sheet
3. Set up a test Gemini API key
4. Make your changes in `Code.gs`
5. Test thoroughly with your own emails

#### Code Style

- Use clear, descriptive variable names
- Add comments for complex logic
- Follow existing code structure
- Keep functions focused and small

#### Testing Your Changes

Before submitting:

- [ ] Test with at least 5 real emails
- [ ] Verify both confirmations and rejections work
- [ ] Check that existing functionality still works
- [ ] Test edge cases (missing data, unusual formats)
- [ ] Review execution logs for errors

### 📋 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/add-new-platform
   ```

2. **Make your changes**
   - Write clear commit messages
   - Keep commits focused and atomic

3. **Test everything**
   - Run the script multiple times
   - Check for errors in execution logs

4. **Update documentation**
   - Update README if adding features
   - Add your platform to supported list

5. **Submit PR with:**
   - **Clear title** - "Add support for Platform X"
   - **Description** - What does this PR do?
   - **Testing done** - How did you test it?
   - **Screenshots** - If UI-related

6. **Respond to feedback**
   - Be open to suggestions
   - Make requested changes promptly

## Code of Conduct

### Our Standards

- **Be welcoming** - This is for everyone, regardless of experience level
- **Be respectful** - Disagree constructively
- **Be patient** - Remember maintainers are volunteers
- **Be helpful** - Share your knowledge

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Publishing others' private information
- Unprofessional conduct

## Questions?

- Open an issue with the `question` label
- Join discussions in GitHub Discussions
- Check existing issues and documentation first

---

**Thank you for helping make job searching a little less painful!** ❤️