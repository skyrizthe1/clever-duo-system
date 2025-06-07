
import React from 'react';

export function CloudBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Cloud 1 */}
      <div className="cloud absolute top-20 left-10 w-24 h-16 bg-white/20 rounded-full">
        <div className="absolute top-2 left-4 w-16 h-12 bg-white/20 rounded-full"></div>
        <div className="absolute top-1 right-2 w-12 h-10 bg-white/20 rounded-full"></div>
      </div>
      
      {/* Cloud 2 */}
      <div className="cloud-delayed absolute top-32 right-20 w-32 h-20 bg-white/15 rounded-full">
        <div className="absolute top-3 left-6 w-20 h-14 bg-white/15 rounded-full"></div>
        <div className="absolute top-2 right-4 w-16 h-12 bg-white/15 rounded-full"></div>
      </div>
      
      {/* Cloud 3 */}
      <div className="cloud absolute top-64 left-1/4 w-28 h-18 bg-white/10 rounded-full">
        <div className="absolute top-2 left-5 w-18 h-13 bg-white/10 rounded-full"></div>
        <div className="absolute top-1 right-3 w-14 h-11 bg-white/10 rounded-full"></div>
      </div>
      
      {/* Cloud 4 */}
      <div className="cloud-delayed absolute bottom-32 right-10 w-36 h-22 bg-white/20 rounded-full">
        <div className="absolute top-4 left-8 w-22 h-16 bg-white/20 rounded-full"></div>
        <div className="absolute top-2 right-6 w-18 h-14 bg-white/20 rounded-full"></div>
      </div>
      
      {/* Cloud 5 */}
      <div className="cloud absolute bottom-48 left-16 w-20 h-14 bg-white/15 rounded-full">
        <div className="absolute top-2 left-3 w-14 h-10 bg-white/15 rounded-full"></div>
        <div className="absolute top-1 right-2 w-10 h-8 bg-white/15 rounded-full"></div>
      </div>
      
      {/* Cloud 6 */}
      <div className="cloud-delayed absolute top-80 right-1/3 w-24 h-16 bg-white/12 rounded-full">
        <div className="absolute top-2 left-4 w-16 h-12 bg-white/12 rounded-full"></div>
        <div className="absolute top-1 right-2 w-12 h-10 bg-white/12 rounded-full"></div>
      </div>
    </div>
  );
}
