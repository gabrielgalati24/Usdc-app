import { Outlet } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { Header } from './header'

export function DashboardLayout() {
    return (
        <div className="min-h-screen bg-neutral-950">
            <Sidebar />
            <div className="pl-64 w-full min-h-screen">
                <Header />
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
