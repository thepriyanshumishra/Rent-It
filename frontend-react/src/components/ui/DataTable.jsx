import React from 'react';
import Skeleton from './Skeleton';

const DataTable = ({ columns, data, loading, emptyText = 'No data available', emptyMessage, onRowClick }) => {
  const actualEmptyText = emptyMessage || emptyText;

  if (loading) {
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {columns.map((col, i) => (
                <th key={col.key || col.accessor || i} className="p-4 font-medium text-sm text-[var(--text-muted)]">
                  {col.label || col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-[var(--border-subtle)]">
                {columns.map((col, j) => (
                  <td key={j} className="p-4">
                    <Skeleton className="h-4 w-full max-w-[100px]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)] border border-[var(--border-subtle)] rounded-lg">
        {actualEmptyText}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-[var(--border)] rounded-lg bg-[var(--bg-elevated)]">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[var(--bg-subtle)]">
          <tr className="border-b border-[var(--border)]">
            {columns.map((col, i) => (
              <th 
                key={col.key || col.accessor || i} 
                className="p-4 font-medium text-sm text-[var(--text-muted)] whitespace-nowrap"
                style={{ width: col.width }}
              >
                {col.label || col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr 
              key={row.id || i} 
              onClick={() => onRowClick && onRowClick(row)}
              className={`border-b border-[var(--border-subtle)] last:border-0 hover:bg-[var(--bg-subtle)] transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col, j) => {
                const key = col.key || col.accessor;
                const value = key ? row[key] : undefined;
                let cellContent = value;
                if (col.cell) {
                  cellContent = col.cell(row, value);
                } else if (col.render) {
                  cellContent = col.render(value, row);
                }

                return (
                  <td key={col.key || col.accessor || j} className="p-4 text-sm text-[var(--text)]">
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
