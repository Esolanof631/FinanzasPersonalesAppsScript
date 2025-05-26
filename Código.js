/**
 * @fileoverview Este script procesa correos electrónicos de un remitente específico
 * dentro del mes actual, extrae datos clave (Comercio, Ciudad, Fecha, Tipo, Monto)
 * del contenido HTML de cada correo, y los escribe en una hoja de Google Sheets
 * llamada "Finanzas". Previene la lectura de correos duplicados marcándolos
 * con una etiqueta de Gmail. La hoja de cálculo se crea en una ruta específica.
 */

/**
 * Procesa los correos electrónicos de un remitente específico dentro del mes actual,
 * extrayendo los datos de transacción y escribiéndolos en Google Sheets,
 * evitando duplicados y creando la hoja en una ruta específica.
 */
function processMonthlyTransactions() {
  const today = new Date(); // La fecha actual, que será el 1ro del mes cuando el trigger se ejecute.

  const senderEmail = 'notificacion@notificacionesbaccr.com';
  const spreadsheetName = 'Finanzas'; // Nombre de la hoja de cálculo de Google Sheets.
  const processedLabelName = 'Finanzas_Procesado'; // Nombre de la etiqueta de Gmail para marcar correos ya procesados.
  // Ruta de la carpeta donde se creará la hoja de cálculo, relativa a "Mi unidad".
  const targetFolderPath = "Proyectos Personales/Finanzas Personales"; 

  // --- Lógica para obtener el rango de fechas del MES ANTERIOR ---
  // Establece la fecha de inicio de búsqueda al primer día del mes ANTERIOR
  const searchStartDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  searchStartDate.setHours(0, 0, 0, 0); // Asegura que empiece justo al inicio del día.

  // Establece la fecha de fin de búsqueda al primer día del MES ACTUAL.
  // El filtro 'before:' en Gmail es exclusivo, por lo que incluirá hasta el último segundo del día anterior a searchEndDate.
  const searchEndDate = new Date(today.getFullYear(), today.getMonth(), 1);
  searchEndDate.setHours(0, 0, 0, 0); // Asegura que sea el inicio del 1ro del mes actual.


  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  const formattedSearchStartDate = formatDate(searchStartDate);
  const formattedSearchEndDate = formatDate(searchEndDate);

  // --- Manejo de la etiqueta de Gmail para evitar duplicados ---
  let processedLabel = GmailApp.getUserLabelByName(processedLabelName);
  if (!processedLabel) {
    processedLabel = GmailApp.createLabel(processedLabelName);
    Logger.log(`Etiqueta de Gmail "${processedLabelName}" creada.`);
  } else {
    Logger.log(`Etiqueta de Gmail "${processedLabelName}" encontrada.`);
  }

  // Construye la consulta de búsqueda para Gmail, incluyendo el remitente,
  // el rango de fechas (mes anterior) y excluyendo los correos ya marcados con la etiqueta.
  const searchQuery = `from:${senderEmail} after:${formattedSearchStartDate} before:${formattedSearchEndDate} -label:${processedLabel.getName()}`;

  Logger.log(`Buscando correos con la consulta: "${searchQuery}"`);

  try {
    const threads = GmailApp.search(searchQuery);

    Logger.log(`Se encontraron ${threads.length} hilos de correo SIN PROCESAR del remitente "${senderEmail}" ` +
               `entre el ${formattedSearchStartDate} y el ${formattedSearchEndDate}.`);

    if (threads.length === 0) {
      Logger.log('No se encontraron correos nuevos para procesar en este período.');
      return;
    }

    // --- Integración con Google Sheets (Lógica de apertura/creación mejorada con ruta directa) ---
    let spreadsheet;
    let targetFolder;

    try {
      // Busca o crea la estructura de carpetas deseada.
      let currentFolder = DriveApp.getRootFolder(); // Empieza desde "Mi unidad"
      const folderPathParts = targetFolderPath.split('/');

      folderPathParts.forEach(part => {
        let subFolders = currentFolder.getFoldersByName(part);
        if (subFolders.hasNext()) {
          currentFolder = subFolders.next(); // La carpeta ya existe, la usa.
        } else {
          currentFolder = currentFolder.createFolder(part); // La carpeta no existe, la crea.
          Logger.log(`Carpeta "${part}" creada.`);
        }
      });
      targetFolder = currentFolder; // La carpeta final donde queremos el archivo.
      Logger.log(`Carpeta de destino: "${targetFolder.getName()}" (${targetFolder.getId()})`);

      // Intenta encontrar la hoja de cálculo dentro de la carpeta de destino.
      const filesInTargetFolder = targetFolder.getFilesByName(spreadsheetName);
      if (filesInTargetFolder.hasNext()) {
        const file = filesInTargetFolder.next();
        spreadsheet = SpreadsheetApp.open(file); // Abre el archivo por su objeto File.
        Logger.log(`Hoja de cálculo "${spreadsheetName}" encontrada y abierta en la carpeta de destino.`);
      } else {
        // Si no se encuentra en la carpeta de destino, la crea y la mueve explícitamente.
        Logger.log(`Hoja de cálculo "${spreadsheetName}" no encontrada en la carpeta de destino. Creándola...`);
        
        // Crea la hoja de cálculo en la raíz (comportamiento predeterminado de SpreadsheetApp.create).
        spreadsheet = SpreadsheetApp.create(spreadsheetName); 
        const file = DriveApp.getFileById(spreadsheet.getId()); // Obtiene el objeto de archivo de la hoja.

        // Mueve el archivo de la hoja de cálculo a la carpeta final.
        // Primero, lo remueve de la carpeta raíz (Mi unidad).
        DriveApp.getRootFolder().removeFile(file);
        // Luego, lo añade a la carpeta de destino.
        targetFolder.addFile(file);
        
        Logger.log(`Hoja de cálculo "${spreadsheetName}" creada y movida a "Mi unidad/${targetFolderPath}".`);
      }

    } catch (e) {
      Logger.log(`Error al manejar la hoja de cálculo o carpetas: ${e.toString()}`);
      // Si hay un error grave en la creación/apertura, salimos.
      return;
    }

    let sheet = spreadsheet.getSheets()[0];
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Transacciones');
      Logger.log('Nueva hoja "Transacciones" insertada.');
    }

    const headers = ['Comercio', 'Ciudad y País', 'Fecha', 'Tipo de Transacción', 'Monto'];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      Logger.log('Encabezados añadidos a la hoja.');
    }

    const rowsToWrite = [];

    threads.forEach(thread => {
      const messages = thread.getMessages();
      const latestMessage = messages[messages.length - 1];
      const htmlBody = latestMessage.getBody();

      const extractAndClean = (body, regex) => {
        const match = body.match(regex);
        if (match && match[1]) {
          return match[1].replace(/<\/?p>/g, '').replace(/\r?\n/g, '').trim();
        }
        return 'N/A';
      };

      // Regex para Comercio
      const comercioRegex = /Comercio(?:[\s\S]*?)<td[^>]*>[\s\S]*?<p>([\s\S]*?)<\/p>[\s\S]*?<\/td>/;
      // Regex para Ciudad y país (maneja la entidad HTML &iacute; o el carácter í)
      const ciudadPaisRegex = /Ciudad y pa(?:&iacute;|í)s:(?:[\s\S]*?)<td[^>]*>[\s\S]*?<p>([\s\S]*?)<\/p>[\s\S]*?<\/td>/;
      // Regex para Fecha
      const fechaRegex = /Fecha:(?:[\s\S]*?)<td[^>]*>[\s\S]*?<p>([\s\S]*?)<\/p>[\s\S]*?<\/td>/;
      // Regex para Tipo de Transacción (maneja la entidad HTML &oacute; o el carácter ó)
      const tipoTransaccionRegex = /Tipo de Transacci(?:&oacute;|ó)n:(?:[\s\S]*?)<td[^>]*>[\s\S]*?<p>([\s\S]*?)<\/p>[\s\S]*?<\/td>/;

      const comercio = extractAndClean(htmlBody, comercioRegex);
      const ciudadPais = extractAndClean(htmlBody, ciudadPaisRegex);
      const fecha = extractAndClean(htmlBody, fechaRegex);
      const tipoTransaccion = extractAndClean(htmlBody, tipoTransaccionRegex);

      // --- Extracción y limpieza del Monto (Estrategia de dos pasos) ---
      const montoFullTdRegex = /Monto\s*:(?:[\s\S]*?)<td[^>]*>([\s\S]*?)<\/td>/;
      const montoFullTdMatch = htmlBody.match(montoFullTdRegex);
      let montoRawContent = montoFullTdMatch && montoFullTdMatch[1] ? montoFullTdMatch[1] : '';

      const cleanedMontoContent = montoRawContent.replace(/<\/?p>/g, '').replace(/\r?\n/g, '').trim();
      const numberExtractRegex = /CRC\s*([\d.,]+)/;
      const numberMatch = cleanedMontoContent.match(numberExtractRegex);

      let monto = numberMatch && numberMatch[1] ? numberMatch[1].trim() : '0.00';
      monto = monto.replace(/\./g, '').replace(/,/g, '.');
      const parsedMonto = parseFloat(monto) || 0;

      // Crea un array con los datos en el orden de los encabezados.
      const rowData = [comercio, ciudadPais, fecha, tipoTransaccion, parsedMonto];
      rowsToWrite.push(rowData);

      // ¡Importante! Marca el correo como procesado en el HILO.
      thread.addLabel(processedLabel);
      Logger.log(`Correo (Asunto: ${latestMessage.getSubject()}) marcado con la etiqueta "${processedLabelName}".`);

      Logger.log(`Datos extraídos y listos para escribir (Asunto: ${latestMessage.getSubject()}):`);
      Logger.log(JSON.stringify(rowData, null, 2));
    });

    if (rowsToWrite.length > 0) {
      rowsToWrite.forEach(row => {
        sheet.appendRow(row);
      });
      Logger.log(`Se escribieron ${rowsToWrite.length} filas en la hoja "${sheet.getName()}".`);
    } else {
      Logger.log('No hay datos de transacciones nuevos para escribir en la hoja.');
    }

    Logger.log(`Procesamiento completado. Total de transacciones procesadas: ${rowsToWrite.length}`);

  } catch (error) {
    Logger.log(`Error al procesar correos o escribir en Sheets: ${error.toString()}`);
  }
}
