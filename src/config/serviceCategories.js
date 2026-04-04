/** Shared category config — ids must match API `Service.category` field. */

export const SERVICE_CATEGORIES = [
  {
    id: 'plumbing',
    name: 'Plumbing',
    description: 'Leaks, pipes, drains, installations',
    icon: '🔧',
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=800&q=80',
    color: '#2563eb',       // blue
    colorDim: '#dbeafe',
  },
  {
    id: 'home',
    name: 'Home Services',
    description: 'General home repair, electrical, carpentry',
    icon: '🏠',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
    color: '#d97706',       // amber
    colorDim: '#fef3c7',
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    description: 'Deep clean, regular housekeeping',
    icon: '✨',
    image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=800&q=80',
    color: '#059669',       // emerald
    colorDim: '#d1fae5',
  },
  {
    id: 'education',
    name: 'Education & Tutoring',
    description: 'Academic support, languages, skills',
    icon: '🎓',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    color: '#7c3aed',       // violet
    colorDim: '#ede9fe',
  },
  {
    id: 'moving',
    name: 'Moving & Delivery',
    description: 'Local moves, packing, transport',
    icon: '🚚',
    image: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&w=800&q=80',
    color: '#dc2626',       // red
    colorDim: '#fee2e2',
  },
  {
    id: 'pets',
    name: 'Pet Care',
    description: 'Walking, sitting, grooming',
    icon: '🐕',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
    color: '#ea580c',       // orange
    colorDim: '#ffedd5',
  },
  {
    id: 'tech',
    name: 'Tech Support',
    description: 'Repairs, setup, IT help',
    icon: '💻',
    image: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=800&q=80',
    color: '#0e7490',       // cyan
    colorDim: '#cffafe',
  },
  {
    id: 'wellness',
    name: 'Wellness & Fitness',
    description: 'Training, yoga, massage',
    icon: '🌿',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
    color: '#16a34a',       // green
    colorDim: '#dcfce7',
  },
];

export function getCategoryMeta(categoryId) {
  return SERVICE_CATEGORIES.find((c) => c.id === categoryId) || {
    id: categoryId,
    name: categoryId,
    description: '',
    icon: '📌',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
    color: '#4f46e5',
    colorDim: '#eef2ff',
  };
}
