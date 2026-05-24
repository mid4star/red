import type { Metadata } from 'next';
import '../globals.css';
import { Inter, Cairo } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const cairo = Cairo({ weight: ['300', '400', '500', '600', '700', '800', '900'], subsets: ['arabic'], variable: '--font-cairo' });

export const metadata: Metadata = {
  title: 'Red Sea Marine Reserves Authority',
  description: 'محميات البحر الاحمر التابعة لجمهورية مصر العربية - نظام الإدارة',
};

export async function generateStaticParams() {
  return [{ lang: 'ar' }, { lang: 'en' }];
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const isArabic = params.lang === 'ar';
  
  return (
    <html lang={params.lang} dir={isArabic ? 'rtl' : 'ltr'}>
      <body className={`${inter.variable} ${cairo.variable} ${isArabic ? 'font-arabic' : 'font-english'} antialiased bg-whiteFoam text-oceanPrimary`}>
        {children}
      </body>
    </html>
  );
}
