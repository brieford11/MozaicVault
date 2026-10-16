import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { StarRating } from "@/components/StarRating";

describe("Ten-star ratings", () => {
  it("supports every half-star value up to ten", () => {
    const change = vi.fn();
    render(<StarRating value={0} onChange={change} />);
    for (let value = 0.5; value <= 10; value += 0.5) {
      fireEvent.click(screen.getByRole("radio", { name: `${value} stars` }));
      expect(change).toHaveBeenLastCalledWith(value);
    }
    cleanup();
  });
  it("allows clearing the selected half-star rating", () => {
    const change = vi.fn();
    render(<StarRating value={7.5} onChange={change} />);
    fireEvent.click(screen.getByRole("radio", { name: "7.5 stars" }));
    expect(change).toHaveBeenCalledWith(0);
    cleanup();
  });
});