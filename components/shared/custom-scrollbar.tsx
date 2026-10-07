import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react"

type CustomScrollbarProps<T extends ElementType,> = {
  as?: T

  children?: ReactNode

  className?: string
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">

export function CustomScrollbar<T extends ElementType = "div">({
  as,

  children,

  className,

  ...props
}: CustomScrollbarProps<T>) {
  const Element = as ?? "div"

  return (
    <Element
      {...props}
      className={["custom-scrollbar", className].filter(Boolean).join(" ")}
    >
      {children}
    </Element>
  )
}
