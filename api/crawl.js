const axios = require('axios');
const cheerio = require('cheerio');

export default async function handler(req, res) {
  // 允许跨域请求
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { url, depth, maxPages, extractContent, followNavigation } = req.body;
      
      // 获取网页内容
      const response = await axios.get(url);
      const html = response.data;
      
      // 解析内容
      const $ = cheerio.load(html);
      const title = $('title').text();
      const links = [];
      
      $('a').each((i, link) => {
        const href = $(link).attr('href');
        if (href && !href.startsWith('#')) {
          try {
            // 处理相对路径
            const fullUrl = new URL(href, url).href;
            links.push(fullUrl);
          } catch (e) {
            // 忽略无效URL
          }
        }
      });
      
      // 提取内容
      let parsedContent = null;
      if (extractContent) {
        parsedContent = {
          title,
          text: $('body').text().replace(/\s+/g, ' ').trim(),
          images: $('img').map((i, img) => $(img).attr('src')).get(),
          metadata: {}
        };
        
        // 提取meta标签
        $('meta').each((i, meta) => {
          const name = $(meta).attr('name');
          const content = $(meta).attr('content');
          if (name && content) {
            parsedContent.metadata[name] = content;
          }
        });
      }
      
      // 处理子页面爬取
      let childResults = [];
      if (followNavigation && depth > 1 && links.length > 0) {
        // 只爬取前2个链接避免超时
        const childLinks = links.slice(0, 2);
        
        // 简单爬取子页面
        for (const link of childLinks) {
          try {
            const childResponse = await axios.get(link);
            const childHtml = childResponse.data;
            const child$ = cheerio.load(childHtml);
            
            childResults.push({
              url: link,
              content: childHtml.substring(0, 1000) + '...',
              parsedContent: extractContent ? {
                title: child$('title').text(),
                text: child$('body').text().replace(/\s+/g, ' ').trim().substring(0, 500) + '...',
                images: child$('img').map((i, img) => child$(img).attr('src')).get().slice(0, 3),
                metadata: {}
              } : undefined,
              links: [],
              status: 200,
              timestamp: new Date()
            });
          } catch (err) {
            childResults.push({
              url: link,
              content: `<html><body>爬取失败</body></html>`,
              links: [],
              status: 500,
              timestamp: new Date()
            });
          }
        }
      }
      
      res.status(200).json({
        url,
        content: html.substring(0, 5000) + '...',  // 截断内容避免响应过大
        parsedContent,
        links,
        childResults,
        status: 200,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('爬取失败:', error);
      res.status(500).json({ error: '爬取失败', message: error.message });
    }
  } else {
    res.status(405).json({ error: '方法不允许' });
  }
}
