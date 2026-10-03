# tootsydeshmukh.com

Personal portfolio site for Tootsy Deshmukh. Plain HTML, CSS and JavaScript with no build step, so it runs on any static host (set up here for Vercel).

## What's in the folder

| File | What it does |
|---|---|
| `index.html` | All the page content: hero, about, projects, experience, contact |
| `css/styles.css` | All styling. Colours and fonts are variables at the top, in `:root` |
| `js/config.js` | Settings: contact email and the contact form access key |
| `js/main.js` | Behaviour: hero chart, scroll effects, project cards, contact form |
| `assets/tootsy.jpg` | Portrait photo |

## Switch on the contact form

The form sends messages through Web3Forms, a free service that emails each submission to you. No server is needed.

1. Go to https://web3forms.com and enter `tootsydeshmukh@gmail.com` to create an access key.
2. Open the email they send you and copy the access key.
3. Open `js/config.js` and paste the key between the quotes after `web3formsKey:`.
4. Save, and upload the changed file to GitHub.

The key is safe to keep in public code. Until a key is added, the form still works: it opens the visitor's email app with the message filled in.

Replies: each email arrives with the visitor's address as the reply-to, so you can answer by pressing Reply.

## Put it on Vercel

1. Create a GitHub repository and upload everything inside this folder, keeping the `css`, `js` and `assets` folders as they are. `index.html` must sit at the top level.
2. In Vercel choose Add New, then Project, import the repository, set the framework preset to Other, and deploy.
3. In the project's Settings, then Domains, add `tootsydeshmukh.com` and follow the DNS instructions shown there.

To update the site later, upload the changed files to the same repository. Vercel redeploys on its own.

## Preview on your computer

Double-click `index.html` to open it in a browser. Everything works from the file, including the contact form once the key is added.

## Common edits

- Text and projects: edit `index.html`. Each section is labelled with an `id` (`about`, `projects`, `experience`, `contact`).
- Colours: change the values at the top of `css/styles.css`.
- Photo: replace `assets/tootsy.jpg` with a square image of the same name.
