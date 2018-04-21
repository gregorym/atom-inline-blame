'use babel';

import { distanceInWordsToNow } from 'date-fns';
import { CompositeDisposable, Point } from 'atom';
import GitBlameHelper from './GitBlameHelper';

const DISPLAY_TIMEOUT = 200;

export default class InlineBlameView {
  constructor(editor) {
    this.editor = editor;
    this.subscriptions = new CompositeDisposable();
    this.decoration = null;
    this.marker = null;
    this.styleEl = null;
    this.updating = null;

    const throttledUpdate = () => this.throttle(this.updateLine.bind(this));

    this.subscriptions.add(editor.onDidChangeCursorPosition(throttledUpdate));
    this.subscriptions.add(editor.onDidStopChanging(throttledUpdate));
    this.subscriptions.add(editor.onDidChange(throttledUpdate));
    this.subscriptions.add(editor.onDidChangePath(throttledUpdate));

    this.subscriptions.add(editor.onDidDestroy(() => {
       this.subscriptions.dispose();
    }));
  }

  /**
   * Throttle to prevent stutter
   * @param  {Function} cb Function to throttle
   */
  throttle(cb) {
    this.removeDecoration();  // clear
    if (this.updating) return;

    this.updating = setTimeout(
      () => {
        cb();
        this.updating = null;
      },
      DISPLAY_TIMEOUT,
    );
  }

  updateLine() {
    if (!this.editor.buffer.file){
      return;
    }

    const lineNumber = this.editor.getCursorBufferPosition().row;
    const filePath   = this.editor.buffer.file.path;

    GitBlameHelper
      .run(filePath, lineNumber + 1)
      .then((blameInfo) => {
        if (!blameInfo || !blameInfo.author) return;
        if (blameInfo.author === "Not Committed Yet") return;

        const message   = GitBlameHelper.shortLine(blameInfo, atom.config.get("atom-inline-blame.format"));
        this.marker     = this.editor.markBufferPosition(new Point(lineNumber, 0));
        this.decoration = this.editor.decorateMarker(this.marker, {
          type: 'line',
          class: 'atom-inline-git-blame'
        });
        this.styleEl = document.createElement('style');
        this.styleEl.type = 'text/css'
        this.styleEl.innerHTML = `
          .atom-inline-git-blame[data-screen-row='${lineNumber}']::after {
            content: "${message}";
          }`;
        document.getElementsByTagName('head')[0].appendChild(this.styleEl);
      });
  }

  removeDecoration() {
    if (this.marker) this.marker.destroy();
    if (this.decoration) this.decoration.destroy();
    if (this.styleEl) this.styleEl.remove();
  }
}
