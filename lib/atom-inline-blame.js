'use babel';

import { CompositeDisposable } from "atom";

let InlineBlameView;

export default {
  watchedEditors: new Set([]),
  toggleState: true,
  view: null,

  config: {
    format: {
      type: "string",
      default: `%author%, %relativeTime% ago - %summary%`,
      description: "Available tokens: author, authorEmail, relativeTime, authorTime, authorTimezone, committer, summary, sha",
    },
    timeout: {
      type: "number",
      default: 200,
      description: "Delay after which the inline blame summary will be displayed. Useful when navigating using cursor keys to prevent unnecessarily fetching history for each line.",
    }
  },

  attachBlamer(editor) {
    if (!editor) return;

    const { id } = editor;
    if (!this.watchedEditors.has(id)) {
      if (!InlineBlameView) {
        InlineBlameView = require("./InlineBlameView"); // lazy load only when needed the first time
      }

      this.watchedEditors.add(id);
      this.view = new InlineBlameView();

      editor.onDidDestroy(() => this.watchedEditors.delete(id));
    }
  },

  activate(state) {
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.workspace.onDidChangeActiveTextEditor(this.attachBlamer.bind(this))); // subscribe to changing editors

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-inline-blame:toggle': () => {
        this.toggleState = !this.toggleState;
        if (this.toggleState) {
          this.view = new InlineBlameView();
        } else {
          this.view && this.view.removeDecoration();
          this.view && this.view.subscriptions.dispose();
          this.view = null;
        }
      }
    }));

    // Annotate current open buffer lazily
    window.requestIdleCallback(() => {
      const currentEditor = atom.workspace.getActiveTextEditor();
      if (currentEditor) {
        this.attachBlamer.bind(this)(currentEditor);
      }
    });
  },

  deactivate() {
    this.subscriptions.dispose();
  },
};
