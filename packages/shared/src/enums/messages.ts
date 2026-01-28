export const ErrorTypes = {
  SystemError: 'Hubo un error en el sistema, por favor intenta nuevamente',
  InvalidReport: 'El número de reporte ingresado no es válido',
  ReportNotFound: 'No se encontró el reporte o no estas autorizado para verlo',
  InvalidParameters: 'Parámetros suministrados inválidos',
  EmptyFileUrl: 'No se encontró la ruta que contiene el documento de la orden',
  InvalidPermission: 'No tiene permiso para visualizar esta página',
  ErrorPermission: 'No tiene permiso para realizar esta acción',
  OIANotFound: 'No se encontró el OIA indicado',
  ErrorOIA:
    'OIA no se encuentra registrado en el portal validador o no tiene un estado válido.',
  ReportCanNotValidate: 'Este reporte ya fue gestionado.',
  consecutiveInUse: 'Consecutivo se encuentra asociado a otro reporte.',
  phoneIsAlreadyRegistered:
    'El número de celular ingresado se encuentra asociado a otro usuario.',
  companyIsAlreadyRegistered: 'La Firma instaladora ya se encuentra registrada en el portal.',
  S3UploadFailed: 'No se pudo subir el reporte a S3',
  InvalidPersonNumber: 'El número de identificación ingresado no es válido',
  EmailInUse: 'La cuenta de Directorio Activo ya se encuentra en uso',
  MissingUserFields:
    'Los campos de acceso del usuario son obligatorios: nombre, teléfono y correo electrónico',
  UserNotFound: 'Usuario no encontrado',
} as const;

export type ErrorType = (typeof ErrorTypes)[keyof typeof ErrorTypes];

export const TextTypes = {
  TextValidate: 'El documento ya se encuentra validado',
  NoPendingReports: 'No hay mas reportes pendientes',
  AlreadyAssignedRedirect:
    'El documento seleccionado ya está siendo gestionado por otro validador. ' +
    'Ha sido redirigido al siguiente reporte disponible para gestión',
  AlreadyAssigned:
    'Debe terminar de gestionar este reporte antes de continuar. ' +
    'Si no desea gestionarlo, presione el botón  "Cancelar Gestión".',
  TextStartedDiferentUser: 'El documento ya está siendo gestionado por otro usuario validador',
} as const;

export const TypeNotify = {
  SuccessReport: 'Informe guardado exitosamente.',
  ErrorReport:
    'Estado de empresa inválido para el registro del informe, por favor intenta nuevamente',
  Success:
    'El registro fue exitoso, recibirá un correo indicandole el estado de la solicitud',
  UpdateSuccess: 'La actualización de datos se realizó con éxito',
  Error: 'Hubo un error en el sistema, por favor intenta nuevamente',
  InvalidDataError:
    'La información ingresada no es válida, por favor comprobar los datos ingresados e intentar nuevamente',
  InvalidInspectionTypeError:
    'La información ingresada no es válida, por favor comprobar el dato ingresado en tipo de inspección',
  ErrorOIA:
    'No fue posible continuar con el registro, por favor validar la información e intentar nuevamente',
  CreateSuccess: 'El usuario fue creado exitosamente',
} as const;

export const TypeIcon = {
  Success: 'success',
  Error: 'error',
  Warning: 'warning',
  Info: 'info',
} as const;

export type TypeIconType = (typeof TypeIcon)[keyof typeof TypeIcon];

export const validateReportErrors = {
  InspectionResultDefects:
    'Resultado de la inspección no concuerda con cantidad de defectos escogidos, favor validar',
  InspectionResultCertifiedDefects: 'Resultado de la inspección escogido no acepta defectos',
  InvalidInspector:
    'Inspector ingresado no es válido o no fue encontrado favor verificar la información en el portal e intentar nuevamente',
  InvalidOIA:
    'OIA ingresado no es válido o no fue encontrado favor verificar la información en el portal e intentar nuevamente',
  InvalidInspectionDate: 'La fecha de inspección no puede ser mayor a la fecha actual',
  InvalidConsecutive:
    'El consecutivo registrado en el informe ya fue usado por el organismo previamente, corregir valor y volver a intentar',
  ReportDuplicated: 'Ya existe un reporte con el mismo número de orden a la espera de gestión.',
  InvalidDateFormat: 'La fecha de inspección no tiene el formato esperado DD/MM/YYYY',
  InvalidPersonNumber:
    'El número de identificación ingresado no es válido, favor verificar la información e intentar nuevamente',
} as const;
