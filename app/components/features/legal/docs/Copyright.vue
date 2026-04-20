<script setup>
import { computed } from 'vue'
import { useThemeStore } from '~/stores/theme'
import LegalLayout from '../LegalLayout.vue'
import LegalSection from '../LegalSection.vue'
import LegalCallout from '../LegalCallout.vue'
import LegalOrderedList from '../LegalOrderedList.vue'
import LegalCopyrightNotice from '../LegalCopyrightNotice.vue'

const { t } = useI18n()
const themeStore = useThemeStore()

const tocItems = [
  { id: 'aviso', label: 'Aviso General' },
  { id: 'titularidad', label: 'Titularidad' },
  { id: 'marca', label: 'Marca y Logo' },
  { id: 'software', label: 'Software' },
  { id: 'contenido', label: 'Contenido' },
  { id: 'restricciones', label: 'Restricciones' },
  { id: 'licencia', label: 'Licencia de Uso' },
  { id: 'terceros', label: 'Propiedad de Terceros' },
  { id: 'contenido-usuario', label: 'Contenido del Usuario' },
  { id: 'infracciones', label: 'Infracciones' },
  { id: 'dmca', label: 'DMCA' },
  { id: 'contacto', label: 'Contacto' },
]

const restriccionesItems = [
  '<strong>Copiar, reproducir o duplicar</strong> el software, código fuente, diseños, contenido o cualquier elemento de la Plataforma, total o parcialmente.',
  '<strong>Modificar, adaptar o crear obras derivadas</strong> basadas en el software, la marca o el contenido de Zwap.',
  '<strong>Descompilar, realizar ingeniería inversa, desensamblar</strong> o intentar extraer el código fuente del software.',
  '<strong>Distribuir, sublicenciar, vender, alquilar o prestar</strong> el software o cualquier componente de la Plataforma.',
  '<strong>Scraping o extracción automatizada</strong> de datos, contenido, diseños o cualquier información de la Plataforma.',
  '<strong>Framing, mirroring o deep-linking</strong> del sitio web o dashboard sin autorización.',
  '<strong>Remover o alterar avisos de copyright</strong>, marcas registradas u otros avisos de propiedad incluidos en la Plataforma.',
  '<strong>Utilizar la propiedad intelectual de Zwap</strong> para entrenar modelos de inteligencia artificial o machine learning sin autorización.',
  '<strong>Reclamar autoría o titularidad</strong> sobre cualquier elemento de propiedad intelectual de Zwap.',
  '<strong>Registrar como propios</strong> marcas, dominios, nombres comerciales o diseños confusamente similares a Zwap.',
]

const infraccionesItems = [
  '<strong>Terminación inmediata</strong> de la cuenta del infractor y revocación de la licencia de uso.',
  '<strong>Acciones legales civiles</strong> por infracción de derechos de autor, marcas y/o secretos comerciales, incluyendo daños y perjuicios, lucro cesante e indemnización por daño moral.',
  '<strong>Acciones penales</strong> cuando la infracción constituya delito según la legislación aplicable.',
  '<strong>Medidas cautelares</strong> (injunctions) ante tribunales competentes para detener inmediatamente la actividad infractora.',
  '<strong>Reclamación de honorarios de abogados</strong> y costos legales conforme a lo permitido por la ley.',
  '<strong>Notificaciones de retiro (takedown notices)</strong> a plataformas de hosting, registradores de dominio, tiendas de aplicaciones y redes sociales donde se encuentre el contenido infractor.',
]

// Brand card classes (simpler structure for brand showcase, since icons are specialized)
const brandCardBase = computed(() =>
  themeStore.isDarkMode
    ? 'bg-[#1A1A1D] border border-white/12'
    : 'bg-white border border-[#E5E2EE]',
)
const brandIconPurple = computed(() =>
  themeStore.isDarkMode ? 'bg-[#7C3AED]/18' : 'bg-[#F0ECFF]',
)
const brandIconDark = 'bg-[#111113]'
const brandLabelColor = computed(() =>
  themeStore.isDarkMode ? 'text-[#A78BFA]' : 'text-[#7C3AED]',
)
const brandDescColor = computed(() =>
  themeStore.isDarkMode ? 'text-[#888991]' : 'text-[#67656E]',
)
</script>

<template>
  <LegalLayout
    :title="t('legal.copyrightTitle')"
    :title-line2="t('legal.copyrightTitleLine2')"
    :badge="t('legal.documentBadge')"
    effective-date="24 de febrero de 2026"
    updated-date="24 de febrero de 2026"
    :toc-items="tocItems"
  >
    <!-- Copyright hero notice -->
    <LegalCopyrightNotice
      text="© 2024–2026 ZOKORP, LLC. Todos los derechos reservados."
      sub="Zwap, el isotipo de Zwap, el logotipo &quot;Z&quot; y todas las marcas, diseños,<br>código y contenido asociados son propiedad exclusiva de ZOKORP, LLC."
    />

    <!-- 01 AVISO -->
    <LegalSection id="aviso" num="01" title="Aviso General de Derechos de Autor">
      <p>Todo el contenido, materiales, software, diseño, interfaces, textos, gráficos, logotipos, marcas, código fuente, algoritmos, bases de datos, y demás elementos que forman parte de la plataforma <strong>Zwap</strong> (accesible en zwap.dev, la aplicación móvil, APIs y cualquier otro canal) están protegidos por las leyes de derechos de autor (copyright) de los Estados Unidos de América, tratados internacionales de propiedad intelectual y las leyes aplicables en cada jurisdicción donde Zwap opera.</p>
      <p>La reproducción, distribución, modificación, exhibición pública, transmisión o cualquier otro uso no autorizado del contenido protegido está estrictamente prohibido y puede dar lugar a acciones civiles y penales.</p>
    </LegalSection>

    <!-- 02 TITULARIDAD -->
    <LegalSection id="titularidad" num="02" title="Titularidad de los Derechos">
      <p>Todos los derechos de propiedad intelectual sobre Zwap pertenecen exclusivamente a:</p>
      <LegalCallout variant="purple">
        <p>
          <strong>ZOKORP, LLC</strong><br>
          Sociedad de responsabilidad limitada constituida en el Estado de Delaware, EE. UU.<br>
          Delaware File Number: 4963479 · EIN: 38-4330071<br>
          Oficina principal: 25 SW 9th St, Suite 406, Miami, FL 33130, USA
        </p>
      </LegalCallout>
      <p>ZOKORP, LLC es la titular exclusiva de todos los derechos patrimoniales y morales (cuando aplique) sobre la Plataforma, incluyendo sin limitación: los derechos de autor sobre el código fuente, el diseño visual y la arquitectura del software, los derechos de marca sobre "Zwap", "ZOKORP" y elementos asociados, los derechos sobre las invenciones, procesos y algoritmos (incluyendo el sistema de IA para onboarding), y los derechos sobre bases de datos, compilaciones y contenido original.</p>
    </LegalSection>

    <!-- 03 MARCA Y LOGO -->
    <LegalSection id="marca" num="03" title="Marca, Logotipo e Identidad Visual">
      <h3>3.1 Elementos Protegidos</h3>
      <p>Los siguientes elementos constituyen propiedad intelectual de ZOKORP, LLC y están protegidos como marcas comerciales, diseños industriales y/o derechos de autor:</p>

      <div class="grid gap-3 my-4" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))">
        <div
          v-for="card in [
            { label: 'Isotipo', desc: 'El icono &quot;Z&quot; con flechas contrapuestas y espacio negativo, en todas sus variaciones (gradiente, blanco, monocromático).', iconType: 'z' },
            { label: 'Logotipo', desc: 'La palabra &quot;ZWAP&quot; en su tipografía distintiva, inclinada, y todas las combinaciones con el isotipo.', iconType: 'zwap' },
            { label: 'Paleta Cromática', desc: 'El esquema de colores corporativos (#111113, #7C3AED, #A78BFA, #DBD3FB) como conjunto de identidad de marca.', iconType: 'palette' },
            { label: 'Nombre Comercial', desc: '&quot;Zwap&quot;, &quot;ZWAP&quot;, &quot;Zwap.dev&quot; y cualquier variación, dominio o subdominio asociado.', iconType: 'name' },
          ]"
          :key="card.label"
          :class="['rounded-lg px-5 py-5 text-center', brandCardBase]"
        >
          <div :class="['w-12 h-12 mx-auto mb-3 rounded-[10px] flex items-center justify-center', card.iconType === 'zwap' || card.iconType === 'palette' ? brandIconPurple : brandIconDark]">
            <!-- Z isotipo -->
            <svg v-if="card.iconType === 'z'" viewBox="0 0 28 28" fill="none" width="28" height="28">
              <defs>
                <linearGradient id="copyZg1" x1="0" y1="0" x2="28" y2="28">
                  <stop offset="0%" stop-color="#DBD3FB"/>
                  <stop offset="100%" stop-color="#7C3AED"/>
                </linearGradient>
              </defs>
              <path d="M4 8h14l-10 12h14" stroke="url(#copyZg1)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
            <!-- ZWAP word -->
            <span v-else-if="card.iconType === 'zwap'" class="font-extrabold text-[14px] italic tracking-tighter" :class="themeStore.isDarkMode ? 'text-white' : 'text-[#111113]'">ZWAP</span>
            <!-- Palette swatch -->
            <div v-else-if="card.iconType === 'palette'" class="w-6 h-6 rounded-md" style="background: linear-gradient(135deg, #DBD3FB, #7C3AED)" />
            <!-- Aa name -->
            <span v-else class="text-white text-[13px] font-bold">Aa</span>
          </div>
          <div :class="['text-[12.5px] font-bold uppercase tracking-[0.06em] mb-1', brandLabelColor]">
            {{ card.label }}
          </div>
          <div :class="['text-[13px] leading-[1.55]', brandDescColor]" v-html="card.desc" />
        </div>
      </div>

      <h3>3.2 Uso No Autorizado de la Marca</h3>
      <p>Queda estrictamente prohibido sin autorización previa y por escrito de ZOKORP, LLC: utilizar la marca "Zwap", el isotipo o cualquier elemento de identidad visual en productos, servicios, materiales promocionales o sitios web de terceros; registrar dominios, nombres comerciales, marcas o nombres de usuario en redes sociales que contengan "Zwap", "ZOKORP" o variaciones confusamente similares; crear materiales que sugieran patrocinio, asociación, endorsement o afiliación con Zwap sin que exista; modificar, distorsionar, alterar los colores o proporciones del logotipo o isotipo; y utilizar los elementos de marca de forma que pueda dañar la reputación de Zwap o ZOKORP.</p>
      <h3>3.3 Uso Permitido por Clientes</h3>
      <p>Los Clientes registrados y activos en Zwap pueden: mostrar el badge "Pagos procesados por Zwap" o similares proporcionados por Zwap en sus sitios web o establecimientos, y hacer referencia factual a su uso de Zwap como procesador de pagos. Dicho uso debe cumplir con las directrices de marca que Zwap proporcione y puede ser revocado en cualquier momento.</p>
    </LegalSection>

    <!-- 04 SOFTWARE -->
    <LegalSection id="software" num="04" title="Software y Tecnología">
      <h3>4.1 Elementos Protegidos</h3>
      <p>El software de Zwap incluye componentes propietarios protegidos por derechos de autor y, cuando aplique, secretos comerciales:</p>
      <p>El <strong>dashboard web administrativo</strong> (código fuente, diseño de interfaz, flujos de usuario, componentes), la <strong>aplicación Android Tap to Pay</strong> (código fuente, arquitectura, interfaz), el <strong>sistema de onboarding con IA</strong> (algoritmos de scoring, modelos de machine learning, lógica de evaluación KYC/KYB, datos de entrenamiento compilados), las <strong>APIs propietarias</strong> (diseño, endpoints, documentación, esquemas de datos), el <strong>motor de reportes y analytics</strong> (lógica de cálculo, visualizaciones, métricas específicas para turismo), y el <strong>sistema de notificaciones multi-canal</strong> (arquitectura, templates, lógica de despacho).</p>
      <h3>4.2 Protección Específica del Software</h3>
      <p>El código fuente de Zwap constituye información confidencial y secreto comercial de ZOKORP, LLC. Cualquier intento de descompilar, realizar ingeniería inversa, desensamblar, descifrar, extraer el código fuente, o acceder a la lógica interna del software por medios no autorizados está prohibido bajo la ley federal de EE. UU. (incluyendo el Digital Millennium Copyright Act — DMCA, la Computer Fraud and Abuse Act — CFAA, y la Defend Trade Secrets Act — DTSA) y las leyes aplicables internacionalmente.</p>
    </LegalSection>

    <!-- 05 CONTENIDO -->
    <LegalSection id="contenido" num="05" title="Contenido y Materiales">
      <p>Además del software y la marca, los siguientes materiales están protegidos por derechos de autor:</p>
      <p>Los textos, descripciones, artículos, guías y documentación publicados en zwap.dev y materiales asociados. Los diseños de interfaz, iconografía, ilustraciones, gráficos y elementos visuales. Los materiales de marketing, presentaciones, videos, tutoriales y demos. La estructura, organización y selección del contenido de la Plataforma. Los datos compilados, estadísticas generadas y reportes producidos por Zwap (excluyendo los datos brutos de transacciones que pertenecen a los Clientes). Y esta página de Copyright, los Términos y Condiciones, la Política de Privacidad y demás documentos legales.</p>
    </LegalSection>

    <!-- 06 RESTRICCIONES -->
    <LegalSection id="restricciones" num="06" title="Restricciones y Prohibiciones">
      <LegalCallout variant="warning">
        <p>
          <strong>QUEDA ESTRICTAMENTE PROHIBIDO</strong> realizar cualquiera de las siguientes acciones sin autorización expresa y por escrito de ZOKORP, LLC:
        </p>
      </LegalCallout>
      <LegalOrderedList :items="restriccionesItems" />
    </LegalSection>

    <!-- 07 LICENCIA -->
    <LegalSection id="licencia" num="07" title="Licencia de Uso Otorgada">
      <h3>7.1 Alcance de la Licencia</h3>
      <p>Al registrarse y aceptar los Términos y Condiciones de Zwap, se le otorga una licencia <strong>limitada, no exclusiva, intransferible, no sublicenciable, revocable y personal</strong> para acceder y utilizar la Plataforma y sus funcionalidades únicamente para los fines previstos en los Términos y Condiciones (procesamiento de pagos por Servicios Turísticos).</p>
      <h3>7.2 Lo que la Licencia No Incluye</h3>
      <p>Esta licencia <strong>no transfiere</strong> ningún derecho de propiedad intelectual. No otorga derecho a sublicenciar, redistribuir ni comercializar la Plataforma. No concede acceso al código fuente ni a la lógica interna del software. No autoriza el uso fuera del contexto de los Servicios contratados. Y puede ser revocada en cualquier momento conforme a los Términos y Condiciones.</p>
      <h3>7.3 Vigencia</h3>
      <p>La licencia permanece vigente mientras su cuenta esté activa y usted cumpla con los Términos y Condiciones. Se extingue automáticamente al terminar la relación contractual, por cualquier causa.</p>
    </LegalSection>

    <!-- 08 TERCEROS -->
    <LegalSection id="terceros" num="08" title="Propiedad Intelectual de Terceros">
      <p>Zwap respeta los derechos de propiedad intelectual de terceros. La Plataforma puede integrar o hacer referencia a servicios, productos o marcas de terceros:</p>
      <p><strong>Stripe</strong> es marca registrada de Stripe, Inc. <strong>Android</strong>, <strong>Google Pay</strong> y <strong>NFC</strong> son marcas de Google LLC. <strong>Apple Pay</strong> es marca de Apple Inc. <strong>Visa</strong>, <strong>Mastercard</strong>, <strong>American Express</strong> y otras marcas de redes de pago pertenecen a sus respectivos titulares. Las marcas de proveedores de liquidación (Meru, Takenos, Payoneer, etc.) pertenecen a sus respectivas compañías. La tipografía <strong>Inter</strong> se utiliza bajo licencia de código abierto (SIL Open Font License).</p>
      <p>El uso de estas marcas en Zwap es meramente referencial y no implica patrocinio, asociación o endorsement por parte de sus titulares, salvo acuerdo expreso.</p>
    </LegalSection>

    <!-- 09 CONTENIDO USUARIO -->
    <LegalSection id="contenido-usuario" num="09" title="Contenido Generado por Usuarios">
      <h3>9.1 Propiedad del Usuario</h3>
      <p>Los Clientes conservan la titularidad de su propio contenido (logotipos, descripciones de servicios, fotografías de establecimientos, información comercial) que publiquen o carguen en la Plataforma.</p>
      <h3>9.2 Licencia Otorgada a Zwap</h3>
      <p>Al publicar contenido en Zwap, el Cliente otorga a ZOKORP, LLC una licencia mundial, no exclusiva, libre de regalías, sublicenciable y transferible para usar, reproducir, modificar, adaptar, publicar y exhibir dicho contenido con el fin exclusivo de operar, mejorar, desarrollar y promocionar la Plataforma.</p>
      <h3>9.3 Responsabilidad del Usuario</h3>
      <p>Cada Usuario es responsable de que su contenido no infrinja derechos de propiedad intelectual de terceros. Zwap no asume responsabilidad por infracciones de propiedad intelectual cometidas por los Usuarios.</p>
    </LegalSection>

    <!-- 10 INFRACCIONES -->
    <LegalSection id="infracciones" num="10" title="Consecuencias de la Infracción">
      <p>Cualquier uso no autorizado de la propiedad intelectual de Zwap / ZOKORP puede resultar en:</p>
      <LegalOrderedList :items="infraccionesItems" />
      <p>ZOKORP, LLC se reserva el derecho de perseguir todas las acciones legales disponibles para proteger su propiedad intelectual.</p>
    </LegalSection>

    <!-- 11 DMCA -->
    <LegalSection id="dmca" num="11" title="Procedimiento DMCA">
      <h3>11.1 Notificación de Infracción</h3>
      <p>Si usted cree que algún contenido publicado en Zwap infringe sus derechos de autor, puede enviar una notificación conforme al <strong>Digital Millennium Copyright Act (DMCA)</strong> a nuestro agente designado, incluyendo: identificación de la obra protegida presuntamente infringida, identificación del material infractor y su ubicación en la Plataforma, sus datos de contacto (nombre, dirección, teléfono, email), una declaración de buena fe de que el uso no está autorizado por el titular, el licenciatario ni la ley, una declaración bajo pena de perjurio de que la información es exacta y que usted es el titular o está autorizado para actuar en su nombre, y su firma física o electrónica.</p>
      <h3>11.2 Contra-notificación</h3>
      <p>Si su contenido fue retirado y cree que fue un error, puede enviar una contra-notificación conforme al DMCA.</p>
      <h3>11.3 Agente Designado</h3>
      <LegalCallout variant="purple">
        <p>
          <strong>Agente DMCA de ZOKORP, LLC</strong><br>
          25 SW 9th St, Suite 406, Miami, FL 33130, USA<br>
          Correo electrónico: <strong>dmca@zwap.dev</strong>
        </p>
      </LegalCallout>
      <h3>11.4 Política de Infractores Reincidentes</h3>
      <p>Zwap implementa una política de terminación de cuentas de usuarios que sean infractores reincidentes de derechos de autor, conforme a lo establecido en el DMCA.</p>
    </LegalSection>

    <!-- 12 CONTACTO -->
    <LegalSection id="contacto" num="12" title="Contacto">
      <p>Para consultas relacionadas con propiedad intelectual, solicitudes de licencia o permisos de uso:</p>
      <LegalCallout variant="purple">
        <p>
          <strong>ZOKORP, LLC — Departamento Legal</strong><br>
          25 SW 9th St, Suite 406, Miami, FL 33130, USA<br><br>
          Asuntos de propiedad intelectual: <strong>legal@zwap.dev</strong><br>
          Notificaciones DMCA: <strong>dmca@zwap.dev</strong><br>
          Sitio web: <strong>zwap.dev</strong>
        </p>
      </LegalCallout>
      <p class="italic text-[13px] mt-6 opacity-80">
        Este Aviso de Copyright fue preparado para Zwap (ZOKORP, LLC) y tiene carácter orientativo. Se recomienda que un abogado especializado en propiedad intelectual lo revise antes de su publicación definitiva, especialmente si se planea registrar formalmente las marcas o patentar tecnología.
      </p>
    </LegalSection>
  </LegalLayout>
</template>
