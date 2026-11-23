# Heritage Cut Website

Static website (HTML, CSS, JavaScript). No build step and no dependencies, so it runs on any host.

## Structure
```
heritage-cut/
  index.html        page content and SEO tags
  css/style.css     all styling and animations
  js/main.js        loader, scroll effects, review rotator, booking form
  images/           maher.jpg, najem.jpg
  favicon.svg
  robots.txt
```

## Preview locally
Open `index.html` in a browser, or run `python3 -m http.server` inside this folder and visit http://localhost:8000.

## Deploy
- **Netlify:** drag this folder onto app.netlify.com/drop.
- **Vercel:** `npx vercel` inside this folder.
- **GitHub Pages:** push the folder to a repo, then Settings > Pages.
- **cPanel or shared hosting:** upload the contents into `public_html`.

## Edit for a client (white-label checklist)
- Name, phone, hours and address: `index.html` (search "Heritage", "76 105 831", "Beit El Chaar", "8 PM") and the JSON-LD block in the head.
- WhatsApp booking number: `js/main.js`, the `wa.me/96176105831` link, plus `index.html` links.
- Barbers and services: `BA` and `SV` arrays in `js/main.js`, and the artists and services sections in `index.html`.
- Booking time slots: the `for(let m=600;m<=1170;m+=30)` loop in `js/main.js` (minutes from midnight, 600 = 10:00).
- Reviews: the `RV` array in `js/main.js`.
- Colors: CSS variables at the top of `css/style.css`.
- Social preview: after you have a domain, change `og:image` in `index.html` to the full URL of the image.

## Notes
- Booking sends a prefilled WhatsApp message. It does not lock slots, because there is no database.
- Fonts (Fraunces and Manrope) load from Google Fonts. For full offline or privacy compliance, download and self-host them.
