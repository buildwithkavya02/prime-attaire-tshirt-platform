# Prime Attaire — Premium Custom Apparel Studio

A production-quality, premium custom T-shirt/apparel design & ordering platform built with **React 19 + TypeScript + Vite + Tailwind CSS + Framer Motion**.

## ✨ Features

- **Interactive Design Studio** (`/customize/:productSlug`) — live product color changer, drag/resize/rotate image & text layers, undo/redo, delete, and one-click PNG export of the finished design (rendered on an off-screen `<canvas>`).
- **360° Product Viewer** — drag (or auto-rotate) the garment to view Front / Right / Back / Left, with the print automatically shown/hidden as the correct side comes into view.
- **6 product categories**: Round Neck, Sleeveless, Polo, Hoodie, Full Sleeve, V-Neck.
- **WhatsApp handoff** — floating button + a "Send Design on WhatsApp" action from the studio that pre-fills a message with the customer name, product, color and text summary.
- **Request a Quote** page with `react-hook-form` validation and file upload fields.
- **Contact** page with studio info + form.
- Fully responsive, glassmorphism navbar, premium brown/gold design system, Framer Motion micro-interactions throughout.

## 🎨 Design system

All tokens live in `tailwind.config.js` (`bg`, `section`, `brown`/`brown-dark`/`brown-warm`/`brown-coffee`, `gold`, `ink`, `muted`, `line`, `ok`). Fonts: **Inter** (body) + **General Sans** (display), loaded via Fontshare/Google Fonts in `src/index.css`.

## 🖼️ About the images

No brand photography was supplied, so `/public/images/` contains **procedurally generated placeholder assets** (flat garment silhouettes, an abstract hero backdrop, avatar initials, a favicon). They're wired up correctly and sized correctly — simply swap the files in `/public/images/` with real product photography/logo (keeping the same filenames, or update `src/data/products.ts`) to go live. The garment color system uses a CSS/canvas **mask + multiply-blend** technique, so any white-garment product photo on a transparent background will recolor correctly.

## 🚀 Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build to /dist
npm run preview   # preview the production build
```

## 📁 Structure

```
src/
  components/
    layout/       Navbar, Footer, WhatsAppButton
    ui/            Button, SectionHeading
    home/          Hero, FeaturedCategories, WhyChooseUs, PrintingTech,
                    Gallery, HowItWorks, Testimonials, FAQ, CTASection
    products/      ProductCard
    customize/     DesignCanvas, ProductViewer, ColorPicker,
                    UploadPanel, TextEditor, Toolbar
  pages/           Home, Products, Customize, RequestQuote, Contact
  data/products.ts Product catalog
  hooks/useDesignHistory.ts   Undo/redo state manager
  utils/exportDesign.ts       Canvas-based PNG export
  types/index.ts   Shared TypeScript types
```

## 🔌 Wiring up real backends

- **Request a Quote / Contact forms** currently `console.log` + toast on submit (see `onSubmit` in each page) — swap in your `axios.post(...)` call to your API/CRM.
- **WhatsApp** number is set in `src/components/layout/WhatsAppButton.tsx` and `src/pages/Customize.tsx` (`9962605619`) — replace with your studio's number.
- File uploads are read as base64 client-side for preview; connect real storage (S3, Cloudinary, etc.) when wiring the backend.
