"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ALL_INDIAN_STATES, getCitiesForState } from "@/lib/indiaLocations";
import Sidebar from "@/components/ui/Sidebar";
import { Building2, ArrowLeft, Plus, MapPin, Clock, DollarSign, Car, Shield } from "lucide-react";

export default function AddParkingLocationPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("Andhra Pradesh");
  const [city, setCity] = useState("Vijayawada");
  const [latitude, setLatitude] = useState(16.5062);
  const [longitude, setLongitude] = useState(80.6480);
  const [totalSlots, setTotalSlots] = useState(20);
  const [pricePerHour, setPricePerHour] = useState(20);
  const [openingTime, setOpeningTime] = useState("06:00");
  const [closingTime, setClosingTime] = useState("23:00");
  const [facilities, setFacilities] = useState("CCTV,Covered Parking,Security Guard,EV Charging");
  const [supportedVehicles, setSupportedVehicles] = useState("Car,Bike,SUV,EV");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=60");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableCities = getCitiesForState(state);

  const handleStateChange = (st: string) => {
    setState(st);
    const cities = getCitiesForState(st);
    if (cities.length > 0) {
      setCity(cities[0]);
    } else {
      setCity("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.post("/parking", {
        name,
        address,
        state,
        city,
        latitude: parseFloat(latitude.toString()),
        longitude: parseFloat(longitude.toString()),
        total_slots: parseInt(totalSlots.toString()),
        price_per_hour: parseInt(pricePerHour.toString()),
        opening_time: openingTime,
        closing_time: closingTime,
        facilities,
        supported_vehicle_types: supportedVehicles,
        description,
        image_url: imageUrl,
      });
      router.push("/manager/parking");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create parking location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="manager" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl">
        
        {/* Back Link */}
        <Link
          href="/manager/parking"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Facilities List
        </Link>

        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-teal-600" />
            Register New Parking Facility
          </h1>
          <p className="text-xs text-slate-500">
            Provide facility metadata, GPS coordinates, operational hours, and initial bay capacity
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Facility Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Benz Circle Multi-level Hub"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">State</label>
              <select
                value={state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none cursor-pointer"
              >
                {ALL_INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none cursor-pointer"
              >
                {availableCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Total Slots (Initial Capacity)</label>
              <input
                type="number"
                required
                min={1}
                max={500}
                value={totalSlots}
                onChange={(e) => setTotalSlots(parseInt(e.target.value))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Street Address</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full landmark, road name, area..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Latitude</label>
              <input
                type="number"
                step="0.0001"
                required
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Longitude</label>
              <input
                type="number"
                step="0.0001"
                required
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Hourly Rate (Credits)</label>
              <input
                type="number"
                required
                min={5}
                max={200}
                value={pricePerHour}
                onChange={(e) => setPricePerHour(parseInt(e.target.value))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Opening Time</label>
              <input
                type="time"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Closing Time</label>
              <input
                type="time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Amenities (Comma separated)</label>
            <input
              type="text"
              value={facilities}
              onChange={(e) => setFacilities(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Cover Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-teal-600 hover:bg-teal-700 py-3.5 text-xs font-black text-white transition shadow-md active:scale-95 disabled:opacity-50"
          >
            {loading ? "Registering Facility..." : "Create Facility & Initialize Slots"}
          </button>
        </form>
      </main>
    </div>
  );
}
