export interface Draft {
    id: string;
    type: 'PACKING_LIST' | 'DAILY_REPORT';
    dateCreated: string;
    lastModified: string;
    data: any;
    metadata: {
        reportNo?: string;
        client?: string;
        project?: string;
        location?: string;
        specification?: string;
        date?: string;
        supervisorMicsa?: string;
        supervisorClient?: string;
    };
}

const STORAGE_KEY = 'MICSA_SYSTEM_DRAFTS';

export const draftsUtils = {
    getAll(): Draft[] {
        if (typeof window === 'undefined') return [];
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    },

    save(draft: Omit<Draft, 'id' | 'dateCreated' | 'lastModified'> & { id?: string }): Draft {
        const drafts = this.getAll();
        const now = new Date().toISOString();
        
        let existingDraft = draft.id ? drafts.find(d => d.id === draft.id) : null;
        
        const newDraft: Draft = {
            id: draft.id || `draft-${Date.now()}`,
            type: draft.type,
            dateCreated: existingDraft?.dateCreated || now,
            lastModified: now,
            data: draft.data,
            metadata: draft.metadata
        };

        const updatedDrafts = draft.id 
            ? drafts.map(d => d.id === draft.id ? newDraft : d)
            : [newDraft, ...drafts];

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDrafts));
        return newDraft;
    },

    delete(id: string) {
        const drafts = this.getAll().filter(d => d.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
    },

    getById(id: string): Draft | undefined {
        return this.getAll().find(d => d.id === id);
    }
};
