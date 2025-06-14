import axios from 'axios';
import { CrawlRequest, CrawlResult, WebsiteContent } from '../types/crawler';

// 解析HTML内容，提取有用信息
const parseHtmlContent = (html: string): WebsiteContent => {
  // 在实际应用中，应使用DOM解析器如cheerio等
  // 这里简单模拟提取内容
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : '未知标题';
  
  // 提取文本内容 (简化处理)
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  text = text.replace(/<[^>]+>/g, ' ');
  text = text.replace(/\s+/g, ' ').trim();
  
  // 提取图片链接
  const imgRegex = /<img[^>]+src="([^">]+)"/g;
  const images: string[] = [];
  let imgMatch;
  while (imgMatch = imgRegex.exec(html)) {
    images.push(imgMatch[1]);
  }
  
  // 提取元数据
  const metadata: Record<string, string> = {};
  const metaRegex = /<meta[^>]+name="([^"]+)"[^>]+content="([^"]+)"/g;
  let metaMatch;
  while (metaMatch = metaRegex.exec(html)) {
    metadata[metaMatch[1]] = metaMatch[2];
  }
  
  return { title, text, images, metadata };
};

// 提取页面中的所有链接
const extractLinks = (html: string, baseUrl: string): string[] => {
  const links: string[] = [];
  const linkRegex = /<a[^>]+href="([^"]+)"/g;
  let match;
  
  while (match = linkRegex.exec(html)) {
    try {
      // 处理相对路径
      const url = new URL(match[1], baseUrl).href;
      // 仅保留HTTP/HTTPS链接
      if (url.startsWith('http')) {
        links.push(url);
      }
    } catch (e) {
      // 忽略无效URL
    }
  }
  
  return links;
};

// 模拟爬虫服务，实际环境中应当使用服务端代理解决跨域问题
export const crawlWebsite = async (request: CrawlRequest): Promise<CrawlResult> => {
  try {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 假设这是从目标网站获取的HTML内容
    const mockHtml = `
      <html>
        <head>
          <title>${request.url} - 网站标题</title>
          <meta name="description" content="这是一个示例网站描述">
        </head>
        <body>
          <h1>网站内容示例</h1>
          <p>这是从 ${request.url} 爬取的示例内容。在实际应用中，需要后端服务支持。</p>
          <img src="${request.url}/image1.jpg" alt="示例图片1">
          <img src="${request.url}/image2.jpg" alt="示例图片2">
          <div class="navigation">
            <a href="${request.url}/page1">页面1</a>
            <a href="${request.url}/page2">页面2</a>
            <a href="${request.url}/about">关于我们</a>
            <a href="https://example.com">外部链接</a>
          </div>
        </body>
      </html>
    `;
    
    // 提取链接
    const links = extractLinks(mockHtml, request.url);
    
    // 解析内容
    let parsedContent: WebsiteContent | undefined;
    if (request.extractContent) {
      parsedContent = parseHtmlContent(mockHtml);
    }
    
    // 爬取子页面（如果是导航站且需要跟踪导航）
    let childResults: CrawlResult[] | undefined;
    if (request.followNavigation && request.depth > 1 && links.length > 0) {
      // 只选择前3个链接进行递归爬取，避免过多模拟数据
      const childLinks = links.slice(0, 3);
      
      // 递归爬取（降低深度）
      childResults = await Promise.all(
        childLinks.map(async (link) => {
          const childRequest: CrawlRequest = {
            ...request,
            url: link,
            depth: request.depth - 1
          };
          
          // 模拟延迟，避免同时请求太多
          await new Promise(resolve => setTimeout(resolve, 500));
          
          return await crawlWebsite(childRequest);
        })
      );
    }
    
    return {
      url: request.url,
      content: mockHtml,
      parsedContent,
      links,
      childResults,
      status: 200,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('爬取失败:', error);
    throw new Error('爬取网站内容失败');
  }
};

// 导出爬取结果
export const exportToJson = (data: CrawlResult): string => {
  return JSON.stringify(data, null, 2);
};

// 从URL中提取域名
export const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    return url;
  }
};

// 验证URL是否合法
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};
