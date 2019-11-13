'use babel';

import { distanceInWordsToNow } from 'date-fns';
import { CompositeDisposable, Point } from 'atom';
import GitBlameHelper from './GitBlameHelper';

const INLINE_BLAME_MESSAGE_VARIABLE = "--inline-blame-message";

export default class InlineBlameView {
  constructor() {
    this.editor = atom.workspace.getActiveTextEditor();
    this.subscriptions = new CompositeDisposable();
    this.decoration = null;
    this.marker = null;
    this.styleEl = null;
    this.updating = null;

    const throttledUpdate = () => this.throttle(this.updateLine.bind(this));

    window.requestIdleCallback(throttledUpdate); // lazily run once
    this.subscriptions.add(this.editor.onDidChangeCursorPosition(throttledUpdate));

    this.subscriptions.add(this.editor.onDidDestroy(() => {
      this.subscriptions.dispose();
    }));
  }

  /**
   * Throttle to prevent stutter
   * @param  {Function} cb Function to throttle
   */
  throttle(cb) {
    // Don't update if moving in same line
    const lineNumber = this.editor.getCursorBufferPosition().row;
    if (this.lineNumber === lineNumber) return;

    this.removeDecoration(); // clear because moving
    if (this.updating) return;

    this.updating = setTimeout(
      () => {
        cb();
        this.updating = null;
      },
      atom.config.get("atom-inline-blame.timeout"),
    );
  }

  updateLine() {
    if (!this.editor.buffer.file) return;

    const filePath = this.editor.buffer.file.path;
    this.lineNumber = this.editor.getCursorBufferPosition().row;

    // Don't run on empty lines
    const lineText = this.editor.lineTextForBufferRow(this.lineNumber) || '';
    if (lineText.trim() === "") return;

    GitBlameHelper
      .run(filePath, this.lineNumber + 1)
      .catch(this.removeDecoration)
      .then((blameInfo) => {
        this.removeDecoration();

        if (!blameInfo || !blameInfo.author) return;
        if (blameInfo.author === "Not Committed Yet") return;

        const message   = GitBlameHelper.shortLine(blameInfo, atom.config.get("atom-inline-blame.format"));
        document.body.style.setProperty(INLINE_BLAME_MESSAGE_VARIABLE, `"${message}`); // set value first

        this.marker     = this.editor.markBufferPosition(new Point(this.lineNumber, 0));
        this.decoration = this.editor.decorateMarker(this.marker, {
          type: "line",
          class: "atom-inline-git-blame"
        });
      });
  }

  removeDecoration() {
    document.body.style.removeProperty(INLINE_BLAME_MESSAGE_VARIABLE);
    if (this.marker) this.marker.destroy();
    if (this.decoration) this.decoration.destroy();
  }
}
