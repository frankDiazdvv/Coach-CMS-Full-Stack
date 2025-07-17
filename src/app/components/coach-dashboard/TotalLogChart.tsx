import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, CartesianGrid  } from 'recharts';

interface ClientWorkoutSummary {
  clientId: string;
  clientName: string; // The label for your Y-axis
  workoutsLogged: number; // The value for your X-axis (bar length)
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/40 border border-gray-200 rounded-lg shadow-lg p-3 backdrop-blur-sm">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">
          <span className="inline-block w-2 h-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mr-2"></span>
          {payload[0].value} workouts logged
        </p>
      </div>
    );
  }
  return null;
};

// Custom label component
const CustomLabel = (props: any) => {
  const { x, y, width, value } = props;
  return (
    <text 
      x={x + width + 8} 
      y={y + 18} 
      fill="#6B7280" 
      fontSize="13" 
      fontWeight="500"
      textAnchor="start"
    >
      {value}
    </text>
  );
};

// Assume clientData is fetched and available
const TotalLogsByClientChart: React.FC<{ data: ClientWorkoutSummary[] }> = ({ data }) => {
  // Sort data if you want the highest/lowest at the top/bottom
  const sortedData = [...data].sort((a, b) => b.workoutsLogged - a.workoutsLogged);

  return (
     <div className="w-full bg-gray-50">
      <ResponsiveContainer width="100%" height={Math.max(320, sortedData.length * 50)}>
        <BarChart
          layout="vertical"
          data={sortedData}
          margin={{ top: 0, right: 30, left: 0, bottom: 30 }}
        >
          <XAxis 
            type="number" 
            hide 
            domain={[0, 'dataMax']}
          />
          <YAxis
            dataKey="clientName"
            type="category"
            width={120}
            tick={{ 
              fontSize: 14, 
              fill: '#374151', 
              fontWeight: 500 
            }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />

          
          <Tooltip content={<CustomTooltip/>} />
          <Bar 
            dataKey="workoutsLogged" 
            fill="url(#colorGradient)"
            radius={[0, 4, 4, 0]}
            barSize={26}
          >
            <LabelList content={<CustomLabel />} />
          </Bar>
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FB7C37" />
              <stop offset="100%" stopColor="#F97319" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TotalLogsByClientChart;