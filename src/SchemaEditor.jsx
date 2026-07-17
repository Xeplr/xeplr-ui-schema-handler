import React from 'react';
import { TYPES } from '@xeplr/schema-handler';

/**
 * Table-per-schema editor. One row = one field. Reorder via ↑/↓ arrows.
 *
 * Props:
 *   schema     — array of field defs
 *   onChange(nextSchema)
 *   addLabel   — button label; default "+ Add field"
 *
 * Field shape:
 *   { name, type, label?, required, default, description, order }
 */
export function SchemaEditor({ schema = [], onChange, addLabel = '+ Add field' }) {
  const rows = React.useMemo(() => sortByOrder(schema), [schema]);
  const emit = (next) => onChange && onChange(next);

  const setAt = (idx, next) => {
    const copy = rows.slice();
    copy[idx] = next;
    emit(reindexOrder(copy));
  };
  const removeAt = (idx) => {
    const copy = rows.slice();
    copy.splice(idx, 1);
    emit(reindexOrder(copy));
  };
  const move = (idx, delta) => {
    const target = idx + delta;
    if (target < 0 || target >= rows.length) return;
    const copy = rows.slice();
    const [item] = copy.splice(idx, 1);
    copy.splice(target, 0, item);
    emit(reindexOrder(copy));
  };
  const add = () => {
    const next = rows.concat([{ name: '', type: 'string' }]);
    emit(reindexOrder(next));
  };

  return (
    <div className="xeplr-shf-table-wrap">
      <table className="xeplr-shf-table">
        <thead>
          <tr>
            <th className="xeplr-shf-th-move"></th>
            <th>Name</th>
            <th>Type</th>
            <th>Label</th>
            <th>Default value</th>
            <th className="xeplr-shf-th-center">Required</th>
            <th>Description</th>
            <th className="xeplr-shf-th-remove"></th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={8} className="xeplr-shf-empty-row">No fields yet.</td></tr>
          )}
          {rows.map((field, i) => (
            <FieldRow
              key={i}
              field={field}
              isFirst={i === 0}
              isLast={i === rows.length - 1}
              onChange={(next) => setAt(i, next)}
              onRemove={() => removeAt(i)}
              onMoveUp={() => move(i, -1)}
              onMoveDown={() => move(i, 1)}
            />
          ))}
        </tbody>
      </table>
      <button type="button" className="xeplr-shf-add-btn" onClick={add}>{addLabel}</button>
    </div>
  );
}

function FieldRow({ field, isFirst, isLast, onChange, onRemove, onMoveUp, onMoveDown }) {
  const set = (k, v) => onChange({ ...field, [k]: v });

  return (
    <tr className="xeplr-shf-tr">
      <td className="xeplr-shf-td-move">
        <button type="button" className="xeplr-shf-move" onClick={onMoveUp}   disabled={isFirst} title="Move up">↑</button>
        <button type="button" className="xeplr-shf-move" onClick={onMoveDown} disabled={isLast}  title="Move down">↓</button>
      </td>
      <td>
        <input
          type="text"
          className="xeplr-shf-inp xeplr-shf-inp--code"
          value={field.name || ''}
          onChange={(e) => set('name', e.target.value)}
          placeholder="fieldName"
        />
      </td>
      <td>
        <select
          className="xeplr-shf-inp xeplr-shf-inp--type"
          value={field.type || 'string'}
          onChange={(e) => set('type', e.target.value)}
        >
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </td>
      <td>
        <input
          type="text"
          className="xeplr-shf-inp xeplr-shf-inp--muted"
          value={field.label || ''}
          onChange={(e) => set('label', e.target.value)}
          placeholder="optional"
        />
      </td>
      <td>
        <DefaultInput field={field} onChange={(v) => set('default', v)} />
      </td>
      <td className="xeplr-shf-td-center">
        <input
          type="checkbox"
          className="xeplr-shf-chk"
          checked={!!field.required}
          onChange={(e) => set('required', e.target.checked)}
        />
      </td>
      <td>
        <input
          type="text"
          className="xeplr-shf-inp xeplr-shf-inp--muted"
          value={field.description || ''}
          onChange={(e) => set('description', e.target.value)}
          placeholder="optional"
        />
      </td>
      <td className="xeplr-shf-td-remove">
        <button type="button" className="xeplr-shf-x" onClick={onRemove} title="Remove field">×</button>
      </td>
    </tr>
  );
}

/**
 * Default-value input adapts to the field's type but always renders as a
 * single-line control that fits the table row.
 */
function DefaultInput({ field, onChange }) {
  const t = field.type || 'string';
  const common = { className: 'xeplr-shf-inp xeplr-shf-inp--muted' };

  if (t === 'boolean') {
    return (
      <select
        {...common}
        value={field.default === undefined ? '' : String(field.default)}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === '' ? undefined : v === 'true');
        }}
      >
        <option value="">blank → the step must supply it</option>
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    );
  }
  if (t === 'number') {
    return (
      <input
        type="number"
        {...common}
        value={field.default ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        placeholder="blank → the step must supply it"
      />
    );
  }
  if (t === 'object' || t === 'array') {
    // JSON one-liner. Wider forms should use a modal — keep the row compact.
    return (
      <input
        type="text"
        {...common}
        value={field.default === undefined ? '' : safeStringify(field.default)}
        onChange={(e) => {
          const txt = e.target.value;
          if (txt.trim() === '') { onChange(undefined); return; }
          try { onChange(JSON.parse(txt)); }
          catch { /* keep raw string in the input, don't commit invalid JSON */ }
        }}
        placeholder={t === 'array' ? '[] blank → the step must supply it' : '{} blank → the step must supply it'}
      />
    );
  }
  // string, date
  return (
    <input
      type="text"
      {...common}
      value={field.default ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value)}
      placeholder="blank → the step must supply it"
    />
  );
}

function sortByOrder(list) {
  return [...(list || [])].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

// Renumber order 10, 20, 30... so a fresh add at the end always slots in.
function reindexOrder(list) {
  return list.map((f, i) => ({ ...f, order: (i + 1) * 10 }));
}

function safeStringify(v) {
  try { return JSON.stringify(v); } catch { return ''; }
}
