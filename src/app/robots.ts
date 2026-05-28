import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
   const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://red-sea-authority.eg';
   return {
      rules: {
         userAgent: '*',
         allow: '/',
         disallow: [
            '/*/staff/',
            '/*/staff/*',
            '/api/',
            '/api/*'
         ]
      },
      sitemap: `${baseUrl}/sitemap.xml`
   };
}
