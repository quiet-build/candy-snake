import { mount } from './mount';

class ArcadeElement extends HTMLElement {
  private session?: ReturnType<typeof mount>;
  connectedCallback() {
    if (this.session) return;
    const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
    const send = (name: string, detail = {}) => this.dispatchEvent(new CustomEvent(name, { detail: { gameId: 'candy-snake', ...detail }, bubbles: true, composed: true }));
    try {
      const style = document.createElement('style');
      style.textContent = `:host{display:block;min-width:0;container-type:inline-size}main{width:min(100%,720px);height:min(820px,calc(100cqw + 250px));min-height:520px;margin:auto;background:#f5f2e8;outline-offset:-3px}canvas{display:block;touch-action:none}`;
      const container = document.createElement('main');
      shadow.replaceChildren(style, container);
      container.style.aspectRatio = `${container.clientWidth} / ${container.clientHeight}`;
      container.style.height = 'auto';
      container.style.minHeight = '0';
      this.session = mount(container, () => send('pma-ready'), detail => send('pma-round-ended', detail));
    } catch (error) {
      this.session?.dispose(); this.session = undefined; shadow.replaceChildren();
      console.error('Unable to start candy-snake', error);
      send('pma-error', { message: 'Unable to start game. Please try again.' });
    }
  }
  disconnectedCallback() { this.session?.dispose(); this.session = undefined; this.shadowRoot?.replaceChildren(); }
  pause() { this.session?.pause(); }
}
if (!customElements.get('pma-candy-snake')) customElements.define('pma-candy-snake', ArcadeElement);
