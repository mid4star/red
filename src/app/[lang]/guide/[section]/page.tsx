import GuideSubPageClient from './GuideSubPageClient';

export async function generateMetadata({ params }: { params: { lang: string; section: string } }) {
   const isAr = params.lang === 'ar';
   const titleMap: Record<string, string> = {
      permit: isAr ? 'طلب تصريح زيارة' : 'Permit Application',
      seasonal: isAr ? 'البيانات الموسمية' : 'Seasonal Intelligence',
      etiquette: isAr ? 'آداب التعامل مع البحر' : 'Marine Etiquette',
      security: isAr ? 'البروتوكول الأمني' : 'Security Protocol',
      checklist: isAr ? 'قائمة مراجعة المعدات' : 'Equipment Checklist',
      prohibited: isAr ? 'المعدات المحظورة' : 'Prohibited Gear'
   };
   const title = titleMap[params.section] || (isAr ? 'دليل الزوار' : 'Visitor Guide');
   return {
      title: `${title} | RED`,
      description: isAr ? 'دليل الإحاطة الميداني التفاعلي لزوار البحر الأحمر' : 'Interactive Strategic Field Briefing for Red Sea Visitors'
   };
}

export default function GuideSubPage({ params }: { params: { lang: string; section: string } }) {
   return <GuideSubPageClient lang={params.lang} section={params.section} />;
}
