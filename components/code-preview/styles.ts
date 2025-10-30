export const getPreviewStyles = (previewScopeClass: string, htmlPreviewKey: string, enableTailwind: boolean) => `
                /* Base container styles */
                .${previewScopeClass} {
                    display: flex;
                    width: 100%;
                    height: 100%;
                    box-sizing: border-box;
                    overflow: hidden;
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                    position: relative;
                    isolation: isolate;
                    contain: layout style paint;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                }
                
                .${previewScopeClass} * {
                    box-sizing: border-box;
                }
                
                /* Create a proper viewport container with stacking context */
                .${previewScopeClass} .html-preview-${htmlPreviewKey} {
                    position: relative !important;
                    width: 100% !important;
                    height: 100% !important;
                    overflow: hidden !important;
                    isolation: isolate !important;
                    contain: layout style paint !important;
                }
                
                .${previewScopeClass} .html-preview-${htmlPreviewKey} .preview-viewport {
                    position: relative !important;
                    width: 100% !important;
                    height: 100% !important;
                    overflow: auto !important;
                    transform: translateZ(0) !important;
                    isolation: isolate !important;
                    scroll-behavior: smooth !important;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
                }
                
                .${previewScopeClass} .preview-viewport::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                
                .${previewScopeClass} .preview-viewport::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                .${previewScopeClass} .preview-viewport::-webkit-scrollbar-thumb {
                    background-color: rgba(156, 163, 175, 0.5);
                    border-radius: 4px;
                }
                
                .${previewScopeClass} .preview-viewport::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(156, 163, 175, 0.7);
                }
                
                /* Enhanced fixed positioning handling */
                .${previewScopeClass} .preview-viewport .fixed,
                .${previewScopeClass} .preview-viewport *[class*="fixed"] {
                    position: sticky !important;
                    z-index: 9999 !important;
                }
                
                /* Special handling for top-fixed elements (navbars, headers) */
                .${previewScopeClass} .preview-viewport .fixed.top-0,
                .${previewScopeClass} .preview-viewport *[class*="fixed"][class*="top-0"],
                .${previewScopeClass} .preview-viewport nav.fixed,
                .${previewScopeClass} .preview-viewport header.fixed {
                    position: sticky !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    width: 100% !important;
                    z-index: 10000 !important;
                    backdrop-filter: blur(16px) !important;
                    -webkit-backdrop-filter: blur(16px) !important;
                }
                
                /* Handle bottom-fixed elements */
                .${previewScopeClass} .preview-viewport .fixed.bottom-0,
                .${previewScopeClass} .preview-viewport *[class*="fixed"][class*="bottom-0"] {
                    position: sticky !important;
                    bottom: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    width: 100% !important;
                    z-index: 10000 !important;
                }
                
                /* Handle left/right fixed elements */
                .${previewScopeClass} .preview-viewport .fixed.left-0,
                .${previewScopeClass} .preview-viewport *[class*="fixed"][class*="left-0"] {
                    position: sticky !important;
                    left: 0 !important;
                    top: 0 !important;
                    height: 100vh !important;
                    z-index: 10000 !important;
                }
                
                .${previewScopeClass} .preview-viewport .fixed.right-0,
                .${previewScopeClass} .preview-viewport *[class*="fixed"][class*="right-0"] {
                    position: sticky !important;
                    right: 0 !important;
                    top: 0 !important;
                    height: 100vh !important;
                    z-index: 10000 !important;
                }
                
                /* Ensure full width for navigation elements */
                .${previewScopeClass} .preview-viewport nav,
                .${previewScopeClass} .preview-viewport header {
                    box-sizing: border-box !important;
                    display: block !important;
                }
                
                /* Background color support */
                .${previewScopeClass} .preview-viewport .bg-gray-900 {
                    background-color: #111827 !important;
                }
                
                .${previewScopeClass} .preview-viewport .bg-gray-800 {
                    background-color: #1f2937 !important;
                }
                
                .${previewScopeClass} .preview-viewport .bg-gray-700 {
                    background-color: #374151 !important;
                }
                
                .${previewScopeClass} .preview-viewport .bg-gray-600 {
                    background-color: #4b5563 !important;
                }
                
                .${previewScopeClass} .preview-viewport .bg-gray-500 {
                    background-color: #6b7280 !important;
                }
                
                .${previewScopeClass} .preview-viewport .bg-blue-400 {
                    background-color: #60a5fa !important;
                }
                
                .${previewScopeClass} .preview-viewport .bg-blue-500 {
                    background-color: #3b82f6 !important;
                }
                
                .${previewScopeClass} .preview-viewport .bg-blue-600 {
                    background-color: #2563eb !important;
                }
                
                /* Background opacity support with color mixing */
                .${previewScopeClass} .preview-viewport .bg-gray-900\\/50 {
                    background-color: rgba(17, 24, 39, 0.5) !important;
                }
                
                .${previewScopeClass} .preview-viewport .bg-gray-900\\/80 {
                    background-color: rgba(17, 24, 39, 0.8) !important;
                }
                
                .${previewScopeClass} .preview-viewport .bg-gray-900\\/90 {
                    background-color: rgba(17, 24, 39, 0.9) !important;
                }
                
                .${previewScopeClass} .preview-viewport .bg-gray-900\\/95 {
                    background-color: rgba(17, 24, 39, 0.95) !important;
                }
                
                .${previewScopeClass} .preview-viewport .bg-gray-800\\/50 {
                    background-color: rgba(31, 41, 55, 0.5) !important;
                }
                
                .${previewScopeClass} .preview-viewport .bg-gray-800\\/80 {
                    background-color: rgba(31, 41, 55, 0.8) !important;
                }
                
                /* Text color support */
                .${previewScopeClass} .preview-viewport .text-white {
                    color: #ffffff !important;
                }
                
                .${previewScopeClass} .preview-viewport .text-gray-100 {
                    color: #f3f4f6 !important;
                }
                
                .${previewScopeClass} .preview-viewport .text-gray-200 {
                    color: #e5e7eb !important;
                }
                
                .${previewScopeClass} .preview-viewport .text-gray-300 {
                    color: #d1d5db !important;
                }
                
                .${previewScopeClass} .preview-viewport .text-gray-400 {
                    color: #9ca3af !important;
                }
                
                .${previewScopeClass} .preview-viewport .text-gray-500 {
                    color: #6b7280 !important;
                }
                
                .${previewScopeClass} .preview-viewport .text-blue-400 {
                    color: #60a5fa !important;
                }
                
                .${previewScopeClass} .preview-viewport .text-blue-500 {
                    color: #3b82f6 !important;
                }
                
                .${previewScopeClass} .preview-viewport .text-purple-400 {
                    color: #c084fc !important;
                }
                
                .${previewScopeClass} .preview-viewport .text-purple-500 {
                    color: #a855f7 !important;
                }
                
                /* Border color support */
                .${previewScopeClass} .preview-viewport .border-gray-800 {
                    border-color: #1f2937 !important;
                }
                
                .${previewScopeClass} .preview-viewport .border-gray-700 {
                    border-color: #374151 !important;
                }
                
                .${previewScopeClass} .preview-viewport .border-gray-600 {
                    border-color: #4b5563 !important;
                }
                
                /* Border width and style */
                .${previewScopeClass} .preview-viewport .border {
                    border-width: 1px !important;
                    border-style: solid !important;
                }
                
                .${previewScopeClass} .preview-viewport .border-b {
                    border-bottom-width: 1px !important;
                    border-bottom-style: solid !important;
                }
                
                .${previewScopeClass} .preview-viewport .border-t {
                    border-top-width: 1px !important;
                    border-top-style: solid !important;
                }
                
                .${previewScopeClass} .preview-viewport .border-l {
                    border-left-width: 1px !important;
                    border-left-style: solid !important;
                }
                
                .${previewScopeClass} .preview-viewport .border-r {
                    border-right-width: 1px !important;
                    border-right-style: solid !important;
                }
                
                /* Enhanced backdrop blur and transparency support */
                .${previewScopeClass} .preview-viewport *[class*="backdrop-blur"] {
                    -webkit-backdrop-filter: blur(16px) !important;
                    backdrop-filter: blur(16px) !important;
                }
                
                .${previewScopeClass} .preview-viewport *[class*="backdrop-blur-sm"] {
                    -webkit-backdrop-filter: blur(4px) !important;
                    backdrop-filter: blur(4px) !important;
                }
                
                .${previewScopeClass} .preview-viewport *[class*="backdrop-blur-md"] {
                    -webkit-backdrop-filter: blur(12px) !important;
                    backdrop-filter: blur(12px) !important;
                }
                
                .${previewScopeClass} .preview-viewport *[class*="backdrop-blur-lg"] {
                    -webkit-backdrop-filter: blur(16px) !important;
                    backdrop-filter: blur(16px) !important;
                }
                
                .${previewScopeClass} .preview-viewport *[class*="backdrop-blur-xl"] {
                    -webkit-backdrop-filter: blur(24px) !important;
                    backdrop-filter: blur(24px) !important;
                }
                
                /* Enhanced gradient text handling */
                .${previewScopeClass} .preview-viewport *[class*="text-transparent"][class*="bg-gradient"] {
                    background-clip: text !important;
                    -webkit-background-clip: text !important;
                    color: transparent !important;
                }
                
                .${previewScopeClass} .preview-viewport *[class*="bg-clip-text"] {
                    background-clip: text !important;
                    -webkit-background-clip: text !important;
                    color: transparent !important;
                }
                
                /* Comprehensive gradient direction support */
                .${previewScopeClass} .preview-viewport *[class*="bg-gradient-to-r"] {
                    background-image: linear-gradient(to right, var(--tw-gradient-stops, #3b82f6, #8b5cf6)) !important;
                }
                
                .${previewScopeClass} .preview-viewport *[class*="bg-gradient-to-l"] {
                    background-image: linear-gradient(to left, var(--tw-gradient-stops, #3b82f6, #8b5cf6)) !important;
                }
                
                .${previewScopeClass} .preview-viewport *[class*="bg-gradient-to-t"] {
                    background-image: linear-gradient(to top, var(--tw-gradient-stops, #3b82f6, #8b5cf6)) !important;
                }
                
                .${previewScopeClass} .preview-viewport *[class*="bg-gradient-to-b"] {
                    background-image: linear-gradient(to bottom, var(--tw-gradient-stops, #3b82f6, #8b5cf6)) !important;
                }
                
                .${previewScopeClass} .preview-viewport *[class*="bg-gradient-to-tr"] {
                    background-image: linear-gradient(to top right, var(--tw-gradient-stops, #3b82f6, #8b5cf6)) !important;
                }
                
                .${previewScopeClass} .preview-viewport *[class*="bg-gradient-to-tl"] {
                    background-image: linear-gradient(to top left, var(--tw-gradient-stops, #3b82f6, #8b5cf6)) !important;
                }
                
                .${previewScopeClass} .preview-viewport *[class*="bg-gradient-to-br"] {
                    background-image: linear-gradient(to bottom right, var(--tw-gradient-stops, #3b82f6, #8b5cf6)) !important;
                }
                
                .${previewScopeClass} .preview-viewport *[class*="bg-gradient-to-bl"] {
                    background-image: linear-gradient(to bottom left, var(--tw-gradient-stops, #3b82f6, #8b5cf6)) !important;
                }                
                
                /* Interactive elements support - Critical for mobile menus */
                .${previewScopeClass} .preview-viewport input[type="checkbox"] {
                    appearance: none;
                    -webkit-appearance: none;
                }
                
                /* Peer selector support for interactive elements */
                .${previewScopeClass} .preview-viewport .peer:checked ~ .peer-checked\\:opacity-100 {
                    opacity: 1 !important;
                }
                
                .${previewScopeClass} .preview-viewport .peer:checked ~ .peer-checked\\:visible {
                    visibility: visible !important;
                }
                
                .${previewScopeClass} .preview-viewport .peer:checked ~ .peer-checked\\:translate-y-0 {
                    transform: translateY(0) !important;
                }
                
                .${previewScopeClass} .preview-viewport .peer:checked ~ *[class*="peer-checked:opacity-100"] {
                    opacity: 1 !important;
                }
                
                .${previewScopeClass} .preview-viewport .peer:checked ~ *[class*="peer-checked:visible"] {
                    visibility: visible !important;
                }
                
                .${previewScopeClass} .preview-viewport .peer:checked ~ *[class*="peer-checked:translate-y-0"] {
                    transform: translateY(0) !important;
                }
                
                /* Comprehensive hover effects support */
                .${previewScopeClass} .preview-viewport .hover\\:bg-gray-100:hover {
                    background-color: #f3f4f6 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-gray-200:hover {
                    background-color: #e5e7eb !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-gray-300:hover {
                    background-color: #d1d5db !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-gray-400:hover {
                    background-color: #9ca3af !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-gray-500:hover {
                    background-color: #6b7280 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-gray-600:hover {
                    background-color: #4b5563 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-gray-700:hover {
                    background-color: #374151 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-gray-800:hover {
                    background-color: #1f2937 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-gray-900:hover {
                    background-color: #111827 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-blue-100:hover {
                    background-color: #dbeafe !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-blue-200:hover {
                    background-color: #bfdbfe !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-blue-300:hover {
                    background-color: #93c5fd !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-blue-400:hover {
                    background-color: #60a5fa !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-blue-500:hover {
                    background-color: #3b82f6 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-blue-600:hover {
                    background-color: #2563eb !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-blue-700:hover {
                    background-color: #1d4ed8 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-blue-800:hover {
                    background-color: #1e40af !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-blue-900:hover {
                    background-color: #1e3a8a !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-indigo-100:hover {
                    background-color: #e0e7ff !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-indigo-200:hover {
                    background-color: #c7d2fe !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-indigo-300:hover {
                    background-color: #a5b4fc !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-indigo-400:hover {
                    background-color: #818cf8 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-indigo-500:hover {
                    background-color: #6366f1 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-indigo-600:hover {
                    background-color: #4f46e5 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-indigo-700:hover {
                    background-color: #4338ca !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-indigo-800:hover {
                    background-color: #3730a3 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-indigo-900:hover {
                    background-color: #312e81 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-purple-100:hover {
                    background-color: #f3e8ff !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-purple-200:hover {
                    background-color: #e9d5ff !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-purple-300:hover {
                    background-color: #d8b4fe !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-purple-400:hover {
                    background-color: #c084fc !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-purple-500:hover {
                    background-color: #a855f7 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-purple-600:hover {
                    background-color: #9333ea !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-purple-700:hover {
                    background-color: #7e22ce !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-purple-800:hover {
                    background-color: #6b21a8 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-purple-900:hover {
                    background-color: #581c87 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-pink-100:hover {
                    background-color: #fce7f3 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-pink-200:hover {
                    background-color: #fbcfe8 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-pink-300:hover {
                    background-color: #f9a8d4 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-pink-400:hover {
                    background-color: #f472b6 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-pink-500:hover {
                    background-color: #ec4899 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-pink-600:hover {
                    background-color: #db2777 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-pink-700:hover {
                    background-color: #be185d !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-pink-800:hover {
                    background-color: #9d174d !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-pink-900:hover {
                    background-color: #831843 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-red-100:hover {
                    background-color: #fee2e2 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-red-200:hover {
                    background-color: #fecaca !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-red-300:hover {
                    background-color: #fca5a5 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-red-400:hover {
                    background-color: #f87171 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-red-500:hover {
                    background-color: #ef4444 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-red-600:hover {
                    background-color: #dc2626 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-red-700:hover {
                    background-color: #b91c1c !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-red-800:hover {
                    background-color: #991b1b !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-red-900:hover {
                    background-color: #7f1d1d !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-orange-100:hover {
                    background-color: #ffedd5 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-orange-200:hover {
                    background-color: #fed7aa !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-orange-300:hover {
                    background-color: #fdba74 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-orange-400:hover {
                    background-color: #fb923c !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-orange-500:hover {
                    background-color: #f97316 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-orange-600:hover {
                    background-color: #ea580c !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-orange-700:hover {
                    background-color: #c2410c !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-orange-800:hover {
                    background-color: #9a3412 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-orange-900:hover {
                    background-color: #7c2d12 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-yellow-100:hover {
                    background-color: #fef3c7 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-yellow-200:hover {
                    background-color: #fde68a !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-yellow-300:hover {
                    background-color: #fcd34d !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-yellow-400:hover {
                    background-color: #fbbf24 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-yellow-500:hover {
                    background-color: #f59e0b !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-yellow-600:hover {
                    background-color: #d97706 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-yellow-700:hover {
                    background-color: #b45309 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-yellow-800:hover {
                    background-color: #92400e !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-yellow-900:hover {
                    background-color: #78350f !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-green-100:hover {
                    background-color: #dcfce7 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-green-200:hover {
                    background-color: #bbf7d0 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-green-300:hover {
                    background-color: #86efac !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-green-400:hover {
                    background-color: #4ade80 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-green-500:hover {
                    background-color: #22c55e !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-green-600:hover {
                    background-color: #16a34a !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-green-700:hover {
                    background-color: #15803d !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-green-800:hover {
                    background-color: #166534 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-green-900:hover {
                    background-color: #14532d !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-teal-100:hover {
                    background-color: #ccfbf1 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-teal-200:hover {
                    background-color: #99f6e4 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-teal-300:hover {
                    background-color: #5eead4 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-teal-400:hover {
                    background-color: #2dd4bf !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-teal-500:hover {
                    background-color: #14b8a6 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-teal-600:hover {
                    background-color: #0d9488 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-teal-700:hover {
                    background-color: #0f766e !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-teal-800:hover {
                    background-color: #115e59 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-teal-900:hover {
                    background-color: #134e4a !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-cyan-100:hover {
                    background-color: #cffafe !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-cyan-200:hover {
                    background-color: #a5f3fc !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-cyan-300:hover {
                    background-color: #67e8f9 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-cyan-400:hover {
                    background-color: #22d3ee !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-cyan-500:hover {
                    background-color: #06b6d4 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-cyan-600:hover {
                    background-color: #0891b2 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-cyan-700:hover {
                    background-color: #0e7490 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-cyan-800:hover {
                    background-color: #155e75 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:bg-cyan-900:hover {
                    background-color: #164e63 !important;
                }
                
                /* Text hover colors */
                .${previewScopeClass} .preview-viewport .hover\\:text-white:hover {
                    color: #ffffff !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-gray-100:hover {
                    color: #f3f4f6 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-gray-200:hover {
                    color: #e5e7eb !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-gray-300:hover {
                    color: #d1d5db !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-gray-400:hover {
                    color: #9ca3af !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-gray-500:hover {
                    color: #6b7280 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-gray-600:hover {
                    color: #4b5563 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-gray-700:hover {
                    color: #374151 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-gray-800:hover {
                    color: #1f2937 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-gray-900:hover {
                    color: #111827 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-blue-100:hover {
                    color: #dbeafe !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-blue-200:hover {
                    color: #bfdbfe !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-blue-300:hover {
                    color: #93c5fd !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-blue-400:hover {
                    color: #60a5fa !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-blue-500:hover {
                    color: #3b82f6 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-blue-600:hover {
                    color: #2563eb !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-blue-700:hover {
                    color: #1d4ed8 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-blue-800:hover {
                    color: #1e40af !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-blue-900:hover {
                    color: #1e3a8a !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-indigo-100:hover {
                    color: #e0e7ff !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-indigo-200:hover {
                    color: #c7d2fe !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-indigo-300:hover {
                    color: #a5b4fc !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-indigo-400:hover {
                    color: #818cf8 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-indigo-500:hover {
                    color: #6366f1 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-indigo-600:hover {
                    color: #4f46e5 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-indigo-700:hover {
                    color: #4338ca !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-indigo-800:hover {
                    color: #3730a3 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-indigo-900:hover {
                    color: #312e81 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-purple-100:hover {
                    color: #f3e8ff !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-purple-200:hover {
                    color: #e9d5ff !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-purple-300:hover {
                    color: #d8b4fe !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-purple-400:hover {
                    color: #c084fc !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-purple-500:hover {
                    color: #a855f7 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-purple-600:hover {
                    color: #9333ea !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-purple-700:hover {
                    color: #7e22ce !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-purple-800:hover {
                    color: #6b21a8 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-purple-900:hover {
                    color: #581c87 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-pink-100:hover {
                    color: #fce7f3 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-pink-200:hover {
                    color: #fbcfe8 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-pink-300:hover {
                    color: #f9a8d4 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-pink-400:hover {
                    color: #f472b6 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-pink-500:hover {
                    color: #ec4899 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-pink-600:hover {
                    color: #db2777 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-pink-700:hover {
                    color: #be185d !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-pink-800:hover {
                    color: #9d174d !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-pink-900:hover {
                    color: #831843 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-red-100:hover {
                    color: #fee2e2 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-red-200:hover {
                    color: #fecaca !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-red-300:hover {
                    color: #fca5a5 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-red-400:hover {
                    color: #f87171 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-red-500:hover {
                    color: #ef4444 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-red-600:hover {
                    color: #dc2626 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-red-700:hover {
                    color: #b91c1c !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-red-800:hover {
                    color: #991b1b !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-red-900:hover {
                    color: #7f1d1d !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-orange-100:hover {
                    color: #ffedd5 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-orange-200:hover {
                    color: #fed7aa !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-orange-300:hover {
                    color: #fdba74 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-orange-400:hover {
                    color: #fb923c !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-orange-500:hover {
                    color: #f97316 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-orange-600:hover {
                    color: #ea580c !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-orange-700:hover {
                    color: #c2410c !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-orange-800:hover {
                    color: #9a3412 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-orange-900:hover {
                    color: #7c2d12 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-yellow-100:hover {
                    color: #fef3c7 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-yellow-200:hover {
                    color: #fde68a !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-yellow-300:hover {
                    color: #fcd34d !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-yellow-400:hover {
                    color: #fbbf24 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-yellow-500:hover {
                    color: #f59e0b !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-yellow-600:hover {
                    color: #d97706 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-yellow-700:hover {
                    color: #b45309 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-yellow-800:hover {
                    color: #92400e !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-yellow-900:hover {
                    color: #78350f !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-green-100:hover {
                    color: #dcfce7 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-green-200:hover {
                    color: #bbf7d0 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-green-300:hover {
                    color: #86efac !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-green-400:hover {
                    color: #4ade80 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-green-500:hover {
                    color: #22c55e !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-green-600:hover {
                    color: #16a34a !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-green-700:hover {
                    color: #15803d !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-green-800:hover {
                    color: #166534 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-green-900:hover {
                    color: #14532d !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-teal-100:hover {
                    color: #ccfbf1 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-teal-200:hover {
                    color: #99f6e4 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-teal-300:hover {
                    color: #5eead4 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-teal-400:hover {
                    color: #2dd4bf !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-teal-500:hover {
                    color: #14b8a6 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-teal-600:hover {
                    color: #0d9488 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-teal-700:hover {
                    color: #0f766e !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-teal-800:hover {
                    color: #115e59 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-teal-900:hover {
                    color: #134e4a !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-cyan-100:hover {
                    color: #cffafe !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-cyan-200:hover {
                    color: #a5f3fc !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-cyan-300:hover {
                    color: #67e8f9 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-cyan-400:hover {
                    color: #22d3ee !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-cyan-500:hover {
                    color: #06b6d4 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-cyan-600:hover {
                    color: #0891b2 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-cyan-700:hover {
                    color: #0e7490 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-cyan-800:hover {
                    color: #155e75 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:text-cyan-900:hover {
                    color: #164e63 !important;
                }
                
                /* Border hover colors */
                .${previewScopeClass} .preview-viewport .hover\\:border-gray-100:hover {
                    border-color: #f3f4f6 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-gray-200:hover {
                    border-color: #e5e7eb !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-gray-300:hover {
                    border-color: #d1d5db !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-gray-400:hover {
                    border-color: #9ca3af !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-gray-500:hover {
                    border-color: #6b7280 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-gray-600:hover {
                    border-color: #4b5563 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-gray-700:hover {
                    border-color: #374151 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-gray-800:hover {
                    border-color: #1f2937 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-gray-900:hover {
                    border-color: #111827 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-blue-100:hover {
                    border-color: #dbeafe !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-blue-200:hover {
                    border-color: #bfdbfe !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-blue-300:hover {
                    border-color: #93c5fd !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-blue-400:hover {
                    border-color: #60a5fa !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-blue-500:hover {
                    border-color: #3b82f6 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-blue-600:hover {
                    border-color: #2563eb !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-blue-700:hover {
                    border-color: #1d4ed8 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-blue-800:hover {
                    border-color: #1e40af !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-blue-900:hover {
                    border-color: #1e3a8a !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-indigo-100:hover {
                    border-color: #e0e7ff !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-indigo-200:hover {
                    border-color: #c7d2fe !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-indigo-300:hover {
                    border-color: #a5b4fc !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-indigo-400:hover {
                    border-color: #818cf8 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-indigo-500:hover {
                    border-color: #6366f1 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-indigo-600:hover {
                    border-color: #4f46e5 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-indigo-700:hover {
                    border-color: #4338ca !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-indigo-800:hover {
                    border-color: #3730a3 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-indigo-900:hover {
                    border-color: #312e81 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-purple-100:hover {
                    border-color: #f3e8ff !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-purple-200:hover {
                    border-color: #e9d5ff !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-purple-300:hover {
                    border-color: #d8b4fe !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-purple-400:hover {
                    border-color: #c084fc !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-purple-500:hover {
                    border-color: #a855f7 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-purple-600:hover {
                    border-color: #9333ea !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-purple-700:hover {
                    border-color: #7e22ce !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-purple-800:hover {
                    border-color: #6b21a8 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-purple-900:hover {
                    border-color: #581c87 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-pink-100:hover {
                    border-color: #fce7f3 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-pink-200:hover {
                    border-color: #fbcfe8 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-pink-300:hover {
                    border-color: #f9a8d4 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-pink-400:hover {
                    border-color: #f472b6 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-pink-500:hover {
                    border-color: #ec4899 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-pink-600:hover {
                    border-color: #db2777 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-pink-700:hover {
                    border-color: #be185d !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-pink-800:hover {
                    border-color: #9d174d !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-pink-900:hover {
                    border-color: #831843 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-red-100:hover {
                    border-color: #fee2e2 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-red-200:hover {
                    border-color: #fecaca !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-red-300:hover {
                    border-color: #fca5a5 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-red-400:hover {
                    border-color: #f87171 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-red-500:hover {
                    border-color: #ef4444 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-red-600:hover {
                    border-color: #dc2626 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-red-700:hover {
                    border-color: #b91c1c !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-red-800:hover {
                    border-color: #991b1b !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-red-900:hover {
                    border-color: #7f1d1d !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-orange-100:hover {
                    border-color: #ffedd5 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-orange-200:hover {
                    border-color: #fed7aa !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-orange-300:hover {
                    border-color: #fdba74 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-orange-400:hover {
                    border-color: #fb923c !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-orange-500:hover {
                    border-color: #f97316 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-orange-600:hover {
                    border-color: #ea580c !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-orange-700:hover {
                    border-color: #c2410c !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-orange-800:hover {
                    border-color: #9a3412 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-orange-900:hover {
                    border-color: #7c2d12 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-yellow-100:hover {
                    border-color: #fef3c7 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-yellow-200:hover {
                    border-color: #fde68a !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-yellow-300:hover {
                    border-color: #fcd34d !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-yellow-400:hover {
                    border-color: #fbbf24 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-yellow-500:hover {
                    border-color: #f59e0b !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-yellow-600:hover {
                    border-color: #d97706 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-yellow-700:hover {
                    border-color: #b45309 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-yellow-800:hover {
                    border-color: #92400e !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-yellow-900:hover {
                    border-color: #78350f !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-green-100:hover {
                    border-color: #dcfce7 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-green-200:hover {
                    border-color: #bbf7d0 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-green-300:hover {
                    border-color: #86efac !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-green-400:hover {
                    border-color: #4ade80 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-green-500:hover {
                    border-color: #22c55e !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-green-600:hover {
                    border-color: #16a34a !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-green-700:hover {
                    border-color: #15803d !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-green-800:hover {
                    border-color: #166534 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-green-900:hover {
                    border-color: #14532d !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-teal-100:hover {
                    border-color: #ccfbf1 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-teal-200:hover {
                    border-color: #99f6e4 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-teal-300:hover {
                    border-color: #5eead4 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-teal-400:hover {
                    border-color: #2dd4bf !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-teal-500:hover {
                    border-color: #14b8a6 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-teal-600:hover {
                    border-color: #0d9488 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-teal-700:hover {
                    border-color: #0f766e !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-teal-800:hover {
                    border-color: #115e59 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-teal-900:hover {
                    border-color: #134e4a !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-cyan-100:hover {
                    border-color: #cffafe !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-cyan-200:hover {
                    border-color: #a5f3fc !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-cyan-300:hover {
                    border-color: #67e8f9 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-cyan-400:hover {
                    border-color: #22d3ee !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-cyan-500:hover {
                    border-color: #06b6d4 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-cyan-600:hover {
                    border-color: #0891b2 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-cyan-700:hover {
                    border-color: #0e7490 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-cyan-800:hover {
                    border-color: #155e75 !important;
                }
                
                .${previewScopeClass} .preview-viewport .hover\\:border-cyan-900:hover {
                    border-color: #164e63 !important;
                }
                
                /* Focus states */
                .${previewScopeClass} .preview-viewport .focus\\:ring-2:focus {
                    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5) !important;
                }
                
                .${previewScopeClass} .preview-viewport .focus\\:ring-blue-500:focus {
                    --tw-ring-color: #3b82f6 !important;
                }
                
                .${previewScopeClass} .preview-viewport .focus\\:ring-offset-2:focus {
                    --tw-ring-offset-width: 2px !important;
                }
                
                .${previewScopeClass} .preview-viewport .focus\\:outline-none:focus {
                    outline: 2px solid transparent !important;
                    outline-offset: 2px !important;
                }
                
                /* Active states */
                .${previewScopeClass} .preview-viewport .active\\:bg-blue-600:active {
                    background-color: #2563eb !important;
                }
                
                .${previewScopeClass} .preview-viewport .active\\:scale-95:active {
                    transform: scale(0.95) !important;
                }
                
                /* Disabled states */
                .${previewScopeClass} .preview-viewport .disabled\\:opacity-50:disabled {
                    opacity: 0.5 !important;
                }
                
                .${previewScopeClass} .preview-viewport .disabled\\:cursor-not-allowed:disabled {
                    cursor: not-allowed !important;
                }
                
                /* Group hover */
                .${previewScopeClass} .preview-viewport .group:hover .group-hover\\:opacity-100 {
                    opacity: 1 !important;
                }
                
                .${previewScopeClass} .preview-viewport .group:hover .group-hover\\:bg-gray-100 {
                    background-color: #f3f4f6 !important;
                }
                
                /* Transition support */
                .${previewScopeClass} .preview-viewport *[class*="transition-colors"] {
                    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke !important;
                }
                
                .${previewScopeClass} .preview-viewport *[class*="transition-all"] {
                    transition-property: all !important;
                }
                
                .${previewScopeClass} .preview-viewport *[class*="duration-300"] {
                    transition-duration: 300ms !important;
                }
                
                .${previewScopeClass} .preview-viewport *[class*="duration-200"] {
                    transition-duration: 200ms !important;
                }
                
                .${previewScopeClass} .preview-viewport *[class*="duration-500"] {
                    transition-duration: 500ms !important;
                }
                
                /* Transform support */
                .${previewScopeClass} .preview-viewport *[class*="translate-y-2"] {
                    transform: translateY(0.5rem) !important;
                }
                
                .${previewScopeClass} .preview-viewport *[class*="translate-y-0"] {
                    transform: translateY(0) !important;
                }
                
                .${previewScopeClass} .preview-viewport *[class*="translate-x-"] {
                    transform: var(--tw-transform, translateX(0)) !important;
                }
                
                /* Opacity classes */
                .${previewScopeClass} .preview-viewport .opacity-0 {
                    opacity: 0 !important;
                }
                
                .${previewScopeClass} .preview-viewport .opacity-100 {
                    opacity: 1 !important;
                }
                
                .${previewScopeClass} .preview-viewport .opacity-50 {
                    opacity: 0.5 !important;
                }
                
                .${previewScopeClass} .preview-viewport .opacity-75 {
                    opacity: 0.75 !important;
                }
                
                .${previewScopeClass} .preview-viewport .opacity-90 {
                    opacity: 0.9 !important;
                }
                
                .${previewScopeClass} .preview-viewport .opacity-95 {
                    opacity: 0.95 !important;
                }
                
                /* Visibility classes */
                .${previewScopeClass} .preview-viewport .invisible {
                    visibility: hidden !important;
                }
                
                .${previewScopeClass} .preview-viewport .visible {
                    visibility: visible !important;
                }
                
                /* Container-based responsive design instead of viewport-based */
                /* This uses container width instead of screen width for responsive breakpoints */
                
                /* Base container setup for width-based responsiveness */
                .${previewScopeClass} .preview-viewport {
                    position: relative !important;
                    width: 100% !important;
                    height: 100% !important;
                    overflow: auto !important;
                    transform: translateZ(0) !important;
                    isolation: isolate !important;
                    scroll-behavior: smooth !important;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
                    container-type: inline-size !important;
                    container-name: preview-container !important;
                }
                
                /* Container query support for modern browsers */
                @container preview-container (min-width: 640px) {
                    .${previewScopeClass} .preview-viewport .sm\\:px-6 {
                        padding-left: 1.5rem !important;
                        padding-right: 1.5rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .sm\\:text-2xl {
                        font-size: 1.5rem !important;
                        line-height: 2rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .sm\\:block {
                        display: block !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .sm\\:hidden {
                        display: none !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .sm\\:flex {
                        display: flex !important;
                    }
                }
                
                @container preview-container (min-width: 768px) {
                    .${previewScopeClass} .preview-viewport .hidden.md\\:flex {
                        display: flex !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .md\\:hidden {
                        display: none !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .md\\:block {
                        display: block !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .md\\:inline-block {
                        display: inline-block !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .md\\:px-8 {
                        padding-left: 2rem !important;
                        padding-right: 2rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .md\\:py-6 {
                        padding-top: 1.5rem !important;
                        padding-bottom: 1.5rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .md\\:text-lg {
                        font-size: 1.125rem !important;
                        line-height: 1.75rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .md\\:text-xl {
                        font-size: 1.25rem !important;
                        line-height: 1.75rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .md\\:w-auto {
                        width: auto !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .md\\:max-w-md {
                        max-width: 28rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .md\\:max-w-lg {
                        max-width: 32rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .md\\:max-w-xl {
                        max-width: 36rem !important;
                    }
                }
                
                @container preview-container (min-width: 1024px) {
                    .${previewScopeClass} .preview-viewport .lg\\:space-x-8 > * + * {
                        margin-left: 2rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .lg\\:text-base {
                        font-size: 1rem !important;
                        line-height: 1.5rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .lg\\:text-lg {
                        font-size: 1.125rem !important;
                        line-height: 1.75rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .lg\\:text-xl {
                        font-size: 1.25rem !important;
                        line-height: 1.75rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .lg\\:px-8 {
                        padding-left: 2rem !important;
                        padding-right: 2rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .lg\\:py-8 {
                        padding-top: 2rem !important;
                        padding-bottom: 2rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .lg\\:hidden {
                        display: none !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .lg\\:block {
                        display: block !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .lg\\:flex {
                        display: flex !important;
                    }
                }
                
                @container preview-container (min-width: 1280px) {
                    .${previewScopeClass} .preview-viewport .xl\\:text-lg {
                        font-size: 1.125rem !important;
                        line-height: 1.75rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .xl\\:text-xl {
                        font-size: 1.25rem !important;
                        line-height: 1.75rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .xl\\:px-12 {
                        padding-left: 3rem !important;
                        padding-right: 3rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .xl\\:py-12 {
                        padding-top: 3rem !important;
                        padding-bottom: 3rem !important;
                    }
                }
                
                @container preview-container (min-width: 1536px) {
                    .${previewScopeClass} .preview-viewport .2xl\\:text-xl {
                        font-size: 1.25rem !important;
                        line-height: 1.75rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .2xl\\:text-2xl {
                        font-size: 1.5rem !important;
                        line-height: 2rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .2xl\\:px-16 {
                        padding-left: 4rem !important;
                        padding-right: 4rem !important;
                    }
                }
                
                /* Fallback for browsers that don't support container queries */
                /* Use element width detection with resize observer simulation */
                .${previewScopeClass} .preview-viewport[data-container-width="sm"] .sm\\:px-6 {
                    padding-left: 1.5rem !important;
                    padding-right: 1.5rem !important;
                }
                
                .${previewScopeClass} .preview-viewport[data-container-width="sm"] .sm\\:text-2xl,
                .${previewScopeClass} .preview-viewport[data-container-width="md"] .sm\\:text-2xl,
                .${previewScopeClass} .preview-viewport[data-container-width="lg"] .sm\\:text-2xl,
                .${previewScopeClass} .preview-viewport[data-container-width="xl"] .sm\\:text-2xl,
                .${previewScopeClass} .preview-viewport[data-container-width="2xl"] .sm\\:text-2xl {
                    font-size: 1.5rem !important;
                    line-height: 2rem !important;
                }
                
                .${previewScopeClass} .preview-viewport[data-container-width="md"] .hidden.md\\:flex,
                .${previewScopeClass} .preview-viewport[data-container-width="lg"] .hidden.md\\:flex,
                .${previewScopeClass} .preview-viewport[data-container-width="xl"] .hidden.md\\:flex,
                .${previewScopeClass} .preview-viewport[data-container-width="2xl"] .hidden.md\\:flex {
                    display: flex !important;
                }
                
                .${previewScopeClass} .preview-viewport[data-container-width="md"] .md\\:hidden,
                .${previewScopeClass} .preview-viewport[data-container-width="lg"] .md\\:hidden,
                .${previewScopeClass} .preview-viewport[data-container-width="xl"] .md\\:hidden,
                .${previewScopeClass} .preview-viewport[data-container-width="2xl"] .md\\:hidden {
                    display: none !important;
                }
                
                .${previewScopeClass} .preview-viewport[data-container-width="lg"] .lg\\:space-x-8 > * + *,
                .${previewScopeClass} .preview-viewport[data-container-width="xl"] .lg\\:space-x-8 > * + *,
                .${previewScopeClass} .preview-viewport[data-container-width="2xl"] .lg\\:space-x-8 > * + * {
                    margin-left: 2rem !important;
                }
                
                .${previewScopeClass} .preview-viewport[data-container-width="lg"] .lg\\:text-base,
                .${previewScopeClass} .preview-viewport[data-container-width="xl"] .lg\\:text-base,
                .${previewScopeClass} .preview-viewport[data-container-width="2xl"] .lg\\:text-base {
                    font-size: 1rem !important;
                    line-height: 1.5rem !important;
                }
                
                /* Comprehensive responsive breakpoint support - Container-based */
                
                /* Small devices (container width: 640px and up) */
                @media (min-width: 640px) {
                    .${previewScopeClass} .preview-viewport .sm\\:px-6 {
                        padding-left: 1.5rem !important;
                        padding-right: 1.5rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .sm\\:text-2xl {
                        font-size: 1.5rem !important;
                        line-height: 2rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .sm\\:block {
                        display: block !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .sm\\:hidden {
                        display: none !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .sm\\:flex {
                        display: flex !important;
                    }
                }
                
                /* Medium devices (md: 768px and up) */
                @media (min-width: 768px) {
                    .${previewScopeClass} .preview-viewport .hidden.md\\:flex {
                        display: flex !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .md\\:hidden {
                        display: none !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .md\\:block {
                        display: block !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .md\\:inline-block {
                        display: inline-block !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .md\\:px-8 {
                        padding-left: 2rem !important;
                        padding-right: 2rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .md\\:py-6 {
                        padding-top: 1.5rem !important;
                        padding-bottom: 1.5rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .md\\:text-lg {
                        font-size: 1.125rem !important;
                        line-height: 1.75rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .md\\:text-xl {
                        font-size: 1.25rem !important;
                        line-height: 1.75rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .md\\:w-auto {
                        width: auto !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .md\\:max-w-md {
                        max-width: 28rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .md\\:max-w-lg {
                        max-width: 32rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .md\\:max-w-xl {
                        max-width: 36rem !important;
                    }
                }
                
                /* Large devices (lg: 1024px and up) */
                @media (min-width: 1024px) {
                    .${previewScopeClass} .preview-viewport .lg\\:space-x-8 > * + * {
                        margin-left: 2rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .lg\\:text-base {
                        font-size: 1rem !important;
                        line-height: 1.5rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .lg\\:text-lg {
                        font-size: 1.125rem !important;
                        line-height: 1.75rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .lg\\:text-xl {
                        font-size: 1.25rem !important;
                        line-height: 1.75rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .lg\\:px-8 {
                        padding-left: 2rem !important;
                        padding-right: 2rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .lg\\:py-8 {
                        padding-top: 2rem !important;
                        padding-bottom: 2rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .lg\\:hidden {
                        display: none !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .lg\\:block {
                        display: block !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .lg\\:flex {
                        display: flex !important;
                    }
                }
                
                /* Extra large devices (xl: 1280px and up) */
                @media (min-width: 1280px) {
                    .${previewScopeClass} .preview-viewport .xl\\:text-lg {
                        font-size: 1.125rem !important;
                        line-height: 1.75rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .xl\\:text-xl {
                        font-size: 1.25rem !important;
                        line-height: 1.75rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .xl\\:px-12 {
                        padding-left: 3rem !important;
                        padding-right: 3rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .xl\\:py-12 {
                        padding-top: 3rem !important;
                        padding-bottom: 3rem !important;
                    }
                }
                
                /* 2XL devices (2xl: 1536px and up) */
                @media (min-width: 1536px) {
                    .${previewScopeClass} .preview-viewport .2xl\\:text-xl {
                        font-size: 1.25rem !important;
                        line-height: 1.75rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .2xl\\:text-2xl {
                        font-size: 1.5rem !important;
                        line-height: 2rem !important;
                    }
                    
                    .${previewScopeClass} .preview-viewport .2xl\\:px-16 {
                        padding-left: 4rem !important;
                        padding-right: 4rem !important;
                    }
                }
                
                /* Spacing classes support */
                .${previewScopeClass} .preview-viewport .space-x-4 > * + * {
                    margin-left: 1rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .space-x-6 > * + * {
                    margin-left: 1.5rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .space-x-8 > * + * {
                    margin-left: 2rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .space-y-4 > * + * {
                    margin-top: 1rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .space-y-6 > * + * {
                    margin-top: 1.5rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .space-y-8 > * + * {
                    margin-top: 2rem !important;
                }
                
                /* Max-width container support */
                .${previewScopeClass} .preview-viewport .max-w-7xl {
                    max-width: 80rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .max-w-6xl {
                    max-width: 72rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .max-w-5xl {
                    max-width: 64rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .max-w-4xl {
                    max-width: 56rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .max-w-3xl {
                    max-width: 48rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .max-w-2xl {
                    max-width: 42rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .max-w-xl {
                    max-width: 36rem !important;
                }
                
                /* Center alignment */
                .${previewScopeClass} .preview-viewport .mx-auto {
                    margin-left: auto !important;
                    margin-right: auto !important;
                }
                
                /* Border radius support */
                .${previewScopeClass} .preview-viewport .rounded-lg {
                    border-radius: 0.5rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .rounded-xl {
                    border-radius: 0.75rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .rounded-2xl {
                    border-radius: 1rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .rounded-full {
                    border-radius: 9999px !important;
                }
                
                /* Z-index support */
                .${previewScopeClass} .preview-viewport .z-10 {
                    z-index: 10 !important;
                }
                
                .${previewScopeClass} .preview-viewport .z-20 {
                    z-index: 20 !important;
                }
                
                .${previewScopeClass} .preview-viewport .z-30 {
                    z-index: 30 !important;
                }
                
                .${previewScopeClass} .preview-viewport .z-40 {
                    z-index: 40 !important;
                }
                
                .${previewScopeClass} .preview-viewport .z-50 {
                    z-index: 50 !important;
                }
                
                /* Cursor support */
                .${previewScopeClass} .preview-viewport .cursor-pointer {
                    cursor: pointer !important;
                }
                
                .${previewScopeClass} .preview-viewport .cursor-default {
                    cursor: default !important;
                }
                
                /* Font weight support */
                .${previewScopeClass} .preview-viewport .font-bold {
                    font-weight: 700 !important;
                }
                
                .${previewScopeClass} .preview-viewport .font-semibold {
                    font-weight: 600 !important;
                }
                
                .${previewScopeClass} .preview-viewport .font-medium {
                    font-weight: 500 !important;
                }
                
                .${previewScopeClass} .preview-viewport .font-normal {
                    font-weight: 400 !important;
                }
                
                /* Text size support */
                .${previewScopeClass} .preview-viewport .text-xs {
                    font-size: 0.75rem !important;
                    line-height: 1rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .text-sm {
                    font-size: 0.875rem !important;
                    line-height: 1.25rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .text-base {
                    font-size: 1rem !important;
                    line-height: 1.5rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .text-lg {
                    font-size: 1.125rem !important;
                    line-height: 1.75rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .text-xl {
                    font-size: 1.25rem !important;
                    line-height: 1.75rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .text-2xl {
                    font-size: 1.5rem !important;
                    line-height: 2rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .text-3xl {
                    font-size: 1.875rem !important;
                    line-height: 2.25rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .text-4xl {
                    font-size: 2.25rem !important;
                    line-height: 2.5rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .text-5xl {
                    font-size: 3rem !important;
                    line-height: 1 !important;
                }
                
                .${previewScopeClass} .preview-viewport .text-6xl {
                    font-size: 3.75rem !important;
                    line-height: 1 !important;
                }
                
                /* Additional utility classes for better layout support */
                .${previewScopeClass} .preview-viewport .relative {
                    position: relative !important;
                }
                
                .${previewScopeClass} .preview-viewport .absolute {
                    position: absolute !important;
                }
                
                .${previewScopeClass} .preview-viewport .top-full {
                    top: 100% !important;
                }
                
                .${previewScopeClass} .preview-viewport .left-0 {
                    left: 0 !important;
                }
                
                .${previewScopeClass} .preview-viewport .right-0 {
                    right: 0 !important;
                }
                
                .${previewScopeClass} .preview-viewport .bottom-0 {
                    bottom: 0 !important;
                }
                
                .${previewScopeClass} .preview-viewport .top-0 {
                    top: 0 !important;
                }
                
                /* Block and inline display */
                .${previewScopeClass} .preview-viewport .block {
                    display: block !important;
                }
                
                .${previewScopeClass} .preview-viewport .inline-block {
                    display: inline-block !important;
                }
                
                .${previewScopeClass} .preview-viewport .inline {
                    display: inline !important;
                }
                
                .${previewScopeClass} .preview-viewport .hidden {
                    display: none !important;
                }
                
                /* Flexbox utilities */
                .${previewScopeClass} .preview-viewport .flex {
                    display: flex !important;
                }
                
                .${previewScopeClass} .preview-viewport .inline-flex {
                    display: inline-flex !important;
                }
                
                .${previewScopeClass} .preview-viewport .justify-between {
                    justify-content: space-between !important;
                }
                
                .${previewScopeClass} .preview-viewport .justify-center {
                    justify-content: center !important;
                }
                
                .${previewScopeClass} .preview-viewport .justify-start {
                    justify-content: flex-start !important;
                }
                
                .${previewScopeClass} .preview-viewport .justify-end {
                    justify-content: flex-end !important;
                }
                
                .${previewScopeClass} .preview-viewport .items-center {
                    align-items: center !important;
                }
                
                .${previewScopeClass} .preview-viewport .items-start {
                    align-items: flex-start !important;
                }
                
                .${previewScopeClass} .preview-viewport .items-end {
                    align-items: flex-end !important;
                }
                
                /* Width and height utilities */
                .${previewScopeClass} .preview-viewport .w-full {
                    width: 100% !important;
                }
                
                .${previewScopeClass} .preview-viewport .w-auto {
                    width: auto !important;
                }
                
                .${previewScopeClass} .preview-viewport .w-6 {
                    width: 1.5rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .h-6 {
                    height: 1.5rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .h-full {
                    height: 100% !important;
                }
                
                /* Padding utilities */
                .${previewScopeClass} .preview-viewport .p-2 {
                    padding: 0.5rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .p-4 {
                    padding: 1rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .p-6 {
                    padding: 1.5rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .px-4 {
                    padding-left: 1rem !important;
                    padding-right: 1rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .px-6 {
                    padding-left: 1.5rem !important;
                    padding-right: 1.5rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .py-2 {
                    padding-top: 0.5rem !important;
                    padding-bottom: 0.5rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .py-4 {
                    padding-top: 1rem !important;
                    padding-bottom: 1rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .py-6 {
                    padding-top: 1.5rem !important;
                    padding-bottom: 1.5rem !important;
                }
                
                /* Margin utilities */
                .${previewScopeClass} .preview-viewport .mt-4 {
                    margin-top: 1rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .mb-4 {
                    margin-bottom: 1rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .ml-4 {
                    margin-left: 1rem !important;
                }
                
                .${previewScopeClass} .preview-viewport .mr-4 {
                    margin-right: 1rem !important;
                }
                
                /* Prevent content from going behind fixed elements */
                .${previewScopeClass} .preview-viewport > *:first-child {
                    position: relative !important;
                    z-index: 1 !important;
                }
                
                /* JavaScript error styling */
                .${previewScopeClass} .js-error {
                    background-color: #FEF2F2;
                    color: #B91C1C;
                    padding: 8px;
                    border-radius: 4px;
                    margin: 8px 0;
                    font-family: monospace;
                    white-space: pre-wrap;
                    overflow: auto;
                    max-height: 200px;
                    scrollbar-width: none;
                }
                
                /* Base resets when Tailwind is not enabled */
                ${
                    !enableTailwind
                        ? `
                .${previewScopeClass} div, 
                .${previewScopeClass} span, 
                .${previewScopeClass} p, 
                .${previewScopeClass} h1, 
                .${previewScopeClass} h2, 
                .${previewScopeClass} h3, 
                .${previewScopeClass} h4, 
                .${previewScopeClass} h5, 
                .${previewScopeClass} h6 {
                    margin: 0;
                    padding: 0;
                    border: 0;
                    font-size: 100%;
                    font: inherit;
                    vertical-align: baseline;
                }`
                        : ''
                }
            `;
