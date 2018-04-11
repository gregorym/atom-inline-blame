'use babel';

import AtomInlineBlameView from './atom-inline-blame-view';
import { CompositeDisposable } from 'atom';

export default {

  atomInlineBlameView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.atomInlineBlameView = new AtomInlineBlameView(state.atomInlineBlameViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomInlineBlameView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-inline-blame:toggle': () => this.toggle()
    }));
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

  toggle() {
    console.log('AtomInlineBlame was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
