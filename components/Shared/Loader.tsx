import React from 'react';
import { Leaf } from 'lucide-react';

const Loader = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center space-x-2">
        <div className="animate-spin p-2 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-xl">
          <Leaf className="h-6 w-6 text-white" />
        </div>
        <span className="text-slate-600 font-medium">Loading...</span>
      </div>
    </div>
  );
};

export default Loader;