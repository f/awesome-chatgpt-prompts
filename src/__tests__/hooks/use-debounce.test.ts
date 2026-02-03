import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "@/lib/hooks/use-debounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));
    expect(result.current).toBe("initial");
  });

  it("does not update value before delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 500 } }
    );

    rerender({ value: "updated", delay: 500 });

    // Advance time, but not past the delay
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("initial");
  });

  it("updates value after delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 500 } }
    );

    rerender({ value: "updated", delay: 500 });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe("updated");
  });

  it("resets timer on rapid value changes", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 500 } }
    );

    // First update
    rerender({ value: "update1", delay: 500 });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("initial");

    // Second update before delay completes
    rerender({ value: "update2", delay: 500 });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe("initial");

    // Complete delay for second update
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("update2");
  });

  it("works with different data types", () => {
    // Number
    const { result: numResult, rerender: numRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 100 } }
    );

    numRerender({ value: 42, delay: 100 });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(numResult.current).toBe(42);

    // Object
    const initialObj = { key: "value" };
    const updatedObj = { key: "updated" };

    const { result: objResult, rerender: objRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialObj, delay: 100 } }
    );

    objRerender({ value: updatedObj, delay: 100 });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(objResult.current).toEqual(updatedObj);

    // Array
    const { result: arrResult, rerender: arrRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: [1, 2, 3], delay: 100 } }
    );

    arrRerender({ value: [4, 5, 6], delay: 100 });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(arrResult.current).toEqual([4, 5, 6]);
  });

  it("works with boolean values", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: false, delay: 100 } }
    );

    expect(result.current).toBe(false);

    rerender({ value: true, delay: 100 });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe(true);
  });

  it("works with null and undefined", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: null as string | null, delay: 100 } }
    );

    expect(result.current).toBeNull();

    rerender({ value: "defined", delay: 100 });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe("defined");

    rerender({ value: null, delay: 100 });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBeNull();
  });

  it("handles delay changes", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 500 } }
    );

    // Change value and delay simultaneously
    rerender({ value: "updated", delay: 200 });

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe("updated");
  });

  it("handles zero delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 0 } }
    );

    rerender({ value: "updated", delay: 0 });

    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(result.current).toBe("updated");
  });

  it("cleans up timeout on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

    const { unmount, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 500 } }
    );

    rerender({ value: "updated", delay: 500 });
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  describe("real-world search scenarios", () => {
    it("debounces search input effectively", () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: "", delay: 300 } }
      );

      // Simulate typing "hello"
      rerender({ value: "h", delay: 300 });
      act(() => vi.advanceTimersByTime(50));

      rerender({ value: "he", delay: 300 });
      act(() => vi.advanceTimersByTime(50));

      rerender({ value: "hel", delay: 300 });
      act(() => vi.advanceTimersByTime(50));

      rerender({ value: "hell", delay: 300 });
      act(() => vi.advanceTimersByTime(50));

      rerender({ value: "hello", delay: 300 });

      // Still initial value (user typing fast)
      expect(result.current).toBe("");

      // Wait for debounce
      act(() => vi.advanceTimersByTime(300));
      expect(result.current).toBe("hello");
    });
  });
});
