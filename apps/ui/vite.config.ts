/// <reference types="vitest" />

import path from "path"
import react from "@vitejs/plugin-react"
import {defineConfig} from "vite"
import {nodePolyfills} from "vite-plugin-node-polyfills";
import {VitePWA} from "vite-plugin-pwa";

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupTests: './src/setupTests.ts',
        css: false,
        coverage: {
            provider: 'istanbul',
            reporter: ['text', 'lcov'],
            all: true,
            include: ['src/**/*.{ts,tsx}'],
            exclude: ['node_modules', 'tests']
        }
    },
    plugins: [react(), nodePolyfills(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
            manifest: {
                name: 'Sonsenim LMS',
                display: 'standalone',
                orientation: 'portrait',
                short_name: 'Sonsenim',
                icons: [
                    {
                        src: 'pwa-64x64.png',
                        sizes: '64x64',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any'
                    },
                    {
                        src: 'maskable-icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable'
                    }
                ],
            },
        })
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        proxy: {
            '/api': {
                target: "http://localhost:8080/v1",
                changeOrigin: true
            }
        }
    },
})
