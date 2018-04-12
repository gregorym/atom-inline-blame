'use babel';

import InlineBlameView from './InlineBlameView';
import { CompositeDisposable } from 'atom';

export default {
  watchedEditors: null,

  activate(state) {
    this.watchedEditors = new WeakSet()

    atom.workspace.observeTextEditors((editor) => {
       if (this.watchedEditors.has(editor)) { return; }

       this.watchedEditors.add(editor);
       new InlineBlameView(editor);

       return editor.onDidDestroy(() => this.watchedEditors.delete(editor));
     });

  CompositeDisposable
    this.subscriptions = new CompositeDisposable();
},

  deactivate() {},
};
