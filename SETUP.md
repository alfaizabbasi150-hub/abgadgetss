# AB Gadgets

A static, mobile-first store using only HTML, CSS and vanilla JavaScript.

## Preview on your computer

1. Open this project folder in File Explorer.
2. Double-click **index.html**. It opens in your default browser.
3. Try Shop → add products → Bag → adjust quantities → Checkout.
4. Google Fonts loads when you are online; a local system font is used offline.

No installation, npm, build command or server is required. Keep the HTML files, `css`, `js` and `images` together. Use the same browser for your cart. Some browsers restrict storage for local files or private browsing; a static hosted site provides a consistent origin for persistent carts.

## Files to edit

- `PROJECT_BRIEF.md`: confirmed requirements.
- `js/products.js`: the 12 sample products, categories, prices, descriptions, specifications and image paths. Keep each numeric ID unique and stable so saved carts still refer to the right product.
- `js/main.js`: the `STORE` settings at the top, shared navigation/footer and all store behaviour.
- `css/style.css`: colours, fonts, layout and responsive rules.
- `images/`: local placeholder illustrations. Put your real product photos here and change each product's `image` path.

## Required before accepting real orders

1. In `js/main.js`, enter `whatsappNumber` with country code and digits only (no plus sign or spaces), plus `phone`, `email`, `upiId`, and `upiQrImage` pointing to your actual QR image. An empty WhatsApp number intentionally blocks checkout handoff.
2. Replace all sample catalogue data with actual products, photos, prices, compatibility and specifications. The current generic illustrations do not establish what a real product looks like.
3. Confirm shipping fees, service areas, tax treatment, delivery estimates, returns, warranty and your business contact details. Update About, product and checkout copy accordingly.
4. Remove preview notices and illustrative labels only after the real content and policies are ready. Replace the announcement bar with a real offer only when one exists. Do not add invented reviews.
5. Test a complete order draft using your own WhatsApp number. The customer must press Send in WhatsApp; opening the draft does not place or confirm an order. The site keeps the cart and does not save names or addresses.
6. Online cards are offered as a request for an external payment link. This static site does not charge cards, validate UPI payments, reserve stock or store orders on a server. COD is a preference for the business to confirm.

## SEO and hosting

Upload the files directly to GitHub Pages or a static host; the publish folder is the project root and there is no build command. No site has been deployed by this task.

Every page includes a unique title/description, Open Graph metadata and image alt text. When your domain is ready, replace each HTML file's `og:url` and `og:image` with absolute HTTPS URLs on that domain; the social image is `images/social-card.png`. Setting `STORE.domain` also updates browser-rendered page URLs, but social crawlers often ignore JavaScript and need the HTML metadata updated directly.

Product pages update title/description in the browser using `?id=1` etc. Because the requested architecture uses one static `product.html`, most social crawlers see its generic product metadata for every ID. Separate pre-written product HTML pages would be needed for reliably distinct previews per product. Test sharing after deployment.

## Verification

`node tests/verify.cjs` is an optional developer check (Node is not needed to use or deploy the store). It verifies file/asset links, static metadata, product IDs, real cart functions, totals, persistence, corrupt storage recovery, filtering, product lookup, input validation and WhatsApp draft contents using a simulated DOM. It never sends a message or payment.

JavaScript syntax and the above automated checks were run. Visual browser testing, including the requested 375px viewport, was blocked by the preview tool's local-file security policy and remains unverified. To check locally in Chrome or Edge, open index.html, press F12, toggle the device toolbar (Ctrl+Shift+M), set width to 375px, and visit all seven pages. Check the menu, card grid, form, cart controls and horizontal scrolling. Also test a cart refresh in your browser and a real hosted preview before launch.
