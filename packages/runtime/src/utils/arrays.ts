export const withoutNulls = <T extends unknown | null | undefined>(arr: T[]): NonNullable<T>[] => arr.filter((el) => el != null)
