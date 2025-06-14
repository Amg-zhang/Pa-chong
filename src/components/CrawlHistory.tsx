import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CrawlHistory as CrawlHistoryType } from '@/types/crawler';
import { Calendar, Link2, FileCheck } from 'lucide-react';

interface CrawlHistoryProps {
  history: CrawlHistoryType[];
  onSelectHistory: (id: string) => void;
}

const CrawlHistory: React.FC<CrawlHistoryProps> = ({ history, onSelectHistory }) => {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>爬取历史</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">暂无爬取历史记录</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>爬取历史</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-y-auto">
          {history.map((item) => (
            <button
              key={item.id}
              className="w-full text-left px-6 py-4 hover:bg-accent border-b last:border-b-0 flex flex-col gap-1"
              onClick={() => onSelectHistory(item.id)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium truncate max-w-[180px]">
                  {item.url}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    item.status === 'completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : item.status === 'failed'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}
                >
                  {item.status === 'completed'
                    ? '完成'
                    : item.status === 'failed'
                    ? '失败'
                    : '进行中'}
                </span>
              </div>
              <div className="text-xs text-muted-foreground flex justify-between items-center mt-1">
                <div className="flex items-center">
                  <Calendar size={12} className="mr-1" />
                  <span>{new Date(item.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Link2 size={12} className="mr-1" />
                    <span>{item.resultsCount}</span>
                  </div>
                  <div className="flex items-center">
                    <FileCheck size={12} className="mr-1" />
                    <span>{item.pagesCount || 1}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CrawlHistory;
