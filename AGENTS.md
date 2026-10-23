<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Game rules (board size, stairs, snakes, win condition) live only in `src/lib/game.ts` as pure functions with tests in `src/lib/game.test.ts`; UI components never hard-code cell numbers. Why: keeps the ported Python rules verifiable and in one place.
- The game is fully client-side (no backend); turn animation state lives in `GameScreen`. Why: single-device local multiplayer needs no persistence.
- Visual style is defined via tokens and `@utility` classes (`panel`, `btn-chunky`) in `src/styles.css`. Why: components stay free of raw color values.
