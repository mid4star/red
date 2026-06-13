'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudRain, Sun, Waves, Wind, Thermometer, Navigation, Droplets } from 'lucide-react';

interface WeatherData {
  id: string;
  location: string;
  locationAr: string;
  temp: number;
  windSpeed: number;
  windDir: string;
  bgImage: string;
  gradient: string;
}

const defaultConditions: WeatherData[] = [
  { id: 'hurghada', location: 'Hurghada', locationAr: 'الغردقة', temp: 0, windSpeed: 0, windDir: '--', bgImage: '/weather/hurghada.png', gradient: 'from-orange-600/[0.65] via-amber-700/[0.65] to-slate-900/80' },
  { id: 'elgouna', location: 'El Gouna', locationAr: 'الجونة', temp: 0, windSpeed: 0, windDir: '--', bgImage: '/weather/elgouna.png', gradient: 'from-cyan-600/[0.65] via-blue-700/[0.65] to-slate-900/80' },
  { id: 'safaga', location: 'Safaga', locationAr: 'سفاجا', temp: 0, windSpeed: 0, windDir: '--', bgImage: '/weather/safaga.png', gradient: 'from-emerald-600/[0.65] via-teal-700/[0.65] to-slate-900/80' },
  { id: 'marsa_alam', location: 'Marsa Alam', locationAr: 'مرسى علم', temp: 0, windSpeed: 0, windDir: '--', bgImage: '/weather/marsa_alam.png', gradient: 'from-pink-600/[0.65] via-rose-700/[0.65] to-slate-900/80' }
];

function getWindDirection(degree: number) {
  const sectors = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'];
  return sectors[Math.round((degree % 360) / 22.5)];
}

export default function DashboardWeatherWidget({ isArabic = false }: { isArabic?: boolean }) {
  const [conditions, setConditions] = useState<WeatherData[]>(defaultConditions);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=27.2579,27.3942,26.7292,25.0676&longitude=33.8116,33.6782,33.9365,34.8931&current=temperature_2m,wind_speed_10m,wind_direction_10m&wind_speed_unit=kn');
        const data = await res.json();
        
        if (Array.isArray(data) && data.length === 4) {
          setConditions(prev => prev.map((item, index) => {
            const current = data[index]?.current;
            if (!current) return item;
            return {
              ...item,
              temp: Math.round(current.temperature_2m),
              windSpeed: Math.round(current.wind_speed_10m),
              windDir: getWindDirection(current.wind_direction_10m)
            };
          }));
        }
      } catch (err) {
        console.error('Failed to fetch weather data:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchWeather();
  }, []);

  // Format today's date
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
  const dateStr = today.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', dateOptions);

  return (
    <div className={`absolute top-6 z-20 flex flex-row gap-3 max-w-[90%] overflow-x-auto pb-2 custom-scrollbar pointer-events-auto ${isArabic ? 'left-6 right-auto' : 'right-6 left-auto'}`}>
      <AnimatePresence>
        {conditions.map((cond, idx) => (
          <motion.div
            key={cond.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
            className="relative w-36 h-36 md:w-40 md:h-40 rounded-2xl overflow-hidden border border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.5)] group hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.7)] transition-all cursor-default shrink-0"
          >
            {/* Background Panorama */}
            <div className="absolute inset-0 z-0">
              <img src={cond.bgImage} alt={cond.location} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[3s] ease-out" />
              {/* Vibrant Gradient overlay per city with exactly 65% opacity */}
              <div className={`absolute inset-0 bg-gradient-to-br ${cond.gradient} opacity-[0.65] mix-blend-color`} />
              {/* Secondary gradient to ensure readability without being too dark */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              {/* Slight additional darkening to ensure white text pops */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
            </div>

            {/* Content Container - z-10 ensures it sits above the background and mix-blend layers */}
            <div className="relative z-10 p-3 h-full flex flex-col justify-between text-white !text-white">
              {/* Top Section: Location & Icon */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <h3 className="font-black !text-white text-sm md:text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wide leading-tight">
                    {isArabic ? cond.locationAr : cond.location}
                  </h3>
                  <span className="text-[9px] !text-white/90 font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] mt-0.5">{dateStr}</span>
                </div>
                
                <div className={isArabic ? 'mr-auto' : 'ml-auto'}>
                   <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                      className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    >
                      <Sun size={24} className="!text-white" />
                   </motion.div>
                </div>
              </div>
              
              {/* Bottom Section: Wind & Temp */}
              <div className="flex items-end justify-between mt-auto">
                {/* Wind */}
                <div className="flex items-center gap-1.5 mb-1 bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20 shadow-inner">
                  <Wind size={10} className="!text-white" />
                  <span className="text-[9px] md:text-[10px] font-bold !text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" dir="ltr">
                    {loading ? '--' : cond.windSpeed}kt {loading ? '' : cond.windDir}
                  </span>
                </div>

                {/* Large Temp */}
                <div className="flex items-start">
                  <span className="font-black !text-white tracking-tighter drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] flex items-start" dir="ltr">
                    <span className="text-3xl md:text-4xl">{loading ? '--' : cond.temp}</span>
                    <span className="text-sm font-bold mt-1 ml-0.5">°C</span>
                  </span>
                </div>
              </div>
              
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
