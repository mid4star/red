const fs = require('fs');
const filePath = 'src/app/[lang]/staff/(dashboard)/eia/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// ======= SYSTEMATIC LIGHT MODE FIXES =======
// The approach: replace dark-only hardcoded colors with dark: prefixed versions

// 1. Page/section header borders
content = content.replace(
  /border-b border-white\/10/g,
  'border-b border-slate-200 dark:border-white/10'
);

// 2. Tab navigation container: dark blue bg
content = content.replace(
  /className="grid grid-cols-4 bg-\[#0d1e36\] p-1\.5 rounded-2xl border border-white\/5 shadow-inner gap-1"/g,
  'className="grid grid-cols-4 bg-slate-100 dark:bg-[#0d1e36] p-1.5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-inner gap-1"'
);

// 3. Inactive tab text color
content = content.replace(
  /text-slate-400 hover:text-white hover:bg-white\/5/g,
  'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'
);

// 4. Form card background
content = content.replace(
  /className="p-6 border border-teal-500\/20 bg-slate-900\/80 backdrop-blur-xl rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-300"/g,
  'className="p-6 border border-teal-500/30 bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-300"'
);

// 5. Form title
content = content.replace(
  /className="font-bold text-lg text-white mb-4 flex items-center gap-2 pb-3 border-b border-white\/5"/g,
  'className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-white/5"'
);

// 6. Form label colors
content = content.replace(
  /className="text-\[11px\] font-bold text-slate-400 uppercase tracking-widest"/g,
  'className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest"'
);
content = content.replace(
  /className="text-\[11px\] font-bold text-slate-400 uppercase tracking-widest block"/g,
  'className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block"'
);

// 7. Input backgrounds (all dark-hardcoded inputs)
content = content.replace(
  /className="bg-\[#0b1329\] border-white\/10 text-white rounded-xl"/g,
  'className="bg-slate-50 dark:bg-[#0b1329] border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl"'
);

// 8. Textarea dark background
content = content.replace(
  /className="w-full bg-\[#0b1329\] border border-white\/10 text-white rounded-xl p-3 focus:outline-none focus:border-teal-500 text-sm"/g,
  'className="w-full bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl p-3 focus:outline-none focus:border-teal-500 text-sm"'
);

// 9. Select dark backgrounds
content = content.replace(
  /className="w-full h-11 bg-\[#0b1329\] border border-white\/10 text-white rounded-xl px-3 focus:outline-none focus:border-teal-500 text-sm"/g,
  'className="w-full h-11 bg-slate-50 dark:bg-[#0b1329] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl px-3 focus:outline-none focus:border-teal-500 text-sm"'
);

// 10. Card items in the list (Records)
content = content.replace(
  /className="p-5 border border-white\/5 bg-slate-900\/40 backdrop-blur-xl hover:border-white\/10 transition-all relative overflow-hidden group cursor-pointer"/g,
  'className="p-5 border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 backdrop-blur-xl hover:border-teal-300 dark:hover:border-white/10 transition-all relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md"'
);

// 11. Card item titles (h4)
content = content.replace(
  /className="font-bold text-white text-base leading-snug"/g,
  'className="font-bold text-slate-900 dark:text-white text-base leading-snug"'
);

// 12. Date and info text
content = content.replace(
  /className="text-xs text-slate-300 leading-relaxed font-medium mb-4"/g,
  'className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-4"'
);

// 13. Search panel backgrounds
content = content.replace(
  /p-3 bg-slate-900\/40 backdrop-blur-xl border border-white\/5 rounded-2xl/g,
  'p-3 bg-slate-100 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl'
);

// 14. Search inputs inside search panels
content = content.replace(
  /className="bg-\[#0b1329\] border border-white\/5 text-slate-300 rounded-xl px-2\.5 py-2 text-xs focus:outline-none focus:border-teal-500 w-full"/g,
  'className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-teal-500 w-full"'
);

content = content.replace(
  /className={`w-full bg-\[#0b1329\] border border-white\/5 text-slate-300 rounded-xl \$\{isArabic/g,
  'className={`w-full bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-xl ${isArabic'
);

// 15. Date inputs
content = content.replace(
  /className="bg-\[#0b1329\] border border-white\/5 text-slate-300 rounded-xl px-2\.5 py-2 text-xs focus:outline-none focus:border-teal-500 w-full"/g,
  'className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-teal-500 w-full"'
);

// 16. Select filters
content = content.replace(
  /className="bg-\[#0b1329\] border border-white\/5 text-slate-300 rounded-xl px-2\.5 py-2 text-xs focus:outline-none focus:border-teal-500 w-full"/g,
  'className="bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-teal-500 w-full"'
);

// 17. Inspection/Violation/Accident card backgrounds (border-l-4 cards)
content = content.replace(
  /bg-slate-900\/40 backdrop-blur-xl transition-all relative border-l-4 border-l-emerald-500/g,
  'bg-white dark:bg-slate-900/40 backdrop-blur-xl transition-all relative border-l-4 border-l-emerald-500 shadow-sm'
);
content = content.replace(
  /bg-slate-900\/40 backdrop-blur-xl transition-all relative border-l-4 border-l-rose-500/g,
  'bg-white dark:bg-slate-900/40 backdrop-blur-xl transition-all relative border-l-4 border-l-rose-500 shadow-sm'
);
content = content.replace(
  /bg-slate-900\/40 backdrop-blur-xl transition-all relative border-l-4 border-l-amber-500/g,
  'bg-white dark:bg-slate-900/40 backdrop-blur-xl transition-all relative border-l-4 border-l-amber-500 shadow-sm'
);

// 18. Card borders for the list items  
content = content.replace(
  /border-white\/5 hover:border-white\/10'\}/g,
  "border-slate-200 dark:border-white/5 hover:border-teal-300 dark:hover:border-white/10'}"
);

// 19. Inspector text in cards (text-slate-300 font-medium)
content = content.replace(
  /<span className="text-xs text-slate-300 font-medium flex items-center gap-1\.5">/g,
  '<span className="text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">'
);

// 20. Page header text (h1 was text-white)
content = content.replace(
  /className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tighter"/g,
  'className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter"'
);

// 21. Page subtitle text
content = content.replace(
  /className="text-slate-400 text-sm font-medium"/g,
  'className="text-slate-500 dark:text-slate-400 text-sm font-medium"'
);

// 22. Date chips (Calendar icon + date)
content = content.replace(
  /className="text-\[10px\] text-slate-400 font-bold flex items-center gap-1 bg-white\/5 border border-white\/5 px-2 py-1 rounded-lg"/g,
  'className="text-[10px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-2 py-1 rounded-lg"'
);

// 23. Border separator in cards
content = content.replace(
  /border-t border-white\/5 mt-3/g,
  'border-t border-slate-200 dark:border-white/5 mt-3'
);
content = content.replace(
  /border-t border-white\/5 gap-3/g,
  'border-t border-slate-200 dark:border-white/5 gap-3'
);

// 24. Empty state text
content = content.replace(
  /className="py-12 text-center text-slate-500 text-sm italic font-medium uppercase tracking-widest bg-slate-900\/10 rounded-2xl border border-dashed border-white\/5"/g,
  'className="py-12 text-center text-slate-500 dark:text-slate-500 text-sm italic font-medium uppercase tracking-widest bg-slate-100 dark:bg-slate-900/10 rounded-2xl border border-dashed border-slate-300 dark:border-white/5"'
);

// 25. Mobile toggle panel
content = content.replace(
  /className="flex p-1 bg-\[#0a1628\]\/90 backdrop-blur-2xl border border-white\/10 rounded-2xl mb-4 gap-1\.5 shadow-xl"/g,
  'className="flex p-1 bg-slate-100 dark:bg-[#0a1628]/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-2xl mb-4 gap-1.5 shadow-xl"'
);
content = content.replace(
  /'text-slate-400 hover:text-white'\n/g,
  "'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'\n"
);

// 26. Uploaded file badges
content = content.replace(
  /className="flex items-center gap-2 px-3 py-1\.5 bg-white\/5 border border-white\/10 rounded-xl text-xs text-slate-300"/g,
  'className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-700 dark:text-slate-300"'
);

// 27. Upload button borders
content = content.replace(
  /border border-dashed border-white\/20 text-slate-400 hover:text-white hover:bg-white\/5/g,
  'border border-dashed border-slate-300 dark:border-white/20 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
);

// 28. renderDetailedView card
content = content.replace(
  /className="p-6 border border-white\/10 bg-slate-900\/40 backdrop-blur-xl rounded-3xl shadow-xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-300"/g,
  'className="p-6 border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-300"'
);

// 29. Detail view inner field borders
content = content.replace(
  /border-b border-white\/10/g,
  'border-b border-slate-200 dark:border-white/10'
);

// 30. Calendar date chips  
content = content.replace(
  /className="text-\[10px\] text-slate-400 font-bold flex items-center gap-1\.5"/g,
  'className="text-[10px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1.5"'
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Light mode fixes applied!');

// Verify balance
const final = fs.readFileSync(filePath, 'utf-8');
let bal = 0;
for (const c of final) { if (c==='{') bal++; else if (c==='}') bal--; }
console.log('Brace balance:', bal);
