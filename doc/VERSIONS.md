# ChatPulse Version History

## v1.1.0 (Current)
- **UI Upgrade**: Inject glassmorphic backdrop filters into header, heavier shadow depth to the chat window, and an ambient pulse animation for the chat trigger button.
- **Mobile Enhancements**: Viewport height mapping fixes to avoid mobile keyboard overlaps, added safe-area-inset mapping for iOS, set minimum `font-size: 16px` to avoid Safari auto-zooming.
- **Spacing Fix**: Implemented zero-height fixed positioning for `#chat-widget-container` from `widget.js` to ensure host websites do not erroneously inherit white spacing down below their footers.
- **Repository Optimization**: Pruned obsolete files (`widget.html`, `DEPLOY.md`) and built the newly mandated `doc` folder hygiene scheme.

## v1.0.0
- Initial secure worker and frontend widget structure.
- Echo and Webhook functionality basics setup.
