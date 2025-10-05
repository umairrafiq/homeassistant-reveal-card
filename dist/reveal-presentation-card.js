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
          elements: [
            {
              type: "text",
              content: "This is a reveal.js presentation in Home Assistant",
              position: { x: 50, y: 60 },
              style: { fontSize: "1.2em", color: "#ffffff" }
            }
          ]
        },
        {
          title: "Live Data",
          elements: [
            {
              type: "entity",
              entity: "sensor.temperature",
              content: "Current temperature: {{entity.state}}°C",
              position: { x: 30, y: 50 },
              style: { fontSize: "1.5em", color: "#00ff00" }
            },
            {
              type: "entity",
              entity: "sensor.humidity",
              content: "Humidity: {{entity.state}}%",
              position: { x: 70, y: 70 },
              style: { fontSize: "1.2em", color: "#0088ff" }
            }
          ]
        }
      ]
    };
  }

  setConfig(config) {
    if (!config.slides || !Array.isArray(config.slides)) {
      throw new Error("You must define slides in your configuration");
    }

    // Migrate old format to new format
    this._config = this._migrateConfig(config);
    this._editMode = false;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._revealDeck && this._config) {
      this.updateSlides();
    }
  }

  _migrateConfig(config) {
    const migratedConfig = { ...config };

    migratedConfig.slides = config.slides.map(slide => {
      if (slide.elements) {
        return slide; // Already new format
      }

      // Convert old format to new format
      const newSlide = {
        title: slide.title,
        background: slide.background,
        elements: []
      };

      if (slide.content) {
        newSlide.elements.push({
          type: slide.entity ? "entity" : "text",
          content: slide.content,
          entity: slide.entity,
          position: { x: 50, y: 60 },
          style: { fontSize: "1.2em", color: "#ffffff" }
        });
      }

      return newSlide;
    });

    return migratedConfig;
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
      if (slideConfig && slideConfig.elements) {
        const contentDiv = slide.querySelector('.slide-content');
        if (contentDiv) {
          contentDiv.innerHTML = this._renderSlideElements(slideConfig.elements);
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

  _renderSlideElements(elements) {
    if (!elements || !Array.isArray(elements)) return '';

    return elements.map(element => {
      let content = element.content || '';

      if (element.entity && this._hass) {
        const entity = this._hass.states[element.entity];
        if (entity) {
          content = content.replace(/\{\{entity\.state\}\}/g, entity.state);
          content = content.replace(/\{\{entity\.name\}\}/g,
            entity.attributes.friendly_name || element.entity);

          Object.keys(entity.attributes).forEach(attr => {
            const regex = new RegExp(`\\{\\{entity\\.attributes\\.${attr}\\}\\}`, 'g');
            content = content.replace(regex, entity.attributes[attr]);
          });
        }
      }

      const position = element.position || { x: 50, y: 50 };
      const style = element.style || {};
      const styleString = Object.entries({
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        fontSize: style.fontSize || '1.2em',
        color: style.color || '#ffffff',
        fontWeight: style.fontWeight || 'normal',
        textAlign: style.textAlign || 'center',
        maxWidth: '80%',
        wordWrap: 'break-word',
        cursor: this._editMode ? 'move' : 'default',
        userSelect: this._editMode ? 'none' : 'auto',
        border: this._editMode ? '2px dashed rgba(255,255,255,0.5)' : 'none',
        padding: this._editMode ? '10px' : '0',
        borderRadius: this._editMode ? '5px' : '0',
        minWidth: this._editMode ? '100px' : 'auto',
        minHeight: this._editMode ? '40px' : 'auto'
      }).map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`).join('; ');

      const elementId = `element-${Math.random().toString(36).substr(2, 9)}`;
      const dragEvents = this._editMode ? `
        draggable="true"
        ondragstart="this.getRootNode().host._handleDragStart(event, '${elementId}')"
        ondragend="this.getRootNode().host._handleDragEnd(event)"
        onclick="this.getRootNode().host._handleElementClick(event, this)"
      ` : '';

      return `
        <div
          id="${elementId}"
          class="slide-element"
          style="${styleString}"
          data-element-type="${element.type}"
          data-entity="${element.entity || ''}"
          data-element-index="${elements.indexOf(element)}"
          ${dragEvents}
        >
          ${content}
        </div>
      `;
    }).join('');
  }

  render() {
    if (!this._config) return;

    const slides = this._config.slides.map(slide => {
      const bgStyle = slide.background ? `data-background="${slide.background}"` : '';
      return `
        <section ${bgStyle}>
          ${slide.title ? `<h2>${slide.title}</h2>` : ''}
          <div class="slide-content"
               ondrop="this.getRootNode().host._handleDrop(event)"
               ondragover="this.getRootNode().host._handleDragOver(event)">
            ${slide.elements ? this._renderSlideElements(slide.elements) : this._renderSlideContent(slide)}
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
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 400px;
        }

        .slide-content p {
          margin: 10px 0;
        }

        .slide-content h3 {
          margin-bottom: 20px;
        }

        .slide-element {
          transition: all 0.2s ease;
        }

        .slide-element:hover {
          transform: translate(-50%, -50%) scale(1.05) !important;
        }

        .edit-mode .slide-element {
          border: 2px dashed rgba(255,255,255,0.5) !important;
          padding: 10px !important;
          border-radius: 5px !important;
        }

        .edit-toolbar {
          position: fixed;
          top: 10px;
          right: 10px;
          z-index: 9999;
          display: flex;
          gap: 10px;
          background: rgba(0,0,0,0.8);
          padding: 10px;
          border-radius: 5px;
        }

        .edit-btn {
          background: var(--primary-color, #039be5);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }

        .edit-btn:hover {
          background: var(--primary-color-dark, #0277bd);
        }

        .edit-btn.active {
          background: var(--accent-color, #ff4444);
        }

        .element-properties {
          position: fixed;
          top: 60px;
          right: 10px;
          width: 300px;
          background: rgba(0,0,0,0.9);
          border: 1px solid #ccc;
          border-radius: 5px;
          padding: 15px;
          z-index: 10000;
          display: none;
          color: white;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }

        .element-properties.show {
          display: block;
        }

        .property-group {
          margin-bottom: 15px;
        }

        .property-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          font-size: 12px;
        }

        .property-group input,
        .property-group select,
        .property-group textarea {
          width: 100%;
          padding: 6px;
          border: 1px solid #555;
          border-radius: 3px;
          background: #333;
          color: white;
          font-size: 12px;
        }

        .property-row {
          display: flex;
          gap: 10px;
        }

        .property-row > div {
          flex: 1;
        }
      </style>
      
      <ha-card>
        ${this._config.title ? `<div class="card-header">${this._config.title}</div>` : ''}
        <div class="card-content ${this._editMode ? 'edit-mode' : ''}">
          <div class="edit-toolbar">
            <button class="edit-btn ${this._editMode ? 'active' : ''}"
                    onclick="this.getRootNode().host._toggleEditMode()">
              ${this._editMode ? 'Exit Edit' : 'Edit Mode'}
            </button>
            ${this._editMode ? `
              <button class="edit-btn" onclick="this.getRootNode().host._addTextElement()">
                Add Text
              </button>
              <button class="edit-btn" onclick="this.getRootNode().host._addEntityElement()">
                Add Entity
              </button>
              <button class="edit-btn" onclick="this.getRootNode().host._saveConfig()">
                Save
              </button>
            ` : ''}
          </div>

          <div class="element-properties" id="element-properties">
            <div class="property-group">
              <label>Content:</label>
              <textarea id="prop-content" rows="3"></textarea>
            </div>
            <div class="property-group">
              <label>Entity (optional):</label>
              <input type="text" id="prop-entity" placeholder="sensor.temperature">
            </div>
            <div class="property-row">
              <div class="property-group">
                <label>X Position (%):</label>
                <input type="number" id="prop-x" min="0" max="100" step="1">
              </div>
              <div class="property-group">
                <label>Y Position (%):</label>
                <input type="number" id="prop-y" min="0" max="100" step="1">
              </div>
            </div>
            <div class="property-group">
              <label>Font Size:</label>
              <select id="prop-fontsize">
                <option value="0.8em">Small</option>
                <option value="1.2em">Normal</option>
                <option value="1.5em">Large</option>
                <option value="2em">Extra Large</option>
              </select>
            </div>
            <div class="property-group">
              <label>Color:</label>
              <input type="color" id="prop-color" value="#ffffff">
            </div>
            <div style="margin-top: 15px; display: flex; gap: 10px;">
              <button class="edit-btn" onclick="this.getRootNode().host._applyElementProperties()" style="flex: 1;">
                Apply
              </button>
              <button class="edit-btn" onclick="this.getRootNode().host._deleteElement()" style="flex: 1; background: #ff4444;">
                Delete
              </button>
              <button class="edit-btn" onclick="this.getRootNode().host._hideProperties()" style="flex: 1; background: #666;">
                Cancel
              </button>
            </div>
          </div>

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

  // Editor functionality methods
  _toggleEditMode() {
    this._editMode = !this._editMode;
    this._selectedElement = null;
    this._hideProperties();

    // Update the toolbar buttons without re-rendering the entire card
    this._updateEditToolbar();

    // Re-render slides to show/hide edit mode styling
    this.updateSlides();
  }

  _updateEditToolbar() {
    const toolbar = this.shadowRoot.querySelector('.edit-toolbar');
    if (!toolbar) return;

    toolbar.innerHTML = `
      <button class="edit-btn ${this._editMode ? 'active' : ''}"
              onclick="this.getRootNode().host._toggleEditMode()">
        ${this._editMode ? 'Exit Edit' : 'Edit Mode'}
      </button>
      ${this._editMode ? `
        <button class="edit-btn" onclick="this.getRootNode().host._addTextElement()">
          Add Text
        </button>
        <button class="edit-btn" onclick="this.getRootNode().host._addEntityElement()">
          Add Entity
        </button>
        <button class="edit-btn" onclick="this.getRootNode().host._saveConfig()">
          Save
        </button>
      ` : ''}
    `;

    // Update card-content class
    const cardContent = this.shadowRoot.querySelector('.card-content');
    if (cardContent) {
      if (this._editMode) {
        cardContent.classList.add('edit-mode');
      } else {
        cardContent.classList.remove('edit-mode');
      }
    }
  }

  _addTextElement() {
    if (!this._editMode) return;

    const currentSlideIndex = this._revealDeck ? this._revealDeck.getIndices().h : 0;
    const slide = this._config.slides[currentSlideIndex];

    if (!slide.elements) {
      slide.elements = [];
    }

    slide.elements.push({
      type: 'text',
      content: 'New Text Element',
      position: { x: 50, y: 50 },
      style: { fontSize: '1.2em', color: '#ffffff' }
    });

    this.updateSlides();
  }

  _addEntityElement() {
    if (!this._editMode) return;

    const currentSlideIndex = this._revealDeck ? this._revealDeck.getIndices().h : 0;
    const slide = this._config.slides[currentSlideIndex];

    if (!slide.elements) {
      slide.elements = [];
    }

    slide.elements.push({
      type: 'entity',
      content: 'Entity: {{entity.state}}',
      entity: 'sensor.temperature',
      position: { x: 50, y: 50 },
      style: { fontSize: '1.2em', color: '#ffffff' }
    });

    this.updateSlides();
  }

  _handleDragStart(event, elementId) {
    if (!this._editMode) return;
    this._draggedElement = elementId;
    event.dataTransfer.setData('text/plain', elementId);
  }

  _handleDragEnd(event) {
    this._draggedElement = null;
  }

  _handleDragOver(event) {
    if (!this._editMode) return;
    event.preventDefault();
  }

  _handleDrop(event) {
    if (!this._editMode) return;
    event.preventDefault();

    const elementId = this._draggedElement;
    if (!elementId) return;

    const slideContent = event.currentTarget;
    const rect = slideContent.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    this._updateElementPosition(elementId, x, y);
  }

  _updateElementPosition(elementId, x, y) {
    const currentSlideIndex = this._revealDeck ? this._revealDeck.getIndices().h : 0;
    const slide = this._config.slides[currentSlideIndex];

    if (slide.elements) {
      const element = slide.elements.find(el => {
        const testEl = this.shadowRoot.getElementById(elementId);
        return testEl && testEl.dataset.entity === (el.entity || '') && testEl.textContent.trim() === this._renderElementContent(el).trim();
      });

      if (element) {
        element.position = { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
        this.updateSlides();
      }
    }
  }

  _renderElementContent(element) {
    let content = element.content || '';

    if (element.entity && this._hass) {
      const entity = this._hass.states[element.entity];
      if (entity) {
        content = content.replace(/\{\{entity\.state\}\}/g, entity.state);
        content = content.replace(/\{\{entity\.name\}\}/g,
          entity.attributes.friendly_name || element.entity);
      }
    }

    return content;
  }

  _showElementProperties(element, elementNode) {
    if (!this._editMode) return;

    this._selectedElement = { element, elementNode };

    const props = this.shadowRoot.getElementById('element-properties');
    const contentInput = this.shadowRoot.getElementById('prop-content');
    const entityInput = this.shadowRoot.getElementById('prop-entity');
    const xInput = this.shadowRoot.getElementById('prop-x');
    const yInput = this.shadowRoot.getElementById('prop-y');
    const fontSizeSelect = this.shadowRoot.getElementById('prop-fontsize');
    const colorInput = this.shadowRoot.getElementById('prop-color');

    contentInput.value = element.content || '';
    entityInput.value = element.entity || '';
    xInput.value = element.position ? element.position.x : 50;
    yInput.value = element.position ? element.position.y : 50;
    fontSizeSelect.value = element.style ? element.style.fontSize || '1.2em' : '1.2em';
    colorInput.value = element.style ? element.style.color || '#ffffff' : '#ffffff';

    props.classList.add('show');
  }

  _hideProperties() {
    const props = this.shadowRoot.getElementById('element-properties');
    if (props) {
      props.classList.remove('show');
    }
    this._selectedElement = null;
  }

  _applyElementProperties() {
    if (!this._selectedElement) return;

    const contentInput = this.shadowRoot.getElementById('prop-content');
    const entityInput = this.shadowRoot.getElementById('prop-entity');
    const xInput = this.shadowRoot.getElementById('prop-x');
    const yInput = this.shadowRoot.getElementById('prop-y');
    const fontSizeSelect = this.shadowRoot.getElementById('prop-fontsize');
    const colorInput = this.shadowRoot.getElementById('prop-color');

    const element = this._selectedElement.element;
    element.content = contentInput.value;
    element.entity = entityInput.value || undefined;
    element.position = {
      x: Math.max(5, Math.min(95, parseInt(xInput.value) || 50)),
      y: Math.max(5, Math.min(95, parseInt(yInput.value) || 50))
    };
    element.style = {
      fontSize: fontSizeSelect.value,
      color: colorInput.value
    };

    this.updateSlides();
    this._hideProperties();
  }

  _deleteElement() {
    if (!this._selectedElement) return;

    const currentSlideIndex = this._revealDeck ? this._revealDeck.getIndices().h : 0;
    const slide = this._config.slides[currentSlideIndex];

    if (slide.elements) {
      const elementIndex = slide.elements.findIndex(el => el === this._selectedElement.element);
      if (elementIndex !== -1) {
        slide.elements.splice(elementIndex, 1);
        this.updateSlides();
      }
    }

    this._hideProperties();
  }

  _handleElementClick(event, elementNode) {
    if (!this._editMode) return;
    event.stopPropagation();

    const currentSlideIndex = this._revealDeck ? this._revealDeck.getIndices().h : 0;
    const slide = this._config.slides[currentSlideIndex];
    const elementIndex = parseInt(elementNode.dataset.elementIndex);

    if (slide.elements && slide.elements[elementIndex]) {
      this._showElementProperties(slide.elements[elementIndex], elementNode);
    }
  }

  _saveConfig() {
    // Exit edit mode to trigger re-render with saved state
    this._editMode = false;

    // Fire event for Home Assistant to save the configuration
    const event = new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);

    // Force a setConfig call to persist the changes
    this.setConfig(this._config);

    // Also show a temporary notification
    const notification = document.createElement('div');
    notification.textContent = 'Configuration saved! Please save the dashboard to persist changes.';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 10000;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }
}

// Configuration Editor
class RevealPresentationCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this._config = { ...config };
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .editor {
          padding: 20px;
          background: var(--ha-card-background, #fff);
          border-radius: 8px;
          margin: 10px 0;
        }
        .form-row {
          margin-bottom: 15px;
          display: flex;
          align-items: center;
        }
        .form-row label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          min-width: 120px;
        }
        .form-row input,
        .form-row select {
          flex: 1;
          padding: 8px;
          border: 1px solid var(--divider-color);
          border-radius: 4px;
          margin-left: 10px;
        }
        .info {
          background: var(--info-color, #2196F3);
          color: white;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 15px;
        }
      </style>

      <div class="editor">
        <div class="info">
          ℹ️ Configure basic settings here. Use "Edit Mode" in the card to visually arrange text and entities on your slides.
        </div>

        <div class="form-row">
          <label>Title:</label>
          <input type="text" id="title" value="${this._config.title || ''}"
                 placeholder="Presentation Title">
        </div>

        <div class="form-row">
          <label>Theme:</label>
          <select id="theme">
            <option value="black" ${this._config.theme === 'black' ? 'selected' : ''}>Black</option>
            <option value="white" ${this._config.theme === 'white' ? 'selected' : ''}>White</option>
            <option value="league" ${this._config.theme === 'league' ? 'selected' : ''}>League</option>
            <option value="beige" ${this._config.theme === 'beige' ? 'selected' : ''}>Beige</option>
            <option value="sky" ${this._config.theme === 'sky' ? 'selected' : ''}>Sky</option>
            <option value="night" ${this._config.theme === 'night' ? 'selected' : ''}>Night</option>
            <option value="serif" ${this._config.theme === 'serif' ? 'selected' : ''}>Serif</option>
            <option value="simple" ${this._config.theme === 'simple' ? 'selected' : ''}>Simple</option>
            <option value="solarized" ${this._config.theme === 'solarized' ? 'selected' : ''}>Solarized</option>
          </select>
        </div>

        <div class="form-row">
          <label>Height (px):</label>
          <input type="number" id="height" value="${this._config.height || 600}"
                 min="300" max="1000" step="50">
        </div>

        <div class="form-row">
          <label>Show Controls:</label>
          <input type="checkbox" id="controls"
                 ${this._config.controls !== false ? 'checked' : ''}>
        </div>

        <div class="form-row">
          <label>Show Progress:</label>
          <input type="checkbox" id="progress"
                 ${this._config.progress !== false ? 'checked' : ''}>
        </div>
      </div>
    `;

    this._attachListeners();
  }

  _attachListeners() {
    const inputs = this.shadowRoot.querySelectorAll('input, select');
    inputs.forEach(input => {
      input.addEventListener('change', () => this._configChanged());
      input.addEventListener('input', () => this._configChanged());
    });
  }

  _configChanged() {
    const titleInput = this.shadowRoot.getElementById('title');
    const themeSelect = this.shadowRoot.getElementById('theme');
    const heightInput = this.shadowRoot.getElementById('height');
    const controlsCheck = this.shadowRoot.getElementById('controls');
    const progressCheck = this.shadowRoot.getElementById('progress');

    this._config = {
      ...this._config,
      title: titleInput.value,
      theme: themeSelect.value,
      height: parseInt(heightInput.value) || 600,
      controls: controlsCheck.checked,
      progress: progressCheck.checked
    };

    // Ensure slides array exists
    if (!this._config.slides) {
      this._config.slides = [{
        title: "Welcome",
        elements: [{
          type: "text",
          content: "Welcome to your presentation!",
          position: { x: 50, y: 50 },
          style: { fontSize: "1.5em", color: "#ffffff" }
        }]
      }];
    }

    const event = new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }
}

customElements.define('reveal-presentation-card-editor', RevealPresentationCardEditor);
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
