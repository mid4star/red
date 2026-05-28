import { Metadata } from 'next';
import ContactClient from './ContactClient';

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const isAr = params.lang === 'ar';
  return {
    title: isAr ? 'تواصل معنا | هيئة محميات البحر الأحمر' : 'Contact Us | Red Sea Reserves Authority',
    description: isAr 
      ? 'تواصل مع هيئة محميات البحر الأحمر. أرسل الاستفسارات أو البلاغات أو طلبات تصاريح الزيارة.' 
      : 'Contact the Red Sea Marine Reserves Authority. Send inquiries, reporting logs, or request visitor permits.',
  };
}

export default function ContactPage({ params }: { params: { lang: string } }) {
  return <ContactClient lang={params.lang} />;
}
