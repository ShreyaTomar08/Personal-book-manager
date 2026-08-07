# My Reading Nook

This is my submission for the Thumbstack Personal Book Manager assignment — a simple app to log the books you're reading, want to read, or have finished.

**Live:** [add your deployed link here]
**Repo:** [add your GitHub repo link here]

## What you can do

- Sign up / log in / log out (JWT auth, cookies stored HTTP-only)
- Add a book with title, author, tags, and status
- Edit or delete any book
- Filter by tag or status
- See a quick dashboard — how many books total, how many you're currently reading, etc.

If you don't add a cover image for a book, it gets a generated pastel cover instead of a broken image icon — small thing, but I liked it more than a plain placeholder.

## Built with

Next.js (App Router) + TypeScript, Tailwind for styling, Framer Motion for the small animations, MongoDB with Mongoose, JWT for auth.

## Running it yourself

```
git clone <your-repo-url>
cd thumbstack
npm install
```

Add a `.env.local` file:
```
MONGODB_URI=mongodb://127.0.0.1:27017/thumbstack-books
JWT_SECRET=super_secret_thumbstack_jwt_key_2026_change_in_production
```

Then:
```
npm run dev
```

Open localhost:3000.

To check the production build works:
```
npm run build
npm run start
```

## A note

I spent most of the time getting the core flow solid first — auth, adding/editing books, the dashboard actually working — before touching anything visual. Once that was working I went back and added the animations, the generated covers, and made sure it held up on mobile. Still a few things I'd add with more time, like sorting by date added and a proper "reading streak" tracker.
```
