'use babel';

import { distanceInWordsToNow } from 'date-fns';
import { CompositeDisposable, Point } from 'atom';
import GitBlameHelper from './GitBlameHelper';

export default class InlineBlameView {

  constructor(editor) {
    this.editor = editor;
    this.subscriptions = new CompositeDisposable();
    this.decoration = null;
    this.marker = null;
    this.styleEl = null;

    this.subscriptions.add(editor.onDidChangeCursorPosition(this.updateLine.bind(this)));
    this.subscriptions.add(editor.onDidStopChanging(this.updateLine.bind(this)));
    this.subscriptions.add(editor.onDidChange(this.updateLine.bind(this)));

    this.subscriptions.add(editor.onDidChangePath(this.updateLine.bind(this)));

    this.subscriptions.add(editor.onDidDestroy(()=> {
       this.subscriptions.dispose();
    }));
  }

  updateLine() {
    const lineNumber = this.editor.getCursorBufferPosition().row;
    const filePath   = this.editor.buffer.file.path;;

    GitBlameHelper.run(filePath, lineNumber + 1)
      .catch(this.removeDecoration)
      .then((blameInfo) => {
        this.removeDecoration();

        if (!blameInfo || !blameInfo.author) return;
        if (blameInfo.author === "Not Committed Yet") return;

        const message   = GitBlameHelper.shortLine(blameInfo);
        this.marker     = this.editor.markBufferPosition(new Point(lineNumber, 0));
        this.decoration = this.editor.decorateMarker(this.marker, {
          type: 'line',
          class: 'atom-inline-git-blame'
        });
        this.styleEl = document.createElement('style');
        this.styleEl.type = 'text/css'
        this.styleEl.innerHTML = `
          .atom-inline-git-blame[data-screen-row='${lineNumber}']::after {
            content: "   ${message}";
            opacity: 0.2;
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
