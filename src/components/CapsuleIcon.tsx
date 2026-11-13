import { createLucideIcon } from 'lucide-react';

/**
 * A capsule coming back through an atmosphere, heat shield first, drawn on
 * the Lucide grid like the lander: its cone, the shield, the shock wave in
 * front of it and the wake behind.
 */
export const Capsule = createLucideIcon('capsule', [
  ['path', { d: 'M9.5 6h5l3.5 8H6z', key: 'cone' }],
  ['path', { d: 'M5 15c4.5 2.6 9.5 2.6 14 0', key: 'shield' }],
  ['path', { d: 'M3 18.5c5.5 4 12.5 4 18 0', key: 'shock' }],
  ['path', { d: 'M12 2v2', key: 'wake' }],
  ['path', { d: 'M7.5 2.5 9 4.5', key: 'wake-left' }],
  ['path', { d: 'M16.5 2.5 15 4.5', key: 'wake-right' }],
]);
