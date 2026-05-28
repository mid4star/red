import { Metadata } from 'next';
import SpeciesClient from './SpeciesClient';

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const isAr = params.lang === 'ar';
  return {
    title: isAr ? 'موسوعة الكائنات البحرية | نظام محميات البحر الأحمر' : 'Marine Species Encyclopedia | Red Sea Protectorates',
    description: isAr 
      ? 'استكشف قاعدة البيانات الاستراتيجية لجميع الكائنات البحرية المحمية في إقليم البحر الأحمر.' 
      : 'Explore the tactical intelligence database of protected marine species in the Red Sea territory.',
  };
}

export default function SpeciesPage({ params }: { params: { lang: string } }) {
  return <SpeciesClient lang={params.lang} />;
}
