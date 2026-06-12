'use client';

import React, { useState } from 'react';
import { Edit3, Trash2, Search, ArrowUpDown } from 'lucide-react';

interface Column {
  key: string;
  header: string;
  render?: (val: any, row: any) => React.ReactNode;
}

interface DataGridProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDelete?: (id: string, name: string) => void;
  lang: string;
  emptyMessage?: string;
}

export default function DataGrid({ columns, data, onRowClick, onEdit, onDelete, lang, emptyMessage }: DataGridProps) {
  const isAr = lang === 'ar';
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="w-full bg-th-surface rounded-xl border border-th-border flex flex-col h-full overflow-hidden shadow-sm transition-colors duration-300">
      <div className="p-4 border-b border-th-border flex items-center justify-between bg-th-surface2">
        <div className="relative w-64">
          <input
            type="text"
            placeholder={isAr ? 'بحث...' : 'Search...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-xs bg-th-input border border-th-border rounded-md text-th-text focus:outline-none focus:border-teal-500 transition-colors"
            dir={isAr ? 'rtl' : 'ltr'}
          />
          <Search size={14} className={`absolute top-2.5 text-th-muted ${isAr ? 'right-3' : 'left-3'}`} />
        </div>
        <span className="text-xs font-semibold text-th-muted">
          {sortedData.length} {isAr ? 'سجل' : 'records'}
        </span>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse" dir={isAr ? 'rtl' : 'ltr'}>
          <thead className="bg-th-surface2 sticky top-0 z-10 shadow-sm">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  onClick={() => requestSort(col.key)}
                  className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-th-muted cursor-pointer hover:text-teal-400 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    <ArrowUpDown size={12} className="opacity-50" />
                  </div>
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-th-muted text-right">
                  {isAr ? 'إجراءات' : 'Actions'}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-th-border text-xs text-th-text">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-8 text-center text-th-muted font-medium italic">
                  {emptyMessage || (isAr ? 'لا توجد بيانات.' : 'No data found.')}
                </td>
              </tr>
            ) : (
              sortedData.map((row, rIdx) => (
                <tr 
                  key={row.id || rIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className="hover:bg-th-surface2/50 transition-colors cursor-pointer group"
                >
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-4 py-3 whitespace-nowrap">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onEdit && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onEdit(row); }}
                            className="p-1.5 text-teal-500 hover:bg-teal-500/10 rounded-md transition-colors"
                            title={isAr ? 'تعديل' : 'Edit'}
                          >
                            <Edit3 size={14} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onDelete(row.id, row.locationName || row.location || 'Record'); }}
                            className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
                            title={isAr ? 'حذف' : 'Delete'}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
