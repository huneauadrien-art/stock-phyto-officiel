import { useRef, useState } from 'react'
import { exportWorkbook, importProducts } from '../lib/excel'
import { supabaseEnabled } from '../lib/supabase'
import type { Movement, Preparation, Product } from '../types'

type Props={products:Product[];movements:Movement[];preparations:Preparation[];onImport:(p:Product[])=>void;onReset:()=>void;onLogout?:()=>void}
export default function Settings({products,movements,preparations,onImport,onReset,onLogout}:Props){
 const ref=useRef<HTMLInputElement>(null),[msg,setMsg]=useState('')
 async function imp(file?:File){if(!file)return;const p=await importProducts(file);onImport(p);setMsg(`${p.length} produit(s) importé(s).`)}
 return <section><header><p className="eyebrow">Sauvegarde et connexion</p><h1>Paramètres</h1></header><div className="cols"><div className="panel form"><h2>Excel</h2><button className="primary" onClick={()=>exportWorkbook(products,movements,preparations)}>Exporter Excel</button><button onClick={()=>ref.current?.click()}>Importer des produits</button><input ref={ref} hidden type="file" accept=".xlsx,.xls" onChange={e=>imp(e.target.files?.[0])}/>{msg&&<p>{msg}</p>}</div><div className="panel form"><h2>Synchronisation</h2><p>{supabaseEnabled?'Le stock est partagé entre tous les appareils connectés avec le même compte.':'Mode local actif. Ajoute les variables Supabase pour partager le stock entre le PC, l’iPhone et la tablette.'}</p>{onLogout&&<button onClick={onLogout}>Se déconnecter</button>}</div><div className="panel form"><h2>Réinitialisation</h2><button className="danger-btn" onClick={()=>confirm('Effacer toutes les données ?')&&onReset()}>Effacer toutes les données</button></div></div></section>
}
