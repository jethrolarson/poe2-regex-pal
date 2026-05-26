# POE2 Regex Pal

A public static web tool that generates optimized regex strings for POE2's in-game search bar (vendor/stash). See `docs/overview.md` for product framing, `docs/plan.md` for the implementation plan, `docs/research/` for source guides.

## Stack

- TypeScript (strict), pnpm (single package)
- fun-land libs: fun-state, fun-web, accessor
- vanilla-extract for CSS (type-safe, zero-runtime)
- Vite for builds; deploys static to GitHub Pages
- No backend. Affix data is trimmed offline (`scripts/build_affixes.ts`) into bundled JSON; builds persist in localStorage.

## Code Style

Functional. Pure functions over classes. Composition over inheritance. Prefer small functions over large nested ones. Prefer map/reduce/filter over forEach with mutation. No nondeterminism (Math.random, Date.now) in pure functions — pass as arguments. Name numeric constants — avoid bare magic numbers in logic.

Make it work, make it right, make it simple, clean it up.

### Balance heuristics

- Strictness: 85% - Good strict types, tagged unions, eslint, minimal suppression
- Correctness: 80% - Domain and codomain well covered. Good types, no laziness
- Pragmatism: 80% - Minimize hacking but don't go crazy
- Testability: 70% - Determinism, minimized state. If tests are hard, propose refactors
- Expressiveness: 70% - Code should look like it's doing what it's doing
- Simplicity: 60% - Don't overengineer, use the simplest forms the human won't regret
- Reusability: 40% - Minor duplication is fine. YAGNI reigns

```typescript
// Tagged unions with 'kind'
type State = { kind: "Loading" } | { kind: "Ready"; data: Data };

// State variables use $ suffix
const room$ = FunState<Room>(initial);

// Immutable updates via accessor
room$.mod(Acc<Room>().prop("users").mod(add_user(u)));
```

## Semantic Principles

- Code must not lie. Names, types, and structure must reflect what the code actually does.
- Intent is expressed through decomposition and composition, not comments or procedural narration.
- Prefer extracting concepts over introducing procedural intermediates.
- Pipelines should be linear and readable in source order; data provenance should be obvious.
- Make illegal states unrepresentable where practical; push correctness into the type layer.

## Rules

- No `any`, no `as`, no `!` non-null assertions
- Avoid excessive defensive programming
- Use strict and honest types
- Avoid optional parameters; use config objects when more than 3 arguments
- No classes unless wrapping external APIs
- TDD for shared/reused code (vitest)
- YAGNI - build what's needed now
- Minimal dependencies; introduce functional helpers as needed
- The user is direct; take questions literally, not as passive direction
- Tagged unions + exhaustive switch for state machines

## Naming

- **snake_case** for variables, functions, and object fields (e.g. `required_level`, `select_affixes`, `on_copy`)
- **PascalCase** for types and model/component names (e.g. `Affix`, `Concept`, `AppShell`)
- `$` suffix for FunState variables (e.g. `app$`)
- Library APIs keep their own casing (`mapRead`, `bindView`)
- camelCase only for hyphenated nouns

## fun-web DOM helpers

- `h(tag, attrs, children)` - static elements; attrs become DOM properties (use `className`, not `class`)
- `hx(tag, { signal, props, attrs, on, bind })` - reactive elements with event handlers and bindings
- `bindView(signal, read, render)` - reactive subtree
- Component signature: `Component<Props> = (signal: AbortSignal, props: Props) => HTMLElement`
- AbortSignal for cleanup in UI components

```typescript
h("div", { className: css.box }, ["Hello"]);

hx("button", { signal, props: { className: css.button }, on: { click: on_click } }, ["Click"]);

hx("div", { signal, props: { className: css.status }, bind: { textContent: state.prop("message") } });
```

## Styling with vanilla-extract

Create `*.css.ts` files alongside components. Prefer `className` over inline `style`.

```typescript
// component.css.ts
import { style } from "@vanilla-extract/css";
export const container = style({ padding: 16, background: "rgba(0,0,0,0.8)" });
```

## Don't

- Don't add abstractions until needed twice
- Don't write error handling for impossible states
- Don't add comments for obvious code
- Don't create helpers for one-off operations
- Don't over-engineer for hypothetical futures
