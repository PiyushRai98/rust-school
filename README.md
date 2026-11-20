# Rust School

An illustrated end-to-end Rust course using the established paper, monospace, sidebar, diagram, and step-guide design. This is a separate project from SQL School and ML School, with original Rust content and custom SVG illustrations.

## Local development

Node.js 18+ is enough to serve the site. There are no application dependencies or build step.

```sh
npm run dev
```

Open http://127.0.0.1:4180. Set `PORT` to choose a different port. The deployable static application lives in `dist/`.

## Deploying to Vercel

`vercel.json` serves `dist/` as a static site with no install or build step. Routing uses URL hashes (`#/lesson/1`), so no rewrites are needed.

- Dashboard: import the repository and keep the defaults. The settings come from `vercel.json`.
- CLI: run `npx vercel` for a preview or `npx vercel --prod` for production.

## Course and interactions

- 72 lessons across 12 modules, with 362 guided steps and 72 reasoning quizzes.
- Getting started; language fundamentals; ownership and borrowing; structs, enums, and patterns; collections and errors; traits, generics, and lifetimes; iterators, closures, and smart pointers; testing and tooling; concurrency and async; systems and safety; services and delivery; end-to-end projects.
- Eleven complete, compiler-checked examples covering moves, clones, Copy, shared and exclusive borrows, last-use analysis, valid scopes, dangling references, and returning owned data.
- An interactive integer iterator pipeline with filtering, mapping, collecting, and summing. It generates an equivalent complete Rust program.
- Source downloads and explicit links to open each complete program in Rust Playground.
- Search, keyboard navigation, saved local course and quiz progress, light/dark themes, and responsive layouts.
- Twelve field-guide patterns and primary documentation links.

## Execution model

The website is a static teaching application. It does not host a Rust compiler or execute arbitrary Rust code. Memory traces are curated conceptual views. Successful examples have verified output; rejected examples illustrate compile-time reasoning, not partial execution. Allocation labels are symbolic and do not represent measured addresses. The bounded iterator calculator runs in JavaScript; equivalent Rust output is checked by the development verification suite. Rust Playground opens only when the learner follows its external link.

Lesson snippets and field-guide fragments illustrate concepts and may require surrounding code or declared dependencies. Project lessons guide implementation; they do not provision cloud services or ship complete hosted backends. Progress is saved per browser, without account synchronization.

## Verification

`npm run check` checks all application JavaScript syntax.

`node verify-rust.mjs` requires an installed Rust toolchain and linker. It compiled and ran eight valid programs, checked the three expected compiler errors E0382, E0502, and E0597, and compared all 54 iterator configurations across three datasets against Rust assertions. Verified using rustc 1.95.0 with edition 2024. It writes generated programs and a report under ignored `qa/`.

`node verify-browser.mjs` requires `playwright-core` and a browser. `PLAYWRIGHT_MODULE_PATH` can select an existing installed package directory and `CHROME_PATH` a system Chrome executable. It checks every lesson route, search, persisted progress, quiz feedback, all memory traces, iterator input validation, exports, external code URLs, responsive layouts, and theme switching. Screenshots and reports are written under ignored `qa/`.

## Source map

- `dist/course.js`: original lesson and quiz content.
- `dist/app.js`: course shell, routing, lessons, practice, search, and field guide.
- `dist/scene.js`: conceptual lesson illustrations.
- `dist/examples.js`: complete Rust programs, memory traces, and bounded iterator calculations.
- `dist/lab.js`: interactive labs, stepping, playback, downloads, and Playground links.
- `dist/style.css`, `dist/rust.css`: visual design and responsive layouts.
- `.openai/hosting.json`: private Sites identity and static hosting configuration.

Fonts are self-hosted; their license is at `dist/assets/FONT-LICENSE.txt`.

## Primary references

- [The Rust Programming Language](https://doc.rust-lang.org/book/)
- [The Cargo Book](https://doc.rust-lang.org/cargo/)
- [The Rust Reference](https://doc.rust-lang.org/reference/)
- [Rust 2024 Edition Guide](https://doc.rust-lang.org/edition-guide/rust-2024/)
- [Rust Playground linking documentation](https://play.rust-lang.org/help)

Each lesson also links to a relevant primary reference. This course is an independent educational project.
