import { createContext, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { pick } from '../i18n'

// The category list comes from the database (or demo storage), so every page reads it from here
export const CategoriesContext = createContext([])

export function useCategories() {
  return useContext(CategoriesContext)
}

export function useCategoryName() {
  const categories = useCategories()
  const { i18n } = useTranslation()
  return (id) => pick(categories.find((c) => c.id === id)?.name, i18n.resolvedLanguage) || id
}
