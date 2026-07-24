const ADMIN_COOKIE_NAME = "admin_access"
const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24

function getAdminSecret() {
  return process.env.NEXT_PUBLIC_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "change-me-in-production"
}

function simpleHash(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }
  return (hash >>> 0).toString(16).padStart(8, "0")
}

async function createSha256Hex(input: string) {
  const bytes = new TextEncoder().encode(input)
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

export function getAdminCookieName() {
  return ADMIN_COOKIE_NAME
}

export function createAdminCookieValueSync() {
  const secret = getAdminSecret()
  if (!secret) return ""

  return simpleHash(secret)
}

export async function createAdminCookieValue() {
  const secret = getAdminSecret()
  if (!secret) return ""

  if (typeof globalThis.crypto?.subtle?.digest === "function") {
    return createSha256Hex(secret)
  }

  return createAdminCookieValueSync()
}

export function getAdminCookieHeader(value?: string) {
  const cookieValue = value ?? createAdminCookieValueSync()
  return `${ADMIN_COOKIE_NAME}=${cookieValue}; Path=/; Max-Age=${ADMIN_COOKIE_MAX_AGE}; SameSite=Lax`
}

export function parseAdminCookie(request: Request) {
  const cookieHeader = request.headers.get("cookie") || ""
  const cookies = cookieHeader.split(";").map((item) => item.trim()).filter(Boolean)
  const adminCookie = cookies.find((item) => item.startsWith(`${ADMIN_COOKIE_NAME}=`))
  return adminCookie?.split("=")[1] || null
}

export function hasValidAdminAccess(request: Request) {
  const cookieValue = parseAdminCookie(request)
  if (!cookieValue) return false

  const expectedValue = createAdminCookieValueSync()
  return Boolean(expectedValue) && cookieValue === expectedValue
}
