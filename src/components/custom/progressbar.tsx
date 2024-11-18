"use client";

import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function ProgressBar(
  props: React.ComponentProps<typeof CircularProgressbar>,
) {
  return <CircularProgressbar {...props} />;
}
