interface DiscountBadgeProps {
  discount: number;
}

export function DiscountBadge({ discount }: DiscountBadgeProps) {
  if (discount <= 0) return null;

  const getBadgeColor = (discount: number) => {
    if (discount >= 75) return "bg-red-500 text-white";
    if (discount >= 50) return "bg-orange-500 text-white";
    if (discount >= 25) return "bg-yellow-500 text-white";
    return "bg-green-500 text-white";
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(discount)}`}>
      -{discount}%
    </span>
  );
}