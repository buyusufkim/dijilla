import React from "react";
import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

interface CostAnalysisChartProps {
  data: {
    date: string;
    cost: number;
    fullDate: string;
  }[];
}

export const CostAnalysisChart: React.FC<CostAnalysisChartProps> = ({ data }) => {
  if (data.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-[#00E676]" />
        Bakım Maliyet Analizi
      </h3>
      <Card className="bg-[#1A233A] border-white/10 p-4">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#ffffff40" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#ffffff40" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value} TL`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A233A', border: '1px solid #ffffff20', borderRadius: '8px' }}
                itemStyle={{ color: '#00E5FF' }}
                labelStyle={{ color: '#ffffff60' }}
              />
              <Area 
                type="monotone" 
                dataKey="cost" 
                stroke="#00E5FF" 
                fillOpacity={1} 
                fill="url(#colorCost)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
