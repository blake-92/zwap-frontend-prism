// Mapeos canonical entre los 4 role codes del backend y sus labels en castellano + colores.
//
// Backend devuelve `roleCode` en SCREAMING_SNAKE: OWNER / ADMIN / ACCOUNTANT / RECEPTIONIST.
// La UI muestra los nombres traducidos via i18n (`roles.{code}` → "Dueño" / "Administrador" /
// "Contador" / "Recepcionista"). Variants de Badge mantienen consistencia visual con la paleta.

export const ROLE_CODES = ['OWNER', 'ADMIN', 'ACCOUNTANT', 'RECEPTIONIST']

// Roles que se pueden ASIGNAR via "Invitar usuario" — OWNER queda fuera porque solo existe
// el primer user del merchant (creado en onboarding). Reasignar OWNER se hace desde "Editar
// roles" en otro user, no desde invite.
export const INVITABLE_ROLE_CODES = ['ADMIN', 'ACCOUNTANT', 'RECEPTIONIST']

export const ROLE_BADGE_VARIANT = {
  OWNER: 'default',
  ADMIN: 'default',
  ACCOUNTANT: 'warning',
  RECEPTIONIST: 'success',
}

// Solo RECEPTIONIST puede estar scoped a una branch específica. OWNER/ADMIN/ACCOUNTANT
// son globales (branchId siempre null). Esta regla viene del backend — el catálogo de
// roles dice qué roles permiten branch scoping. Lo replicamos client-side para no permitir
// asignaciones inválidas.
export const ROLE_ALLOWS_BRANCH_SCOPING = {
  OWNER: false,
  ADMIN: false,
  ACCOUNTANT: false,
  RECEPTIONIST: true,
}

// Backend devuelve role.branchName ya resuelto en GET /api/users — preferimos eso sobre
// resolver el id desde el branchesStore (menos coupling y siempre coherente con el server).
export const formatRoleAssignment = (t, role) => {
  const label = t(`roles.${role.roleCode}`)
  if (role.branchId && role.branchName) return `${label} @ ${role.branchName}`
  if (ROLE_ALLOWS_BRANCH_SCOPING[role.roleCode]) return label
  return `${label} (${t('roles.global')})`
}

export const STATUS_BADGE_VARIANT = {
  ACTIVE: 'success',
  PENDING_INVITE: 'warning',
  SUSPENDED: 'danger',
  ARCHIVED: 'default',
}
