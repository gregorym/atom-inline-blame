'use babel';

import AtomInlineBlame from '../lib/atom-inline-blame';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('AtomInlineBlame', () => {
  let workspaceElement, activationPromise;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('atom-inline-blame');
  });

  describe('when the atom-inline-blame:toggle event is triggered', () => {
    it('hides and shows the modal panel', () => {
      // Before the activation event the view is not on the DOM, and no panel
      // has been created
      expect(workspaceElement.querySelector('.atom-inline-blame')).not.toExist();

      // This is an activation event, triggering it will cause the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'atom-inline-blame:toggle');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        expect(workspaceElement.querySelector('.atom-inline-blame')).toExist();

        let atomInlineBlameElement = workspaceElement.querySelector('.atom-inline-blame');
        expect(atomInlineBlameElement).toExist();

        let atomInlineBlamePanel = atom.workspace.panelForItem(atomInlineBlameElement);
        expect(atomInlineBlamePanel.isVisible()).toBe(true);
        atom.commands.dispatch(workspaceElement, 'atom-inline-blame:toggle');
        expect(atomInlineBlamePanel.isVisible()).toBe(false);
      });
    });

    it('hides and shows the view', () => {
      // This test shows you an integration test testing at the view level.

      // Attaching the workspaceElement to the DOM is required to allow the
      // `toBeVisible()` matchers to work. Anything testing visibility or focus
      // requires that the workspaceElement is on the DOM. Tests that attach the
      // workspaceElement to the DOM are generally slower than those off DOM.
      jasmine.attachToDOM(workspaceElement);

      expect(workspaceElement.querySelector('.atom-inline-blame')).not.toExist();

      // This is an activation event, triggering it causes the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'atom-inline-blame:toggle');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        // Now we can test for view visibility
        let atomInlineBlameElement = workspaceElement.querySelector('.atom-inline-blame');
        expect(atomInlineBlameElement).toBeVisible();
        atom.commands.dispatch(workspaceElement, 'atom-inline-blame:toggle');
        expect(atomInlineBlameElement).not.toBeVisible();
      });
    });
  });
});
