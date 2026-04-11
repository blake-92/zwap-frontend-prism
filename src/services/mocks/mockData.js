import {
  TrendingUp, BarChart3, Timer, Landmark,
  CheckCircle2, XCircle, RotateCcw, RefreshCcw, Clock,
  Wallet, AlertOctagon, LinkIcon, Smartphone, CircleDot,
} from 'lucide-react'

export const BRANCHES = ['Sucursal Principal', 'Hotel de Sal', 'Hotel de Madera']

export const WALLET_BALANCE = { raw: 11694.00, display: '$11,694.00', short: '$11.7K' }

export const WALLET_STEPS = [
  { label: 'Iniciado',         sub: '20 Oct, 08:12', icon: CheckCircle2, done: true,  active: false },
  { label: 'Procesando',       sub: '20 Oct, 10:35', icon: CheckCircle2, done: true,  active: false },
  { label: 'Enviado al Banco', sub: 'En proceso...',  icon: RefreshCcw,   done: false, active: true  },
  { label: 'Completado',       sub: 'Pendiente',      icon: CircleDot,    done: false, active: false },
]

export const ALERTS = [
  {
    icon: Timer, iconColor: 'amber', title: 'Link expira en 2 hrs',
    body: 'Reserva de Alice Smith ($350.00)',
    action: { label: 'Ver Link', variant: 'outline' },
  },
  {
    icon: AlertOctagon, iconColor: 'rose', title: 'Disputa Abierta',
    body: 'Pago de $150.00 reportado como fraude (Visa •••• 4242).',
    action: { label: 'Gestionar Evidencia', variant: 'danger' },
  },
  {
    icon: Landmark, iconColor: 'emerald', title: 'Depósito Confirmado',
    body: 'Liquidación del 25 Mar ($5,356.00) acreditada en tu cuenta.',
    action: null,
  },
]

export const CHART_DATA = [
  { name: 'Lun', pos: 2400, links: 4000 },
  { name: 'Mar', pos: 1398, links: 3000 },
  { name: 'Mié', pos: 9800, links: 2000 },
  { name: 'Jue', pos: 3908, links: 2780 },
  { name: 'Vie', pos: 4800, links: 1890 },
  { name: 'Sáb', pos: 3800, links: 2390 },
  { name: 'Hoy', pos: 4300, links: 3490 },
]


export const KPIS = [
  { label: 'Volumen Hoy',        value: '$1,850.00', change: '+12%',       icon: TrendingUp, variant: 'success' },
  { label: 'Por Cobrar (Links)', value: '$1,240.00', change: '5 pendientes', icon: Timer,     variant: 'warning' },
  { label: 'En Tránsito',        value: '$3,899.00', change: 'Llega mañana', icon: Landmark,  variant: 'default' },
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
  {
    id: 'TRX-9827', client: 'Sarah Connor', email: 'sarah.c@gmail.com',
    initials: 'SC', country: 'Reino Unido', countryCode: 'gb',
    card: 'Visa', last4: '2049', date: '28 Mar, 2026', time: '08:15 hrs',
    amount: '150.00', status: 'Pendiente', statusVariant: 'warning', StatusIcon: Timer,
    channel: 'Link de Pago', ChannelIcon: LinkIcon,
  },
  {
    id: 'TRX-9828', client: 'Bruce Wayne', email: 'b.wayne@wayne.com',
    initials: 'BW', country: 'Estados Unidos', countryCode: 'us',
    card: 'Amex', last4: '0001', date: '27 Mar, 2026', time: '22:45 hrs',
    amount: '5,000.00', status: 'Exitoso', statusVariant: 'success', StatusIcon: CheckCircle2,
    channel: 'Link de Pago', ChannelIcon: LinkIcon,
  },
  {
    id: 'TRX-9829', client: null, email: null, initials: null,
    country: 'Desconocido', countryCode: 'xx',
    card: 'Mastercard', last4: '3333', date: '27 Mar, 2026', time: '16:30 hrs',
    amount: '80.00', status: 'Exitoso', statusVariant: 'success', StatusIcon: CheckCircle2,
    channel: 'Terminal POS', ChannelIcon: Smartphone,
  },
  {
    id: 'TRX-9830', client: 'Elena Gomez', email: 'egomez@hotmail.com',
    initials: 'EG', country: 'España', countryCode: 'es',
    card: 'Visa', last4: '9901', date: '27 Mar, 2026', time: '14:20 hrs',
    amount: '320.00', status: 'Exitoso', statusVariant: 'success', StatusIcon: CheckCircle2,
    channel: 'Link de Pago', ChannelIcon: LinkIcon,
  },
  {
    id: 'TRX-9831', client: 'John Doe', email: 'john.doe@test.com',
    initials: 'JD', country: 'Canada', countryCode: 'ca',
    card: 'Visa', last4: '4567', date: '26 Mar, 2026', time: '10:00 hrs',
    amount: '1,500.00', status: 'Reembolsado', statusVariant: 'danger', StatusIcon: RotateCcw,
    channel: 'Terminal POS', ChannelIcon: Smartphone,
  },
  {
    id: 'TRX-9832', client: 'Jane Smith', email: 'jane.smith@test.com',
    initials: 'JS', country: 'Australia', countryCode: 'au',
    card: 'Mastercard', last4: '8899', date: '26 Mar, 2026', time: '11:30 hrs',
    amount: '900.00', status: 'Exitoso', statusVariant: 'success', StatusIcon: CheckCircle2,
    channel: 'Link de Pago', ChannelIcon: LinkIcon,
  },
]

export const PERMANENT_LINKS = [
  { id: 'p1', name: 'Recepción',   desc: 'Monto abierto para cobros rápidos en mostrador', url: 'zwap.me/hsal/rec',   active: true },
  { id: 'p2', name: 'Restaurante', desc: 'Consumos extras y propinas',                     url: 'zwap.me/hsal/rest',  active: true },
  { id: 'p3', name: 'Tours',       desc: 'Anticipos de paquetes',                          url: 'zwap.me/hsal/tours', active: false },
]

export const WITHDRAWALS = [
  { id: '#WTH-8892', date: '20 Oct, 2026', amount: '2,400.00', bank: 'Mercantil SCZ •••• 1234', status: 'Procesando',  statusVariant: 'default', StatusIcon: RefreshCcw },
  { id: '#WTH-8841', date: '12 Oct, 2026', amount: '1,150.00', bank: 'Mercantil SCZ •••• 1234', status: 'Completado',  statusVariant: 'success', StatusIcon: CheckCircle2 },
  { id: '#WTH-8720', date: '28 Sep, 2026', amount: '3,800.00', bank: 'Mercantil SCZ •••• 1234', status: 'Completado',  statusVariant: 'success', StatusIcon: CheckCircle2 },
  { id: '#WTH-8655', date: '14 Sep, 2026', amount: '500.00',   bank: 'Mercantil SCZ •••• 1234', status: 'Fallido',     statusVariant: 'danger',  StatusIcon: XCircle },
  { id: '#WTH-8590', date: '01 Sep, 2026', amount: '4,200.00', bank: 'Mercantil SCZ •••• 1234', status: 'Completado',  statusVariant: 'success', StatusIcon: CheckCircle2 },
  { id: '#WTH-8422', date: '18 Aug, 2026', amount: '890.00',   bank: 'Mercantil SCZ •••• 1234', status: 'Completado',  statusVariant: 'success', StatusIcon: CheckCircle2 },
  { id: '#WTH-8311', date: '05 Aug, 2026', amount: '2,100.00', bank: 'Mercantil SCZ •••• 1234', status: 'Completado',  statusVariant: 'success', StatusIcon: CheckCircle2 },
  { id: '#WTH-8205', date: '22 Jul, 2026', amount: '3,300.00', bank: 'Mercantil SCZ •••• 1234', status: 'Completado',  statusVariant: 'success', StatusIcon: CheckCircle2 },
  { id: '#WTH-8100', date: '10 Jul, 2026', amount: '1,500.00', bank: 'Mercantil SCZ •••• 1234', status: 'Completado',  statusVariant: 'success', StatusIcon: CheckCircle2 },
  { id: '#WTH-8045', date: '28 Jun, 2026', amount: '600.00',   bank: 'Mercantil SCZ •••• 1234', status: 'Completado',  statusVariant: 'success', StatusIcon: CheckCircle2 },
  { id: '#WTH-7990', date: '14 Jun, 2026', amount: '4,800.00', bank: 'Mercantil SCZ •••• 1234', status: 'Fallido',     statusVariant: 'danger',  StatusIcon: XCircle },
  { id: '#WTH-7888', date: '01 Jun, 2026', amount: '2,950.00', bank: 'Mercantil SCZ •••• 1234', status: 'Completado',  statusVariant: 'success', StatusIcon: CheckCircle2 },
]

export const PAYOUTS = [
  {
    type: 'Liquidación', typeIcon: Wallet,
    closeDate: '28 Mar 2026', closeTime: '20:00',
    gross: 3250, trxCount: 14,
    fees: { pos: { amount: 108, rate: '4.9%' }, links: { amount: 84, rate: '3%' } },
    adj: 0, net: 3058, depositDate: '30 Mar 2026',
    status: 'Procesando', statusVariant: 'default', StatusIcon: Clock,
  },
  {
    type: 'Liquidación', typeIcon: Wallet,
    closeDate: '27 Mar 2026', closeTime: '20:00',
    gross: 4100, trxCount: 22,
    fees: { pos: { amount: 201, rate: '4.9%' } },
    adj: 0, net: 3899, depositDate: '29 Mar 2026',
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
    fees: { pos: { amount: 172, rate: '4.9%' }, links: { amount: 72, rate: '3%' } },
    adj: 0, net: 5356, depositDate: '27 Mar 2026',
    status: 'Depositado', statusVariant: 'success', StatusIcon: CheckCircle2,
  },
  {
    type: 'Liquidación', typeIcon: Wallet,
    closeDate: '24 Mar 2026', closeTime: '20:00',
    gross: 2100, trxCount: 10,
    fees: { pos: { amount: 103, rate: '4.9%' } },
    adj: 0, net: 1997, depositDate: '26 Mar 2026',
    status: 'Depositado', statusVariant: 'success', StatusIcon: CheckCircle2,
  },
  {
    type: 'Liquidación', typeIcon: Wallet,
    closeDate: '23 Mar 2026', closeTime: '20:00',
    gross: 3400, trxCount: 18,
    fees: { links: { amount: 102, rate: '3%' } },
    adj: 0, net: 3298, depositDate: '25 Mar 2026',
    status: 'Depositado', statusVariant: 'success', StatusIcon: CheckCircle2,
  },
  {
    type: 'Liquidación', typeIcon: Wallet,
    closeDate: '22 Mar 2026', closeTime: '20:00',
    gross: 1500, trxCount: 5,
    fees: { pos: { amount: 74, rate: '4.9%' } },
    adj: 0, net: 1426, depositDate: '24 Mar 2026',
    status: 'Depositado', statusVariant: 'success', StatusIcon: CheckCircle2,
  },
]

export const USERS = [
  { id: '1', initials: 'CS', name: 'Carlos Smith',   email: 'carlos@zwap.com', role: 'Contador',       branches: ['Sucursal Principal'],                        active: true,  variant: 'warning' },
  { id: '2', initials: 'PG', name: 'Pablo García',   email: 'pablo@zwap.com',  role: 'Contador',       branches: ['Hotel de Sal'],                               active: true,  variant: 'warning' },
  { id: '3', initials: 'JR', name: 'Juan Rodríguez', email: 'juan@zwap.com',   role: 'Recepcionista',  branches: ['Hotel de Sal', 'Hotel de Madera', 'Sucursal Principal'], active: true, variant: 'success' },
  { id: '4', initials: 'SM', name: 'Saul Mendoza',   email: 'saul@zwap.com',   role: 'Administrador',  branches: ['Hotel de Sal', 'Sucursal Principal'],         active: true,  variant: 'default' },
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

/* ── Chart sub-data (Conversión & Métodos tabs) ── */
export const CONVERSION_DATA = [
  { day: 'Lun', value: 60 },
  { day: 'Mar', value: 80 },
  { day: 'Mié', value: 45 },
  { day: 'Jue', value: 90 },
  { day: 'Vie', value: 75 },
  { day: 'Sáb', value: 85 },
  { day: 'Hoy', value: 95 },
]

export const PAYMENT_METHODS = [
  { label: 'Visa',       val: 65, color: '#7C3AED' },
  { label: 'Mastercard', val: 25, color: '#10B981' },
  { label: 'Amex',       val: 10, color: '#F59E0B' },
]

/* ── Current user & settings ── */
export const CURRENT_USER = {
  initials: 'CS',
  name: 'Carlos Smith',
  displayName: 'Admin Zwap',
  role: 'Administrador',
  email: 'carlos@hotel.com',
}

export const PLAN_INFO = {
  name: 'Prism Enterprise',
  tier: 'Pro',
  price: '$299.00/mes',
  renewDate: '15 Nov, 2026',
}

export const SESSIONS = [
  { id: 's1', device: 'MacBook Pro - Chrome', icon: 'desktop', location: 'Santa Cruz, BO', isCurrent: true, lastActive: null },
  { id: 's2', device: 'iPhone 14 Pro - Safari', icon: 'phone', location: 'Santa Cruz, BO', isCurrent: false, lastActive: 'Activo hace 2 horas' },
]

export const PAYMENT_CARD = {
  brand: 'Visa',
  last4: '4242',
  expiry: '12/28',
  isPrimary: true,
}

/* ── Bank account ── */
export const BANK_ACCOUNT = {
  name: 'Banco Mercantil Santa Cruz',
  shortName: 'Banco Mercantil SCZ',
  last4: '1234',
}

/* ── Settlement summary KPIs ── */
export const SETTLEMENT_SUMMARY = {
  inTransit: '$3,899.00',
  inTransitBadge: 'En limpieza (2 días hábiles)',
  adjustments: '-$150.00',
  adjustmentsBadge: 'Requiere atención',
}
