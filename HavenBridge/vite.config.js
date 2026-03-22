// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; 
import tailwindcss from '@tailwindcss/vite'; 

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),          // 3. Include the React plugin
    tailwindcss(),    // 4. Include the Tailwind CSS plugin
  ],
});


// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     "./src/**/*.{js,jsx,ts,tsx}",
//   ],
//   theme: {
//     extend: {
//       colors: {
//         teal: {
//           50: '#f0fdfa',
//           100: '#ccfbf1',
//           200: '#99f6e4',
//           300: '#5eead4',
//           400: '#2dd4bf',
//           500: '#14b8a6',
//           600: '#0d9488',
//           700: '#0f766e',
//           800: '#115e59',
//           900: '#134e4a',
//         }
//       }
//     },
//   },
//   plugins: [
// ],
// }