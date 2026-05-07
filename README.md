# Goyal Borewells Website

Static B2B website for Goyal Borewells with Supabase-ready hidden admin panel.

## Website

Open `index.html` locally or deploy this repository on GitHub Pages / Vercel.

## Admin Panel

Admin panel route:

```text
/#admin
```

Example after deployment:

```text
https://your-domain.com/#admin
```

## Supabase Setup

1. Open Supabase.
2. Create a new project.
3. Go to SQL Editor.
4. Run:

```text
supabase/schema.sql
```

5. Go to Authentication and create an admin user.
6. Open `assets/js/config.js`.
7. Add your Supabase URL and anon key.

## Features

- Products add/edit/delete
- Product photo upload / image URL
- Product description, rate, unit, MOQ, SKU, material, category
- Category image upload / image URL
- Catalogue PDF upload/change
- Gallery image upload/change
- Enquiry form
- CSV export
- Hidden admin route
- Instagram icon and link
- WhatsApp and call buttons

## Deployment on GitHub Pages

Repository root must contain:

```text
index.html
assets/
supabase/
robots.txt
sitemap.xml
vercel.json
```

Then enable GitHub Pages from:

```text
Settings > Pages > Deploy from a branch > main > /root
```
