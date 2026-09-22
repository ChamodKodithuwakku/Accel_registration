/**
 * Form validation helpers.
 * Every validator returns an empty string when the value is valid,
 * or a human readable error message when it is not.
 */

// Sri Lankan numbers, accepted shapes:
//   Mobile   : 07XXXXXXXX | +947XXXXXXXX | 00947XXXXXXXX | 947XXXXXXXX
//   Landline : 0XXXXXXXXX (011, 021, 031, 041, 051, 055, 081, 091 ...)
const SL_PHONE = /^(?:\+94|0094|94|0)?(?:7[01245678]\d{7}|(?:1[1-9]|2[1-9]|3[1-9]|4[1-7]|5[1-8]|6[1-3]|8[1-8]|9[1-2])\d{7})$/

export function normalizePhone(value) {
  const digits = String(value || '').replace(/[\s\-()]/g, '')
  if (digits.startsWith('+94')) return '0' + digits.slice(3)
  if (digits.startsWith('0094')) return '0' + digits.slice(4)
  if (digits.startsWith('94') && digits.length === 11) return '0' + digits.slice(2)
  return digits
}

export function validateName(value) {
  const name = String(value || '').trim()
  if (!name) return 'Name is required'
  if (name.length < 2) return 'Name must be at least 2 characters'
  if (name.length > 60) return 'Name must be under 60 characters'
  if (!/^[a-zA-Z඀-෿஀-௿.'\- ]+$/.test(name)) {
    return 'Name can only contain letters, spaces, hyphens and apostrophes'
  }
  return ''
}

export function validateStudentId(value) {
  const id = String(value || '').trim()
  if (!id) return 'Student ID is required'
  if (id.length < 3) return 'Student ID must be at least 3 characters'
  if (id.length > 20) return 'Student ID must be under 20 characters'
  if (!/^[A-Za-z0-9/\-_]+$/.test(id)) {
    return 'Student ID can only contain letters, numbers, / - and _'
  }
  return ''
}

export function validatePhone(value) {
  const raw = String(value || '').trim()
  if (!raw) return 'Phone number is required'
  const phone = normalizePhone(raw)
  if (!/^[0-9+]+$/.test(phone)) return 'Phone number can only contain digits'
  if (!SL_PHONE.test(phone)) {
    return 'Enter a valid Sri Lankan number (e.g. 0771234567)'
  }
  return ''
}

/** Validate the whole registration form at once. */
export function validateForm({ name, studentId, phone }) {
  const errors = {
    name: validateName(name),
    studentId: validateStudentId(studentId),
    phone: validatePhone(phone),
  }
  const isValid = Object.values(errors).every((message) => !message)
  return { errors, isValid }
}
