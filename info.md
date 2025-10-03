# Reveal.js Presentation Card

Transform your Home Assistant dashboard into an engaging presentation with live entity data.

## Features

✨ **Full-Screen Presentations** - Beautiful reveal.js powered slides
🔄 **Live Data** - Display real-time entity states in your slides  
🎨 **Multiple Themes** - Choose from 9 built-in professional themes
📱 **Responsive** - Works perfectly on desktop, tablet, and mobile
⚡ **Easy Configuration** - Simple YAML configuration

## Quick Start

```yaml
type: custom:reveal-presentation-card
title: My Smart Home
theme: black
slides:
  - title: Welcome
    content: Hello World
  - title: Temperature
    entity: sensor.temperature
    content: Current: {{entity.state}}°C
```

Perfect for dashboard kiosks, status displays, and home presentations!
