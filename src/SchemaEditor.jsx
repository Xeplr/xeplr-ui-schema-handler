import React from 'react';
import { FieldEditor } from './FieldEditor.jsx';

/**
 * Edit an entire schema (array of field definitions).
 *
 * Props:
 *   schema    — array of field defs
 *   onChange(nextSchema)
 *   addLabel  — button label; default "+ Add field"
 */
export function SchemaEditor({ schema = [], onChange, addLabel = '+ Add field' }) {
  const setAt = (i, nextField) => {
    const next = schema.slice();
    next[i] = nextField;
    onChange && onChange(next);
  };
  const removeAt = (i) => {
    const next = schema.slice();
    next.splice(i, 1);
    onChange && onChange(next);
  };
  const add = () => {
    const nextOrder = (schema.reduce((m, f) => Math.max(m, f.order ?? 0), 0) || 0) + 10;
    const next = schema.concat([{ name: '', type: 'string', order: nextOrder }]);
    onChange && onChange(next);
  };

  return (
    <div className="xeplr-shf-schema-editor">
      {schema.length === 0 && (
        <div className="xeplr-shf-empty">No fields yet.</div>
      )}
      {schema.map((field, i) => (
        <FieldEditor
          key={i}
          field={field}
          onChange={(f) => setAt(i, f)}
          onRemove={() => removeAt(i)}
        />
      ))}
      <button type="button" className="xeplr-shf-add-btn" onClick={add}>{addLabel}</button>
    </div>
  );
}
