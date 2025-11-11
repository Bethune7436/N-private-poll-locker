import type { NextConfig } from "next";
import { webpack } from "next/dist/compiled/webpack/webpack";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      path: false,
      os: false,
    };
    
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    // Exclude FHEVM SDK from server-side bundle
    if (isServer) {
      config.externals.push("@zama-fhe/relayer-sdk");
    }
    
    // Add global polyfill for browser
    if (!isServer) {
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"],
        })
      );
      
      config.plugins.push(
        new webpack.DefinePlugin({
          "global": "globalThis",
          "self": "globalThis",
        })
      );
    }
    
    return config;
  },
};

export default nextConfig;

