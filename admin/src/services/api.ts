import { supabase, uploadImage } from '../lib/supabase';

// ============ EVENTS ============

export async function getEvents() {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });
    if (error) throw error;
    return data;
}

export async function getEvent(id: string) {
    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
    if (error) throw error;
    return data;
}

export async function saveEvent(event: any) {
    const payload = {
        title: event.title,
        date: event.date,
        location: event.location,
        category: event.category,
        description: event.description,
        cover_image: event.coverImage || event.cover_image,
        video_url: event.videoUrl || event.video_url,
        gallery_images: event.galleryImages || event.gallery_images || [],
        is_featured: event.isFeatured ?? event.is_featured ?? false,
        status: event.status || 'draft',
    };

    if (event.id) {
        const { data, error } = await supabase.from('events').update(payload).eq('id', event.id).select().single();
        if (error) throw error;
        return data;
    } else {
        const { data, error } = await supabase.from('events').insert(payload).select().single();
        if (error) throw error;
        return data;
    }
}

export async function deleteEvent(id: string) {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;
}

// ============ NEWS ============

export async function getNewsList() {
    const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function saveNews(news: any) {
    const payload = {
        title: news.title,
        summary: news.summary,
        content: news.content,
        image: news.image,
        author: news.author || 'Admin',
        status: news.status || 'draft',
    };

    if (news.id) {
        const { data, error } = await supabase.from('news').update(payload).eq('id', news.id).select().single();
        if (error) throw error;
        return data;
    } else {
        const { data, error } = await supabase.from('news').insert(payload).select().single();
        if (error) throw error;
        return data;
    }
}

export async function deleteNews(id: string) {
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) throw error;
}

// ============ FAIRS (Networking) ============

export async function getFairs() {
    const { data, error } = await supabase
        .from('fairs')
        .select('*')
        .order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
}

export async function saveFair(fair: any) {
    const payload = {
        name: fair.name,
        full_name: fair.fullName || fair.full_name,
        description: fair.description,
        image: fair.image,
        hover_image: fair.hoverImage || fair.hover_image,
        is_hero_featured: fair.is_hero_featured ?? false,
        sort_order: fair.sort_order ?? fair.sortOrder ?? 0,
    };

    if (fair.id) {
        const { data, error } = await supabase.from('fairs').update(payload).eq('id', fair.id).select().single();
        if (error) throw error;
        return data;
    } else {
        const { data, error } = await supabase.from('fairs').insert(payload).select().single();
        if (error) throw error;
        return data;
    }
}

export async function deleteFair(id: string) {
    const { error } = await supabase.from('fairs').delete().eq('id', id);
    if (error) throw error;
}

// ============ CALENDAR DATES ============

export async function getCalendarDates() {
    const { data, error } = await supabase
        .from('calendar_dates')
        .select('*')
        .order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
}

export async function saveCalendarDate(entry: any) {
    const payload = {
        event_name: entry.event || entry.event_name,
        days: entry.days,
        month: entry.month,
        year: entry.year || '2026',
        image: entry.image,
        sort_order: entry.sort_order ?? entry.sortOrder ?? 0,
    };

    if (entry.id && entry.id !== 'new') {
        const { data, error } = await supabase.from('calendar_dates').update(payload).eq('id', entry.id).select().single();
        if (error) throw error;
        return data;
    } else {
        const { data, error } = await supabase.from('calendar_dates').insert(payload).select().single();
        if (error) throw error;
        return data;
    }
}
export async function deleteCalendarDate(id: string) {
    const { error } = await supabase.from('calendar_dates').delete().eq('id', id);
    if (error) throw error;
}

// ============ PARTNERS ============

export async function getPartners() {
    const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
}

export async function savePartner(partner: any) {
    const payload = {
        name: partner.name,
        category: partner.category || 'Patrocinador',
        website: partner.website,
        phone: partner.phone,
        description: partner.description,
        logo: partner.logo,
        is_active: partner.isActive ?? partner.is_active ?? true,
        sort_order: partner.sort_order ?? 0,
    };

    if (partner.id) {
        const { data, error } = await supabase.from('partners').update(payload).eq('id', partner.id).select().single();
        if (error) throw error;
        return data;
    } else {
        const { data, error } = await supabase.from('partners').insert(payload).select().single();
        if (error) throw error;
        return data;
    }
}

export async function deletePartner(id: string) {
    const { error } = await supabase.from('partners').delete().eq('id', id);
    if (error) throw error;
}

// ============ NEWSLETTER ============

export async function getSubscribers() {
    const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function updateSubscriber(id: string, updates: any) {
    const { data, error } = await supabase.from('newsletter_subscribers').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
}

export async function deleteSubscriber(id: string) {
    const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
    if (error) throw error;
}

// ============ REGISTRATIONS ============

export async function getRegistrations() {
    const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function updateRegistration(id: string, updates: any) {
    const { data, error } = await supabase.from('registrations').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
}

// ============ MESSAGES ============

export async function getMessages() {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function updateMessage(id: string, updates: any) {
    const { data, error } = await supabase.from('messages').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
}

export async function deleteMessage(id: string) {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) throw error;
}

// ============ SITE CONFIG ============

export async function getSiteConfig(key: string) {
    const { data, error } = await supabase
        .from('site_config')
        .select('value')
        .eq('key', key)
        .single();
    if (error) return null;
    return data?.value;
}

export async function saveSiteConfig(key: string, value: any) {
    const { data, error } = await supabase
        .from('site_config')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ============ IMAGE UPLOAD HELPER ============

export async function uploadEventImage(file: File) {
    return uploadImage('images', file, 'events');
}

export async function uploadNewsImage(file: File) {
    return uploadImage('images', file, 'news');
}

export async function uploadFairImage(file: File) {
    return uploadImage('images', file, 'fairs');
}

export async function uploadPartnerLogo(file: File) {
    return uploadImage('images', file, 'partners');
}

export async function uploadCalendarFile(file: File) {
    const { uploadFile } = await import('../lib/supabase');
    return uploadFile('files', file, 'calendar');
}
