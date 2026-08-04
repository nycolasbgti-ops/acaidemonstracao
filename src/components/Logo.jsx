import React from 'react'
import logoImg from '../assets/logo.png'

export default function Logo({ className = 'h-10 w-auto object-contain' }) {
  return <img src={logoImg} alt="Açaí Concept" className={className} />
}
