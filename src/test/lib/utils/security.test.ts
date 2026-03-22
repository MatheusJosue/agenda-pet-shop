import { describe, it, expect } from 'vitest'
import { escapeHtml } from '@/lib/utils/security'

describe('escapeHtml', () => {
  it('should escape ampersands', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry')
  })

  it('should escape less than', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;')
  })

  it('should escape greater than', () => {
    expect(escapeHtml('a > b')).toBe('a &gt; b')
  })

  it('should escape double quotes', () => {
    expect(escapeHtml('Say "hello"')).toBe('Say &quot;hello&quot;')
  })

  it('should escape single quotes', () => {
    expect(escapeHtml("It's")).toBe('It&#x27;s')
  })

  it('should escape multiple special characters', () => {
    expect(escapeHtml('<div class="test">&nbsp;</div>'))
      .toBe('&lt;div class=&quot;test&quot;&gt;&amp;nbsp;&lt;/div&gt;')
  })

  it('should handle empty string', () => {
    expect(escapeHtml('')).toBe('')
  })

  it('should handle string without special characters', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World')
  })
})
