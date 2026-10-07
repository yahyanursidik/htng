import {render, screen, fireEvent, waitFor} from "@testing-library/preact";
import {describe, it, expect, vi} from "vitest";
import ExplainingCalculator from "../../src/components/learning/ExplainingCalculator";
function fill(a: string, op: string, b: string) {
  fireEvent.input(screen.getByLabelText("Bilangan pertama"), {target: {value: a}});
  fireEvent.change(screen.getByLabelText("Operasi"), {target: {value: op}});
  fireEvent.input(screen.getByLabelText("Bilangan kedua"), {target: {value: b}});
  fireEvent.click(screen.getByRole("button", {name: "Hitung"}));
}
describe("explaining calculator", () => {
  it("shows worked result and inverse check, focuses it, and never writes learning evidence", async () => {
    const store = vi.spyOn(localStorage, "setItem");
    render(<ExplainingCalculator />); fill("28", "add", "17");
    expect(screen.getByTestId("calculator-result")).toHaveTextContent("28 + 17 = 45");
    expect(screen.getByText(/15 satuan = 1 puluhan dan 5 satuan/)).toBeVisible();
    expect(screen.getByText(/45 − 17 = 28/)).toBeVisible();
    expect(screen.getByRole("link", {name: "Latih konsep ini →"})).toHaveAttribute("href", "/belajar/menjumlah");
    await waitFor(() => expect(screen.getByRole("heading", {name: "Hasil dan cara menghitung"})).toHaveFocus());
    expect(store).not.toHaveBeenCalled(); store.mockRestore();
  });
  it("clears stale worked solutions when a number or operation changes", () => {
    render(<ExplainingCalculator />); fill("12", "multiply", "4");
    fireEvent.input(screen.getByLabelText("Bilangan kedua"), {target: {value: "5"}});
    expect(screen.queryByTestId("calculator-result")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name: "Hitung"})); expect(screen.getByTestId("calculator-result")).toHaveTextContent("60");
    fireEvent.change(screen.getByLabelText("Operasi"), {target: {value: "add"}});
    expect(screen.queryByTestId("calculator-result")).not.toBeInTheDocument();
  });
  it("explains division by zero, associates the error, focuses the field and recovers", () => {
    render(<ExplainingCalculator />); fill("17", "divide", "0");
    expect(screen.getByRole("alert")).toHaveTextContent("Tidak dapat membagi 17 dengan nol");
    expect(screen.getByLabelText("Bilangan kedua")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Bilangan kedua")).toHaveAttribute("aria-describedby", "calc-second-help");
    expect(screen.getByLabelText("Bilangan kedua")).toHaveFocus();
    expect(screen.queryByTestId("calculator-result")).not.toBeInTheDocument();
    fireEvent.input(screen.getByLabelText("Bilangan kedua"), {target: {value: "4"}});
    fireEvent.click(screen.getByRole("button", {name: "Hitung"}));
    expect(screen.getByTestId("calculator-result")).toHaveTextContent("4,25");
    expect(screen.getByRole("alert")).toBeEmptyDOMElement();
  });
  it("does not validate untouched typing but validates blur and invalid submission", () => {
    render(<ExplainingCalculator />);
    const first = screen.getByLabelText("Bilangan pertama");
    fireEvent.input(first, {target: {value: "2e3"}}); expect(first).toHaveAttribute("aria-invalid", "false");
    fireEvent.blur(first); expect(first).toHaveAttribute("aria-invalid", "true");
    fireEvent.input(first, {target: {value: "2"}}); expect(first).toHaveAttribute("aria-invalid", "false");
    fireEvent.click(screen.getByRole("button", {name: "Hitung"})); expect(screen.getByRole("alert")).toHaveTextContent("Isi bilangan");
  });
  it("examples only fill inputs; reset clears result and returns focus", () => {
    render(<ExplainingCalculator />); fireEvent.click(screen.getByRole("button", {name: "17 ÷ 4", exact: true}));
    expect(screen.getByLabelText("Bilangan pertama")).toHaveValue("17");
    expect(screen.queryByTestId("calculator-result")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", {name: "Hitung"}));
    fireEvent.click(screen.getByRole("button", {name: "Kosongkan"}));
    expect(screen.getByLabelText("Bilangan pertama")).toHaveValue("");
    expect(screen.getByLabelText("Bilangan pertama")).toHaveFocus();
    expect(screen.queryByTestId("calculator-result")).not.toBeInTheDocument();
  });
  it("distinguishes exact fractions from approximations", () => {
    render(<ExplainingCalculator />); fill("1", "divide", "3");
    expect(screen.getByTestId("calculator-result")).toHaveTextContent("1 ÷ 3 = 1/3");
    expect(screen.getByText(/≈ 0,333333. Pecahan di atas/)).toBeVisible();
    expect(screen.getByText(/\(1\/3\) × 3 = 1/)).toBeVisible();
  });
});
