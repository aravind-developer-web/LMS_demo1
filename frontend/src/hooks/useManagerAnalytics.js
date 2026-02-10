import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Enterprise-grade Manager Analytics Hook
 * 
 * Features:
 * - Auto-refresh with configurable intervals
 * - Manual refresh capability
 * - Stale data detection
 * - Error handling with retry logic
 * - Data freshness tracking
 * 
 * @param {number} refreshInterval - Auto-refresh interval in milliseconds (default: 60000)
 * @returns {Object} Analytics data, loading state, error state, and control functions
 */
export const useManagerAnalytics = (refreshInterval = 60000) => {
    const [teamSummary, setTeamSummary] = useState(null);
    const [learners, setLearners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const fetchData = useCallback(async (isRetry = false) => {
        try {
            if (!isRetry) {
                setLoading(true);
            }
            setError(null);

            const [summaryRes, learnersRes] = await Promise.all([
                api.get('/analytics/manager/team-summary/'),
                api.get('/analytics/manager/learners/')
            ]);

            setTeamSummary({
                ...summaryRes.data,
                computed_at: summaryRes.data.computed_at || new Date().toISOString()
            });

            setLearners(learnersRes.data.map(learner => ({
                ...learner,
                computed_at: learner.computed_at || new Date().toISOString()
            })));

            setLastUpdated(new Date());
            setRetryCount(0);

            console.debug('[useManagerAnalytics] Data refreshed successfully');
        } catch (err) {
            console.error('[useManagerAnalytics] Fetch failed:', err);

            const errorMessage = err.response?.data?.error ||
                err.response?.data?.detail ||
                'Failed to load analytics data';

            setError({
                message: errorMessage,
                status: err.response?.status,
                timestamp: new Date()
            });

            // Retry logic for transient errors (5xx, network errors)
            if (err.response?.status >= 500 || !err.response) {
                if (retryCount < 3) {
                    console.warn(`[useManagerAnalytics] Retrying... (${retryCount + 1}/3)`);
                    setTimeout(() => {
                        setRetryCount(prev => prev + 1);
                        fetchData(true);
                    }, Math.min(1000 * Math.pow(2, retryCount), 10000)); // Exponential backoff
                }
            }
        } finally {
            setLoading(false);
        }
    }, [retryCount]);

    // Auto-refresh effect
    useEffect(() => {
        fetchData();

        if (refreshInterval > 0) {
            const interval = setInterval(() => {
                console.debug('[useManagerAnalytics] Auto-refresh triggered');
                fetchData();
            }, refreshInterval);

            return () => clearInterval(interval);
        }
    }, [fetchData, refreshInterval]);

    // Manual refresh function
    const refresh = useCallback(async () => {
        console.debug('[useManagerAnalytics] Manual refresh triggered');
        setRetryCount(0);
        await fetchData();
    }, [fetchData]);

    // Stale data detection (data older than 2 minutes)
    const isStale = useCallback(() => {
        if (!lastUpdated) return false;
        const ageSeconds = (Date.now() - lastUpdated.getTime()) / 1000;
        return ageSeconds > 120;
    }, [lastUpdated]);

    // Data freshness in seconds
    const dataAge = useCallback(() => {
        if (!lastUpdated) return null;
        return Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
    }, [lastUpdated]);

    return {
        teamSummary,
        learners,
        loading,
        error,
        lastUpdated,
        refresh,
        isStale: isStale(),
        dataAge: dataAge(),
        hasData: !!(teamSummary && learners.length >= 0)
    };
};

/**
 * Hook for individual learner details with on-demand fetching
 * 
 * @param {number} learnerId - ID of the learner to fetch details for
 * @param {boolean} enabled - Whether to auto-fetch (default: false)
 * @returns {Object} Learner details, loading state, and fetch function
 */
export const useLearnerDetails = (learnerId, enabled = false) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchDetails = useCallback(async () => {
        if (!learnerId) return;

        try {
            setLoading(true);
            setError(null);

            const response = await api.get(`/analytics/manager/${learnerId}/details/`);

            setDetails({
                ...response.data,
                computed_at: response.data.computed_at || new Date().toISOString()
            });
            setLastUpdated(new Date());

            console.debug(`[useLearnerDetails] Details fetched for learner ${learnerId}`);
        } catch (err) {
            console.error(`[useLearnerDetails] Fetch failed for learner ${learnerId}:`, err);
            setError(err.response?.data?.error || 'Failed to load learner details');
        } finally {
            setLoading(false);
        }
    }, [learnerId]);

    useEffect(() => {
        if (enabled && learnerId) {
            fetchDetails();
        }
    }, [enabled, learnerId, fetchDetails]);

    return {
        details,
        loading,
        error,
        lastUpdated,
        fetchDetails,
        refresh: fetchDetails
    };
};

export default useManagerAnalytics;
