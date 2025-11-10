import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LayoutProvider } from '@/contexts/LayoutContext'
import { AuthProvider } from '@/contexts/AuthContext'
import WidgetPanel from '@/components/WidgetPanel'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BikeMarket - Buy and Sell Bicycles in Estonia',
  description: 'Estonia\'s leading marketplace for bicycles, components, and parts.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <LayoutProvider>
            <WidgetPanel />
            {children}
          </LayoutProvider>
        </AuthProvider>
      </body>
    </html>
  )
}