'use babel';

import { distanceInWordsToNow } from 'date-fns';
import AtomInlineBlameView from './atom-inline-blame-view';
import { CompositeDisposable, Point } from 'atom';
import Blame from './blame';

export default {
  atomInlineBlameView: null,
  modalPanel: null,
  subscriptions: null,
  marker: null,

  activate(state) {
    this.atomInlineBlameView = new AtomInlineBlameView(state.atomInlineBlameViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomInlineBlameView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();


    this.blameCurrentLine().then(this.showBlame.bind(this));

    const editor = this.getActiveTextEditor();
    editor.onDidChangeCursorPosition(() => {
      this.blameCurrentLine().then(this.showBlame.bind(this));
    });

    atom.workspace.onDidChangeActivePaneItem(() => {
      this.blameCurrentLine().then(this.showBlame.bind(this));

      const editor = this.getActiveTextEditor();
      editor.onDidChangeCursorPosition(() => {
        this.blameCurrentLine().then(this.showBlame.bind(this));
      });
    });
  },

  getActiveTextEditor() {
    return atom.workspace.getActiveTextEditor();
  },

  blameCurrentLine() {
    const editor      = this.getActiveTextEditor();
    const filePath    = editor.buffer.file.path;
    const lineNumber  = editor.getCursorBufferPosition().row + 1;

    return Blame.run(filePath, lineNumber);
  },

  showBlame(blameInfo) {
    const message     = `${blameInfo.author}, ${distanceInWordsToNow(new Date(blameInfo['author-time']*1000))} ago - ${blameInfo.summary}`;
    const editor      = this.getActiveTextEditor();
    const lineNumber = editor.getCursorBufferPosition().row;
    if (this.marker) {
      this.marker.destroy();
      this.decoration.destroy();
    }

    if (blameInfo && blameInfo.author === "Not Committed Yet") return;

    console.log(blameInfo);
    this.marker = this.createMarker(editor, lineNumber);
    this.decoration = this.createDecoration(editor, this.marker);
    this.renderStyleElement(lineNumber, message);
  },

  createMarker(editor, lineNumber){
    const position = new Point(lineNumber, 0)
    const marker = editor.markBufferPosition(position)

    return marker;
  },

  createDecoration(editor, marker) {
    return editor.decorateMarker(marker, {
      type: 'line',
      class: 'atom-inline-git-blame'
    });
  },

  renderStyleElement(lineNumber, message = '') {
    const id = `atom-inline-git-blame-${lineNumber}`;

    // If we've already created a style tag for this module, bail
    if (document.getElementById(id)) return

    // Create a style tag with a class for this specific
    // package and add it to the head element
    const selector =`.atom-inline-git-blame[data-screen-row='${lineNumber}']`;
    const styleElement = document.createElement('style')
    styleElement.id = id
    styleElement.type = 'text/css'
    styleElement.innerHTML = `
      ${selector}::after {
        content: "   ${message}";
        opacity: 0.2;
      }`;
    document.getElementsByTagName('head')[0].appendChild(styleElement)
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomInlineBlameView.destroy();
  },

  serialize() {
    return {
      atomInlineBlameViewState: this.atomInlineBlameView.serialize()
    };
  },
};
