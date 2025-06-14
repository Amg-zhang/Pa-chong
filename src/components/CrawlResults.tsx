import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { CrawlResult } from '@/types/crawler';
import { Download, ExternalLink, ChevronDown, ChevronRight, FileText, Image, Info } from 'lucide-react';
import { saveAs } from 'file-saver';

interface CrawlResultsProps {
  results: CrawlResult | null;
  isLoading: boolean;
}

const CrawlResults: React.FC<CrawlResultsProps> = ({ results, isLoading }) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const handleExportJson = () => {
    if (!results) return;
    
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    saveAs(blob, `crawl-result-${new Date().getTime()}.json`);
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // 递归渲染结果树
  const renderResultTree = (result: CrawlResult, level: number = 0, prefix: string = '') => {
    const nodeId = `${prefix}-${result.url}`;
    const isExpanded = expandedNodes.has(nodeId);
    const hasChildren = result.childResults && result.childResults.length > 0;
    
    return (
      <div key={nodeId} className="mt-1">
        <div 
          className={`flex items-center ${level > 0 ? 'ml-4' : ''} p-2 rounded hover:bg-accent cursor-pointer`}
          onClick={() => hasChildren && toggleNode(nodeId)}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
          ) : (
            <span className="w-4"></span>
          )}
          <FileText size={16} className="ml-1 mr-2 text-blue-500" />
          <span className="text-sm truncate">{result.parsedContent?.title || result.url}</span>
        </div>
        
        {isExpanded && hasChildren && (
          <div className="ml-6 pl-2 border-l border-dashed">
            {result.childResults!.map((child, index) => 
              renderResultTree(child, level + 1, `${nodeId}-${index}`)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>爬取结果</CardTitle>
        {results && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportJson}
            className="flex items-center gap-1 bg-secondary text-secondary-foreground"
          >
            <Download size={16} />
            导出JSON
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-muted-foreground">正在爬取网站内容...</p>
            </div>
          </div>
        ) : results ? (
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="content">网页内容</TabsTrigger>
              <TabsTrigger value="parsed">解析内容</TabsTrigger>
              <TabsTrigger value="links">发现链接</TabsTrigger>
              <TabsTrigger value="tree">网站树</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="mt-4">
              <Textarea 
                value={results.content} 
                readOnly 
                className="h-64 font-mono text-sm"
              />
            </TabsContent>
            
            <TabsContent value="parsed" className="mt-4">
              {results.parsedContent ? (
                <div className="border rounded-md p-4 h-64 overflow-y-auto space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">标题</h3>
                    <p className="text-base font-medium">{results.parsedContent.title}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">内容</h3>
                    <p className="text-sm">{results.parsedContent.text.substring(0, 500)}...</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">图片 ({results.parsedContent.images.length})</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {results.parsedContent.images.map((img, idx) => (
                        <div key={idx} className="border rounded p-2 flex items-center">
                          <Image size={16} className="mr-2 text-muted-foreground" />
                          <span className="text-xs truncate">{img}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-center">
                  <p className="text-muted-foreground">未提取结构化内容，请在爬取配置中选择"提取网页内容"选项</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="links" className="mt-4">
              <div className="border rounded-md p-4 h-64 overflow-y-auto">
                <h4 className="mb-2 text-sm font-medium">发现 {results.links.length} 个链接:</h4>
                <ul className="space-y-2">
                  {results.links.map((link, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <ExternalLink size={14} className="text-muted-foreground" />
                      <span className="text-blue-500">{link}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="tree" className="mt-4">
              <div className="border rounded-md p-4 h-64 overflow-y-auto">
                <h4 className="mb-2 text-sm font-medium">网站内容树:</h4>
                {results.childResults && results.childResults.length > 0 ? (
                  <div className="mt-2">
                    {renderResultTree(results)}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    未发现子页面内容。若要爬取导航站内容，请在爬取配置中选择"爬取导航链接"选项并设置深度大于1。
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
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
                className="text-muted-foreground"
              >
                <path d="M9.5 9.5 14.5 14.5M21.5 12a9.5 9.5 0 1 1-19 0 9.5 9.5 0 0 1 19 0Z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold">暂无爬取结果</h3>
            <p className="text-muted-foreground mt-2 max-w-xs">
              使用左侧表单配置爬虫参数，点击"开始爬取"按钮爬取网站内容。
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CrawlResults;
