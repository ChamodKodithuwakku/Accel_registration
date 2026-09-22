/**
 * API layer: React  <-->  Google Apps Script Web App  <-->  Google Sheet
 *
 * Apps Script only exposes doGet() and doPost(), and it cannot answer a CORS
 * preflight (OPTIONS) request. So:
 *   - reads  -> GET  with query parameters
 *   - writes -> POST with a "simple request" body (Content-Type: text/plain),
 *               which the browser sends without a preflight. The intended REST
 *               verb travels inside the JSON body as `action`.
 */

const BASE_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL
const REQUEST_TIMEOUT = 20000

function assertConfigured() {
  if (!BASE_URL || BASE_URL.includes('XXXX')) {
    throw new Error(
      'Missing API URL. Set VITE_GOOGLE_SCRIPT_URL in your .env file (and in Vercel project settings), then restart the dev server.'
    )
  }
}

async function request(url, options = {}) {
  assertConfigured()

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  let response
  try {
    response = await fetch(url, { ...options, signal: controller.signal, redirect: 'follow' })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('The request timed out. Please check your connection and try again.')
    }
    throw new Error('Could not reach the server. Check the Apps Script URL and its access settings.')
  } finally {
    clearTimeout(timer)
  }

  const text = await response.text()

  let payload
  try {
    payload = JSON.parse(text)
  } catch {
    // Apps Script returns an HTML error page when the deployment is not public.
    throw new Error(
      'Unexpected response from the API. Re-deploy the Apps Script web app with access set to "Anyone".'
    )
  }

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || `Request failed (${response.status})`)
  }

  return payload
}

function post(body) {
  return request(BASE_URL, {
    method: 'POST',
    // text/plain keeps this a "simple request" -> no CORS preflight
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
  })
}

/** GET - fetch every record, newest first. */
export async function getRecords() {
  const url = `${BASE_URL}?action=list&t=${Date.now()}`
  const payload = await request(url, { method: 'GET' })
  const records = Array.isArray(payload) ? payload : payload.data || []
  return records
}

/** POST - create a new record. */
export function addRecord({ name, studentId, phone }) {
  return post({ action: 'create', name, studentId, phone })
}

/** PUT (tunnelled over POST) - update an existing record by id. */
export function updateRecord({ id, name, studentId, phone }) {
  return post({ action: 'update', id, name, studentId, phone })
}

/** DELETE (tunnelled over POST) - remove a record by id. */
export function deleteRecord(id) {
  return post({ action: 'delete', id })
}

export default { getRecords, addRecord, updateRecord, deleteRecord }
