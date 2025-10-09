/**
 * Utilidad para mapear campos de ordenamiento del frontend al backend
 * Cumple con los requisitos 2.1, 2.2, 2.3, 2.4, 2.5
 */

export const FIELD_MAPPING: Record<string, string> = {
  'titulo': 'title',
  'prioridad': 'priority',
  'fechaVencimiento': 'dueDate',
  'title': 'title',
  'priority': 'priority',
  'dueDate': 'dueDate',
  'createdAt': 'createdAt'
};

/**
 * Mapea un campo de ordenamiento del frontend al backend
 * @param field Campo del frontend
 * @returns Campo mapeado para el backend o 'createdAt' como fallback
 */
export function mapSortField(field: string): string {
  const mappedField = FIELD_MAPPING[field];
  if (!mappedField) {
    console.warn(`Campo de ordenamiento inválido: ${field}, usando 'createdAt' como fallback`);
    return 'createdAt';
  }
  return mappedField;
}

/**
 * Valida que la dirección de ordenamiento sea válida
 * @param direction Dirección de ordenamiento
 * @returns Dirección válida o 'desc' como fallback
 */
export function validateSortDirection(direction: string): 'asc' | 'desc' {
  if (!['asc', 'desc'].includes(direction)) {
    console.warn(`Dirección de ordenamiento inválida: ${direction}, usando 'desc' como fallback`);
    return 'desc';
  }
  return direction as 'asc' | 'desc';
}
