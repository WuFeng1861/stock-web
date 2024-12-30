// 预定义渐变色组合
export const gradients = [
  { from: 'from-blue-50', to: 'to-indigo-50', border: 'border-blue-100' },
  { from: 'from-green-50', to: 'to-emerald-50', border: 'border-green-100' },
  { from: 'from-purple-50', to: 'to-violet-50', border: 'border-purple-100' },
  { from: 'from-amber-50', to: 'to-orange-50', border: 'border-amber-100' },
  { from: 'from-pink-50', to: 'to-rose-50', border: 'border-pink-100' },
  { from: 'from-cyan-50', to: 'to-sky-50', border: 'border-cyan-100' }
]

export function getRandomGradient() {
  return gradients[Math.floor(Math.random() * gradients.length)]
}