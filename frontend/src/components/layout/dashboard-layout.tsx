import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { Header } from './header'

export function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-neutral-950">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="lg:pl-64 w-full min-h-screen">
                <Header onMenuClick={() => setSidebarOpen(true)} />
                <main className="p-4 sm:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
