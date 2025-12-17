/**
 * STELLAR-v1k Global State Store
 * Using Zustand for reactive state management
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export const useAppStore = create(
    subscribeWithSelector((set, get) => ({
        // AI State
        aiStatus: {
            isReady: false,
            isLoading: false,
            error: null,
            lastInferenceTime: null
        },

        // Live Data State
        liveDataEnabled: false,
        liveUpdates: {},
        lastFleetUpdate: null,

        // Forecasting State
        forecasts: {},
        activeForecast: null,
        forecastHistory: [],

        // UI State
        selectedSatellite: null,
        selectedHorizon: '2h',
        isRunningForecast: false,
        notifications: [],

        // Chat Assistant State
        chatOpen: false,
        chatMessages: [],
        chatLoading: false,

        // Actions
        setAIStatus: (status) => set((state) => ({
            aiStatus: { ...state.aiStatus, ...status }
        })),

        setLiveDataEnabled: (enabled) => set({ liveDataEnabled: enabled }),

        updateLiveData: (satelliteId, data) => set((state) => ({
            liveUpdates: {
                ...state.liveUpdates,
                [satelliteId]: data
            },
            lastFleetUpdate: new Date().toISOString()
        })),

        setForecast: (satelliteId, forecast) => set((state) => ({
            forecasts: {
                ...state.forecasts,
                [satelliteId]: forecast
            }
        })),

        setActiveForecast: (forecast) => set({ activeForecast: forecast }),

        addForecastToHistory: (forecast) => set((state) => ({
            forecastHistory: [...state.forecastHistory.slice(-50), forecast]
        })),

        setSelectedSatellite: (sat) => set({ selectedSatellite: sat }),
        setSelectedHorizon: (horizon) => set({ selectedHorizon: horizon }),
        setIsRunningForecast: (running) => set({ isRunningForecast: running }),

        // Notifications
        addNotification: (notification) => set((state) => ({
            notifications: [
                ...state.notifications,
                { ...notification, id: Date.now(), timestamp: new Date().toISOString() }
            ].slice(-10)
        })),

        removeNotification: (id) => set((state) => ({
            notifications: state.notifications.filter(n => n.id !== id)
        })),

        clearNotifications: () => set({ notifications: [] }),

        // Chat
        setChatOpen: (open) => set({ chatOpen: open }),
        setChatLoading: (loading) => set({ chatLoading: loading }),

        addChatMessage: (message) => set((state) => ({
            chatMessages: [...state.chatMessages, {
                ...message,
                id: Date.now(),
                timestamp: new Date().toISOString()
            }]
        })),

        clearChatMessages: () => set({ chatMessages: [] }),

        // Computed getters
        getFleetHealth: () => {
            const updates = get().liveUpdates;
            const satellites = Object.values(updates);
            if (satellites.length === 0) return { healthy: 0, warning: 0, critical: 0 };

            return satellites.reduce((acc, sat) => {
                if (sat.status === 'anomaly') acc.critical++;
                else if (Math.abs(sat.clock?.bias || 0) > 1) acc.warning++;
                else acc.healthy++;
                return acc;
            }, { healthy: 0, warning: 0, critical: 0 });
        }
    }))
);

// Selector hooks for common patterns
export const useAIStatus = () => useAppStore(state => state.aiStatus);
export const useLiveData = (satelliteId) => useAppStore(state => state.liveUpdates[satelliteId]);
export const useForecast = (satelliteId) => useAppStore(state => state.forecasts[satelliteId]);
export const useNotifications = () => useAppStore(state => state.notifications);
export const useChatMessages = () => useAppStore(state => state.chatMessages);
