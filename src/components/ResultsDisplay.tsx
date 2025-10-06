import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, TrendingDown } from 'lucide-react';
import { CalculationResult } from '@/types';

interface ResultsDisplayProps {
  results: CalculationResult;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const { t } = useTranslation();

  if (results.options.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('results.title')}</h2>
        <p className="text-gray-600">{t('results.noOptions')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('results.title')}</h2>
      
      {/* Recommended Option */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-green-800">{t('results.recommended')}</h3>
        </div>
        <div className="bg-white rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-900">{results.recommendedOption.name}</h4>
              <p className="text-sm text-gray-600">{results.recommendedOption.description}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                €{results.recommendedOption.totalCost.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {results.recommendedOption.type}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* All Options */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5" />
          {t('results.allOptions')}
        </h3>
        <div className="space-y-3">
          {results.options.map((option) => (
            <div 
              key={option.id}
              className={`border rounded-lg p-4 transition-colors ${
                option.id === results.recommendedOption.id 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    {option.name}
                    {option.id === results.recommendedOption.id && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                        Best
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                </div>
                <div className="text-right ml-4">
                  <p className={`text-xl font-bold ${
                    option.id === results.recommendedOption.id 
                      ? 'text-green-600' 
                      : 'text-gray-900'
                  }`}>
                    €{option.totalCost.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {option.type}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Calculation based on:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">ISEE:</span>
            <p className="font-medium">€{results.input.isee.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-gray-500">Meals:</span>
            <p className="font-medium">{results.input.totalMeals}</p>
          </div>
          <div>
            <span className="text-gray-500">Meal Type:</span>
            <p className="font-medium capitalize">{results.input.preferredMealType}</p>
          </div>
          <div>
            <span className="text-gray-500">Scholarship:</span>
            <p className="font-medium">{results.input.isScholarshipEligible ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};