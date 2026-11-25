import React from 'react';

/**
 * Reusable Table Component
 * Clean, modern academic SaaS table with custom column rendering and responsive container.
 */
export function Table({
  columns = [],
  data = [],
  emptyMessage = 'No records found.',
  keyField = 'id',
  className = '',
  style = {}
}) {
  return (
    <div
      className={`table-responsive-wrapper ${className}`}
      style={{
        width: '100%',
        overflowX: 'auto',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-xs)',
        ...style
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '0.875rem'
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: 'var(--bg-body)',
              borderBottom: '1px solid var(--border-light)'
            }}
          >
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                style={{
                  padding: '0.75rem 1rem',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--navy-700)',
                  width: col.width || 'auto',
                  textAlign: col.align || 'left'
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  padding: '2.5rem 1rem',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem' }}>📋</span>
                  <span>{emptyMessage}</span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row[keyField] || rowIndex}
                style={{
                  borderBottom: rowIndex < data.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  backgroundColor: rowIndex % 2 === 1 ? '#fcfdfd' : 'var(--bg-surface)',
                  transition: 'background-color 0.1s ease'
                }}
              >
                {columns.map((col, colIndex) => {
                  const cellValue = row[col.key];
                  return (
                    <td
                      key={col.key || colIndex}
                      style={{
                        padding: '0.85rem 1rem',
                        color: 'var(--text-main)',
                        verticalAlign: 'middle',
                        textAlign: col.align || 'left'
                      }}
                    >
                      {col.render ? col.render(cellValue, row, rowIndex) : cellValue}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;

