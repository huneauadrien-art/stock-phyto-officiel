import type { PreparationLine, Product, Unit } from '../types'

const toBase=(value:number,unit:Unit)=>unit==='L'?value*1000:unit==='mL'?value:unit==='kg'?value*1000:unit==='g'?value:value
const fromBase=(value:number,unit:Unit)=>unit==='L'?value/1000:unit==='mL'?value:unit==='kg'?value/1000:unit==='g'?value:value

export function requiredInProductUnit(line:PreparationLine,_area:number,product:Product){
 let base=line.dose
 if(line.doseUnit==='L')base=line.dose*1000
 if(line.doseUnit==='mL')base=line.dose
 if(line.doseUnit==='kg')base=line.dose*1000
 if(line.doseUnit==='g')base=line.dose
 if((['L','mL'].includes(line.doseUnit)&&!['L','mL'].includes(product.unit))||(['kg','g'].includes(line.doseUnit)&&!['kg','g'].includes(product.unit))) return NaN
 return Number(fromBase(base,product.unit).toFixed(3))
}

export function dosePerHectare(line:PreparationLine,area:number){
 if(!area||area<=0)return NaN
 return Number((line.dose/area).toFixed(3))
}

export const stockBase=(p:Product)=>toBase(p.stock,p.unit)
