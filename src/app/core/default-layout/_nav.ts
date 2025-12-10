export const navItems: any[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'nav-icon fas fa-tachometer-alt' },
    auth: ['tenant', 'admin', 'superadmin'],
  },
  {
    name: 'Clients',
    url: '/clients',
    auth: ['tenant', 'admin', 'superadmin'],
    iconComponent: { name: 'nav-icon fas fa-regular fa-user'}
  },
  {
    name: 'Stock',
    url: '/devices',
    auth: ['tenant', 'admin', 'superadmin'],
    iconComponent: { name: 'nav-icon fas fa-regular fa-tv' }
  },
  {
    name: 'Resellers',
    url: '/resellers',
    auth: ['superadmin','admin'],
    iconComponent: { name: 'nav-icon fas fa-regular fa-file-video' }
  },
  {
    name: 'Parameters',
    url: '/params',
    auth: ['tenant', 'superadmin', 'admin'],
    iconComponent: { name: 'nav-icon fas fa-regular fa-file-video' }
  },
  {
    name: 'SuperAdmin',
    url: '/videos',
    auth: ['superadmin'],
    iconComponent: { name: 'nav-icon fas fa-regular fa-file-video' }
  },
  {
    name: 'Usuarios',
    url: '/users',
    auth: ['superadmin'],
    iconComponent: { name: 'nav-icon fas fa-regular fa-file-video' }
  }
];
