# Project: JSAppLib

# CRITICAL AGENT PROTOCOL (ABSOLUTELY MANDATORY)
- Reload GEMINI.md before planning anything.
- Look for a ".session.notes" file and read it right after reading GEMINI.md for the first time in a session.
- Don't try to guess about what I want you to do. If there is any uncertainty, ask me.
- Don't run anything on the command line without my review and approval.
- Don't assume. Question the user.
- Don't write code unless I explicitly ask you to.
- Questions are just questions, not hints to send you off planning on your own.
- Whenever I say that we should end the session, create a ".session.notes" file and leave yourself enough information so that when I start you up again, I don't have to explain where we left off.
- Always stop after completeing work on a file to give me a chance for a code review.
- When encountering technical roadblocks, environmental limitations (e.g., test runner errors), or architectural ambiguities that require a logic change or a detour from the agreed plan, you MUST stop and present the situation to the user. Do not proceed with mocks, workarounds, or implementation pivots without explicit approval.

## General Project Rules (HIGH PRIORITY)
- Never use "_" as a name prefix to mark/make pseudo-protected members.
- TypeScript is not allowed in this project.
- Follow the existing coding style when generating new Javascript.
- Add JSDoc comments for all new functions and classes. Add JSDoc comments to all public functions and classes not currently possessing them.
- Make use of the cfprotected node module to add support for protected members when creating classes.
- Always provide a static private member named "spvt" for the static member container if static protected members are needed.
- Always provide a private member named "pvt" for the protected member container if protected members are needed.
- Tests use the jest node module.
- Every new module containing exported functions needs have a corresponding test module.
- For every change to a module, the corresponding test module must be updated accordingly.

## Coding Style

- Functions can only have a single exit point. This doesn't include exceptions.
- Each new HTML Custom Element classes must be contained in its own file.
- The name of a class's file must be the class name prefixed by 'js' and have an extension of '.mjs'.
- Indentation is always 4 spaces.
- Never use public fields. If a public field is desired, use a public accessor to a private field.
- When a class uses private members, make sure to use `saveSelf(this, '$');` in the constructor, and if static protected members are needed, in the static initializer block of the class.
- Except in the class constructor and in the static initializer block, private fields must be accessed via `this.$` to protect against proxy access.
- When creating strings that are not large blocks of text, prefer using "\n" for any carriage return/line feed needed.
- when defining/modifying a class, arrange members according to the following order: static private data, static protected container, static private functions, static block, private data, private functions, protected container, constructor, public functions, public accessors. This makes the contents easier to parse for a human.