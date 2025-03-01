import React, { useEffect, useState } from 'react';

const ProgressBar = ({ progress }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  useEffect(() => {
    setTimeout(() => { setAnimatedProgress(progress) }, 1000);
  }, [progress]);

  return (
    <div>
      <div className="w-3/4 mx-auto my-4 border-2 border-black bg-gray-100 rounded-2xl overflow-hidden">
        <div 
          style={{ width: `${animatedProgress}%` }}
          className="bg-green-500 ease-in transition-all duration-1000 text-right px-2 py-1 rounded-2xl"
          role="progressbar" 
          aria-valuenow={animatedProgress} 
          aria-valuemin="0" 
          aria-valuemax="100"
        >
          {progress}%
        </div>
      </div>
    </div>
  );
};

const ProgressBarPrac = () => {
  const [pg, setPg] = useState(0);
  
  return (
    <div>
      <div>
        <h1 className="text-xl font-bold mb-4">Progress bar</h1>
        <input
          type="number"
          onChange={(e) => setPg(Math.min(100, Math.max(0, Number(e.target.value))))}
          className="border-2 border-gray-400 p-1 my-2"
          placeholder="Enter progress (0-100)"
        />
        <ProgressBar progress={pg} />
        <ProgressBar progress={0} />
        <ProgressBar progress={20} />
        <ProgressBar progress={35} />
        <ProgressBar progress={55} />
        <ProgressBar progress={75} />
        <ProgressBar progress={100} />
      </div>
    </div>
  );
};

export default ProgressBarPrac;
// using width is good optn as transition create unnecessary backward bar