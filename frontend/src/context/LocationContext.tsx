"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface LocationContextType {
  selectedState: string;
  selectedCity: string;
  setSelectedState: (state: string) => void;
  setSelectedCity: (city: string) => void;
  setLocation: (state: string, city: string) => void;
  displayLocation: string;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [selectedCity, setSelectedCity] = useState<string>("ALL");

  const setLocation = (state: string, city: string) => {
    setSelectedState(state);
    setSelectedCity(city);
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedCity("ALL");
  };

  // Compute display location text for top header
  let displayLocation = "All Locations";
  if (selectedCity !== "ALL" && selectedState !== "ALL") {
    displayLocation = `${selectedCity}, ${selectedState}`;
  } else if (selectedCity !== "ALL") {
    displayLocation = selectedCity;
  } else if (selectedState !== "ALL") {
    displayLocation = selectedState;
  }

  return (
    <LocationContext.Provider
      value={{
        selectedState,
        selectedCity,
        setSelectedState: handleStateChange,
        setSelectedCity,
        setLocation,
        displayLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
