# Prime Attaire — Backend

Minimal Node/Express + MongoDB backend for the private T-shirt customization
studio. Built to match `src/lib/api.ts` in the frontend function-for-function
so no page component needed to change — only the API layer underneath it.

## Setup

```bash
cd server
npm install
cp .env.example .env      # fill in MONGODB_URI, JWT_SECRET, CLIENT_URL, ADMIN_*
npm run seed:admin        # creates the first admin login from .env
npm run seed:products     # migrates the 6 products from the frontend into MongoDB
npm run dev                # starts on PORT (default 5000)
```

Generate a strong `JWT_SECRET` with e.g. `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

## Collections

- `admins` — id, name, email, passwordHash (bcrypt), createdAt
- `projects` — customer + project + **private link** fields together (see below)
- `designs` — one current design per project, no version history
- `products` — the 6 garment types, editable from `/admin/products`

## Design decisions / trade-offs from the original spec

**1. `projects` and `privateLinks` are one collection, not two.**
The spec (§4/§14) describes a separate `privateLinks` collection. In this
product every project has exactly one private link, created at the same
time, and there's never more than one — a join table would only add
complexity with no real benefit, and the existing frontend already models
`Project` as a single object carrying `token`/`accessCode`/`expiryDate`.
Splitting it would have meant reshaping types across a dozen frontend files
for no functional gain, so I kept `projects` self-contained instead — this
follows the spec's own instruction not to create collections unless they're
required (§1).

**2. The private-link token and access code are stored retrievably, not
hashed.**
Spec §4/§18 recommend hashing the token and access code. In practice, the
admin panel (`ProjectDetail.tsx`, `PrivateLinks.tsx`) needs to redisplay the
full link and code every time it loads — for copying, resending on
WhatsApp, or looking it up weeks later. A one-way hash makes that
impossible; the only way to keep both is to store two separate fields with
the raw token only shown once (which would need a real workflow change).
Given the budget, I made a deliberate call to store both in retrievable
form — this is how link-sharing systems like Google Drive or Figma work
(the link *is* the secret). What's still enforced, and matters more in
practice:
- Tokens are cryptographically random, ~82 bits of entropy, never
  sequential or guessable (`utils/token.js`).
- Every validation attempt is rate-limited (`privateLinkLimiter`).
- Links expire, can be revoked, and disabled projects are rejected.
- The customer-facing response never includes the access code once it's
  been used, and admin-only fields are stripped from what the customer
  receives (`privateLinkController.js`).

If this ever needs to satisfy a stricter compliance bar, the fix is to
switch to one-way hashing and change the admin UI to show the token/code
only once at creation with a "regenerate" flow for later access — that's a
larger UX change than this budget covers right now.

**3. Design artwork stays base64 client-side; product images get a small local Multer endpoint.**
`UploadPanel.tsx` (customer design canvas) still reads artwork client-side
into a base64 data URL — no change there, and no S3/Cloudinary standing up
just for that (spec §25). Product photography is different: admins need
real files with shareable URLs that the storefront can load, so
`POST /api/admin/uploads/product-image` (Multer, admin-only, 5MB cap,
image mimetypes only) writes to `server/uploads/products/` and the app
serves that folder statically at `/uploads/products/*`. It's local disk,
not object storage — fine for a single-server deployment; swap the
`multer.diskStorage` for an S3-backed storage engine if that changes.

**4. Design submission and save always derive the project from the
validated `:token` path param, never from a client-supplied `projectId`**
(spec §9). This required one small, necessary frontend change — see below.

## Endpoints

Admin (JWT required, `Authorization: Bearer <token>`):
- `POST /api/admin/login`, `POST /api/admin/logout`, `GET /api/admin/session`
- `GET/POST /api/admin/projects`, `GET/PUT/DELETE /api/admin/projects/:id`
- `POST /api/admin/projects/:id/status`, `/revoke`, `/private-link/regenerate`
- `GET /api/admin/designs`, `GET /api/admin/designs/:id`
- `POST /api/admin/designs/:id/approve`, `/reject`, `/revision`
- `GET/POST /api/admin/products`, `PUT/DELETE /api/admin/products/:id`
- `GET /api/admin/dashboard`

Public / customer:
- `GET /api/products`
- `POST /api/private-links/validate`
- `GET/POST /api/private-projects/:token/design`
- `POST /api/private-projects/:token/design/submit`

All responses use `{ success, data }` or `{ success: false, message }`.
Nothing internal — stack traces, DB errors, Mongo `_id` shapes beyond a
plain string — ever reaches the client (see `middleware/errorHandler.js`).
