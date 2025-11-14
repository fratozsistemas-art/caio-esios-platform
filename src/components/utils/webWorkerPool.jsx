// Web Worker Pool for Heavy Computations

class WebWorkerPool {
  constructor(workerScript, poolSize = navigator.hardwareConcurrency || 4) {
    this.workerScript = workerScript;
    this.poolSize = poolSize;
    this.workers = [];
    this.availableWorkers = [];
    this.taskQueue = [];
    this.init();
  }

  init() {
    if (typeof Worker === 'undefined') {
      console.warn('Web Workers not supported in this environment');
      return;
    }

    for (let i = 0; i < this.poolSize; i++) {
      this.createWorker();
    }
  }

  createWorker() {
    try {
      const worker = new Worker(this.workerScript, { type: 'module' });
      
      worker.onmessage = (event) => {
        this.handleWorkerMessage(worker, event);
      };

      worker.onerror = (error) => {
        console.error('Worker error:', error);
      };

      this.workers.push(worker);
      this.availableWorkers.push(worker);
    } catch (error) {
      console.error('Failed to create worker:', error);
    }
  }

  handleWorkerMessage(worker, event) {
    const { taskId, result, error } = event.data;

    // Find task callback
    const taskIndex = this.taskQueue.findIndex(t => t.id === taskId && t.worker === worker);
    if (taskIndex !== -1) {
      const task = this.taskQueue[taskIndex];
      this.taskQueue.splice(taskIndex, 1);

      if (error) {
        task.reject(new Error(error));
      } else {
        task.resolve(result);
      }
    }

    // Return worker to pool
    this.availableWorkers.push(worker);

    // Process next task
    this.processQueue();
  }

  async execute(taskData) {
    return new Promise((resolve, reject) => {
      const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.taskQueue.push({
        id: taskId,
        data: taskData,
        resolve,
        reject,
        worker: null
      });

      this.processQueue();
    });
  }

  processQueue() {
    if (this.availableWorkers.length === 0 || this.taskQueue.length === 0) {
      return;
    }

    const worker = this.availableWorkers.shift();
    const task = this.taskQueue.find(t => t.worker === null);

    if (task) {
      task.worker = worker;
      worker.postMessage({
        taskId: task.id,
        data: task.data
      });
    } else {
      this.availableWorkers.push(worker);
    }
  }

  terminate() {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.availableWorkers = [];
    this.taskQueue = [];
  }

  getStats() {
    return {
      poolSize: this.poolSize,
      activeWorkers: this.poolSize - this.availableWorkers.length,
      queuedTasks: this.taskQueue.filter(t => t.worker === null).length,
      processingTasks: this.taskQueue.filter(t => t.worker !== null).length
    };
  }
}

// Example worker script creator
export function createWorkerScript(processFn) {
  const workerCode = `
    self.onmessage = async (event) => {
      const { taskId, data } = event.data;
      
      try {
        const result = await (${processFn.toString()})(data);
        self.postMessage({ taskId, result });
      } catch (error) {
        self.postMessage({ taskId, error: error.message });
      }
    };
  `;

  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return URL.createObjectURL(blob);
}

// Example usage functions
export function createDataProcessingWorker() {
  const processFn = async (data) => {
    // Heavy data processing
    if (data.type === 'parse_csv') {
      // Parse large CSV
      const lines = data.content.split('\n');
      return lines.map(line => line.split(','));
    }
    
    if (data.type === 'calculate_metrics') {
      // Complex calculations
      return data.values.reduce((acc, val) => acc + val, 0) / data.values.length;
    }

    return null;
  };

  return createWorkerScript(processFn);
}

// Singleton for common tasks
let globalWorkerPool = null;

export function getWorkerPool() {
  if (!globalWorkerPool && typeof Worker !== 'undefined') {
    const workerScript = createDataProcessingWorker();
    globalWorkerPool = new WebWorkerPool(workerScript);
  }
  return globalWorkerPool;
}

export default WebWorkerPool;