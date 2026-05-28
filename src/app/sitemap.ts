import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
   const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://red-sea-authority.eg';
   const locales = ['ar', 'en'];

   // Static application routes
   const staticRoutes = [
      '',
      '/about',
      '/careers',
      '/contact',
      '/guide',
      '/guide/species',
      '/opendata',
      '/regulations',
      '/reserves',
      '/statistics'
   ];

   const sitemapEntries: MetadataRoute.Sitemap = [];

   // 1. Add static localized pages
   for (const route of staticRoutes) {
      for (const lang of locales) {
         sitemapEntries.push({
            url: `${baseUrl}/${lang}${route}`,
            lastModified: new Date(),
            changeFrequency: route === '' ? 'daily' : 'weekly',
            priority: route === '' ? 1.0 : 0.8
         });
      }
   }

   // 2. Add dynamic visitor guide console sub-sections
   const guideSections = ['permit', 'seasonal', 'etiquette', 'security', 'checklist', 'prohibited'];
   for (const section of guideSections) {
      for (const lang of locales) {
         sitemapEntries.push({
            url: `${baseUrl}/${lang}/guide/${section}`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6
         });
      }
   }

   // 3. Add dynamic database-driven pages (reserves & news)
   try {
      // Fetch reserves dynamically
      const reserves = await prisma.reserveProfile.findMany({
         select: { id: true, updatedAt: true }
      });
      for (const r of reserves) {
         for (const lang of locales) {
            sitemapEntries.push({
               url: `${baseUrl}/${lang}/reserves/${r.id}`,
               lastModified: r.updatedAt ? new Date(r.updatedAt) : new Date(),
               changeFrequency: 'weekly',
               priority: 0.7
            });
         }
      }

      // Fetch published news
      const news = await prisma.newsArticle.findMany({
         where: { status: 'PUBLISHED' },
         select: { date: true, updatedAt: true }
      });
      if (news.length > 0) {
         for (const lang of locales) {
            sitemapEntries.push({
               url: `${baseUrl}/${lang}/news`,
               lastModified: news[0].updatedAt ? new Date(news[0].updatedAt) : new Date(),
               changeFrequency: 'daily',
               priority: 0.8
            });
         }
      }
   } catch (e) {
      console.error('Failed to generate dynamic sitemap entries:', e);
   }

   return sitemapEntries;
}
