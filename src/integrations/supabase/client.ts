// Stub file to prevent import errors during Supabase removal
// All Supabase functionality has been moved to the backend API

export const supabase = {
    from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
        eq: function () { return this; },
        neq: function () { return this; },
        single: () => Promise.resolve({ data: null, error: null }),
    }),
    storage: {
        from: () => ({
            upload: () => Promise.resolve({ data: null, error: new Error('File uploads not yet implemented') }),
            remove: () => Promise.resolve({ error: null }),
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
        }),
    },
    auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
};
