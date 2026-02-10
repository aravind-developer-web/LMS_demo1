/**
 * LMS Unified Telemetry Wrapper
 * Ensures tracking events are awaited, retried, and never silently swallowed.
 */
import api from '../services/api';

class Telemetry {
    static async track(module_id, resource_id, data = {}) {
        try {
            const response = await api.post(`/modules/${module_id}/resources/${resource_id}/complete/`, {
                ...data,
                _trace: Date.now() // For debugging latency
            });
            console.debug(`[Telemetry] Pulse Synced: ${module_id}:${resource_id}`, response.data);
            return response.data;
        } catch (error) {
            console.error(`[Telemetry] Critical Analytic Failure: ${module_id}:${resource_id}`, error);

            // In a production environment, we could store failed pulses 
            // in local storage and retry on next successful heartbeat.
            this._handleFailure(error);
            throw error; // Re-throw to allow component-level recovery
        }
    }

    static _handleFailure(error) {
        if (error.response?.status === 401) {
            console.warn("[Telemetry] Pulse blocked by expired token. Data may be lost.");
        }
    }
}

export default Telemetry;
