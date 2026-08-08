import React from 'react';
import Skeleton from './Skeleton';

const DataTable = ({ columns, data, loading, emptyText = 'No data available', onRowClick }) => {
  if (loading) {
    return (
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col, i) => (
                <th key={col.key || i} className="p-4 font-medium text-sm text-text-muted">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-border-subtle">
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
      <div className="p-8 text-center text-text-muted border border-border-subtle rounded-lg">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-border rounded-lg bg-bg-elevated">
      <table className="w-full text-left border-collapse">
        <thead className="bg-bg-subtle">
          <tr className="border-b border-border">
            {columns.map((col, i) => (
              <th 
                key={col.key || i} 
                className="p-4 font-medium text-sm text-text-muted whitespace-nowrap"
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr 
              key={row.id || i} 
              onClick={() => onRowClick && onRowClick(row)}
              className={`border-b border-border-subtle last:border-0 hover:bg-bg-subtle transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col, j) => (
                <td key={col.key || j} className="p-4 text-sm text-text">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
