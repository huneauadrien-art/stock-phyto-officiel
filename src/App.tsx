import { useEffect, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Movement from './pages/Movement'
import Preparation from './pages/Preparation'
import History from './pages/History'
import Settings from './pages/Settings'
import Login from './pages/Login'
import { storage } from './lib/storage'
import { requiredInProductUnit } from './lib/units'
import { cloud, loadCloudData } from './lib/cloud'
import { supabase, supabaseEnabled } from './lib/supabase'
import type { Movement as M, Preparation as P, Product } from './types'

const DIRTY_KEY = 'sp_cloud_pending_v1'
const hasPendingChanges = () => localStorage.getItem(DIRTY_KEY) === '1'
const setPendingChanges = (value: boolean) => value ? localStorage.setItem(DIRTY_KEY, '1') : localStorage.removeItem(DIRTY_KEY)

export default function App(){
  const [session,setSession]=useState<Session|null>(null)
  const [loading,setLoading]=useState(supabaseEnabled)
  const [products,setProducts]=useState<Product[]>(storage.getProducts)
  const [movements,setMovements]=useState<M[]>(storage.getMovements)
  const [preps,setPreps]=useState<P[]>(storage.getPreparations)
  const [online,setOnline]=useState(navigator.onLine)
  const [syncState,setSyncState]=useState<'local'|'ok'|'syncing'|'error'|'offline'>(supabaseEnabled?'syncing':'local')
  const writing=useRef(false)
  const productsRef=useRef(products), movementsRef=useRef(movements), prepsRef=useRef(preps)
  useEffect(()=>{productsRef.current=products},[products])
  useEffect(()=>{movementsRef.current=movements},[movements])
  useEffect(()=>{prepsRef.current=preps},[preps])

  useEffect(()=>{
    const onOnline=()=>setOnline(true), onOffline=()=>setOnline(false)
    window.addEventListener('online',onOnline);window.addEventListener('offline',onOffline)
    return()=>{window.removeEventListener('online',onOnline);window.removeEventListener('offline',onOffline)}
  },[])

  useEffect(()=>{
    if(!supabase){setLoading(false);return}
    supabase.auth.getSession().then(({data})=>{setSession(data.session);setLoading(false)})
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>setSession(next))
    return()=>subscription.unsubscribe()
  },[])

  async function uploadSnapshot(){
    if(!session?.user||!supabase||!navigator.onLine)return
    writing.current=true;setSyncState('syncing')
    try{
      await Promise.all([
        cloud.saveProducts(session.user,productsRef.current),
        cloud.saveMovements(session.user,movementsRef.current),
        cloud.savePreparations(session.user,prepsRef.current),
      ])
      setPendingChanges(false);setSyncState('ok')
    }catch(error){console.error(error);setPendingChanges(true);setSyncState('error')}
    finally{window.setTimeout(()=>{writing.current=false},400)}
  }

  async function downloadSnapshot(){
    if(!session?.user||!supabase||!navigator.onLine||writing.current)return
    setSyncState('syncing')
    try{
      const remote=await loadCloudData()
      const hasRemote=Boolean(remote.products.length||remote.movements.length||remote.preparations.length)
      if(hasRemote){
        setProducts(remote.products);setMovements(remote.movements);setPreps(remote.preparations)
        storage.setProducts(remote.products);storage.setMovements(remote.movements);storage.setPreparations(remote.preparations)
      }else if(productsRef.current.length||movementsRef.current.length||prepsRef.current.length){
        await uploadSnapshot();return
      }
      setSyncState('ok')
    }catch(error){console.error(error);setSyncState('error')}
  }

  useEffect(()=>{
    if(!session?.user||!supabase)return
    let active=true, timer:number|undefined
    const initial=async()=>{
      if(!navigator.onLine){setSyncState('offline');return}
      if(hasPendingChanges())await uploadSnapshot();else await downloadSnapshot()
    }
    initial()
    const scheduleReload=()=>{
      if(!active||writing.current||hasPendingChanges())return
      window.clearTimeout(timer);timer=window.setTimeout(()=>downloadSnapshot(),350)
    }
    const client=supabase
    const channel=client.channel(`stock-${session.user.id}`)
      .on('postgres_changes',{event:'*',schema:'public',table:'products'},scheduleReload)
      .on('postgres_changes',{event:'*',schema:'public',table:'movements'},scheduleReload)
      .on('postgres_changes',{event:'*',schema:'public',table:'preparations'},scheduleReload)
      .subscribe()
    return()=>{active=false;window.clearTimeout(timer);client.removeChannel(channel)}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[session?.user.id])

  useEffect(()=>{
    if(!supabaseEnabled)return
    if(!online){setSyncState('offline');return}
    if(session?.user){if(hasPendingChanges())uploadSnapshot();else downloadSnapshot()}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[online])

  async function persistCloud(){
    if(!session?.user)return
    setPendingChanges(true)
    if(!navigator.onLine){setSyncState('offline');return}
    await uploadSnapshot()
  }
  async function saveProducts(v:Product[]){setProducts(v);productsRef.current=v;storage.setProducts(v);await persistCloud()}
  async function saveMovements(v:M[]){setMovements(v);movementsRef.current=v;storage.setMovements(v);await persistCloud()}
  async function savePreparations(v:P[]){setPreps(v);prepsRef.current=v;storage.setPreparations(v);await persistCloud()}

  async function saveAll(nextProducts:Product[],nextMovements:M[],nextPreps:P[]){
    setProducts(nextProducts);productsRef.current=nextProducts;storage.setProducts(nextProducts)
    setMovements(nextMovements);movementsRef.current=nextMovements;storage.setMovements(nextMovements)
    setPreps(nextPreps);prepsRef.current=nextPreps;storage.setPreparations(nextPreps)
    await persistCloud()
  }

  async function addMovement(m:M){
    const next=productsRef.current.map(p=>p.id===m.productId?{...p,stock:Number((p.stock+(m.type==='entry'?m.quantity:-m.quantity)).toFixed(3)),updatedAt:new Date().toISOString()}:p)
    await saveAll(next,[m,...movementsRef.current],prepsRef.current)
  }

  async function validatePrep(prep:P){
    let next=[...productsRef.current];const ms:M[]=[]
    for(const l of prep.lines){const p=next.find(x=>x.id===l.productId);if(!p)continue;const q=requiredInProductUnit(l,prep.area,p);next=next.map(x=>x.id===p.id?{...x,stock:Number((x.stock-q).toFixed(3)),updatedAt:new Date().toISOString()}:x);ms.push({id:crypto.randomUUID(),productId:p.id,type:'preparation',quantity:q,date:prep.date,culture:prep.culture,reason:`Préparation ${prep.name}`,preparationId:prep.id})}
    await saveAll(next,[...ms,...movementsRef.current],[prep,...prepsRef.current])
  }

  async function deleteMovement(m:M){
    const product=productsRef.current.find(p=>p.id===m.productId)
    if(!product){await saveAll(productsRef.current,movementsRef.current.filter(x=>x.id!==m.id),prepsRef.current);return}
    const reversedStock=m.type==='entry'?product.stock-m.quantity:product.stock+m.quantity
    if(reversedStock<0)throw new Error('Impossible de supprimer cette entrée : le stock deviendrait négatif.')
    const nextProducts=productsRef.current.map(p=>p.id===m.productId?{...p,stock:Number(reversedStock.toFixed(3)),updatedAt:new Date().toISOString()}:p)
    await saveAll(nextProducts,movementsRef.current.filter(x=>x.id!==m.id),prepsRef.current)
  }

  async function reset(){await saveAll([],[],[])}

  if(loading)return <div className="center-screen">Chargement…</div>
  if(supabaseEnabled&&!session)return <Login/>
  const syncLabel=syncState==='local'?'Mode local':syncState==='offline'?'Hors connexion — sauvegarde en attente':syncState==='syncing'?'Synchronisation…':syncState==='error'?'Erreur de synchronisation':'Synchronisé'

  return <Layout>
    <div className={`sync-pill ${syncState}`}>{syncLabel}</div>
    <Routes>
      <Route path="/" element={<Dashboard products={products} movements={movements}/>}/>
      <Route path="/produits" element={<Products products={products} onChange={saveProducts} onAddMovement={addMovement}/>}/>
      <Route path="/mouvement" element={<Movement products={products} onAdd={addMovement}/>}/>
      <Route path="/preparation" element={<Preparation products={products} onValidate={validatePrep}/>}/>
      <Route path="/historique" element={<History products={products} movements={movements} onDelete={deleteMovement}/>}/>
      <Route path="/parametres" element={<Settings products={products} movements={movements} preparations={preps} onImport={p=>saveProducts([...productsRef.current,...p])} onReset={reset} onLogout={session?()=>supabase?.auth.signOut():undefined}/>}/>
    </Routes>
  </Layout>
}
