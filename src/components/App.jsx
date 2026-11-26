import ThemeToggle from './ThemeToggle'

export default function App() {
  return (
    <main className="grid min-h-svh place-items-center">
      <div className="flex items-center gap-4">
        <h1 className="font-display text-5xl">Golfroshi</h1>
        <ThemeToggle />
      </div>
    </main>
  )
}
