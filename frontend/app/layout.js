import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata = {
    title: 'Голос війни',
    description: 'Цифровий архів спогадів про події війни',
}

export default function RootLayout({ children }) {
    return (
        <html lang="uk">
        <body>
        <AuthProvider>
            <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
                <Header />
                <main className="flex-1">
                    {children}
                </main>
                <Footer />
            </div>
        </AuthProvider>
        </body>
        </html>
    )
}