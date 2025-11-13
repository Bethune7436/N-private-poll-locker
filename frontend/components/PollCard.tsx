"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { MultiChoiceVotingABI } from "@/abi/MultiChoiceVotingABI";
import { useMultiChoiceVoting } from "@/hooks/useMultiChoiceVoting";

interface PollCardProps {
  pollId: number;
}

type FeedbackVariant = "success" | "error" | "info";

interface Feedback {
  variant: FeedbackVariant;
  message: string;
}

const Spinner = ({ className = "h-4 w-4" }: { className?: string }) => (
  <span
    className={`inline-flex ${className} animate-spin rounded-full border-[2px] border-current border-t-transparent`}
  />
);

export function PollCard({ pollId }: PollCardProps) {
  const { address, chain } = useAccount();
  const { vote, requestFinalization, fhevmReady, contractAddress } = useMultiChoiceVoting();

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const {
    data: pollInfo,
    refetch: refetchPollInfo,
    isError,
    error,
    isLoading,
  } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: MultiChoiceVotingABI,
    functionName: "getPollInfo",
    args: [BigInt(pollId)],
    query: {
      enabled: Boolean(contractAddress),
      refetchInterval: 5000,
    },
  });

  const { data: hasVotedData, refetch: refetchHasVoted } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: MultiChoiceVotingABI,
    functionName: "hasUserVoted",
    args: [BigInt(pollId), address as `0x${string}`],
    query: {
      enabled: Boolean(address && contractAddress),
      refetchInterval: 5000,
    },
  });

  const { data: results } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: MultiChoiceVotingABI,
    functionName: "getResults",
    args: [BigInt(pollId)],
    query: {
      enabled: Boolean(contractAddress && pollInfo?.[5] === true),
    },
  });

  useEffect(() => {
    console.log(`[PollCard ${pollId}] Debug:`, {
      contractAddress,
      pollInfoState: pollInfo ? "loaded" : "empty",
      isLoading,
      isError,
      errorMessage: error?.message,
    });
  }, [pollId, contractAddress, pollInfo, isLoading, isError, error]);

  if (isError) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-red-500/40 bg-red-500/10 p-6 backdrop-blur">
        <h3 className="text-base font-semibold text-red-200">Failed to load poll #{pollId}</h3>
        <p className="mt-1 text-sm text-red-100/80">{error?.message ?? "Unknown error"}</p>
        <button
          onClick={() => refetchPollInfo()}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-400/40 bg-red-500/20 px-4 py-2 text-xs font-medium text-red-100 transition hover:bg-red-500/30"
        >
          Try again
        </button>
      </div>
    );
  }

  if (isLoading || !pollInfo) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-200 backdrop-blur">
        <div className="flex items-center gap-3 text-sm">
          <Spinner />
          Loading poll #{pollId}...
        </div>
      </div>
    );
  }

  const [title, options, startTime, endTime, creator, finalized, decryptionPending, voterCount] =
    pollInfo;

  const now = Math.floor(Date.now() / 1000);
  const hasStarted = now >= Number(startTime);
  const hasEnded = now > Number(endTime);
  const hasVoted = Boolean(hasVotedData);
  const canVote = hasStarted && !hasEnded && !finalized && !hasVoted;

  const formatTime = (timestamp: bigint) =>
    new Date(Number(timestamp) * 1000).toLocaleString("en-US", {
      hour12: false,
    });

  const statusBadge = (() => {
    if (finalized) {
      return { label: "Finalized", className: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40" };
    }
    if (decryptionPending) {
      return { label: "Decrypting", className: "bg-amber-400/15 text-amber-200 border-amber-300/40" };
    }
    if (hasEnded) {
      return { label: "Closed", className: "bg-rose-500/15 text-rose-200 border-rose-300/40" };
    }
    if (hasStarted) {
      return { label: "Live", className: "bg-sky-500/15 text-sky-200 border-sky-300/40" };
    }
    return { label: "Upcoming", className: "bg-slate-500/15 text-slate-200 border-slate-300/30" };
  })();

  const resultValues = Array.isArray(results) ? results.map(Number) : [];
  const maxVotes = resultValues.length > 0 ? Math.max(...resultValues, 1) : 1;

  const handleVote = async () => {
    if (selectedOption === null) return;
    try {
      setIsVoting(true);
      setFeedback({
        variant: "info",
        message: "Submitting vote, please confirm in your wallet.",
      });
      await vote(pollId, selectedOption);
      setSelectedOption(null);
      await refetchHasVoted();
      await refetchPollInfo();
      setFeedback({
        variant: "success",
        message: "Vote submitted. Results will update after confirmation.",
      });
    } catch (err: any) {
      console.error("Voting failed:", err);
      setFeedback({
        variant: "error",
        message: err?.message ?? "Vote failed. Please try again.",
      });
    } finally {
      setIsVoting(false);
    }
  };

  const handleFinalize = async () => {
    if (!fhevmReady) {
      setFeedback({
        variant: "info",
        message: "FHE engine is still initialising. Please try again shortly.",
      });
      return;
    }

    try {
      setIsFinalizing(true);
      setFeedback({
        variant: "info",
        message: "Submitting decryption request, please confirm in your wallet.",
      });
      await requestFinalization(pollId);
      await refetchPollInfo();
      setFeedback({
        variant: "success",
        message:
          chain?.id === 31337
            ? "Local auto-decryption completed. Results will refresh shortly."
            : "Decryption request sent. Waiting for the oracle to finish.",
      });
    } catch (err: any) {
      console.error("Finalization failed:", err);
      setFeedback({
        variant: "error",
        message: err?.message ?? "Decryption failed. Please try again.",
      });
    } finally {
      setIsFinalizing(false);
    }
  };

  const feedbackClasses: Record<FeedbackVariant, string> = {
    success: "border-emerald-400/40 bg-emerald-500/10 text-emerald-100",
    error: "border-rose-500/40 bg-rose-500/10 text-rose-100",
    info: "border-sky-400/40 bg-sky-500/10 text-sky-100",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-100 shadow-xl backdrop-blur transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:shadow-emerald-500/10">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-60" />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-300/80">
            Poll #{pollId}
          </div>
          <h3 className="text-xl font-semibold sm:text-2xl">{title}</h3>
          <p className="text-xs text-slate-300">
            Creator: <span className="font-mono text-slate-200">{String(creator)}</span>
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${statusBadge.className}`}
        >
          <span className="text-base">●</span>
          {statusBadge.label}
        </span>
      </div>

      {/* Timeline Info */}
      <div className="mt-6 grid gap-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-widest text-slate-300/70">Start time</span>
          <span className="font-medium">{formatTime(startTime)}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-widest text-slate-300/70">End time</span>
          <span className="font-medium">{formatTime(endTime)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300 sm:col-span-2">
          <span className="rounded-full bg-white/10 px-2 py-1 font-medium text-slate-100">
            Total voters: {String(voterCount)}
          </span>
          {decryptionPending && <span className="text-amber-200">Decryption in progress...</span>}
        </div>
      </div>

      {/* Options / Results */}
      <div className="mt-6 space-y-3">
        {finalized && showResults && results ? (
          (options as string[]).map((option, index) => {
            const count = Number(results[index] ?? 0n);
            const percentage =
              maxVotes > 0 ? Math.round((count / maxVotes) * 100 * 10) / 10 : 0;

            return (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-100"
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  <span className="font-semibold">
                    {count} votes · {percentage}%
                  </span>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-slate-700/50">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500 transition-all"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : canVote ? (
          (options as string[]).map((option, index) => {
            const isSelected = selectedOption === index;
            return (
              <button
                key={index}
                onClick={() => setSelectedOption(index)}
                className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
                  isSelected
                    ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-50 shadow-lg shadow-emerald-500/20"
                    : "border-white/10 bg-white/5 text-slate-200 hover:border-emerald-400/40 hover:bg-emerald-500/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {isSelected && <span className="text-xs uppercase text-emerald-200">Selected</span>}
                </div>
              </button>
            );
          })
        ) : (
          (options as string[]).map((option, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
            >
              {option}
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 space-y-3">
        {feedback && (
          <div
            className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-xs ${feedbackClasses[feedback.variant]}`}
          >
            <span>
              {feedback.variant === "success" ? "✅" : feedback.variant === "error" ? "⚠️" : "ℹ️"}
            </span>
            <span className="leading-5">{feedback.message}</span>
          </div>
        )}

        {canVote && (
          <button
            onClick={handleVote}
            disabled={selectedOption === null || isVoting || !fhevmReady}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:-translate-y-[2px] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
          >
            {isVoting ? (
              <>
                <Spinner className="h-4 w-4 border-slate-900" />
                Submitting...
              </>
            ) : !fhevmReady ? (
              <>
                <Spinner className="h-4 w-4 border-slate-900" />
                FHE engine warming up...
              </>
            ) : (
              "Submit vote"
            )}
          </button>
        )}

        {hasVoted && !finalized && (
          <div className="flex items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-xs font-medium text-emerald-200">
            ✓ Vote recorded
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg border border-slate-600/30 bg-slate-800/30 px-4 py-3 text-sm">
          <span className="text-slate-300">Total voters:</span>
          <span className="font-semibold text-slate-100">{pollInfo?.[7]?.toString() || "0"}</span>
        </div>

        <div className="text-center text-xs text-slate-400">
          Poll #{pollId} • Created by {pollInfo?.[4] ? `${pollInfo[4].slice(0, 6)}...${pollInfo[4].slice(-4)}` : "Unknown"}
        </div>

        {!finalized && (
          <button
            onClick={handleFinalize}
            disabled={isFinalizing || !fhevmReady}
            title={
              fhevmReady
                ? "Trigger auto-decryption (localhost completes instantly)."
                : "The FHE engine is still preparing. Please wait a moment."
            }
            className="flex w-full items-center justify-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/20 px-6 py-3 text-sm font-semibold text-amber-100 transition-all duration-200 hover:border-amber-300/80 hover:bg-amber-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFinalizing ? (
              <>
                <Spinner className="h-4 w-4 border-amber-200" />
                Decrypting...
              </>
            ) : fhevmReady ? (
              "🔓 Decrypt and reveal results"
            ) : (
              "⏳ Waiting for FHE engine"
            )}
          </button>
        )}

        {finalized && (
          <button
            onClick={() => setShowResults((prev) => !prev)}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-6 py-3 text-sm font-semibold text-emerald-100 transition-all duration-200 hover:border-emerald-300/80 hover:bg-emerald-500/30"
          >
            {showResults ? "Hide results" : "📊 Show final results"}
          </button>
        )}
      </div>
    </div>
  );
}

