---
description: Vite bundle analysis and optimization
---

# Vite Bundle Optimization

Analyze and reduce JavaScript bundle size for the React frontend.

## 1. Analyze Bundle

Install Rollup visualizer plugin:

// turbo
```bash
cd frontend
npm install -D rollup-plugin-visualizer
```

Update `vite.config.js`:

```javascript
import{ defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,  // Auto-open in browser after build
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html'
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'recharts', 'react-hot-toast'],
        }
      }
    }
  }
})
```

Build and analyze:

// turbo
```bash
npm run build
```

---

## 2. Code Splitting

### Lazy load routes

```tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ModulePlayer = lazy(() => import('./pages/ModulePlayer'));
const QuizPage = lazy(() => import('./pages/QuizPage'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/module/:id" element={<ModulePlayer />} />
          <Route path="/quiz/:id" element={<QuizPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### Lazy load heavy components

```tsx
import { lazy, Suspense } from 'react';

const AnalyticsChart = lazy(() => import('./components/AnalyticsChart'));

function ManagerDashboard() {
  return (
    <div>
      <h1>Analytics</h1>
      <Suspense fallback={<div>Loading chart...</div>}>
        <AnalyticsChart />
      </Suspense>
    </div>
  );
}
```

---

## 3. Replace Heavy Libraries

### Charts: recharts → lightweight alternatives

If recharts is too heavy, consider:
- `chart.js` with `react-chartjs-2` (smaller)
- `victory` (modular, tree-shakeable)
- Native SVG components (smallest)

### Icons: lucide-react usage optimization

Import only needed icons:

```tsx
// ❌ Don't import all icons
import * as Icons from 'lucide-react';

// ✅ Import specific icons
import { Home, User, Settings } from 'lucide-react';
```

---

## 4. Optimize Dependencies

Check bundle impact:

```bash
npm install -D vite-bundle-analyzer
```

Remove unused dependencies:

```bash
npm prune
npm dedupe
```

---

## 5. Tree Shaking

Ensure proper imports for tree shaking:

```tsx
// ❌ Breaks tree shaking
import _ from 'lodash';

// ✅ Import specific functions
import debounce from 'lodash/debounce';

// ✅ Or use native JS alternatives
const unique = [...new Set(array)];
const sorted = [...array].sort();
```

---

## 6. Image Optimization

```bash
npm install -D vite-plugin-image-optimizer
```

Update `vite.config.js`:

```javascript
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig({
  plugins: [
    react(),
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 80 },
      webp: { quality: 80 },
    })
  ]
})
```

---

## Pro Tips

1. **Target bundle sizes:**
   - Initial load: < 200KB (gzipped)
   - Route chunks: < 100KB each
   - Vendor chunk: < 150KB

2. **Use compression:**
   ```bash
   npm install -D vite-plugin-compression
   ```

3. **Preload critical chunks:**
   ```tsx
   <link rel="modulepreload" href="/assets/vendor.js" />
   ```

4. **Monitor bundle size in CI:**
   ```bash
   npm run build -- --json > stats.json
   ```
