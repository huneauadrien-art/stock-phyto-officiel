import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Search, Trash2, X } from 'lucide-react'
import { cultures } from '../data'
import type { Movement, Product, Unit } from '../types'

const blank=():Product=>({id:'',name:'',stock:0,unit:'L',threshold:0,cultures:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()})
const money = new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'})
type Filter='all'|'low'|'empty'|'valued'
type QuickAction={product:Product;type:'entry'|'exit'}

type Props={products:Product[];onChange:(p:Product[])=>void;onAddMovement:(m:Movement)=>void|Promise<void>}
export default function Products({products,onChange,onAddMovement}:Props){
  const [q,setQ]=useState('')
  const [filter,setFilter]=useState<Filter>('all')
  const [edit,setEdit]=useState<Product|null>(null)
  const [quick,setQuick]=useState<QuickAction|null>(null)
  const [quantity,setQuantity]=useState('')
  const [culture,setCulture]=useState('')
  const [message,setMessage]=useState('')

  const filtered=useMemo(()=>products.filter(p=>{
    const text=[p.name,p.supplier,p.lotNumber,p.amm,p.activeIngredient].filter(Boolean).join(' ').toLowerCase()
    const matches=text.includes(q.toLowerCase())
    const state=filter==='all'||(filter==='low'&&p.stock>0&&p.stock<=p.threshold)||(filter==='empty'&&p.stock===0)||(filter==='valued'&&(p.purchasePrice??0)>0)
    return matches&&state
  }),[products,q,filter])

  function save(){if(!edit?.name.trim())return;const now=new Date().toISOString();const next=edit.id?products.map(p=>p.id===edit.id?{...edit,updatedAt:now}:p):[...products,{...edit,id:crypto.randomUUID(),createdAt:now,updatedAt:now}];onChange(next);setEdit(null)}
  function toggle(c:string){if(!edit)return;setEdit({...edit,cultures:edit.cultures.includes(c)?edit.cultures.filter(x=>x!==c):[...edit.cultures,c]})}
  function openQuick(product:Product,type:'entry'|'exit'){setQuick({product,type});setQuantity('');setCulture(product.cultures[0]||'');setMessage('')}
  async function validateQuick(){
    if(!quick)return
    const value=Number(quantity.replace(',','.'))
    if(!Number.isFinite(value)||value<=0){setMessage('Indique une quantité valide.');return}
    if(quick.type==='exit'&&value>quick.product.stock){setMessage(`Stock disponible : ${quick.product.stock} ${quick.product.unit}.`);return}
    await onAddMovement({id:crypto.randomUUID(),productId:quick.product.id,type:quick.type,quantity:value,date:new Date().toISOString(),culture:quick.type==='exit'?(culture||undefined):undefined,reason:quick.type==='entry'?'Entrée rapide':'Sortie rapide'})
    setQuick(null)
  }

  return <section>
    <div className="page-head"><div><p className="eyebrow">Accès terrain</p><h1>Produits</h1></div><button className="primary" onClick={()=>setEdit(blank())}>Ajouter</button></div>
    <div className="toolbar"><div className="search big-search"><Search size={20}/><input placeholder="Rechercher un produit…" value={q} onChange={e=>setQ(e.target.value)}/></div><div className="filter-chips"><button className={filter==='all'?'chip active':'chip'} onClick={()=>setFilter('all')}>Tous</button><button className={filter==='low'?'chip active':'chip'} onClick={()=>setFilter('low')}>Stock faible</button><button className={filter==='empty'?'chip active':'chip'} onClick={()=>setFilter('empty')}>Ruptures</button><button className={filter==='valued'?'chip active':'chip'} onClick={()=>setFilter('valued')}>Avec prix</button></div></div>

    {quick&&<div className="modal"><div className="panel quick-modal"><div className="quick-title"><div><p className="eyebrow">{quick.type==='entry'?'Entrée':'Sortie'} rapide</p><h2>{quick.product.name}</h2><small>Stock actuel : {quick.product.stock} {quick.product.unit}</small></div><button className="close-btn" onClick={()=>setQuick(null)}><X size={21}/></button></div><label>Quantité ({quick.product.unit})<input autoFocus inputMode="decimal" value={quantity} onChange={e=>setQuantity(e.target.value)} placeholder="0" className="quantity-input"/></label>{quick.type==='exit'&&<label>Culture<select value={culture} onChange={e=>setCulture(e.target.value)}><option value="">Non renseignée</option>{cultures.map(c=><option key={c}>{c}</option>)}</select></label>}<button className={`primary large ${quick.type==='exit'?'exit-confirm':''}`} onClick={validateQuick}>{quick.type==='entry'?<ArrowUp size={22}/>:<ArrowDown size={22}/>} Valider {quick.type==='entry'?'l’entrée':'la sortie'}</button>{message&&<p className="form-error">{message}</p>}</div></div>}

    {edit&&<div className="modal"><div className="panel editor"><div className="page-head"><h2>{edit.id?'Modifier':'Nouveau produit'}</h2><button onClick={()=>setEdit(null)}>Fermer</button></div><div className="grid">
      <label>Nom<input value={edit.name} onChange={e=>setEdit({...edit,name:e.target.value})}/></label>
      <label>Stock<input type="number" inputMode="decimal" value={edit.stock} onChange={e=>setEdit({...edit,stock:Number(e.target.value)})}/></label>
      <label>Unité<select value={edit.unit} onChange={e=>setEdit({...edit,unit:e.target.value as Unit})}>{['L','mL','kg','g','unité','pack'].map(u=><option key={u}>{u}</option>)}</select></label>
      <label>Seuil<input type="number" inputMode="decimal" value={edit.threshold} onChange={e=>setEdit({...edit,threshold:Number(e.target.value)})}/></label>
      <label>Conditionnement<input value={edit.packaging||''} onChange={e=>setEdit({...edit,packaging:e.target.value})}/></label>
      <label>N° AMM<input value={edit.amm||''} onChange={e=>setEdit({...edit,amm:e.target.value})}/></label>
      <label className="wide">Lien e-Phy<input value={edit.ephyUrl||''} onChange={e=>setEdit({...edit,ephyUrl:e.target.value})} placeholder="https://ephy.anses.fr/..."/></label>
      <label>Matière active<input value={edit.activeIngredient||''} onChange={e=>setEdit({...edit,activeIngredient:e.target.value})}/></label>
      <label>Famille<input value={edit.family||''} onChange={e=>setEdit({...edit,family:e.target.value})}/></label>
      <label>Fournisseur<input value={edit.supplier||''} onChange={e=>setEdit({...edit,supplier:e.target.value})}/></label>
      <label>Prix par {edit.unit}<input type="number" min="0" step="0.01" inputMode="decimal" value={edit.purchasePrice??''} onChange={e=>setEdit({...edit,purchasePrice:e.target.value===''?undefined:Number(e.target.value)})}/></label>
      <label>N° de lot<input value={edit.lotNumber||''} onChange={e=>setEdit({...edit,lotNumber:e.target.value})}/></label>
      <label>Date d'achat<input type="date" value={edit.purchaseDate||''} onChange={e=>setEdit({...edit,purchaseDate:e.target.value})}/></label>
      <label className="wide">Notes<textarea value={edit.notes||''} onChange={e=>setEdit({...edit,notes:e.target.value})}/></label>
      <div className="wide"><b>Cultures</b><div className="chips">{cultures.map(c=><button type="button" className={edit.cultures.includes(c)?'chip active':'chip'} onClick={()=>toggle(c)} key={c}>{c}</button>)}</div></div>
    </div><button className="primary large" onClick={save}>Enregistrer</button></div></div>}

    <div className="cards field-cards">{filtered.map(p=>{const value=(p.purchasePrice??0)*p.stock;const state=p.stock===0?'empty':p.stock<=p.threshold?'low':'ok';return <article className={`card field-card ${state}`} key={p.id}><div className="row top"><div className="product-heading"><span className={`status-dot ${state}`}/><div><h3>{p.name}</h3><small>{p.cultures.join(', ')||'Aucune culture'}</small></div></div><div className="actions"><button aria-label="Modifier" onClick={()=>setEdit({...p})}><Pencil size={18}/></button><button aria-label="Supprimer" onClick={()=>confirm('Supprimer ce produit ?')&&onChange(products.filter(x=>x.id!==p.id))}><Trash2 size={18}/></button></div></div><strong className={p.stock===0?'stock bad':p.stock<=p.threshold?'stock warning-text':'stock'}>{p.stock} {p.unit}</strong><small>{p.packaging||'Conditionnement non renseigné'}</small><div className="quick-actions"><button className="quick-exit" disabled={p.stock<=0} onClick={()=>openQuick(p,'exit')}><ArrowDown size={20}/> Sortie</button><button className="quick-entry" onClick={()=>openQuick(p,'entry')}><ArrowUp size={20}/> Entrée</button></div><div className="product-meta">{p.supplier&&<span><b>Fournisseur :</b> {p.supplier}</span>}{p.lotNumber&&<span><b>Lot :</b> {p.lotNumber}</span>}{p.purchaseDate&&<span><b>Achat :</b> {new Date(`${p.purchaseDate}T00:00:00`).toLocaleDateString('fr-FR')}</span>}{p.purchasePrice!==undefined&&<span><b>Valeur :</b> {money.format(value)}</span>}</div><a className="ephy" target="_blank" rel="noreferrer" href={p.ephyUrl||'https://ephy.anses.fr/'}>e-Phy <ExternalLink size={15}/></a></article>})}</div>
    {filtered.length===0&&<div className="panel empty-state">Aucun produit ne correspond à cette recherche.</div>}
  </section>
}
