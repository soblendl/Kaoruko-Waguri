import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import CircuitBreaker from 'opossum';
import Redis from 'ioredis';

export class RateLimiter {
    constructor() {
        this.limiters = {};
        this.circuitBreakers = {};
        this.redis = null;
        this.initLimiters();
        this.initCircuitBreakers();
    }

    initLimiters() {
        try {
            const redisUrl = process.env.REDIS_URL;
            if (redisUrl) {
                const redisClient = new Redis(redisUrl, {
                    enableOfflineQueue: false
                });

                this.limiters.commands = new RateLimiterRedis({
                    storeClient: redisClient,
                    keyPrefix: 'rl:cmd',
                    points: 10,
                    duration: 10,
                    blockDuration: 30
                });

                this.limiters.economy = new RateLimiterRedis({
                    storeClient: redisClient,
                    keyPrefix: 'rl:eco',
                    points: 5,
                    duration: 60,
                    blockDuration: 120
                });

                console.log('✅ Rate limiters con Redis configurados');
            } else {
                this.limiters.commands = new RateLimiterMemory({
                    points: 10,
                    duration: 10,
                    blockDuration: 30
                });

                this.limiters.economy = new RateLimiterMemory({
                    points: 5,
                    duration: 60,
                    blockDuration: 120
                });

                console.log('✅ Rate limiters en memoria configurados');
            }
        } catch (error) {
            console.error('Error configurando rate limiters:', error.message);
        }
    }

    initCircuitBreakers() {
        const options = {
            timeout: 10000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            rollingCountTimeout: 10000,
            rollingCountBuckets: 10
        };

        this.circuitBreakers.scraper = new CircuitBreaker(this.scraperFunction, options);
        this.circuitBreakers.api = new CircuitBreaker(this.apiFunction, options);

        this.circuitBreakers.scraper.on('open', () => {
            console.warn('⚠️ Circuit breaker abierto para scraper - demasiados errores');
        });

        this.circuitBreakers.scraper.on('halfOpen', () => {
            console.log('🔄 Circuit breaker en half-open para scraper - probando recuperación');
        });

        this.circuitBreakers.scraper.on('close', () => {
            console.log('✅ Circuit breaker cerrado para scraper - servicio recuperado');
        });

        console.log('✅ Circuit breakers configurados');
    }

    async scraperFunction(url, options) {
        throw new Error('Función scraper no implementada');
    }

    async apiFunction(endpoint, options) {
        throw new Error('Función API no implementada');
    }

    async checkCommandLimit(userId) {
        try {
            await this.limiters.commands.consume(userId);
            return { allowed: true };
        } catch (error) {
            if (error.remainingPoints !== undefined) {
                return {
                    allowed: false,
                    retryAfter: Math.ceil(error.msBeforeNext / 1000),
                    message: `Límite de comandos alcanzado. Espera ${Math.ceil(error.msBeforeNext / 1000)}s`
                };
            }
            throw error;
        }
    }

    async checkEconomyLimit(userId) {
        try {
            await this.limiters.economy.consume(userId);
            return { allowed: true };
        } catch (error) {
            if (error.remainingPoints !== undefined) {
                return {
                    allowed: false,
                    retryAfter: Math.ceil(error.msBeforeNext / 1000),
                    message: `Límite de acciones económicas alcanzado. Espera ${Math.ceil(error.msBeforeNext / 1000)}s`
                };
            }
            throw error;
        }
    }

    async executeWithCircuitBreaker(type, fn, ...args) {
        const breaker = this.circuitBreakers[type];
        
        if (!breaker) {
            return await fn(...args);
        }

        try {
            return await breaker.fire(...args);
        } catch (error) {
            if (error.message === 'Breaker is open') {
                throw new Error(`Servicio ${type} temporalmente no disponible. Intenta más tarde.`);
            }
            throw error;
        }
    }

    getStats() {
        const stats = {};

        for (const [name, breaker] of Object.entries(this.circuitBreakers)) {
            stats[name] = {
                state: breaker.status.stats,
                isOpen: breaker.opened,
                isHalfOpen: breaker.halfOpen
            };
        }

        return stats;
    }
}
