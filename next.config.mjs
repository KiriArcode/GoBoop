/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const basePath = isProd ? "/GoBoop" : "";
const assetPrefix = isProd ? "https://kiriarcode.github.io/GoBoop/" : "";
const nextConfig = {
  output: isProd ? "export" : undefined,
  basePath,
  assetPrefix: assetPrefix || undefined,
};

export default nextConfig;
