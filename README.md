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

```yaml
type: custom:reveal-presentation-card
title: Home Dashboard
theme: black
height: 600
slides:
  - title: Welcome
    content: Your smart home at a glance
  
  - title: Temperature
    entity: sensor.living_room_temperature
    content: Temperature: {{entity.state}}°C
```

## Configuration

See [USER_GUIDE.md](USER_GUIDE.md) for complete documentation.

## Support

- [Report Issues](https://github.com/umairrafiq/homeassistant-reveal-card/issues)
- [Home Assistant Community](https://community.home-assistant.io/)

## License

MIT License - see LICENSE file
