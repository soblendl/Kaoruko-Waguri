import axios from 'axios';
import { randomUUID } from 'crypto';

export class UploadService {
    static STORAGE_ZONE = 'olasoy';
    static ACCESS_KEY = 'd4dc5458-3015-4408-aff39f7a63bf-7977-4f9e';
    static STORAGE_URL = 'https://storage.bunnycdn.com';
    static CDN_URL = 'https://soblendz.b-cdn.net';
    static async uploadToCatbox(buffer) {
        return await this.uploadToBunny(buffer);
    }
    static async uploadToBunny(buffer) {
        try {
            let ext = 'jpg';
            try {
                const fileTypeModule = await import('file-type');
                const fileTypeFromBuffer = fileTypeModule.fileTypeFromBuffer || fileTypeModule.default?.fileTypeFromBuffer;
                if (fileTypeFromBuffer && buffer) {
                    const type = await fileTypeFromBuffer(buffer);
                    if (type) ext = type.ext;
                }
            } catch (e) {
                console.warn('Could not detect file type, defaulting to jpg');
            }
            const filename = `waifus/${randomUUID()}.${ext}`;
            const uploadUrl = `${this.STORAGE_URL}/${this.STORAGE_ZONE}/${filename}`;
            console.log(`[UploadService] Uploading to Bunny CDN: ${filename}`);
            const response = await axios.put(uploadUrl, buffer, {
                headers: {
                    'AccessKey': this.ACCESS_KEY,
                    'Content-Type': 'application/octet-stream'
                },
                timeout: 60000 
            });
            if (response.status === 201 || response.status === 200) {
                const cdnUrl = `${this.CDN_URL}/${filename}`;
                console.log(`[UploadService] Upload successful: ${cdnUrl}`);
                return cdnUrl;
            } else {
                throw new Error(`Bunny CDN Error: ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            console.error('[UploadService] Bunny CDN Error:', error.message);
            throw error;
        }
    }
}