export const metadata = { title: 'Under Maintenance' }

export default function MaintenancePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white px-4">
      <h1 className="text-3xl font-bold mb-4">Under Maintenance</h1>
      <p className="text-gray-400 text-center max-w-md">
        The poll is temporarily closed for maintenance. Check back soon!
      </p>
    </main>
  )
}
