// NumberCircle.tsx
import React from 'react';

interface NumberCircleProps {
  number: number;
  text: string; // New prop for the additional text
}

const NumberCircle: React.FC<NumberCircleProps> = ({ number, text }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center justify-center min-w-10 h-10 bg-black rounded-full">
        <span className="text-white text-xl font-semibold">{number}</span>
      </div>
      <div className="flex flex-col justify-center h-20" style={{ lineHeight: '1.15' }}>
        <span className="text-md font-medium leading-0">{text}</span>
      </div>
    </div>
  );
};

export default NumberCircle;
