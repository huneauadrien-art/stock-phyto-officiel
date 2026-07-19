import * as XLSX from 'xlsx'
import type { Movement, Preparation, Product } from '../types'

const money=(n:number)=>Math.round(n*100)/100

export function exportWorkbook(products:Product[],movements:Movement[],preparations:Preparation[]){
 const wb=XLSX.utils.book_new()
 const totalValue=products.reduce((sum,p)=>sum+(p.purchasePrice??0)*p.stock,0)
 const low=products.filter(p=>p.stock>0&&p.stock<=p.threshold).length
 const empty=products.filter(p=>p.stock===0).length
 const summary=[
  {Indicateur:'Date export',Valeur:new Date().toLocaleString('fr-FR')},
  {Indicateur:'Nombre de produits',Valeur:products.length},
  {Indicateur:'Produits en stock',Valeur:products.length-empty},
  {Indicateur:'Stocks faibles',Valeur:low},
  {Indicateur:'Ruptures',Valeur:empty},
  {Indicateur:'Valeur totale estimée (€)',Valeur:money(totalValue)},
  {Indicateur:'Produits avec prix renseigné',Valeur:products.filter(p=>(p.purchasePrice??0)>0).length},
 ]
 XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(summary),'Synthèse')
 XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(products.map(p=>({
  Nom:p.name,Stock:p.stock,Unité:p.unit,'Seuil alerte':p.threshold,'État':p.stock===0?'Rupture':p.stock<=p.threshold?'Stock faible':'OK',
  Conditionnement:p.packaging||'',Cultures:p.cultures.join(', '),AMM:p.amm||'','Lien e-Phy':p.ephyUrl||'','Matière active':p.activeIngredient||'',Famille:p.family||'',
  Fournisseur:p.supplier||'','Prix unitaire (€)':p.purchasePrice??'','Valeur stock (€)':p.purchasePrice===undefined?'':money(p.purchasePrice*p.stock),'N° lot':p.lotNumber||'',"Date d'achat":p.purchaseDate||'',Notes:p.notes||'',
  'Créé le':new Date(p.createdAt).toLocaleString('fr-FR'),'Modifié le':new Date(p.updatedAt).toLocaleString('fr-FR')
 }))), 'Stock détaillé')
 XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(movements.map(m=>({Date:new Date(m.date).toLocaleString('fr-FR'),Produit:products.find(p=>p.id===m.productId)?.name||'Produit supprimé',Type:m.type,Quantité:m.quantity,Unité:products.find(p=>p.id===m.productId)?.unit||'',Culture:m.culture||'',Motif:m.reason||'',Note:m.note||'',Préparation:m.preparationId||''}))), 'Mouvements')
 XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(preparations.map(p=>({Date:new Date(p.date).toLocaleString('fr-FR'),Nom:p.name,Culture:p.culture,Surface:p.area,'Volume eau L/ha':p.waterVolume,'Volume total eau (L)':p.area*p.waterVolume,'Nombre produits':p.lines.length,'Détail produits':p.lines.map(l=>{const product=products.find(x=>x.id===l.productId);return `${product?.name??'Produit'}: ${l.dose} ${l.doseUnit} au total (${p.area>0?(l.dose/p.area).toLocaleString('fr-FR',{maximumFractionDigits:3}):0} ${l.doseUnit}/ha)`}).join(' | ')}))), 'Préparations')
 XLSX.writeFile(wb,`stock-phyto-${new Date().toISOString().slice(0,10)}.xlsx`)
}

export async function importProducts(file:File):Promise<Product[]>{
 const data=await file.arrayBuffer(); const wb=XLSX.read(data); const ws=wb.Sheets[wb.SheetNames[0]]; const rows=XLSX.utils.sheet_to_json<Record<string,unknown>>(ws)
 return rows.map(r=>({id:crypto.randomUUID(),name:String(r['Nom']??r['name']??'').trim(),stock:Number(r['Stock']??0),unit:String(r['Unité']??'L') as Product['unit'],threshold:Number(r['Seuil alerte']??0),cultures:String(r['Cultures']??'').split(',').map(s=>s.trim()).filter(Boolean),packaging:String(r['Conditionnement']??''),amm:String(r['AMM']??''),ephyUrl:String(r['Lien e-Phy']??''),activeIngredient:String(r['Matière active']??''),family:String(r['Famille']??''),supplier:String(r['Fournisseur']??''),purchasePrice:Number(r['Prix unitaire (€)']??r['Prix achat']??0)||undefined,lotNumber:String(r['N° lot']??''),purchaseDate:String(r["Date d'achat"]??''),notes:String(r['Notes']??''),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()})).filter(p=>p.name)
}
