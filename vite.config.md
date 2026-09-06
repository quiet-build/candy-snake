# vite.config.ts

Builds standalone index.html and stable component.js with shared hashed assets/ chunks. Keeps relative asset paths, es2022 target and the existing @ source alias. Preview enables cross-origin browser tests; public/_headers supplies production CORS. The audio loader resolves ../audio/ from the shared assets chunk.
