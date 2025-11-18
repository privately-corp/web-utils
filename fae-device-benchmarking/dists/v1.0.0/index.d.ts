/**
 * Type definitions for @privately-corp/fae-device-benchmarking
 */

declare module '@privately-corp/fae-device-benchmarking' {
  /**
   * Browser information
   */
  export interface BrowserInfo {
    name: string;
    version: string;
    layout: string;
  }

  /**
   * Operating system information
   */
  export interface OSInfo {
    name: string;
    version: string;
    architecture: string;
  }

  /**
   * Device hardware information
   */
  export interface DeviceInfo {
    type: 'mobile' | 'tablet' | 'desktop';
    manufacturer: string;
    model: string;
    cpuCores: number | string;
  }

  /**
   * GPU information
   */
  export interface GPUInfo {
    vendor: string;
    renderer: string;
    webglVersion: string;
    error?: string;
  }

  /**
   * Memory information
   */
  export interface MemoryInfo {
    jsHeapSizeLimit?: number;
    totalJSHeapSize?: number;
    usedJSHeapSize?: number;
    deviceMemory?: number;
    unit?: string;
    available?: boolean;
    note?: string;
  }

  /**
   * Screen information
   */
  export interface ScreenInfo {
    width: number;
    height: number;
    pixelRatio: number;
    colorDepth: number;
  }

  /**
   * Complete device detection information
   */
  export interface DeviceDetectionInfo {
    browser: BrowserInfo;
    os: OSInfo;
    device: DeviceInfo;
    gpu: GPUInfo;
    memory: MemoryInfo;
    screen: ScreenInfo;
    userAgent: string;
    timestamp: string;
  }

  /**
   * Setup timing information
   */
  export interface SetupInfo {
    downloadTime: number;
    initTime: number;
    totalSetupTime: number;
    success?: boolean;
  }

  /**
   * Benchmark results
   */
  export interface BenchmarkResults {
    iterations: number;
    executionTimes: number[];
    totalTime: number;
    meanTime: number;
    medianTime: number;
    minTime: number;
    maxTime: number;
    standardDeviation: number;
  }

  /**
   * Device classification
   */
  export interface DeviceClassification {
    category: 'high-end' | 'medium-end' | 'low-end';
    recommendation: 'recommended' | 'acceptable' | 'not recommended';
    description: string;
    meanExecutionTime: number;
    thresholds: {
      HIGH_END: number;
      MEDIUM_END: number;
    };
    performanceScore: number;
  }

  /**
   * Complete benchmark result object
   */
  export interface CompleteBenchmarkResult {
    device: DeviceDetectionInfo;
    setup: SetupInfo;
    benchmark: BenchmarkResults;
    classification: DeviceClassification;
    timestamp: string;
  }

  /**
   * Face detection result for single detection
   */
  export interface FaceDetectionResult {
    landmarks: any;
    blendshapes: any;
    transformationMatrixes: any;
    executionTime: number;
  }

  /**
   * Feature support information
   */
  export interface FeatureSupport {
    webgl: boolean;
    webgl2: boolean;
    wasm: boolean;
    simd: boolean;
    camera: boolean;
    workers: boolean;
  }

  /**
   * Benchmark comparison results
   */
  export interface BenchmarkComparison {
    count: number;
    meanTimes: {
      fastest: number;
      slowest: number;
      average: number;
    };
    categories: {
      highEnd: number;
      mediumEnd: number;
      lowEnd: number;
    };
    results: CompleteBenchmarkResult[];
  }

  /**
   * Main FaceBenchmark class
   */
  export class FaceBenchmark {
    /**
     * Create a new FaceBenchmark instance
     */
    constructor();

    /**
     * Initialize the MediaPipe Face Landmarker with download and setup timing
     * @returns Promise resolving to initialization results with timing information
     */
    initialize(): Promise<SetupInfo>;

    /**
     * Run benchmark on a provided image
     * @param image - The image to process (HTMLImageElement, HTMLCanvasElement, or ImageData)
     * @param iterations - Number of iterations to run (default: 10)
     * @returns Promise resolving to complete benchmark results
     */
    runBenchmark(
      image: HTMLImageElement | HTMLCanvasElement | ImageData,
      iterations?: number
    ): Promise<CompleteBenchmarkResult>;

    /**
     * Run a quick benchmark with a default test image
     * @param iterations - Number of iterations to run (default: 10)
     * @returns Promise resolving to complete benchmark results
     */
    runQuickBenchmark(iterations?: number): Promise<CompleteBenchmarkResult>;

    /**
     * Load default test image for benchmarking
     * @returns Promise resolving to loaded image element
     */
    loadDefaultImage(): Promise<HTMLImageElement>;

    /**
     * Perform a single face detection (for testing purposes)
     * @param image - The image to process
     * @returns Detection results with timing information
     */
    detectFace(
      image: HTMLImageElement | HTMLCanvasElement | ImageData
    ): FaceDetectionResult;

    /**
     * Clean up resources
     */
    dispose(): void;

    /**
     * Export results as JSON string
     * @param results - Benchmark results to export
     * @param pretty - Whether to pretty-print JSON (default: true)
     * @returns JSON string representation of results
     */
    static exportJSON(results: CompleteBenchmarkResult, pretty?: boolean): string;

    /**
     * Create and initialize a new FaceBenchmark instance in one call
     * @returns Promise resolving to initialized FaceBenchmark instance
     */
    static create(): Promise<FaceBenchmark>;

    /**
     * Whether the instance is initialized
     */
    readonly isInitialized: boolean;

    /**
     * Download time in milliseconds
     */
    readonly downloadTime: number;

    /**
     * Initialization time in milliseconds
     */
    readonly initTime: number;
  }

  /**
   * Detect device and browser information
   * @returns Device information object
   */
  export function detectDevice(): DeviceDetectionInfo;

  /**
   * Get a simplified device summary for logging
   * @param deviceInfo - Device information object
   * @returns Human-readable device summary string
   */
  export function getDeviceSummary(deviceInfo: DeviceDetectionInfo): string;

  /**
   * Check if device supports required features for face detection
   * @returns Feature support information
   */
  export function checkFeatureSupport(): FeatureSupport;

  /**
   * Classify device performance based on mean execution time
   * @param meanTime - Mean execution time in milliseconds
   * @returns Device classification with details
   */
  export function classifyDevice(meanTime: number): DeviceClassification;

  /**
   * Format benchmark results for display
   * @param results - Benchmark results
   * @returns Formatted results string
   */
  export function formatBenchmarkResults(results: CompleteBenchmarkResult): string;

  /**
   * Compare multiple benchmark results
   * @param resultsArray - Array of benchmark results
   * @returns Comparison analysis
   */
  export function compareBenchmarks(
    resultsArray: CompleteBenchmarkResult[]
  ): BenchmarkComparison;

  export default FaceBenchmark;
}

