// src/app/dashboard/page.tsx
import dynamic from 'next/dynamic'

const ClientDashboard = dynamic(() => import('./client-page'), { ssr: false })

export default function DashboardPage() {
  return <ClientDashboard />
}
