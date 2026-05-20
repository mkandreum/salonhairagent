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
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    const loadNotifications = () => {
      fetchNotifications().then((data: any) => {
        setNotifications(Array.isArray(data) ? data : [])
        setHasLoaded(true)
      }).catch(() => { setHasLoaded(true) })
    }

    loadNotifications()
    const interval = setInterval(loadNotifications, 15000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchNotifications().then((data: any) => {
        setNotifications(Array.isArray(data) ? data : [])
      }).catch(console.error)
    }
  }, [isOpen])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-505" />
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-505" />
      case 'info': return <Info className="w-5 h-5 text-slate-500" />
      default: return <Bell className="w-5 h-5 text-slate-505" />
    }
  }

  const markAsRead = async (id: number) => {
    try {
      await markNotificationRead(id)
      setNotifications(notifications.map((n: any) => n.id === id ? { ...n, read: true } : n))
    } catch (err) { console.error(err) }
  }

  const deleteNotification = async (id: number) => {
    try {
      await apiDeleteNotification(id)
      setNotifications(notifications.filter((n: any) => n.id !== id))
    } catch (err) { console.error(err) }
  }

  const markAllAsRead = async () => {
    try {
      for (const n of notifications) {
        if (!n.read) await markNotificationRead(n.id)
      }
      setNotifications(notifications.map((n: any) => ({ ...n, read: true })))
    } catch (err) { console.error(err) }
  }

  const unreadCount = notifications.filter((n: any) => !n.read).length

  return (
    <div className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 z-50" style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-12 h-12 md:w-14 md:h-14 app-card border border-amber-500/10 flex items-center justify-center hover:scale-105 transition-all active:scale-95 ripple-host shadow-2xl"
      >
        <Bell className="w-5 h-5 md:w-6 md:h-6 text-slate-600 dark:text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-amber-500 text-white text-[10px] font-bold rounded-lg flex items-center justify-center border-2 border-white dark:border-slate-900 anim-glow-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-16 md:bottom-20 right-0 w-[calc(100vw-32px)] md:w-[400px] app-card border border-amber-500/20 backdrop-blur-xl rounded-2xl overflow-hidden max-h-[70vh] flex flex-col shadow-2xl animate-fade-float-in">
          <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/10 flex items-center justify-center border border-amber-500/10">
                <Bell className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">Notificaciones</h3>
                <p className="text-xs text-slate-500">{unreadCount} nuevas</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="p-2 hover:bg-slate-100/10 dark:hover:bg-slate-850/50 rounded-lg text-slate-600 dark:text-slate-400 transition-colors" title="Marcar todas como leídas">
                  <CheckCheck className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100/10 dark:hover:bg-slate-850/50 rounded-lg transition-colors">
                <X className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {!hasLoaded ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-slate-300 dark:border-slate-700 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400 text-sm">Cargando...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100/10 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-800/40 flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-7 h-7 text-slate-350 dark:text-slate-600" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map((notification: any) => (
                <div
                  key={notification.id}
                  className={`p-4 md:p-5 border-b border-slate-100/50 dark:border-slate-800/45 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all relative animate-fade-float-in ${!notification.read ? 'bg-amber-500/[0.04] dark:bg-amber-500/[0.02]' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="mt-1 flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">{notification.title}</h4>
                          {!notification.read && <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{notification.message}</p>
                        <p className="text-[10px] text-slate-400 mt-2">{notification.time}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {!notification.read && (
                        <button onClick={() => markAsRead(notification.id)} className="p-1.5 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 border border-slate-200/20 dark:border-slate-700/30 rounded-lg transition-all" title="Marcar como leída">
                          <CheckCircle className="w-4 h-4 text-slate-500" />
                        </button>
                      )}
                      <button onClick={() => deleteNotification(notification.id)} className="p-1.5 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-red-100 dark:hover:bg-red-900/20 border border-slate-200/20 dark:border-slate-700/30 rounded-lg transition-all" title="Eliminar">
                        <Trash2 className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
