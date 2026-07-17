import React from 'react';
import { DynamicForm, SchemaEditor } from '@xeplr/ui-schema-handler';
import { applySchema, ValidationError } from '@xeplr/schema-handler';
import '@xeplr/ui-schema-handler/src/styles.css';
import './App.css';

const STARTER_SCHEMA = [
  { name: 'VendorAccount', type: 'string',  required: true,  order: 10 },
  { name: 'InvoiceNumber', type: 'string',  required: true,  order: 20 },
  { name: 'InvoiceDate',   type: 'date',    required: true,  order: 30 },
  { name: 'CurrencyCode',  type: 'string',                   order: 40, default: 'USD' },
  { name: 'CreditAmount',  type: 'number',                   order: 50 },
  { name: 'IsPaid',        type: 'boolean',                  order: 60, default: false, description: 'Marks a paid invoice for exclusion.' }
];

export default function App() {
  const [schema, setSchema] = React.useState(STARTER_SCHEMA);
  const [value, setValue]   = React.useState({});
  const [errors, setErrors] = React.useState({});
  const [lastValid, setLastValid] = React.useState(null);

  const validate = () => {
    try {
      const resolved = applySchema(schema, value, 'field');
      setErrors({});
      setLastValid(resolved);
    } catch (err) {
      if (err instanceof ValidationError) {
        // Map details → per-field errors.
        const map = {};
        err.details.forEach(msg => {
          // format: '<label> field "<name>" ...' OR 'Missing required <label> field: <name>'
          const m = msg.match(/field[: ]"?([^"\s]+)"?/);
          if (m) map[m[1]] = msg;
        });
        setErrors(map);
        setLastValid(null);
      } else throw err;
    }
  };

  return (
    <div className="app">
      <header>
        <h1>@xeplr/ui-schema-handler</h1>
        <p>Edit the schema (left) → the form (middle) auto-updates. Fill it, hit <b>Validate</b>, see errors + resolved values (right).</p>
      </header>

      <div className="cols">
        <section className="col">
          <h2>Schema (SchemaEditor)</h2>
          <SchemaEditor schema={schema} onChange={setSchema} />
          <details style={{ marginTop: 16 }}>
            <summary>Raw JSON</summary>
            <pre>{JSON.stringify(schema, null, 2)}</pre>
          </details>
        </section>

        <section className="col">
          <h2>Rendered form (DynamicForm)</h2>
          <DynamicForm schema={schema} value={value} onChange={setValue} errors={errors} />
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button onClick={validate} className="primary">Validate</button>
            <button onClick={() => { setValue({}); setErrors({}); setLastValid(null); }}>Reset values</button>
          </div>
        </section>

        <section className="col">
          <h2>Current value</h2>
          <pre>{JSON.stringify(value, null, 2)}</pre>
          <h2>After applySchema</h2>
          {lastValid && <pre className="ok">{JSON.stringify(lastValid, null, 2)}</pre>}
          {!lastValid && Object.keys(errors).length > 0 && (
            <pre className="err">{JSON.stringify(errors, null, 2)}</pre>
          )}
          {!lastValid && Object.keys(errors).length === 0 && (
            <p style={{ color: '#888' }}>Click <b>Validate</b> to run <code>applySchema</code>.</p>
          )}
        </section>
      </div>
    </div>
  );
}
