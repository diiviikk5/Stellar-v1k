// Utility functions for Stellar-v1k

export const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

export const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

export const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return `${formatDate(isoString)} ${formatTimestamp(isoString)}`;
};

export const formatNumber = (num, decimals = 2) => {
    return Number(num).toFixed(decimals);
};

export const formatPercentage = (num) => {
    return `${formatNumber(num, 1)}%`;
};

export const getRiskColor = (level) => {
    switch (level.toUpperCase()) {
        case 'LOW': return 'text-stellar-emerald';
        case 'MEDIUM': return 'text-stellar-amber';
        case 'HIGH': return 'text-stellar-rose';
        default: return 'text-slate-400';
    }
};

export const getStatusColor = (status) => {
    switch (status) {
        case 'healthy': return 'stellar-emerald';
        case 'warning': return 'stellar-amber';
        case 'flagged': return 'stellar-rose';
        default: return 'slate-400';
    }
};

export const classNames = (...classes) => {
    return classes.filter(Boolean).join(' ');
};

// Debounce function
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle function
export const throttle = (func, limit) => {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// CSV Export
export const exportToCSV = (data, filename) => {
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
};

// Linear interpolation
export const lerp = (start, end, t) => {
    return start * (1 - t) + end * t;
};

// Clamp value
export const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
};

// Map value from one range to another
export const mapRange = (value, inMin, inMax, outMin, outMax) => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};
