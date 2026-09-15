# @xeplr/ui-schema-handler

**React components for [`@xeplr/schema-handler`](https://www.npmjs.com/package/@xeplr/schema-handler) field schemas.** A field schema is a plain array: `[{ name, type, required, default, description, order }]`. `<SchemaEditor>` edits that array as a table, one row per field. `<DynamicForm>` shows it as a form and hands you a `{ [name]: value }` object. Neither component validates anything. You check the values with `applySchema` from `@xeplr/schema-handler` and pass its errors back to the form.

(The package name on npm is `@xeplr/ui-schema-handler`. The GitHub repo and folder are named `xeplr-ui-schema-handler`.)

## Install

```sh
npm i @xeplr/ui-schema-handler @xeplr/schema-handler
```

Peer dependencies: `react ^18 || ^19` and `@xeplr/schema-handler ^1`. `SchemaEditor` gets its list of field types (`TYPES`) from `@xeplr/schema-handler`.

The package ships its source (`main: src/index.js`, JSX included), so your bundler must compile JSX from `node_modules`. Vite does this. `@xeplr/schema-handler` is CommonJS. The demo lists it in Vite's `optimizeDeps.include` so its named exports resolve.

The stylesheet is opt-in. Import it once if you want the default look:

```js
import '@xeplr/ui-schema-handler/src/styles.css'
```

## Quick start

```jsx
import { useState } from 'react'
import { DynamicForm, SchemaEditor } from '@xeplr/ui-schema-handler'
import '@xeplr/ui-schema-handler/src/styles.css'

const STARTER_SCHEMA = [
  { name: 'InvoiceNumber', type: 'string',  required: true, order: 10 },
  { name: 'InvoiceDate',   type: 'date',    required: true, order: 20 },
  { name: 'CreditAmount',  type: 'number',                  order: 30 },
  { name: 'IsPaid',        type: 'boolean',                 order: 40, default: false }
]

export default function App() {
  const [schema, setSchema] = useState(STARTER_SCHEMA)
  const [value, setValue] = useState({})
  return (
    <>
      <SchemaEditor schema={schema} onChange={setSchema} />
      <DynamicForm schema={schema} value={value} onChange={setValue} />
    </>
  )
}
```

## Validating what the form collected

`applySchema(schema, values, label)` returns the resolved values, with defaults filled in for missing fields. When something is wrong it throws a `ValidationError`. The current `@xeplr/schema-handler` gives that error a `details` array of `{ field, message }`, which maps straight onto `DynamicForm`'s `errors` prop:

```jsx
import { applySchema, ValidationError } from '@xeplr/schema-handler'

const [errors, setErrors] = useState({})

function validate() {
  try {
    const resolved = applySchema(schema, value, 'field')
    setErrors({})
    return resolved
  } catch (err) {
    if (!(err instanceof ValidationError)) throw err
    setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])))
  }
}

<DynamicForm schema={schema} value={value} onChange={setValue} errors={errors} />
```

## Exports

| export | kind | signature | what it does |
|---|---|---|---|
| `DynamicForm` | component | `{ schema, value, onChange, errors, disabled, labels }` | Shows one input per field, sorted by `order`, and returns the whole value object on every change |
| `SchemaEditor` | component | `{ schema, onChange, addLabel }` | Edits the schema as a table: name, type, label, default, required, description, move up/down, remove |

There are no hooks and no model module. The package has just these two components.

## `<DynamicForm>`

| prop | type | default | meaning |
|---|---|---|---|
| `schema` | `Array<{ name, type?, required?, default?, description?, order? }>` | `[]` | Fields to show. Entries without a `name` are skipped. |
| `value` | `object` | `{}` | Current values, keyed by field `name` |
| `onChange` | `(nextValue) => void` | — | Called with the **whole** new value object, not a single field |
| `errors` | `{ [name]: string }` | `{}` | Message shown under a field. The field also gets `xeplr-shf-field--error`. |
| `disabled` | `boolean` | `false` | Disables every input |
| `labels` | `{ [name]: string }` | `{}` | Display label for a field. Without one, the name is humanized: `InvoiceDate` becomes "Invoice Date" and `due_date` becomes "Due date". |

Each row shows the label, a `*` if `required`, the type as a small tag, the `description` if present, the input, and the error if present.

| `type` | input | value sent to `onChange` |
|---|---|---|
| `string` (or none, or any unknown type) | text | the string |
| `number` | number | a `Number`. Clearing the box gives `undefined`. |
| `boolean` | checkbox | `true` / `false` |
| `date` | date | `"YYYY-MM-DD"`. An incoming value is cut to its first 10 characters for display. |
| `object`, `array` | JSON textarea (4 rows) | The parsed JSON. An empty box gives `{}` or `[]`. Invalid JSON shows "Invalid JSON: …" and `value` is not changed. |

Things to know:

- **The form never writes defaults into `value`.** A `string` field shows its `default` in the box until you edit it. `number`, `date` and `boolean` inputs don't show the default at all. `applySchema` fills defaults in for missing values.
- **`DynamicForm` ignores a field's `label` property**, even though `SchemaEditor` lets you set one. Use the `labels` prop to set display names.
- `options` and `validation` on a field are not shown as inputs (there is no select, no min/max). `applySchema` still enforces them.
- Fields with no `order` sort after ordered ones (they count as `999`).

## `<SchemaEditor>`

| prop | type | default | meaning |
|---|---|---|---|
| `schema` | `Array<field>` | `[]` | The schema to edit. Rows are shown sorted by `order`. |
| `onChange` | `(nextSchema) => void` | — | Called with the whole new schema on every edit |
| `addLabel` | `string` | `'+ Add field'` | Text of the add button |

Columns: move (↑/↓), **Name**, **Type**, **Label**, **Default value**, **Required**, **Description**, remove (×). An empty schema shows "No fields yet."

- **Every edit renumbers `order` to 10, 20, 30…** This covers editing, adding, removing and moving. A new field added at the end therefore always sorts last. The schema you get back always has an `order` on every field.
- **Add** appends `{ name: '', type: 'string' }`.
- **Type** lists `TYPES` from `@xeplr/schema-handler`: `string`, `number`, `boolean`, `date`, `object`, `array`.
- **Default value** depends on the type, and always fits on one line:
  - `boolean`: a select with blank, `true` or `false`.
  - `number`: a number input.
  - `object` / `array`: one line of JSON. Invalid JSON is never committed.
  - `string` / `date`: text.
  - For every type, **blank means `undefined`**, and the placeholder reads "blank → the step must supply it". A field with no default must get its value from whatever runs the schema.

## Theming

The stylesheet has no CSS variables and does not read the `--xeplr-*` tokens from `@xeplr/ui-account`'s `ThemeProvider`. Its colours are fixed and light. Every rule uses the `xeplr-shf-*` prefix, so you can restyle it without conflicts, or skip the import and write your own.

| component | classes |
|---|---|
| `DynamicForm` | `xeplr-shf-form`, `xeplr-shf-field`, `xeplr-shf-field--error`, `xeplr-shf-label`, `xeplr-shf-required`, `xeplr-shf-type`, `xeplr-shf-desc`, `xeplr-shf-input` (`--check`, `--json`), `xeplr-shf-json`, `xeplr-shf-err` |
| `SchemaEditor` | `xeplr-shf-table-wrap`, `xeplr-shf-table`, `xeplr-shf-tr`, `xeplr-shf-inp` (`--code`, `--type`, `--muted`), `xeplr-shf-chk`, `xeplr-shf-move`, `xeplr-shf-x`, `xeplr-shf-add-btn`, `xeplr-shf-empty-row` |

## Try it

The demo links sibling checkouts (`../../xeplr-schema-handler`), so run it from inside the xeplr-os workspace:

```sh
cd demo
npm install
npm run dev     # http://localhost:5273 — SchemaEditor, DynamicForm and applySchema side by side
```

## Files

```
src/
  index.js          ─ exports DynamicForm, SchemaEditor
  DynamicForm.jsx   ─ the form; one input per field type
  SchemaEditor.jsx  ─ the table editor; renumbers order on every change
  styles.css        ─ optional default styles, xeplr-shf-*
demo/               ─ Vite app (not published)
```

## Tests

There is no test suite. `package.json` has no `test` script, so CI and the release workflow only log a "nothing verified" warning.

## License

MIT
