import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';

export const revalidate = 0; // Dynamic route

const CONFIG_PATH = path.join(process.cwd(), 'data', 'radar_config.json');

const DEFAULT_CONFIG = {
  locationKeywords: ['البحر الأحمر', 'الغردقة', 'مرسى علم', 'سفاجا', 'القصير', 'شلاتين', 'رأس غارب', 'حلايب'],
  environmentKeywords: ['بيئة', 'تلوث', 'صيد', 'شعاب', 'سلاحف', 'قرش', 'دلافين', 'مخلفات', 'كائنات بحرية', 'محمية', 'محميات'],
  negativeKeywords: ['حوثي', 'إسرائيل', 'حرب', 'مرور', 'تموين', 'بناء', 'إزالات', 'أسوان', 'إسكندرية', 'الاسكندرية', 'موانئ', 'بضائع', 'حوادث سير', 'عقارات', 'تأجيل', 'محاكم']
};

async function getRadarConfig() {
  try {
    const data = await fs.readFile(CONFIG_PATH, 'utf-8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
  } catch (e) {
    // If file doesn't exist, create directory and return default
    try {
      await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
    } catch (err) {}
    return DEFAULT_CONFIG;
  }
}

export async function GET(request: Request) {
  try {
    const config = await getRadarConfig();
    
    const parser = new Parser({
      customFields: {
        item: ['source']
      }
    });

    // We fetch a slightly broader base query, but focus on the region or generic reserves
    const query = encodeURIComponent('("البحر الأحمر" OR الغردقة OR "مرسى علم" OR محميات OR بيئة) when:7d');
    const url = `https://news.google.com/rss/search?q=${query}&hl=ar&gl=EG&ceid=EG:ar`;

    const feed = await parser.parseURL(url);

    const rawArticles = feed.items.map(item => {
      let title = item.title || '';
      let sourceName = item.source || '';
      
      if (!sourceName && title.includes(' - ')) {
        const parts = title.split(' - ');
        sourceName = parts.pop() || '';
        title = parts.join(' - ');
      }

      let imageUrl = null;
      if (item.contentSnippet && item.contentSnippet.match(/<img[^>]+src="([^">]+)"/)) {
        const match = item.contentSnippet.match(/<img[^>]+src="([^">]+)"/);
        if (match) imageUrl = match[1];
      }

      return {
        id: item.guid || item.link,
        title: title.trim(),
        link: item.link,
        pubDate: item.pubDate,
        source: sourceName.trim(),
        contentSnippet: item.contentSnippet || '',
        imageUrl: imageUrl,
      };
    });

    // --- SMART SCORING ALGORITHM ---
    const filteredArticles = rawArticles.map(article => {
      let score = 0;
      let matchedLocation = false;
      let matchedEnv = false;
      let isExcluded = false;

      const titleText = article.title.toLowerCase();

      // 1. Check Negative Keywords
      for (const word of config.negativeKeywords) {
        if (titleText.includes(word.toLowerCase())) {
          isExcluded = true;
          break;
        }
      }

      if (!isExcluded) {
        // 2. Score Location Keywords
        for (const word of config.locationKeywords) {
          if (titleText.includes(word.toLowerCase())) {
            score += 10;
            matchedLocation = true;
          }
        }

        // 3. Score Environment Keywords
        for (const word of config.environmentKeywords) {
          if (titleText.includes(word.toLowerCase())) {
            score += 15;
            matchedEnv = true;
          }
        }
        
        // Exact heavy match
        if (titleText.includes('محميات البحر الأحمر')) score += 30;
        if (titleText.includes('وزارة البيئة')) score += 5;
      }

      return {
        ...article,
        score,
        relevance: isExcluded ? 0 : score,
        isExcluded,
        matchedLocation,
        matchedEnv
      };
    }).filter(a => {
       // Only keep articles that are not excluded AND have a minimum score 
       // Minimum score = must have either location AND environment, or be a highly specific environment match
       return !a.isExcluded && a.score >= 15; 
    });

    // Sort by Score first, then Date
    filteredArticles.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime();
    });

    return NextResponse.json({ success: true, articles: filteredArticles, config });
  } catch (error: any) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Update the configuration
export async function POST(request: Request) {
  try {
    const newConfig = await request.json();
    await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
    await fs.writeFile(CONFIG_PATH, JSON.stringify(newConfig, null, 2), 'utf-8');
    return NextResponse.json({ success: true, config: newConfig });
  } catch (error: any) {
    console.error('Error saving config:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
