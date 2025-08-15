"use client"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 lg:border-0">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button onClick={onMenuClick} className="lg:hidden p-2 text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="lg:hidden ml-2">
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7H4l5-5v5z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
