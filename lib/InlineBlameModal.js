'use babel';

export default class InlineBlameView {
  constructor() {
    this.element = document.createElement('div');
    this.element.classList.add('atom-inline-blame');
    // Create message element
    const message = document.createElement('div');
    message.textContent = 'The AtomInlineBlame package is Alive! It\'s ALIVE!';
    message.classList.add('message');
    this.element.appendChild(message);
  }

  getElement() {
    return this.element;
  }

  destroy() {
    this.element.remove();
  }
}
