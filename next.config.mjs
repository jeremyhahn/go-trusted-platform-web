// next.config.mjs
import bundleAnalyzer from '@next/bundle-analyzer';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enable static export
  images: {
    unoptimized: true, // Disable image optimization if using next/image
  },
  assetPrefix: '/', // Use './' for relative paths in static export
  trailingSlash: true, // Ensure trailing slashes for better static handling
  basePath: '', // Ensure no additional prefixes are applied
  // assetPrefix: process.env.ASSET_PREFIX || '/', // Ensure this starts with a slash or a full URL
  reactStrictMode: true,
};

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);
