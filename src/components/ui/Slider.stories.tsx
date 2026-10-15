import type { Meta, StoryObj } from "@storybook/react";
import { Slider } from "./Slider";

const meta = {
  title: "UI/Slider",
  component: Slider,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 36,
    min: 12,
    max: 72,
    step: 1,
    label: "Font Size",
    valueDisplay: "36px (2.25rem)",
    onChange: () => {},
  },
};

export const Disabled: Story = {
  args: {
    value: 16,
    min: 10,
    max: 50,
    disabled: true,
    label: "Disabled Slider",
    valueDisplay: "16px",
    onChange: () => {},
  },
};
