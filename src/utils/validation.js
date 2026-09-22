/**
 * Form validation helpers.
 *
 * Validators return a translation KEY (e.g. 'errors.nicInvalid') or an empty
 * string when the value is valid. Returning keys rather than sentences means an
 * error raised in English still renders correctly once the user switches the UI
 * to Sinhala.
 */

// Sri Lankan numbers, accepted shapes:
//   Mobile   : 07XXXXXXXX | +947XXXXXXXX | 00947XXXXXXXX | 947XXXXXXXX
//   Landline : 0XXXXXXXXX (011, 021, 031, 041, 051, 055, 081, 091 ...)
const SL_PHONE =
  /^(?:\+94|0094|94|0)?(?:7[01245678]\d{7}|(?:1[1-9]|2[1-9]|3[1-9]|4[1-7]|5[1-8]|6[1-3]|8[1-8]|9[1-2])\d{7})$/

// Old NIC: 9 digits + V or X. New NIC: 12 digits.
const NIC_OLD = /^\d{9}[VXvx]$/
const NIC_NEW = /^\d{12}$/

// Deliberately permissive - the definitive check is whether mail arrives.
const EMAIL = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/

// Latin, Sinhala and Tamil letters, plus the punctuation real names contain.
const NAME_CHARS = /^[a-zA-Z඀-෿஀-௿.'\- ]+$/

export function normalizePhone(value) {
  const digits = String(value || '').replace(/[\s\-()]/g, '')
  if (digits.startsWith('+94')) return '0' + digits.slice(3)
  if (digits.startsWith('0094')) return '0' + digits.slice(4)
  if (digits.startsWith('94') && digits.length === 11) return '0' + digits.slice(2)
  return digits
}

export function normalizeNic(value) {
  return String(value || '').replace(/\s/g, '').toUpperCase()
}

function validateNamePart(value, requiredKey) {
  const name = String(value || '').trim()
  if (!name) return requiredKey
  if (name.length < 2) return 'errors.nameTooShort'
  if (name.length > 40) return 'errors.nameTooLong'
  if (!NAME_CHARS.test(name)) return 'errors.nameInvalid'
  return ''
}

export function validateFirstName(value) {
  return validateNamePart(value, 'errors.firstNameRequired')
}

export function validateLastName(value) {
  return validateNamePart(value, 'errors.lastNameRequired')
}

export function validateNic(value) {
  const nic = normalizeNic(value)
  if (!nic) return 'errors.nicRequired'
  if (!NIC_OLD.test(nic) && !NIC_NEW.test(nic)) return 'errors.nicInvalid'
  return ''
}

/** Optional field - only validated when something was typed. */
export function validateEmail(value) {
  const email = String(value || '').trim()
  if (!email) return ''
  if (!EMAIL.test(email)) return 'errors.emailInvalid'
  return ''
}

export function validatePhone(value) {
  const raw = String(value || '').trim()
  if (!raw) return 'errors.phoneRequired'
  const phone = normalizePhone(raw)
  if (!SL_PHONE.test(phone)) return 'errors.phoneInvalid'
  return ''
}

/** Optional. */
export function validateOrganization(value) {
  const organization = String(value || '').trim()
  if (organization.length > 80) return 'errors.organizationTooLong'
  return ''
}

export function validateCategory(value) {
  if (!String(value || '').trim()) return 'errors.categoryRequired'
  return ''
}

export function validateInterests(values) {
  if (!Array.isArray(values) || values.length === 0) return 'errors.interestRequired'
  return ''
}

/** Optional. */
export function validateHeardFrom(value) {
  const heardFrom = String(value || '').trim()
  if (heardFrom.length > 120) return 'errors.heardFromTooLong'
  return ''
}

export const FIELD_VALIDATORS = {
  firstName: validateFirstName,
  lastName: validateLastName,
  nic: validateNic,
  email: validateEmail,
  phone: validatePhone,
  organization: validateOrganization,
  visitorCategory: validateCategory,
  interestAreas: validateInterests,
  heardFrom: validateHeardFrom,
}

/** Validate the whole registration form at once. */
export function validateForm(form) {
  const errors = {}
  for (const [field, validate] of Object.entries(FIELD_VALIDATORS)) {
    errors[field] = validate(form[field])
  }
  const isValid = Object.values(errors).every((message) => !message)
  return { errors, isValid }
}

/** Trim, normalise and shape a form into the payload the API expects. */
export function toPayload(form) {
  return {
    firstName: String(form.firstName || '').trim(),
    lastName: String(form.lastName || '').trim(),
    nic: normalizeNic(form.nic),
    email: String(form.email || '').trim(),
    phone: normalizePhone(form.phone),
    organization: String(form.organization || '').trim(),
    visitorCategory: form.visitorCategory || '',
    interestAreas: Array.isArray(form.interestAreas) ? form.interestAreas : [],
    heardFrom: String(form.heardFrom || '').trim(),
    consent: Boolean(form.consent),
  }
}
