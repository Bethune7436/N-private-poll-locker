"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-400 via-sky-400 to-indigo-500 shadow-lg">
            <Image src="/logo.svg" alt="Logo" width={32} height={32} className="drop-shadow" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-100 sm:text-xl">
              FHE Multi-Choice Voting
            </h1>
            <p className="text-xs text-slate-400 sm:text-sm">
              Confidential ballots, verifiable on-chain results.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              authenticationStatus,
              mounted,
            }) => {
              const ready = mounted && authenticationStatus !== "loading";
              const connected =
                ready &&
                account &&
                chain &&
                (!authenticationStatus || authenticationStatus === "authenticated");

              if (!ready) {
                return (
                  <button
                    type="button"
                    className="rounded-full bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-300"
                    disabled
                    aria-hidden="true"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (!connected) {
                return (
                  <button
                    type="button"
                    onClick={openConnectModal}
                    className="rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500 px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                  >
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    type="button"
                    onClick={openChainModal}
                    className="rounded-full border border-amber-400/60 bg-amber-500/20 px-5 py-2 text-sm font-semibold text-amber-100 transition hover:border-amber-300 hover:bg-amber-500/30"
                  >
                    Wrong Network
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-3">
                  {/* Network Switcher */}
                  <button
                    type="button"
                    onClick={openChainModal}
                    className="flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-500/20 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:border-sky-300 hover:bg-sky-500/30"
                  >
                    {chain.hasIcon && chain.iconUrl && (
                      <img
                        alt={chain.name ?? "Chain icon"}
                        src={chain.iconUrl}
                        className="h-4 w-4"
                      />
                    )}
                    <span>{chain.name}</span>
                  </button>

                  {/* Account Button */}
                  <button
                    type="button"
                    onClick={openAccountModal}
                    className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold text-slate-100 transition hover:border-white/40 hover:bg-white/20"
                  >
                    {account.displayName}
                  </button>
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </header>
  );
}
