/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    reactStrictMode: true,
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },

    // PWA optimizations
    experimental: {
        optimizePackageImports: ['lucide-react'],
    },

    // Image optimization for PWA icons
    images: {
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },

    // Webpack configuration for PWA
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        // Optimize chunks for PWA
        if (!dev && !isServer) {
            config.optimization.splitChunks.cacheGroups = {
                ...config.optimization.splitChunks.cacheGroups,
                framework: {
                    chunks: 'all',
                    name: 'framework',
                    test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
                    priority: 40,
                    enforce: true,
                },
                lib: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'lib',
                    priority: 30,
                    chunks: 'all',
                },
            };
        }

        return config;
    },
};

export default nextConfig;
