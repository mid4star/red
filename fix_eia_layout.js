const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', '[lang]', 'staff', '(dashboard)', 'eia', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// ========================================
// Step 1: Add EIAReportModal import if missing
// ========================================
if (!content.includes("import EIAReportModal from './EIAReportModal'")) {
  content = content.replace(
    "import { MapItem } from '@/components/eia/MapComponent';",
    "import { MapItem } from '@/components/eia/MapComponent';\nimport EIAReportModal from './EIAReportModal';"
  );
  console.log('Added EIAReportModal import');
}

// ========================================
// Step 2: Add isReportModalOpen state if missing
// ========================================
if (!content.includes('isReportModalOpen')) {
  content = content.replace(
    "const [showAddForm, setShowAddForm] = useState<boolean>(false);",
    "const [showAddForm, setShowAddForm] = useState<boolean>(false);\n  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);"
  );
  console.log('Added isReportModalOpen state');
}

// ========================================
// Step 3: Change the grid from col-5 to col-12, data from col-3 to col-5
// ========================================
// Original:
// <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
//   <div className={`lg:col-span-3 space-y-6 ...`}>  [DATA]
// </div>
// <div className={`lg:col-span-2 ...`}>  [MAP - OUTSIDE GRID]

// Target:
// <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-start">
//   <div className={`lg:col-span-7 ...`}> [MAP - first, big]
//   <div className={`lg:col-span-5 space-y-4...`}>  [DATA - second, smaller]
// </div>

// Change the grid container
content = content.replace(
  `      {/* ── Main Layout Split Screen: 60% Lists & Forms, 40% GIS Map ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Side: Forms & Content Lists (60% equivalent = 3 cols) */}
        <div className={\`lg:col-span-3 space-y-6 \${isMobile && mobilePanel !== 'data' ? 'hidden' : ''}\`}>`,
  `      {/* ── Main Layout: Map (7 cols) LEFT + Data (5 cols) RIGHT — same as Monitoring ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 items-start">
        
        {/* Left Column: GIS Map (7 of 12 cols) */}
        <div className={\`lg:col-span-7 \${isMobile && mobilePanel !== 'map' ? 'hidden' : ''} \${isMobile ? 'h-[calc(100vh-16rem)]' : 'h-[600px] lg:h-[calc(100vh-14rem)] sticky top-6'} relative\`}>
          <MapComponent
            items={mapItems}
            activeItem={activeMapItem}
            onItemSelect={(item) => {
              setActiveMapItem(item);
              const tabName = item.dataType === 'inspection' ? 'inspections' : item.dataType === 'violation' ? 'violations' : 'accidents';
              setActiveTab(tabName);
              if (item.dataType === 'inspection') {
                const found = inspections.find(i => i.id === item.id);
                if (found) { setSelectedDetailItem(found); setSelectedDetailType('inspections'); setIsEditingDetail(false); }
              } else if (item.dataType === 'violation') {
                const found = violations.find(v => v.id === item.id);
                if (found) { setSelectedDetailItem(found); setSelectedDetailType('violations'); setIsEditingDetail(false); }
              } else if (item.dataType === 'accident') {
                const found = accidents.find(a => a.id === item.id);
                if (found) { setSelectedDetailItem(found); setSelectedDetailType('accidents'); setIsEditingDetail(false); }
              }
            }}
            lang={params.lang}
          />
        </div>

        {/* Right Column: Forms & Content Lists (5 of 12 cols) */}
        <div className={\`lg:col-span-5 space-y-4 md:space-y-5 \${isMobile && mobilePanel !== 'data' ? 'hidden' : ''}\`}>`
);

// ========================================
// Step 4: Remove the old external map div (it's now inside the grid)
// Find the comment "Right Side: Fixed/Interactive GIS Leaflet Map" and replace
// that whole block with just the EIAReportModal and grid close.
// ========================================

// The old block starts right after </div> (closing the data col) and </div> (closing grid)
// We need to find the exact string to replace

// Old pattern after data list ends:
// </div>  <- closes grid
// <div className={`lg:col-span-2 ...`}>  <- old external map
//   <MapComponent .../>
// </div>
// </div>   <- this was wrongly placed

// Find and replace: remove the old map block
const oldMapBlock = `

        {/* Right Side: Fixed/Interactive GIS Leaflet Map (40% equivalent = 2 cols) */}
        <div className={\`lg:col-span-2 relative \${isMobile && mobilePanel !== 'map' ? 'hidden' : ''} \${isMobile ? 'h-[calc(100vh-16rem)]' : 'h-[600px] lg:h-[calc(100vh-14rem)] sticky top-6'}\`}>
          <MapComponent 
            items={mapItems} 
            activeItem={activeMapItem} 
            onItemSelect={(item) => {
              setActiveMapItem(item);
              const tabName = item.dataType === 'inspection' ? 'inspections' : item.dataType === 'violation' ? 'violations' : 'accidents';
              setActiveTab(tabName);
              
              if (item.dataType === 'inspection') {
                const found = inspections.find(i => i.id === item.id);
                if (found) {
                  setSelectedDetailItem(found);
                  setSelectedDetailType('inspections');
                  setIsEditingDetail(false);
                }
              } else if (item.dataType === 'violation') {
                const found = violations.find(v => v.id === item.id);
                if (found) {
                  setSelectedDetailItem(found);
                  setSelectedDetailType('violations');
                  setIsEditingDetail(false);
                }
              } else if (item.dataType === 'accident') {
                const found = accidents.find(a => a.id === item.id);
                if (found) {
                  setSelectedDetailItem(found);
                  setSelectedDetailType('accidents');
                  setIsEditingDetail(false);
                }
              }
            }} 
            lang={params.lang}
          />
        </div>

      </div>`;

const newEndBlock = `

        <EIAReportModal 
          isOpen={isReportModalOpen} 
          onClose={() => setIsReportModalOpen(false)} 
          item={selectedDetailItem} 
          type={selectedDetailType}
          lang={params.lang} 
        />
      </div>`;

if (content.includes(oldMapBlock.trim().substring(0, 50))) {
  content = content.replace(oldMapBlock, newEndBlock);
  console.log('Removed old external map block and added EIAReportModal');
} else {
  console.log('WARNING: old map block pattern not found! Searching for partial...');
  const partial = `{/* Right Side: Fixed/Interactive GIS Leaflet Map`;
  const idx = content.indexOf(partial);
  if (idx > -1) {
    console.log('Found partial at index:', idx);
    console.log('Context:', content.substring(idx - 20, idx + 100));
  }
}

// ========================================
// Step 5: Make record clicks open the modal instead of renderDetailedView
// ========================================
if (!content.includes('setIsReportModalOpen(true)')) {
  // handleOpenDetail in EIA page: update to open modal
  content = content.replace(
    `  const handleOpenDetail = (item: any, type: 'costs' | 'inspections' | 'violations' | 'accidents') => {
    setSelectedDetailItem(item);
    setSelectedDetailType(type);
    setIsEditingDetail(false);
    setShowDeleteConfirm(false);
    setDeleteReasonText('');
    
    if (item.latitude && item.longitude) {
      const dataTypeMap = type === 'inspections' ? 'inspection' : type === 'violations' ? 'violation' : 'accident';
      const targetMapItem = mapItems.find(m => m.id === item.id && m.dataType === dataTypeMap);
      if (targetMapItem) {
        setActiveMapItem(targetMapItem);
      } else {
        setActiveMapItem({
          id: item.id,
          dataType: dataTypeMap as any,
          latitude: item.latitude,
          longitude: item.longitude,
          locationName: item.locationName,
          type: item.type || item.locationName,
          date: item.date,
          details: item.description || item.inspectorName || item.entityName,
          ...item
        });
      }
      if (isMobile) {
        setMobilePanel('map');
      }
    }
  };`,
    `  const handleOpenDetail = (item: any, type: 'costs' | 'inspections' | 'violations' | 'accidents') => {
    setSelectedDetailItem(item);
    setSelectedDetailType(type);
    setIsReportModalOpen(true);
    
    // Also highlight on map for map-aware items
    if (item.latitude && item.longitude) {
      const dataTypeMap = type === 'inspections' ? 'inspection' : type === 'violations' ? 'violation' : 'accident';
      const targetMapItem = mapItems.find(m => m.id === item.id && m.dataType === dataTypeMap);
      if (targetMapItem) {
        setActiveMapItem(targetMapItem);
      } else {
        setActiveMapItem({
          id: item.id,
          dataType: dataTypeMap as any,
          latitude: item.latitude,
          longitude: item.longitude,
          locationName: item.locationName,
          type: item.type || item.locationName,
          date: item.date,
          details: item.description || item.inspectorName || item.entityName,
          ...item
        });
      }
    }
  };`
  );
  console.log('Updated handleOpenDetail to open modal');
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('\nDone! Checking brace balance...');

// Quick check
const finalContent = fs.readFileSync(filePath, 'utf-8');
let balance = 0;
for (const ch of finalContent) {
  if (ch === '{') balance++;
  else if (ch === '}') balance--;
}
console.log('Brace balance (should be 0):', balance);
