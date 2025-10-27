import React from 'react'
import { useAuth } from '../../store/auth'

// Component to test user data isolation
export const UserDataTest: React.FC = () => {
  const { users, name, email, phone, dob } = useAuth()

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-gray-800/90 backdrop-blur-md border border-gray-600 rounded-lg p-4 text-white text-xs max-w-sm">
      <h3 className="font-semibold mb-2 text-blue-400">User Data Test:</h3>
      <div className="space-y-1">
        <div><strong>Current User:</strong> {name || 'Not logged in'}</div>
        <div><strong>Email:</strong> {email || 'Not set'}</div>
        <div><strong>Phone:</strong> {phone || 'Not set'}</div>
        <div><strong>DOB:</strong> {dob || 'Not set'}</div>
        <hr className="my-2 border-gray-600" />
        <div><strong>Total Users:</strong> {users.length}</div>
        <div className="text-xs text-gray-400">
          {users.map(user => (
            <div key={user.id} className="truncate">
              {user.name} - {user.phone || 'No phone'} - {user.dob || 'No DOB'}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
