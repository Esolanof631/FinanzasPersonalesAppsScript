# Dashboard de Finanzas Personales Interactivo

Este repositorio alberga el código de Google Apps Script y documenta la implementación de un **dashboard interactivo para la gestión de finanzas personales**. El objetivo principal de este proyecto es transformar datos de transacciones almacenados en Google Sheets en visualizaciones claras y accionables mediante Google Looker Studio, facilitando un seguimiento detallado de los gastos y la identificación de patrones de consumo.

## 🚀 Herramientas y Tecnologías Utilizadas

El desarrollo e implementación de este sistema se realizó empleando las siguientes herramientas y tecnologías clave:

* **Google Sheets:** Sirve como la base de datos centralizada para el almacenamiento y la organización de todas las transacciones financieras. Se prestó especial atención a la configuración y el formato adecuados de los datos para garantizar su correcta interpretación.
* **Google Apps Script:** Este lenguaje de scripting basado en JavaScript, integrado en Google Workspace, desempeña un papel fundamental en la automatización del proyecto. Permite procesar datos y gestionar la interacción con la hoja de cálculo de forma programática.
* **Google Looker Studio (anteriormente Google Data Studio):** La plataforma de Business Intelligence utilizada para la creación de informes y dashboards. Se conecta directamente a la Google Sheet para transformar los datos en visualizaciones interactivas (gráficos, tablas, indicadores).
* **`clasp` (Command Line Apps Script):** Una herramienta de línea de comandos esencial para la gestión de proyectos de Google Apps Script desde un entorno local. Permite clonar (descargar) el código de Apps Script al ordenador y luego sincronizarlo (subir) de nuevo.
* **Git:** Un sistema de control de versiones distribuido que permite rastrear los cambios en el código, mantener un historial de versiones y preparar el código para ser compartido.
* **GitHub:** Una plataforma líder para el alojamiento de repositorios Git, que proporciona almacenamiento remoto seguro, funcionalidades de colaboración y acceso ubicuo al código fuente del proyecto.
* **VS Code (Visual Studio Code):** El entorno de desarrollo integrado (IDE) utilizado para la gestión local del proyecto, la edición de código y la ejecución de comandos Git a través de su terminal integrada.

## 📈 Metodología de Desarrollo y Características Implementadas

El proyecto se desarrolló siguiendo un enfoque estructurado, abordando componentes clave para ofrecer una solución integral de visualización de finanzas:

1.  **Conexión y Preparación de Datos:**
    * Se estableció la conexión robusta entre la Google Sheet (fuente de datos primario) y Google Looker Studio.
    * Se realizó una configuración detallada para asegurar el reconocimiento y formato correcto de las fechas, crucial para análisis temporales.

2.  **Diseño y Construcción del Dashboard:**
    * **Selector de Período de Fechas:** Se implementó un control interactivo que permite a los usuarios filtrar dinámicamente los datos de todos los gráficos por cualquier rango de tiempo deseado.
    * **Tabla de Transacciones Detallada:** Una tabla fundamental para listar las transacciones, configurada con un filtro de período predeterminado para mostrar "El mes pasado" al cargar el informe.
    * **Gráfico de Barras de Gasto Mensual:** Una visualización clave que presenta la tendencia de gasto a lo largo del tiempo, agrupando los datos por mes y mostrando los últimos 12 meses por defecto.
    * **Tabla de Top Comercios:** Una tabla dinámica que identifica los principales comercios por volumen de gasto, utilizando ordenación descendente por monto y limitando las filas a los N comercios principales.
    * **Cuadro de Resultados de Comparación Mes a Mes:** Un indicador esencial que muestra el gasto total de un período seleccionado (por defecto, "El mes pasado") y lo compara porcentualmente con el período inmediatamente anterior, facilitando la evaluación del rendimiento financiero.

3.  **Gestión de Código con Git y GitHub:**
    * El código de Google Apps Script fue clonado localmente utilizando `clasp` para permitir el control de versiones.
    * Se inicializó un repositorio Git local y se vinculó con un repositorio remoto en GitHub.
    * Se gestionaron y resolvieron configuraciones iniciales de Git (identidad del autor) y permisos de ejecución de scripts de PowerShell para asegurar una operación fluida.
    * El código se versionó y se subió a GitHub, estableciendo `main` como la rama principal.

4.  **Acceso y Usabilidad:**
    * El dashboard está diseñado para ser accesible vía web, permitiendo su visualización desde cualquier navegador, incluyendo dispositivos móviles (gracias al diseño adaptable de Looker Studio).

## 📁 Contenido del Repositorio

* `Código.gs`: Contiene el código fuente de Google Apps Script. Este script está diseñado para [Menciona brevemente la funcionalidad clave de tu script. Ej: "extraer y procesar datos de transacciones de una fuente bancaria y volcarlos a la Google Sheet", o "automatizar la limpieza y organización de datos en la hoja"].
* `appsscript.json`: El archivo de manifiesto del proyecto de Apps Script, que define las configuraciones, permisos y servicios API utilizados por el script.
* `.clasp.json`: Archivo de configuración local de `clasp` que establece la vinculación entre este directorio local y el proyecto de Google Apps Script en la nube.

---
*Este proyecto es una iniciativa personal para la gestión y análisis de finanzas.*
