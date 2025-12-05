"use client";

import { useEffect, useState } from "react";

type HolidayEvent = {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
};

export default function SeasonalEventsManager() {
  const [events, setEvents] = useState<HolidayEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");

  // -----------------------------
  // Load events
  // -----------------------------
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/holiday-events");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load events");
      setEvents(data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // -----------------------------
  // Toggle Active
  // -----------------------------
  const toggleActive = async (ev: HolidayEvent) => {
    try {
      const res = await fetch("/api/holiday-events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: ev.id,
          is_active: !ev.is_active,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      setEvents((prev) =>
        prev.map((e) =>
          e.id === ev.id ? { ...e, is_active: !e.is_active } : e
        )
      );
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    }
  };

  // -----------------------------
  // Create new event
  // -----------------------------
  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim()) return alert("Event name is required");

    try {
      const res = await fetch("/api/holiday-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          start_date: newStart || null,
          end_date: newEnd || null,
          is_active: false,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create event");

      setEvents((prev) => [...prev, data.event]);
      setNewName("");
      setNewStart("");
      setNewEnd("");
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    }
  };

  // -----------------------------
  // Elegant UI (Option C)
  // -----------------------------
  return (
    <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm max-w-3xl">
      <h2 className="text-2xl font-semibold text-blue-600 mb-2">
        Seasonal Events Manager
      </h2>

      {/* Create new event */}
      <form onSubmit={createEvent} className="mb-6 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Event name"
            className="input"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            type="date"
            className="input"
            value={newStart}
            onChange={(e) => setNewStart(e.target.value)}
          />
          <input
            type="date"
            className="input"
            value={newEnd}
            onChange={(e) => setNewEnd(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
        >
          Add Event
        </button>
      </form>

      {/* Event list */}
      {loading ? (
        <p className="text-gray-500">Loading events...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : events.length === 0 ? (
        <p className="text-gray-500">No events defined yet.</p>
      ) : (
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
  {events.map((event) => (
    <div
      key={event.id}
      className={`relative rounded-xl p-5 border bg-white shadow-sm
        transition hover:shadow-md hover:-translate-y-1
        ${event.is_active ? "border-blue-300" : "border-gray-300 opacity-85"}`}
    >
      {/* DELETE BUTTON */}
      <button
        onClick={async () => {
  if (!confirm(`Delete event "${event.name}"?`)) return;

  try {
    const res = await fetch("/api/holiday-events", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: event.id }),
    });

    let data = null;
    try {
      data = await res.json();   // Safe attempt
    } catch (e) {}

    if (!res.ok) {
      throw new Error(data?.error || "Failed to delete");
    }

    setEvents((prev) => prev.filter((e) => e.id !== event.id));
  } catch (err: any) {
    alert(`❌ ${err.message}`);
  }
}}

        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
        title="Delete event"
      >
        🗑️
      </button>

      {/* Top Row */}
      <div className="flex justify-between items-start pr-8">
        <span className="text-3xl select-none">📅</span>

        {/* Toggle */}
        <button
          onClick={() => toggleActive(event)}
          className={`relative inline-flex h-6 w-11 rounded-full transition-colors duration-200
            ${event.is_active ? "bg-blue-600" : "bg-gray-300"}`}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform
              ${event.is_active ? "translate-x-5" : "translate-x-0"}`}
          />
        </button>
      </div>

      {/* Name */}
      <h3 className="mt-3 text-lg font-semibold text-gray-800">
        {event.name}
      </h3>

      {/* Dates */}
      <div className="mt-4 flex items-center gap-4">
  {/* Start date input */}
  <div className="text-center border rounded-lg px-3 py-2 shadow-sm bg-gray-50">
    <div className="text-xs text-gray-500 uppercase">Start</div>
   <input
  type="date"
  defaultValue={event.start_date || ""}
  onChange={(e) =>
    setEvents((prev) =>
      prev.map((x) =>
        x.id === event.id ? { ...x, start_date: e.target.value } : x
      )
    )
  }
  className="mt-1 w-10 text-sm text-gray-800 bg-transparent outline-none border border-gray-300 rounded px-1 py-0.5"
/>
  </div>

  <span className="text-gray-400">—</span>

  {/* End date input */}
  <div className="text-center border rounded-lg px-3 py-2 shadow-sm bg-gray-50">
    <div className="text-xs text-gray-500 uppercase">End</div>
   <input
  type="date"
  defaultValue={event.end_date || ""}
  onChange={(e) =>
    setEvents((prev) =>
      prev.map((x) =>
        x.id === event.id ? { ...x, end_date: e.target.value } : x
      )
    )
  }
  className="mt-1 w-10 text-sm text-gray-800 bg-transparent outline-none border border-gray-300 rounded px-1 py-0.5"
/>

  </div>
</div>


      {/* Status Badge */}
      <div className="mt-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium
            ${
              event.is_active
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-200 text-gray-600"
            }`}
        >
          {event.is_active ? "ACTIVE" : "INACTIVE"}
        </span>
      </div>
	  <div className="mt-3">
  <button
    onClick={async () => {
      try {
        const res = await fetch("/api/holiday-events", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: event.id,
            start_date: event.start_date,
            end_date: event.end_date,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update dates");

        alert("Dates updated!");
      } catch (err: any) {
        alert(`❌ ${err.message}`);
      }
    }}
    className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700"
  >
    Save Dates
  </button>
</div>

    </div>
  ))}
</div>

      )}
    </div>
  );
}
