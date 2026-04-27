'use client'

import { useState, useEffect } from 'react'
import { Bell, CheckCircle, AlertCircle, Info, X, Trash2, CheckCheck } from 'lucide-react'
import { fetchNotifications, markNotificationRead, deleteNotification as apiDeleteNotification } from '@/lib/api'

interface Notification {
  id: number
  type: 'success' | 'warning' | 'info'
  title: string
  message: string
  time: string
  read: boolean
}

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchNotifications().then(setNotifications)
    }
  }, [isOpen])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-500" />
      case 'info': return <Info className="w-5 h-5 text-indigo-500" />
      default: return <Bell className="w-5 h-5 text-slate-500" />
    }
  }

  const markAsRead = async (id: number) => {
    await markNotificationRead(id)
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ))
  }

  const deleteNotification = async (id: number) => {
    await apiDeleteNotification(id)
    setNotifications(notifications.filter(notification => notification.id !== id))
  }

  const markAllAsRead = async () => {
    for (const n of notifications) {
      if (!n.read) await markNotificationRead(n.id)
    }
    setNotifications(notifications.map(notification => ({ ...notification, read: true })))
  }


  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:scale-110 transition-all active:scale-95"
      >
        <Bell className={`w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:shake transition-transform`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-indigo-600 text-white text-[10px] font-bold rounded-lg flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-lg">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[400px] glass-card overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-300">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">Notificaciones</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{unreadCount} nuevas</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={markAllAsRead}
                title="Marcar todas como leídas"
                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-indigo-600 dark:text-indigo-400"
              >
                <CheckCheck className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-5 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all relative group ${!notification.read ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm leading-tight">{notification.title}</h4>
                          {!notification.read && <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{notification.message}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">{notification.time}</p>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 hover:text-indigo-600 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50">
              <button className="w-full py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm">
                Ver todo el historial
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}