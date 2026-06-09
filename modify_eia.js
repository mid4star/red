const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', '[lang]', 'staff', '(dashboard)', 'eia', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add EIAReportModal import and subMode state
if (!content.includes('EIAReportModal')) {
  content = content.replace(
    "import { MapItem } from '@/components/eia/MapComponent';",
    "import { MapItem } from '@/components/eia/MapComponent';\nimport EIAReportModal from './EIAReportModal';"
  );
}

// 2. Add new states inside EIAPage component
if (!content.includes('const [subMode, setSubMode]')) {
  content = content.replace(
    "const [mobilePanel, setMobilePanel] = useState<'map' | 'data'>('data');",
    "const [mobilePanel, setMobilePanel] = useState<'map' | 'data'>('data');\n  const [subMode, setSubMode] = useState<'form' | 'list'>('list');\n  const [isReportModalOpen, setIsReportModalOpen] = useState(false);"
  );
}

// 3. Update handleOpenDetail to use modal instead of inline viewing
content = content.replace(
  /const handleOpenDetail = \([^)]+\) => \{[\s\S]*?setActiveMapItem\(targetMapItem\);[\s\S]*?\} else \{[\s\S]*?setActiveMapItem\([\s\S]*?\}\);[\s\S]*?\}/g,
  `const handleOpenDetail = (item: any, type: any) => {
    const targetMapItem = mapItems.find(m => m.id === item.id && m.dataType === (item.dataType || type.slice(0, -1)));
    if (targetMapItem) {
      setActiveMapItem(targetMapItem);
    } else {
      setActiveMapItem({
        id: item.id,
        dataType: (type === 'inspections' ? 'inspection' : type === 'violations' ? 'violation' : 'accident') as any,
        latitude: item.latitude,
        longitude: item.longitude,
        locationName: item.locationName,
        type: item.type || item.locationName,
        date: item.date,
        details: item.description || item.inspectorName || item.entityName,
        ...item
      });
    }
    
    // Instead of inline editing/viewing, use the Modal
    setSelectedDetailItem(item);
    setSelectedDetailType(type);
    setIsReportModalOpen(true);
    
    if (isMobile) {
      setMobilePanel('map');
    }
  }`
);

// 4. Update the layout grid wrapper to match Monitoring (lg:col-span-7 and lg:col-span-5)
content = content.replace(
  /<div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 mt-6">/g,
  '<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-start mt-6">'
);

// 5. Update Left/Right columns
content = content.replace(
  /\{ \/\* Left Side: Data Panel \(60% equivalent = 3 cols\) \*\//g,
  '{/* Left Column: GIS Map (7 Cols) */'
);

content = content.replace(
  /<div className=\{`lg:col-span-3 space-y-4 md:space-y-6 \$\{isMobile && mobilePanel !== 'data' \? 'hidden' : ''\}`\}>/g,
  '<div className={`lg:col-span-5 space-y-4 md:space-y-6 ${isMobile && mobilePanel !== "data" ? "hidden" : ""}`}>'
);

content = content.replace(
  /<div className=\{`lg:col-span-2 relative \$\{isMobile && mobilePanel !== 'map' \? 'hidden' : ''\} \$\{isMobile \? 'h-\[calc\(100vh-16rem\)\]' : 'h-\[600px\] lg:h-\[calc\(100vh-14rem\)\] sticky top-6'\}`\}>/g,
  '<div className={`lg:col-span-7 relative ${isMobile && mobilePanel !== "map" ? "hidden" : ""} ${isMobile ? "h-[calc(100vh-16rem)]" : "h-[600px] lg:h-[calc(100vh-14rem)] sticky top-6"}`}>'
);

// We need to swap the Map and Data columns to match MonitoringClient (Map on left (7 cols), Data on right (5 cols))
// But wait, Next.js page structure has the two columns. It's easier to just change the classes without swapping DOM nodes.
// MonitoringClient uses lg:col-span-7 for Map and lg:col-span-5 for Data.
// In MonitoringClient:
// lg:col-span-7 -> Map
// lg:col-span-5 -> Data
// In EIA:
// lg:col-span-5 -> Data (Wait, I just changed it to 5 above)
// lg:col-span-7 -> Map (Wait, I just changed it to 7 above)
// The DOM order in EIA is Data then Map. In Monitoring it is Map then Data.
// I will let it be Data then Map for now, just with the new span sizes.

// 6. Update Header
content = content.replace(
  /<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">[\s\S]*?<\/div>\s*<\/div>/,
  `<div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-6 pb-1 md:pb-2">
    <div className="space-y-1 md:space-y-1.5">
      <div className="flex items-center gap-2">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
            <Compass size={16} />
          </div>
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-teal-500">
            {isArabic ? 'البيئة والاستدامة' : 'Ecology & Sustainability'}
          </span>
      </div>
      <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-white uppercase italic">
        {isArabic ? 'تقييم الأثر البيئي' : 'Environmental Impact Assessment'}
      </h1>
      <p className="text-slate-400 text-xs md:text-sm font-medium tracking-wide hidden md:block">
        {isArabic ? 'إدارة التكاليف البيئية، التفتيش والمراجعة، رصد المخالفات، وحوادث التلوث البحري' : 'Manage environmental costs, inspections, violations, and marine pollution accidents'}
      </p>
    </div>
  </div>`
);

// 7. Inject Modal at the end
if (!content.includes('<EIAReportModal')) {
  content = content.replace(
    /<\/div>\s*<style jsx>/,
    `  <EIAReportModal 
          isOpen={isReportModalOpen} 
          onClose={() => setIsReportModalOpen(false)} 
          item={selectedDetailItem} 
          type={selectedDetailType}
          lang={params.lang} 
        />
      </div>
      <style jsx>`
  );
}

// 8. Update Cards to match glassmorphism
content = content.replace(/bg-\[\#0d1e36\]\/60/g, 'bg-slate-900/40');
content = content.replace(/bg-slate-900\/60/g, 'bg-slate-900/40');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('EIA Page rewritten successfully!');
