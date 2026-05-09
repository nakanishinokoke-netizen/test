# Monster Battle Deployment

This folder contains the static app files and WordPress integration helper for deploying the Monster Battle app.

## Xserver / Static Deployment

1. Upload the `deploy/monster-battle/` folder to your Xserver site under `public_html`.
   - Example: `public_html/monster-battle/`
2. Open `https://your-domain/monster-battle/` in your browser.

The app includes:
- `index.html`
- `main.js`
- `style.css`
- `images/`

## WordPress Integration

If you want to embed the app in WordPress, use the page template provided in `deploy/wordpress/page-monster-battle.php`.

### Steps

1. Copy `deploy/monster-battle/` to `public_html/monster-battle/`.
2. Copy `deploy/wordpress/page-monster-battle.php` into your active theme folder.
3. In WordPress admin, create a new page and select template `Monster Battle App`.
4. Publish the page.

This template will embed the app using an iframe pointed at `/monster-battle/`.
