import { Trash2 } from 'lucide-react'
import type { Movement, Product } from '../types'

export default function History({products,movements,onDelete}:{products:Product[];movements:Movement[];onDelete:(movement:Movement)=>void|Promise<void>}){
  async function remove(movement:Movement){
    const product=products.find(x=>x.id===movement.productId)
    const effect=movement.type==='entry'?'retirée du':'réintégrée au'
    if(!window.confirm(`Supprimer cette ligne ?\n\n${product?.name||'Produit'} : ${movement.quantity} ${product?.unit||''} sera ${effect} stock.\n\nTu pourras ensuite saisir le bon mouvement.`))return
    await onDelete(movement)
  }
  return <section><header><p className="eyebrow">Traçabilité</p><h1>Historique</h1><p className="page-intro">Une suppression corrige aussi automatiquement le stock, afin de pouvoir refaire la saisie correctement.</p></header><div className="panel">{movements.length===0?<p>Aucun mouvement.</p>:movements.map(m=>{const p=products.find(x=>x.id===m.productId);return <div className="row history-row" key={m.id}><div><b>{p?.name||'Produit supprimé'}</b><small>{new Date(m.date).toLocaleString('fr-FR')} · {m.reason||m.type}{m.culture?` · ${m.culture}`:''}</small></div><div className="history-actions"><strong>{m.type==='entry'?'+':'-'}{m.quantity} {p?.unit}</strong><button className="history-delete" aria-label="Supprimer cette ligne" title="Supprimer cette ligne" onClick={()=>remove(m)}><Trash2 size={18}/></button></div></div>})}</div></section>
}
