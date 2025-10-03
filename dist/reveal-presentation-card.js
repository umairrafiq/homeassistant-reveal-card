/**
 * Reveal.js Presentation Card for Home Assistant
 * 
 * @version 1.0.0
 * @author Umair Rafiq
 * @license MIT
 */

class RevealPresentationCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._revealLoaded = false;
    this._revealDeck = null;
  }

  static getConfigElement() {
    return document.createElement("reveal-presentation-card-editor");
  }

  static getStubConfig() {
    return {
      title: "My Presentation",
      theme: "black",
      height: 600,
      controls: true,
      progress: true,
      slides: [
        {
          title: "Welcome",
          content: "This is a reveal.js presentation in Home Assistant"
        },
        {
          title: "Live Data",
          entity: "sensor.temperature",
          content: "Current temperature: {{entity.state}}°C"
        }
      ]
    };
  }

  setConfig(config) {
    if (!config.slides || !Array.isArray(config.slides)) {
      throw new Error("You must define slides in your configuration");
    }
    this._config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._revealDeck && this._config) {
      this.updateSlides();
    }
  }

  connectedCallback() {
    this.render();
    if (this._config) {
      this._loadRevealJS();
    }
  }

  async _loadRevealJS() {
    if (this._revealLoaded) return;

    const theme = this._config.theme || 'black';

    const revealCSS = document.createElement('link');
    revealCSS.rel = 'stylesheet';
    revealCSS.href = 'https://cdn.jsdelivr.net/npm/reveal.js@4.5.0/dist/reveal.css';
    
    const themeCSS = document.createElement('link');
    themeCSS.rel = 'stylesheet';
    themeCSS.href = `https://cdn.jsdelivr.net/npm/reveal.js@4.5.0/dist/theme/${theme}.css`;
    
    this.shadowRoot.appendChild(revealCSS);
    this.shadowRoot.appendChild(themeCSS);

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/reveal.js@4.5.0/dist/reveal.js';
      script.onload = () => {
        this._revealLoaded = true;
        setTimeout(() => {
          this._initializeReveal();
          resolve();
        }, 100);
      };
      this.shadowRoot.appendChild(script);
    });
  }

  _initializeReveal() {
    const revealDiv = this.shadowRoot.querySelector('.reveal');
    if (!revealDiv || !window.Reveal) return;

    const deck = new window.Reveal(revealDiv, {
      embedded: true,
      width: this._config.width || '100%',
      height: this._config.height || 600,
      controls: this._config.controls !== false,
      progress: this._config.progress !== false,
      slideNumber: this._config.slideNumber || false,
      hash: false,
      respondToHashChanges: false,
      transition: this._config.transition || 'slide',
      backgroundTransition: this._config.backgroundTransition || 'fade'
    });

    deck.initialize().then(() => {
      this._revealDeck = deck;
      this.updateSlides();
    });
  }

  updateSlides() {
    if (!this._hass || !this._config) return;
    
    const slides = this.shadowRoot.querySelectorAll('section');
    slides.forEach((slide, index) => {
      const slideConfig = this._config.slides[index];
      if (slideConfig && slideConfig.entity) {
        const contentDiv = slide.querySelector('.slide-content');
        if (contentDiv) {
          contentDiv.innerHTML = this._renderSlideContent(slideConfig);
        }
      }
    });

    if (this._revealDeck) {
      this._revealDeck.sync();
    }
  }

  _renderSlideContent(slide) {
    let content = slide.content || '';
    
    if (slide.entity && this._hass) {
      const entity = this._hass.states[slide.entity];
      if (entity) {
        content = content.replace(/\{\{entity\.state\}\}/g, entity.state);
        content = content.replace(/\{\{entity\.name\}\}/g, 
          entity.attributes.friendly_name || slide.entity);
        
        Object.keys(entity.attributes).forEach(attr => {
          const regex = new RegExp(`\\{\\{entity\\.attributes\\.${attr}\\}\\}`, 'g');
          content = content.replace(regex, entity.attributes[attr]);
        });
      }
    }

    return content;
  }

  render() {
    if (!this._config) return;

    const slides = this._config.slides.map(slide => {
      const bgStyle = slide.background ? `data-background="${slide.background}"` : '';
      return `
        <section ${bgStyle}>
          ${slide.title ? `<h2>${slide.title}</h2>` : ''}
          <div class="slide-content">
            ${this._renderSlideContent(slide)}
          </div>
        </section>
      `;
    }).join('');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        ha-card {
          height: 100%;
          overflow: hidden;
        }

        .card-header {
          padding: 16px;
          font-size: 1.2em;
          font-weight: 500;
          border-bottom: 1px solid var(--divider-color);
        }

        .card-content {
          padding: 0;
          height: ${this._config.height || 600}px;
          position: relative;
        }

        .reveal {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .reveal .slides {
          text-align: center;
        }

        .slide-content {
          margin-top: 20px;
          font-size: 1.2em;
        }

        .slide-content p {
          margin: 10px 0;
        }

        .slide-content h3 {
          margin-bottom: 20px;
        }
      </style>
      
      <ha-card>
        ${this._config.title ? `<div class="card-header">${this._config.title}</div>` : ''}
        <div class="card-content">
          <div class="reveal">
            <div class="slides">
              ${slides}
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  getCardSize() {
    return this._config && this._config.height ? Math.ceil(this._config.height / 50) : 12;
  }
}

customElements.define('reveal-presentation-card', RevealPresentationCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "reveal-presentation-card",
  name: "Reveal.js Presentation Card",
  description: "Full-screen presentation card using reveal.js framework",
  preview: true,
  documentationURL: "https://github.com/umairrafiq/homeassistant-reveal-card"
});

console.info(
  '%c REVEAL-PRESENTATION-CARD %c v1.0.0 ',
  'color: white; background: #039be5; font-weight: 700;',
  'color: #039be5; background: white; font-weight: 700;'
);
