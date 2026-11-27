import { motion } from 'motion/react'

const ease = [0.22, 1, 0.36, 1]

// Word-by-word rise for the hero title, with Motion. Only transform is animated, so it stays cheap on phones.
export default function HeroTitle({ text, className }) {
  return (
    <h1 className={className} aria-label={text}>
      <span aria-hidden="true">
        {text.split(' ').map((word, i) => (
          <span key={i}>
            <span className="hero-word">
              <motion.span
                className="inline-block"
                initial={{ y: '105%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, ease, delay: 0.1 + i * 0.08 }}
              >
                {word}
              </motion.span>
            </span>{' '}
          </span>
        ))}
      </span>
    </h1>
  )
}

export function FadeUp({ delay = 0, className, children }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut', delay }}>
      {children}
    </motion.div>
  )
}
