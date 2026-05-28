import { Metadata } from 'next';
import AboutClient from './AboutClient';

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const isAr = params.lang === 'ar';
  return {
    title: isAr ? 'من نحن | هيئة محميات البحر الأحمر' : 'About Us | Red Sea Reserves Authority',
    description: isAr 
      ? 'تعرف على الأهداف والاستراتيجية والهيكل التنظيمي لهيئة محميات البحر الأحمر.' 
      : 'Learn about the mission, strategy, and management structure of the Red Sea Marine Reserves Authority.',
  };
}

export default function AboutPage({ params }: { params: { lang: string } }) {
  return <AboutClient lang={params.lang} />;
}
