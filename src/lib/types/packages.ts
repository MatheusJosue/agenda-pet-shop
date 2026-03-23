export interface PackageType {
  id: string
  company_id: string
  name: string
  interval_days: number
  credits: number
  price: number
  active: boolean
  created_at: string
}

export interface PetPackage {
  id: string
  company_id: string
  pet_id: string
  package_type_id: string
  credits_remaining: number
  starts_at: string
  expires_at: string
  active: boolean
  created_at: string
}

export interface PetPackageWithRelations extends PetPackage {
  pet: {
    id: string
    name: string
    size: 'small' | 'medium' | 'large'
  }
  client: {
    id: string
    name: string
    phone: string
  }
  package_type: PackageType
}

export type PackageInput = {
  petId: string
  packageTypeId: string
  startsAt: Date | string
}

export type PackageTypesResponse = {
  data: PackageType[]
  error?: string
}

export type PetPackageResponse = {
  data: PetPackageWithRelations | undefined
  error?: string
}

export type PetPackageWithRelationsResponse = {
  data: PetPackageWithRelations | undefined
  error?: string
}

export type PetPackagesResponse = {
  data: PetPackageWithRelations[]
  error?: string
}

export type PackageTypeInput = {
  name: string
  interval_days: 7 | 15 | 30
  credits: number
  price: number
}

export type PackageTypeResponse = {
  data?: PackageType
  error?: string
}
