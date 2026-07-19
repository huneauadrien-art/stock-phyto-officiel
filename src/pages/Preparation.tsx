import { useMemo, useState } from 'react'
import { CheckCircle2, Droplets, Plus, Trash2 } from 'lucide-react'
import { cultures } from '../data'
import { dosePerHectare, requiredInProductUnit } from '../lib/units'
import type { Preparation as Prep, PreparationLine, Product } from '../types'

export default function Preparation({products,onValidate}:{products:Product[];onValidate:(p:Prep)=>void|Promise<void>}){
  const [name,setName]=useState('')
  const [culture,setCulture]=useState('Vigne')
  const [area,setArea]=useState('')
  const [water,setWater]=useState('150')
  const [lines,setLines]=useState<PreparationLine[]>([])
  const [msg,setMsg]=useState('')
  const [busy,setBusy]=useState(false)

  function add(){if(!products.length)return;const first=products[0];const unit=first.unit==='L'||first.unit==='mL'?first.unit:first.unit==='kg'||first.unit==='g'?first.unit:'L';setLines([...lines,{id:crypto.randomUUID(),productId:first.id,dose:0,doseUnit:unit as PreparationLine['doseUnit']}])}
  const computed=useMemo(()=>lines.map(l=>{const p=products.find(x=>x.id===l.productId);return {line:l,product:p,required:p?requiredInProductUnit(l,Number(area)||0,p):NaN,doseHa:dosePerHectare(l,Number(area)||0)}}),[lines,products,area])
  const valid=computed.every(x=>x.product&&Number.isFinite(x.required)&&x.required>0&&x.required<=x.product.stock&&Number.isFinite(x.doseHa))&&Number(area)>0&&lines.length>0
  const totalWater=((Number(area)||0)*(Number(water)||0))

  function changeProduct(line:PreparationLine,productId:string){
    const p=products.find(x=>x.id===productId)
    const unit=p?.unit==='L'||p?.unit==='mL'?p.unit:p?.unit==='kg'||p?.unit==='g'?p.unit:'L'
    setLines(lines.map(x=>x.id===line.id?{...x,productId,doseUnit:unit as PreparationLine['doseUnit']}:x))
  }

  async function validate(){
    if(!valid){setMsg('Vérifie la surface, les quantités et les stocks disponibles.');return}
    setBusy(true)
    await onValidate({id:crypto.randomUUID(),name:name||'Préparation',culture,area:Number(area),waterVolume:Number(water),date:new Date().toISOString(),lines})
    setLines([]);setName('');setArea('');setMsg('Préparation terminée : le stock et l’historique sont à jour.');setBusy(false)
  }

  return <section className="prep-page"><header><p className="eyebrow">Calcul automatique</p><h1>Préparation</h1><p className="page-intro">Indique la quantité totale utilisée et la surface : l’application calcule automatiquement la dose par hectare.</p></header><div className="panel form preparation-card"><div className="grid prep-info"><label>Parcelle / nom<input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex. Les Chênes"/></label><label>Culture<select value={culture} onChange={e=>setCulture(e.target.value)}>{cultures.map(c=><option key={c}>{c}</option>)}</select></label><label>Surface (ha)<input inputMode="decimal" value={area} onChange={e=>setArea(e.target.value.replace(',','.'))} placeholder="0,00"/></label><label>Volume d'eau (L/ha)<input inputMode="decimal" value={water} onChange={e=>setWater(e.target.value.replace(',','.'))}/></label></div>
    <div className="water-total"><Droplets size={27}/><div><span>Eau totale à préparer</span><b>{totalWater.toLocaleString('fr-FR',{maximumFractionDigits:0})} L</b></div></div>
    <div className="prep-head"><div><h2>Produits</h2><small>Saisis la quantité totale prévue pour toute la surface.</small></div><button className="primary" onClick={add}><Plus size={18}/> Ajouter un produit</button></div>
    {lines.length===0&&<button className="add-first-product" onClick={add}><Plus size={26}/> Ajouter le premier produit</button>}
    <div className="prep-lines">{lines.map((l,index)=>{const p=products.find(x=>x.id===l.productId);const req=p?requiredInProductUnit(l,Number(area)||0,p):NaN;const doseHa=dosePerHectare(l,Number(area)||0);const enough=Boolean(p&&Number.isFinite(req)&&req>0&&req<=p.stock);return <div className={`prep-line-card ${enough?'ready':'not-ready'}`} key={l.id}><div className="line-number">{index+1}</div><label>Produit<select value={l.productId} onChange={e=>changeProduct(l,e.target.value)}>{products.map(p=><option value={p.id} key={p.id}>{p.name} — stock {p.stock} {p.unit}</option>)}</select></label><label>Quantité totale<input inputMode="decimal" value={l.dose||''} onChange={e=>setLines(lines.map(x=>x.id===l.id?{...x,dose:Number(e.target.value.replace(',','.'))}:x))} placeholder="0"/></label><label>Unité<select value={l.doseUnit} onChange={e=>setLines(lines.map(x=>x.id===l.id?{...x,doseUnit:e.target.value as PreparationLine['doseUnit']}:x))}>{['L','mL','kg','g'].map(u=><option key={u}>{u}</option>)}</select></label><div className="calculated-dose"><span>Dose calculée</span><strong className={enough?'ok':'bad'}>{Number.isFinite(doseHa)?`${doseHa.toLocaleString('fr-FR',{maximumFractionDigits:3})} ${l.doseUnit}/ha`:'Surface requise'}</strong><small>{p?`Retrait stock : ${Number.isFinite(req)?req:'—'} ${p.unit} · disponible ${p.stock} ${p.unit}`:''}</small></div><button className="remove-line" aria-label="Supprimer" onClick={()=>setLines(lines.filter(x=>x.id!==l.id))}><Trash2 size={19}/></button></div>})}</div>
    <button className="primary huge-prep-button" disabled={!valid||busy} onClick={validate}><CheckCircle2 size={25}/>{busy?'Validation…':'Préparation terminée'}</button>{msg&&<p className={msg.startsWith('Préparation terminée')?'success-message':'form-error'}>{msg}</p>}</div></section>
}
