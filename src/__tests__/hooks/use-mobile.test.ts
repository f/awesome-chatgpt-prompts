import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "@/hooks/use-mobile";

describe("useIsMobile", () => {
  const originalInnerWidth = window.innerWidth;
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, "addEventListener");
    removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    // Restore original window width
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    vi.restoreAllMocks();
  });

  function setWindowWidth(width: number) {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: width,
    });
  }

  it("should return false for desktop width (>= 768)", () => {
    setWindowWidth(1024);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("should return true for mobile width (< 768)", () => {
    setWindowWidth(375);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("should return false at exactly 768px (default breakpoint)", () => {
    setWindowWidth(768);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("should return true at 767px (just below default breakpoint)", () => {
    setWindowWidth(767);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("should use custom breakpoint", () => {
    setWindowWidth(500);
    const { result } = renderHook(() => useIsMobile(400));
    expect(result.current).toBe(false); // 500 >= 400
  });

  it("should return true below custom breakpoint", () => {
    setWindowWidth(300);
    const { result } = renderHook(() => useIsMobile(400));
    expect(result.current).toBe(true); // 300 < 400
  });

  it("should add resize event listener on mount", () => {
    setWindowWidth(1024);
    renderHook(() => useIsMobile());

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );
  });

  it("should remove resize event listener on unmount", () => {
    setWindowWidth(1024);
    const { unmount } = renderHook(() => useIsMobile());

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );
  });

  it("should update when window is resized", () => {
    setWindowWidth(1024);
    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    // Simulate resize to mobile width
    act(() => {
      setWindowWidth(375);
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current).toBe(true);
  });

  it("should update when resized from mobile to desktop", () => {
    setWindowWidth(375);
    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);

    // Simulate resize to desktop width
    act(() => {
      setWindowWidth(1024);
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current).toBe(false);
  });

  it("should re-register event listener when breakpoint changes", () => {
    setWindowWidth(500);
    const { rerender } = renderHook(
      ({ breakpoint }) => useIsMobile(breakpoint),
      { initialProps: { breakpoint: 768 } }
    );

    // Initial registration
    expect(addEventListenerSpy).toHaveBeenCalledTimes(1);

    // Change breakpoint
    rerender({ breakpoint: 400 });

    // Should have removed old listener and added new one
    expect(removeEventListenerSpy).toHaveBeenCalled();
    expect(addEventListenerSpy).toHaveBeenCalledTimes(2);
  });

  it("should handle multiple resize events", () => {
    setWindowWidth(1024);
    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    // Multiple resizes
    act(() => {
      setWindowWidth(375);
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current).toBe(true);

    act(() => {
      setWindowWidth(1200);
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current).toBe(false);

    act(() => {
      setWindowWidth(320);
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current).toBe(true);
  });

  it("should handle edge case of 0 width", () => {
    setWindowWidth(0);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("should handle very large width", () => {
    setWindowWidth(10000);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });
});
