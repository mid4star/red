import { Metadata } from 'next';
import RegulationsClient from './RegulationsClient';

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const isAr = params.lang === 'ar';
  return {
    title: isAr ? 'القوانين واللوائح | هيئة محميات البحر الأحمر' : 'Laws & Regulations | Red Sea Reserves Authority',
    description: isAr 
      ? 'استكشف القوانين البيئية، وقيود سرعة السفن، ولوائح الغوص في قطاعات البحر الأحمر المحمية.' 
      : 'Explore the environmental laws, vessel speed limits, and diving regulations in the Red Sea protected sectors.',
  };
}

export default function RegulationsPage({ params }: { params: { lang: string } }) {
  return <RegulationsClient lang={params.lang} />;
}
