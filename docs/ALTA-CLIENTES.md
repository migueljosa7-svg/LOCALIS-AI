# Alta de clientes de Stella · plantilla de incorporación (3, 10 o 50 negocios)

Cada negocio es **una ficha** (no se entrena ningún modelo por cliente): Stella usa el mismo modelo con la información de ese negocio y nada más. Para gestionar muchos negocios basta repetir el mismo proceso.

## Recorrido de 6 pasos (≈10 minutos por negocio)

| # | Paso | Dónde | Quién |
| --- | --- | --- | --- |
| 1 | **Crear el negocio**: `/admin/stella` → «Dar de alta un negocio» (o «Crear negocio Stella con estos datos» en un lead / «Duplicar esta ficha» desde otro negocio parecido) | Panel | Tú |
| 2 | *(Opcional)* **Importar un borrador** de su web pública: pega su dirección en «Importar borrador». Rellena nombre, descripción, teléfono, email y precios visibles. **No guarda ni activa nada** | Panel | Tú |
| 3 | **Que el cliente rellene su información**: en la ficha, copia el «Enlace para que el cliente complete su ficha» y envíaselo. Sin cuenta ni contraseña; solo puede editar su ficha mientras está desactivada | Enlace público | Cliente |
| 4 | **Revisar**: el panel te avisa («el cliente completó su ficha»). Corrige textos, comprueba precios y dominio | Panel | Tú |
| 5 | **Probar**: «Abrir prueba» (funciona aunque esté desactivado). Pregunta por precios, algo que no esté en la ficha y un intento de manipulación | Panel | Tú |
| 6 | **Instalar y activar**: copia el código de instalación en su web, comprueba el chat y pulsa «Activar» | Su web + panel | Tú / su webmaster |

## Qué puede y qué no puede hacer el cliente con su enlace

| Puede | No puede |
| --- | --- |
| Escribir servicios, precios, horario, preguntas frecuentes, información adicional, WhatsApp, teléfono, email, dominio y su política de privacidad | Activar Stella, cambiar los topes de gasto, ver notas internas, ver o tocar otros negocios |
| Volver al enlace y corregir (14 días) | Editar una ficha que ya está activa (te escribe y lo actualizas) |

## Mensaje tipo para el cliente (cópialo y envíalo tú; el sistema no envía nada)

> Hola {nombre}, para preparar el asistente de {negocio} necesito que rellenes este formulario con tus servicios, precios, horario y datos de contacto: {enlace}. Tarda unos 10 minutos y no necesitas crear ninguna cuenta. Puedes dejar en blanco lo que no sepas y volver al mismo enlace. No se activa nada hasta que lo revisemos juntos.

## Lista de comprobación antes de activar

- [ ] Descripción de al menos 20 caracteres y servicios con precios **reales**.
- [ ] WhatsApp del negocio (es la salida cuando Stella no sabe algo).
- [ ] Dominio exacto de su web (con o sin `www`; los subdominios hay que listarlos).
- [ ] Política de privacidad del negocio (https://…): se muestra junto al consentimiento.
- [ ] Topes de gasto diario y mensual razonables (por defecto 1 $ y 5 $).
- [ ] Prueba hecha: responde con la ficha, dice que no sabe lo que no está, abre el formulario de contacto.
- [ ] Código de instalación pegado y chat visible en su web real (móvil y escritorio).

## Gestionar muchos negocios

- **Panel → Resumen**: asistentes activos, consumo del mes por negocio, errores y topes casi agotados («Requiere atención»).
- **Duplicar ficha** para negocios del mismo sector (peluquerías, talleres…): se copian servicios-tipo, preguntas y horario; cambia el resto.
- Cada negocio tiene sus propios topes: un negocio con mucho tráfico **no puede gastar el presupuesto de otro**.
- Baja: «Desactivar». Los datos se conservan.

## Sobre lo que se importa de una web

- Solo se lee la dirección indicada (una página), solo si es **pública** (se bloquean direcciones internas, localhost, puertos raros y credenciales en la URL).
- Se extraen únicamente datos visibles: título, descripción, teléfonos, emails, redes y líneas con precio.
- Es un **borrador**: puede estar desfasado o incompleto. **Se revisa siempre antes de activar.**
- Respeta que la información de una web es de su titular: úsala solo con permiso del negocio cliente.
