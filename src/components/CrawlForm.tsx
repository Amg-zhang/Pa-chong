import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { isValidUrl } from '@/services/crawler';

interface CrawlFormProps {
  onStartCrawl: (
    url: string, 
    depth: number, 
    maxPages: number, 
    extractContent: boolean,
    followNavigation: boolean
  ) => void;
  isLoading: boolean;
}

const CrawlForm: React.FC<CrawlFormProps> = ({ onStartCrawl, isLoading }) => {
  const [url, setUrl] = useState<string>('');
  const [depth, setDepth] = useState<number>(2);
  const [maxPages, setMaxPages] = useState<number>(10);
  const [extractContent, setExtractContent] = useState<boolean>(true);
  const [followNavigation, setFollowNavigation] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      setError('请输入网址');
      return;
    }

    if (!isValidUrl(url)) {
      setError('请输入有效的网址，例如 https://example.com');
      return;
    }

    setError('');
    onStartCrawl(url, depth, maxPages, extractContent, followNavigation);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>网站爬取配置</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="url" className="block text-sm font-medium">
              目标网站 URL
            </label>
            <Input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              disabled={isLoading}
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="depth" className="block text-sm font-medium">
                爬取深度
              </label>
              <Input
                id="depth"
                type="number"
                min={1}
                max={5}
                value={depth}
                onChange={(e) => setDepth(parseInt(e.target.value))}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">最大深度: 5</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="maxPages" className="block text-sm font-medium">
                最大页面数
              </label>
              <Input
                id="maxPages"
                type="number"
                min={1}
                max={100}
                value={maxPages}
                onChange={(e) => setMaxPages(parseInt(e.target.value))}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">最大爬取: 100页</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="extractContent" 
                checked={extractContent}
                onCheckedChange={(checked) => setExtractContent(checked === true)}
                disabled={isLoading}
              />
              <label 
                htmlFor="extractContent" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                提取网页内容（标题、文本、图片）
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="followNavigation" 
                checked={followNavigation}
                onCheckedChange={(checked) => setFollowNavigation(checked === true)}
                disabled={isLoading}
              />
              <label 
                htmlFor="followNavigation" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                爬取导航链接（适用于导航站）
              </label>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary text-primary-foreground"
            disabled={isLoading}
          >
            {isLoading ? '爬取中...' : '开始爬取'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CrawlForm;
