# intelligent-algorithms.co.uk

Source for the Intelligent Algorithms Ltd website, served by GitHub Pages from `main` with a custom domain (see `CNAME`).

## Structure

Plain static HTML and CSS. No build step, no JavaScript framework.

```
index.html              Home
work.html               Case studies
writing.html            Essays index
publications.html       Peer-reviewed papers, talks, industry writing
mentoring.html          Supervision and outcomes
about.html              Practice and founder
writing/                Individual essays
  diversity-in-ai.html  Diversity in AI (2020)
assets/style.css        Single stylesheet
CNAME                   Custom domain
```

Typography is Crimson Pro and IBM Plex Sans, loaded from Google Fonts.

## Editing

Edit the HTML files directly. Commit and push to `main`; GitHub Pages will redeploy within a minute or two.

## Adding a new essay

1. Copy `writing/diversity-in-ai.html` to `writing/your-new-essay.html`.
2. Edit the title, byline, dateline, and body.
3. Add a new `<li class="item">` block to `writing.html` linking to it.
4. Commit and push.

## Local preview

```
python -m http.server 8000
```

Then visit `http://localhost:8000`.
