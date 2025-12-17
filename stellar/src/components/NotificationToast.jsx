/**
 * Notification Toast Component
 * Display system notifications with animations
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useNotifications, useAppStore } from '../store/appStore';

const NOTIFICATION_ICONS = {
    success: CheckCircleIcon,
    warning: ExclamationTriangleIcon,
    error: XCircleIcon,
    info: InformationCircleIcon
};

const NOTIFICATION_COLORS = {
    success: 'bg-stellar-emerald/10 border-stellar-emerald/30 text-stellar-emerald',
    warning: 'bg-stellar-amber/10 border-stellar-amber/30 text-stellar-amber',
    error: 'bg-stellar-rose/10 border-stellar-rose/30 text-stellar-rose',
    info: 'bg-stellar-cyan/10 border-stellar-cyan/30 text-stellar-cyan'
};

const NotificationToast = () => {
    const notifications = useNotifications();
    const removeNotification = useAppStore(state => state.removeNotification);

    // Auto-dismiss notifications
    useEffect(() => {
        notifications.forEach(notification => {
            if (!notification.persistent) {
                const timer = setTimeout(() => {
                    removeNotification(notification.id);
                }, notification.duration || 5000);

                return () => clearTimeout(timer);
            }
        });
    }, [notifications]);

    return (
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm">
            <AnimatePresence>
                {notifications.map((notification) => {
                    const Icon = NOTIFICATION_ICONS[notification.type] || InformationCircleIcon;
                    const colorClass = NOTIFICATION_COLORS[notification.type] || NOTIFICATION_COLORS.info;

                    return (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: 100, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.9 }}
                            className={`
                                relative p-4 rounded-xl border backdrop-blur-xl shadow-2xl
                                ${colorClass}
                            `}
                        >
                            <button
                                onClick={() => removeNotification(notification.id)}
                                className="absolute top-2 right-2 p-1 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>

                            <div className="flex items-start gap-3 pr-6">
                                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-white">{notification.title}</h4>
                                    {notification.message && (
                                        <p className="text-sm opacity-80 mt-1">{notification.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Progress bar for auto-dismiss */}
                            {!notification.persistent && (
                                <motion.div
                                    className="absolute bottom-0 left-0 h-0.5 bg-current opacity-30 rounded-b-xl"
                                    initial={{ width: '100%' }}
                                    animate={{ width: '0%' }}
                                    transition={{ duration: (notification.duration || 5000) / 1000, ease: 'linear' }}
                                />
                            )}
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

export default NotificationToast;
