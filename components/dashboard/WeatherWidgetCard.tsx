'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, Check, Search } from 'lucide-react';

interface CityOption {
  name: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
}

const POPULAR_CITIES: CityOption[] = [
  { name: 'Cebu City', country: 'Philippines', lat: 10.3157, lon: 123.8854, timezone: 'Asia/Manila' },
  { name: 'Manila', country: 'Philippines', lat: 14.5995, lon: 120.9842, timezone: 'Asia/Manila' },
  { name: 'Kathmandu', country: 'Nepal', lat: 27.7172, lon: 85.3240, timezone: 'Asia/Kathmandu' },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, timezone: 'Asia/Tokyo' },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, timezone: 'Asia/Singapore' },
  { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060, timezone: 'America/New_York' },
  { name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278, timezone: 'Europe/London' },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, timezone: 'Australia/Sydney' },
];

export default function WeatherWidgetCard() {
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [selectedCity, setSelectedCity] = useState<CityOption>(POPULAR_CITIES[0]); // Default to Cebu City
  const [isCityPickerOpen, setIsCityPickerOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  const [weather, setWeather] = useState<{
    temperature: number;
    apparentTemp: number;
    tempHigh: number;
    tempLow: number;
    humidity: number;
    weatherCode: number;
    isDay: number;
    conditionName: string;
    loading: boolean;
  }>({
    temperature: 28,
    apparentTemp: 31,
    tempHigh: 31,
    tempLow: 25,
    humidity: 70,
    weatherCode: 2,
    isDay: 1,
    conditionName: 'Partly Cloudy',
    loading: false,
  });

  const pickerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsCityPickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch weather from Open-Meteo (with localStorage cache to eliminate lag)
  const fetchWeather = async (city: CityOption) => {
    const cacheKey = `weather_cache_${city.name}`;
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          // If cached less than 15 minutes ago, use it immediately
          if (Date.now() - timestamp < 15 * 60 * 1000) {
            setWeather(data);
            return;
          }
        } catch (e) {}
      }
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=${encodeURIComponent(
        city.timezone
      )}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.current) {
          const code = data.current.weather_code ?? 0;
          let cond = 'Sunny';
          if (code >= 1 && code <= 3) cond = 'Partly Cloudy';
          else if (code >= 45 && code <= 48) cond = 'Foggy';
          else if (code >= 51 && code <= 67) cond = 'Rain';
          else if (code >= 80 && code <= 82) cond = 'Showers';
          else if (code >= 95) cond = 'Thunderstorm';

          const high = data.daily?.temperature_2m_max?.[0]
            ? Math.round(data.daily.temperature_2m_max[0])
            : Math.round(data.current.temperature_2m) + 3;
          const low = data.daily?.temperature_2m_min?.[0]
            ? Math.round(data.daily.temperature_2m_min[0])
            : Math.round(data.current.temperature_2m) - 5;

          const newWeatherData = {
            temperature: Math.round(data.current.temperature_2m),
            apparentTemp: Math.round(data.current.apparent_temperature ?? data.current.temperature_2m),
            tempHigh: high,
            tempLow: low,
            humidity: Math.round(data.current.relative_humidity_2m ?? 65),
            weatherCode: code,
            isDay: data.current.is_day ?? 1,
            conditionName: cond,
            loading: false,
          };

          setWeather(newWeatherData);

          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(cacheKey, JSON.stringify({ data: newWeatherData, timestamp: Date.now() }));
            } catch (e) {}
          }
        }
      }
    } catch (e) {
      console.warn('Could not refresh weather:', e);
    }
  };

  useEffect(() => {
    fetchWeather(selectedCity);
    const interval = setInterval(() => {
      fetchWeather(selectedCity);
    }, 15 * 60 * 1000); // 15 mins
    return () => clearInterval(interval);
  }, [selectedCity]);

  const toDisplayTemp = (celsius: number) => {
    if (unit === 'F') {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return celsius;
  };

  const filteredCities = POPULAR_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
      c.country.toLowerCase().includes(citySearch.toLowerCase())
  );

  // Return the matching 2D Flat Icon Image path matching user reference image
  const getWeatherImagePath = () => {
    const isNight = weather.isDay === 0;
    const code = weather.weatherCode;

    if (code >= 95) return '/weather/storm.svg';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return '/weather/rain.svg';
    if (isNight && (code === 0 || code === 1)) return '/weather/night.svg';
    if (code === 0) return '/weather/sunny.svg';
    return '/weather/partly-cloudy.svg';
  };

  return (
    <div className="relative w-full max-w-[240px] sm:max-w-[255px] rounded-xl bg-gradient-to-br from-[#EEF7FE] via-[#E2F0FD] to-[#D5E9FA] dark:from-[#0F223D] dark:via-[#142C4F] dark:to-[#0C1A30] p-2.5 sm:p-3 text-slate-800 dark:text-white shadow-md shadow-blue-900/5 dark:shadow-black/30 border border-[#BFDBFE] dark:border-[#1E3A8A]/50 font-poppins select-none transition-all">
      
      {/* Background Ambient Sky Glow */}
      <div className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden">
        <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-blue-300/30 dark:bg-blue-600/10 blur-xl" />
        <div className="absolute -bottom-8 -left-8 w-20 h-20 rounded-full bg-sky-200/40 dark:bg-sky-500/10 blur-xl" />
      </div>

      {/* 1. Top Bar: [📍 Location Pill] on Left, [ F | C Switch ] on Right */}
      <div className="relative z-30 flex items-center justify-between gap-1 mb-1.5 font-poppins">
        
        {/* Location Selector Pill */}
        <div className="relative" ref={pickerRef}>
          <button
            type="button"
            onClick={() => setIsCityPickerOpen(!isCityPickerOpen)}
            className="group flex items-center gap-1 px-2 py-0.5 rounded-full bg-white dark:bg-[#1E293B] hover:bg-slate-50 text-[#2F6798] dark:text-blue-200 text-[10px] font-semibold shadow-2xs border border-blue-100 dark:border-slate-700 transition-all cursor-pointer active:scale-95 font-poppins"
            title="Click to switch location"
          >
            <MapPin className="w-2.5 h-2.5 text-[#2F6798] dark:text-blue-400 stroke-[2.5]" />
            <span className="tracking-tight font-medium truncate max-w-[90px]">{selectedCity.name}</span>
            <ChevronDown className="w-2.5 h-2.5 text-slate-400 group-hover:text-[#2F6798] dark:group-hover:text-white transition-transform" />
          </button>

          {/* City Selector Dropdown Modal */}
          {isCityPickerOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-52 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-700 shadow-2xl ring-1 ring-black/10 p-2 z-50 text-slate-800 dark:text-white animate-in fade-in zoom-in-95 font-poppins">
              <div className="relative mb-1.5">
                <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder="Search city..."
                  className="w-full pl-6 pr-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-[#2F6798] font-poppins"
                  autoFocus
                />
              </div>

              <div className="max-h-36 overflow-y-auto space-y-0.5 custom-scrollbar">
                {filteredCities.map((c) => {
                  const isSelected = c.name === selectedCity.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => {
                        setSelectedCity(c);
                        setIsCityPickerOpen(false);
                        setCitySearch('');
                      }}
                      className={`w-full px-2 py-1 rounded-lg text-left text-[11px] font-medium flex items-center justify-between transition-colors cursor-pointer font-poppins ${
                        isSelected
                          ? 'bg-[#2F6798] text-white font-semibold shadow-xs'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate">
                        {c.name}, <span className="opacity-70 text-[9px]">{c.country}</span>
                      </span>
                      {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Unit Toggle [ F | C ] */}
        <div className="flex items-center p-0.5 rounded-full bg-white/90 dark:bg-[#0B172B] border border-blue-200/80 dark:border-blue-900/60 shadow-2xs font-poppins">
          {/* Fahrenheit Button */}
          <button
            type="button"
            onClick={() => setUnit('F')}
            className={`px-2 py-0.5 rounded-full text-[9px] font-semibold transition-all cursor-pointer font-poppins ${
              unit === 'F'
                ? 'bg-[#2F6798] text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            F
          </button>

          {/* Celsius Button */}
          <button
            type="button"
            onClick={() => setUnit('C')}
            className={`px-2 py-0.5 rounded-full text-[9px] font-semibold transition-all cursor-pointer font-poppins ${
              unit === 'C'
                ? 'bg-[#2F6798] text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            C
          </button>
        </div>

      </div>

      {/* 2. Main Content Grid: Left side text/temp + Right side Custom Flat Artwork */}
      <div className="relative z-0 flex items-center justify-between gap-1.5 font-poppins">
        
        {/* Left Column: Weather Title, [Big Temp + Beside it: Condition Pill & Feels like] */}
        <div className="space-y-0.5 font-poppins min-w-0">
          <h4 className="text-[11px] font-semibold text-[#2F6798] dark:text-blue-200 tracking-wide font-poppins">
            Weather
          </h4>

          {/* Temperature Row: Big Temp on left + [Partly Cloudy Pill + Feels Like] beside it */}
          <div className="flex items-center gap-1.5 pt-0.5 font-poppins">
            
            {/* Big Temperature Display in Poppins: e.g. 77°F */}
            <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white flex items-baseline font-poppins shrink-0">
              <span>{toDisplayTemp(weather.temperature)}</span>
              <span className="text-sm font-light ml-0.5 text-slate-600 dark:text-slate-300">°{unit}</span>
            </div>

            {/* Beside 77°F: Condition Pill & Feels Like */}
            <div className="flex flex-col gap-0.5 min-w-0 font-poppins">
              {/* Partly Cloudy Pill */}
              <div className="px-1.5 py-0.5 rounded-full bg-white/90 dark:bg-[#1E293B] border border-blue-100 dark:border-slate-700 shadow-2xs text-[9.5px] font-semibold text-[#2F6798] dark:text-blue-300 w-fit font-poppins truncate max-w-[85px]">
                {weather.conditionName}
              </div>

              {/* Feels like text */}
              <div className="text-[9.5px] text-slate-600 dark:text-slate-300 font-medium pl-0.5 tracking-tight font-poppins truncate">
                Feels {toDisplayTemp(weather.apparentTemp)}°
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Custom 2D Flat Image */}
        <div className="relative w-13 h-13 sm:w-14 sm:h-14 flex items-center justify-center shrink-0">
          <img
            src={getWeatherImagePath()}
            alt={weather.conditionName}
            className="w-12 h-12 sm:w-13 sm:h-13 object-contain select-none transition-transform hover:scale-105 duration-200"
          />
        </div>

      </div>

      {/* 3. Bottom Row: High & Low in a sleek pill in Poppins */}
      <div className="relative z-0 flex items-center justify-end pt-1 font-poppins">
        <div className="px-2 py-0.5 rounded-full bg-white/90 dark:bg-[#1E293B] border border-blue-100 dark:border-slate-700 shadow-2xs flex items-center gap-1.5 text-[9.5px] font-medium text-[#2F6798] dark:text-blue-200 tracking-tight font-poppins">
          <span>
            H: <b className="font-semibold text-slate-900 dark:text-white">{toDisplayTemp(weather.tempHigh)}°</b>
          </span>
          <span className="text-slate-300 dark:text-slate-600 select-none">•</span>
          <span>
            L: <b className="font-semibold text-slate-900 dark:text-white">{toDisplayTemp(weather.tempLow)}°</b>
          </span>
        </div>
      </div>

    </div>
  );
}
