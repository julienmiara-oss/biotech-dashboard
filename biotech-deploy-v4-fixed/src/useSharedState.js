import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from './supabaseClient'

const SAVE_DELAY_MS = 1500 // Sauvegarde 1.5s après la dernière modification
const BUDGET_ID = 'main'  // Un seul budget partagé

export function useSharedState(initialState) {
  const [state, setState] = useState(initialState)
  const [status, setStatus] = useState(supabase ? 'loading' : 'local') // loading | saved | saving | error | local
  const [lastSaved, setLastSaved] = useState(null)
  const saveTimer = useRef(null)
  const isInitialized = useRef(false)
  const skipNextSave = useRef(false)

  // --- Charger les données au démarrage ---
  useEffect(() => {
    if (!supabase) {
      setStatus('local')
      isInitialized.current = true
      return
    }

    const loadData = async () => {
      try {
        const { data, error } = await supabase
          .from('budget_data')
          .select('state, updated_at')
          .eq('id', BUDGET_ID)
          .single()

        if (error && error.code === 'PGRST116') {
          // Pas encore de données — on crée la première entrée
          const { error: insertErr } = await supabase
            .from('budget_data')
            .insert({ id: BUDGET_ID, state: initialState })
          if (insertErr) throw insertErr
          setStatus('saved')
        } else if (error) {
          throw error
        } else if (data) {
          skipNextSave.current = true
          setState(data.state)
          setLastSaved(new Date(data.updated_at))
          setStatus('saved')
        }
      } catch (err) {
        console.error('Erreur chargement:', err)
        setStatus('error')
      }
      isInitialized.current = true
    }

    loadData()
  }, [])

  // --- Sauvegarder automatiquement quand le state change ---
  useEffect(() => {
    if (!supabase || !isInitialized.current) return

    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }

    if (saveTimer.current) clearTimeout(saveTimer.current)
    setStatus('saving')

    saveTimer.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('budget_data')
          .upsert({
            id: BUDGET_ID,
            state: state,
            updated_at: new Date().toISOString()
          })
        if (error) throw error
        setStatus('saved')
        setLastSaved(new Date())
      } catch (err) {
        console.error('Erreur sauvegarde:', err)
        setStatus('error')
      }
    }, SAVE_DELAY_MS)

    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [state])

  // --- Temps réel : écouter les modifications des autres ---
  useEffect(() => {
    if (!supabase) return

    const channel = supabase
      .channel('budget-changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'budget_data',
        filter: `id=eq.${BUDGET_ID}`
      }, (payload) => {
        if (payload.new?.state) {
          skipNextSave.current = true
          setState(payload.new.state)
          setLastSaved(new Date(payload.new.updated_at))
          setStatus('saved')
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // --- Wrapper pour mettre à jour un champ spécifique du state ---
  const updateField = useCallback((field, value) => {
    setState(prev => ({
      ...prev,
      [field]: typeof value === 'function' ? value(prev[field]) : value
    }))
  }, [])

  return { state, setState, updateField, status, lastSaved }
}
