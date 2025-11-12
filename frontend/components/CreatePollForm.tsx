"use client";

import { useState } from "react";
import { useMultiChoiceVoting } from "@/hooks/useMultiChoiceVoting";

export function CreatePollForm({ onSuccess }: { onSuccess?: () => void }) {
  const [title, setTitle] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [duration, setDuration] = useState("3600"); // 1 hour default
  const [error, setError] = useState<string | null>(null);

  const { createPoll, isLoading, isConnected } = useMultiChoiceVoting();

  const handleAddOption = () => {
    if (options.length < 16) {
      setOptions([...options, ""]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isConnected) {
      setError("Please connect your wallet");
      return;
    }

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    const validOptions = options.filter((opt) => opt.trim() !== "");
    if (validOptions.length < 2) {
      setError("At least 2 options are required");
      return;
    }

    try {
      const now = Math.floor(Date.now() / 1000);
      const startTime = now;
      const endTime = now + parseInt(duration);

      await createPoll(title, validOptions, startTime, endTime);
      
      // Reset form
      setTitle("");
      setOptions(["", ""]);
      setDuration("3600");
      
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Failed to create poll:", err);
      setError(err instanceof Error ? err.message : "Failed to create poll");
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/95 p-8 text-slate-900 shadow-2xl backdrop-blur">
      <h2 className="mb-6 text-2xl font-semibold text-slate-900">Create New Poll</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-600">
            Poll Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-300/40 placeholder:text-slate-400"
            placeholder="What is your favorite programming language?"
            maxLength={200}
          />
        </div>

        {/* Options */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-600">
            Options (2-16)
          </label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-300/40 placeholder:text-slate-400"
                  placeholder={`Option ${index + 1}`}
                  maxLength={100}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-500 transition hover:bg-rose-100"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 16 && (
            <button
              type="button"
              onClick={handleAddOption}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
            >
              + Add Option
            </button>
          )}
        </div>

        {/* Duration */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-600">
            Voting Duration
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-300/40"
          >
            <option value="30">🧪 Test: 30 seconds</option>
            <option value="60">🧪 Test: 1 minute</option>
            <option value="300">🧪 Test: 5 minutes</option>
            <option value="3600">1 Hour</option>
            <option value="7200">2 Hours</option>
            <option value="21600">6 Hours</option>
            <option value="43200">12 Hours</option>
            <option value="86400">1 Day</option>
            <option value="259200">3 Days</option>
            <option value="604800">1 Week</option>
          </select>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-500">
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading || !isConnected}
          className="w-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-[2px] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
        >
          {isLoading ? "Creating Poll..." : "Create Poll"}
        </button>
      </form>
    </div>
  );
}
