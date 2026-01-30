import './globals.css'

export const metadata = {
  title: '💰 Schedine Tracker',
  description: 'Traccia le tue schedine sportive con autenticazione',
}

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
