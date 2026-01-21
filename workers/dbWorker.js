import { parentPort } from 'worker_threads';
import fs from 'fs';
import path from 'path';

// Listen for messages from the main thread
parentPort.on('message', async (task) => {
    const { type, data, id } = task;

    try {
        if (type === 'save') {
            const { dbPath, collections } = data;

            // Ensure directory exists
            if (!fs.existsSync(dbPath)) {
                fs.mkdirSync(dbPath, { recursive: true });
            }

            // Write each collection to file
            for (const [name, items] of Object.entries(collections)) {
                const filePath = path.join(dbPath, `${name}.json`);
                // Use sync write for atomic-like operation in worker (blocking only the worker)
                // Or async write if we want to be non-blocking even in worker
                // Sync is safer for data integrity in simple JSON DBs

                // Handle circular references
                const getCircularReplacer = () => {
                    const seen = new WeakSet();
                    return (key, value) => {
                        if (typeof value === "object" && value !== null) {
                            if (seen.has(value)) {
                                return;
                            }
                            seen.add(value);
                        }
                        return value;
                    };
                };

                fs.writeFileSync(filePath, JSON.stringify(items, getCircularReplacer(), 2));
            }

            parentPort.postMessage({ id, success: true });
        }
    } catch (error) {
        console.error('DB Worker Error:', error);
        parentPort.postMessage({ id, success: false, error: error.message });
    }
});
