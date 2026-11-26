import { FlowerMark } from './Logo'

export default function Loading({ label }) {
  return (
    <div role="status" className="grid min-h-[60svh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-muted">
        <FlowerMark className="size-10 animate-spin [animation-duration:2.4s] motion-reduce:animate-none" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  )
}
