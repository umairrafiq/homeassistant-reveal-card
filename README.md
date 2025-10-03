# Home Assistant Reveal.js Presentation Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![GitHub release](https://img.shields.io/github/release/umairrafiq/homeassistant-reveal-card.svg)](https://github.com/umairrafiq/homeassistant-reveal-card/releases)

A custom Home Assistant Lovelace card that brings the power of [reveal.js](https://revealjs.com/) presentations to your dashboard.

## Features

- 📊 Full-screen presentation mode
- 🔄 Live Home Assistant entity data
- 🎨 9 built-in themes
- ⚡ Auto-updating values
- 📱 Responsive design
- 🎮 Keyboard and touch navigation
- ✨ **NEW: Visual Editor** - Drag and drop text anywhere on slides
- 🏷️ **NEW: Multiple Entities** - Support multiple entities per slide
- 🎯 **NEW: Click-to-Edit** - Click elements to modify properties
- 💾 **NEW: Live Preview** - See changes in real-time

## Installation

### HACS (Recommended)

1. Open HACS → Frontend
2. Click ⋮ → Custom repositories
3. Add: `https://github.com/umairrafiq/homeassistant-reveal-card`
4. Category: Lovelace
5. Install "Reveal.js Presentation Card"

### Manual

1. Download `reveal-presentation-card.js`
2. Copy to `/config/www/`
3. Add resource in Dashboard settings

## Quick Start

### Basic Configuration
```yaml
type: custom:reveal-presentation-card
title: Home Dashboard
theme: black
height: 600
slides:
  - title: Welcome
    elements:
      - type: text
        content: Your smart home at a glance
        position: { x: 50, y: 60 }
        style: { fontSize: "1.5em", color: "#ffffff" }

  - title: Live Data
    elements:
      - type: entity
        entity: sensor.living_room_temperature
        content: "Temperature: {{entity.state}}°C"
        position: { x: 30, y: 50 }
        style: { fontSize: "1.8em", color: "#00ff00" }
      - type: entity
        entity: sensor.humidity
        content: "Humidity: {{entity.state}}%"
        position: { x: 70, y: 70 }
        style: { fontSize: "1.2em", color: "#0088ff" }
```

### Using the Visual Editor

1. Add the card to your dashboard
2. Click the **"Edit Mode"** button in the top-right corner
3. Use **"Add Text"** or **"Add Entity"** to create new elements
4. **Drag elements** anywhere on the slide
5. **Click elements** to modify their properties
6. Click **"Save"** to persist your changes
7. Click **"Exit Edit"** when done

## Configuration

See [USER_GUIDE.md](USER_GUIDE.md) for complete documentation.

## Support

- [Report Issues](https://github.com/umairrafiq/homeassistant-reveal-card/issues)
- [Home Assistant Community](https://community.home-assistant.io/)

## License

MIT License - see LICENSE file
