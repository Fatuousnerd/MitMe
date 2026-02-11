import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "cdn.discordapp.com",
          port: "",
          // pathname: "/avatars/**",
        },
        {
          protocol: "https",
          hostname: "avatars.githubusercontent.com",
          port: "",
          // pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "lh3.googleusercontent.com",
          port: "",
          // pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "lh3.googleusercontent.com",
          port: "",
          // pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "github.com",
          port: "",
          // pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "cdn.brandfetch.io",
          port: "",
          // pathname: "/**",
        },
      ],
    },
};

export default nextConfig;
