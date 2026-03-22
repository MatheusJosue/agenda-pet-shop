import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/lib/hooks/use-debounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 300))
    expect(result.current).toBe('test')
  })

  it('should update value after delay', () => {
    const { result, rerender } = renderHook(
      (value: string) => useDebounce(value, 300),
      { initialProps: 'initial' }
    )

    rerender('updated')

    // Should still be initial before delay
    expect(result.current).toBe('initial')

    // Fast-forward past delay within act
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Should update after delay
    expect(result.current).toBe('updated')
  })

  it('should reset timer on value change', () => {
    const { result, rerender } = renderHook(
      (value: string) => useDebounce(value, 300),
      { initialProps: 'initial' }
    )

    rerender('first')
    act(() => {
      vi.advanceTimersByTime(200)
    })
    rerender('second')
    act(() => {
      vi.advanceTimersByTime(200)
    })

    // Should not have updated (only 200ms since last change)
    expect(result.current).toBe('initial')

    // Fast-forward the remaining time
    act(() => {
      vi.advanceTimersByTime(100)
    })

    // Now it should update
    expect(result.current).toBe('second')
  })

  it('should use default delay of 300ms', () => {
    const { result, rerender } = renderHook(
      (value: string) => useDebounce(value),
      { initialProps: 'initial' }
    )

    rerender('updated')
    act(() => {
      vi.advanceTimersByTime(299)
    })
    expect(result.current).toBe('initial')
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('updated')
  })

  it('should cleanup timer on unmount', () => {
    const { rerender, unmount } = renderHook(
      (value: string) => useDebounce(value, 300),
      { initialProps: 'initial' }
    )

    rerender('updated')
    unmount()
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // No error should be thrown
  })
})
