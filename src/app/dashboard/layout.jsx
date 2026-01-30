import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({ children }) {
    return (
        <>
            <Sidebar />
            <main style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '2rem',
                paddingLeft: '4rem' // Space for hamburger button
            }}>
                {children}
            </main>
        </>
    )
}

