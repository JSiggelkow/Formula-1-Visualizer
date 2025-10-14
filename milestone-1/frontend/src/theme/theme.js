import { createTheme } from "@mantine/core";

export const theme = createTheme({
  colors: {
    // F1 rosso corsa red palette
    red: [
      "#ffebeb", // lightest
      "#ffc9c9",
      "#ffa8a8",
      "#ff8787",
      "#ff6b6b",
      "#D40000", // main F1 rosso corsa (red.5)
      "#c92a2a",
      "#a61e1e",
      "#862e2e",
      "#5c2e2e", // darkest
    ],
    gray: [
      "#f8f9fa", // lightest
      "#f1f3f4",
      "#e9ecef",
      "#dee2e6",
      "#ced4da",
      "#adb5bd",
      "#6c757d",
      "#495057",
      "#343a40",
      "#212529", // darkest
    ],
  },
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
  components: {
    Card: {
      defaultProps: {
        shadow: "sm",
        radius: "md",
      },
    },
    Button: {
      defaultProps: {
        radius: "md",
      },
    },
    TextInput: {
      defaultProps: {
        radius: "md",
      },
    },
    Select: {
      defaultProps: {
        radius: "md",
      },
    },
    NumberInput: {
      defaultProps: {
        radius: "md",
      },
    },
    Autocomplete: {
      defaultProps: {
        radius: "md",
      },
    },
  },
});
