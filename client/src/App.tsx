import { useQuery } from '@tanstack/react-query'

function App() {
  const { data } = useQuery({
    queryKey: ['health'],
    queryFn: () => fetch('/api/health').then(r => r.json()),
  })

  return (
    <div className="min-h-screen bg-[#F8F5EF] text-[#5F5247] p-8">
      <h1 className="text-2xl font-semibold">Honey Nest Dashboard</h1>
      <p className="mt-2 text-[#8D8175]">
        {data ? `Connected — ${data.status}` : 'Connecting...'}
      </p>
    </div>
  )
}

export default App
