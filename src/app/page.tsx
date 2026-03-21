export const metadata = { title: '503 – Service Unavailable' }

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white px-4">
      <p className="text-gray-500 text-sm font-mono mb-2">503 Service Unavailable</p>
      <h1 className="text-3xl font-bold mb-4">Under Maintenance</h1>
      <p className="text-gray-400 text-center max-w-md">
        The poll is temporarily closed. Check back soon!
      </p>
    </main>
  )
}
