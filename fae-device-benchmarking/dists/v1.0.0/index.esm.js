import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import platform from 'platform';

/**
 * Device Detection Module
 * Detects and provides detailed information about the user's device and browser
 */


/**
 * Detect device and browser information
 * @returns {Object} Device information object
 */
function detectDevice() {
  // Get platform information
  const platformInfo = platform.parse(navigator.userAgent);

  // Detect device type
  const deviceType = detectDeviceType();

  // Get GPU information (if available via WebGL)
  const gpuInfo = detectGPU();

  // Get memory information (if available)
  const memoryInfo = detectMemory();

  // Get screen information
  const screenInfo = {
    width: window.screen.width,
    height: window.screen.height,
    pixelRatio: window.devicePixelRatio || 1,
    colorDepth: window.screen.colorDepth
  };

  // Get CPU cores (if available)
  const cpuCores = navigator.hardwareConcurrency || 'unknown';

  return {
    // Browser information
    browser: {
      name: platformInfo.name || 'unknown',
      version: platformInfo.version || 'unknown',
      layout: platformInfo.layout || 'unknown'
    },
    
    // Operating System information
    os: {
      name: platformInfo.os?.family || 'unknown',
      version: platformInfo.os?.version || 'unknown',
      architecture: platformInfo.os?.architecture || 'unknown'
    },
    
    // Device information
    device: {
      type: deviceType,
      manufacturer: platformInfo.manufacturer || 'unknown',
      model: platformInfo.product || 'unknown',
      cpuCores: cpuCores
    },
    
    // GPU information
    gpu: gpuInfo,
    
    // Memory information
    memory: memoryInfo,
    
    // Screen information
    screen: screenInfo,
    
    // Raw user agent
    userAgent: navigator.userAgent,
    
    // Detection timestamp
    timestamp: new Date().toISOString()
  };
}

/**
 * Detect device type (mobile, tablet, desktop)
 * @returns {string} Device type
 */
function detectDeviceType() {
  const ua = navigator.userAgent.toLowerCase();
  
  // Check for mobile devices
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    return 'mobile';
  }
  
  // Check for tablets
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return 'tablet';
  }
  
  // Check for touch support (additional indicator for mobile/tablet)
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    // If touch is supported but not explicitly mobile/tablet, check screen size
    const screenWidth = window.screen.width;
    if (screenWidth < 768) {
      return 'mobile';
    } else if (screenWidth < 1024) {
      return 'tablet';
    }
  }
  
  return 'desktop';
}

/**
 * Detect GPU information via WebGL
 * @returns {Object} GPU information
 */
function detectGPU() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      return {
        vendor: 'unknown',
        renderer: 'unknown',
        webglVersion: 'not supported'
      };
    }
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    let vendor = 'unknown';
    let renderer = 'unknown';
    
    if (debugInfo) {
      vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    }
    
    // Check for WebGL2 support
    const gl2 = canvas.getContext('webgl2');
    const webglVersion = gl2 ? 'WebGL 2.0' : 'WebGL 1.0';
    
    return {
      vendor: vendor,
      renderer: renderer,
      webglVersion: webglVersion
    };
  } catch (error) {
    return {
      vendor: 'unknown',
      renderer: 'unknown',
      webglVersion: 'detection failed',
      error: error.message
    };
  }
}

/**
 * Detect memory information (if available)
 * @returns {Object} Memory information
 */
function detectMemory() {
  // Check if memory information is available (Chrome/Edge only)
  if (performance.memory) {
    return {
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      unit: 'bytes'
    };
  }
  
  // Check for deviceMemory (available in some browsers)
  if (navigator.deviceMemory) {
    return {
      deviceMemory: navigator.deviceMemory,
      unit: 'GB'
    };
  }
  
  return {
    available: false,
    note: 'Memory information not available in this browser'
  };
}

/**
 * Benchmark Module
 * Handles performance benchmarking and device classification
 */

/**
 * Run benchmark iterations on face detection
 * @param {FaceLandmarker} faceLandmarker - Initialized face landmarker instance
 * @param {HTMLImageElement|HTMLCanvasElement|ImageData} image - Image to process
 * @param {number} iterations - Number of iterations to run
 * @returns {Promise<Object>} Benchmark results with statistics
 */
async function runBenchmark(faceLandmarker, image, iterations = 10) {
  if (!faceLandmarker) {
    throw new Error('Face landmarker is not initialized');
  }

  if (!image) {
    throw new Error('Image is required for benchmarking');
  }

  const executionTimes = [];
  let totalTime = 0;

  // Warm-up run (not counted in results)
  // This helps stabilize performance by loading any lazy resources
  try {
    faceLandmarker.detect(image);
  } catch (error) {
    console.warn('Warm-up run failed:', error);
  }

  // Run benchmark iterations
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    
    try {
      // Perform face detection with landmarks, iris, and blendshapes
      const results = faceLandmarker.detect(image);
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      executionTimes.push(executionTime);
      totalTime += executionTime;

      // Validate that we got results
      if (!results || !results.faceLandmarks || results.faceLandmarks.length === 0) {
        console.warn(`Iteration ${i + 1}: No face detected in image`);
      }
    } catch (error) {
      console.error(`Iteration ${i + 1} failed:`, error);
      // Record a failed iteration as a very high time
      executionTimes.push(Number.MAX_SAFE_INTEGER);
    }
  }

  // Calculate statistics
  const stats = calculateStatistics(executionTimes);

  return {
    executionTimes: executionTimes,
    totalTime: totalTime,
    meanTime: stats.mean,
    medianTime: stats.median,
    minTime: stats.min,
    maxTime: stats.max,
    standardDeviation: stats.stdDev,
    iterations: iterations
  };
}

/**
 * Calculate statistical metrics from execution times
 * @param {number[]} times - Array of execution times
 * @returns {Object} Statistical metrics
 */
function calculateStatistics(times) {
  if (!times || times.length === 0) {
    return {
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      stdDev: 0
    };
  }

  // Mean
  const mean = times.reduce((sum, time) => sum + time, 0) / times.length;

  // Median
  const sortedTimes = [...times].sort((a, b) => a - b);
  const mid = Math.floor(sortedTimes.length / 2);
  const median = sortedTimes.length % 2 === 0
    ? (sortedTimes[mid - 1] + sortedTimes[mid]) / 2
    : sortedTimes[mid];

  // Min and Max
  const min = Math.min(...times);
  const max = Math.max(...times);

  // Standard Deviation
  const squaredDiffs = times.map(time => Math.pow(time - mean, 2));
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / times.length;
  const stdDev = Math.sqrt(variance);

  return {
    mean: mean,
    median: median,
    min: min,
    max: max,
    stdDev: stdDev
  };
}

/**
 * Classify device performance based on mean execution time
 * @param {number} meanTime - Mean execution time in milliseconds
 * @returns {Object} Device classification with details
 */
function classifyDevice(meanTime) {
  // Classification thresholds (in milliseconds)
  const THRESHOLDS = {
    HIGH_END: 100,      // < 100ms = high-end
    MEDIUM_END: 200     // 100-200ms = medium-end, > 200ms = low-end
  };

  let category;
  let recommendation;
  let description;

  if (meanTime < THRESHOLDS.HIGH_END) {
    category = 'high-end';
    recommendation = 'recommended';
    description = 'Excellent performance. Device can handle real-time face detection smoothly.';
  } else if (meanTime < THRESHOLDS.MEDIUM_END) {
    category = 'medium-end';
    recommendation = 'acceptable';
    description = 'Good performance. Device can handle face detection adequately with possible minor delays.';
  } else {
    category = 'low-end';
    recommendation = 'not recommended';
    description = 'Limited performance. Device may struggle with real-time face detection and experience significant delays.';
  }

  return {
    category: category,
    recommendation: recommendation,
    description: description,
    meanExecutionTime: meanTime,
    thresholds: THRESHOLDS,
    performanceScore: calculatePerformanceScore(meanTime, THRESHOLDS)
  };
}

/**
 * Calculate a normalized performance score (0-100)
 * @param {number} meanTime - Mean execution time in milliseconds
 * @param {Object} thresholds - Performance thresholds
 * @returns {number} Performance score (0-100)
 */
function calculatePerformanceScore(meanTime, thresholds) {
  // Score calculation:
  // - 0ms = 100 points
  // - HIGH_END threshold = 80 points
  // - MEDIUM_END threshold = 50 points
  // - 2x MEDIUM_END threshold = 0 points

  if (meanTime <= 0) {
    return 100;
  }

  if (meanTime < thresholds.HIGH_END) {
    // Linear interpolation between 80-100
    const ratio = meanTime / thresholds.HIGH_END;
    return 100 - (ratio * 20);
  } else if (meanTime < thresholds.MEDIUM_END) {
    // Linear interpolation between 50-80
    const range = thresholds.MEDIUM_END - thresholds.HIGH_END;
    const position = meanTime - thresholds.HIGH_END;
    const ratio = position / range;
    return 80 - (ratio * 30);
  } else {
    // Linear interpolation between 0-50
    const maxTime = thresholds.MEDIUM_END * 2;
    if (meanTime >= maxTime) {
      return 0;
    }
    const range = maxTime - thresholds.MEDIUM_END;
    const position = meanTime - thresholds.MEDIUM_END;
    const ratio = position / range;
    return 50 - (ratio * 50);
  }
}

/**
 * @privately-corp/fae-device-benchmarking
 * A headless JavaScript SDK for benchmarking MediaPipe face landmarks detection
 */


const WASM_BASE = "https://cdn.jsdelivr.net/gh/privately-corp/web-utils@latest/";
const MODEL_PATH = "https://cdn.jsdelivr.net/gh/privately-corp/web-utils@latest/face_landmarker.task";

/**
 * Main class for MediaPipe Face Landmarks Benchmarking
 */
class FaceBenchmark {
  constructor() {
    this.faceLandmarker = null;
    this.downloadTime = 0;
    this.initTime = 0;
    this.isInitialized = false;
  }

  /**
   * Initialize the MediaPipe Face Landmarker with download and setup timing
   * @returns {Promise<Object>} Initialization results with timing information
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn('FaceBenchmark is already initialized');
      return {
        downloadTime: this.downloadTime,
        initTime: this.initTime,
        totalSetupTime: this.downloadTime + this.initTime
      };
    }

    try {
      // Track download time
      const downloadStart = performance.now();
      
      const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
      
      const downloadEnd = performance.now();
      this.downloadTime = downloadEnd - downloadStart;

      // Track initialization time
      const initStart = performance.now();
      
      this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_PATH,
          delegate: 'CPU'
        },
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
        runningMode: 'IMAGE',
        numFaces: 1
      });

      const initEnd = performance.now();
      this.initTime = initEnd - initStart;
      this.isInitialized = true;

      return {
        downloadTime: this.downloadTime,
        initTime: this.initTime,
        totalSetupTime: this.downloadTime + this.initTime,
        success: true
      };
    } catch (error) {
      console.error('Failed to initialize FaceBenchmark:', error);
      throw new Error(`Initialization failed: ${error.message}`);
    }
  }

  /**
   * Run benchmark on a provided image
   * @param {HTMLImageElement|HTMLCanvasElement|ImageData} image - The image to process
   * @param {number} iterations - Number of iterations to run (default: 10)
   * @returns {Promise<Object>} Complete benchmark results
   */
  async runBenchmark(image, iterations = 10) {
    if (!this.isInitialized) {
      throw new Error('FaceBenchmark must be initialized before running benchmark. Call initialize() first.');
    }

    if (!image) {
      throw new Error('Image is required for benchmarking');
    }

    // Detect device information
    const deviceInfo = detectDevice();

    // Run the benchmark iterations
    const benchmarkResults = await runBenchmark(
      this.faceLandmarker,
      image,
      iterations
    );

    // Classify device based on performance
    const deviceClassification = classifyDevice(benchmarkResults.meanTime);

    // Compile complete results
    const results = {
      device: deviceInfo,
      setup: {
        downloadTime: this.downloadTime,
        initTime: this.initTime,
        totalSetupTime: this.downloadTime + this.initTime
      },
      benchmark: {
        iterations: iterations,
        executionTimes: benchmarkResults.executionTimes,
        totalTime: benchmarkResults.totalTime,
        meanTime: benchmarkResults.meanTime,
        medianTime: benchmarkResults.medianTime,
        minTime: benchmarkResults.minTime,
        maxTime: benchmarkResults.maxTime,
        standardDeviation: benchmarkResults.standardDeviation
      },
      classification: deviceClassification,
      timestamp: new Date().toISOString()
    };

    return results;
  }

  /**
   * Run a quick benchmark with a default test image
   * @param {number} iterations - Number of iterations to run (default: 10)
   * @returns {Promise<Object>} Complete benchmark results
   */
  async runQuickBenchmark(iterations = 10) {
    if (!this.isInitialized) {
      throw new Error('FaceBenchmark must be initialized before running benchmark. Call initialize() first.');
    }

    // Create a default test image
    const image = await this.loadDefaultImage();
    return this.runBenchmark(image, iterations);
  }

  /**
   * Load default test image for benchmarking
   * @returns {Promise<HTMLImageElement>} Loaded image element
   */
  async loadDefaultImage() {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load default test image'));
      
      // Use a publicly available test face image
      img.src = 'https://storage.googleapis.com/mediapipe-assets/portrait.jpg';
    });
  }

  /**
   * Perform a single face detection (for testing purposes)
   * @param {HTMLImageElement|HTMLCanvasElement|ImageData} image - The image to process
   * @returns {Object} Detection results
   */
  detectFace(image) {
    if (!this.isInitialized) {
      throw new Error('FaceBenchmark must be initialized before detecting faces. Call initialize() first.');
    }

    const startTime = performance.now();
    const results = this.faceLandmarker.detect(image);
    const endTime = performance.now();

    return {
      landmarks: results.faceLandmarks,
      blendshapes: results.faceBlendshapes,
      transformationMatrixes: results.facialTransformationMatrixes,
      executionTime: endTime - startTime
    };
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this.faceLandmarker) {
      this.faceLandmarker.close();
      this.faceLandmarker = null;
    }
    this.isInitialized = false;
  }

  /**
   * Export results as JSON string
   * @param {Object} results - Benchmark results to export
   * @param {boolean} pretty - Whether to pretty-print JSON (default: true)
   * @returns {string} JSON string
   */
  static exportJSON(results, pretty = true) {
    return JSON.stringify(results, null, pretty ? 2 : 0);
  }

  /**
   * Create and initialize a new FaceBenchmark instance in one call
   * @returns {Promise<FaceBenchmark>} Initialized instance
   */
  static async create() {
    const instance = new FaceBenchmark();
    await instance.initialize();
    return instance;
  }
}

export { FaceBenchmark, classifyDevice, FaceBenchmark as default, detectDevice };
//# sourceMappingURL=index.esm.js.map
