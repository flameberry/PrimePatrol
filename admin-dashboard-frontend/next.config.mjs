/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
      ignoreBuildErrors: true,
    },
    swcMinify: true,
    async redirects() {
      return [
        {
          source: "/",
          destination: "/dashboard",
          permanent: false,
        },
      ];
    },
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "smartwater-application.s3.us-east-1.amazonaws.com",
        },
      ],
    },
  };
  
  export default nextConfig;
  