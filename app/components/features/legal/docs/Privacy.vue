<script setup>
import LegalLayout from '../LegalLayout.vue'
import LegalSection from '../LegalSection.vue'
import LegalIntroBox from '../LegalIntroBox.vue'
import LegalCallout from '../LegalCallout.vue'
import LegalCardGrid from '../LegalCardGrid.vue'
import LegalDataTable from '../LegalDataTable.vue'

const { t } = useI18n()

const tocItems = [
  { id: 'intro', label: 'Introducción' },
  { id: 'responsable', label: 'Responsable' },
  { id: 'datos-recopilados', label: 'Datos' },
  { id: 'metodos', label: 'Métodos' },
  { id: 'finalidades', label: 'Finalidades' },
  { id: 'base-legal', label: 'Base Legal' },
  { id: 'comparticion', label: 'Compartición' },
  { id: 'ia', label: 'IA y KYC/KYB' },
  { id: 'transferencias', label: 'Transferencias Int.' },
  { id: 'retencion', label: 'Retención' },
  { id: 'seguridad', label: 'Seguridad' },
  { id: 'derechos', label: 'Derechos' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'menores', label: 'Menores' },
  { id: 'clientes-resp', label: 'Resp. Clientes' },
  { id: 'cambios', label: 'Cambios' },
  { id: 'contacto', label: 'Contacto' },
]

const clientesTable = {
  headers: ['Categoría', 'Datos Específicos'],
  rows: [
    ['Identidad personal', 'Nombre completo, fecha de nacimiento, nacionalidad, número de documento de identidad (CI, pasaporte), fotografía del documento.'],
    ['Datos del negocio', 'Razón social, nombre comercial, tipo de actividad turística, dirección del establecimiento, registro tributario (NIT u homólogos), licencias de operación, número de empleados, volumen de transacciones estimado.'],
    ['Contacto', 'Correo electrónico, número de teléfono, dirección postal, perfiles de redes sociales del negocio, sitio web.'],
    ['Datos financieros', 'Información de destino de liquidación (billetera virtual, cuenta bancaria en el exterior, cuenta corporativa en EE. UU.), historial de depósitos y balances. Zwap NO almacena datos completos de tarjetas de crédito/débito.'],
    ['Datos de onboarding', 'Toda la información proporcionada durante el proceso de registro y verificación KYC/KYB, incluyendo documentos cargados, respuestas al formulario inteligente, referencias comerciales, presencia digital verificable, y el score generado por el sistema de IA.'],
    ['Datos de uso', 'Actividad en el dashboard, transacciones procesadas, configuraciones de la cuenta, terminales registradas, enlaces de pago generados, reportes descargados, patrones de uso.'],
  ],
}

const viajerosTable = {
  headers: ['Categoría', 'Datos Específicos'],
  rows: [
    ['Datos de la transacción', 'Monto pagado, moneda, fecha y hora, método de pago utilizado (tipo de tarjeta), estado de la transacción, número de referencia.'],
    ['Datos de contacto', 'Correo electrónico y/o número de teléfono (cuando el Viajero los proporciona para recibir recibos o confirmaciones).'],
    ['Datos de pago', 'Los datos de tarjeta son procesados directamente por Stripe y NO son almacenados por Zwap. Zwap solo recibe datos parciales (últimos 4 dígitos, tipo de tarjeta, país de emisión) para fines de identificación.'],
  ],
}

const tecnicosTable = {
  headers: ['Categoría', 'Datos Específicos'],
  rows: [
    ['Dispositivo', 'Tipo de dispositivo, sistema operativo, versión del navegador, identificadores del dispositivo (para la app Tap to Pay), modelo del smartphone.'],
    ['Conexión', 'Dirección IP, proveedor de Internet, tipo de conexión.'],
    ['Navegación', 'Páginas visitadas, tiempo en cada sección, acciones realizadas, URLs de referencia, datos de clics e interacciones.'],
    ['Geolocalización', 'Ubicación aproximada basada en IP. Ubicación precisa solo cuando el Usuario lo autorice expresamente (ej: para funcionalidades de la app).'],
  ],
}

const metodos = [
  { label: 'Directamente de usted', desc: 'Cuando se registra, completa el onboarding, carga documentos, configura su cuenta, procesa transacciones, contacta a soporte o se comunica con nosotros.' },
  { label: 'Automáticamente', desc: 'Mediante cookies, píxeles de seguimiento, registros de servidor y tecnologías similares cuando utiliza la Plataforma, la app o visita nuestro sitio web.' },
  { label: 'De terceros', desc: 'De Stripe (datos de transacciones, verificaciones), de servicios de verificación de identidad, de fuentes públicas para validación de negocios y de proveedores de prevención de fraude.' },
  { label: 'Generados por IA', desc: 'Nuestro sistema de onboarding con inteligencia artificial genera un score de calificación (0-100) y análisis de riesgo basado en los datos proporcionados. Ver Sección 8 para detalles.' },
]

const baseLegalTable = {
  headers: ['Base Legal', 'Aplicación'],
  rows: [
    ['Ejecución contractual', 'Para proporcionar los Servicios que usted contrató: procesamiento de pagos, gestión de cuenta, liquidaciones, onboarding, soporte. Es la base principal para la mayoría de tratamientos.'],
    ['Obligación legal', 'Cumplimiento de normativas AML/CFT, KYC/KYB, obligaciones fiscales, requerimientos de autoridades judiciales o regulatorias, y retención de registros exigida por ley.'],
    ['Interés legítimo', 'Prevención de fraude, seguridad de la Plataforma, mejora del servicio, análisis de uso, y comunicaciones sobre el servicio contratado. Siempre equilibrando nuestros intereses con sus derechos.'],
    ['Consentimiento', 'Marketing directo, comunicaciones promocionales, uso de cookies no esenciales, y tratamiento de datos sensibles cuando aplique. Puede retirar su consentimiento en cualquier momento.'],
  ],
}

const comparticionTable = {
  headers: ['Destinatario', 'Datos Compartidos', 'Finalidad'],
  rows: [
    ['Stripe, Inc.', 'Datos de identidad, negocio, transacciones, datos de tarjeta (procesados directamente por Stripe)', 'Procesamiento de pagos, custodia de fondos, cumplimiento PCI-DSS, verificaciones KYC de Stripe'],
    ['Proveedores de liquidación', 'Datos de identificación y destino de fondos del Cliente', 'Ejecución de transferencias a billeteras virtuales o cuentas bancarias'],
    ['Clientes ↔ Viajeros', 'Datos de transacción necesarios (monto, referencia, estado)', 'Completar la transacción y permitir la prestación del Servicio Turístico'],
    ['Proveedores técnicos', 'Datos técnicos y de uso', 'Hosting, análisis, monitoreo, comunicaciones (email, push), almacenamiento'],
    ['Servicios de verificación', 'Datos de identidad y documentos', 'Verificación KYC/KYB, validación de documentos, prevención de fraude'],
    ['Autoridades competentes', 'Según requerimiento legal', 'Cumplimiento de órdenes judiciales, investigaciones regulatorias, obligaciones AML/CFT'],
    ['Asesores profesionales', 'Según necesidad', 'Asesoría legal, contable, auditoría, seguros'],
  ],
}

const transferenciasGrid = [
  { label: 'Estados Unidos', desc: 'Donde ZOKORP, LLC tiene su sede y donde se alojan los servidores principales de Stripe y otros proveedores de infraestructura.' },
  { label: 'Países de operación', desc: 'Bolivia (operación actual), y los países donde Zwap expanda sus servicios (Perú, Ecuador, Colombia, Argentina, entre otros).' },
  { label: 'Proveedores globales', desc: 'Países donde se ubican nuestros proveedores de servicios técnicos (hosting, análisis, comunicaciones, verificación de identidad).' },
]

const retencionTable = {
  headers: ['Tipo de Dato', 'Período de Retención'],
  rows: [
    ['Datos de cuenta activa', 'Mientras su cuenta permanezca activa y durante los 120 días posteriores a la terminación (período de retención de fondos por posibles contracargos).'],
    ['Datos de transacciones', 'Mínimo 5 años desde la fecha de la transacción, conforme a obligaciones fiscales, contables y regulatorias.'],
    ['Datos KYC/KYB', 'Mínimo 5 años desde la terminación de la relación, conforme a regulaciones AML/CFT.'],
    ['Datos de disputas', 'Hasta la resolución definitiva de la disputa más un período adicional de 3 años para posibles reclamaciones.'],
    ['Registros de acceso', '12 meses desde la fecha de registro, salvo requerimiento legal que exija un período mayor.'],
    ['Datos de marketing', 'Hasta que retire su consentimiento o solicite la eliminación.'],
    ['Datos anonimizados', 'Indefinidamente, ya que no permiten identificar a personas específicas y se utilizan para estadísticas y mejora del servicio.'],
  ],
}

const derechosGrid = [
  { label: 'Acceso', desc: 'Solicitar confirmación de si tratamos sus datos y obtener una copia de los mismos.' },
  { label: 'Rectificación', desc: 'Solicitar la corrección de datos inexactos o incompletos.' },
  { label: 'Eliminación', desc: 'Solicitar la eliminación de sus datos cuando ya no sean necesarios, sujeto a obligaciones legales de retención.' },
  { label: 'Portabilidad', desc: 'Recibir sus datos en un formato estructurado, de uso común y lectura mecánica, y transmitirlos a otro responsable.' },
  { label: 'Oposición', desc: 'Oponerse al tratamiento de sus datos basado en interés legítimo o para marketing directo.' },
  { label: 'Limitación', desc: 'Solicitar la restricción del tratamiento en determinadas circunstancias.' },
  { label: 'Retirar consentimiento', desc: 'Retirar su consentimiento en cualquier momento para los tratamientos basados en consentimiento, sin afectar la licitud del tratamiento anterior.' },
  { label: 'No discriminación', desc: 'No ser discriminado por ejercer sus derechos de privacidad.' },
]

const cookiesTable = {
  headers: ['Tipo', 'Finalidad', 'Duración'],
  rows: [
    ['Esenciales', 'Necesarias para el funcionamiento de la Plataforma: autenticación, seguridad, preferencias de sesión.', 'Sesión / hasta 12 meses'],
    ['Funcionales', 'Recordar preferencias (idioma, configuraciones del dashboard), mejorar la experiencia de uso.', 'Hasta 12 meses'],
    ['Analíticas', 'Entender cómo se usa la Plataforma, identificar errores, medir rendimiento.', 'Hasta 24 meses'],
    ['Marketing', 'Mostrar contenido relevante, medir efectividad de campañas. Solo con su consentimiento previo.', 'Hasta 12 meses'],
  ],
}
</script>

<template>
  <LegalLayout
    :title="t('legal.privacyTitle')"
    :badge="t('legal.documentBadge')"
    effective-date="24 de febrero de 2026"
    updated-date="24 de febrero de 2026"
    :toc-items="tocItems"
  >
    <LegalIntroBox>
      <p>
        <strong>SU PRIVACIDAD ES IMPORTANTE PARA NOSOTROS.</strong> Esta Política de Privacidad describe cómo <strong>Zwap</strong>, operado por ZOKORP, LLC, recopila, utiliza, comparte y protege la información personal de los Usuarios de nuestra Plataforma. Al utilizar Zwap, usted acepta las prácticas descritas en esta Política. Esta Política forma parte integral de los <strong>Términos y Condiciones de Uso</strong> de Zwap.
      </p>
    </LegalIntroBox>

    <!-- 01 INTRO -->
    <LegalSection id="intro" num="01" title="Introducción y Alcance">
      <p>Esta Política de Privacidad (la <strong>"Política"</strong>) se aplica a toda la información personal recopilada a través de la plataforma Zwap, incluyendo el sitio web (zwap.dev y subdominios), el dashboard administrativo, la aplicación móvil Android Tap to Pay, los enlaces de pago generados a través de la Plataforma, las APIs y cualquier otra interfaz o canal digital de Zwap, y las comunicaciones que mantengamos con usted (correo electrónico, WhatsApp, notificaciones push).</p>
      <p>Esta Política se aplica a todos los Usuarios de Zwap, incluyendo <strong>Clientes</strong> (empresas turísticas que procesan pagos), <strong>Viajeros</strong> (personas que realizan pagos por servicios turísticos) y <strong>visitantes</strong> del sitio web que aún no se han registrado.</p>
      <p>Los términos en mayúscula no definidos aquí tienen el significado asignado en los Términos y Condiciones de Uso de Zwap.</p>
    </LegalSection>

    <!-- 02 RESPONSABLE -->
    <LegalSection id="responsable" num="02" title="Responsable del Tratamiento">
      <p>El responsable del tratamiento de sus datos personales es:</p>
      <LegalCallout variant="purple">
        <p>
          <strong>ZOKORP, LLC</strong> (operador de Zwap)<br>
          25 SW 9th St, Suite 406, Miami, FL 33130, USA<br>
          Delaware File Number: 4963479 · EIN: 38-4330071<br><br>
          Contacto de privacidad: <strong>privacy@zwap.dev</strong>
        </p>
      </LegalCallout>
      <p>Para asuntos relacionados con el procesamiento de pagos y la custodia de fondos, <strong>Stripe, Inc.</strong> actúa como procesador de datos independiente conforme a sus propias políticas de privacidad. Le recomendamos revisar la <strong>Política de Privacidad de Stripe</strong> en stripe.com/privacy.</p>
    </LegalSection>

    <!-- 03 DATOS RECOPILADOS -->
    <LegalSection id="datos-recopilados" num="03" title="Datos Personales que Recopilamos">
      <p>Zwap recopila diferentes categorías de datos según el tipo de Usuario y la funcionalidad utilizada:</p>
      <h3>3.1 Datos de Clientes (Empresas Turísticas)</h3>
      <LegalDataTable :headers="clientesTable.headers" :rows="clientesTable.rows" />
      <h3>3.2 Datos de Viajeros</h3>
      <LegalDataTable :headers="viajerosTable.headers" :rows="viajerosTable.rows" />
      <h3>3.3 Datos Técnicos (Todos los Usuarios)</h3>
      <LegalDataTable :headers="tecnicosTable.headers" :rows="tecnicosTable.rows" />
    </LegalSection>

    <!-- 04 MÉTODOS -->
    <LegalSection id="metodos" num="04" title="Cómo Recopilamos sus Datos">
      <LegalCardGrid :items="metodos" min-item-width="230px" />
    </LegalSection>

    <!-- 05 FINALIDADES -->
    <LegalSection id="finalidades" num="05" title="Para Qué Utilizamos sus Datos">
      <h3>5.1 Provisión del Servicio</h3>
      <p>Procesamiento de Transacciones y liquidación de fondos, creación y gestión de cuentas de Usuario, ejecución del proceso de onboarding y verificación KYC/KYB, generación de reportes, métricas y dashboards para Clientes, envío de confirmaciones de pago, recibos y notificaciones transaccionales, gestión de disputas, reembolsos y contracargos, y soporte técnico y atención al cliente.</p>
      <h3>5.2 Seguridad y Cumplimiento</h3>
      <p>Prevención, detección e investigación de fraude y actividades ilegales, cumplimiento de obligaciones legales y regulatorias (incluyendo normativas anti-lavado de dinero AML y financiamiento del terrorismo CFT), verificación de identidad y legitimidad de negocios (KYC/KYB), respuesta a requerimientos de autoridades competentes, protección de la seguridad e integridad de la Plataforma, y auditorías internas y externas.</p>
      <h3>5.3 Mejora y Desarrollo</h3>
      <p>Análisis del uso de la Plataforma para mejorar funcionalidades, desarrollo de nuevas características y productos, generación de estadísticas agregadas y anonimizadas sobre tendencias del sector turístico, entrenamiento y mejora de modelos de inteligencia artificial (utilizando datos anonimizados o pseudonimizados), e investigación y análisis de mercado.</p>
      <h3>5.4 Comunicación</h3>
      <p>Envío de información sobre cambios en el servicio, actualizaciones de Términos o esta Política, comunicaciones de marketing y promociones (solo con su consentimiento previo, cuando sea requerido), notificaciones sobre el estado de su cuenta, transacciones y balance, y encuestas de satisfacción y solicitudes de feedback.</p>
    </LegalSection>

    <!-- 06 BASE LEGAL -->
    <LegalSection id="base-legal" num="06" title="Base Legal del Tratamiento">
      <p>Procesamos sus datos personales bajo las siguientes bases legales, según corresponda:</p>
      <LegalDataTable :headers="baseLegalTable.headers" :rows="baseLegalTable.rows" />
    </LegalSection>

    <!-- 07 COMPARTICIÓN -->
    <LegalSection id="comparticion" num="07" title="Con Quién Compartimos sus Datos">
      <p>Zwap no vende sus datos personales. Compartimos información únicamente con las siguientes categorías de destinatarios y para los fines descritos:</p>
      <LegalDataTable :headers="comparticionTable.headers" :rows="comparticionTable.rows" />
      <p>En caso de fusión, adquisición, reorganización o venta de activos de ZOKORP, LLC, sus datos personales podrán ser transferidos al adquirente o sucesor, con notificación previa.</p>
    </LegalSection>

    <!-- 08 IA -->
    <LegalSection id="ia" num="08" title="Inteligencia Artificial y Onboarding KYC/KYB">
      <LegalCallout variant="dark">
        <p>
          <strong>TRANSPARENCIA SOBRE IA:</strong> Zwap utiliza inteligencia artificial en su proceso de onboarding. Esta sección explica cómo funciona, qué datos utiliza y qué derechos tiene usted al respecto.
        </p>
      </LegalCallout>
      <h3>8.1 Qué Hace Nuestro Sistema de IA</h3>
      <p>El sistema de onboarding de Zwap utiliza inteligencia artificial para evaluar solicitudes de registro de Clientes, generando un <strong>score de calificación (0-100)</strong> que ayuda a determinar el nivel de aprobación, las condiciones del servicio y los límites de transacción aplicables.</p>
      <h3>8.2 Factores que Evalúa la IA</h3>
      <p>El sistema analiza: completitud de los datos proporcionados, validación de la identidad del solicitante, tipo de negocio y sector de actividad, volumen de transacciones proyectado, presencia digital verificable (sitio web, redes sociales, listados en plataformas turísticas), consistencia de la información proporcionada, y patrones de riesgo de fraude.</p>
      <h3>8.3 Decisiones Automatizadas</h3>
      <p>El score generado por la IA puede influir en la aprobación o rechazo de la solicitud de registro, los límites de transacción iniciales asignados, el nivel de verificación requerido, y las opciones de liquidación disponibles. Para solicitudes con score ambiguo o en rangos intermedios, interviene un equipo humano de revisión. Los casos de rechazo automático son revisables mediante solicitud del interesado.</p>
      <h3>8.4 Sus Derechos respecto a la IA</h3>
      <p>Usted tiene derecho a: ser informado de que se utilizó un proceso automatizado para evaluar su solicitud (lo cual cumplimos mediante esta Política), solicitar <strong>intervención humana</strong> en la revisión de su caso, recibir una explicación general de los factores que afectaron su score (sin revelar la lógica propietaria del algoritmo), y <strong>impugnar</strong> la decisión automatizada presentando información o documentación adicional.</p>
      <h3>8.5 Mejora Continua del Modelo</h3>
      <p>El sistema de IA mejora continuamente basándose en datos históricos. Para el entrenamiento del modelo se utilizan datos <strong>anonimizados o pseudonimizados</strong>, sin posibilidad de identificar a personas específicas. Los datos de entrenamiento no se comparten con terceros.</p>
    </LegalSection>

    <!-- 09 TRANSFERENCIAS -->
    <LegalSection id="transferencias" num="09" title="Transferencias Internacionales de Datos">
      <p>Dado que Zwap opera como un servicio internacional especializado en turismo receptivo, sus datos personales pueden ser transferidos y procesados en países distintos al de su residencia, incluyendo:</p>
      <LegalCardGrid :items="transferenciasGrid" min-item-width="220px" />
      <p>Para las transferencias internacionales, implementamos salvaguardas apropiadas que pueden incluir: cláusulas contractuales estándar aprobadas por autoridades competentes, acuerdos de procesamiento de datos con nuestros proveedores, medidas de seguridad técnicas y organizativas, y cumplimiento de los marcos regulatorios aplicables en cada jurisdicción.</p>
      <p>Si usted se encuentra en una jurisdicción con normativas específicas de transferencia internacional de datos (como la UE/EEE), le informamos que al utilizar Zwap consiente la transferencia de sus datos a los Estados Unidos y otros países necesarios para la prestación del servicio, bajo las salvaguardas mencionadas.</p>
    </LegalSection>

    <!-- 10 RETENCIÓN -->
    <LegalSection id="retencion" num="10" title="Retención de Datos">
      <p>Conservamos sus datos personales durante el tiempo necesario para cumplir con las finalidades descritas, sujeto a los siguientes criterios:</p>
      <LegalDataTable :headers="retencionTable.headers" :rows="retencionTable.rows" />
      <p>Al vencimiento del período de retención, los datos serán eliminados o anonimizados de forma irreversible, salvo que exista obligación legal de conservarlos por un período adicional.</p>
    </LegalSection>

    <!-- 11 SEGURIDAD -->
    <LegalSection id="seguridad" num="11" title="Seguridad de los Datos">
      <h3>11.1 Medidas Implementadas</h3>
      <p>Zwap implementa medidas de seguridad técnicas y organizativas razonables, incluyendo: cifrado de datos en tránsito (TLS/SSL) y en reposo, acceso restringido a datos personales basado en roles y necesidad de conocer, autenticación de múltiples factores para acceso administrativo, monitoreo continuo de actividad sospechosa, copias de seguridad cifradas y redundantes, y revisiones periódicas de seguridad.</p>
      <h3>11.2 Seguridad de Pagos (Stripe)</h3>
      <p>La seguridad PCI-DSS (Payment Card Industry Data Security Standard) es gestionada por Stripe, que mantiene certificación PCI Nivel 1 (el nivel más alto). Los datos completos de tarjeta de crédito/débito de los Viajeros <strong>nunca pasan por ni se almacenan en los servidores de Zwap</strong>; son procesados directamente por Stripe mediante tokenización.</p>
      <h3>11.3 Limitación de Garantía</h3>
      <p>A pesar de nuestros esfuerzos, ningún sistema de transmisión o almacenamiento de datos es completamente seguro. Zwap no puede garantizar la seguridad absoluta de sus datos. En caso de una brecha de seguridad que afecte sus datos personales, le notificaremos conforme a la legislación aplicable y tomaremos las medidas correctivas necesarias.</p>
    </LegalSection>

    <!-- 12 DERECHOS -->
    <LegalSection id="derechos" num="12" title="Sus Derechos de Privacidad">
      <p>Según la legislación aplicable en su jurisdicción, usted puede tener los siguientes derechos respecto a sus datos personales:</p>
      <LegalCardGrid :items="derechosGrid" min-item-width="210px" />
      <h3>12.1 Cómo Ejercer sus Derechos</h3>
      <p>Para ejercer cualquiera de estos derechos, envíe una solicitud a <strong>privacy@zwap.dev</strong> indicando: su nombre completo, dirección de correo registrada en Zwap, el derecho que desea ejercer, y una descripción clara de su solicitud. Responderemos en un plazo máximo de <strong>30 días</strong> desde la recepción. Podremos solicitar información adicional para verificar su identidad antes de procesar la solicitud.</p>
      <h3>12.2 Limitaciones</h3>
      <p>Algunos derechos pueden estar limitados por obligaciones legales (como la retención de datos KYC/KYB), necesidades contractuales (como datos necesarios para cumplir transacciones pendientes), derechos de terceros, o intereses legítimos prevalecientes.</p>
      <h3>12.3 Reclamaciones</h3>
      <p>Si considera que el tratamiento de sus datos vulnera sus derechos, puede presentar una reclamación ante la autoridad de protección de datos competente en su jurisdicción.</p>
    </LegalSection>

    <!-- 13 COOKIES -->
    <LegalSection id="cookies" num="13" title="Cookies y Tecnologías Similares">
      <h3>13.1 Qué Utilizamos</h3>
      <p>Zwap utiliza cookies y tecnologías similares (píxeles de seguimiento, almacenamiento local del navegador, identificadores de dispositivo) para operar la Plataforma, recordar sus preferencias, analizar el uso del servicio y mejorar la experiencia.</p>
      <h3>13.2 Tipos de Cookies</h3>
      <LegalDataTable :headers="cookiesTable.headers" :rows="cookiesTable.rows" />
      <h3>13.3 Control de Cookies</h3>
      <p>Puede gestionar sus preferencias de cookies a través del banner de cookies de nuestro sitio web, la configuración de su navegador (bloquear o eliminar cookies), o contactándonos a privacy@zwap.dev. Las cookies esenciales no pueden desactivarse ya que son necesarias para el funcionamiento de la Plataforma. La desactivación de otras cookies puede afectar la funcionalidad del servicio.</p>
    </LegalSection>

    <!-- 14 MENORES -->
    <LegalSection id="menores" num="14" title="Menores de Edad">
      <p>Zwap no está dirigido a personas menores de 18 años. No recopilamos intencionalmente datos personales de menores. Si tomamos conocimiento de que hemos recopilado datos de un menor sin el consentimiento apropiado, los eliminaremos de inmediato. Si usted es padre o tutor y cree que su hijo menor ha proporcionado datos personales a Zwap, por favor contáctenos a privacy@zwap.dev.</p>
    </LegalSection>

    <!-- 15 CLIENTES RESP -->
    <LegalSection id="clientes-resp" num="15" title="Responsabilidad de los Clientes sobre Datos de Viajeros">
      <LegalCallout variant="warning">
        <p>
          <strong>IMPORTANTE PARA CLIENTES:</strong> Si usted es un Cliente (empresa turística) que procesa pagos de Viajeros a través de Zwap, usted también es responsable del tratamiento de los datos personales de dichos Viajeros.
        </p>
      </LegalCallout>
      <p>Los Clientes que reciban datos personales de Viajeros a través de Zwap se comprometen a: utilizar dichos datos únicamente para la finalidad de prestar el Servicio Turístico contratado, cumplir con todas las leyes de protección de datos aplicables en su jurisdicción, implementar medidas de seguridad razonables para proteger los datos, no compartir los datos de Viajeros con terceros no autorizados, informar a los Viajeros sobre cómo tratan sus datos, y eliminar los datos cuando ya no sean necesarios.</p>
      <p>Zwap no será responsable del uso que los Clientes hagan de los datos de Viajeros fuera de la Plataforma ni del incumplimiento de las obligaciones de protección de datos por parte de los Clientes.</p>
    </LegalSection>

    <!-- 16 CAMBIOS -->
    <LegalSection id="cambios" num="16" title="Cambios a esta Política">
      <LegalCallout variant="purple">
        <p>
          <strong>DERECHO RESERVADO:</strong> ZOKORP, LLC se reserva el derecho de modificar esta Política de Privacidad en cualquier momento, a su sola discreción.
        </p>
      </LegalCallout>
      <p>Cuando realicemos cambios sustanciales, lo notificaremos mediante: actualización de la fecha de vigencia al inicio de esta Política, notificación por correo electrónico a su dirección registrada, aviso prominente en el dashboard al iniciar sesión, y/o publicación en nuestro sitio web.</p>
      <p>El uso continuado de Zwap después de la publicación de cambios constituirá su aceptación. Si no está de acuerdo con los cambios, deberá dejar de utilizar la Plataforma.</p>
      <p>Le recomendamos revisar esta Política periódicamente para estar informado de cualquier actualización.</p>
    </LegalSection>

    <!-- 17 CONTACTO -->
    <LegalSection id="contacto" num="17" title="Contacto">
      <p>Para preguntas, solicitudes de ejercicio de derechos o cualquier asunto relacionado con esta Política de Privacidad:</p>
      <LegalCallout variant="purple">
        <p>
          <strong>Zwap — Producto de ZOKORP, LLC</strong><br>
          Responsable de Privacidad<br>
          25 SW 9th St, Suite 406, Miami, FL 33130, USA<br><br>
          Correo electrónico de privacidad: <strong>privacy@zwap.dev</strong><br>
          Correo electrónico general: <strong>legal@zwap.dev</strong><br>
          Sitio web: <strong>zwap.dev</strong>
        </p>
      </LegalCallout>
      <p>Nos comprometemos a responder a todas las solicitudes relacionadas con privacidad en un plazo máximo de 30 días.</p>
      <p class="italic text-[13px] mt-6 opacity-80">
        Esta Política de Privacidad fue preparada para Zwap (ZOKORP, LLC) y tiene carácter orientativo. Se recomienda que un abogado calificado en protección de datos la revise antes de su publicación definitiva, especialmente considerando las regulaciones específicas de cada jurisdicción donde Zwap opere.
      </p>
    </LegalSection>
  </LegalLayout>
</template>
