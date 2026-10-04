import type { InjectionKey } from 'vue'

export interface LegalSectionLink {
  id: string
  title: string
}

// LegalPage provides its table of contents so each LegalSection can find its number and title
export const legalSectionsKey: InjectionKey<LegalSectionLink[]> = Symbol('legal-sections')
