import React from 'react'

export default function page() {
  return (
    <div>
      <div className="w-64 h-64 bg-brand text-white p-4">Brand Default</div>
      <div className="w-64 h-64 bg-brand-light text-brand-dark p-4">Brand Variants</div>
      <div className="w-64 h-64 bg-accent text-white p-4">Accent Color</div>
      <div className="w-64 h-64 bg-primary text-white p-4">HSL Primary</div>

    </div>
  )
}
