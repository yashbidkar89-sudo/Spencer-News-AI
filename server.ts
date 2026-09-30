/**
 * Chris News AI — Financial News Simplifier
 * Full-Stack Express & Vite Server Entry Point
 */
import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

app.use(express.json({ limit: '2mb' }));

// Configuration
const NEWS_API_KEY = (process.env.NEWS_API_KEY || '').trim();
const GROQ_API_KEY = (process.env.GROQ_API_KEY || '').trim();
const GROQ_MODEL = (process.env.GROQ_MODEL || 'llama-3.3-70b-versatile').trim();

const isNewsConfigured = Boolean(
  NEWS_API_KEY && NEWS_API_KEY !== 'your_newsapi_key_here' && NEWS_API_KEY !== 'MY_NEWS_API_KEY'
);

const isGroqConfigured = Boolean(
  GROQ_API_KEY && GROQ_API_KEY !== 'your_groq_api_key_here' && GROQ_API_KEY !== 'MY_GROQ_API_KEY'
);

// High-fidelity fallback sample articles for educational review & immediate testing
const SAMPLE_ARTICLES = [
  {
    id: 'art-1',
    title: 'Federal Reserve Holds Benchmark Interest Rates Steady Amid Mixed Inflation Indicators',
    description: 'The Federal Open Market Committee concluded its policy meeting by voting unanimously to maintain the federal funds rate target range at 5.25%-5.50%.',
    content: 'Federal Reserve officials voted unanimously Wednesday to keep interest rates unchanged, reaffirming their measured approach to monetary policy. Chair Jerome Powell noted that while headline inflation has moderated significantly, core inflation components—particularly shelter and services—remain somewhat elevated. Bond yields fluctuated following the announcement, with the 10-year Treasury yield easing by four basis points to 4.28%. Powell reiterated that the committee requires greater confidence before initiating rate reductions.',
    source: 'Bloomberg Markets',
    author: 'Sarah Jenkins',
    url: 'https://www.bloomberg.com/markets',
    published_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    category: 'Federal Reserve & Rates',
    reading_time: '2 min read'
  },
  {
    id: 'art-2',
    title: 'Tech Giants Expand Capital Expenditures for AI Infrastructure as Cloud Revenue Surges',
    description: 'Leading cloud hyperscalers announced increased capital expenditure forecasts for high-performance computing clusters and data centers.',
    content: 'Major enterprise technology corporations reported double-digit growth in cloud infrastructure revenue, driven by robust enterprise demand for generative AI training and inference workloads. Combined capital expenditures across the four largest hyperscalers are projected to exceed $180 billion this fiscal year. Semiconductor suppliers experienced renewed buying interest, lifting the Philadelphia Semiconductor Index by 2.4%. Market analysts noted that while high capital spending compresses near-term free cash flow margins, long-term competitive moats remain paramount.',
    source: 'Financial Times',
    author: 'Marcus Sterling',
    url: 'https://www.ft.com/technology',
    published_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    category: 'Tech & Capex',
    reading_time: '3 min read'
  },
  {
    id: 'art-3',
    title: 'Consumer Price Index Cools to 2.8% Annualized Rate, Bolstering Market Sentiment',
    description: 'The Bureau of Labor Statistics reported a softer-than-expected headline CPI increase of 0.2% month-over-month, bringing annual inflation down to 2.8%.',
    content: 'Consumer prices rose at their slowest annualized pace in over three years last month, according to government data released Thursday. The headline Consumer Price Index increased 2.8% year-over-year, coming in below consensus forecasts of 3.0%. Lower retail gasoline prices and stabilizing used vehicle valuations helped offset persistent shelter costs. Equities rallied across Wall Street, with the S&P 500 adding 42 points. Economists highlighted that the supercore measure also showed noticeable deceleration.',
    source: 'Wall Street Journal',
    author: 'Elena Rostova',
    url: 'https://www.wsj.com/economy',
    published_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    category: 'Inflation & Economy',
    reading_time: '2 min read'
  },
  {
    id: 'art-4',
    title: 'Treasury Yield Curve Steepens as Long-Term Debt Issuance Draws Solid Institutional Bid',
    description: 'The benchmark 10-year US Treasury yield moved higher relative to 2-year notes, producing an un-inversion of the yield curve.',
    content: 'The spread between two-year and ten-year Treasury yields widened to positive eight basis points Thursday, marking a sustained departure from the protracted yield curve inversion that began in 2022. The 30-year Treasury bond auction was met with strong primary dealer demand and high indirect bidder participation from foreign central banks. Bond portfolio managers cited changing expectations around quantitative tightening (QT) tapering and sovereign debt issuance volumes as primary drivers.',
    source: 'Reuters Financial',
    author: 'David Chen',
    url: 'https://www.reuters.com/markets/bonds',
    published_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    category: 'Stocks & Equities',
    reading_time: '2 min read'
  },
  {
    id: 'art-5',
    title: 'Global Central Banks Increase Gold Reserves Amid Currency Diversification Strategies',
    description: 'Sovereign reserve managers acquired a record 290 metric tons of bullion in the latest quarter, pushing spot gold prices to fresh highs.',
    content: 'Official reserve allocations to physical gold accelerated throughout developing economies during the past quarter, according to data published by the World Gold Council. Emerging market central banks accounted for over 70% of total sovereign net purchases, seeking to diversify foreign exchange holdings away from single-currency concentrations. Spot gold traded higher alongside silver and platinum. Commodity strategists emphasized that persistent geopolitical fragmentation and sovereign debt expansion continue to support hard asset allocations.',
    source: 'MarketWatch',
    author: 'Claire Vance',
    url: 'https://www.marketwatch.com/investing',
    published_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    category: 'Inflation & Economy',
    reading_time: '3 min read'
  }
];

const GLOSSARY: Record<string, string> = {
  'basis points': 'A unit of measure equal to 1/100th of 1% (0.01%), used for interest rates and bond yields.',
  'benchmark': 'A standard or index (like the S&P 500 or 10-Year Treasury) against which performance is measured.',
  'federal funds rate': 'The core interest rate that commercial banks charge each other for overnight loans.',
  'treasury yield': 'The annualized interest return paid to investors holding US government debt obligations.',
  'yield curve': 'A graph comparing yields on bonds of similar credit quality across different maturity dates.',
  'cpi': 'Consumer Price Index: A primary metric that tracks average price changes in goods and services bought by households.',
  'inflation': 'The ongoing decrease in the purchasing power of money, reflected as a general increase in prices.',
  'capital expenditures': 'Funds a company invests to acquire, upgrade, and maintain physical assets like servers and factories.',
  'capex': 'Abbreviation for capital expenditures: money spent by companies on long-term physical assets.',
  'quantitative tightening': 'A policy where the central bank reduces its balance sheet by letting bonds mature without reinvestment.',
  'hyperscalers': 'Massive enterprise tech cloud operators (such as Microsoft, Google, AWS) capable of large-scale computing.',
  'bullish': 'An optimistic market outlook anticipating rising asset prices.',
  'bearish': 'A cautious or pessimistic market outlook anticipating declining asset prices.',
  'supercore': 'An inflation measure that strips out volatile food, energy, and housing to isolate underlying service price trends.',
  'free cash flow': 'The cash a business produces after accounting for operational expenses and capital investments.'
};

function ruleBasedSimplify(title: string, content: string) {
  const fullText = `${title} ${content}`.toLowerCase();
  const detectedTerms: Array<{ term: string; explanation: string }> = [];

  for (const [term, exp] of Object.entries(GLOSSARY)) {
    if (fullText.includes(term)) {
      detectedTerms.push({
        term: term.charAt(0).toUpperCase() + term.slice(1),
        explanation: exp
      });
    }
  }

  if (detectedTerms.length === 0) {
    detectedTerms.push({
      term: 'Market Liquidity',
      explanation: 'How quickly an asset can be converted into cash without a steep price drop.'
    });
    detectedTerms.push({
      term: 'Macroeconomics',
      explanation: 'The branch of economics concerned with large-scale factors such as interest rates and national productivity.'
    });
  }

  let sentiment = 'Neutral';
  if (['rally', 'surges', 'cools', 'record', 'boost', 'gains'].some(w => fullText.includes(w))) {
    sentiment = 'Bullish';
  } else if (['plunges', 'drops', 'inflation rises', 'turmoil', 'recession'].some(w => fullText.includes(w))) {
    sentiment = 'Bearish';
  }

  const sentences = content.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 20);
  const leadSentence = sentences[0] || title;
  const secondSentence = sentences[1] || 'Market observers are tracking downstream impacts on economic activity.';

  return {
    simple_summary: `In plain terms: ${title}. ${leadSentence}`,
    what_happened: `${leadSentence} ${secondSentence}`,
    why_it_matters: 'Adjustments in interest rates, corporate capital budgets, and inflation indicators directly affect personal mortgage rates, consumer borrowing costs, and employment.',
    key_points: [
      `Key Headline: ${title.slice(0, 95)}...`,
      `Factual Event: ${leadSentence.slice(0, 110)}...`,
      'Macro impact: Analysts and portfolio managers are adjusting asset allocations accordingly.'
    ],
    financial_terms: detectedTerms.slice(0, 4),
    sentiment,
    disclaimer: 'Educational simplification only. SpencerNews AI does not provide financial or investment advice.'
  };
}

async function callGroqAI(title: string, content: string, source: string) {
  if (!isGroqConfigured) {
    return ruleBasedSimplify(title, content);
  }

  try {
    const groq = new Groq({ apiKey: GROQ_API_KEY });
    const systemPrompt = `You are SpencerNews AI, an expert financial news simplifier designed to transform complex financial and economic articles into concise, jargon-free explanations for ordinary citizens and students.

RULES & CONSTRAINTS:
1. Grounding: Rely EXCLUSIVELY on the provided article text. Do not invent facts, numbers, or companies not present in the article.
2. Tone & Audience: Write in clear, accessible language suitable for someone without a finance background.
3. Fact Preservation: Keep all critical numbers (percentages, basis points, dollar figures, dates, and ticker symbols) exact and accurate.
4. Jargon Explanations: Identify 2-4 specialized financial or economic terms and define each in one simple sentence.
5. Compliance: NEVER provide investment advice, buy/sell recommendations, or price targets.
6. Return valid JSON strictly matching this schema:
{
  "simple_summary": "2-3 sentences plain English summary",
  "what_happened": "Paragraph detailing concrete facts and figures",
  "why_it_matters": "Paragraph explaining real-world relevance for consumers or businesses",
  "key_points": ["bullet 1", "bullet 2", "bullet 3"],
  "financial_terms": [{"term": "Term", "explanation": "Simple explanation"}],
  "sentiment": "Bullish" | "Bearish" | "Neutral",
  "disclaimer": "Educational simplification only. SpencerNews AI does not provide investment advice."
}`;

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `TITLE: ${title}\nSOURCE: ${source}\nCONTENT: ${content}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 1200
    });

    const text = completion.choices[0]?.message?.content || '{}';
    return JSON.parse(text);
  } catch (err) {
    console.warn('Groq API call notice, falling back to educational engine:', err);
    return ruleBasedSimplify(title, content);
  }
}

// REST API Endpoints
app.get(['/health', '/api/health'], (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    app_name: 'SpencerNews AI — Complex Finance. Simplified.',
    version: '1.0.0',
    newsapi_configured: isNewsConfigured,
    groq_configured: isGroqConfigured,
    groq_model: GROQ_MODEL,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    app_name: 'SpencerNews AI — Complex Finance. Simplified.',
    version: '1.0.0',
    newsapi_configured: isNewsConfigured,
    groq_configured: isGroqConfigured,
    groq_model: GROQ_MODEL,
    node_env: process.env.NODE_ENV || 'development'
  });
});

app.get(['/api/news', '/api/fetch-and-simplify'], async (req: Request, res: Response) => {
  const category = (req.query.category as string) || '';
  const query = (req.query.q as string) || '';
  const limit = Math.min(Math.max(parseInt(req.query.limit as string || '6', 10), 1), 12);

  let rawArticles = [...SAMPLE_ARTICLES];

  // Try live NewsAPI if configured
  let sourceProvider = 'Curated Financial Wire';
  let bannerMessage: string | null = null;

  if (isNewsConfigured) {
    try {
      const qParam = query
        ? `everything?q=${encodeURIComponent(query)}+AND+(finance+OR+stocks+OR+economy)`
        : `top-headlines?category=business&country=us`;
      const newsUrl = `https://newsapi.org/v2/${qParam}&pageSize=${limit * 2}`;
      
      const newsResp = await fetch(newsUrl, {
        headers: {
          'X-Api-Key': NEWS_API_KEY,
          'User-Agent': 'ChrisNewsAI/1.0'
        }
      });

      if (newsResp.ok) {
        const newsData = await newsResp.json();
        if (newsData.status === 'ok' && Array.isArray(newsData.articles)) {
          const valid = newsData.articles
            .filter((a: any) => a.title && !a.title.includes('[Removed]') && (a.content || a.description))
            .slice(0, limit)
            .map((a: any, idx: number) => ({
              id: `live-${idx}-${Date.now()}`,
              title: a.title.trim(),
              description: a.description || '',
              content: a.content || a.description || a.title,
              source: a.source?.name || 'Financial Wire',
              author: a.author || a.source?.name || 'Financial Analyst',
              url: a.url || '',
              published_at: a.publishedAt || new Date().toISOString(),
              category: 'Live Markets',
              reading_time: '2 min read'
            }));

          if (valid.length > 0) {
            rawArticles = valid;
            sourceProvider = 'NewsAPI (Live)';
          }
        }
      } else {
        bannerMessage = `NewsAPI returned status ${newsResp.status}. Showing curated educational news.`;
      }
    } catch (err: any) {
      bannerMessage = `NewsAPI connection notice (${err.message}). Showing curated educational news.`;
    }
  } else {
    bannerMessage = 'Displaying curated financial news. Configure NEWS_API_KEY in .env for live feeds.';
  }

  // Filter local articles if using sample data
  if (sourceProvider !== 'NewsAPI (Live)') {
    if (category && category.toLowerCase() !== 'all' && category.toLowerCase() !== 'all markets') {
      rawArticles = rawArticles.filter(a => a.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (query) {
      const qLower = query.toLowerCase();
      rawArticles = rawArticles.filter(a => 
        a.title.toLowerCase().includes(qLower) || a.content.toLowerCase().includes(qLower)
      );
    }
    if (rawArticles.length === 0) {
      rawArticles = [...SAMPLE_ARTICLES];
    }
  }

  const selected = rawArticles.slice(0, limit);

  // Simplify all selected articles
  const simplifiedArticles = await Promise.all(
    selected.map(async (art) => {
      const simplified = await callGroqAI(art.title, art.content, art.source);
      return {
        id: art.id,
        title: art.title,
        source: art.source,
        author: art.author,
        url: art.url,
        published_at: art.published_at,
        category: art.category,
        reading_time: art.reading_time || '2 min read',
        simple_summary: simplified.simple_summary || art.title,
        what_happened: simplified.what_happened || art.content,
        why_it_matters: simplified.why_it_matters || 'Relevant for everyday personal finances and market trends.',
        key_points: simplified.key_points || ['Critical headline event recorded'],
        financial_terms: simplified.financial_terms || [],
        sentiment: simplified.sentiment || 'Neutral',
        disclaimer: 'Educational simplification only. Chris News AI does not provide investment advice.'
      };
    })
  );

  res.json({
    status: 'success',
    total_results: simplifiedArticles.length,
    articles: simplifiedArticles,
    source_provider: sourceProvider,
    message: bannerMessage
  });
});

app.post('/api/simplify', async (req: Request, res: Response) => {
  const { title, content, source, category, url } = req.body;

  if (!title && !content) {
    res.status(400).json({ error: 'Article title or content is required.' });
    return;
  }

  const cleanTitle = (title || 'Financial Article').trim();
  const cleanContent = (content || cleanTitle).trim();
  const cleanSource = (source || 'Custom Analysis').trim();

  try {
    const simplified = await callGroqAI(cleanTitle, cleanContent, cleanSource);

    res.json({
      id: `custom-${Date.now()}`,
      title: cleanTitle,
      source: cleanSource,
      author: 'Custom Ingestion',
      url: url || '',
      published_at: new Date().toISOString(),
      category: category || 'Custom Analysis',
      reading_time: '2 min read',
      simple_summary: simplified.simple_summary,
      what_happened: simplified.what_happened,
      why_it_matters: simplified.why_it_matters,
      key_points: simplified.key_points,
      financial_terms: simplified.financial_terms,
      sentiment: simplified.sentiment || 'Neutral',
      disclaimer: 'Educational simplification only. Chris News AI does not provide investment advice.'
    });
  } catch (err: any) {
    res.status(500).json({ error: `Simplification failed: ${err.message}` });
  }
});

// Vite Middleware for Development / Static for Production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, HOST, () => {
    console.log(`Chris News AI Server listening on http://${HOST}:${PORT}`);
  });
}

startServer();
