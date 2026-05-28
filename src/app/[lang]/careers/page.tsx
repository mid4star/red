import { Metadata } from 'next';
import CareersClient from './CareersClient';

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const isAr = params.lang === 'ar';
  return {
    title: isAr ? 'الوظائف | هيئة محميات البحر الأحمر' : 'Careers | Red Sea Reserves Authority',
    description: isAr 
      ? 'انضم إلى هيئة محميات البحر الأحمر. استكشف الفرص الوظيفية في مجالات الدوريات، الأبحاث، والمراقبة البيئية.' 
      : 'Join the Red Sea Marine Reserves Authority. Explore career opportunities and job openings in patrols, research, and environmental monitoring.',
  };
}

export default function CareersPage({ params }: { params: { lang: string } }) {
  return <CareersClient lang={params.lang} />;
}
