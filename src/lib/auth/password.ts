const SALT_LENGTH = 16
const ITERATIONS = 100000
const KEY_LENGTH = 64
const HASH_ALG = 'SHA-256'

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes.buffer
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const saltHex = bufferToHex(salt.buffer)

  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )

  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: ITERATIONS,
      hash: HASH_ALG,
    },
    keyMaterial,
    KEY_LENGTH * 8
  )

  const hashHex = bufferToHex(hashBuffer)
  return `${saltHex}:${hashHex}`
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const [saltHex, expectedHash] = storedHash.split(':')
    if (!saltHex || !expectedHash) return false

    const salt = new Uint8Array(hexToBuffer(saltHex))

    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    )

    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: ITERATIONS,
        hash: HASH_ALG,
      },
      keyMaterial,
      KEY_LENGTH * 8
    )

    const hashHex = bufferToHex(hashBuffer)
    return hashHex === expectedHash
  } catch {
    return false
  }
}
