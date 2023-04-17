import { RolllStateType } from "shared/models/roll"
export interface Person {
  id: number
  first_name: string
  last_name: string
  photo_url?: string
  roll_state?: RolllStateType
}

export const PersonHelper = {
  getFullName: (p: Person) => `${p.first_name} ${p.last_name}`,
}
