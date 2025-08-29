# CMS Menus – Beginner Guide

This feature lets you build simple navigation menus with items and sub-items (like a dropdown). Keep it simple: create a menu, add items, and fetch them as a tree.

What you need to know
- A menu has a `name` and a unique `slug` (made from the name).
- A menu item has a `label` and an optional `url` (defaults to `#`).
- You can nest items by setting `parentId` on a child item.
- Reading is public. Creating/updating/deleting needs a valid Bearer token with Admin/Editor role.

Quick start (3 steps)
1) Create a menu
```bash
curl -X POST http://localhost:3000/menus \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{"name":"Main Menu","description":"Top navigation"}'
```
Response looks like:
```json
{ "id": 1, "name": "Main Menu", "slug": "main-menu" }
```

2) Add menu items (simple fields only)
- Root item (no parent):
```bash
curl -X POST http://localhost:3000/menus/1/items \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{"label":"Home","url":"/"}'
```
- Child item (under item id 1):
```bash
curl -X POST http://localhost:3000/menus/1/items \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{"label":"Docs","url":"/docs","parentId":1}'
```

3) Get the menu as a tree
- By menu id:
```bash
curl http://localhost:3000/menus/1/items
```
- By menu slug:
```bash
curl http://localhost:3000/menus/slug/main-menu
```

Full end-to-end example

1) Create a menu
Request
```bash
curl -X POST http://localhost:3000/menus \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{"name":"Main Menu"}'
```
Response (wrapped by global interceptor)
```json
{
  "success": true,
  "message": "Created successfully",
  "data": { "id": 1, "name": "Main Menu", "slug": "main-menu", "createdAt": "2025-08-22", "updatedAt": "2025-08-22" },
  "timestamp": "2025-08-22T01:00:00.000Z",
  "version": "v1"
}
```

2) Add root items
Request
```bash
curl -X POST http://localhost:3000/menus/1/items \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{"label":"Home","url":"/"}'
```
Response
```json
{
  "success": true,
  "message": "Created successfully",
  "data": { "id": 11, "label": "Home", "url": "/", "orderIndex": 0, "parentId": null, "createdAt": "2025-08-22", "updatedAt": "2025-08-22" },
  "timestamp": "2025-08-22T01:01:00.000Z",
  "version": "v1"
}
```
Add another root item
```bash
curl -X POST http://localhost:3000/menus/1/items \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{"label":"Blog","orderIndex":1}'
```

3) Add child items
Make “Tech” a child of the Blog item (replace 12 with your Blog item id)
```bash
curl -X POST http://localhost:3000/menus/1/items \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{"label":"Tech","url":"/blog/tech","parentId":12}'
```

4) Read the menu tree
By menu id
```bash
curl http://localhost:3000/menus/1/items
```
Sample response (trimmed)
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 11,
      "label": "Home",
      "url": "/",
      "orderIndex": 0,
      "parentId": null,
      "createdAt": "2025-08-22",
      "updatedAt": "2025-08-22",
      "children": []
    },
    {
      "id": 12,
      "label": "Blog",
      "url": "#",
      "orderIndex": 1,
      "parentId": null,
      "createdAt": "2025-08-22",
      "updatedAt": "2025-08-22",
      "children": [
        {
          "id": 13,
          "label": "Tech",
          "url": "/blog/tech",
          "orderIndex": 0,
          "parentId": 12,
          "createdAt": "2025-08-22",
          "updatedAt": "2025-08-22",
          "children": []
        }
      ]
    }
  ],
  "timestamp": "2025-08-22T01:05:00.000Z",
  "version": "v1"
}
```
By menu slug
```bash
curl http://localhost:3000/menus/slug/main-menu
```
Menu + tree together
```bash
curl http://localhost:3000/menus/slug/main-menu/tree
```
Response
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "menu": { "id": 1, "name": "Main Menu", "slug": "main-menu", "createdAt": "2025-08-22", "updatedAt": "2025-08-22" },
    "items": [ /* same tree as above */ ]
  },
  "timestamp": "2025-08-22T01:06:00.000Z",
  "version": "v1"
}
```

5) Update items
- Rename
```bash
curl -X PUT http://localhost:3000/menus/1/items/11 \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{"label":"Home Page"}'
```
- Change URL
```bash
curl -X PUT http://localhost:3000/menus/1/items/13 \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{"url":"/blog/topics/tech"}'
```
- Move item (make root)
```bash
curl -X PUT http://localhost:3000/menus/1/items/13 \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{"parentId": null}'
```
- Reorder among siblings (0 = top)
```bash
curl -X PUT http://localhost:3000/menus/1/items/12 \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{"orderIndex": 0}'
```

6) Delete items and menus
- Delete an item
```bash
curl -X DELETE http://localhost:3000/menus/1/items/13 \
  -H 'Authorization: Bearer <token>'
```
- Delete the whole menu (also removes items)
```bash
curl -X DELETE http://localhost:3000/menus/1 \
  -H 'Authorization: Bearer <token>'
```

Useful endpoints
- `GET /menus` — list menus
- `GET /menus/:id` — get one menu
- `POST /menus` — create a menu
- `PUT /menus/:id` — update a menu (changes to name update the slug)
- `DELETE /menus/:id` — delete a menu
- `GET /menus/:menuId/items` — get items as a nested tree
- `POST /menus/:menuId/items` — add an item
- `PUT /menus/:menuId/items/:id` — update an item
- `DELETE /menus/:menuId/items/:id` — remove an item
 - `GET /menus/slug/:slug/tree` — get `{ menu, items }` together

Basic item fields
- `label` (required): text shown in the menu.
- `url` (optional): link path like `/about` or `https://...` (defaults to `#`).
- `parentId` (optional): make this item a child of another.
- `orderIndex` (optional): control order among siblings (0,1,2...).

Tips
- If you set a `parentId`, make sure that parent item exists in the same menu.
- Order is controlled by `orderIndex` (0, 1, 2, …). If you skip it, new items go to the end.

If you’re stuck
- Check the code: `src/Modules/menu/*` and the migration `src/migrations/1756000000000-AddedMenuEntities.ts`
- Make sure your DB is ready and migrations are run:
```bash
npm run build && npm run migration:run
```

Notes about responses
- The project has a global interceptor that wraps responses like this:
  - `{ "success": true, "message": "...", "data": <your data>, "timestamp": "...", "version": "v1" }`
- For lists/trees, `data` is an array. For single resources, `data` is an object.
- Error responses follow `{ success: false, message, error: { code, details }, timestamp, version }`.
