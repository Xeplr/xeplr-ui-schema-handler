# @xeplr/ui-schema-handler — demo

A local playground for [`@xeplr/ui-schema-handler`](../README.md): `SchemaEditor`, `DynamicForm` and `applySchema` side by side — design a schema, fill in the form it produces, validate the values.

```sh
npm install
npm run dev     # http://localhost:5273
```

It links sibling checkouts (`file:../../xeplr-schema-handler`, `file:..`), so run it from inside the xeplr-os workspace. Not published.

| file | |
|---|---|
| `src/App.jsx` | the playground |
| `src/App.css` | its styles |
| `vite.config.js` | Vite + React, resolving the linked packages |
