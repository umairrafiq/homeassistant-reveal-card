# Contributing to Reveal.js Presentation Card

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Your Home Assistant version
- Browser and version
- Card configuration (YAML)

### Suggesting Features

Feature requests are welcome! Please create an issue with:
- Clear description of the feature
- Use case and benefits
- Any implementation ideas you have

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages
6. Push to your fork
7. Create a Pull Request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/homeassistant-reveal-card.git
cd homeassistant-reveal-card

# Create feature branch
git checkout -b feature/my-new-feature

# Make changes to dist/reveal-presentation-card.js

# Test in Home Assistant
# Copy to /config/www/ and test
cp dist/reveal-presentation-card.js /path/to/homeassistant/config/www/

# Commit
git add .
git commit -m "Add amazing new feature"
git push origin feature/my-new-feature
```

### Testing

Before submitting a PR:
1. Test in Home Assistant with multiple browsers
2. Verify all configuration options work
3. Check console for errors
4. Test with different themes
5. Verify entity updates work correctly

### Code Style

- Use clear, descriptive variable names
- Add comments for complex logic
- Follow existing code style
- Keep functions focused and small

### Documentation

- Update README.md if adding features
- Add examples for new configuration options
- Update CHANGELOG.md

## Questions?

Feel free to open an issue for questions or discussions.

Thank you for contributing! 🎉
