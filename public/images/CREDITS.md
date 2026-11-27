# Image credits

## Current catalog

Soko's 100-product catalog uses **Pexels photos only**: four distinct square or portrait photos per product, 400 unique photo IDs in total. No generated SVG is placed in a product gallery, and no Unsplash, Pixabay, `placehold.co` or downloaded original is used.

Each gallery entry in `data/catalog/*.json` records:

- the Pexels photo ID and `https://images.pexels.com/photos/<id>/...` CDN URL;
- alt text describing the product view;
- the photographer name and photographer URL;
- the Pexels photo page and licence URL.

`data/product-images.json` mirrors the same records for the client, and `npm run validate` checks all 400 unique URLs. The `/credits` page renders the full credited list from the catalog; `/dev/image-review` is a development-only audit of all four slots per product.

The 20 original Phase 7 products remain in the catalog with their original Pexels photos. Their photographer list is kept below for provenance; the catalog JSON and `/credits` page are authoritative for all 100 products.

| Product | Pexels photo | Photographer |
| --- | --- | --- |
| Wireless Noise-Canceling Over-Ear Headphones | [210927](https://www.pexels.com/photo/210927/) | Aleksandar Spasojevic |
| Low-Latency Gaming Wireless Earbuds | [10997624](https://www.pexels.com/photo/10997624/) | Nathan J Hilton |
| Compact Mechanical Hall-Effect Keyboard | [9020272](https://www.pexels.com/photo/9020272/) | Castorly Stock |
| RGB Smart LED Room Strip Lights | [10482375](https://www.pexels.com/photo/10482375/) | Ducky |
| Wireless Charging Desk Mat | [7742585](https://www.pexels.com/photo/7742585/) | Rann Vijay |
| Heavyweight Oversized Graphic T-Shirt | [36942017](https://www.pexels.com/photo/36942017/) | BANDAR BAANT |
| Baggy Barrel-Fit Cargo Jeans | [25484767](https://www.pexels.com/photo/25484767/) | Noland Live |
| High-Waisted Fold-Over Athleisure Leggings | [7593007](https://www.pexels.com/photo/7593007/) | Miriam Alonso |
| Retro Low-Top Chunky Sneakers | [27256441](https://www.pexels.com/photo/27256441/) | José Martin Segura Benites |
| Hydrocolloid Star Pimple Patches (36 Count) | [6475989](https://www.pexels.com/photo/6475989/) | Hanna Pad |
| Niacinamide Brightening & Hydrating Body Lotion | [5798000](https://www.pexels.com/photo/5798000/) | Ann poan |
| Collagen Hydrogel Under-Eye Patches | [6476074](https://www.pexels.com/photo/6476074/) | Hanna Pad |
| Silicone Scalp Massager & Hair Growth Brush | [5468620](https://www.pexels.com/photo/5468620/) | Polina Tankilevitch |
| Satin Sleep Bonnet & Scrunchie Set | [7897135](https://www.pexels.com/photo/7897135/) | Irene Gaitho |
| Insulated Stainless Steel Flip-Straw Water Bottle (32oz) | [3737800](https://www.pexels.com/photo/3737800/) | cottonbro studio |
| Quilted Puffer Makeup & Tech Organizer Bag | [6624063](https://www.pexels.com/photo/6624063/) | Nadia Dolce |
| Portable USB-C Mini Smoothie Blender | [7936983](https://www.pexels.com/photo/7936983/) | Nicola Barts |
| Interactive STEM Robotics Building Kit | [40049041](https://www.pexels.com/photo/40049041/) | Tori D |
| Ergonomic Aesthetic School Backpack with Pins | [37580640](https://www.pexels.com/photo/37580640/) | Solé Gomez |
| Kids Digital Instant Print Camera | [10676011](https://www.pexels.com/photo/10676011/) | Caleb Oquendo |

## Manual replacements

- `data/image-rejects.json` rejects photo IDs `27503500` and `15893283`; the validator refuses any catalog that reuses them.
- `data/image-overrides.json` is empty. If you add your own local photos there, they take priority over catalog photos and must carry their own credit information.

The earlier catalog's Unsplash and Pixabay cache belonged to the superseded catalog and is not used by the current shelves. Static SVG assets that are not product photos (for example `placeholder.svg`, `favicon.svg` and `og-cover.svg`) remain outside the product galleries.

Licence: [Pexels License](https://www.pexels.com/license/). API reference: [Pexels API documentation](https://www.pexels.com/api/documentation/). The primary refresh path is the official key-based Pexels API (`npm run images:pexels`); the public search-page capture remains only as documented provenance. **`.env.local` is gitignored; API keys must never be committed.**
