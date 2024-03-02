// Import React and necessary icon from lucide-react
import React from 'react';
import { Bot } from 'lucide-react';

interface LogoProps {
  // You can add more props here if needed
}

const LogoComponent: React.FC<LogoProps> = (props) => {
  return (
    <div className="flex items-center m-2.5 ml-4">
      {/* Render the Bot icon */}
      <Bot className="text-current h-9 w-9 mr-1" />
      {/* App name next to the icon */}
      <span className="font-semibold text-2xl mt-[6px]">Convo</span>
    </div>
  );
};

export default LogoComponent;
