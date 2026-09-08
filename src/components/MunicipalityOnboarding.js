'use client';

import { useState, useEffect } from 'react';

export default function MunicipalityOnboarding() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const municipalities = [
    'Tagum City, Davao del Norte',
    'Panabo City, Davao del Norte',
    'Island Garden City of Samal, Davao del Norte',
    'Carmen, Davao del Norte',
    'Santo Tomas, Davao del Norte',
    'Asuncion, Davao del Norte',
  ];

  useEffect(() => {
    // Check if municipality is already selected
    const saved = localStorage.getItem('umakonekta_municipality');
    if (!saved) {
      setIsVisible(true);
    }
  }, []);

  const handleSave = () => {
    if (selectedMunicipality) {
      localStorage.setItem('umakonekta_municipality', selectedMunicipality);
      // Dispatch custom event to notify other components of the change
      window.dispatchEvent(new Event('municipality_selected'));
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border-soft">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">location_on</span>
          </div>
          <h2 className="text-2xl font-black text-on-surface tracking-tight mb-2">Welcome to Umakonekta</h2>
          <p className="text-sm text-soil-slate leading-relaxed">
            Please select your municipality to automatically filter the equipment directory. We save this on your device—no GPS tracking required.
          </p>
        </div>

        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {municipalities.map((mun) => (
            <label
              key={mun}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                selectedMunicipality === mun
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border-soft hover:bg-surface-container-low text-soil-slate'
              }`}
            >
              <span className="font-bold">{mun}</span>
              <input
                type="radio"
                name="municipality"
                value={mun}
                checked={selectedMunicipality === mun}
                onChange={(e) => setSelectedMunicipality(e.target.value)}
                className="w-5 h-5 text-primary focus:ring-primary"
              />
            </label>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={!selectedMunicipality}
          className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary-container shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm Location
        </button>
      </div>
    </div>
  );
}
