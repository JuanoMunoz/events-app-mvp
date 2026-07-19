
export type Role = "SUPER_ADMIN" | "ORGANIZER" | "STAFF";

export interface NavItem {
    href: string,
    icon: any,
    label: string,
    roles: Role[]
}