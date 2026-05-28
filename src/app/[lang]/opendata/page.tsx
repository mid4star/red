import { Metadata } from 'next';
import OpenDataClient from './OpenDataClient';

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const isAr = params.lang === 'ar';
  return {
    title: isAr ? 'بوابة البيانات المفتوحة | هيئة محميات البحر الأحمر' : 'Open Data Portal | Red Sea Reserves Authority',
    description: isAr 
      ? 'الوصول إلى الدراسات العلمية والتقارير ومجموعات البيانات واللوائح الصادرة عن هيئة محميات البحر الأحمر.' 
      : 'Access scientific studies, reports, datasets, and guidelines published by the Red Sea Reserves Authority.',
  };
}

export default function OpenDataPage({ params }: { params: { lang: string } }) {
  return <OpenDataClient lang={params.lang} />;
}
