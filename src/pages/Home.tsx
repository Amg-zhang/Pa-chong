import React, { useState, useEffect } from 'react';
import CrawlForm from '@/components/CrawlForm';
import CrawlResults from '@/components/CrawlResults';
import CrawlHistory from '@/components/CrawlHistory';
import { CrawlRequest, CrawlResult, CrawlHistory as CrawlHistoryType } from '@/types/crawler';
import { crawlWebsite } from '@/services/crawler';
import { v4 as uuidv4 } from '@/utils/uuid';

const Home: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<CrawlResult | null>(null);
  const [history, setHistory] = useState<CrawlHistoryType[]>([]);

  // 统计爬取的总页面数
  const countTotalPages = (result: CrawlResult): number => {
    let count = 1; // 当前页面计为1
    if (result.childResults && result.childResults.length > 0) {
      result.childResults.forEach(child => {
        count += countTotalPages(child);
      });
    }
    return count;
  };

  // 处理爬取请求
  const handleStartCrawl = async (
    url: string, 
    depth: number, 
    maxPages: number,
    extractContent: boolean,
    followNavigation: boolean
  ) => {
    setIsLoading(true);
    const requestId = uuidv4();
    
    // 添加到历史记录
    const historyItem: CrawlHistoryType = {
      id: requestId,
      url,
      timestamp: new Date(),
      resultsCount: 0,
      pagesCount: 0,
      status: 'in-progress'
    };
    
    setHistory(prev => [historyItem, ...prev]);
    
    try {
      const request: CrawlRequest = { 
        url, 
        depth, 
        maxPages,
        extractContent,
        followNavigation
      };
      
      const result = await crawlWebsite(request);
      setCurrentResult(result);
      
      // 计算总页面数
      const totalPages = countTotalPages(result);
      
      // 更新历史记录状态
      setHistory(prev => 
        prev.map(item => 
          item.id === requestId 
            ? { 
                ...item, 
                status: 'completed',
                resultsCount: result.links.length,
                pagesCount: totalPages
              } 
            : item
        )
      );
      
    } catch (error) {
      console.error('爬取失败:', error);
      
      // 更新历史记录状态为失败
      setHistory(prev => 
        prev.map(item => 
          item.id === requestId 
            ? { ...item, status: 'failed' } 
            : item
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 查看历史记录
  const handleSelectHistory = (id: string) => {
    // 这里模拟从历史记录中获取结果
    // 实际应用中可能需要从存储中重新获取数据
    const historyItem = history.find(item => item.id === id);
    
    if (historyItem && historyItem.status === 'completed') {
      // 模拟历史记录的爬取结果
      const mockResult: CrawlResult = {
        url: historyItem.url,
        content: `<html><body><h1>历史记录内容</h1><p>这是从 ${historyItem.url} 的历史爬取结果。</p></body></html>`,
        links: Array(historyItem.resultsCount).fill(0).map((_, i) => `${historyItem.url}/page${i+1}`),
        parsedContent: {
          title: `${historyItem.url} - 历史记录`,
          text: `这是从 ${historyItem.url} 爬取的历史内容。包含 ${historyItem.resultsCount} 个链接和 ${historyItem.pagesCount} 个页面。`,
          images: [`${historyItem.url}/image1.jpg`, `${historyItem.url}/image2.jpg`],
          metadata: { description: '历史爬取记录' }
        },
        status: 200,
        timestamp: historyItem.timestamp
      };
      
      // 如果有多个页面，添加子结果
      if (historyItem.pagesCount > 1) {
        mockResult.childResults = Array(Math.min(3, historyItem.pagesCount - 1))
          .fill(0)
          .map((_, i) => ({
            url: `${historyItem.url}/subpage${i+1}`,
            content: `<html><body><h1>子页面 ${i+1}</h1><p>这是子页面内容</p></body></html>`,
            links: [`${historyItem.url}/subpage${i+1}/detail1`, `${historyItem.url}/subpage${i+1}/detail2`],
            parsedContent: {
              title: `子页面 ${i+1}`,
              text: `这是子页面 ${i+1} 的内容`,
              images: [`${historyItem.url}/subpage${i+1}/image1.jpg`],
              metadata: {}
            },
            status: 200,
            timestamp: historyItem.timestamp
          }));
      }
      
      setCurrentResult(mockResult);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <header className="border-b">
        <div className="container mx-auto py-6 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M14 7h2a6 6 0 0 1 0 12h-2"/>
                <path d="M10 7H8a6 6 0 0 0 0 12h2"/>
                <line x1="8" y1="13" x2="16" y2="13"/>
              </svg>
              <h1 className="text-xl font-bold">网络爬虫</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              v2.0.0
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <CrawlForm 
              onStartCrawl={handleStartCrawl}
              isLoading={isLoading}
            />
            
            <CrawlHistory 
              history={history}
              onSelectHistory={handleSelectHistory}
            />
          </div>
          
          <div className="md:col-span-2">
            <CrawlResults 
              results={currentResult}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
      
      <footer className="border-t mt-8">
        <div className="container mx-auto py-6 px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>⚠️ 注意：本工具仅用于学习和研究目的。请遵守相关网站的使用条款和robots.txt规则。</p>
            <p className="mt-2">© {new Date().getFullYear()} 网络爬虫工具 | 保留所有权利</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
