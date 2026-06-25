import { Fragment } from "react";
import type { Segment } from "@/lib/types";
import { isBlank } from "@/lib/types";
import { BlankInput } from "@/components/blank-input";

export function Segments({
  segments,
  blankWidth = "md",
}: {
  segments: Segment[];
  blankWidth?: "sm" | "md" | "lg";
}) {
  return (
    <span className="leading-loose">
      {segments.map((s, i) =>
        isBlank(s) ? (
          <Fragment key={i}>
            {" "}
            <BlankInput number={s.blank} width={blankWidth} />{" "}
          </Fragment>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </span>
  );
}
