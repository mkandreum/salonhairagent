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

interface NotificationsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
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
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-400" />
      case 'warning': return <AlertCircle className="w-5 h-5 text-[#E5C17B]" />
      case 'info': return <Info className="w-5 h-5 text-white/50" />
      default: return <Bell className="w-5 h-5 text-white/50" />
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

  if (!isOpen) return null

  return (
    <div className="absolute top-12 right-0 w-[calc(100vw-32px)] md:w-[400px] app-card-overlay border border-[#E5C17B]/20 rounded-2xl overflow-hidden max-h-[70vh] flex flex-col shadow-2xl animate-fade-float-in z-50">
      <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#E5C17B]/10 flex items-center justify-center border border-[#E5C17B]/10">
            <Bell className="w-5 h-5 text-[#E5C17B]" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm md:text-base leading-none">Notificaciones</h3>
            <p className="text-xs text-white/50 mt-1 font-mono">{unreadCount} nuevas</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="p-2 hover:bg-white/[0.04] rounded-lg text-white/40 hover:text-[#E5C17B] transition-colors" title="Marcar todas como leídas">
              <CheckCheck className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          )}
          <button onClick={onClose} className="p-2 hover:bg-white/[0.04] rounded-lg transition-colors">
            <X className="w-4 h-4 md:w-5 md:h-5 text-white/40" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!hasLoaded ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-[#E5C17B] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white/50 text-sm font-medium">Cargando...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-7 h-7 text-white/40" />
            </div>
            <p className="text-white/50 text-sm font-medium">No tienes notificaciones</p>
          </div>
        ) : (
          notifications.map((notification: any) => (
            <div
              key={notification.id}
              className={`p-4 md:p-5 border-b border-white/5 hover:bg-white/[0.02] transition-all relative animate-fade-float-in ${!notification.read ? 'bg-[#E5C17B]/5' : 'bg-white/[0.01]'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="mt-1 flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-white text-sm truncate">{notification.title}</h4>
                      {!notification.read && <span className="w-2 h-2 rounded-full bg-[#E5C17B] flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-white/50 mt-1 line-clamp-2">{notification.message}</p>
                    <p className="text-white/30 font-mono text-[10px] mt-2">{notification.time}</p>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {!notification.read && (
                    <button onClick={() => markAsRead(notification.id)} className="p-1.5 bg-white/[0.03] hover:bg-emerald-500/10 border border-white/5 rounded-lg transition-all" title="Marcar como leída">
                      <CheckCircle className="w-4 h-4 text-white/30 hover:text-emerald-400" />
                    </button>
                  )}
                  <button onClick={() => deleteNotification(notification.id)} className="p-1.5 bg-white/[0.03] hover:bg-rose-500/10 border border-white/5 rounded-lg transition-all" title="Eliminar">
                    <Trash2 className="w-4 h-4 text-white/30 hover:text-rose-400" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
