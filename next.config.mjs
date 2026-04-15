/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
    },
    allowedDevOrigins: ['192.168.1.22','192.168.1.29','127.0.0.1'],

    async headers() {
        return [
            {
                source: '/api/:path*', // dopasowanie wszystkich tras API
                headers: [
                    { key: 'Access-Control-Allow-Origin', value: '*' }, // lub konkretna domena
                    { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
                    { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
                ],
            },
        ];
    }
};

export default nextConfig;
