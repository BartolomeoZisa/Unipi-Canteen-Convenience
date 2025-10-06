import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TariffCalculator, PriceCalculator } from '@/services/calculationService';
import { CalculationInput } from '@/types';

interface CostComparisonGraphProps {
  baseInput: Omit<CalculationInput, 'totalMeals'>;
  maxMeals?: number;
  stepSize?: number;
}

interface GraphDataPoint {
  meals: number;
  perMeal: number;
  flatTariff?: number;
  carnet?: number;
  carnetMix?: number;
  recommended: string;
}

export const CostComparisonGraph: React.FC<CostComparisonGraphProps> = ({ 
  baseInput, 
  maxMeals = 200, 
  stepSize = 10 
}) => {
  const { t } = useTranslation();
  
  const calculator = useMemo(() => {
    const priceCalculator = new PriceCalculator();
    return new TariffCalculator(priceCalculator);
  }, []);

  const graphData = useMemo(() => {
    const data: GraphDataPoint[] = [];
    
    for (let meals = stepSize; meals <= maxMeals; meals += stepSize) {
      const input: CalculationInput = {
        ...baseInput,
        totalMeals: meals
      };
      
      const result = calculator.calculate(input);
      
      // Extract costs for different option types
      const perMealOption = result.options.find(opt => opt.type === 'per-meal');
      const flatOption = result.options.find(opt => opt.type === 'flat');
      const carnetOption = result.options.find(opt => opt.type === 'carnet');
      const carnetMixOption = result.options.find(opt => opt.type === 'carnet-mix');
      
      const dataPoint: GraphDataPoint = {
        meals,
        perMeal: perMealOption?.totalCost || 0,
        recommended: result.recommendedOption.type
      };
      
      if (flatOption) {
        dataPoint.flatTariff = flatOption.totalCost;
      }
      
      if (carnetOption) {
        dataPoint.carnet = carnetOption.totalCost;
      }

      if (carnetMixOption) {
        dataPoint.carnetMix = carnetMixOption.totalCost;
      }
      
      data.push(dataPoint);
    }
    
    return data;
  }, [baseInput, calculator, maxMeals, stepSize]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as GraphDataPoint;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-semibold">{`${label} ${t('graph.meals')}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: €${entry.value?.toFixed(2)}`}
            </p>
          ))}
          <p className="text-xs text-gray-600 mt-1 font-medium">
            {t('graph.bestOption')}: {data.recommended}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {t('graph.title', 'Cost Comparison Across Meal Quantities')}
        </h3>
        <p className="text-sm text-gray-600">
          {t('graph.subtitle', 'Compare how different tariff options perform as meal quantities change')}
        </p>
      </div>
      
      <div className="h-[500px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={graphData} margin={{ top: 20, right: 30, left: 40, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="meals" 
              stroke="#666"
              fontSize={12}
              label={{ value: t('graph.numberOfMeals'), position: 'insideBottom', offset: -20 }}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              label={{ value: t('graph.cost'), angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            
            <Line 
              type="monotone" 
              dataKey="perMeal" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name={t('tariffOptions.payPerMeal')}
              connectNulls={false}
            />
            
            <Line 
              type="monotone" 
              dataKey="flatTariff" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Tariffa Flat"
              connectNulls={false}
            />
            
            <Line 
              type="monotone" 
              dataKey="carnet" 
              stroke="#f59e0b" 
              strokeWidth={2}
              name="Carnet"
              connectNulls={false}
            />
            
            <Line 
              type="monotone" 
              dataKey="carnetMix" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              name={t('tariffOptions.carnetMix')}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>
          {t('graph.note', 'Note: Graph shows the most cost-effective option at each meal quantity. Flat tariffs may not appear if ISEE exceeds eligibility limits.')}
        </p>
      </div>
    </div>
  );
};