export interface CrawlRequest {
  url: string;
  depth: number;
  maxPages: number;
  extractContent: boolean; // 是否提取内容
  followNavigation: boolean; // 是否跟随导航链接
}

export interface WebsiteContent {
  title: string;
  text: string;
  images: string[];
  metadata: Record<string, string>;
}

export interface CrawlResult {
  url: string;
  content: string; // 原始HTML
  parsedContent?: WebsiteContent; // 解析后的内容
  links: string[];
  childResults?: CrawlResult[]; // 子页面爬取结果（用于导航站）
  status: number;
  timestamp: Date;
}

export interface CrawlHistory {
  id: string;
  url: string;
  timestamp: Date;
  resultsCount: number;
  pagesCount: number; // 爬取的总页面数
  status: 'completed' | 'failed' | 'in-progress';
}
