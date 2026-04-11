import React, { useState, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";
import usePlacesAutocomplete from "use-places-autocomplete";

interface DestinationInputProps {
  value: string;
  onChange: (val: string) => void;
  onSelect: (val: string) => void;
  isGoogleEnabled: boolean;
}

export const DestinationInput: React.FC<DestinationInputProps> = ({ 
  value, 
  onChange, 
  onSelect, 
  isGoogleEnabled 
}) => {
  const [nominatimSuggestions, setNominatimSuggestions] = useState<any[]>([]);
  const [isSearchingNominatim, setIsSearchingNominatim] = useState(false);

  // Google Places Autocomplete Hook
  const {
    ready,
    value: inputValue,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    debounce: 300,
    defaultValue: value,
    initOnMount: isGoogleEnabled
  });

  useEffect(() => {
    if (value !== inputValue) {
      setValue(value, false);
    }
  }, [value]);

  // Fallback to Nominatim if Google is not ready, not enabled, or returns no results
  useEffect(() => {
    const triggerNominatim = async () => {
      const shouldFallback = !isGoogleEnabled || !ready || (ready && status !== "OK" && status !== "");
      
      if (shouldFallback && inputValue.length >= 3) {
        setIsSearchingNominatim(true);
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputValue)}&limit=5&addressdetails=1`);
          const results = await response.json();
          
          if (Array.isArray(results)) {
            setNominatimSuggestions(results.map((item: any) => ({
              place_id: item.place_id.toString(),
              description: item.display_name,
              structured_formatting: {
                main_text: item.display_name.split(',')[0],
                secondary_text: item.display_name.split(',').slice(1).join(',').trim()
              }
            })));
          }
        } catch (error) {
          console.error("Nominatim search error:", error);
        } finally {
          setIsSearchingNominatim(false);
        }
      } else if (inputValue.length < 3) {
        setNominatimSuggestions([]);
      }
    };

    const timer = setTimeout(triggerNominatim, 500);
    return () => clearTimeout(timer);
  }, [inputValue, isGoogleEnabled, ready, status]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    onChange(val);
  };

  const handleSelect = (suggestion: any) => () => {
    const { description } = suggestion;
    setValue(description, false);
    onSelect(description);
    clearSuggestions();
    setNominatimSuggestions([]);
  };

  // Prioritize Google data if status is OK, otherwise use Nominatim
  const suggestions = (isGoogleEnabled && ready && status === "OK") ? data : nominatimSuggestions;
  const hasSuggestions = suggestions.length > 0;

  return (
    <div className="relative">
      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FF3D00]" />
      <label htmlFor="endLocation" className="sr-only">Nereye?</label>
      <input
        id="endLocation"
        type="text"
        placeholder="Nereye?"
        value={inputValue}
        onChange={handleInput}
        className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 pl-12 pr-10 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50 transition-all"
      />
      
      {(isSearchingNominatim || (isGoogleEnabled && !ready && inputValue.length > 2)) && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="w-4 h-4 text-[#00E5FF] animate-spin" />
        </div>
      )}

      {/* Autocomplete Suggestions */}
      {hasSuggestions && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-[#1A233A] border border-white/10 rounded-xl overflow-hidden z-[100] shadow-2xl max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => {
            const {
              place_id,
              structured_formatting: { main_text, secondary_text },
            } = suggestion;

            return (
              <button
                key={place_id}
                onClick={handleSelect(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">{main_text}</p>
                    <p className="text-xs text-white/40 truncate">{secondary_text}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
