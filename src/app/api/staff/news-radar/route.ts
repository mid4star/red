import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';

export const revalidate = 0; // Dynamic route

const CONFIG_PATH = path.join(process.cwd(), 'data', 'radar_config.json');

const DEFAULT_CONFIG = {
  locationKeywords: ['البحر الأحمر', 'الغردقة', 'مرسى علم', 'سفاجا', 'القصير', 'شلاتين', 'رأس غارب', 'حلايب'],
  environmentKeywords: ['بيئة', 'تلوث', 'صيد', 'شعاب', 'سلاحف', 'قرش', 'دلافين', 'مخلفات', 'كائنات بحرية', 'محمية', 'محميات'],
  negativeKeywords: ['حوثي', 'إسرائيل', 'حرب', 'مرور', 'تموين', 'بناء', 'إزالات', 'أسوان', 'إسكندرية', 'الاسكندرية', 'موانئ', 'بضائع', 'حوادث سير', 'عقارات', 'تأجيل', 'محاكم'],
  urgencyKeywords: ['عاجل', 'غرق', 'تسرب نفطي', 'حريق', 'كارثة', 'إنقاذ', 'وفاة', 'هجوم', 'تدمير', 'نفوق', 'أزمة']
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
      let isUrgent = false;
      let isExcluded = false;
      let categories: string[] = [];

      const titleText = article.title.toLowerCase();

      // Helper function to match Arabic words properly with boundaries
      const hasMatch = (text: string, keywords: string[]) => {
        return keywords.some(keyword => {
          const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`(^|\\s|[.,!؟-])(?:${escaped})(?=\\s|$|[.,!؟-])`, 'i');
          return regex.test(text);
        });
      };
      
      const getMatches = (text: string, keywords: string[]) => {
        return keywords.filter(keyword => {
          const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`(^|\\s|[.,!؟-])(?:${escaped})(?=\\s|$|[.,!؟-])`, 'i');
          return regex.test(text);
        });
      };

      // 1. Check Negative Keywords & Sources
      const SYSTEM_EXCLUSIONS = [
        'بيئة عمل', 'بيئة أعمال', 'بيئة اعمال', 'بيئة تنافسية', 'بيئة استثمار', 'بيئة استثمارية',
        'ميتا', 'ميتافيرس', 'فيسبوك', 'تيك توك', 'تكنولوجيا', 'هاتف', 'ذكاء اصطناعي',
        'بورصة', 'أسهم', 'سوق المال'
      ];
      const EXCLUDED_SOURCES = ['fintech', 'جريدة المال', 'اقتصاد', 'بنوك', 'بنك', 'مال وأعمال'];

      const isExcludedSource = EXCLUDED_SOURCES.some(s => article.source.toLowerCase().includes(s));

      if (
        isExcludedSource ||
        (config.negativeKeywords && hasMatch(titleText, config.negativeKeywords)) ||
        hasMatch(titleText, SYSTEM_EXCLUSIONS)
      ) {
        isExcluded = true;
      }

      if (!isExcluded) {
        // 2. Score Location Keywords
        const locMatches = getMatches(titleText, config.locationKeywords || []);
        if (locMatches.length > 0) {
          score += 10 + (locMatches.length * 2); // +10 base, +2 per matched word
          matchedLocation = true;
        }

        // 3. Score Environment Keywords
        const envMatches = getMatches(titleText, config.environmentKeywords || []);
        if (envMatches.length > 0) {
          score += 15 + (envMatches.length * 3);
          matchedEnv = true;
          
          // Categorization based on env keywords
          const pollutionWords = ['تلوث', 'مخلفات', 'تسرب', 'بلاستيك', 'صرف', 'نفوق', 'تدمير'];
          const wildlifeWords = ['سلاحف', 'قرش', 'دلافين', 'كائنات بحرية', 'أسماك', 'صيد', 'شعاب'];
          
          if (envMatches.some(w => pollutionWords.includes(w))) categories.push('تلوث بيئي');
          if (envMatches.some(w => wildlifeWords.includes(w))) categories.push('تنوع بيولوجي');
          if (envMatches.some(w => ['محمية', 'محميات', 'بيئة'].includes(w))) categories.push('شؤون بيئية');
        }
        
        // 4. Urgency Scoring
        if (config.urgencyKeywords && hasMatch(titleText, config.urgencyKeywords)) {
          isUrgent = true;
          score += 40; // Massive boost for urgency
        }

        // Exact heavy match
        if (titleText.includes('محميات البحر الأحمر')) score += 30;
        if (titleText.includes('وزارة البيئة')) {
          score += 10;
          categories.push('جهات رسمية');
        }
        
        // 5. Time Decay Bonus (within last 24h)
        const ageHours = (new Date().getTime() - new Date(article.pubDate || 0).getTime()) / (1000 * 60 * 60);
        if (ageHours < 24) {
          score += 10; // Bonus for very recent news
        } else if (ageHours < 48) {
          score += 5;
        }
        
        // Remove duplicate categories
        categories = [...new Set(categories)];
      }

      return {
        ...article,
        score,
        relevance: isExcluded ? 0 : score,
        isExcluded,
        isUrgent,
        matchedLocation,
        matchedEnv,
        categories
      };
    }).filter(a => {
       // Only keep articles that are not excluded AND have an environment connection
       // OR if it's an urgent emergency happening within our locations
       const hasEnvironmentOrEmergency = a.matchedEnv || (a.isUrgent && a.matchedLocation) || a.title.includes('محميات');
       return !a.isExcluded && hasEnvironmentOrEmergency; 
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
