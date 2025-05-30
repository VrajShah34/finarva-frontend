// app/components/ProgressBar.tsx

import React from 'react';
import { View, Text } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  showPercentage?: boolean;
  color?: string;
  backgroundColor?: string;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  showPercentage = false,
  color = '#4DF0A9',
  backgroundColor = '#E5E7EB',
  className = '',
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View className={className}>
      {showPercentage && (
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-gray-600 text-sm">Progress</Text>
          <Text className="text-gray-800 font-bold text-sm">{Math.round(clampedProgress)}%</Text>
        </View>
      )}
      <View 
        className="rounded-full overflow-hidden"
        style={{ 
          height, 
          backgroundColor 
        }}
      >
        <View 
          className="h-full rounded-full transition-all duration-300"
          style={{ 
            width: `${clampedProgress}%`,
            backgroundColor: color
          }}
        />
      </View>
    </View>
  );
};

export default ProgressBar;