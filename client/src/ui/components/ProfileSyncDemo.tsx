import React from 'react'
import { useAuth } from '../../store/auth'

// Demo component to show current user data from auth store
export const ProfileSyncDemo: React.FC = () => {
  const { name, email, avatar, role } = useAuth()

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-800/90 backdrop-blur-md border border-gray-600 rounded-lg p-4 text-white text-sm max-w-xs">
      <h3 className="font-semibold mb-2 text-blue-400">Auth Store Data:</h3>
      <div className="space-y-1">
        <div><strong>Name:</strong> {name || 'Not set'}</div>
        <div><strong>Email:</strong> {email || 'Not set'}</div>
        <div><strong>Role:</strong> {role || 'Not set'}</div>
        <div><strong>Avatar:</strong> {avatar ? 'Set' : 'Not set'}</div>
      </div>
    </div>
  )
}
