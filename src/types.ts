export type Unit = 'L'|'mL'|'kg'|'g'|'unité'|'pack'
export type MovementType = 'entry'|'exit'|'adjustment'|'preparation'
export type Product = {
  id:string
  name:string
  stock:number
  unit:Unit
  threshold:number
  cultures:string[]
  amm?:string
  ephyUrl?:string
  packaging?:string
  activeIngredient?:string
  family?:string
  supplier?:string
  purchasePrice?:number
  lotNumber?:string
  purchaseDate?:string
  notes?:string
  createdAt:string
  updatedAt:string
}
export type Movement = { id:string; productId:string; type:MovementType; quantity:number; date:string; culture?:string; reason?:string; note?:string; preparationId?:string }
export type PreparationLine = { id:string; productId:string; dose:number; doseUnit:'L'|'mL'|'kg'|'g' }
export type Preparation = { id:string; name:string; culture:string; area:number; waterVolume:number; date:string; lines:PreparationLine[] }
