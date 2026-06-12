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
    <div className="w-full bg-th-surface rounded-2xl border border-th-border flex flex-col h-full overflow-hidden shadow-sm transition-all duration-300">
      <div className="p-4 md:p-5 border-b border-th-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-th-surface2">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder={isAr ? 'بحث سريع في جميع الحقول...' : 'Quick search...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full h-10 ${isAr ? 'pr-11 pl-4' : 'pl-11 pr-4'} text-sm bg-th-surface border border-th-border hover:border-teal-500/50 rounded-xl text-th-text focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all shadow-sm`}
            dir={isAr ? 'rtl' : 'ltr'}
          />
          <Search size={16} className={`absolute top-3 text-th-muted ${isAr ? 'right-4' : 'left-4'}`} />
        </div>
        <div className="flex items-center self-start md:self-auto gap-2">
          <div className="px-4 py-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 text-xs font-bold tracking-wide flex items-center gap-2">
            <span className="text-teal-500 bg-teal-500/10 px-2 py-0.5 rounded-md">{sortedData.length}</span> {isAr ? 'سجل' : 'records'}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse" dir={isAr ? 'rtl' : 'ltr'}>
          <thead className="bg-th-surface2 sticky top-0 z-10 shadow-sm border-b border-th-border">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  onClick={() => requestSort(col.key)}
                  className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-th-muted cursor-pointer hover:text-teal-500 transition-colors whitespace-nowrap"
                >
                  <div className={`flex items-center gap-2 ${isAr ? 'justify-start' : ''}`}>
                    {col.header}
                    <ArrowUpDown size={12} className="opacity-40" />
                  </div>
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className={`px-6 py-4 text-[11px] font-black uppercase tracking-widest text-th-muted whitespace-nowrap ${isAr ? 'text-left' : 'text-right'}`}>
                  {isAr ? 'إجراءات' : 'Actions'}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-th-border text-sm text-th-text">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-12 text-center">
                   <div className="flex flex-col items-center justify-center opacity-50">
                     <Search size={40} className="mb-3" />
                     <p className="font-medium italic text-sm">{emptyMessage || (isAr ? 'لا توجد بيانات متاحة.' : 'No data found.')}</p>
                   </div>
                </td>
              </tr>
            ) : (
              sortedData.map((row, rIdx) => (
                <tr 
                  key={row.id || rIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className="hover:bg-th-surface2/50 transition-colors cursor-pointer group relative"
                >
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-6 py-4" dir="auto">
                      {col.render ? col.render(row[col.key], row) : <span className="block max-w-[250px] whitespace-normal break-words">{row[col.key]}</span>}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onEdit && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onEdit(row); }}
                            className="p-2 text-teal-600 hover:text-white hover:bg-teal-500 rounded-lg transition-all shadow-sm"
                            title={isAr ? 'تعديل' : 'Edit'}
                          >
                            <Edit3 size={16} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onDelete(row.id, row.locationName || row.location || 'Record'); }}
                            className="p-2 text-rose-600 hover:text-white hover:bg-rose-500 rounded-lg transition-all shadow-sm"
                            title={isAr ? 'حذف' : 'Delete'}
                          >
                            <Trash2 size={16} />
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
