import { formatCityName } from "../src/client/js/app";

describe("Testing formatCityName function", () => {
  it("should replace spaces with %20", () => {
    const city1 = "New York";
    const city2 = "Saudi Arabia";

    expect(formatCityName(city1)).toEqual("New%20York");
    expect(formatCityName(city2)).toEqual("Saudi%20Arabia");
  });

  it("should correctly encode special characters", () => {
    const city1 = "Château";
    const city2 = "São Paulo";
    const city3 = "München";

    expect(formatCityName(city1)).toEqual("Ch%C3%A2teau");
    expect(formatCityName(city2)).toEqual("S%C3%A3o%20Paulo");
    expect(formatCityName(city3)).toEqual("M%C3%BCnchen");
  });

  it("should return the original string if no encoding is required", () => {
    const city1 = "Tokyo";
    const city2 = "Berlin";

    expect(formatCityName(city1)).toEqual("Tokyo");
    expect(formatCityName(city2)).toEqual("Berlin");
  });
});
