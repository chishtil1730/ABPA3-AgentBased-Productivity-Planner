import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            "/faculty-photo": {
                target: "https://vitap-backend.s3.ap-south-1.amazonaws.com",
                changeOrigin: true,
                secure: true,
                rewrite: (path) => path.replace(/^\/faculty-photo/, ""),
            },
        },
    },
});
