"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { MultiChoiceVotingABI } from "@/abi/MultiChoiceVotingABI";
import { useMultiChoiceVoting } from "@/hooks/useMultiChoiceVoting";
import { PollCard } from "./PollCard";

interface PollListProps {
  refreshTrigger?: number;
}

const Spinner = () => (
  <span className="inline-flex h-5 w-5 animate-spin rounded-full border-[3px] border-slate-200/60 border-t-transparent" />
);

type FilterType = "all" | "active" | "ended" | "finalized";

export function PollList({ refreshTrigger }: PollListProps) {
  const [pollIds, setPollIds] = useState<number[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const { contractAddress, chainId } = useMultiChoiceVoting();
  const { isConnected } = useAccount();

  const { data: pollCount, refetch, isError, isLoading, error } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: MultiChoiceVotingABI,
    functionName: "getPollCount",
    query: {
      enabled: Boolean(contractAddress && isConnected),
      refetchInterval: 10000,
    },
  });

  useEffect(() => {
    console.log("[PollList] Debug Info:", {
      isConnected,
      contractAddress,
      chainId,
      pollCount: pollCount ? Number(pollCount) : null,
      isLoading,
      isError,
      error: error?.message,
    });
  }, [isConnected, contractAddress, chainId, pollCount, isLoading, isError, error]);

  useEffect(() => {
    if (pollCount !== undefined) {
      const count = Number(pollCount);
      if (count === 0) {
        setPollIds([]);
      } else {
        const ids = Array.from({ length: count }, (_, i) => count - 1 - i);
        setPollIds(ids);
      }
    }
  }, [pollCount, refreshTrigger]);

  const emptyState = useMemo(() => {
    if (!isConnected) {
      return {
        title: "Wallet not connected",
        description: "Connect to the Localhost or Sepolia network to fetch on-chain polls.",
      };
    }
    if (!contractAddress) {
      return {
        title: "Contract not available",
        description: chainId
          ? `No MultiChoiceVoting contract deployed on chain ID ${chainId}.`
          : "Please switch to a supported network.",
      };
    }
    if (pollIds.length === 0) {
      return {
        title: "No polls yet",
        description: "Be the first to create a poll and kick off a fully encrypted voting round.",
      };
    }
    return null;
  }, [isConnected, contractAddress, chainId, pollIds.length]);

  if (isError) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-rose-500/40 bg-rose-500/10 p-10 text-center backdrop-blur">
        <h3 className="text-lg font-semibold text-rose-100">Failed to load poll list</h3>
        <p className="mt-2 text-sm text-rose-100/80">
          {error?.message ?? "Unknown error. Please try again shortly."}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/20 px-5 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-500/30"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-10 text-slate-200 backdrop-blur">
        <Spinner />
        <span className="text-sm">Fetching poll list...</span>
      </div>
    );
  }

  if (emptyState) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-slate-200 backdrop-blur">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5" />
        <div className="relative space-y-3">
          <h3 className="text-lg font-semibold text-slate-100">{emptyState.title}</h3>
          <p className="text-sm text-slate-300">{emptyState.description}</p>
          {contractAddress && (
            <p className="text-xs text-slate-400">
              Contract: <span className="font-mono">{contractAddress}</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-slate-100">Active polls</h2>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:border-white/40 hover:bg-white/20"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {pollIds.map((id) => (
          <PollCard key={id} pollId={id} />
        ))}
      </div>
    </div>
  );
}

