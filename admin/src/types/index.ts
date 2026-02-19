export interface EventItem {
    id: string;
    title: string;
    date: string;
    location: string;
    category: string;
    description: string;
    coverImage: string;
    videoUrl?: string;
    isFeatured: boolean;
    galleryImages: string[];
    status: 'published' | 'draft';
}

export interface NewsItem {
    id: string;
    title: string;
    summary: string;
    content: string;
    image: string;
    date: string;
    author: string;
    status: 'published' | 'draft';
}

export interface Registration {
    id: string;
    eventId: string;
    eventName: string;
    userName: string;
    email: string;
    phone: string;
    status: 'confirmed' | 'pending' | 'cancelled';
    date: string;
}
