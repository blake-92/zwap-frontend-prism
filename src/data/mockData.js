import {
  TrendingUp, BarChart3, Timer, Landmark,
  CheckCircle2, XCircle, RotateCcw, RefreshCcw, Clock,
  Wallet, AlertOctagon, LinkIcon, Smartphone,
} from 'lucide-react'

export const BRANCHES = ['Hotel de Sal', 'Hotel de Piedra', 'Hotel del Mar']

export const NAV_ITEMS = [
  { id: 'dashboard',      label: 'Dashboard',        icon: 'LayoutDashboard' },
  { id: 'links',          label: 'Links de Pago',     icon: 'Link' },
  { id: 'transacciones',  label: 'Transacciones',     icon: 'ArrowRightLeft' },
  { id: 'liquidaciones',  label: 'Liquidaciones',     icon: 'Wallet' },
  { id: 'usuarios',       label: 'Usuarios',          icon: 'Users' },
  { id: 'sucursales',     label: 'Sucursales',        icon: 'Building2' },
]

export const KPIS = [
  { label: 'Volumen Hoy',        value: '$1,850.00', change: '+12%',       icon: TrendingUp, variant: 'success' },
  { label: 'Por Cobrar (Links)', value: '$1,240.00', change: '5 pendientes', icon: Timer,     variant: 'warning' },
  { label: 'En Tránsito',        value: '$3,772.00', change: 'Llega mañana', icon: Landmark,  variant: 'default' },
  { label: 'Éxito de Reservas',  value: '92.5%',     change: '+2.1%',       icon: BarChart3, variant: 'success' },
]

export const TRANSACTIONS = [
  {
    id: 'TRX-9823', client: 'Michael Scott', email: 'michael.s@dundermifflin.com',
    initials: 'MS', country: 'Estados Unidos', countryCode: 'us',
    card: 'Visa', last4: '4242', date: '29 Mar, 2026', time: '14:30 hrs',
    amount: '1,250.00', status: 'Exitoso', statusVariant: 'success', StatusIcon: CheckCircle2,
    channel: 'Link de Pago', ChannelIcon: LinkIcon,
  },
  {
    id: 'TRX-9824', client: null, email: null, initials: null,
    country: 'Desconocido', countryCode: 'xx',
    card: 'Mastercard', last4: '8812', date: '29 Mar, 2026', time: '11:15 hrs',
    amount: '450.00', status: 'Exitoso', statusVariant: 'success', StatusIcon: CheckCircle2,
    channel: 'Terminal POS', ChannelIcon: Smartphone,
  },
  {
    id: 'TRX-9825', client: 'Liam Johnson', email: 'liam.j@yahoo.co.uk',
    initials: 'LJ', country: 'Reino Unido', countryCode: 'gb',
    card: 'Amex', last4: '1005', date: '28 Mar, 2026', time: '19:45 hrs',
    amount: '890.00', status: 'Reembolsado', statusVariant: 'danger', StatusIcon: RotateCcw,
    channel: 'Link de Pago', ChannelIcon: LinkIcon,
  },
  {
    id: 'TRX-9826', client: 'Carlos Mendoza', email: 'cmendoza@empresa.cl',
    initials: 'CM', country: 'Chile', countryCode: 'cl',
    card: 'Visa', last4: '5521', date: '28 Mar, 2026', time: '09:20 hrs',
    amount: '2,100.00', status: 'Exitoso', statusVariant: 'success', StatusIcon: CheckCircle2,
    channel: 'Terminal POS', ChannelIcon: Smartphone,
  },
]

export const PERMANENT_LINKS = [
  { id: 'p1', name: 'Recepción',   desc: 'Monto abierto para cobros rápidos en mostrador', url: 'zwap.pe/hsal/rec',   active: true },
  { id: 'p2', name: 'Restaurante', desc: 'Consumos extras y propinas',                     url: 'zwap.pe/hsal/rest',  active: true },
  { id: 'p3', name: 'Tours',       desc: 'Anticipos de paquetes',                          url: 'zwap.pe/hsal/tours', active: false },
]

export const WITHDRAWALS = [
  { id: '#WTH-8892', date: '20 Oct, 2026', amount: '2,400.00', bank: 'Mercantil SCZ •••• 1234', status: 'Procesando',  statusVariant: 'default', StatusIcon: RefreshCcw },
  { id: '#WTH-8841', date: '12 Oct, 2026', amount: '1,150.00', bank: 'Mercantil SCZ •••• 1234', status: 'Completado',  statusVariant: 'success', StatusIcon: CheckCircle2 },
  { id: '#WTH-8720', date: '28 Sep, 2026', amount: '3,800.00', bank: 'Mercantil SCZ •••• 1234', status: 'Completado',  statusVariant: 'success', StatusIcon: CheckCircle2 },
  { id: '#WTH-8655', date: '14 Sep, 2026', amount: '500.00',   bank: 'Mercantil SCZ •••• 1234', status: 'Fallido',     statusVariant: 'danger',  StatusIcon: XCircle },
]

export const PAYOUTS = [
  {
    type: 'Liquidación', typeIcon: Wallet,
    closeDate: '28 Mar 2026', closeTime: '20:00',
    gross: 3250, trxCount: 14,
    fees: { pos: { amount: 160, rate: '8%' }, links: { amount: 75, rate: '6%' } },
    adj: 0, net: 3015, depositDate: '30 Mar 2026',
    status: 'Procesando', statusVariant: 'default', StatusIcon: Clock,
  },
  {
    type: 'Liquidación', typeIcon: Wallet,
    closeDate: '27 Mar 2026', closeTime: '20:00',
    gross: 4100, trxCount: 22,
    fees: { pos: { amount: 328, rate: '8%' } },
    adj: 0, net: 3772, depositDate: '29 Mar 2026',
    status: 'En Tránsito', statusVariant: 'warning', StatusIcon: Landmark,
  },
  {
    type: 'Disputa', typeIcon: AlertOctagon,
    closeDate: '26 Mar 2026', closeTime: '14:30',
    gross: 0, trxCount: 0, fees: {},
    adj: -150, adjReason: 'TRX-9821', net: -150, depositDate: '-',
    status: 'Retenido', statusVariant: 'outline', StatusIcon: AlertOctagon,
  },
  {
    type: 'Devolución Parcial', typeIcon: RotateCcw,
    closeDate: '26 Mar 2026', closeTime: '09:15',
    gross: 0, trxCount: 0, fees: {},
    adj: -50, adjReason: 'TRX-9800', net: -50, depositDate: '-',
    status: 'Compensado', statusVariant: 'outline', StatusIcon: CheckCircle2,
  },
  {
    type: 'Liquidación', typeIcon: Wallet,
    closeDate: '25 Mar 2026', closeTime: '20:00',
    gross: 5600, trxCount: 31,
    fees: { pos: { amount: 312, rate: '8%' }, links: { amount: 102, rate: '6%' } },
    adj: 0, net: 5186, depositDate: '27 Mar 2026',
    status: 'Depositado', statusVariant: 'success', StatusIcon: CheckCircle2,
  },
]

export const USERS = [
  { id: '1', initials: 'C', name: 'carlos', email: 'carlos@zwap.com', role: 'Contador',       branches: ['Sucursal Principal'],                        active: true,  variant: 'warning' },
  { id: '2', initials: 'P', name: 'pablo',  email: 'pablo@zwap.com',  role: 'Contador',       branches: ['Hotel de Sal'],                               active: true,  variant: 'warning' },
  { id: '3', initials: 'J', name: 'juan',   email: 'juan@zwap.com',   role: 'Recepcionista',  branches: ['Hotel de Sal', 'Hotel de Madera', 'Sucursal Norte'], active: true, variant: 'success' },
  { id: '4', initials: 'S', name: 'saul',   email: 'saul@zwap.com',   role: 'Administrador',  branches: ['Hotel de Sal', 'Sucursal Principal'],         active: true,  variant: 'default' },
]

export const BRANCH_LIST = [
  { id: '1', name: 'Sucursal Principal', address: 'Av. Principal 123, Ciudad', users: 3, isMain: true },
  { id: '2', name: 'Hotel de Sal',       address: 'Potosí, Bolivia',           users: 3, isMain: false },
  { id: '3', name: 'Hotel de Madera',    address: 'Beni, Bolivia',             users: 1, isMain: false },
]

export const CUSTOM_LINKS = [
  {
    id: 'L-1029', client: 'Alice Smith',   email: 'alice@example.com',  initials: 'AS',
    amount: '350.00',   items: 2, expires: 'En 2 horas',   createdAt: '29 Mar 2026, 08:30', views: 3,
    status: 'Pendiente', statusVariant: 'warning', StatusIcon: Timer,
  },
  {
    id: 'L-1028', client: 'Bob Jones',     email: 'bob@example.com',    initials: 'BJ',
    amount: '1,200.00', items: 4, expires: '-',             createdAt: '28 Mar 2026, 14:15', views: 1,
    status: 'Pagado',   statusVariant: 'success', StatusIcon: CheckCircle2,
  },
  {
    id: 'L-1027', client: 'Carlos Ruiz',   email: 'cr@example.com',     initials: 'CR',
    amount: '150.00',   items: 1, expires: 'Ayer, 18:00',  createdAt: '27 Mar 2026, 18:00', views: 0,
    status: 'Expirado', statusVariant: 'danger', StatusIcon: XCircle,
  },
  {
    id: 'L-1026', client: 'Emma Watson',   email: 'emma@agency.uk',     initials: 'EW',
    amount: '890.00',   items: 3, expires: 'En 48 horas',  createdAt: '28 Mar 2026, 09:20', views: 5,
    status: 'Pendiente', statusVariant: 'warning', StatusIcon: Timer,
  },
]
