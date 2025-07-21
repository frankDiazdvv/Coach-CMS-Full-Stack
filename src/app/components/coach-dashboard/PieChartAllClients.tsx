import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { IClient } from '../../../../lib/models/clients'; 
import { useTranslations } from 'next-intl';

interface ClientPlanSummary {
  name: string;
  value: number;
  color: string;
}

interface Props {
  data: ClientPlanSummary[];
  coachClients: IClient[]; // Add coachClients to props
}

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/25 border border-gray-200 rounded-lg shadow-lg p-3 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: data.color }}
          ></div>
          <span className="text-sm font-medium text-gray-900">{data.name}</span>
          <span className="text-xs text-gray-500"> ({data.value} {data.value === 1 ? 'client' : 'clients'})</span>
        </div>
      </div>
    );
  }
  return null;
};

// Custom label component for percentages
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize="12"
      fontWeight="600"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Custom legend component
const CustomLegend = ({ payload }: any) => {
  const t = useTranslations();

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          ></div>
          <span className="text-sm font-medium text-gray-700">{entry.value}</span>
          <span className="text-xs text-gray-500">
            {t('clients', { clients: entry.payload.value })}
          </span>
        </div>
      ))}
    </div>
  );
};

const ClientPlansPieChart: React.FC<{ data: ClientPlanSummary[] }> = ({ data }) => {
  const t = useTranslations();
  const totalClients = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className='relative'>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart className='z-50'>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={120}
            innerRadius={50}
            fill="#8884d8"
            dataKey="value"
            stroke="white"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            animationEasing='ease'
            content={<CustomTooltip />} 
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label positioned absolutely */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">
            {totalClients}
          </div>
          <div className="text-sm font-medium text-gray-500">
            {t('totalClients')}
          </div>
        </div>
      </div>
      
    </div>

  );
};

const PieChartAllClients = ({ data, coachClients }: Props) => {
  const t = useTranslations();

  return (
    <div className="w-full lg:w-1/3">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="text-xl font-bold text-gray-800">{t('totalClientsEnrolled')}</h2>
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
        </div>
        <div className="h-full overflow-y-auto">
          <ClientPlansPieChart data={data} />
        </div>
      </div>
    </div>
  );
};

export default PieChartAllClients;