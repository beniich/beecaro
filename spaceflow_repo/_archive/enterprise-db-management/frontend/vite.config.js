import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3001,
        // le backend tourne sur 4001 ; Vite proxy les appels /api
        proxy: {
            "/api": {
                target: "http://localhost:4001",
                changeOrigin: true,
                secure: false,
            },
            "/ws": {
                target: "ws://localhost:4001",
                ws: true,
            },
        },
    },
});
