// src/components/patients/detail/measurement-block.tsx
interface MeasurementBlockProps {
  label: string
  children: React.ReactNode
}

export function MeasurementBlock({ label, children }: MeasurementBlockProps) {
  return (
    <div className="rounded-[10px] bg-muted/50 p-3.5">
      <div className="mb-2 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </div>
      <div className="space-y-1 text-[13px]">{children}</div>
    </div>
  )
}

export function OdOsRow({
  eye,
  children,
}: {
  eye: "OD" | "OS"
  children: React.ReactNode
}) {
  return (
    <div>
      <b
        className="font-medium"
        style={{ color: eye === "OD" ? "#185FA5" : "#993C1D" }}
      >
        {eye}
      </b>
      {"  "}
      {children}
    </div>
  )
}
