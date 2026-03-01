
interface ProductDetailsProps {
    data: {
        productUrl: string;
        productName: string;
        description: string;
    };
    updateData: (key: string, value: string) => void;
}

export const ProductDetails = ({ data, updateData }: ProductDetailsProps) => {
    const inputClass =
        "w-full rounded-lg border border-white/10 bg-card/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all";

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h2 className="text-xl font-semibold mb-1 text-foreground">Product Details</h2>
                <p className="text-sm text-muted-foreground mb-6">Describe the item you are requesting.</p>

                <div className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Product URL</label>
                        <input
                            className={inputClass}
                            placeholder="e.g. https://amazon.com/dp/B0..."
                            value={data.productUrl}
                            onChange={(e) => updateData("productUrl", e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Product Name</label>
                        <input
                            className={inputClass}
                            placeholder="e.g. MacBook Pro M3 Max"
                            value={data.productName}
                            onChange={(e) => updateData("productName", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Description (Optional)</label>
                        <textarea
                            className={`${inputClass} min-h-[100px] resize-none`}
                            placeholder="Any specific configuration, color, or delivery requirements..."
                            value={data.description}
                            onChange={(e) => updateData("description", e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
