import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRestaurantStore, Restaurant, MenuSection, MenuItem } from '@/store';
import MenuPreview from '@/components/MenuPreview';
import { Loader2, UtensilsCrossed } from 'lucide-react';

const PublicMenu = () => {
    const { uniqueKey } = useParams<{ uniqueKey: string }>();
    const { getPublicMenu } = useRestaurantStore();

    const [data, setData] = useState<{ restaurant: Restaurant; sections: MenuSection[]; items: MenuItem[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchMenu = async () => {
            if (!uniqueKey) return;
            setLoading(true);
            const result = await getPublicMenu(uniqueKey);
            if (result) {
                setData(result);
            } else {
                setError(true);
            }
            setLoading(false);
        };

        fetchMenu();
    }, [uniqueKey, getPublicMenu]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">Loading Menu...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mb-6">
                    <UtensilsCrossed className="w-8 h-8 text-destructive" />
                </div>
                <h1 className="text-2xl font-black mb-2">Menu Not Found</h1>
                <p className="text-muted-foreground max-w-xs mx-auto italic">
                    We couldn't find the menu you're looking for. It might have been moved or the link is incorrect.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 sm:py-10 px-0 sm:px-4">
            <MenuPreview
                restaurantName={data.restaurant.name}
                sections={data.sections}
                items={data.items}
            />
        </div>
    );
};

export default PublicMenu;
