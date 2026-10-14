# AB Gadgets

A mobile-friendly store for affordable phone accessories and audio products. Built with plain HTML, CSS and JavaScript. No frameworks, installation or build tools needed.

## Features

- Home, Shop, Product Details, Cart, Checkout, About and Contact pages.
- Twelve sample products with search, category filters and price sorting.
- A shopping cart with quantity controls and browser storage.
- Checkout that prepares an order request for WhatsApp.
- UPI placeholders and a cash-on-delivery preference.
- White-and-blue styling, mobile navigation and local illustrations.

## Preview

Download or clone this project, then double-click `index.html` to open it in your browser. Keep all the folders together. Google Fonts loads online; system fonts work offline.

## Edit your store

| File | What to change |
| --- | --- |
| `js/products.js` | Product names, prices, specifications and image paths |
| `js/main.js` | WhatsApp number, phone, email and UPI details in `STORE` |
| `css/style.css` | Colours, fonts and layouts |
| `images/` | Replace illustrations with real product photos |
| `about.html` | Shipping, returns and warranty information |

## Before going live

This is a **preview store**. Replace sample products, prices, photos and policies with real information. Add your contact and UPI details. WhatsApp ordering stays inactive until a business number is configured.

Checkout prepares a message: the customer must send it in WhatsApp and the business must confirm the order. This website does not process cards or verify UPI payments. Cards require a separate payment link from your payment provider.

## Hosting

Use a static host with the project root as the publish folder. No build command is needed. The website has not been deployed yet.

See [SETUP.md](SETUP.md) for launch configuration, domain and social-sharing setup, and testing instructions. [PROJECT_BRIEF.md](PROJECT_BRIEF.md) records the agreed requirements.

## Checks

Developers with Node.js can optionally run `node tests/verify.cjs`. Node.js is not needed to use or host the website.

The existing automated checks passed. Visual testing at 375px remains unverified because the preview browser blocked local files. Check the mobile layout before launch.
