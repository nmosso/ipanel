export const navItems: any[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'nav-icon fas fa-tachometer-alt' },
    auth: ['client', 'admin', 'superadmin'],
  },
  {
    name: 'Clients',
    url: '/clients',
    auth: ['client', 'admin', 'superadmin'],
    iconComponent: { name: 'nav-icon fas fa-regular fa-user'}
  },
  {
    name: 'Stock',
    url: '/devices',
    auth: ['client', 'admin', 'superadmin'],
    iconComponent: { name: 'nav-icon fas fa-regular fa-tv' }
  },
  {
    name: 'SuperAdmin',
    url: '/videos',
    auth: ['superadmin'],
    iconComponent: { name: 'nav-icon fas fa-regular fa-file-video' }
  }
];
