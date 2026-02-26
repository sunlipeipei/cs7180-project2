import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CircularTimer from "@/components/CircularTimer";

describe("CircularTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders with default focus duration (25:00)", () => {
    render(<CircularTimer />);
    expect(screen.getByText("25:00")).toBeInTheDocument();
    expect(screen.getByText("Focus")).toBeInTheDocument(); // Mode indicator
  });

  it("can start, pause, and resume the timer", () => {
    render(<CircularTimer />);

    // Start the timer
    const startButton = screen.getByRole("button", { name: /start/i });
    fireEvent.click(startButton);

    // Advance time by 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText("24:58")).toBeInTheDocument();

    // Pause the timer
    const pauseButton = screen.getByRole("button", { name: /pause/i });
    fireEvent.click(pauseButton);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Should still be exactly 24:58
    expect(screen.getByText("24:58")).toBeInTheDocument();
  });

  it("allows user to customize work and break durations before starting via inputs", () => {
    render(<CircularTimer />);

    // Assert there are settings/inputs to customize the durations
    const focusInput = screen.getByLabelText(/focus duration/i);
    const breakInput = screen.getByLabelText(/break duration/i);

    // Change focus duration to 50
    fireEvent.change(focusInput, { target: { value: "50" } });
    expect(screen.getByText("50:00")).toBeInTheDocument();

    // Change break duration to 15
    fireEvent.change(breakInput, { target: { value: "15" } });

    // Switch to break mode to see the updated break time
    const breakModeBtn = screen.getByRole("button", { name: /break/i });
    fireEvent.click(breakModeBtn);

    expect(screen.getByText("15:00")).toBeInTheDocument();
  });

  it("allows manual switching between focus and break modes", () => {
    render(<CircularTimer defaultFocusMinutes={25} defaultBreakMinutes={5} />);

    expect(screen.getByText("25:00")).toBeInTheDocument();

    const breakButton = screen.getByRole("button", { name: /break mode/i });
    fireEvent.click(breakButton);

    expect(screen.getByText("05:00")).toBeInTheDocument();
    expect(screen.getByText("Break")).toBeInTheDocument();
  });

  it("triggers a gentle notification (onComplete callback) without forcing transition", () => {
    const onCompleteMock = vi.fn();
    render(
      <CircularTimer defaultFocusMinutes={1} onComplete={onCompleteMock} />,
    );

    const startButton = screen.getByRole("button", { name: /start/i });
    fireEvent.click(startButton);

    // Advance time by 60 seconds (1 minute)
    act(() => {
      vi.advanceTimersByTime(60000);
    });

    // Should display 00:00
    expect(screen.getByText("00:00")).toBeInTheDocument();

    // Notification callback should be called
    expect(onCompleteMock).toHaveBeenCalledTimes(1);

    // It should stay in Focus mode, not auto-transition to Break mode
    expect(screen.getByText("Focus")).toBeInTheDocument();
  });
});
