import {
  sanitizeHtml,
  sanitizeHtmlStrict,
  sanitizeInput,
  sanitizeEmail,
  sanitizeUrl,
  sanitizePhoneNumber,
  sanitizeMongoQuery,
  sanitizeFileName,
  sanitizeRateLimitKey,
  generateCSPNonce,
  sanitizeUserAgent,
  validateAndSanitize,
  ValidationSchemas,
  type ValidationRule
} from '../sanitize'

describe('Sanitize Utilities', () => {
  describe('sanitizeHtml', () => {
    it('removes script tags', () => {
      const malicious = '<script>alert("xss")</script><p>Hello World</p>'
      const result = sanitizeHtml(malicious)
      
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('alert')
      expect(result).toContain('<p>Hello World</p>')
    })

    it('removes event handlers', () => {
      const malicious = '<div onclick="alert(\'xss\')">Click me</div>'
      const result = sanitizeHtml(malicious)
      
      expect(result).not.toContain('onclick')
      expect(result).not.toContain('alert')
      expect(result).toContain('<div>Click me</div>')
    })

    it('removes javascript: links', () => {
      const malicious = '<a href="javascript:alert(\'xss\')">Link</a>'
      const result = sanitizeHtml(malicious)
      
      expect(result).not.toContain('javascript:')
      expect(result).not.toContain('alert')
    })

    it('preserves safe HTML tags', () => {
      const safe = '<p>Hello <strong>World</strong>!</p><ul><li>Item 1</li></ul>'
      const result = sanitizeHtml(safe)
      
      expect(result).toBe(safe)
    })

    it('handles empty string', () => {
      expect(sanitizeHtml('')).toBe('')
    })

    it('handles null and undefined', () => {
      expect(sanitizeHtml(null as any)).toBe('')
      expect(sanitizeHtml(undefined as any)).toBe('')
    })

    it('removes forbidden attributes', () => {
      const malicious = '<div onload="alert(1)" onerror="alert(2)">Content</div>'
      const result = sanitizeHtml(malicious)
      
      expect(result).not.toContain('onload')
      expect(result).not.toContain('onerror')
      expect(result).toContain('Content')
    })

    it('preserves allowed attributes', () => {
      const safe = '<a href="https://example.com" target="_blank">Link</a>'
      const result = sanitizeHtml(safe)
      
      expect(result).toContain('href="https://example.com"')
      expect(result).toContain('target="_blank"')
    })
  })

  describe('sanitizeHtmlStrict', () => {
    it('removes all HTML tags', () => {
      const html = '<p>Hello <strong>World</strong>!</p><script>alert("xss")</script>'
      const result = sanitizeHtmlStrict(html)
      
      expect(result).not.toContain('<p>')
      expect(result).not.toContain('<strong>')
      expect(result).not.toContain('<script>')
      expect(result).toContain('Hello World!')
    })

    it('handles mixed content', () => {
      const mixed = 'Text before <div>HTML content</div> text after'
      const result = sanitizeHtmlStrict(mixed)
      
      expect(result).toBe('Text before HTML content text after')
    })
  })

  describe('sanitizeInput', () => {
    it('sanitizes string values', () => {
      const input = '  Hello World  \x00\x01'
      const result = sanitizeInput(input)
      
      expect(result).toBe('Hello World')
    })

    it('sanitizes object properties', () => {
      const input = {
        name: '  John Doe  ',
        bio: 'Hello\x00World\x01',
        age: 30
      }

      const result = sanitizeInput(input)

      expect(result.name).toBe('John Doe')
      expect(result.bio).toBe('HelloWorld')
      expect(result.age).toBe(30)
    })

    it('sanitizes nested objects', () => {
      const input = {
        user: {
          name: '  Jane  ',
          profile: {
            bio: 'Bio\x00content'
          }
        }
      }

      const result = sanitizeInput(input)

      expect(result.user.name).toBe('Jane')
      expect(result.user.profile.bio).toBe('Biocontent')
    })

    it('sanitizes arrays', () => {
      const input = ['  item1  ', 'item2\x00', 123]
      const result = sanitizeInput(input)
      
      expect(result[0]).toBe('item1')
      expect(result[1]).toBe('item2')
      expect(result[2]).toBe(123)
    })

    it('handles null and undefined', () => {
      expect(sanitizeInput(null)).toBeNull()
      expect(sanitizeInput(undefined)).toBeUndefined()
    })

    it('sanitizes object keys', () => {
      const input = {
        '  key1  ': 'value1',
        'key2\x00': 'value2'
      }
      
      const result = sanitizeInput(input)
      
      expect(result).toHaveProperty('key1')
      expect(result).toHaveProperty('key2')
      expect(result.key1).toBe('value1')
      expect(result.key2).toBe('value2')
    })
  })

  describe('sanitizeEmail', () => {
    it('validates and sanitizes correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'USER@DOMAIN.COM',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ]

      validEmails.forEach(email => {
        const result = sanitizeEmail(email)
        expect(result).toBeTruthy()
        expect(result).toBe(email.toLowerCase().trim())
      })
    })

    it('rejects invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        'user@',
        '@domain.com',
        'user..name@domain.com',
        'user@domain',
        'user space@domain.com',
        ''
      ]

      invalidEmails.forEach(email => {
        expect(sanitizeEmail(email)).toBeNull()
      })
    })

    it('handles non-string inputs', () => {
      expect(sanitizeEmail(null as any)).toBeNull()
      expect(sanitizeEmail(undefined as any)).toBeNull()
      expect(sanitizeEmail(123 as any)).toBeNull()
    })

    it('trims and lowercases valid emails', () => {
      const result = sanitizeEmail('  TEST@EXAMPLE.COM  ')
      expect(result).toBe('test@example.com')
    })
  })

  describe('sanitizeUrl', () => {
    it('validates and sanitizes HTTP URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://test.org/path',
        'https://sub.domain.com:8080/path?query=1'
      ]

      validUrls.forEach(url => {
        const result = sanitizeUrl(url)
        expect(result).toBeTruthy()
        expect(result).toContain('://')
      })
    })

    it('rejects non-HTTP protocols', () => {
      const invalidUrls = [
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'file:///etc/passwd',
        'ftp://example.com'
      ]

      invalidUrls.forEach(url => {
        expect(sanitizeUrl(url)).toBeNull()
      })
    })

    it('blocks private IP addresses', () => {
      const privateUrls = [
        'http://127.0.0.1',
        'https://192.168.1.1',
        'http://10.0.0.1',
        'https://172.16.0.1'
      ]

      privateUrls.forEach(url => {
        expect(sanitizeUrl(url)).toBeNull()
      })
    })

    it('allows public IP addresses and domains', () => {
      const publicUrls = [
        'https://8.8.8.8',
        'https://google.com',
        'http://example.org'
      ]

      publicUrls.forEach(url => {
        const result = sanitizeUrl(url)
        expect(result).toBeTruthy()
      })
    })

    it('handles invalid URLs gracefully', () => {
      const invalidUrls = [
        'not-a-url',
        'http://',
        'https://.',
        ''
      ]

      invalidUrls.forEach(url => {
        expect(sanitizeUrl(url)).toBeNull()
      })
    })
  })

  describe('sanitizePhoneNumber', () => {
    it('validates and sanitizes phone numbers', () => {
      const validPhones = [
        '+1234567890',
        '1234567890',
        '+44 (123) 456-7890',
        '91-9876543210'
      ]

      validPhones.forEach(phone => {
        const result = sanitizePhoneNumber(phone)
        expect(result).toBeTruthy()
        expect(result).toMatch(/^\+?[1-9]\d{9,14}$/)
      })
    })

    it('rejects invalid phone numbers', () => {
      const invalidPhones = [
        '123',
        '0123456789',
        'abc-def-ghij',
        '+123456789012345678', // too long
        ''
      ]

      invalidPhones.forEach(phone => {
        expect(sanitizePhoneNumber(phone)).toBeNull()
      })
    })

    it('removes formatting characters', () => {
      const result = sanitizePhoneNumber('+1 (234) 567-8900 ext 123')
      expect(result).toBe('+12345678900123')
    })

    it('handles non-string inputs', () => {
      expect(sanitizePhoneNumber(null as any)).toBeNull()
      expect(sanitizePhoneNumber(undefined as any)).toBeNull()
    })
  })

  describe('sanitizeMongoQuery', () => {
    it('allows safe queries', () => {
      const safeQuery = {
        username: 'john',
        age: 25,
        active: true
      }

      const result = sanitizeMongoQuery(safeQuery)
      expect(result).toEqual(safeQuery)
    })

    it('removes dangerous MongoDB operators', () => {
      const maliciousQuery = {
        username: 'admin',
        password: { $ne: null },
        $where: 'this.password == this.username'
      }

      const result = sanitizeMongoQuery(maliciousQuery)

      expect(result.username).toBe('admin')
      expect(result.password).toBeDefined()
      expect(result).not.toHaveProperty('$where')
    })

    it('preserves allowed MongoDB operators', () => {
      const queryWithAllowedOps = {
        age: { $gte: 18, $lt: 65 },
        status: { $in: ['active', 'pending'] }
      }

      const result = sanitizeMongoQuery(queryWithAllowedOps)
      expect(result.age).toHaveProperty('$gte')
      expect(result.age).toHaveProperty('$lt')
      expect(result.status).toHaveProperty('$in')
    })

    it('sanitizes nested objects', () => {
      const nestedQuery = {
        user: {
          credentials: { $where: 'malicious code' },
          profile: { name: 'John' }
        }
      }

      const result = sanitizeMongoQuery(nestedQuery)
      expect(result.user.profile.name).toBe('John')
      expect(result.user.credentials).not.toHaveProperty('$where')
    })

    it('sanitizes arrays', () => {
      const queryWithArrays = {
        tags: ['web', { $ne: 'blocked' }],
        scores: [1, 2, 3]
      }

      const result = sanitizeMongoQuery(queryWithArrays)
      expect(result.tags[0]).toBe('web')
      expect(result.scores).toEqual([1, 2, 3])
    })
  })

  describe('sanitizeFileName', () => {
    it('validates safe file names', () => {
      const safeFiles = [
        'document.pdf',
        'image.jpg',
        'data.csv',
        'readme.txt'
      ]

      safeFiles.forEach(fileName => {
        const result = sanitizeFileName(fileName)
        expect(result).toBe(fileName)
      })
    })

    it('removes dangerous characters', () => {
      const dangerousName = '../../../etc/passwd.txt'
      const result = sanitizeFileName(dangerousName)
      
      expect(result).not.toContain('../')
      expect(result).not.toContain('/')
    })

    it('rejects files with invalid extensions', () => {
      const invalidFiles = [
        'script.exe',
        'malware.bat',
        'virus.scr',
        'file.unknown'
      ]

      invalidFiles.forEach(fileName => {
        expect(sanitizeFileName(fileName)).toBeNull()
      })
    })

    it('removes leading dots and spaces', () => {
      const result = sanitizeFileName('...  file.pdf')
      expect(result).toBe('file.pdf')
    })

    it('limits file name length', () => {
      const longName = 'a'.repeat(300) + '.txt'
      const result = sanitizeFileName(longName)
      
      expect(result).toBeTruthy()
      expect(result!.length).toBeLessThanOrEqual(255)
      expect(result!.endsWith('.txt')).toBe(true)
    })
  })

  describe('sanitizeRateLimitKey', () => {
    it('sanitizes rate limit keys', () => {
      const key = 'user:123.456.789.0:api'
      const result = sanitizeRateLimitKey(key)
      
      expect(result).toBe('user:123.456.789.0:api')
    })

    it('replaces invalid characters', () => {
      const key = 'user@email.com/api#endpoint'
      const result = sanitizeRateLimitKey(key)
      
      expect(result).not.toContain('@')
      expect(result).not.toContain('/')
      expect(result).not.toContain('#')
      expect(result).toContain('_')
    })

    it('limits key length', () => {
      const longKey = 'a'.repeat(300)
      const result = sanitizeRateLimitKey(longKey)
      
      expect(result.length).toBeLessThanOrEqual(250)
    })
  })

  describe('generateCSPNonce', () => {
    it('generates a valid nonce', () => {
      const nonce = generateCSPNonce()
      
      expect(typeof nonce).toBe('string')
      expect(nonce.length).toBeGreaterThan(16)
      expect(nonce).toMatch(/^[a-f0-9]+$/) // hex string
    })

    it('generates unique nonces', () => {
      const nonce1 = generateCSPNonce()
      const nonce2 = generateCSPNonce()
      
      expect(nonce1).not.toBe(nonce2)
    })
  })

  describe('sanitizeUserAgent', () => {
    it('sanitizes user agent strings', () => {
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      const result = sanitizeUserAgent(userAgent)
      
      expect(result).toContain('Mozilla')
      expect(result).toContain('Windows')
      expect(typeof result).toBe('string')
    })

    it('removes special characters', () => {
      const maliciousUA = 'Mozilla<script>alert(1)</script>/5.0'
      const result = sanitizeUserAgent(maliciousUA)
      
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('alert')
    })

    it('limits length', () => {
      const longUA = 'Mozilla/' + 'a'.repeat(600)
      const result = sanitizeUserAgent(longUA)
      
      expect(result.length).toBeLessThanOrEqual(500)
    })

    it('handles invalid inputs', () => {
      expect(sanitizeUserAgent(null as any)).toBe('unknown')
      expect(sanitizeUserAgent(undefined as any)).toBe('unknown')
      expect(sanitizeUserAgent('')).toBe('unknown')
    })
  })

  describe('validateAndSanitize', () => {
    it('validates required fields', () => {
      const data = { name: 'John' }
      const rules = {
        name: { type: 'string' as const, required: true },
        email: { type: 'string' as const, required: true }
      }

      const result = validateAndSanitize(data, rules)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('email is required')
    })

    it('validates string fields', () => {
      const data = { name: 'John Doe' }
      const rules = {
        name: { type: 'string' as const, required: true, minLength: 5, maxLength: 20 }
      }

      const result = validateAndSanitize(data, rules)

      expect(result.isValid).toBe(true)
      expect(result.data.name).toBe('John Doe')
    })

    it('validates number fields', () => {
      const data = { age: '25' }
      const rules = {
        age: { type: 'number' as const, required: true, min: 18, max: 65 }
      }

      const result = validateAndSanitize(data, rules)

      expect(result.isValid).toBe(true)
      expect(result.data.age).toBe(25)
    })

    it('validates email fields', () => {
      const data = { email: 'test@example.com' }
      const rules = {
        email: { type: 'email' as const, required: true }
      }

      const result = validateAndSanitize(data, rules)

      expect(result.isValid).toBe(true)
      expect(result.data.email).toBe('test@example.com')
    })

    it('handles validation errors', () => {
      const data = { age: 'not-a-number' }
      const rules = {
        age: { type: 'number' as const, required: true }
      }

      const result = validateAndSanitize(data, rules)

      expect(result.isValid).toBe(false)
      expect(result.errors.some(err => err.includes('must be a number'))).toBe(true)
    })
  })

  describe('ValidationSchemas', () => {
    it('validates user registration data', () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePassword123!'
      }

      const result = validateAndSanitize(userData, ValidationSchemas.userRegistration)

      expect(result.isValid).toBe(true)
      expect(result.data.name).toBe('John Doe')
      expect(result.data.email).toBe('john@example.com')
    })

    it('validates body measurements', () => {
      const measurements = {
        age: 30,
        height: 175,
        weight: 75,
        neck: 38,
        waist: 82
      }

      const result = validateAndSanitize(measurements, ValidationSchemas.bodyMeasurements)

      expect(result.isValid).toBe(true)
      expect(result.data).toEqual(measurements)
    })

    it('validates feedback data', () => {
      const feedback = {
        type: 'suggestion',
        title: 'Great app!',
        message: 'I love using this application for tracking my fitness.',
        rating: 5
      }

      const result = validateAndSanitize(feedback, ValidationSchemas.feedback)

      expect(result.isValid).toBe(true)
      expect(result.data).toEqual(feedback)
    })

    it('rejects invalid feedback types', () => {
      const feedback = {
        type: 'invalid_type',
        title: 'Test',
        message: 'Test message'
      }

      const result = validateAndSanitize(feedback, ValidationSchemas.feedback)

      expect(result.isValid).toBe(false)
      expect(result.errors.some(err => err.includes('invalid value'))).toBe(true)
    })
  })

  describe('Integration Tests', () => {
    it('comprehensive input sanitization and validation', () => {
      const userInput = {
        name: '  <script>alert("xss")</script>John Doe  ',
        email: 'JOHN@EXAMPLE.COM',
        feedback: 'Great app! <p>Works perfectly</p>',
        phone: '+1 (234) 567-8900',
        website: 'https://johndoe.com'
      }

      // First sanitize
      const sanitized = sanitizeInput(userInput)

      // Then validate with custom rules
      const rules = {
        name: { type: 'string' as const, required: true, minLength: 2, maxLength: 50 },
        email: { type: 'email' as const, required: true },
        feedback: { type: 'string' as const, required: false, maxLength: 1000 },
        phone: { type: 'phone' as const, required: false },
        website: { type: 'url' as const, required: false }
      }

      const validated = validateAndSanitize(sanitized, rules)

      expect(validated.isValid).toBe(true)
      expect(validated.data.name).not.toContain('<script>')
      expect(validated.data.email).toBe('john@example.com')
      expect(validated.data.phone).toMatch(/^\+?\d+$/)
    })
  })
})