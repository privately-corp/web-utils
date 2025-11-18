# @privately-corp/fae-device-benchmarking

A headless JavaScript SDK for benchmarking MediaPipe face landmarks detection to determine device capabilities. This SDK helps developers assess whether a user's device can handle real-time face detection with landmarks, iris tracking, and blendshapes analysis.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Features

- **Automated Performance Testing**: Run comprehensive benchmarks on face landmark detection
- **MediaPipe Integration**: Utilizes MediaPipe Tasks Vision with iris and blendshapes detection
- **Device Classification**: Automatically categorizes devices as high-end, medium-end, or low-end
- **Detailed Metrics**: Tracks download time, initialization time, and execution performance
- **Device Information**: Captures comprehensive device, browser, and GPU information
- **TypeScript Support**: Full TypeScript type definitions included
- **Zero Configuration**: Works out of the box with sensible defaults
- **Multiple Formats**: Supports UMD, ESM, and CommonJS builds

## 📦 Installation

Using a CDN:

```html
<script type="module">
  import FaceBenchmark from 'https://cdn.jsdelivr.net/gh/privately-corp/web-utils@latest/fae-device-benchmarking/dists/v1.0.0/index.browser.js';
</script>
```

## 🚀 Quick Start

### Basic Usage

```javascript
import FaceBenchmark from 'https://cdn.jsdelivr.net/gh/privately-corp/web-utils@latest/fae-device-benchmarking/dists/v1.0.0/index.browser.js';

// Create and initialize the benchmark
const benchmark = await FaceBenchmark.create();

// Run a quick benchmark with the default test image
const results = await benchmark.runQuickBenchmark(10);

console.log('Device Classification:', results.classification.category);
console.log('Mean Execution Time:', results.benchmark.meanTime.toFixed(2), 'ms');
console.log('Performance Score:', results.classification.performanceScore.toFixed(1));

// Clean up
benchmark.dispose();
```

### Custom Image Benchmark

```javascript
import FaceBenchmark from 'https://cdn.jsdelivr.net/gh/privately-corp/web-utils@latest/fae-device-benchmarking/dists/v1.0.0/index.browser.js';

// Create instance
const benchmark = new FaceBenchmark();

// Initialize MediaPipe
await benchmark.initialize();

// Load your own image
const img = new Image();
img.src = 'path/to/your/image.jpg';
await img.decode();

// Run benchmark with custom image
const results = await benchmark.runBenchmark(img, 10);

console.log('Results:', results);
```

### Browser Usage (UMD)

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/gh/privately-corp/web-utils@latest/fae-device-benchmarking/dists/v1.0.0/index.umd.js"></script>
</head>
<body>
    <button onclick="runBenchmark()">Run Benchmark</button>
    <div id="results"></div>

    <script>
        async function runBenchmark() {
            const benchmark = await FaceBenchmark.default.create();
            const results = await benchmark.runQuickBenchmark(10);
            
            document.getElementById('results').innerHTML = `
                <h3>Device: ${results.classification.category}</h3>
                <p>Mean Time: ${results.benchmark.meanTime.toFixed(2)}ms</p>
                <p>Score: ${results.classification.performanceScore.toFixed(1)}/100</p>
            `;
            
            benchmark.dispose();
        }
    </script>
</body>
</html>
```

## 📖 API Reference

### `FaceBenchmark`

The main class for running benchmarks.

#### Constructor

```javascript
const benchmark = new FaceBenchmark();
```

Creates a new instance of the benchmark. Does not initialize MediaPipe automatically.

#### Methods

##### `initialize(): Promise<SetupInfo>`

Initializes MediaPipe Face Landmarker and tracks setup timing.

```javascript
const setupInfo = await benchmark.initialize();
console.log('Setup Time:', setupInfo.totalSetupTime, 'ms');
```

**Returns:** Promise resolving to setup information:
```typescript
{
  downloadTime: number;      // Time to download MediaPipe assets (ms)
  initTime: number;          // Time to initialize face landmarker (ms)
  totalSetupTime: number;    // Total setup time (ms)
  success: boolean;          // Whether initialization succeeded
}
```

##### `runBenchmark(image, iterations): Promise<CompleteBenchmarkResult>`

Runs benchmark on a provided image.

```javascript
const results = await benchmark.runBenchmark(image, 10);
```

**Parameters:**
- `image` (HTMLImageElement | HTMLCanvasElement | ImageData): The image to process
- `iterations` (number): Number of iterations to run (default: 10)

**Returns:** Promise resolving to complete benchmark results (see [Result Structure](#result-structure))

##### `runQuickBenchmark(iterations): Promise<CompleteBenchmarkResult>`

Runs benchmark with a default test image.

```javascript
const results = await benchmark.runQuickBenchmark(10);
```

**Parameters:**
- `iterations` (number): Number of iterations to run (default: 10)

**Returns:** Promise resolving to complete benchmark results

##### `detectFace(image): FaceDetectionResult`

Performs a single face detection (for testing purposes).

```javascript
const detection = benchmark.detectFace(image);
console.log('Execution Time:', detection.executionTime, 'ms');
```

**Returns:**
```typescript
{
  landmarks: any;                    // Face landmarks
  blendshapes: any;                  // Face blendshapes
  transformationMatrixes: any;       // Transformation matrices
  executionTime: number;             // Time taken (ms)
}
```

##### `loadDefaultImage(): Promise<HTMLImageElement>`

Loads the default test image.

```javascript
const image = await benchmark.loadDefaultImage();
```

##### `dispose(): void`

Cleans up resources and closes the face landmarker.

```javascript
benchmark.dispose();
```

##### `static create(): Promise<FaceBenchmark>`

Creates and initializes a benchmark instance in one call.

```javascript
const benchmark = await FaceBenchmark.create();
```

##### `static exportJSON(results, pretty): string`

Exports results as a JSON string.

```javascript
const json = FaceBenchmark.exportJSON(results, true);
console.log(json);
```

**Parameters:**
- `results` (CompleteBenchmarkResult): Benchmark results to export
- `pretty` (boolean): Whether to pretty-print JSON (default: true)

### Utility Functions

#### `detectDevice(): DeviceDetectionInfo`

Detects and returns detailed device information.

```javascript
import { detectDevice } from 'https://cdn.jsdelivr.net/gh/privately-corp/web-utils@latest/fae-device-benchmarking/dists/v1.0.0/index.browser.js';

const deviceInfo = detectDevice();
console.log('Device Type:', deviceInfo.device.type);
console.log('OS:', deviceInfo.os.name);
console.log('Browser:', deviceInfo.browser.name);
```

#### `classifyDevice(meanTime): DeviceClassification`

Classifies device based on mean execution time.

```javascript
import { classifyDevice } from 'https://cdn.jsdelivr.net/gh/privately-corp/web-utils@latest/fae-device-benchmarking/dists/v1.0.0/index.browser.js';

const classification = classifyDevice(75.5);
console.log('Category:', classification.category); // 'high-end'
```

#### `checkFeatureSupport(): FeatureSupport`

Checks browser feature support.

```javascript
import { checkFeatureSupport } from 'https://cdn.jsdelivr.net/gh/privately-corp/web-utils@latest/fae-device-benchmarking/dists/v1.0.0/index.browser.js';

const features = checkFeatureSupport();
console.log('WebGL Support:', features.webgl);
console.log('WebGL2 Support:', features.webgl2);
console.log('WebAssembly Support:', features.wasm);
```

#### `formatBenchmarkResults(results): string`

Formats benchmark results as a human-readable string.

```javascript
import { formatBenchmarkResults } from 'https://cdn.jsdelivr.net/gh/privately-corp/web-utils@latest/fae-device-benchmarking/dists/v1.0.0/index.browser.js';

const formatted = formatBenchmarkResults(results);
console.log(formatted);
```

## 📊 Result Structure

The benchmark returns a comprehensive result object:

```typescript
{
  device: {
    browser: {
      name: string;           // Browser name
      version: string;        // Browser version
      layout: string;         // Layout engine
    },
    os: {
      name: string;           // OS name
      version: string;        // OS version
      architecture: string;   // CPU architecture
    },
    device: {
      type: string;           // 'mobile' | 'tablet' | 'desktop'
      manufacturer: string;   // Device manufacturer
      model: string;          // Device model
      cpuCores: number;       // Number of CPU cores
    },
    gpu: {
      vendor: string;         // GPU vendor
      renderer: string;       // GPU renderer
      webglVersion: string;   // WebGL version
    },
    memory: {
      // Memory information (if available)
    },
    screen: {
      width: number;          // Screen width
      height: number;         // Screen height
      pixelRatio: number;     // Device pixel ratio
      colorDepth: number;     // Color depth
    },
    userAgent: string;        // Raw user agent string
    timestamp: string;        // Detection timestamp
  },
  setup: {
    downloadTime: number;     // Download time (ms)
    initTime: number;         // Initialization time (ms)
    totalSetupTime: number;   // Total setup time (ms)
  },
  benchmark: {
    iterations: number;       // Number of iterations
    executionTimes: number[]; // Array of execution times
    totalTime: number;        // Total execution time (ms)
    meanTime: number;         // Mean execution time (ms)
    medianTime: number;       // Median execution time (ms)
    minTime: number;          // Minimum execution time (ms)
    maxTime: number;          // Maximum execution time (ms)
    standardDeviation: number;// Standard deviation (ms)
  },
  classification: {
    category: string;         // 'high-end' | 'medium-end' | 'low-end'
    recommendation: string;   // 'recommended' | 'acceptable' | 'not recommended'
    description: string;      // Human-readable description
    meanExecutionTime: number;// Mean time used for classification
    thresholds: {
      HIGH_END: number;       // High-end threshold (100ms)
      MEDIUM_END: number;     // Medium-end threshold (300ms)
    },
    performanceScore: number; // Score from 0-100
  },
  timestamp: string;          // Benchmark timestamp
}
```

## 🎨 Classification Thresholds

The SDK classifies devices based on mean execution time:

| Category | Mean Time | Recommendation | Description |
|----------|-----------|----------------|-------------|
| **High-End** | < 50ms | Recommended | Excellent performance for real-time face detection |
| **Medium-End** | 50-100ms | Acceptable | Good performance with possible minor delays |
| **Low-End** | > 100ms | Not Recommended | Limited performance, may struggle with real-time detection |

The performance score is calculated on a 0-100 scale:
- **100 points**: 0ms (theoretical perfect)
- **80 points**: 100ms (high-end threshold)
- **50 points**: 300ms (medium-end threshold)
- **0 points**: 600ms or higher

## 🔧 Advanced Usage

### Multiple Benchmarks

```javascript
import FaceBenchmark from 'https://cdn.jsdelivr.net/gh/privately-corp/web-utils@latest/fae-device-benchmarking/dists/v1.0.0/index.browser.js';

const benchmark = await FaceBenchmark.create();
const allResults = [];

// Run multiple benchmarks
for (let i = 0; i < 3; i++) {
  const results = await benchmark.runQuickBenchmark(10);
  allResults.push(results);
}

// Calculate average performance
const avgMeanTime = allResults.reduce((sum, r) => sum + r.benchmark.meanTime, 0) / allResults.length;
console.log('Average Mean Time:', avgMeanTime.toFixed(2), 'ms');

benchmark.dispose();
```

### Custom Image Processing

```javascript
import FaceBenchmark from 'https://cdn.jsdelivr.net/gh/privately-corp/web-utils@latest/fae-device-benchmarking/dists/v1.0.0/index.browser.js';

const benchmark = await FaceBenchmark.create();

// Process video frame
const video = document.querySelector('video');
const canvas = document.createElement('canvas');
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;
const ctx = canvas.getContext('2d');
ctx.drawImage(video, 0, 0);

const results = await benchmark.runBenchmark(canvas, 10);
console.log('Video frame benchmark:', results);

benchmark.dispose();
```

### Exporting Results

```javascript
import FaceBenchmark from 'https://cdn.jsdelivr.net/gh/privately-corp/web-utils@latest/fae-device-benchmarking/dists/v1.0.0/index.browser.js';

const benchmark = await FaceBenchmark.create();
const results = await benchmark.runQuickBenchmark(10);

// Export as JSON
const json = FaceBenchmark.exportJSON(results);
console.log(json);

// Save to file (in browser)
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'benchmark-results.json';
a.click();
URL.revokeObjectURL(url);

benchmark.dispose();
```

### Feature Detection

```javascript
import { checkFeatureSupport } from 'https://cdn.jsdelivr.net/gh/privately-corp/web-utils@latest/fae-device-benchmarking/dists/v1.0.0/index.browser.js';

const features = checkFeatureSupport();

if (!features.webgl) {
  console.error('WebGL is not supported on this device');
}

if (!features.wasm) {
  console.error('WebAssembly is not supported on this device');
}

console.log('All features:', features);
// {
//   webgl: true,
//   webgl2: true,
//   wasm: true,
//   simd: true,
//   camera: true,
//   workers: true
// }
```

## 🖥️ Browser Support

This SDK requires:
- **WebGL** (preferably WebGL 2.0)
- **WebAssembly**
- **ES6+ JavaScript support**

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📱 Platform Support

- ✅ Desktop (Windows, macOS, Linux)
- ✅ Mobile (iOS Safari, Android Chrome)
- ✅ Tablet (iPad, Android tablets)
- ⚠️ Node.js (requires additional setup with canvas/jsdom)

## 🎓 Examples

The SDK includes several examples in the `examples/` directory:

1. **basic-usage.html** - Simple benchmark with UI
2. **advanced-usage.html** - Advanced demo with detailed analytics and charts
3. **node-example.js** - Conceptual Node.js usage (requires additional setup)

To run the examples:

```bash
# Serve the examples (use any static server)
npx http-server . -p 8080

# Open in browser
# http://localhost:8080/examples/basic-usage.html
# http://localhost:8080/examples/advanced-usage.html
```



## 📄 License

See LICENSE file for details

## 🙏 Acknowledgments

- [MediaPipe](https://github.com/google/mediapipe) - Google's cross-platform ML solutions
- [Platform.js](https://github.com/bestiejs/platform.js) - Platform detection library


---

Made with ❤️ by Privately SA
