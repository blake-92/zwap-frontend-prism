<script setup>
import LegalLayout from '../LegalLayout.vue'
import LegalSection from '../LegalSection.vue'
import LegalIntroBox from '../LegalIntroBox.vue'
import LegalCallout from '../LegalCallout.vue'
import LegalDefinitionList from '../LegalDefinitionList.vue'
import LegalOrderedList from '../LegalOrderedList.vue'
import LegalCardGrid from '../LegalCardGrid.vue'

const { t } = useI18n()

const tocItems = [
  { id: 'general', label: 'General' },
  { id: 'definiciones', label: 'Definiciones' },
  { id: 'plataforma', label: 'Plataforma' },
  { id: 'cuenta', label: 'Cuenta' },
  { id: 'isv', label: 'Rol ISV' },
  { id: 'pagos', label: 'Pagos' },
  { id: 'costos', label: 'Costos' },
  { id: 'reembolsos', label: 'Reembolsos' },
  { id: 'propiedad', label: 'Propiedad Int.' },
  { id: 'privacidad', label: 'Privacidad' },
  { id: 'responsabilidad', label: 'Responsabilidad' },
  { id: 'indemnizacion', label: 'Indemnización' },
  { id: 'modificaciones', label: 'Modificaciones' },
  { id: 'terminacion', label: 'Terminación' },
  { id: 'disputas', label: 'Disputas' },
  { id: 'final', label: 'Disposiciones Finales' },
  { id: 'contacto', label: 'Contacto' },
]

const definiciones = [
  { term: '<strong>"Zwap" o "Plataforma"</strong>', definition: 'La pasarela de pagos SaaS desarrollada por ZOKORP, LLC, incluyendo el dashboard web administrativo, la aplicación Android Tap to Pay, las APIs, los enlaces de pago y cualquier otra funcionalidad puesta a disposición de los Usuarios.' },
  { term: '<strong>"Servicios"</strong>', definition: 'Las funcionalidades de software proporcionadas por Zwap, incluyendo sin limitación: procesamiento de pagos mediante la infraestructura de Stripe, generación de enlaces de pago y reservas, cobros presenciales mediante Tap to Pay NFC, dashboard con métricas y reportes, gestión de depósitos y liquidaciones, sistema de onboarding con KYC/KYB, e integraciones con servicios de terceros.' },
  { term: '<strong>"Usuario"</strong>', definition: 'Cualquier persona física o jurídica que acceda, se registre o utilice la Plataforma, ya sea como Cliente o como Viajero.' },
  { term: '<strong>"Cliente"</strong>', definition: 'Cualquier empresa turística o persona física que utilice Zwap para procesar pagos, gestionar cobros y recibir liquidaciones de fondos. Incluye hoteles, hostales, operadores de tours, restaurantes turísticos, transportistas y cualquier otro prestador de servicios turísticos que se registre en la Plataforma.' },
  { term: '<strong>"Viajero"</strong>', definition: 'Cualquier persona física que realice un pago a través de Zwap por un Servicio Turístico ofrecido por un Cliente, ya sea mediante enlace de pago, Tap to Pay u otro método habilitado en la Plataforma.' },
  { term: '<strong>"Servicios Turísticos"</strong>', definition: 'Los servicios de alojamiento, tours, actividades, transporte, gastronomía, experiencias y cualquier otro servicio relacionado con turismo que los Clientes ofrecen y gestionan. Estos servicios son proporcionados <strong>exclusivamente por los Clientes</strong>, no por Zwap ni por ZOKORP.' },
  { term: '<strong>"ISV" (Independent Software Vendor)</strong>', definition: 'Proveedor de Software Independiente. Zwap opera como ISV de Stripe, lo que significa que proporciona la capa de software (interfaz, dashboard, funcionalidades específicas para turismo) sobre la infraestructura de procesamiento de pagos de Stripe, sin custodiar ni manipular fondos directamente.' },
  { term: '<strong>"Stripe"</strong>', definition: 'Stripe, Inc. y sus afiliadas, que actúan como procesador de pagos y custodio de fondos. Las transacciones procesadas a través de Zwap están sujetas adicionalmente a los <strong>Términos de Servicio de Stripe</strong> (Stripe Services Agreement) y las políticas de Stripe aplicables.' },
  { term: '<strong>"Transacción"</strong>', definition: 'Cada operación de cobro procesada a través de la Plataforma, ya sea mediante enlace de pago, Tap to Pay u otro método habilitado.' },
  { term: '<strong>"Depósito" o "Liquidación"</strong>', definition: 'La transferencia de fondos desde Stripe hacia el destino elegido por el Cliente (billetera virtual, cuenta bancaria en el exterior o cuenta corporativa en EE. UU.), neta de comisiones y retenciones aplicables.' },
  { term: '<strong>"Contracargo" o "Chargeback"</strong>', definition: 'Disputa iniciada por un Viajero (titular de la tarjeta) ante su banco emisor, solicitando la reversión de un cargo procesado a través de la Plataforma.' },
  { term: '<strong>"Contenido del Usuario"</strong>', definition: 'Toda información, datos, texto, fotografías, logotipos, descripciones de servicios y cualquier otro material que un Usuario publique, transmita o ponga a disposición a través de Zwap.' },
]

const costos = [
  { label: 'Costo por Transacción', desc: 'Comisión aplicada sobre cada cobro procesado a través de Zwap (pago del Viajero al Cliente). Incluye el costo del procesamiento por Stripe más la comisión de Zwap. Se descuenta automáticamente del monto de la Transacción antes de acreditarse al balance del Cliente.' },
  { label: 'Costo por Depósito', desc: 'Comisión aplicada sobre cada liquidación (payout) que Zwap ejecuta hacia el Cliente, después del descuento de comisiones por transacción. Cubre los costos operativos de transferencia al destino elegido (billetera virtual, cuenta bancaria, cuenta corporativa).' },
  { label: 'Costo por Devolución', desc: 'Comisión aplicada cuando el Cliente inicia un reembolso (total o parcial) hacia un Viajero. Este costo cubre los gastos de procesamiento de la devolución. La comisión original por transacción <strong>no es reembolsable</strong> al Cliente.' },
  { label: 'Costo por Disputa', desc: 'Cargo fijo aplicado cuando un Viajero inicia un Contracargo (chargeback) ante su banco emisor. Este costo es establecido por Stripe y trasladado al Cliente, independientemente del resultado de la disputa, y se debitará del balance del Cliente o se facturará por separado.' },
]

const indemnizacionItems = [
  'Su uso de la Plataforma o violación de estos Términos.',
  'Su violación de cualquier ley, regulación o derecho de terceros.',
  'Los Servicios Turísticos que usted ofrezca, gestione o proporcione (en caso de ser Cliente).',
  'Cualquier Contenido del Usuario que publique o transmita.',
  'Disputas, Contracargos o reclamaciones de Viajeros o terceros.',
  'Información falsa, inexacta o engañosa proporcionada durante el onboarding o uso de la Plataforma.',
  'El uso indebido de los datos de Viajeros o terceros.',
]
</script>

<template>
  <LegalLayout
    :title="t('legal.termsTitle')"
    :title-line2="t('legal.termsTitleLine2')"
    :badge="t('legal.documentBadge')"
    effective-date="24 de febrero de 2026"
    updated-date="24 de febrero de 2026"
    :toc-items="tocItems"
  >
    <!-- Intro box -->
    <LegalIntroBox>
      <p>
        <strong>AVISO IMPORTANTE — LEA ANTES DE CONTINUAR:</strong> Al acceder, registrarse o utilizar Zwap, usted acepta estar legalmente vinculado por estos Términos y Condiciones. Zwap es un producto de software desarrollado y operado por ZOKORP, LLC. Zwap actúa exclusivamente como <strong>Proveedor de Software Independiente (ISV)</strong> sobre la infraestructura de Stripe y <strong>no es el proveedor, operador ni organizador de los servicios turísticos</strong> comercializados por los Clientes a través de la Plataforma. Zwap <strong>no custodia, retiene ni manipula fondos</strong> de los usuarios; todos los fondos son procesados y custodiados por Stripe conforme a sus propios términos de servicio.
      </p>
    </LegalIntroBox>

    <!-- 01 GENERAL -->
    <LegalSection id="general" num="01" title="Disposiciones Generales">
      <p>Estos Términos y Condiciones de Uso (en adelante, los <strong>"Términos"</strong>) regulan el acceso y uso de la plataforma tecnológica <strong>Zwap</strong> (accesible en <strong>zwap.dev</strong> y sus subdominios, aplicaciones móviles y cualquier otro canal digital asociado), desarrollada y operada por <strong>ZOKORP, LLC</strong>, una sociedad de responsabilidad limitada constituida conforme a las leyes del Estado de Delaware, EE. UU., con Delaware File Number 4963479 y EIN 38-4330071, con oficina ejecutiva principal en 25 SW 9th St, Suite 406, Miami, FL 33130, USA (en adelante, <strong>"ZOKORP"</strong>, <strong>"nosotros"</strong>, <strong>"nuestro/a"</strong> o la <strong>"Compañía"</strong>).</p>
      <p>Al acceder a la Plataforma Zwap, crear una cuenta o utilizar cualquiera de los Servicios, usted declara que: (i) tiene al menos 18 años de edad; (ii) posee capacidad legal para celebrar contratos vinculantes; (iii) acepta cumplir con estos Términos en su totalidad; y (iv) si actúa en nombre de una entidad comercial, tiene la autoridad para vincular a dicha entidad.</p>
      <p>Si no está de acuerdo con alguna parte de estos Términos, no utilice la Plataforma.</p>
    </LegalSection>

    <!-- 02 DEFINICIONES -->
    <LegalSection id="definiciones" num="02" title="Definiciones">
      <LegalDefinitionList :items="definiciones" />
    </LegalSection>

    <!-- 03 PLATAFORMA -->
    <LegalSection id="plataforma" num="03" title="Descripción de la Plataforma">
      <p>Zwap es una pasarela de pagos SaaS especializada en el sector de <strong>turismo receptivo</strong>, que permite a empresas turísticas procesar pagos en dólares de turistas extranjeros, ofreciendo flexibilidad en las opciones de liquidación según el nivel de formalización de cada negocio.</p>
      <h3>3.1 Funcionalidades Principales</h3>
      <p>La Plataforma ofrece, entre otras: procesamiento de pagos en dólares (USD) mediante la infraestructura de Stripe, cobros presenciales mediante aplicación Android Tap to Pay (NFC) sin hardware adicional, generación de enlaces de pago personalizados para reservas y cobros remotos, dashboard administrativo con métricas en tiempo real, reportes descargables, gestión de balances y depósitos programados, gestión de múltiples terminales y usuarios con permisos diferenciados, sistema de onboarding automatizado con verificación KYC/KYB mediante inteligencia artificial, y notificaciones multi-canal (email, WhatsApp, push).</p>
      <h3>3.2 Naturaleza del Servicio</h3>
      <p>Zwap actúa únicamente como <strong>proveedor de la capa de software</strong>. La Plataforma es una herramienta tecnológica que facilita el procesamiento de pagos entre Clientes y Viajeros, utilizando la infraestructura de Stripe para el procesamiento efectivo de las transacciones y la custodia de fondos. <strong>Zwap no es un operador turístico, agencia de viajes, proveedor de alojamiento, organizador de actividades, banco, entidad financiera ni custodio de fondos.</strong></p>
      <h3>3.3 Disponibilidad</h3>
      <p>Zwap hará esfuerzos comercialmente razonables para mantener la Plataforma disponible. Sin embargo, la Plataforma depende en parte de la infraestructura de Stripe y de proveedores de servicios de terceros, cuya disponibilidad está fuera del control directo de Zwap. La Plataforma se proporciona <strong>"TAL COMO ESTÁ"</strong> y <strong>"SEGÚN DISPONIBILIDAD"</strong>. Zwap se reserva el derecho de realizar mantenimiento programado o de emergencia, notificando previamente cuando sea posible.</p>
    </LegalSection>

    <!-- 04 CUENTA -->
    <LegalSection id="cuenta" num="04" title="Registro, Cuenta y Onboarding">
      <h3>4.1 Registro y Onboarding</h3>
      <p>Para utilizar los Servicios como Cliente, deberá completar el proceso de onboarding de Zwap, que incluye la creación de una cuenta, la provisión de información veraz, completa y actualizada, y la verificación de identidad y negocio (KYC/KYB) mediante el sistema automatizado de Zwap y/o los requisitos de Stripe.</p>
      <p>El sistema de onboarding utiliza inteligencia artificial para evaluar las solicitudes. Zwap se reserva el derecho de aprobar, rechazar, condicionar o solicitar información adicional sobre cualquier solicitud, a su sola discreción.</p>
      <h3>4.2 Cuenta de Stripe</h3>
      <p>Como parte del onboarding, se configurará una cuenta de Stripe asociada a su cuenta de Zwap para el procesamiento de pagos. Usted acepta que el uso de los servicios de Stripe está sujeto a los Términos de Servicio de Stripe (Stripe Services Agreement), que constituyen un acuerdo independiente entre usted y Stripe. Zwap no es parte de dicho acuerdo.</p>
      <h3>4.3 Seguridad de la Cuenta</h3>
      <p>Usted es el único responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades que ocurran bajo su cuenta. Debe notificar inmediatamente a Zwap de cualquier uso no autorizado o vulneración de seguridad.</p>
      <h3>4.4 Veracidad de la Información</h3>
      <p>Usted garantiza que toda la información proporcionada durante el onboarding y el uso de la Plataforma es veraz, exacta y está actualizada. Información falsa, inexacta o desactualizada puede resultar en la suspensión o terminación inmediata de su cuenta, la retención de fondos según las políticas de Stripe, y la denuncia ante las autoridades competentes cuando corresponda.</p>
    </LegalSection>

    <!-- 05 ROL ISV -->
    <LegalSection id="isv" num="05" title="Rol de Zwap como ISV — Cláusula Fundamental">
      <LegalCallout variant="dark">
        <p>
          <strong>⚖️ CLÁUSULA ESENCIAL:</strong> Esta sección define la naturaleza de la relación entre Zwap / ZOKORP y sus Usuarios. Es fundamental que todos los Usuarios comprendan que Zwap opera como un Proveedor de Software Independiente (ISV) sobre la infraestructura de Stripe.
        </p>
      </LegalCallout>
      <h3>5.1 Modelo ISV sobre Stripe</h3>
      <p>Zwap opera como ISV (Independent Software Vendor) de Stripe. Esto significa que Zwap proporciona la capa de software — el dashboard, la app Tap to Pay, los enlaces de pago, el sistema de onboarding, los reportes y las funcionalidades específicas para turismo — mientras que <strong>Stripe maneja el procesamiento efectivo de pagos, la custodia de fondos, el cumplimiento PCI-DSS y las regulaciones financieras aplicables.</strong></p>
      <h3>5.2 Lo que Zwap No Es ni Hace</h3>
      <p>Zwap <strong>NO</strong> custodia, retiene ni manipula fondos (todos los fondos permanecen en Stripe hasta su liquidación). Zwap NO es un banco, entidad financiera, institución de pago ni custodio de fondos. Zwap NO es un operador turístico, agencia de viajes, proveedor de alojamiento ni organizador de actividades. Zwap NO es parte de las transacciones comerciales entre Clientes y Viajeros. Zwap NO garantiza la calidad, seguridad ni legalidad de los Servicios Turísticos ofrecidos por los Clientes. Zwap NO es empleador de los Clientes ni existe relación de agencia, sociedad, joint venture o franquicia entre las partes.</p>
      <h3>5.3 Responsabilidad de los Clientes</h3>
      <p>Cada Cliente es el único responsable de: la calidad, legalidad, seguridad y veracidad de los Servicios Turísticos que ofrece; el cumplimiento de todas las leyes, regulaciones, permisos y licencias aplicables en su jurisdicción (incluyendo licencias de operación turística, normativas tributarias, sanitarias y de protección al consumidor); la relación comercial directa con los Viajeros; la exactitud de los precios, descripciones e información publicada; y sus propias políticas de cancelación y reembolso.</p>
      <h3>5.4 Rol de Stripe</h3>
      <p>El procesamiento de pagos, la custodia de fondos y la liquidación se realizan a través de Stripe conforme a sus propios términos de servicio. Zwap no asume responsabilidad por decisiones, acciones u omisiones de Stripe, incluyendo pero no limitado a: retención de fondos por Stripe, suspensiones de cuentas por Stripe, cambios en las políticas de Stripe, y tiempos de liquidación determinados por Stripe.</p>
    </LegalSection>

    <!-- 06 PAGOS -->
    <LegalSection id="pagos" num="06" title="Procesamiento de Pagos y Liquidaciones">
      <h3>6.1 Procesamiento de Transacciones</h3>
      <p>Las Transacciones se procesan a través de la infraestructura de Stripe. Cuando un Viajero realiza un pago (ya sea por Tap to Pay, enlace de pago u otro método habilitado), Stripe procesa la transacción, verifica la tarjeta del Viajero, y retiene los fondos en la cuenta del Cliente dentro de Stripe, sujeto a las comisiones aplicables.</p>
      <h3>6.2 Liquidación de Fondos (Depósitos)</h3>
      <p>Los fondos cobrados pertenecen al Cliente, netos de las comisiones aplicables. El Cliente puede solicitar la liquidación de fondos a través del dashboard de Zwap, sujeto a un plazo mínimo de <strong>2 días hábiles</strong> desde la confirmación de la Transacción. Los destinos de liquidación disponibles dependen del perfil y nivel de verificación del Cliente, pudiendo incluir billeteras virtuales en EE. UU. (como Meru, Takenos, Payoneer), cuentas bancarias en el exterior (principalmente Perú u otros países), y depósitos directos a cuentas corporativas en EE. UU. (para Clientes con LLC u otra entidad).</p>
      <p>Zwap facilita la configuración y gestión de los depósitos, pero la transferencia efectiva de fondos es ejecutada por Stripe y/o los proveedores de liquidación correspondientes. Los tiempos de liquidación pueden variar según el destino, el método de transferencia y los procesos de verificación aplicables.</p>
      <h3>6.3 Retiros Programados</h3>
      <p>Los Clientes pueden configurar retiros automáticos programados o acumular saldo para retiros mayores, según su preferencia. Zwap no obliga a los Clientes a retirar fondos en intervalos fijos.</p>
      <h3>6.4 Retención de Fondos</h3>
      <p>Stripe y/o Zwap podrán retener fondos temporalmente cuando existan: Contracargos o disputas pendientes, actividad sospechosa o potencialmente fraudulenta, requisitos regulatorios o legales, incumplimiento de estos Términos, o requerimientos de autoridades competentes. Los fondos retenidos serán liberados una vez resuelta la causa de la retención, conforme a las políticas de Stripe y la legislación aplicable.</p>
      <h3>6.5 Moneda</h3>
      <p>La Plataforma procesa transacciones principalmente en dólares estadounidenses (USD). La disponibilidad de otras monedas (EUR, GBP, u otras) dependerá de la expansión del servicio y será comunicada oportunamente. Las conversiones de moneda, cuando apliquen, estarán sujetas a los tipos de cambio y comisiones de Stripe o del proveedor de liquidación correspondiente.</p>
    </LegalSection>

    <!-- 07 COSTOS -->
    <LegalSection id="costos" num="07" title="Costos, Comisiones y Tarifas">
      <p>Zwap cobra comisiones por el uso de la Plataforma según la estructura de tarifas vigente, que será comunicada al Cliente durante el proceso de onboarding y estará disponible en la Plataforma. Las comisiones pueden variar según el volumen de transacciones, el tipo de cliente y el plan contratado.</p>
      <h3>7.1 Tipos de Costos</h3>
      <LegalCardGrid :items="costos" min-item-width="220px" />
      <h3>7.2 Tarifas de Stripe</h3>
      <p>Además de las comisiones de Zwap, las Transacciones están sujetas a las tarifas de procesamiento de Stripe (que incluyen tarifas por transacción con tarjeta, tarifas por transferencias internacionales y cualquier otra tarifa aplicable según las políticas vigentes de Stripe). Estas tarifas de Stripe pueden cambiar según las políticas de Stripe, y dichos cambios no son controlados por Zwap.</p>
      <h3>7.3 Suscripción o Planes (si aplica)</h3>
      <p>Zwap podrá ofrecer planes de suscripción con funcionalidades premium, reportes avanzados u otras prestaciones adicionales. Los términos, precios y condiciones de dichos planes serán comunicados al momento de la contratación.</p>
      <h3>7.4 Modificación de Tarifas</h3>
      <p>Zwap se reserva el derecho de modificar la estructura de comisiones y tarifas. Cualquier cambio será notificado a los Clientes con un mínimo de <strong>30 días de anticipación</strong> antes de su entrada en vigencia. El uso continuado de la Plataforma después de la fecha de vigencia de las nuevas tarifas constituirá aceptación de las mismas.</p>
      <h3>7.5 Impuestos</h3>
      <p>Cada Usuario es el único responsable del pago de todos los impuestos aplicables en su jurisdicción, derivados de su actividad comercial y del uso de la Plataforma. Zwap podrá retener impuestos cuando así lo exija la legislación aplicable y emitirá la documentación fiscal correspondiente cuando sea requerido.</p>
    </LegalSection>

    <!-- 08 REEMBOLSOS -->
    <LegalSection id="reembolsos" num="08" title="Reembolsos, Cancelaciones y Disputas">
      <h3>8.1 Reembolsos de Servicios Turísticos</h3>
      <p>Las políticas de reembolso y cancelación de los Servicios Turísticos son establecidas, comunicadas y gestionadas <strong>exclusivamente por cada Cliente</strong>. Zwap no determina, controla ni es responsable de dichas políticas. Los Viajeros deberán comunicarse directamente con el Cliente correspondiente para solicitar reembolsos.</p>
      <p>Cuando un Cliente autorice un reembolso (total o parcial), Zwap facilitará técnicamente su procesamiento a través de Stripe. El reembolso estará sujeto al <strong>Costo por Devolución</strong> (ver Sección 7). La comisión original de la Transacción no se reembolsa al Cliente.</p>
      <h3>8.2 Devoluciones Parciales y Totales</h3>
      <p>Los Clientes podrán procesar devoluciones totales o parciales desde el dashboard de Zwap, sujeto a la disponibilidad de fondos en su balance. Si el balance del Cliente es insuficiente para cubrir el reembolso, el Cliente deberá aportar los fondos necesarios o autorizar el cargo correspondiente.</p>
      <h3>8.3 Contracargos (Chargebacks)</h3>
      <LegalCallout variant="warning">
        <p>
          <strong>ATENCIÓN:</strong> Los Contracargos representan un riesgo significativo para los Clientes. Es responsabilidad exclusiva del Cliente prevenirlos mediante buenas prácticas comerciales, políticas de cancelación claras y comunicación efectiva con los Viajeros.
        </p>
      </LegalCallout>
      <p>Cuando un Viajero inicie un Contracargo, el Cliente será notificado a través de la Plataforma y será el <strong>único responsable</strong> de gestionar la disputa, proporcionando evidencia suficiente (comprobantes de servicio, comunicaciones con el Viajero, políticas de cancelación aceptadas, etc.). El <strong>Costo por Disputa</strong> será cargado al Cliente independientemente del resultado. Stripe podrá retener fondos del balance del Cliente durante la resolución de la disputa. Si la disputa se resuelve a favor del Viajero, el monto total será devuelto y cargado al Cliente. Zwap podrá asistir al Cliente proporcionando datos de la Transacción, pero no es responsable del resultado.</p>
      <h3>8.4 Reembolso de Comisiones de Zwap</h3>
      <p>Las comisiones cobradas por Zwap (suscripciones, comisiones por transacción, costos por depósito) generalmente <strong>no son reembolsables</strong>, salvo que se indique expresamente lo contrario o la ley aplicable lo requiera.</p>
    </LegalSection>

    <!-- 09 PROPIEDAD -->
    <LegalSection id="propiedad" num="09" title="Propiedad Intelectual">
      <h3>9.1 Propiedad de Zwap</h3>
      <p>La Plataforma, incluyendo su código fuente, diseño, interfaces, arquitectura, algoritmos, dashboard, aplicación móvil, sistema de IA para onboarding, APIs, bases de datos, documentación, la marca "Zwap", el isotipo, el logotipo, los nombres comerciales y todos los derechos de propiedad intelectual asociados, son propiedad exclusiva de ZOKORP, LLC y están protegidos por las leyes aplicables.</p>
      <p>Se otorga al Usuario únicamente una licencia limitada, no exclusiva, intransferible, no sublicenciable y revocable para utilizar la Plataforma conforme a estos Términos.</p>
      <h3>9.2 Contenido del Usuario</h3>
      <p>Usted conserva sus derechos sobre su Contenido del Usuario. Al publicar contenido en la Plataforma, otorga a ZOKORP una licencia mundial, no exclusiva, libre de regalías, sublicenciable y transferible para usar, reproducir, modificar, adaptar, publicar y mostrar dicho contenido con el fin de operar, mejorar y promocionar la Plataforma.</p>
      <h3>9.3 Restricciones</h3>
      <p>Queda prohibido copiar, modificar, descompilar, realizar ingeniería inversa, desensamblar, crear obras derivadas, alquilar, prestar, vender, sublicenciar, distribuir o explotar comercialmente la Plataforma o cualquier parte de ella sin autorización expresa y por escrito de ZOKORP.</p>
    </LegalSection>

    <!-- 10 PRIVACIDAD -->
    <LegalSection id="privacidad" num="10" title="Privacidad y Protección de Datos">
      <h3>10.1 Datos Recopilados</h3>
      <p>Zwap recopila datos personales conforme a su Política de Privacidad (que forma parte integral de estos Términos), incluyendo: información de identificación personal (nombre, correo electrónico, teléfono, dirección, documento de identidad), información del negocio (razón social, tipo de actividad, volumen estimado, presencia digital), datos financieros de liquidación (destino de fondos, información de billeteras o cuentas), datos de Transacciones procesadas, datos de uso de la Plataforma, información del dispositivo y geolocalización (cuando sea autorizada), y datos recopilados durante el onboarding (KYC/KYB), incluyendo documentos y scoring generado por IA.</p>
      <h3>10.2 Uso de los Datos</h3>
      <p>Los datos se utilizan para operar y mejorar la Plataforma, procesar transacciones y liquidaciones, ejecutar el proceso de onboarding y verificación KYC/KYB, prevenir fraude y actividades ilegales, cumplir con obligaciones legales y regulatorias, generar métricas y reportes para los Clientes, comunicarse con los Usuarios, y desarrollar funcionalidades y mejoras del servicio.</p>
      <h3>10.3 Compartición con Terceros</h3>
      <p>Zwap podrá compartir datos con: Stripe (como procesador de pagos), proveedores de liquidación (billeteras virtuales, entidades bancarias), proveedores de servicios técnicos que operen la Plataforma, autoridades competentes cuando sea requerido por ley, y Clientes (datos de Viajeros necesarios para completar la Transacción y el servicio).</p>
      <h3>10.4 Seguridad</h3>
      <p>Zwap implementa medidas de seguridad razonables. La seguridad PCI-DSS y el cumplimiento financiero son gestionados por Stripe. Zwap no almacena datos completos de tarjetas de crédito/débito. Sin embargo, ningún sistema es completamente seguro y Zwap no garantiza la seguridad absoluta.</p>
      <h3>10.5 Derechos del Usuario</h3>
      <p>Según la legislación aplicable, usted puede tener derecho a acceder, rectificar, eliminar, portar u oponerse al procesamiento de sus datos personales. Para ejercer estos derechos, contacte a Zwap por los canales indicados en la sección de Contacto.</p>
      <h3>10.6 Responsabilidad de los Clientes sobre Datos de Viajeros</h3>
      <p>Los Clientes que reciban datos de Viajeros a través de Zwap son responsables de cumplir con las leyes de protección de datos aplicables en sus jurisdicciones. Zwap no será responsable del uso que los Clientes hagan de dichos datos fuera de la Plataforma.</p>
    </LegalSection>

    <!-- 11 RESPONSABILIDAD -->
    <LegalSection id="responsabilidad" num="11" title="Limitación de Responsabilidad">
      <LegalCallout variant="warning">
        <p>
          <strong>AVISO:</strong> Esta sección contiene limitaciones sustanciales sobre la responsabilidad de Zwap y ZOKORP. Léala cuidadosamente.
        </p>
      </LegalCallout>
      <h3>11.1 Exclusión de Garantías</h3>
      <p>LA PLATAFORMA Y LOS SERVICIOS SE PROPORCIONAN "TAL COMO ESTÁN" Y "SEGÚN DISPONIBILIDAD", SIN GARANTÍAS DE NINGÚN TIPO, EXPRESAS, IMPLÍCITAS O LEGALES, INCLUYENDO SIN LIMITACIÓN GARANTÍAS DE COMERCIABILIDAD, IDONEIDAD PARA UN PROPÓSITO PARTICULAR, TÍTULO, NO INFRACCIÓN, DISPONIBILIDAD ININTERRUMPIDA O LIBRE DE ERRORES.</p>
      <h3>11.2 Exclusión de Responsabilidad como ISV</h3>
      <p>Zwap y ZOKORP no serán responsables de: la calidad, seguridad, legalidad o cualquier aspecto de los Servicios Turísticos proporcionados por los Clientes; las acciones, omisiones o negligencia de cualquier Cliente o Viajero; lesiones personales, daños a la propiedad o pérdidas derivadas de los Servicios Turísticos; la veracidad o exactitud de la información publicada por los Clientes; el incumplimiento por los Clientes de leyes o regulaciones; decisiones, acciones o inacciones de Stripe o cualquier procesador de pagos; la retención, congelamiento o pérdida de fondos por parte de Stripe; la disponibilidad o funcionamiento de servicios de terceros integrados; y la conversión de moneda o tipos de cambio aplicados por terceros.</p>
      <h3>11.3 Limitación de Daños</h3>
      <p>EN LA MÁXIMA MEDIDA PERMITIDA POR LA LEY, LA RESPONSABILIDAD TOTAL ACUMULADA DE ZWAP Y ZOKORP POR CUALQUIER RECLAMACIÓN NO EXCEDERÁ EL MAYOR DE: (A) LAS COMISIONES PAGADAS POR USTED A ZWAP DURANTE LOS DOCE (12) MESES ANTERIORES AL EVENTO QUE DIO ORIGEN A LA RECLAMACIÓN, O (B) CIEN DÓLARES ESTADOUNIDENSES (USD $100.00).</p>
      <h3>11.4 Exclusión de Daños Especiales</h3>
      <p>EN NINGÚN CASO ZWAP O ZOKORP SERÁN RESPONSABLES POR DAÑOS INDIRECTOS, INCIDENTALES, ESPECIALES, CONSECUENTES, PUNITIVOS O EJEMPLARES, INCLUYENDO PÉRDIDA DE GANANCIAS, DATOS, OPORTUNIDADES DE NEGOCIO, INGRESOS O BUENA VOLUNTAD, INDEPENDIENTEMENTE DE QUE SE HAYA ADVERTIDO DE LA POSIBILIDAD DE TALES DAÑOS.</p>
      <h3>11.5 Fuerza Mayor</h3>
      <p>Ninguna de las partes será responsable por incumplimientos derivados de causas fuera de su control razonable, incluyendo desastres naturales, pandemias, guerras, actos de terrorismo, huelgas, fallas de Internet o infraestructura tecnológica, caídas de Stripe o procesadores de pago, acciones gubernamentales, restricciones regulatorias o cualquier otro evento de fuerza mayor.</p>
    </LegalSection>

    <!-- 12 INDEMNIZACIÓN -->
    <LegalSection id="indemnizacion" num="12" title="Indemnización">
      <p>Usted acepta defender, indemnizar y mantener indemne a ZOKORP, LLC, Zwap, sus directivos, empleados, agentes, afiliados, sucesores y cesionarios, de cualquier reclamación, demanda, pérdida, daño, costo o gasto (incluyendo honorarios razonables de abogados) que surjan de:</p>
      <LegalOrderedList :items="indemnizacionItems" />
      <p>ZOKORP se reserva el derecho de asumir la defensa exclusiva de cualquier asunto sujeto a indemnización.</p>
    </LegalSection>

    <!-- 13 MODIFICACIONES -->
    <LegalSection id="modificaciones" num="13" title="Modificación de los Términos">
      <LegalCallout variant="purple">
        <p>
          <strong>DERECHO RESERVADO:</strong> ZOKORP, LLC se reserva el derecho absoluto de modificar, actualizar, enmendar o reemplazar estos Términos en cualquier momento, a su sola discreción y sin necesidad de justificación.
        </p>
      </LegalCallout>
      <h3>13.1 Procedimiento</h3>
      <p>Las modificaciones serán efectivas desde su publicación en la Plataforma. ZOKORP notificará a los Usuarios sobre cambios sustanciales mediante: publicación de los Términos actualizados en el Sitio con nueva fecha de vigencia, notificación por correo electrónico, aviso en el dashboard al iniciar sesión, y/o cualquier otro medio razonable.</p>
      <h3>13.2 Aceptación</h3>
      <p>El uso continuado de la Plataforma después de la publicación de los Términos modificados constituirá su aceptación. Si no está de acuerdo con los cambios, deberá dejar de utilizar la Plataforma y, en su caso, solicitar la liquidación de fondos pendientes.</p>
      <h3>13.3 Revisión Periódica</h3>
      <p>Es su responsabilidad revisar periódicamente estos Términos. La fecha de la última actualización se indicará al inicio de este documento.</p>
    </LegalSection>

    <!-- 14 TERMINACIÓN -->
    <LegalSection id="terminacion" num="14" title="Suspensión y Terminación">
      <h3>14.1 Terminación por el Usuario</h3>
      <p>Usted puede solicitar la cancelación de su cuenta en cualquier momento a través del dashboard o contactando a soporte. La cancelación está sujeta a la liquidación de fondos pendientes, la resolución de disputas o Contracargos en curso, y el cumplimiento de obligaciones financieras pendientes.</p>
      <h3>14.2 Terminación por Zwap</h3>
      <p>Zwap se reserva el derecho de suspender, limitar o terminar su acceso a la Plataforma, temporal o permanentemente, sin responsabilidad, en caso de: violación de estos Términos, actividad fraudulenta, ilegal o sospechosa, falta de pago, resultados adversos en el onboarding o revisiones de KYC/KYB, exceso de Contracargos o actividad de alto riesgo, solicitud de Stripe o autoridades competentes, riesgo para la seguridad de la Plataforma u otros Usuarios, o cualquier otra razón a discreción de Zwap, previa notificación razonable cuando las circunstancias lo permitan.</p>
      <h3>14.3 Efectos</h3>
      <p>Tras la terminación se revocará su acceso. Zwap y/o Stripe podrán retener fondos durante un período de hasta <strong>120 días</strong> posteriores a la terminación para cubrir posibles Contracargos, reembolsos, multas u obligaciones pendientes. Las cláusulas de propiedad intelectual, limitación de responsabilidad, indemnización, confidencialidad y resolución de disputas sobrevivirán a la terminación.</p>
    </LegalSection>

    <!-- 15 DISPUTAS -->
    <LegalSection id="disputas" num="15" title="Resolución de Disputas y Ley Aplicable">
      <h3>15.1 Ley Aplicable</h3>
      <p>Estos Términos se regirán por las leyes del Estado de Delaware, EE. UU., sin efecto a sus disposiciones sobre conflictos de leyes.</p>
      <h3>15.2 Negociación Directa</h3>
      <p>Antes de iniciar cualquier procedimiento formal, las partes intentarán resolver la disputa de buena fe mediante negociación directa durante un mínimo de <strong>30 días</strong> desde la notificación escrita.</p>
      <h3>15.3 Arbitraje Vinculante</h3>
      <p>Si la disputa no se resuelve mediante negociación, será sometida a <strong>arbitraje vinculante</strong> administrado por la Asociación Americana de Arbitraje (AAA) conforme a sus Reglas de Arbitraje Comercial. El arbitraje se realizará en Miami, Florida, EE. UU. (o virtualmente). El idioma será inglés. La decisión del árbitro será definitiva y vinculante.</p>
      <h3>15.4 Renuncia a Acciones Colectivas</h3>
      <p>USTED ACEPTA QUE CUALQUIER RECLAMACIÓN SE PRESENTARÁ EXCLUSIVAMENTE A TÍTULO INDIVIDUAL, NO COMO PARTE DE UNA ACCIÓN COLECTIVA, CONSOLIDADA O REPRESENTATIVA.</p>
      <h3>15.5 Prescripción</h3>
      <p>Cualquier reclamación deberá presentarse dentro de <strong>un (1) año</strong> desde el evento que la origina.</p>
      <h3>15.6 Medidas Cautelares</h3>
      <p>ZOKORP podrá solicitar medidas cautelares ante cualquier tribunal competente para proteger propiedad intelectual, información confidencial o la seguridad de la Plataforma.</p>
    </LegalSection>

    <!-- 16 FINAL -->
    <LegalSection id="final" num="16" title="Disposiciones Finales">
      <h3>16.1 Acuerdo Completo</h3>
      <p>Estos Términos, junto con la Política de Privacidad, los términos de Stripe aplicables y cualquier acuerdo complementario, constituyen el acuerdo completo entre las partes respecto al uso de Zwap.</p>
      <h3>16.2 Divisibilidad</h3>
      <p>Si alguna disposición es declarada inválida, las restantes permanecerán vigentes.</p>
      <h3>16.3 Renuncia</h3>
      <p>La omisión de Zwap en ejercer un derecho no constituirá renuncia al mismo.</p>
      <h3>16.4 Cesión</h3>
      <p>Usted no podrá ceder estos Términos sin consentimiento escrito de ZOKORP. ZOKORP podrá cederlos libremente en caso de fusión, adquisición o venta de activos.</p>
      <h3>16.5 Notificaciones</h3>
      <p>Las notificaciones de Zwap se enviarán al correo registrado o se publicarán en la Plataforma.</p>
      <h3>16.6 Idioma</h3>
      <p>En caso de discrepancia entre versiones, prevalecerá la versión en español. Para procedimientos legales, prevalecerá la versión en inglés.</p>
      <h3>16.7 Uso Aceptable</h3>
      <p>Usted se compromete a utilizar Zwap únicamente para procesar pagos legítimos por Servicios Turísticos reales. Queda prohibido: utilizar la Plataforma para actividades fraudulentas, ilegales o de lavado de dinero; procesar pagos por bienes o servicios no relacionados con turismo (salvo autorización expresa); interferir con el funcionamiento de la Plataforma; intentar acceder a sistemas o datos no autorizados; compartir credenciales con terceros no autorizados; y utilizar robots, scrapers o métodos automatizados sin autorización.</p>
      <h3>16.8 Servicios de Terceros</h3>
      <p>La Plataforma integra servicios de terceros (Stripe, proveedores de liquidación, etc.) cuyos términos son independientes. Zwap no controla ni es responsable de dichos servicios.</p>
      <h3>16.9 Relación con Términos de Stripe</h3>
      <p>En caso de conflicto entre estos Términos y los términos de servicio de Stripe respecto al procesamiento de pagos y custodia de fondos, prevalecerán los términos de Stripe en esas materias específicas.</p>
    </LegalSection>

    <!-- 17 CONTACTO -->
    <LegalSection id="contacto" num="17" title="Contacto">
      <p>Para preguntas, comentarios o reclamos sobre estos Términos:</p>
      <LegalCallout variant="purple">
        <p>
          <strong>Zwap — Producto de ZOKORP, LLC</strong><br>
          25 SW 9th St, Suite 406, Miami, FL 33130, USA<br><br>
          Correo electrónico: <strong>legal@zwap.dev</strong><br>
          Sitio web: <strong>zwap.dev</strong>
        </p>
      </LegalCallout>
      <p class="italic text-[13px] mt-6 opacity-80">
        Estos Términos y Condiciones fueron preparados para Zwap (ZOKORP, LLC) y tienen carácter orientativo. Se recomienda que un abogado calificado los revise antes de su publicación definitiva. Zwap y ZOKORP no proporcionan asesoramiento legal a sus Usuarios.
      </p>
    </LegalSection>
  </LegalLayout>
</template>
