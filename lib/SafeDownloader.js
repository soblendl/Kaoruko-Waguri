import axios from 'axios';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { pipeline } from 'stream/promises';
import { createWriteStream, createReadStream } from 'fs';
import { randomUUID } from 'crypto';
import memoryManager, { MEMORY_LIMITS } from './MemoryManager.js';

const TEMP_DIR = path.join(os.tmpdir(), 'kaoruko-downloads');
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
} else {
    purgeAllTempFiles();
}
function cleanupTempFiles() {
    try {
        if (!fs.existsSync(TEMP_DIR)) return;
        const files = fs.readdirSync(TEMP_DIR);
        const now = Date.now();
        const maxAge = 5 * 60 * 1000; 
        for (const file of files) {
            const filePath = path.join(TEMP_DIR, file);
            try {
                const stats = fs.statSync(filePath);
                if (now - stats.mtimeMs > maxAge) {
                    fs.unlinkSync(filePath);
                }
            } catch (e) {
                try { fs.unlinkSync(filePath); } catch (_) {}
            }
        }
    } catch (e) {
        console.error('[SafeDownloader] Error limpiando archivos temporales:', e.message);
    }
}
function purgeAllTempFiles() {
    try {
        console.warn('[SafeDownloader] ⚠️ PURGANDO TODOS LOS ARCHIVOS TEMPORALES');
        if (!fs.existsSync(TEMP_DIR)) return;
        const files = fs.readdirSync(TEMP_DIR);
        let count = 0;
        for (const file of files) {
            try {
                fs.unlinkSync(path.join(TEMP_DIR, file));
                count++;
            } catch (_) {}
        }
        console.warn(`[SafeDownloader] 🧹 Eliminados ${count} archivos`);
    } catch (e) {
        console.error('[SafeDownloader] Error en purga:', e.message);
    }
}
setInterval(cleanupTempFiles, 2 * 60 * 1000);
async function getRemoteFileSize(url, timeout = 10000) {
    try {
        const response = await axios.head(url, {
            timeout,
            maxRedirects: 5,
            validateStatus: (status) => status < 400
        });
        const contentLength = response.headers['content-length'];
        return contentLength ? parseInt(contentLength, 10) : null;
    } catch (error) {
        try {
            const response = await axios.get(url, {
                timeout: 5000,
                headers: { 'Range': 'bytes=0-0' },
                maxRedirects: 5,
                validateStatus: (status) => status < 400
            });
            const contentRange = response.headers['content-range'];
            if (contentRange) {
                const match = contentRange.match(/\/(\d+)/);
                if (match) return parseInt(match[1], 10);
            }
        } catch (e) {
            // No se pudo obtener el tamaño
        }
        return null;
    }
}

/**
 * Descarga un archivo de forma segura usando streams
 * @param {string} url - URL del archivo a descargar
 * @param {Object} options - Opciones de descarga
 * @returns {Promise<{success: boolean, filePath?: string, buffer?: Buffer, error?: string}>}
 */
async function safeDownload(url, options = {}) {
    const {
        maxSize = MEMORY_LIMITS.MAX_DOWNLOAD_SIZE,
        timeout = 60000,
        returnBuffer = false,
        headers = {}
    } = options;
    const downloadId = randomUUID();
    let tempFilePath = null;
    try {
        // Verificar si podemos procesar la descarga
        const canProcess = memoryManager.canProcessDownload(maxSize);
        if (!canProcess.allowed) {
            return {
                success: false,
                error: canProcess.message,
                reason: canProcess.reason
            };
        }

        // Intentar obtener el tamaño del archivo primero
        const remoteSize = await getRemoteFileSize(url);
        
        if (remoteSize !== null) {
            if (remoteSize > maxSize) {
                return {
                    success: false,
                    error: `ꕤ Archivo muy grande (${memoryManager.formatBytes(remoteSize)}). Máximo: ${memoryManager.formatBytes(maxSize)}`,
                    reason: 'FILE_TOO_LARGE',
                    actualSize: remoteSize
                };
            }
            
            // Verificar nuevamente con el tamaño real
            const canProcessReal = memoryManager.canProcessDownload(remoteSize);
            if (!canProcessReal.allowed) {
                return {
                    success: false,
                    error: canProcessReal.message,
                    reason: canProcessReal.reason
                };
            }
        }

        // Registrar el buffer
        memoryManager.registerBuffer(downloadId, remoteSize || maxSize, { url });

        // Crear archivo temporal
        tempFilePath = path.join(TEMP_DIR, `${downloadId}.tmp`);

        // Descargar usando stream a archivo
        const response = await axios({
            method: 'GET',
            url,
            responseType: 'stream',
            timeout,
            headers,
            maxContentLength: maxSize,
            maxBodyLength: maxSize,
            onDownloadProgress: (progressEvent) => {
                // Verificar que no exceda el límite durante la descarga
                if (progressEvent.loaded > maxSize) {
                    response.data.destroy(new Error('FILE_TOO_LARGE'));
                }
            }
        });

        // Verificar content-length del response
        const contentLength = response.headers['content-length'];
        if (contentLength && parseInt(contentLength) > maxSize) {
            response.data.destroy();
            return {
                success: false,
                error: `ꕤ Archivo muy grande. Máximo: ${memoryManager.formatBytes(maxSize)}`,
                reason: 'FILE_TOO_LARGE'
            };
        }

        // Stream a archivo temporal con límite de tamaño
        let downloadedBytes = 0;
        const writeStream = createWriteStream(tempFilePath);
        
        await new Promise((resolve, reject) => {
            response.data.on('data', (chunk) => {
                downloadedBytes += chunk.length;
                if (downloadedBytes > maxSize) {
                    response.data.destroy();
                    writeStream.destroy();
                    reject(new Error('FILE_TOO_LARGE'));
                }
            });
            
            response.data.on('error', reject);
            writeStream.on('error', reject);
            writeStream.on('finish', resolve);
            
            response.data.pipe(writeStream);
        });

        memoryManager.stats.totalDownloads++;

        // Si se necesita buffer, leer el archivo
        if (returnBuffer) {
            const buffer = fs.readFileSync(tempFilePath);
            
            // Limpiar archivo temporal después de leer
            try {
                fs.unlinkSync(tempFilePath);
            } catch (e) {
                // Ignorar error de limpieza
            }
            
            return {
                success: true,
                buffer,
                size: buffer.length,
                contentType: response.headers['content-type']
            };
        }

        return {
            success: true,
            filePath: tempFilePath,
            size: downloadedBytes,
            contentType: response.headers['content-type']
        };

    } catch (error) {
        memoryManager.stats.failedDownloads++;
        
        // Limpiar archivo temporal si existe
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
            } catch (e) {
                // Ignorar
            }
        }

        let errorMessage = 'ꕤ Error al descargar el archivo.';
        
        if (error.message === 'FILE_TOO_LARGE') {
            errorMessage = `ꕤ El archivo es muy grande. Máximo: ${memoryManager.formatBytes(maxSize)}`;
        } else if (error.code === 'ENOSPC') {
            errorMessage = 'ꕤ No hay espacio suficiente. Intenta más tarde.';
            memoryManager.forceCleanup();
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
            errorMessage = 'ꕤ Tiempo de espera agotado. Intenta de nuevo.';
        } else if (error.response?.status === 404) {
            errorMessage = 'ꕤ Archivo no encontrado.';
        }

        return {
            success: false,
            error: errorMessage,
            reason: error.code || error.message
        };

    } finally {
        // Siempre liberar el buffer registrado
        memoryManager.releaseBuffer(downloadId);
    }
}

/**
 * Descarga un archivo pequeño directamente a buffer (para archivos < 5MB)
 * Usa streaming pero retorna buffer para compatibilidad
 */
async function downloadSmallFile(url, options = {}) {
    const maxSize = Math.min(options.maxSize || 5 * 1024 * 1024, MEMORY_LIMITS.MAX_BUFFER_SIZE);
    
    return safeDownload(url, {
        ...options,
        maxSize,
        returnBuffer: true
    });
}

/**
 * Wrapper para enviar media de forma segura
 * Descarga a archivo temporal y envía por URL local o stream
 */
async function safeMediaDownload(url, options = {}) {
    const result = await safeDownload(url, {
        ...options,
        returnBuffer: false
    });

    if (!result.success) {
        return result;
    }

    // Retornar ruta del archivo para que el bot lo envíe
    return {
        success: true,
        filePath: result.filePath,
        size: result.size,
        contentType: result.contentType,
        // Función para limpiar después de usar
        cleanup: () => {
            if (result.filePath && fs.existsSync(result.filePath)) {
                try {
                    fs.unlinkSync(result.filePath);
                } catch (e) {
                    // Ignorar
                }
            }
        }
    };
}

/**
 * Verifica si una URL es segura para descargar (no excede límites)
 */
async function checkDownloadSafe(url) {
    const size = await getRemoteFileSize(url);
    const canProcess = memoryManager.canProcessDownload(size || MEMORY_LIMITS.MAX_DOWNLOAD_SIZE);
    
    return {
        safe: canProcess.allowed,
        size,
        formattedSize: size ? memoryManager.formatBytes(size) : 'Desconocido',
        reason: canProcess.reason,
        message: canProcess.message
    };
}

export {
    safeDownload,
    downloadSmallFile,
    safeMediaDownload,
    checkDownloadSafe,
    getRemoteFileSize,
    cleanupTempFiles,
    purgeAllTempFiles,
    TEMP_DIR
};

export default {
    safeDownload,
    downloadSmallFile,
    safeMediaDownload,
    checkDownloadSafe,
    getRemoteFileSize,
    cleanupTempFiles,
    purgeAllTempFiles
};
