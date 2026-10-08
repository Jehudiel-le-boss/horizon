import { describe, expect, it } from "vitest"

import { adminSchoolRoles } from "./roles"

describe("admin school roles", () => {
  it("includes the explicitly supported staff roles and excludes parents", () => {
    expect(adminSchoolRoles).toEqual([
      "owner",
      "director",
      "accountant",
      "cashier",
    ])
    expect(adminSchoolRoles).not.toContain("parent")
  })
})
