import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { UtensilsCrossed, X } from 'lucide-react';
import { MenuItem, MenuSection } from '@/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MenuPreviewProps {
    restaurantName: string;
    sections: MenuSection[];
    items: MenuItem[];
    onClose?: () => void;
}

const MenuPreview = ({ restaurantName, sections, items, onClose }: MenuPreviewProps) => {
    const availableItemsBySection = useMemo(() => {
        const available = items.filter(item => item.is_available);
        const grouped: Record<string, MenuItem[]> = {};

        available.forEach(item => {
            if (!grouped[item.section_id]) {
                grouped[item.section_id] = [];
            }
            grouped[item.section_id].push(item);
        });

        return grouped;
    }, [items]);

    const sortedSections = useMemo(() => {
        return [...sections]
            .sort((a, b) => a.position - b.position)
            .filter(section => availableItemsBySection[section.id]?.length > 0);
    }, [sections, availableItemsBySection]);

    return (
        <div className="bg-background text-foreground min-h-full w-full flex flex-col max-w-2xl mx-auto shadow-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden border border-border">
            {/* Menu Header */}
            <div className="p-8 text-center border-b border-border bg-muted/30 relative">
                {onClose && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-full h-10 w-10 hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                )}
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <UtensilsCrossed className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-black tracking-tight">{restaurantName}</h1>
                <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="h-px w-8 bg-primary/30" />
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Main Menu</p>
                    <span className="h-px w-8 bg-primary/30" />
                </div>
            </div>

            {/* Menu Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-12 pb-20 scrollbar-hide">
                {sortedSections.length === 0 ? (
                    <div className="py-20 text-center">
                        <UtensilsCrossed className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium italic">Your digital menu is currently empty...</p>
                    </div>
                ) : (
                    sortedSections.map((section) => (
                        <div key={section.id} className="space-y-6">
                            {/* Section Header */}
                            <div className="text-center relative py-4">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-border opacity-50" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-background px-6 text-sm font-black uppercase tracking-[0.3em] text-primary">
                                        {section.name}
                                    </span>
                                </div>
                            </div>

                            {/* Section Items */}
                            <div className="grid grid-cols-1 gap-y-6">
                                {availableItemsBySection[section.id]
                                    .sort((a, b) => a.position - b.position)
                                    .map((item) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="group"
                                        >
                                            <div className="flex justify-between items-end gap-4 mb-1">
                                                <h4 className="text-lg font-bold group-hover:text-primary transition-colors">
                                                    {item.name}
                                                </h4>
                                                <div className="flex-1 border-b border-dashed border-border mb-1.5 opacity-30" />
                                                <span className="text-lg font-black font-mono">
                                                    ₹{item.price}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed italic opacity-80 line-clamp-2 pr-10">
                                                {item.description || 'Delicately prepared with fresh ingredients.'}
                                            </p>
                                        </motion.div>
                                    ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className="p-6 text-center border-t border-border bg-muted/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
                    Created with AutoChef Digital Menu
                </p>
            </div>
        </div>
    );
};

export default MenuPreview;
