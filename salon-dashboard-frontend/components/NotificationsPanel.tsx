'use client'

import { Bell, CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { useState } from 'react'

interface Notification {
  id: number
  type: 'success' | 'warning' | 'info'
  title: string
  message: string
  time: string
  read: boolean
}

const initialNotifications: Notification[] = [
  { id: 1, type: 'success', title: 'Appointment Confirmed', message: 'Sarah Johnson confirmed her 2:00 PM appointment', time: '10 min ago', read: false },
  { id: 2, type: 'warning', title: 'No-show Alert', message: 'Michael Brown missed his 11:00 AM appointment', time: '1 hour ago', read: false },
  { id: 3, type: 'info', title: 'New Client Registered', message: 'Lisa Anderson registered via WhatsApp', time: '2 hours ago', read: true },
  { id: 4, type: 'success', title: 'Payment Received', message: 'Payment of $85 received from Robert Taylor', time: '3 hours ago', read: true },
  { id: 5, type: 'warning', title: 'Low Inventory', message: 'Hair color stock running low', time: '5 hours ago', read: true },
]

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const [isOpen, setIsOpen] = useState(false)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'info': return <Info className="w-5 h-5 text-blue-500" />
      default: return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ))
  }

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notification => notification.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative bg-white rounded-full shadow-lg p-4 hover:shadow-xl transition-shadow"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 bg-white rounded-lg shadow-xl border">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-gray-700" />
              <h3 className="font-bold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={markAllAsRead}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Mark all as read
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification.type)}
                      <div>
                        <h4 className="font-medium text-gray-800">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-primary-600 hover:text-primary-700"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t">
            <button className="w-full text-center text-primary-600 hover:text-primary-700 font-medium">
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  )
}