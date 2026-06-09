import type { Metadata } from 'next';
import '../globals.css';
import { Inter, Cairo } from 'next/font/google';
import { ThemeProvider } from '../../components/layout/ThemeProvider';
import { prisma } from '@/lib/prisma';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const cairo = Cairo({ weight: ['300', '400', '500', '600', '700', '800', '900'], subsets: ['arabic'], variable: '--font-cairo' });

export async function generateMetadata({ params }: { params: { lang: string } }) {
   const isAr = params.lang === 'ar';
   const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://red-sea-authority.eg';
   let globalConfig: any = {};
   try {
      globalConfig = await (prisma as any).systemConfig.findUnique({ where: { id: 'global' } }) || {};
   } catch(e) {}

   const siteName = (isAr ? globalConfig.siteNameAr : globalConfig.siteName) || (isAr ? 'محميات البحر الأحمر' : 'Red Sea Reserves');
   const tabTitle = (isAr ? globalConfig.siteTabTitleAr : globalConfig.siteTabTitle) || (isAr ? 'هيئة محميات البحر الأحمر البحرية' : 'Red Sea Marine Reserves Authority');

   return {
      metadataBase: new URL(baseUrl),
      title: {
         default: tabTitle,
         template: `%s | ${siteName}`
      },
      description: isAr 
         ? 'البوابة الرسمية لهيئة محميات البحر الأحمر لجمهورية مصر العربية - رصد البيئة البحرية والتصاريح والبيانات المفتوحة.'
         : 'Official portal of the Red Sea Marine Reserves Authority of Egypt - Marine monitoring, permit application, and open environmental data.',
      alternates: {
         canonical: `/${params.lang}`,
         languages: {
            'ar': '/ar',
            'en': '/en'
         }
      },
      openGraph: {
         title: tabTitle,
         description: isAr 
            ? 'البوابة الرسمية لهيئة محميات البحر الأحمر لجمهورية مصر العربية - رصد البيئة البحرية والتصاريح والبيانات المفتوحة.'
            : 'Official portal of the Red Sea Marine Reserves Authority of Egypt - Marine monitoring, permit application, and open environmental data.',
         url: `${baseUrl}/${params.lang}`,
         siteName: siteName,
         locale: isAr ? 'ar_EG' : 'en_US',
         type: 'website',
         images: [
            {
               url: '/red_sea_hero_aerial_1774790601114.png',
               width: 1200,
               height: 630,
               alt: isAr ? 'محميات البحر الأحمر' : 'Red Sea Marine Reserves'
            }
         ]
      },
      twitter: {
         card: 'summary_large_image',
         title: tabTitle,
         description: isAr 
            ? 'البوابة الرسمية لهيئة محميات البحر الأحمر لجمهورية مصر العربية - رصد البيئة البحرية والتصاريح والبيانات المفتوحة.'
            : 'Official portal of the Red Sea Marine Reserves Authority of Egypt - Marine monitoring, permit application, and open environmental data.',
         images: ['/red_sea_hero_aerial_1774790601114.png']
      },
      robots: {
         index: true,
         follow: true,
         googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1
         }
      }
   };
}

export async function generateStaticParams() {
  return [{ lang: 'ar' }, { lang: 'en' }];
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  const isArabic = params.lang === 'ar';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://red-sea-authority.eg';

  let globalConfig: any = {};
  try {
     globalConfig = await (prisma as any).systemConfig.findUnique({ where: { id: 'global' } }) || {};
  } catch(e) {}

  const siteName = (isArabic ? globalConfig.siteNameAr : globalConfig.siteName) || (isArabic ? 'محميات البحر الأحمر' : 'Red Sea Reserves');
  const tabTitle = (isArabic ? globalConfig.siteTabTitleAr : globalConfig.siteTabTitle) || (isArabic ? 'هيئة محميات البحر الأحمر البحرية' : 'Red Sea Marine Reserves Authority');

  const jsonLd = {
     '@context': 'https://schema.org',
     '@type': 'GovernmentOrganization',
     'name': tabTitle,
     'alternateName': siteName,
     'url': `${baseUrl}/${params.lang}`,
     'logo': `${baseUrl}/favicon.ico`,
     'contactPoint': {
        '@type': 'ContactPoint',
        'telephone': '+20-65-344-9150',
        'contactType': 'emergency support',
        'areaServed': 'EG',
        'availableLanguage': ['Arabic', 'English']
     }
  };
  
  const inlineThemeScript = `
    (function() {
      try {
        var saved = localStorage.getItem('theme');
        if (saved === 'dark' || (!saved && true)) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {}
    })();
  `;

  return (
    <html lang={params.lang} dir={isArabic ? 'rtl' : 'ltr'}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: inlineThemeScript }} />
      </head>
      <body className={`${inter.variable} ${cairo.variable} ${isArabic ? 'font-arabic' : 'font-english'} antialiased`}>
        <script
           type="application/ld+json"
           dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
